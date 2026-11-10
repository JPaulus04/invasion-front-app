#!/usr/bin/env bash
# Compatibility shim: Python owns all simulator creation, readiness and cleanup.
# Capture scripts source this file and use DEVICE, sim_prepare, sim_recover and sim_destroy.
sim_destroy() {
  if [ -n "${DEVICE:-}" ]; then
    python3 scripts/simulator_lifecycle.py destroy --device "$DEVICE" || true
    DEVICE=""
  fi
}
sim_prepare() {
  local result
  if result="$(python3 scripts/simulator_lifecycle.py prepare --profile "${SIM_PROFILE:-visual}" --output screenshots --app "${APP:-simulator-app/OutpostZero.app}")"; then
    DEVICE="$(printf '%s\n' "$result" | tail -n 1)"
    if [ -z "$DEVICE" ]; then
      echo "::error::Python simulator controller returned an empty device ID" >&2
      return 70
    fi
    echo "Created disposable simulator: $DEVICE" >&2
  else
    echo "::error::Python simulator controller could not prepare a simulator" >&2
    return 70
  fi
}
sim_recover() {
  echo "::warning::Replacing unresponsive disposable simulator" >&2
  sim_destroy
  sim_prepare
}
