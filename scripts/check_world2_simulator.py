"""Run focused Debug encounters in the compiled Outpost Zero app."""

import json
from pathlib import Path
import re
import subprocess
import sys
import time


def simctl(*args, timeout=45, check=True):
    return subprocess.run(
        ["xcrun", "simctl", *args], check=check, timeout=timeout,
        text=True, capture_output=True,
    )


def wait_for_log(path, check, timeout=45):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        log = path.read_text(errors="replace") if path.exists() else ""
        if check(log):
            return
        time.sleep(0.25)
    raise AssertionError(f"Missing expected simulator events in {path}\n{log}")


def main(app):
    output = Path("world2-review").resolve()
    output.mkdir(exist_ok=True)
    inventory = json.loads(simctl("list", "devices", "available", "-j").stdout)["devices"]
    device = next(
        item for runtime, devices in reversed(list(inventory.items())) if ".iOS-" in runtime
        for item in devices if "iPhone" in item["name"]
    )
    device_id = device["udid"]
    if device["state"] != "Booted":
        simctl("boot", device_id)
    simctl("bootstatus", device_id, "-b", timeout=220)
    simctl("install", device_id, app, timeout=120)
    bundle = "com.paulus.laststandcommand"
    encounters = [
        (10, "corrosionravager", r"sweep.*charge"),
        (20, "blighthydra", r"head_left.*head_center.*head_right.*root_strike"),
        (30, "toxictyrant", r"sequence=attack.*sequence=slam"),
        (9, "venomspitter", r"hidden.*emerge.*attack.*retreat.*relocate.*emerge"),
        (6, "toxindrone", r"drone shot=1.*drone shot=2.*drone shot=3.*drone shot=1"),
    ]
    for room, enemy, events in encounters:
        simctl("terminate", device_id, bundle, check=False)
        log_path = output / f"{room}-{enemy}.log"
        simctl("launch", f"--stdout={log_path}", f"--stderr={output / f'{room}-stderr.log'}",
               device_id, bundle, f"-captureWorldTwoRoom={room}")
        expected_spawn = f"room={room} enemy={enemy}" + (" target=1\n" if room in (10, 20, 30) else "")
        wait_for_log(log_path, lambda log: (
            expected_spawn in log and
            (room != 10 or "all eight manifests and frames loaded" in log) and
            re.search(events, log, re.DOTALL)
        ))
        simctl("io", device_id, "screenshot", str(output / f"{room}-{enemy}.png"))
        print(f"Room {room}: {enemy} passed", flush=True)


if __name__ == "__main__":
    main(sys.argv[1])
