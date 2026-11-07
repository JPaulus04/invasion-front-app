#!/usr/bin/env python3
"""Analyze actual Outpost Zero DEBUG gameplay outcome logs.

Usage:
  python3 scripts/analyze_phase4_playtests.py stationary.log moving.log
The logs must come from real SpriteKit runs; this script never synthesizes outcomes.
"""
import json
import re
import sys
from pathlib import Path

PATTERN = re.compile(
    r"\[PHASE4 PLAYTEST\] outcome=(defeat|complete) world=(\d+) room=(\d+) "
    r"elapsed=(\d+) damage=(\d+) movement=(\d+) kills=(\d+) upgrades=(\d+) level=(\d+)"
)
FIELDS = ("world", "room", "elapsed", "damage", "movement", "kills", "upgrades", "level")


def parse(path):
    records = []
    for line in Path(path).read_text(errors="replace").splitlines():
        match = PATTERN.search(line)
        if match:
            record = {"outcome": match.group(1)}
            record.update(zip(FIELDS, map(int, match.groups()[1:])))
            records.append(record)
    if len(records) != 1:
        raise ValueError(f"{path}: expected exactly one completed gameplay outcome; found {len(records)}")
    record = records[0]
    if record["world"] != 1 or not 1 <= record["room"] <= 20:
        raise ValueError(f"{path}: not a valid World 1 run")
    if record["elapsed"] <= 0:
        raise ValueError(f"{path}: invalid elapsed time")
    return record


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: analyze_phase4_playtests.py STATIONARY_LOG MOVING_LOG")
    stationary, moving = map(parse, sys.argv[1:])
    checks = {
        "stationary_profile": stationary["movement"] < 1,
        "stationary_fails_world_1": stationary["outcome"] == "defeat" and stationary["room"] <= 20,
        "moving_profile": moving["movement"] >= 100,
        "moving_completes_world_1": moving["outcome"] == "complete" and moving["room"] == 20,
        "moving_selects_upgrades": moving["upgrades"] > 0,
    }
    result = {"stationary": stationary, "moving": moving, "checks": checks, "passed": all(checks.values())}
    print(json.dumps(result, indent=2))
    if not result["passed"]:
        raise SystemExit("FAIL: World 1 gameplay acceptance checks not met")


if __name__ == "__main__":
    main()
