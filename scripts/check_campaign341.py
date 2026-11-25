"""Capture the current campaign routes using Debug fixtures in the iOS app."""
from pathlib import Path
import time

from PIL import Image
from run_phase4_simulator import BUNDLE, command, fresh_simulator


def capture(device, output, fixture, flag, marker):
    log = output / f"{fixture}.log"
    errors = output / f"{fixture}-stderr.log"
    command("xcrun", "simctl", "launch", "--terminate-running-process",
            f"--stdout={log}", f"--stderr={errors}", device, BUNDLE, flag, timeout=90)
    deadline = time.monotonic() + 45
    while time.monotonic() < deadline:
        if errors.exists() and any(term in errors.read_text(errors="replace")
                                   for term in ("Precondition failed", "Fatal error")):
            raise AssertionError(f"App assertion in {errors}")
        if log.exists() and marker in log.read_text(errors="replace"):
            break
        time.sleep(0.25)
    else:
        raise TimeoutError(f"Expected {marker!r} in {log}")
    time.sleep(0.8)
    path = output / f"{fixture}.png"
    command("xcrun", "simctl", "io", device, "screenshot", str(path), timeout=55)
    with Image.open(path) as image:
        colors = image.convert("RGB").resize((120, 200)).getcolors(24000)
        assert image.height > image.width and colors and len(colors) > 200, path


def main():
    output = Path("build341-review").resolve()
    output.mkdir(exist_ok=True)
    fixtures = [
        "1-1", "1-18", "1-20",
        "2-10", "2-20", "2-30", "2-10-result",
        "3-0", "3-1", "3-10", "3-20", "3-30", "3-30-result",
        "4-0", "4-1", "4-5", "4-10", "4-15", "4-20", "4-25", "4-29", "4-30", "4-30-result",
    ]
    with fresh_simulator("build341", output, controlled=True) as device:
        capture(device, output, "legacy-iron-recovery", "-captureRecoveryScreenshot",
                "[BUILD341 MIGRATED]")
        for fixture in fixtures:
            capture(device, output, fixture, f"-captureBuild341={fixture}",
                    f"[BUILD341 READY] fixture={fixture} ")


if __name__ == "__main__":
    main()
