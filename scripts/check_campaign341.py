"""Capture the current campaign routes using Debug fixtures in the iOS app."""
import argparse
import json
import os
from pathlib import Path
import signal
import subprocess
import time

from PIL import Image
from run_phase4_simulator import BUNDLE, command, focused_simulator


def capture(device, output, fixture, flag, marker):
    log = output / f"{fixture}.log"
    errors = output / f"{fixture}-stderr.log"
    command("xcrun", "simctl", "launch", "--terminate-running-process",
            f"--stdout={log}", f"--stderr={errors}", device, BUNDLE, flag, timeout=90)
    deadline = time.monotonic() + (150 if marker == "[BUILD341 PERF]" else 45)
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


def record_stoneback(device, output):
    path = output / "stoneback-live.mp4"
    for attempt in (1, 2):
        capture(device, output, f"stoneback-live-attempt-{attempt}",
                "-captureBuild341StonebackLive", "[BUILD341 LIVE]")
        candidate = output / f"stoneback-attempt-{attempt}.mp4"
        diagnostic = output / f"stoneback-video-attempt-{attempt}.log"
        with diagnostic.open("w") as log:
            recorder = subprocess.Popen(
                ["xcrun", "simctl", "io", device, "recordVideo", "--codec=h264", str(candidate)],
                stdout=log, stderr=subprocess.STDOUT,
            )
            try:
                deadline = time.monotonic() + 30
                while recorder.poll() is None and time.monotonic() < deadline:
                    if candidate.exists() and candidate.stat().st_size > 0:
                        break
                    time.sleep(0.25)
                else:
                    raise RuntimeError("Recorder did not initialize")
                time.sleep(7)
                if recorder.poll() is not None:
                    raise RuntimeError("Recorder exited before capture completed")
                recorder.send_signal(signal.SIGINT)
                recorder.wait(timeout=45)
                if not candidate.is_file() or candidate.stat().st_size < 4096:
                    raise RuntimeError("Recording missing or incomplete")
                # Decode the complete video, not merely its container header.
                subprocess.run(["ffmpeg", "-v", "error", "-xerror", "-i", str(candidate),
                                "-map", "0:v:0", "-f", "null", "-"],
                               check=True, timeout=60, stdout=log, stderr=log)
                candidate.replace(path)
                return
            except (RuntimeError, subprocess.SubprocessError) as error:
                print(f"::warning::Stoneback recording attempt {attempt}: {error}", flush=True)
                log.write(f"\nAttempt {attempt}: {error}; returncode={recorder.poll()}\n")
                if attempt == 2:
                    raise
            finally:
                if recorder.poll() is None:
                    recorder.kill()
                    recorder.wait(timeout=10)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--group", choices=("all", "campaign", "performance", "characters", "recording"), default="all")
    args = parser.parse_args()
    output = Path("build341-review").resolve()
    output.mkdir(exist_ok=True)
    groups = ("campaign", "performance", "characters", "recording") if args.group == "all" else (args.group,)
    results = {}
    for group in groups:
        destination = output / group
        destination.mkdir(exist_ok=False)
        try:
            run_group(group, destination)
            results[group] = {"status": "passed"}
        except Exception as error:
            results[group] = {"status": "failed", "error": repr(error)}
            print(f"::error::{group}: {error}", flush=True)
        finally:
            (output / "results.json").write_text(json.dumps({
                "source": os.environ.get("GITHUB_SHA"),
                "groups": results,
            }, indent=2))
    if any(result["status"] != "passed" for result in results.values()):
        raise RuntimeError("One or more mandatory validation groups failed")


def run_group(group, output):
    fixtures = [
        "1-1", "1-10", "1-10-result", "1-18", "1-20", "1-20-result",
        "1-30", "1-30-exposed", "1-30-result",
        "2-10-result", "2-20-result", "2-30-result",
        "3-0", "3-10-result", "3-20-result", "3-29", "3-30-result",
        "4-0", "4-10-result", "4-15", "4-20-result", "4-29", "4-30-result",
    ]
    with focused_simulator("build341", output) as device:
        if group == "campaign":
            capture(device, output, "legacy-iron-recovery", "-captureRecoveryScreenshot",
                    "[BUILD341 MIGRATED]")
            capture(device, output, "legacy-frontier-recovery", "-captureBuild341LegacyFrontier",
                    "[BUILD341 MIGRATED] Frontier Forest continued from Room 20 to Room 21")
            for fixture in fixtures:
                capture(device, output, fixture, f"-captureBuild341={fixture}",
                        f"[BUILD341 READY] fixture={fixture} ")
        elif group == "performance":
            for world in (3, 4):
                capture(device, output, f"performance-world{world}",
                        f"-captureBuild341Performance={world}", "[BUILD341 PERF]")
        elif group == "characters":
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
        elif group == "recording":
            record_stoneback(device, output)


if __name__ == "__main__":
    main()
