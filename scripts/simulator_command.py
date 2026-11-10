#!/usr/bin/env python3
"""Shared, bounded CoreSimulator command runner.

Exit codes: 0 success, 70 simulator infrastructure timeout/unavailable,
71 application/fixture assertion or validation failure. Never retry code
failures as if they were transient infrastructure problems.
"""
import argparse
import json
import os
from pathlib import Path
import subprocess
import sys
import time


def execute(argv, timeout, label):
    start = time.monotonic()
    try:
        result = subprocess.run(argv, timeout=timeout, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout, end="", flush=True)
        if result.stderr:
            print(result.stderr, end="", file=sys.stderr, flush=True)
        if result.returncode == 0:
            category = "success"
            code = 0
        elif argv[:2] == ["xcrun", "simctl"] and any(
            term in (result.stdout + result.stderr).lower()
            for term in ("coresimulator", "unable to boot", "device unavailable",
                         "service connection", "timed out", "device not found")
        ):
            category = "infrastructure"
            code = 70
        else:
            category = "application_or_command"
            code = 71
    except subprocess.TimeoutExpired:
        category, code = "infrastructure", 70
        print(f"::warning::Simulator command timed out: {label} ({timeout}s)", file=sys.stderr)
    except OSError as error:
        category, code = "infrastructure", 70
        print(f"::warning::Simulator command could not start: {error}", file=sys.stderr)
    record = {"label": label, "category": category, "exit_code": code,
              "duration_seconds": round(time.monotonic() - start, 2),
              "command": argv[:3]}
    destination = os.environ.get("OUTPOST_SIM_DIAGNOSTICS")
    if destination:
        path = Path(destination)
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("a") as handle:
            handle.write(json.dumps(record) + "\n")
    if code:
        print(f"::error title={category}::{label}: {category} (exit {code})",
              file=sys.stderr)
    return code


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--timeout", type=int, required=True)
    parser.add_argument("--label", required=True)
    parser.add_argument("command", nargs=argparse.REMAINDER)
    args = parser.parse_args()
    command = args.command[1:] if args.command[:1] == ["--"] else args.command
    if not command:
        parser.error("missing command")
    return execute(command, args.timeout, args.label)


if __name__ == "__main__":
    sys.exit(main())
