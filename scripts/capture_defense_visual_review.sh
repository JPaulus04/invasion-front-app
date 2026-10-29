#!/usr/bin/env bash
set -e
mkdir -p simulator-app
ditto -x -k OutpostZero-simulator-app.zip simulator-app
test -x simulator-app/OutpostZero.app/OutpostZero
      - name: Capture equipment-defense states and live walk prototype
        # Cold macOS runners spend 3-5 minutes booting and installing the app.
        # Seven landscapes, defense states and eight motion videos need a
        # separate realistic budget; each simctl operation is already bounded.
        timeout-minutes: 30
        run: |
set -e
# Every simulator subprocess is bounded so a stalled simctl cannot
# pin the macOS runner until the whole job times out.
run_bounded() {
  LIMIT="$1"; shift
  python3 - "$LIMIT" "$@" <<'PY'
import subprocess
import sys
try:
    subprocess.run(sys.argv[2:], check=True, timeout=int(sys.argv[1]))
except (subprocess.TimeoutExpired, subprocess.CalledProcessError) as error:
    print(f"Simulator command unavailable: {error}", file=sys.stderr)
    sys.exit(1)
PY
}
# Let a fresh service finish first-boot data migration. Killing it
# before listing devices made the migrations restart on some hosts.
# Fallback to a second available iPhone only after bounded readiness.
DEVICE=""
DEVICE_CANDIDATES="$(xcrun simctl list devices available -j | python3 -c '
import json, sys
data=json.load(sys.stdin)["devices"]
found=[]
for runtime, devices in sorted(data.items(), reverse=True):
    for device in devices:
        if device.get("isAvailable", True) and device.get("name", "").startswith("iPhone"):
            found.append(device["udid"])
print(chr(10).join(found[:2]))
')"
for CANDIDATE in $DEVICE_CANDIDATES; do
  echo "Preparing simulator $CANDIDATE"
  run_bounded 35 xcrun simctl boot "$CANDIDATE" || true
  # Data migration often needs more than 90 seconds on a cold VM.
  if run_bounded 200 xcrun simctl bootstatus "$CANDIDATE" -b; then
    DEVICE="$CANDIDATE"
    break
  fi
  echo "::warning::Simulator $CANDIDATE failed boot readiness; trying alternate device"
  run_bounded 20 xcrun simctl shutdown "$CANDIDATE" || true
done
if [ -z "$DEVICE" ]; then
  echo "::error::No available iPhone simulator reached boot readiness"
  exit 1
fi
echo "Simulator ready: $DEVICE"
APP="simulator-app/OutpostZero.app"
# If CoreSimulatorService is cold, allow a generous first install.
# On failure restart only the simulator rather than recompiling iOS.
if ! run_bounded 150 xcrun simctl install "$DEVICE" "$APP"; then
  # A slow initial install may recover after a single service reset.
  # Do not loop forever on a damaged simulator installation.
  echo "::warning::Simulator install failed; one bounded reinstall attempt"
  run_bounded 30 xcrun simctl shutdown "$DEVICE" || true
  run_bounded 40 xcrun simctl boot "$DEVICE" || true
  run_bounded 180 xcrun simctl bootstatus "$DEVICE" -b
  run_bounded 150 xcrun simctl install "$DEVICE" "$APP"
