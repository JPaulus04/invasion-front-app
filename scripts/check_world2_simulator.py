"""Run focused Debug encounters in the compiled Outpost Zero app."""

from pathlib import Path
import re
import time

from run_phase4_simulator import BUNDLE, command, focused_simulator


def wait_for_log(path, check, timeout=45):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        log = path.read_text(errors="replace") if path.exists() else ""
        if check(log):
            return
        time.sleep(0.25)
    raise AssertionError(f"Missing expected simulator events in {path}\n{log}")


def run_encounters(device, output):
    encounters = [
        (10, "corrosionravager", r"sweep.*charge"),
        (20, "blighthydra", r"head_left.*head_center.*head_right.*root_strike"),
        (30, "toxictyrant", r"sequence=attack.*sequence=slam"),
        (9, "venomspitter", r"hidden.*emerge.*attack.*retreat.*relocate.*emerge"),
        (6, "toxindrone", r"drone shot=1.*drone shot=2.*drone shot=3.*drone shot=1"),
    ]
    for room, enemy, events in encounters:
        log_path = output / f"{room}-{enemy}.log"
        command("xcrun", "simctl", "launch", "--terminate-running-process",
                f"--stdout={log_path}", f"--stderr={output / f'{room}-stderr.log'}",
                device, BUNDLE, f"-captureWorldTwoRoom={room}", timeout=90)
        expected_spawn = f"room={room} enemy={enemy}" + (" target=1\n" if room in (10, 20, 30) else "")
        wait_for_log(log_path, lambda log: (
            expected_spawn in log and
            (room != 10 or "all eight manifests and frames loaded" in log) and
            re.search(events, log, re.DOTALL)
        ))
        command("xcrun", "simctl", "io", device, "screenshot",
                str(output / f"{room}-{enemy}.png"), timeout=55)
        print(f"Room {room}: {enemy} passed", flush=True)


if __name__ == "__main__":
    output = Path("world2-review").resolve()
    output.mkdir(exist_ok=True)
    with focused_simulator("world2", output) as device:
        run_encounters(device, output)
