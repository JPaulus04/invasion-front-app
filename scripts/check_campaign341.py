"""Capture the current campaign routes using Debug fixtures in the iOS app."""
from pathlib import Path
import shutil
import signal
import subprocess
import time

from PIL import Image
from run_phase4_simulator import BUNDLE, command, focused_simulator
from simulator_startup import RecoverableStartupError, content, snapshot


def capture(device, output, fixture, flag, marker, *, first=False):
    log = output / f"{fixture}.log"
    errors = output / f"{fixture}-stderr.log"
    launch_error = None
    launched_at = time.time()
    options = () if first else ("--terminate-running-process",)
    try:
        command("xcrun", "simctl", "launch", *options,
                f"--stdout={log}", f"--stderr={errors}", device, BUNDLE, flag, timeout=120 if first else 90)
    except (subprocess.TimeoutExpired, subprocess.CalledProcessError) as error:
        # simctl's client can stall while the app continues launching.
        # Accept the fixture only after the original process reports ready.
        launch_error = error
    deadline = time.monotonic() + (150 if marker == "[BUILD341 PERF]" else 60 if first else 45)
    while time.monotonic() < deadline:
        if errors.exists() and any(term in errors.read_text(errors="replace")
                                   for term in ("Precondition failed", "Fatal error")):
            raise AssertionError(f"App assertion in {errors}")
        if log.exists() and marker in log.read_text(errors="replace"):
            break
        time.sleep(0.25)
    else:
        if first:
            diagnosis = snapshot(command, device, output, "launch-failure", launched_at)
            # A late marker during diagnostics belongs to the same process.
            if marker not in content(log):
                if (launch_error and not getattr(launch_error, "stdout", None)
                        and not content(log) and not content(errors)
                        and diagnosis["app_proven_absent"]):
                    raise RecoverableStartupError("Initial recovery fixture never launched") from launch_error
                raise TimeoutError(f"Expected {marker!r} in {log}; launch state is unresolved") from launch_error
        else:
            raise TimeoutError(f"Expected {marker!r} in {log}") from launch_error
    errors_text = content(errors)
    if any(term in errors_text for term in ("Precondition failed", "Fatal error")):
        raise AssertionError(f"App assertion in {errors}")
    time.sleep(0.8)
    capture_visible_frame(device, output, fixture)


def capture_visible_frame(device, output, fixture):
    # The app can report its fixture ready before CoreSimulator presents
    # the first drawable. Keep every rejected image and poll the same app.
    rejected = output / "rejected-surfaces"
    rejected.mkdir(exist_ok=True)
    result = output / f"{fixture}.png"
    for attempt in range(1, 5):
        probe = rejected / f"{fixture}-{attempt}.png"
        command("xcrun", "simctl", "io", device, "screenshot", str(probe), timeout=35)
        with Image.open(probe) as image:
            colors = image.convert("RGB").resize((120, 200)).getcolors(24000)
            if image.height > image.width and colors and len(colors) > 200:
                probe.replace(result)
                return
        if attempt < 4:
            time.sleep(2)
    raise RuntimeError(f"{fixture}: the running app did not present a usable frame; see {rejected}")


def record_stoneback(device, output):
    capture(device, output, "stoneback-live", "-captureBuild341StonebackLive", "[BUILD341 LIVE]")
    path = output / "stoneback-live.mp4"
    record_video(device, path, output / "stoneback-video.log")


def record_video(device, path, log_path):
    with log_path.open("w") as log:
        recorder = subprocess.Popen(
            ["xcrun", "simctl", "io", device, "recordVideo", "--codec=h264", str(path)],
            stdout=log, stderr=subprocess.STDOUT,
        )
        try:
            deadline = time.monotonic() + 45
            while "Recording started" not in log_path.read_text(errors="replace"):
                if recorder.poll() is not None or time.monotonic() >= deadline:
                    raise RuntimeError(f"Simulator recorder did not become ready; see {log_path}")
                time.sleep(1)
            time.sleep(7)
            if recorder.poll() is None:
                recorder.send_signal(signal.SIGINT)
            recorder.wait(timeout=20)
        finally:
            if recorder.poll() is None:
                recorder.kill()
                recorder.wait(timeout=5)
    if not path.is_file() or path.stat().st_size < 4096:
        raise RuntimeError("Stoneback recording is missing or incomplete")


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
    def prepare(device, attempt):
        capture(device, attempt, "legacy-iron-recovery", "-captureRecoveryScreenshot",
                "[BUILD341 MIGRATED]", first=True)
        for evidence in attempt.glob("legacy-iron-recovery.*"):
            shutil.copy2(evidence, output / evidence.name)

    with focused_simulator("build341", output, prepare=prepare) as device:
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
        record_stoneback(device, output)


if __name__ == "__main__":
    main()
