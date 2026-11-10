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


def prepare_simulator(profile, output, app="simulator-app/OutpostZero.app"):
    """Create, verify and install a disposable simulator; caller owns cleanup."""
    output = Path(output)
    output.mkdir(parents=True, exist_ok=True)
    devices = None
    for attempt in range(3):
        try:
            inventory = command("xcrun", "simctl", "list", "devices", "available", "-j",
                                timeout=65).stdout
            devices = json.loads(inventory)
            if not isinstance(devices.get("devices"), dict):
                raise ValueError("missing devices object")
            break
        except (ValueError, KeyError, RuntimeError) as exc:
            if isinstance(exc, RuntimeError) and not str(exc).startswith("SIMULATOR_INFRASTRUCTURE:"):
                raise
            print(f"::warning::Simulator inventory attempt {attempt + 1}/3: {exc}", flush=True)
            if attempt == 2:
                raise RuntimeError("SIMULATOR_INFRASTRUCTURE: inventory unavailable after 3 attempts") from exc
            time.sleep(5)
    candidates = [(runtime, device["deviceTypeIdentifier"])
                  for runtime, group in sorted(devices["devices"].items(), reverse=True)
                  for device in group if device.get("isAvailable", True)
                  and device.get("name", "").startswith("iPhone")
                  and device.get("deviceTypeIdentifier")][:3]
    if not candidates:
        raise RuntimeError("SIMULATOR_INFRASTRUCTURE: no iPhone runtime available")
    for runtime, device_type in candidates:
        device = None
        try:
            device = command("xcrun", "simctl", "create",
                             f"OutpostZero-{profile}-{os.getpid()}", device_type, runtime,
                             timeout=60).stdout.strip()
            if not device:
                raise RuntimeError("SIMULATOR_INFRASTRUCTURE: empty device UUID")
            command("xcrun", "simctl", "boot", device, timeout=60)
            command("xcrun", "simctl", "bootstatus", device, "-b", timeout=240)
            preflight = output / f"{profile}-preflight.png"
            command("xcrun", "simctl", "io", device, "screenshot",
                    str(preflight), timeout=80)
            if not preflight.is_file() or not preflight.read_bytes().startswith(bytes.fromhex("89504e470d0a1a0a")):
                raise RuntimeError("SIMULATOR_INFRASTRUCTURE: invalid preflight PNG")
            command("xcrun", "simctl", "install", device, app, timeout=150)
            (output / f"{profile}-device.json").write_text(json.dumps({
                "udid": device, "runtime": runtime, "device_type": device_type,
                "fresh_device": True}, indent=2))
            return device
        except RuntimeError as exc:
            if device:
                _cleanup(device)
            if not str(exc).startswith("SIMULATOR_INFRASTRUCTURE:"):
                raise
            print(f"::warning::Replacing failed simulator: {exc}", flush=True)
    raise RuntimeError("SIMULATOR_INFRASTRUCTURE: all disposable devices failed")


@contextmanager
def fresh_simulator(profile, output, app="simulator-app/OutpostZero.app"):
    device = prepare_simulator(profile, output, app)
    try:
        yield device
    finally:
        _cleanup(device)


def _cleanup(device):
    for action in ("shutdown", "delete"):
        try:
            command("xcrun", "simctl", action, device, timeout=35)
        except RuntimeError as exc:
            print(f"::warning::Simulator cleanup {action}: {exc}", flush=True)


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=["prepare", "destroy"])
    parser.add_argument("--profile", default="visual")
    parser.add_argument("--output", default="screenshots")
    parser.add_argument("--app", default="simulator-app/OutpostZero.app")
    parser.add_argument("--device")
    args = parser.parse_args()
    if args.action == "prepare":
        try:
            device = prepare_simulator(args.profile, args.output, args.app)
        except RuntimeError as exc:
            print(f"::error::{exc}", file=__import__("sys").stderr)
            return 70 if str(exc).startswith("SIMULATOR_INFRASTRUCTURE:") else 71
        print(device)
        return 0
    if not args.device:
        parser.error("--device required for destroy")
    _cleanup(args.device)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
