#!/usr/bin/env python3
"""Validate the authored branding and capture it in the iOS Simulator."""
import argparse
from pathlib import Path
import plistlib
import time

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "OutpostZero/Assets.xcassets"
LOGO = CATALOG / "OutpostLogo.imageset/OutpostLogo.png"
ICON = CATALOG / "AppIcon.appiconset/AppIcon.png"


def check_assets():
    with Image.open(LOGO) as image:
        assert image.mode == "RGBA" and image.width == 1536
        assert 1.9 <= image.width / image.height <= 2.0
        alpha = image.getchannel("A")
        assert alpha.getextrema() == (0, 255)
        left, top, right, bottom = alpha.getbbox()
        assert min(left, top, image.width - right, image.height - bottom) >= 12
        print(f"Logo: {image.size}, transparent padding {(left, top, image.width - right, image.height - bottom)}")
    with Image.open(ICON) as image:
        assert image.mode == "RGB" and image.size == (1024, 1024)
    print("App icon: 1024×1024 opaque RGB")


def wait_for_ready(path, marker):
    deadline = time.monotonic() + 45
    while time.monotonic() < deadline:
        if path.exists() and marker in path.read_text(errors="replace"):
            return
        time.sleep(0.25)
    raise TimeoutError(f"{marker} did not appear in {path}")


def capture():
    from run_phase4_simulator import BUNDLE, command, fresh_simulator

    app = Path("simulator-app/OutpostZero.app")
    info = plistlib.loads((app / "Info.plist").read_bytes())
    assert info["UILaunchStoryboardName"] == "LaunchScreen"
    assert (app / "LaunchScreen.storyboardc").is_dir()
    icon_files = info["CFBundleIcons"]["CFBundlePrimaryIcon"]["CFBundleIconFiles"]
    assert "AppIcon60x60" in icon_files

    output = Path("branding-review").resolve()
    output.mkdir(exist_ok=True)
    # Use the compiled app icon renditions, at the system's 60-point footprint.
    for icon in sorted(app.glob("AppIcon60x60@*x.png")):
        with Image.open(icon) as image:
            assert image.width == image.height and image.width in (120, 180)
            image.save(output / icon.name)
    assert list(output.glob("AppIcon60x60@*x.png")), "Missing standalone compiled app icon rendition"
    # actool can store the @3x rendition in Assets.car. Provide a size-matched
    # preview for visual review when it does not emit a standalone PNG.
    if not (output / "AppIcon60x60@3x.png").is_file():
        with Image.open(ICON) as source:
            source.resize((180, 180), Image.Resampling.LANCZOS).save(output / "icon-60pt-3x-preview.png")

    for name, model in (("iphone-16-pro", "iPhone-16-Pro"), ("iphone-se", "iPhone-SE-3rd-generation")):
        with fresh_simulator(name, output, controlled=True, device_type=model) as device:
            for screen, flag, marker in (
                ("loading", "-captureBrandLaunch", "[BRAND LAUNCH]"),
                ("home", "-captureBrandHome", "[BRAND HOME]"),
            ):
                log = output / f"{name}-{screen}.log"
                command("xcrun", "simctl", "launch", "--terminate-running-process",
                        f"--stdout={log}", f"--stderr={output / (log.stem + '-stderr.log')}",
                        device, BUNDLE, flag, timeout=90)
                wait_for_ready(log, marker)
                time.sleep(0.8)
                destination = output / f"{name}-{screen}.png"
                command("xcrun", "simctl", "io", device, "screenshot", str(destination), timeout=55)
                with Image.open(destination) as image:
                    assert image.height > image.width >= 750
                    colors = image.convert("RGB").resize((120, 200)).getcolors(120 * 200)
                    assert colors is not None and len(colors) > 200, f"Blank capture: {destination}"
            if model == "iPhone-16-Pro":
                command("xcrun", "simctl", "terminate", device, BUNDLE, timeout=30)
                command("xcrun", "simctl", "io", device, "screenshot", str(output / "springboard.png"), timeout=55)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--capture", action="store_true")
    args = parser.parse_args()
    check_assets()
    if args.capture:
        capture()
