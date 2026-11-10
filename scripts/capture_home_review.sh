#!/usr/bin/env bash
set -eo pipefail
export OUTPOST_SIM_DIAGNOSTICS=${OUTPOST_SIM_DIAGNOSTICS:-screenshots/simulator-diagnostics.jsonl}
# Every simulator subprocess is bounded so a stalled simctl cannot
# pin the macOS runner until the whole job times out.
run_bounded() {
  local limit="$1"; shift
  python3 scripts/simulator_command.py --timeout "$limit" --label "${1##*/} ${2:-command}" -- "$@"
}
# Let a fresh service finish first-boot data migration. Killing it
# before listing devices made the migrations restart on some hosts.
# Fallback to a second available iPhone only after bounded readiness.
DEVICE="${OUTPOST_ZERO_SIMULATOR_UDID:-}"
if [ -n "$DEVICE" ]; then
  echo "Reusing boot-ready simulator $DEVICE; skipping CoreSimulator enumeration"
else
  echo "::error::No prewarmed simulator UUID supplied by the workflow"
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
export REQUIRE_WORLD_ONE_ART="${REQUIRE_WORLD_ONE_ART:-0}"
# A cold-booted simulator can show a gray launch screen for several
# seconds while still returning success from 'simctl launch'.
# Retry until a decoded screenshot contains actual rendered colors.
capture_scene() {
  FLAG="$1"
  OUTPUT="$2"
  for ATTEMPT in 1 2 3; do
    # Do not block on terminate: on cold hosted simulators this can hang\n    # even when the app is not running. Let launch replace it.
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
    if ! run_bounded 65 xcrun simctl launch --terminate-running-process "$DEVICE" com.paulus.laststandcommand "$FLAG" "${EXTRA_FLAGS[@]}"; then
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
       python3 scripts/validate_simulator_screenshots.py "$OUTPUT" &&
       python3 scripts/validate_home_capture.py "$OUTPUT"; then
      # A healthy PNG can still be the iOS home screen if the app exited
      # after launch. Treat that as a retriable capture failure here.
      if [ -f screenshots/springboard-reference.png ] &&
         ! verify_game_foreground "$OUTPUT"; then
        echo "::warning::Game exited to SpringBoard during $FLAG (attempt $ATTEMPT)"
      else
        return 0
      fi
    fi
    echo "::warning::Simulator frame for $FLAG unavailable (attempt $ATTEMPT); retrying"
    sleep 4
  done
  echo "::error::Simulator never rendered a usable frame for $FLAG"
  # Preserve the real termination reason: SpriteKit QA preconditions produce
  # .ips crash reports, often without a useful OSLog error message.
  echo "::group::Recent OutpostZero crash reports"
  find "$HOME/Library/Logs/DiagnosticReports" -type f \( -iname '*OutpostZero*.ips' -o -iname '*OutpostZero*.crash' \) -mmin -25 -print 2>/dev/null | while IFS= read -r report; do
    echo "Crash report: $report"
    head -c 18000 "$report" || true
    echo
  done
  echo "::endgroup::"
  echo "::group::Recent app termination and assertion events"
  run_bounded 35 xcrun simctl spawn "$DEVICE" log show --last 6m --style compact \
    --predicate '(process == "OutpostZero" OR process == "ReportCrash" OR process == "SpringBoard") AND (eventMessage CONTAINS[c] "assert" OR eventMessage CONTAINS[c] "crash" OR eventMessage CONTAINS[c] "termination" OR eventMessage CONTAINS[c] "precondition")' \
    2>/dev/null | tail -90 || true
  echo "::endgroup::"
  # Leave a useful reason in CI when the app exits after launch.
  run_bounded 25 xcrun simctl spawn "$DEVICE" log show \
    --last 90s --style compact \
    --predicate 'process == "OutpostZero" AND messageType == error' \
    2>/dev/null | tail -35 || true
  return 1
}
# Capture SpringBoard as a reference. A valid PNG is not proof the app
# remained in the foreground after its QA launch assertions.
run_bounded 8 xcrun simctl terminate "$DEVICE" com.paulus.laststandcommand || true
sleep 2
run_bounded 45 xcrun simctl io "$DEVICE" screenshot screenshots/springboard-reference.png
verify_game_foreground() {
  python3 - "$1" <<'PY'
from PIL import Image, ImageChops, ImageStat
import sys
reference = Image.open("screenshots/springboard-reference.png").convert("RGB").resize((120, 260))
captured = Image.open(sys.argv[1]).convert("RGB").resize((120, 260))
difference = ImageStat.Stat(ImageChops.difference(reference, captured)).mean
score = sum(difference) / 3
print(f"Foreground difference from SpringBoard: {score:.1f}")
if score < 17:
    raise SystemExit("Screenshot resembles iOS SpringBoard, not Outpost Zero")
PY
}
# Focused Home review: only three requested states.
capture_scene -captureHomeNavigationScreenshot screenshots/outpost-zero-home-navigation.png
verify_game_foreground screenshots/outpost-zero-home-navigation.png
capture_scene -captureWorldSelectorScreenshot screenshots/outpost-zero-world-selector.png
verify_game_foreground screenshots/outpost-zero-world-selector.png
# Headquarters can terminate on a failed launch assertion. Collect crash
# evidence and retry only this scene rather than rerunning the whole review.
hq_ok=0
for hq_attempt in 1 2; do
  capture_scene -captureHeadquartersScreenshot screenshots/outpost-zero-headquarters.png
  if verify_game_foreground screenshots/outpost-zero-headquarters.png; then
    hq_ok=1
    break
  fi
  echo "::warning::Headquarters returned to SpringBoard (attempt $hq_attempt)"
  run_bounded 35 xcrun simctl spawn "$DEVICE" log show --last 120s --style compact \
    --predicate '(process == "OutpostZero" OR process == "ReportCrash") AND (messageType == error OR eventMessage CONTAINS[c] "precondition" OR eventMessage CONTAINS[c] "fatal")' \
    2>/dev/null | tail -70 || true
  sleep 3
