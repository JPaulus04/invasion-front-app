"""Shared disposable CoreSimulator lifecycle for Python gameplay campaigns.

Infrastructure failures may replace a device before gameplay starts.
Once gameplay starts, never restart the campaign or fabricate an outcome.
"""
import json
from pathlib import Path
import subprocess
import os
import time
from contextlib import contextmanager


def command(*argv, timeout=60, check=True):
    start = time.monotonic()
    result = None
    failure = None
    try:
        result = subprocess.run(argv, timeout=timeout, check=False,
                                capture_output=True, text=True)
    except (OSError, subprocess.TimeoutExpired) as exc:
        failure = exc
    destination_name = os.environ.get("OUTPOST_SIM_DIAGNOSTICS")
    if destination_name:
        destination = Path(destination_name)
        destination.parent.mkdir(parents=True, exist_ok=True)
        with destination.open("a") as handle:
            handle.write(json.dumps({
                "command": list(argv[:3]),
                "exit_code": result.returncode if result is not None else 70,
                "category": "infrastructure" if failure else "completed",
                "duration_seconds": round(time.monotonic() - start, 2),
                "error": str(failure) if failure else None
            }) + "\n")
    if failure is not None:
        raise RuntimeError(f"SIMULATOR_INFRASTRUCTURE: {failure}") from failure
    if check and result.returncode:
        detail = (result.stderr or result.stdout).strip()
        if any(term in detail.lower() for term in (
                "coresimulator", "device unavailable", "service connection",
                "unable to boot", "device not found", "timed out",
                "data migration failed")):
            raise RuntimeError(f"SIMULATOR_INFRASTRUCTURE: {detail}")
        raise RuntimeError(f"GAME_OR_HARNESS_FAILURE: {argv}: {detail}")
    return result


@contextmanager
def fresh_simulator(profile, output, app="simulator-app/OutpostZero.app"):
    try:
        devices = json.loads(command("xcrun", "simctl", "list", "devices", "available", "-j",
                                     timeout=65).stdout)
    except (ValueError, KeyError) as exc:
        raise RuntimeError(f"SIMULATOR_INFRASTRUCTURE: invalid device inventory: {exc}") from exc
    candidates = [(runtime, device["deviceTypeIdentifier"])
                  for runtime, group in sorted(devices["devices"].items(), reverse=True)
                  for device in group if device.get("isAvailable", True)
                  and device.get("name", "").startswith("iPhone")
                  and device.get("deviceTypeIdentifier")][:3]
    if not candidates:
        raise RuntimeError("SIMULATOR_INFRASTRUCTURE: no iPhone runtime available")
    device = None
    try:
        for runtime, device_type in candidates:
            try:
                device = command("xcrun", "simctl", "create",
                                 f"OutpostZero-{profile}", device_type, runtime,
                                 timeout=60).stdout.strip()
                if not device:
                    raise RuntimeError("SIMULATOR_INFRASTRUCTURE: empty device UUID")
                command("xcrun", "simctl", "boot", device, timeout=60)
                command("xcrun", "simctl", "bootstatus", device, "-b", timeout=240)
                Path(output).mkdir(parents=True, exist_ok=True)
                preflight = Path(output) / f"{profile}-preflight.png"
                command("xcrun", "simctl", "io", device, "screenshot",
                        str(preflight), timeout=80)
                if not preflight.read_bytes().startswith(bytes.fromhex("89504e470d0a1a0a")):
                    raise RuntimeError("SIMULATOR_INFRASTRUCTURE: invalid preflight PNG")
                command("xcrun", "simctl", "install", device, app, timeout=150)
                (Path(output) / f"{profile}-device.json").write_text(json.dumps({
                    "udid": device, "runtime": runtime, "device_type": device_type,
                    "fresh_device": True}, indent=2))
                break
            except RuntimeError as exc:
                if not str(exc).startswith("SIMULATOR_INFRASTRUCTURE:"):
                    raise
                print(f"::warning::Replacing failed simulator: {exc}", flush=True)
                if device:
                    _cleanup(device)
                    device = None
        else:
            raise RuntimeError("SIMULATOR_INFRASTRUCTURE: all disposable devices failed")
        yield device
    finally:
        if device:
            _cleanup(device)


def _cleanup(device):
    for action in ("shutdown", "delete"):
        try:
            command("xcrun", "simctl", action, device, timeout=35)
        except RuntimeError as exc:
            print(f"::warning::Simulator cleanup {action}: {exc}", flush=True)
