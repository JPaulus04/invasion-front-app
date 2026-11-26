"""Capture the current campaign routes using Debug fixtures in the iOS app."""
from pathlib import Path
import time

from PIL import Image
from run_phase4_simulator import BUNDLE, command, focused_simulator


def capture(device, output, fixture, flag, marker):
    log = output / f"{fixture}.log"
    errors = output / f"{fixture}-stderr.log"
    command("xcrun", "simctl", "launch", "--terminate-running-process",
            f"--stdout={log}", f"--stderr={errors}", device, BUNDLE, flag, timeout=90)
    deadline = time.monotonic() + (90 if marker == "[BUILD341 PERF]" else 45)
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
        "1-1", "1-10", "1-10-result", "1-18", "1-20", "1-20-result",
        "1-30", "1-30-exposed", "1-30-result",
        "2-10-result", "2-20-result", "2-30-result",
        "3-0", "3-10-result", "3-20-result", "3-29", "3-30-result",
        "4-0", "4-10-result", "4-15", "4-20-result", "4-29", "4-30-result",
    ]
    with focused_simulator("build341", output) as device:
        capture(device, output, "legacy-iron-recovery", "-captureRecoveryScreenshot",
                "[BUILD341 MIGRATED]")
        capture(device, output, "legacy-frontier-recovery", "-captureBuild341LegacyFrontier",
                "[BUILD341 MIGRATED] Frontier Forest continued from Room 20 to Room 21")
        for fixture in fixtures:
            capture(device, output, fixture, f"-captureBuild341={fixture}",
                    f"[BUILD341 READY] fixture={fixture} ")
        for world in (3, 4):
            capture(device, output, f"performance-world{world}",
                    f"-captureBuild341Performance={world}", "[BUILD341 PERF]")
        for name in ("frostfang", "cryogunner", "glacierbrute", "blizzarddrone", "shardstinger",
                     "permafrostcrusher", "frostwyrm", "cryooverlord",
                     "bulkhead", "grunt", "rail_skater", "raider", "lobber", "sentry",
                     "scrapper", "overclock", "press_giant", "gantry_warden", "warforge"):
            capture(device, output, name, f"-captureBuild341Faction={name}",
                    f"[BUILD341 FACTION] name={name} ")
        for name, variant in (("warforge", "2"), ("warforge", "3"),
                              ("cryooverlord", "phase2"), ("frostwyrm", "burrow"),
                              ("press_giant", "alternate"), ("gantry_warden", "alternate"),
                              ("permafrostcrusher", "alternate"), ("frostwyrm", "alternate"),
                              ("cryooverlord", "alternate"), ("cryooverlord", "freeze")):
            capture(device, output, f"{name}-{variant}", f"-captureBuild341Faction={name}:{variant}",
                    f"[BUILD341 FACTION] name={name} variant={variant} ")


if __name__ == "__main__":
    main()
