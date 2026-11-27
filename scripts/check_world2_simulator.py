"""Run focused Debug encounters in the compiled Outpost Zero app."""

from pathlib import Path
import re
import subprocess
import time
from PIL import Image

from run_phase4_simulator import BUNDLE, command, focused_simulator


def wait_for_log(path, check, timeout=45):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        log = path.read_text(errors="replace") if path.exists() else ""
        if check(log):
            return
        time.sleep(0.25)
    raise AssertionError(f"Missing expected simulator events in {path}\n{log}")


def capture_verified_screenshot(device, path):
    """Retry a failed read-only capture on the same running encounter."""
    for attempt in (1, 2):
        candidate = path.with_name(f"{path.stem}-attempt{attempt}.png")
        try:
            command("xcrun", "simctl", "io", device, "screenshot",
                    str(candidate), timeout=55)
            with Image.open(candidate) as image:
                if image.format != "PNG" or image.width <= 0 or image.height <= image.width:
                    raise ValueError("Expected portrait PNG from the active simulator")
                image.verify()
            with Image.open(candidate) as image:
                image.load()
                colors = image.convert("RGB").resize((120, 200)).getcolors(24000)
                if not colors or len(colors) <= 200:
                    raise ValueError("Screenshot has no usable rendered surface")
        except (subprocess.TimeoutExpired, subprocess.CalledProcessError, OSError, ValueError) as exc:
            print(f"::warning::Screenshot attempt {attempt} failed: {exc}", flush=True)
            if attempt == 2:
                raise
            time.sleep(2)
            continue
        candidate.replace(path)
        return


def run_encounters(device, output):
    encounters = [
        (10, "corrosionravager", r"sweep.*charge"),
        (20, "blighthydra", r"head_left.*head_center.*head_right.*root_strike"),
        (30, "toxictyrant", r"sequence=attack.*sequence=slam"),
        (9, "venomspitter", r"hidden.*emerge.*attack.*retreat.*relocate.*emerge"),
        (6, "toxindrone", r"drone shot=1.*drone shot=2.*drone shot=3.*drone shot=1"),
    ]
    for room, enemy, events in encounters:
        log_path = output / f"{room}-{enemy}.log"
        command("xcrun", "simctl", "launch", "--terminate-running-process",
                f"--stdout={log_path}", f"--stderr={output / f'{room}-stderr.log'}",
                device, BUNDLE, f"-captureWorldTwoRoom={room}", timeout=90)
        expected_spawn = f"room={room} enemy={enemy}" + (" target=1\n" if room in (10, 20, 30) else "")
        wait_for_log(log_path, lambda log: (
            expected_spawn in log and
            (room != 10 or "all eight manifests and frames loaded" in log) and
            re.search(events, log, re.DOTALL)
        ))
        capture_verified_screenshot(device, output / f"{room}-{enemy}.png")
        print(f"Room {room}: {enemy} passed", flush=True)


if __name__ == "__main__":
    output = Path("world2-review").resolve()
    output.mkdir(exist_ok=True)
    with focused_simulator("world2", output) as device:
        run_encounters(device, output)
