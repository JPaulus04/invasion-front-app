"""Focused device-scale hazard comparison, not a release or visual approval gate."""
from pathlib import Path
import subprocess
import time
from PIL import Image
from run_phase4_simulator import BUNDLE, command, focused_simulator

FIXTURES = ("2-1-legacy", "2-1-idle", "2-1-active", "2-30-active", "3-1-water", "4-1-water")


def capture(device, output, fixture, first=False, authored=False, frost=False, iron=False):
    if sum((authored, frost, iron)) > 1:
        raise ValueError("Choose one authored environment")
    label = ("iron-" if iron else "frost-" if frost else "authored-" if authored else "") + fixture
    log = output / (label + ".log")
    errors = output / (label + "-stderr.log")
    args = ["xcrun", "simctl", "launch"]
    if not first:
        args.append("--terminate-running-process")
    args += [f"--stdout={log}", f"--stderr={errors}", device, BUNDLE,
             f"-captureBuild342Hazards={fixture}"]
    if not fixture.endswith("-legacy"):
        args.append("-previewDimensionalHazards")
    if authored:
        args.append("-previewAuthoredToxicEnvironment")
    if frost:
        args.append("-previewAuthoredFrostEnvironment")
    if iron:
        args.append("-previewAuthoredIronEnvironment")
    failure = None
    try:
        command(*args, timeout=90)
    except (subprocess.TimeoutExpired, subprocess.CalledProcessError) as exc:
        failure = exc  # Observe the same process; do not blindly relaunch.
    marker = f"[BUILD342 HAZARDS] fixture={fixture} "
    deadline = time.monotonic() + 60
    while time.monotonic() < deadline:
        if errors.exists() and any(term in errors.read_text(errors="replace")
                                   for term in ("Precondition failed", "Fatal error")):
            raise AssertionError(f"App assertion: {errors}\n{errors.read_text(errors='replace')[-4000:]}")
        if log.exists():
            content = log.read_text(errors="replace")
            if (marker in content and (not authored or "[BUILD342 AUTHORED TOXIC]" in content)
                    and (not frost or "[BUILD342 AUTHORED FROST]" in content)
                    and (not iron or "[BUILD342 AUTHORED IRON]" in content)):
                break
        time.sleep(0.5)
    else:
        raise RuntimeError(f"Expected {marker!r}; no relaunch attempted") from failure
    for attempt in range(1, 5):
        time.sleep(1.0)
        path = output / f"{label}-attempt{attempt}.png"
        command("xcrun", "simctl", "io", device, "screenshot", str(path), timeout=55)
        with Image.open(path) as image:
            sample = image.convert("RGB").resize((120, 200))
            colors = sample.getcolors(24000)
            if image.height > image.width and colors and len(colors) > 200:
                path.rename(output / (label + ".png"))
                return
    raise AssertionError(f"No usable drawable for {fixture}; rejected captures retained")


def main():
    output = Path("build342-hazard-review").resolve()
    output.mkdir(exist_ok=True)
    with focused_simulator("build342-hazards", output) as device:
        for index, fixture in enumerate(FIXTURES):
            capture(device, output, fixture, first=index == 0)
        for fixture in ("2-1-active", "2-6-idle", "2-11-active", "2-30-active"):
            capture(device, output, fixture, authored=True)
    print("Ten requested renderer captures present. Human visual comparison still required.")


if __name__ == "__main__":
    main()
