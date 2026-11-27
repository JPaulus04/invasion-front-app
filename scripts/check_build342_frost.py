"""Real simulator Frost captures; technical checks do not confer visual approval."""
from pathlib import Path
from check_build342_hazards import capture
from run_phase4_simulator import focused_simulator

def main():
    output = Path("build342-frost-review").resolve()
    output.mkdir(exist_ok=True)
    with focused_simulator("build342-frost", output) as device:
        capture(device, output, "3-1-water", first=True)
        for room in (1, 6, 11, 30):
            capture(device, output, f"3-{room}-water", frost=True)
    print("Five actual Frost captures present. Visual review remains required.")

if __name__ == "__main__":
    main()
