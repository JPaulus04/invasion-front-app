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


def assess(stationary_path, moving_path):
    stationary, moving = map(parse, (stationary_path, moving_path))
    stationary_text = Path(stationary_path).read_text(errors="replace")
    moving_text = Path(moving_path).read_text(errors="replace")
    entered = list(map(int, re.findall(r"\[PHASE4 ROOM\] entered=(\d+)", moving_text)))
    cleared = list(map(int, re.findall(r"\[PHASE4 ROOM\] cleared=(\d+)", moving_text)))
    defense = re.findall(r"\[PHASE4 ROOM\] cleared=(\d+) encounter=equipmentDefense hp=(\d+) level=(\d+) integrity=(\d+)", moving_text)
    choices = len(re.findall(r"\[PHASE4 QA\] choice=\S+ accepted=true", moving_text))
    checks = {
        "matching_start_markers": "profile=stationary started world=1" in stationary_text and "profile=moving started world=1" in moving_text,
        "stationary_profile": stationary["movement"] < 1,
        "stationary_fails_world_1": stationary["outcome"] == "defeat" and stationary["damage"] > 0,
        "moving_profile": moving["movement"] >= 100,
        "moving_completes_world_1": moving["outcome"] == "complete" and moving["room"] == 20,
        "moving_selects_upgrades": moving["upgrades"] > 0,
        "all_rooms_entered_in_order": entered == list(range(1, 21)),
        "all_rooms_cleared_in_order": cleared == list(range(1, 21)),
        "final_boss_spawned": "[PHASE4 BOSS] spawned room=20" in moving_text,
        "final_boss_defeated": "[PHASE4 BOSS] defeated room=20" in moving_text,
        "upgrades_match_outcome": choices == moving["upgrades"],
        "reactor_survived": bool(defense) and all(int(row[3]) > 0 for row in defense),
    }
    return {"stationary": stationary, "moving": moving, "rooms_entered": entered,
            "rooms_cleared": cleared, "defense_rooms": defense,
            "checks": checks, "passed": all(checks.values())}


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: analyze_phase4_playtests.py STATIONARY_LOG MOVING_LOG")
    try:
        result = assess(*sys.argv[1:])
    except (OSError, ValueError) as error:
        result = {"passed": False, "error": str(error)}
    print(json.dumps(result, indent=2))
    if not result["passed"]:
        raise SystemExit("FAIL: World 1 gameplay acceptance checks not met")


if __name__ == "__main__":
    main()
