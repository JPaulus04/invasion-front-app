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
from simulator_startup import wait_for_app_registration, wait_for_render_surface
from validate_simulator_screenshots import verify

WAVES = (1, 5, 10, 15, 20, 25, 29, 30)
OUTPUT = Path("build340-review").resolve()


def contents(path):
    return path.read_text(errors="replace") if path.exists() else ""


def wait_for(log, predicate, seconds, offset=0):
    deadline = time.monotonic() + seconds
    while time.monotonic() < deadline:
        if predicate(contents(log)[offset:]):
            return
        time.sleep(0.25)
    raise TimeoutError(f"{log.name} readiness missing after {seconds}s\n{contents(log)[-3000:]}")


def launch(device, log):
    args = ["xcrun", "simctl", "launch", device, sim.BUNDLE, "-capture340-2-1", "-build340Tour"]
    with (OUTPUT / "launch-client.log").open("w") as client:
        process = subprocess.Popen(args, stdout=client, stderr=subprocess.STDOUT)
        try:
            wait_for(log, lambda text: "[BUILD340 READY] world=2 wave=1 mode=still" in text, 150)
        except TimeoutError:
            print(contents(Path(client.name)), flush=True)
            raise
        finally:
            if process.poll() is None:
                process.terminate()
                process.wait(timeout=10)


def request_room(request, log, world, wave, mode):
    offset = len(contents(log))
    staging = request.with_suffix(".tmp")
    staging.write_text(f"{world} {wave} {mode}")
    staging.replace(request)
    ready = f"[BUILD340 READY] world={world} wave={wave} mode={mode}"
    wait_for(log, lambda text: ready in text, 60, offset)
    return offset


def validate_frame(path, index):
    verify(path)
    if index is None:
        return
    with Image.open(path) as image:
        rgb = image.convert("RGB")
        for x, y, bits in ((0.94, 0.54, index), (0.90, 0.54, index >> 3), (0.91, 0.12, 5)):
            pixel = rgb.getpixel((round(rgb.width * x), round(rgb.height * y)))
            if any((value < 200 if bits & (1 << channel) else value > 60)
                   for channel, value in enumerate(pixel)):
                raise ValueError(f"Stale or obstructed world/wave frame in {path.name}: {pixel}")


def capture(device, name, index):
    path = OUTPUT / f"{name}.png"
    deadline = time.monotonic() + 110
    while True:
        try:
            sim.command("xcrun", "simctl", "io", device, "screenshot", str(path), timeout=55)
            validate_frame(path, index)
            return path.name
        except subprocess.TimeoutExpired:
            # Read again on the same held scene. Launch and scene requests
            # remain outside this loop.
            if path.exists():
                try:
                    validate_frame(path, index)
                    return path.name
                except (ValueError, OSError):
                    pass
            if time.monotonic() >= deadline:
                raise
        except (ValueError, OSError):
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


def gameplay(device, request, log):
    wave = 20
    video = OUTPUT / "worlds-2-4-hazard-cycles.mov"
    sections = []
    with recorder(device, video):
        started = time.monotonic()
        for world in (2, 3, 4):
            begins = time.monotonic() - started
            offset = request_room(request, log, world, wave, "live")
            wait_for(log, lambda text: "[BUILD340 MOTION COMPLETE]" in text, 75, offset)
            text = contents(log)[offset:]
            stages = [int(item) for item in re.findall(r"\[BUILD340 MOTION\] stage=(\d+)", text)]
            distance = int(re.search(r"\[BUILD340 MOTION COMPLETE\] distance=(\d+)", text)[1])
            if stages[:3] != [0, 1, 2] or distance < 70:
                raise RuntimeError(f"World {world} lacks its full hazard cycle and actual movement")
            sections.append({"world": world, "wave": wave, "stages": stages,
                             "distance": distance, "approximate_start": round(begins, 2)})
    metadata = sim.command("ffprobe", "-v", "error", "-select_streams", "v:0", "-count_frames",
                           "-show_entries", "stream=duration,nb_read_frames", "-of", "json",
                           str(video), timeout=60).stdout
    stream = json.loads(metadata)["streams"][0]
    if float(stream["duration"]) < 28 or int(stream["nb_read_frames"]) < 180:
        raise RuntimeError("The combined hazard recording lacks sufficient decoded footage")
    return {"file": video.name, "sections": sections, **stream}


@contextmanager
def review_device():
    # Modern iOS simulators do not reliably expose the standalone
    # /usr/bin/true process used by the older campaign harness.
    devices = json.loads(sim.command("xcrun", "simctl", "list",
                                     "devices", "available", "-j", timeout=100).stdout)
    phones = [(runtime, phone) for runtime, group in devices["devices"].items()
              for phone in group if phone["name"].startswith("iPhone")
              and phone.get("deviceTypeIdentifier")]
    if not phones:
        raise RuntimeError("No available iPhone simulator")
    runtime, phone = phones[0]
    device_type = phone["deviceTypeIdentifier"]
    device = sim.command("xcrun", "simctl", "create", "OutpostZero-Build340",
                         device_type, runtime, timeout=60).stdout.strip()
    (OUTPUT / "device.json").write_text(json.dumps(
        {"device_type": device_type, "runtime": runtime, "udid": device}, indent=2) + "\n")
    try:
        sim.command("xcrun", "simctl", "boot", device, timeout=90)
        sim.command("xcrun", "simctl", "bootstatus", device, "-b", timeout=300)
        sim.command("xcrun", "simctl", "install", device,
                    "simulator-app/OutpostZero.app", timeout=150)
        wait_for_app_registration(sim.command, device, OUTPUT)
        wait_for_render_surface(sim.command, device, OUTPUT)
        yield device
    finally:
        for action in ("shutdown", "delete"):
            try:
                sim.command("xcrun", "simctl", action, device, timeout=45, check=False)
            except subprocess.TimeoutExpired:
                pass


def main():
    OUTPUT.mkdir(exist_ok=True)
    results = {"stills": []}
    manifest = OUTPUT / "manifest.json"
    with review_device() as device:
        container = sim.command("xcrun", "simctl", "get_app_container", device, sim.BUNDLE,
                                "data", timeout=50).stdout.strip()
        documents = Path(container) / "Documents"
        documents.mkdir(exist_ok=True)
        request = documents / "build340-review-request"
        log = documents / "build340-review-events"
        try:
            launch(device, log)
            capture_rooms(device, request, log, results, manifest)
        finally:
            if log.exists():
                (OUTPUT / "tour.log").write_text(contents(log))


def capture_rooms(device, request, log, results, manifest):
    for world in (2, 3, 4):
        for offset, wave in enumerate(WAVES, 1):
            if (world, wave) != (2, 1):
                request_room(request, log, world, wave, "still")
            index = (world - 2) * len(WAVES) + offset
            name = capture(device, f"world-{world}-wave-{wave:02}", index)
            results["stills"].append({"world": world, "wave": wave, "file": name})
            manifest.write_text(json.dumps(results, indent=2) + "\n")
            print(f"Captured {name}", flush=True)
    request_room(request, log, 1, 1, "still")
    results["benchmark"] = capture(device, "world-1-wave-01", 25)
    manifest.write_text(json.dumps(results, indent=2) + "\n")
    results["footage"] = gameplay(device, request, log)
    manifest.write_text(json.dumps(results, indent=2) + "\n")


if __name__ == "__main__":
    main()
