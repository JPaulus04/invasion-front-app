#!/usr/bin/env python3
"""Verify authored source and optional compiled bundle resources byte-for-byte."""
import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "assets/enemies"


def sha256(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").digest()


def verify(bundle=None):
    summary = {}
    for world, expected_manifests, expected_pngs in ((2, 8, 532), (3, 8, 552), (4, 11, 661)):
        folder = ROOT / f"world{world}"
        manifests = sorted(folder.rglob("manifest.json" if world == 3 else "*.manifest.json"))
        pngs = set(folder.rglob("*.png"))
        if (len(manifests), len(pngs)) != (expected_manifests, expected_pngs):
            raise ValueError(f"{folder}: expected {(expected_manifests, expected_pngs)}, found {(len(manifests), len(pngs))}")
        if len({path.relative_to(folder).as_posix().casefold() for path in pngs}) != len(pngs):
            raise ValueError(f"{folder}: case-insensitive resource path collision")
        references = set()
        for path in manifests:
            manifest = json.loads(path.read_text())
            effects = manifest.get("effects", {})
            sequences = manifest["states"] | (effects if isinstance(effects, dict) else {})
            for name, sequence in sequences.items():
                frames = sequence["frames"]
                durations = sequence.get("frame_durations_ms")
                if not frames or not sequence["fps"] > 0 or (
                    durations is not None and (len(durations) != len(frames) or min(durations) <= 0)
                ):
                    raise ValueError(f"{path}:{name}: invalid sequence timing")
                for frame in frames:
                    relative = Path(frame)
                    resolved = path.parent / (relative.name if world == 2 else relative)
                    if resolved not in pngs:
                        raise ValueError(f"{path}:{name}: missing {frame}")
                    references.add(resolved)
        for path in pngs:
            with Image.open(path) as image:
                image.verify()
        extras = sorted(path.relative_to(folder).as_posix() for path in pngs - references)
        if world == 4:
            phase_layers = {"warforge_armored_shutters", "warforge_overload_shutters"}
            phase_layers.update(f"warforge_core_pulse_{index:02d}" for index in range(8))
            for name in phase_layers:
                if folder / "phase_layers" / (name + ".png") not in pngs:
                    raise ValueError(f"Missing Warforge phase layer {name}")
            schedule = folder / "attack_timing.candidate.json"
            timing = json.loads(schedule.read_text())["sequences"]
            if len(timing) != 15:
                raise ValueError(f"{schedule}: expected 15 authored attack schedules")
            for item in timing:
                state = json.loads((folder / (item["character"] + ".manifest.json")).read_text())["states"][item["sequence"]]
                durations = item["frame_durations_ms"]
                if (state["frame_durations_ms"] != durations or
                    sum(durations[:item["active_frame"]]) != item["active_time_ms"] or
                    sum(durations) != item["total_time_ms"]):
                    raise ValueError(f"{item['character']}/{item['sequence']}: authored schedule disagrees with manifest")
        if bundle is not None:
            for path in sorted(pngs | set(manifests)):
                resource = bundle / "enemies" / path.relative_to(ROOT)
                if not resource.is_file() or sha256(path) != sha256(resource):
                    raise ValueError(f"{resource}: missing or differs from approved source")
        summary[f"world{world}"] = dict(manifests=len(manifests), pngs=len(pngs),
                                     referenced_pngs=len(references), extra_pngs=extras)
    return summary


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--bundle", type=Path)
    args = parser.parse_args()
    print(json.dumps(verify(args.bundle), indent=2))