done
if [ "$hq_ok" != 1 ]; then
  echo "::error::Headquarters did not stay foreground; review simulator crash diagnostics"
  exit 1
fi
# Verify the alternate locked roster state, not just the default Vanguard.
capture_scene -captureSpecterScreenshot screenshots/outpost-zero-commander-specter.png
verify_game_foreground screenshots/outpost-zero-commander-specter.png
capture_scene -captureBulwarkScreenshot screenshots/outpost-zero-commander-bulwark.png
verify_game_foreground screenshots/outpost-zero-commander-bulwark.png
capture_scene -captureLockedCommanderScreenshot screenshots/outpost-zero-commander-locked.png
verify_game_foreground screenshots/outpost-zero-commander-locked.png

# The menu acceptance pass must include both permanent progression screens.
# These flags already exist in OutpostScene and exercise the real screens.
capture_scene -captureGearBayScreenshot screenshots/outpost-zero-gear-bay.png
verify_game_foreground screenshots/outpost-zero-gear-bay.png
capture_scene -captureAbilityLabScreenshot screenshots/outpost-zero-ability-lab.png
verify_game_foreground screenshots/outpost-zero-ability-lab.png

# Menu-only acceptance: include the two upgrade screens in the final check.
python3 scripts/validate_simulator_screenshots.py \
  screenshots/outpost-zero-home-navigation.png \
  screenshots/outpost-zero-world-selector.png \
  screenshots/outpost-zero-headquarters.png \
  screenshots/outpost-zero-commander-specter.png \
  screenshots/outpost-zero-commander-bulwark.png \
  screenshots/outpost-zero-commander-locked.png \
  screenshots/outpost-zero-gear-bay.png \
  screenshots/outpost-zero-ability-lab.png