fi
mkdir -p screenshots
export REQUIRE_WORLD_ONE_ART="${{ vars.REQUIRE_WORLD_ONE_ART == 'true' && '1' || '0' }}"
# A cold-booted simulator can show a gray launch screen for several
# seconds while still returning success from 'simctl launch'.
# Retry until a decoded screenshot contains actual rendered colors.
capture_scene() {
  FLAG="$1"
  OUTPUT="$2"
  for ATTEMPT in 1 2 3; do
    run_bounded 15 xcrun simctl terminate "$DEVICE" com.paulus.laststandcommand || true
    # Give SpringBoard time to remove the previous game's surface
    # before launching a different QA flag. Without this the
    # simulator occasionally screenshots the previous scene.
    sleep 2
    # Cold-booted CoreSimulator can accept the app but not yet
    # serve pixels. Launch/screenshot timeout is retriable too.
    # In strict art-review mode, World 1 screenshots must render
    # with authored textures. The scene's existing assertion fails
    # loudly if a required floor or prop cannot be loaded at runtime.
    EXTRA_FLAGS=()
    if [ "${REQUIRE_WORLD_ONE_ART:-0}" = "1" ]; then
      case "$FLAG" in
        -captureWorldOne*Screenshot) EXTRA_FLAGS=(-requireWorldOneAuthoredArt) ;;
      esac
    fi
    if ! run_bounded 45 xcrun simctl launch "$DEVICE" com.paulus.laststandcommand "$FLAG" "${EXTRA_FLAGS[@]}"; then
      echo "::warning::Simulator launch timed out for $FLAG (attempt $ATTEMPT)"
      if [ "$ATTEMPT" != 3 ]; then
        # A cold CoreSimulatorService can become unresponsive even
        # after installation. Reboot the simulator before retrying
        # rather than issuing launch to the same wedged instance.
        run_bounded 30 xcrun simctl shutdown "$DEVICE" || true
        run_bounded 45 xcrun simctl boot "$DEVICE" || true
        run_bounded 120 xcrun simctl bootstatus "$DEVICE" -b || true
        run_bounded 65 xcrun simctl install "$DEVICE" "$APP" || true
      fi
      sleep 4
      continue
    fi
    sleep 8
    if run_bounded 55 xcrun simctl io "$DEVICE" screenshot "$OUTPUT" &&
       python3 scripts/validate_simulator_screenshots.py "$OUTPUT"; then
      return 0
    fi
    echo "::warning::Simulator frame for $FLAG unavailable (attempt $ATTEMPT); retrying"
    sleep 4
  done
  echo "::error::Simulator never rendered a usable frame for $FLAG"
  # Leave a useful reason in CI when the app exits after launch.
  run_bounded 25 xcrun simctl spawn "$DEVICE" log show \
    --last 90s --style compact \
    --predicate 'process == "OutpostZero" AND messageType == error' \
    2>/dev/null | tail -35 || true
  return 1
}
# Prioritize the requested actual gameplay terrain previews before
# the lengthy menu/combat capture sequence. Upload remains always().
capture_scene -captureWorldOneOutpostScreenshot screenshots/outpost-zero-world1-outpost.png
capture_scene -captureWorldOneSwampScreenshot screenshots/outpost-zero-world1-swamp.png
capture_scene -captureWorldOneCavesScreenshot screenshots/outpost-zero-world1-caves.png
capture_scene -captureWorldOneBossScreenshot screenshots/outpost-zero-world1-boss.png
capture_scene -captureWorldOneOutpostRevisitScreenshot screenshots/outpost-zero-world1-outpost-revisit.png
capture_scene -captureWorldOneSwampRevisitScreenshot screenshots/outpost-zero-world1-swamp-revisit.png
capture_scene -captureWorldOneCavesRevisitScreenshot screenshots/outpost-zero-world1-caves-revisit.png
# The World 1 art review is not complete unless all seven actual
# simulator frames exist. Fail explicitly rather than uploading an
# apparently successful archive containing only legacy captures.
python3 - <<'PY'
from pathlib import Path
expected = (
    "outpost", "swamp", "caves", "boss",
    "outpost-revisit", "swamp-revisit", "caves-revisit"
)
missing = [
    str(Path("screenshots") / f"outpost-zero-world1-{name}.png")
    for name in expected
    if not (Path("screenshots") / f"outpost-zero-world1-{name}.png").is_file()
]
if missing:
    raise SystemExit("Missing required World 1 simulator captures: " + ", ".join(missing))
