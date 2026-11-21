#!/usr/bin/env python3
"""Capture the production SpriteKit rooms and a live hazard cycle per biome."""
from contextlib import contextmanager
import json
from pathlib import Path
import re
import signal
import subprocess
import time

from PIL import Image

import run_phase4_simulator as sim
from validate_simulator_screenshots import verify

WAVES = (1, 5, 10, 15, 20, 25, 29, 30)
OUTPUT = Path("build340-review").resolve()


def contents(path):
    return path.read_text(errors="replace") if path.exists() else ""


def wait_for(log, errors, predicate, seconds):
    deadline = time.monotonic() + seconds
    while time.monotonic() < deadline:
        stderr = contents(errors)
        if "Precondition failed" in stderr or "Fatal error:" in stderr:
            raise RuntimeError(stderr[-4000:])
        if predicate(contents(log)):
            return
        time.sleep(0.25)
    raise TimeoutError(f"{log.name} readiness missing after {seconds}s\n{contents(log)[-3000:]}\n{contents(errors)[-3000:]}")


def launch(device, label, flags, ready):
    log = OUTPUT / f"{label}.log"
    errors = OUTPUT / f"{label}-stderr.log"
    command = ("xcrun", "simctl", "launch", "--terminate-running-process",
               f"--stdout={log}", f"--stderr={errors}", device, sim.BUNDLE, *flags)
    try:
        sim.command(*command, timeout=75)
    except subprocess.TimeoutExpired:
        # The simctl client can time out while the same app is launching.
        pass
    if ready:
        wait_for(log, errors, lambda text: ready in text, 50)
    return log, errors


def validate_frame(path, index):
    verify(path)
    if index is None:
        return
    with Image.open(path) as image:
        rgb = image.convert("RGB")
        for fraction, bits in ((0.94, index), (0.90, index >> 3)):
            pixel = rgb.getpixel((round(rgb.width * fraction), round(rgb.height * 0.54)))
            if any((value < 170 if bits & (1 << channel) else value > 90)
                   for channel, value in enumerate(pixel)):
                raise ValueError(f"Stale or incorrect world/wave marker in {path.name}: {pixel}")


def capture(device, name, flags, ready, index=None):
    launch(device, name, flags, ready)
    path = OUTPUT / f"{name}.png"
    deadline = time.monotonic() + 35
    while True:
        sim.command("xcrun", "simctl", "io", device, "screenshot", str(path), timeout=35)
        try:
            validate_frame(path, index)
            return path.name
        except ValueError:
            if time.monotonic() >= deadline:
                raise
            time.sleep(0.8)


@contextmanager
def recorder(device, video):
    with video.with_suffix(".recorder.log").open("w") as log:
        process = subprocess.Popen(["xcrun", "simctl", "io", device, "recordVideo",
                                    "--codec=h264", str(video)],
                                   stdout=log, stderr=subprocess.STDOUT)
        try:
            deadline = time.monotonic() + 30
            while "Recording started" not in contents(Path(log.name)):
                if process.poll() is not None or time.monotonic() >= deadline:
                    raise RuntimeError(f"Simulator recorder failed to start: {log.name}")
                time.sleep(0.2)
            yield
        finally:
            if process.poll() is None:
                process.send_signal(signal.SIGINT)
                try:
                    process.wait(timeout=30)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait()
                    raise
    if process.returncode != 0:
        raise RuntimeError(f"Simulator recorder exited with code {process.returncode}")


def gameplay(device, world):
    wave = 20
    label = f"world-{world}-hazard-cycle"
    video = OUTPUT / f"{label}.mov"
    with recorder(device, video):
        log, errors = launch(device, label, [f"-capture340-{world}-{wave}", "-build340Motion"],
                             f"[BUILD340 READY] world={world} wave={wave}")
        wait_for(log, errors, lambda text: "[BUILD340 MOTION COMPLETE]" in text, 50)
    text = contents(log)
    stages = [int(item) for item in re.findall(r"\[BUILD340 MOTION\] stage=(\d+)", text)]
    distance = int(re.search(r"\[BUILD340 MOTION COMPLETE\] distance=(\d+)", text)[1])
    if stages[:3] != [0, 1, 2] or distance < 70:
        raise RuntimeError(f"{label} lacks its full hazard cycle and actual movement")
    metadata = sim.command("ffprobe", "-v", "error", "-select_streams", "v:0", "-count_frames",
                           "-show_entries", "stream=duration,nb_read_frames", "-of", "json",
                           str(video), timeout=45).stdout
    stream = json.loads(metadata)["streams"][0]
    if float(stream["duration"]) < 8 or int(stream["nb_read_frames"]) < 60:
        raise RuntimeError(f"{label} lacks sufficient decoded footage")
    return {"world": world, "wave": wave, "file": video.name, "stages": stages,
            "distance": distance, **stream}


def main():
    OUTPUT.mkdir(exist_ok=True)
    results = {"stills": [], "footage": []}
    with sim.fresh_simulator("build340", OUTPUT, controlled=True) as device:
        capture(device, "outpost-zero-world1-outpost", ["-captureWorldOneOutpostScreenshot"], None)
        for world in (2, 3, 4):
            for offset, wave in enumerate(WAVES, 1):
                index = (world - 2) * len(WAVES) + offset
                name = capture(device, f"world-{world}-wave-{wave:02}",
                               [f"-capture340-{world}-{wave}"],
                               f"[BUILD340 READY] world={world} wave={wave}", index)
                results["stills"].append({"world": world, "wave": wave, "file": name})
                print(f"Captured {name}", flush=True)
        for world in (2, 3, 4):
            results["footage"].append(gameplay(device, world))
    (OUTPUT / "manifest.json").write_text(json.dumps(results, indent=2) + "\n")


if __name__ == "__main__":
    main()
