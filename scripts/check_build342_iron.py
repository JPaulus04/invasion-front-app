"""Real simulator Iron Wastes captures; technical checks do not confer visual approval."""
from pathlib import Path
from check_build342_hazards import capture
from run_phase4_simulator import focused_simulator

def main():
    output = Path("build342-iron-review").resolve()
    output.mkdir(exist_ok=True)
    with focused_simulator("build342-iron", output) as device:
        capture(device, output, "4-1-water", first=True)
        for room in (1, 6, 11, 30):
            capture(device, output, f"4-{room}-water", iron=True)
    print("Five actual Iron Wastes captures present. Visual review remains required.")

if __name__ == "__main__":
    main()