print("PASS: all seven World 1 simulator landscape captures present")
PY
# Reject the uniform green fallback strip previously visible at
# the bottom of the first Toxic Caves simulator screenshot.
python3 - <<'PY'
from PIL import Image
image = Image.open("screenshots/outpost-zero-world1-caves.png").convert("RGB")
width, height = image.size
sample_y = height - max(8, round(height * 0.015))
pixels = [image.getpixel((x, sample_y)) for x in range(0, width, max(1, width // 80))]
if len(set(pixels)) <= 2:
    raise SystemExit("Toxic Caves: uniform bottom-edge fallback strip detected")
print("PASS: Toxic Caves bottom edge contains illustrated detail")
PY
capture_scene -captureEquipmentDefenseScreenshot screenshots/outpost-zero-defense-active.png
capture_scene -captureEquipmentDefenseClearScreenshot screenshots/outpost-zero-defense-cleared.png
capture_scene -captureEquipmentDefenseFailureScreenshot screenshots/outpost-zero-defense-failed.png
# The authored front walk is gated to simulator QA. Sample a live
# sequence spanning walking and idle instead of freezing one pose.
capture_scene -previewPilotWalk screenshots/outpost-zero-walk-preview-01.png
# Record continuous motion as well as stills: screenshot command
# latency can repeatedly sample the same two poses. Bound startup,
# recording and finalization so a stuck recorder cannot pin CI.
python3 - "$DEVICE" <<'PY'
import pathlib
import signal
import subprocess
import sys
import time
output = pathlib.Path("screenshots/outpost-zero-walk-preview.mp4")
log = pathlib.Path("screenshots/outpost-zero-walk-video.log")
with log.open("w") as diagnostics:
    recorder = subprocess.Popen(
        ["xcrun", "simctl", "io", sys.argv[1], "recordVideo",
         "--codec=h264", "--force", str(output)],
        stdout=diagnostics, stderr=subprocess.STDOUT)
    try:
        time.sleep(12)  # Three complete movement/idle passes.
        if recorder.poll() is not None:
            raise RuntimeError("Video recorder exited before review completed")
        recorder.send_signal(signal.SIGINT)
        recorder.wait(timeout=25)
        if recorder.returncode not in (0, -signal.SIGINT):
            raise RuntimeError(f"Video recorder failed: {recorder.returncode}")
        if not output.exists() or output.stat().st_size < 16384:
            raise RuntimeError("Walk review video is missing or empty")
        print(f"PASS: continuous walk review video ({output.stat().st_size} bytes)")
    finally:
        if recorder.poll() is None:
            recorder.kill()
            recorder.wait(timeout=5)
PY
for INDEX in $(seq -w 2 16); do
  sleep 0.15
  run_bounded 55 xcrun simctl io "$DEVICE" screenshot "screenshots/outpost-zero-walk-preview-$INDEX.png"
done
python3 scripts/validate_simulator_screenshots.py screenshots/outpost-zero-walk-preview-*.png
python3 - <<'PY'
from hashlib import sha256
from pathlib import Path
frames = sorted(Path("screenshots").glob("outpost-zero-walk-preview-*.png"))
assert len(frames) == 16, "Walk review requires a complete sequence"
assert len({sha256(p.read_bytes()).digest() for p in frames}) >= 4, "Walk preview appears frozen"
print("PASS: live walk/idle preview rendered 16 independent samples")
PY
capture_scene -previewPilotWalkNorth screenshots/outpost-zero-walk-preview-north.png
# Record continuous motion as well as stills: screenshot command
# latency can repeatedly sample the same two poses. Bound startup,
# recording and finalization so a stuck recorder cannot pin CI.
python3 - "$DEVICE" <<'PY'
import pathlib
import signal
import subprocess
import sys
import time
output = pathlib.Path("screenshots/outpost-zero-walk-preview-north.mp4")
log = pathlib.Path("screenshots/outpost-zero-walk-north-video.log")
with log.open("w") as diagnostics:
    recorder = subprocess.Popen(
        ["xcrun", "simctl", "io", sys.argv[1], "recordVideo",
         "--codec=h264", "--force", str(output)],
        stdout=diagnostics, stderr=subprocess.STDOUT)
    try:
        time.sleep(12)  # Three complete movement/idle passes.
        if recorder.poll() is not None:
            raise RuntimeError("Video recorder exited before review completed")
        recorder.send_signal(signal.SIGINT)
        recorder.wait(timeout=25)
        if recorder.returncode not in (0, -signal.SIGINT):
            raise RuntimeError(f"Video recorder failed: {recorder.returncode}")
        if not output.exists() or output.stat().st_size < 16384:
            raise RuntimeError("Walk review video is missing or empty")
        print(f"PASS: continuous walk review video ({output.stat().st_size} bytes)")
    finally:
        if recorder.poll() is None:
            recorder.kill()
            recorder.wait(timeout=5)
PY
capture_scene -previewPilotWalkEast screenshots/outpost-zero-walk-preview-east.png
# Record continuous motion as well as stills: screenshot command
# latency can repeatedly sample the same two poses. Bound startup,
# recording and finalization so a stuck recorder cannot pin CI.
python3 - "$DEVICE" <<'PY'
import pathlib
import signal
import subprocess
import sys
import time
output = pathlib.Path("screenshots/outpost-zero-walk-preview-east.mp4")
log = pathlib.Path("screenshots/outpost-zero-walk-east-video.log")
with log.open("w") as diagnostics:
    recorder = subprocess.Popen(
        ["xcrun", "simctl", "io", sys.argv[1], "recordVideo",
         "--codec=h264", "--force", str(output)],
        stdout=diagnostics, stderr=subprocess.STDOUT)
    try:
        time.sleep(12)  # Three complete movement/idle passes.
        if recorder.poll() is not None:
            raise RuntimeError("Video recorder exited before review completed")
        recorder.send_signal(signal.SIGINT)
        recorder.wait(timeout=25)
        if recorder.returncode not in (0, -signal.SIGINT):
            raise RuntimeError(f"Video recorder failed: {recorder.returncode}")
        if not output.exists() or output.stat().st_size < 16384:
            raise RuntimeError("Walk review video is missing or empty")
        print(f"PASS: continuous walk review video ({output.stat().st_size} bytes)")
    finally:
        if recorder.poll() is None:
            recorder.kill()
            recorder.wait(timeout=5)
PY
capture_scene -previewPilotWalkWest screenshots/outpost-zero-walk-preview-west.png
# Record continuous motion as well as stills: screenshot command
# latency can repeatedly sample the same two poses. Bound startup,
# recording and finalization so a stuck recorder cannot pin CI.
python3 - "$DEVICE" <<'PY'
import pathlib
import signal
import subprocess
import sys
import time
output = pathlib.Path("screenshots/outpost-zero-walk-preview-west.mp4")
log = pathlib.Path("screenshots/outpost-zero-walk-west-video.log")
with log.open("w") as diagnostics:
    recorder = subprocess.Popen(
        ["xcrun", "simctl", "io", sys.argv[1], "recordVideo",
         "--codec=h264", "--force", str(output)],
        stdout=diagnostics, stderr=subprocess.STDOUT)
    try:
        time.sleep(12)  # Three complete movement/idle passes.
        if recorder.poll() is not None:
            raise RuntimeError("Video recorder exited before review completed")
        recorder.send_signal(signal.SIGINT)
        recorder.wait(timeout=25)
        if recorder.returncode not in (0, -signal.SIGINT):
            raise RuntimeError(f"Video recorder failed: {recorder.returncode}")
        if not output.exists() or output.stat().st_size < 16384:
            raise RuntimeError("Walk review video is missing or empty")
        print(f"PASS: continuous walk review video ({output.stat().st_size} bytes)")
    finally:
        if recorder.poll() is None:
            recorder.kill()
            recorder.wait(timeout=5)
PY
capture_scene -previewPilotWalkNE screenshots/outpost-zero-walk-preview-ne.png
# Record continuous motion as well as stills: screenshot command
# latency can repeatedly sample the same two poses. Bound startup,
# recording and finalization so a stuck recorder cannot pin CI.
python3 - "$DEVICE" <<'PY'
import pathlib
import signal
import subprocess
import sys
import time
output = pathlib.Path("screenshots/outpost-zero-walk-preview-ne.mp4")
log = pathlib.Path("screenshots/outpost-zero-walk-ne-video.log")
with log.open("w") as diagnostics:
    recorder = subprocess.Popen(
        ["xcrun", "simctl", "io", sys.argv[1], "recordVideo",
         "--codec=h264", "--force", str(output)],
        stdout=diagnostics, stderr=subprocess.STDOUT)
    try:
        time.sleep(12)  # Three complete movement/idle passes.
        if recorder.poll() is not None:
            raise RuntimeError("Video recorder exited before review completed")
        recorder.send_signal(signal.SIGINT)
        recorder.wait(timeout=25)
        if recorder.returncode not in (0, -signal.SIGINT):
            raise RuntimeError(f"Video recorder failed: {recorder.returncode}")
        if not output.exists() or output.stat().st_size < 16384:
            raise RuntimeError("Walk review video is missing or empty")
        print(f"PASS: continuous walk review video ({output.stat().st_size} bytes)")
    finally:
        if recorder.poll() is None:
            recorder.kill()
            recorder.wait(timeout=5)
PY
capture_scene -previewPilotWalkNW screenshots/outpost-zero-walk-preview-nw.png
# Record continuous motion as well as stills: screenshot command
# latency can repeatedly sample the same two poses. Bound startup,
# recording and finalization so a stuck recorder cannot pin CI.
python3 - "$DEVICE" <<'PY'
import pathlib
import signal
import subprocess
import sys
import time
output = pathlib.Path("screenshots/outpost-zero-walk-preview-nw.mp4")
log = pathlib.Path("screenshots/outpost-zero-walk-nw-video.log")
with log.open("w") as diagnostics:
    recorder = subprocess.Popen(
        ["xcrun", "simctl", "io", sys.argv[1], "recordVideo",
         "--codec=h264", "--force", str(output)],
        stdout=diagnostics, stderr=subprocess.STDOUT)
    try:
        time.sleep(12)  # Three complete movement/idle passes.
        if recorder.poll() is not None:
            raise RuntimeError("Video recorder exited before review completed")
        recorder.send_signal(signal.SIGINT)
        recorder.wait(timeout=25)
        if recorder.returncode not in (0, -signal.SIGINT):
            raise RuntimeError(f"Video recorder failed: {recorder.returncode}")
        if not output.exists() or output.stat().st_size < 16384:
            raise RuntimeError("Walk review video is missing or empty")
        print(f"PASS: continuous walk review video ({output.stat().st_size} bytes)")
    finally:
        if recorder.poll() is None:
            recorder.kill()
            recorder.wait(timeout=5)
PY
capture_scene -previewPilotWalkSE screenshots/outpost-zero-walk-preview-se.png
# Record continuous motion as well as stills: screenshot command
# latency can repeatedly sample the same two poses. Bound startup,
# recording and finalization so a stuck recorder cannot pin CI.
python3 - "$DEVICE" <<'PY'
import pathlib
import signal
import subprocess
import sys
import time
output = pathlib.Path("screenshots/outpost-zero-walk-preview-se.mp4")
log = pathlib.Path("screenshots/outpost-zero-walk-se-video.log")
with log.open("w") as diagnostics:
    recorder = subprocess.Popen(
        ["xcrun", "simctl", "io", sys.argv[1], "recordVideo",
         "--codec=h264", "--force", str(output)],
        stdout=diagnostics, stderr=subprocess.STDOUT)
    try:
        time.sleep(12)  # Three complete movement/idle passes.
        if recorder.poll() is not None:
            raise RuntimeError("Video recorder exited before review completed")
        recorder.send_signal(signal.SIGINT)
        recorder.wait(timeout=25)
        if recorder.returncode not in (0, -signal.SIGINT):
            raise RuntimeError(f"Video recorder failed: {recorder.returncode}")
        if not output.exists() or output.stat().st_size < 16384:
            raise RuntimeError("Walk review video is missing or empty")
        print(f"PASS: continuous walk review video ({output.stat().st_size} bytes)")
    finally:
        if recorder.poll() is None:
            recorder.kill()
            recorder.wait(timeout=5)
PY
capture_scene -previewPilotWalkSW screenshots/outpost-zero-walk-preview-sw.png
# Record continuous motion as well as stills: screenshot command
# latency can repeatedly sample the same two poses. Bound startup,
# recording and finalization so a stuck recorder cannot pin CI.
python3 - "$DEVICE" <<'PY'
import pathlib
import signal
import subprocess
import sys
import time
output = pathlib.Path("screenshots/outpost-zero-walk-preview-sw.mp4")
log = pathlib.Path("screenshots/outpost-zero-walk-sw-video.log")
with log.open("w") as diagnostics:
    recorder = subprocess.Popen(
        ["xcrun", "simctl", "io", sys.argv[1], "recordVideo",
         "--codec=h264", "--force", str(output)],
        stdout=diagnostics, stderr=subprocess.STDOUT)
    try:
        time.sleep(12)  # Three complete movement/idle passes.
        if recorder.poll() is not None:
            raise RuntimeError("Video recorder exited before review completed")
        recorder.send_signal(signal.SIGINT)
        recorder.wait(timeout=25)
        if recorder.returncode not in (0, -signal.SIGINT):
            raise RuntimeError(f"Video recorder failed: {recorder.returncode}")
        if not output.exists() or output.stat().st_size < 16384:
            raise RuntimeError("Walk review video is missing or empty")
        print(f"PASS: continuous walk review video ({output.stat().st_size} bytes)")
    finally:
        if recorder.poll() is None:
            recorder.kill()
            recorder.wait(timeout=5)
PY
capture_scene -previewPilotLegRigSW screenshots/outpost-zero-walk-preview-rig-sw.png
# Record continuous motion as well as stills: screenshot command
# latency can repeatedly sample the same two poses. Bound startup,
# recording and finalization so a stuck recorder cannot pin CI.
python3 - "$DEVICE" <<'PY'
import pathlib
import signal
import subprocess
import sys
import time
output = pathlib.Path("screenshots/outpost-zero-walk-preview-rig-sw.mp4")
log = pathlib.Path("screenshots/outpost-zero-walk-rig-sw-video.log")
with log.open("w") as diagnostics:
    recorder = subprocess.Popen(
        ["xcrun", "simctl", "io", sys.argv[1], "recordVideo",
         "--codec=h264", "--force", str(output)],
        stdout=diagnostics, stderr=subprocess.STDOUT)
    try:
        time.sleep(12)  # Three complete movement/idle passes.
        if recorder.poll() is not None:
            raise RuntimeError("Video recorder exited before review completed")
        recorder.send_signal(signal.SIGINT)
        recorder.wait(timeout=25)
        if recorder.returncode not in (0, -signal.SIGINT):
            raise RuntimeError(f"Video recorder failed: {recorder.returncode}")
        if not output.exists() or output.stat().st_size < 16384:
            raise RuntimeError("Walk review video is missing or empty")
        print(f"PASS: continuous walk review video ({output.stat().st_size} bytes)")
    finally:
        if recorder.poll() is None:
            recorder.kill()
            recorder.wait(timeout=5)
PY
