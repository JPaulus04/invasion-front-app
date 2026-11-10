#!/usr/bin/env bash
# Shared disposable CoreSimulator lifecycle. Source after run_bounded is defined.
# Every caller gets a newly created device; never borrow a runner's preexisting device.
sim_candidates() {
  run_bounded 45 xcrun simctl list devices available -j | python3 -c '
import json,sys
data=json.load(sys.stdin)["devices"]
items=[]
for runtime, devices in sorted(data.items(),reverse=True):
 for d in devices:
  if d.get("isAvailable",True) and d.get("name","").startswith("iPhone") and d.get("deviceTypeIdentifier"):
   items.append((runtime,d["deviceTypeIdentifier"]))
for runtime,device_type in items[:3]: print(runtime+" "+device_type)
'
}
sim_destroy() {
  if [ -n "${DEVICE:-}" ]; then
    run_bounded 30 xcrun simctl shutdown "$DEVICE" || true
    run_bounded 35 xcrun simctl delete "$DEVICE" || true
    DEVICE=""
  fi
}
sim_create() {
  local runtime device_type
  read -r runtime device_type <<< "$1"
  DEVICE="$(run_bounded 60 xcrun simctl create "OutpostZero-${SIM_PROFILE:-visual}-$$" "$device_type" "$runtime")" || return 1
  [ -n "$DEVICE" ] || return 1
  echo "Created disposable simulator: $DEVICE" >&2
  run_bounded 60 xcrun simctl boot "$DEVICE" || return 1
  run_bounded 240 xcrun simctl bootstatus "$DEVICE" -b || return 1
  run_bounded 50 xcrun simctl io "$DEVICE" screenshot /tmp/outpost-sim-preflight-$$.png || return 1
  python3 -c 'from PIL import Image; import sys; im=Image.open(sys.argv[1]); im.verify()' "/tmp/outpost-sim-preflight-$$.png" || return 1
  run_bounded 150 xcrun simctl install "$DEVICE" "${APP:-simulator-app/OutpostZero.app}" || return 1
}
sim_prepare() {
  local candidate
  local candidates
  candidates="$(sim_candidates)" || return 1
  [ -n "$candidates" ] || { echo "::error title=Simulator infrastructure::No iPhone runtime available"; return 1; }
  while IFS= read -r candidate; do
    [ -n "$candidate" ] || continue
    if sim_create "$candidate"; then return 0; fi
    echo "::warning::Disposable simulator failed readiness; replacing it"
    sim_destroy
  done <<< "$candidates"
  echo "::error title=Simulator infrastructure::No disposable simulator passed preflight"
  return 1
}
sim_recover() {
  echo "::warning::Replacing unresponsive simulator rather than rebooting damaged device"
  sim_destroy
  sim_prepare
}
