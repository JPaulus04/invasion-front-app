"""Guard the retired World 1 procedural scenery paths; keep later biomes live."""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]

class EnvironmentLegacyCleanupTests(unittest.TestCase):
    def test_unreachable_forest_dressing_is_retired(self):
        source = (ROOT / "OutpostZero" / "OutpostScene.swift").read_text()
        scenery = source.split("private func updateZoneScenery(_ requestedZone: Int) {", 1)[1].split("private func productionImage", 1)[0]
        self.assertIn("WorldOneEnvironment.make", scenery)
        self.assertIn("return\n        }", scenery)
        for retired in ("forestPineTexture", "addForestUndergrowth", "guardianClearingTree"):
            self.assertNotIn(retired, source)
        self.assertNotIn("zone == 0", scenery)
        self.assertIn("selectedWorld.biome == 1 ? max(1, requestedZone) : max(2, requestedZone)", scenery)
        for live in ("addToxicEdgeProp", "FrostFloorArt.texture", "addFloodedEdgeProp", "scrapyardFloorDetail"):
            self.assertIn(live, scenery)

    def test_retired_undergrowth_not_shipped_or_required(self):
        self.assertFalse((ROOT / "OutpostZero/ArtAssets/forest_undergrowth_polished.png").exists())
        workflow = (ROOT / ".github" / "workflows" / "ios-build.yml").read_text()
        self.assertNotIn("forest_undergrowth_polished.png", workflow)

    def test_forest_uses_shared_visual_primitives(self):
        source = (ROOT / "OutpostZero" / "WorldOneEnvironment.swift").read_text()
        shared, forest = source.split("enum WorldOneEnvironment {", 1)
        self.assertIn("enum AuthoredEnvironmentRenderer", shared)
        self.assertIn("AuthoredEnvironmentRenderer.tiledGround(", forest)
        self.assertIn("AuthoredEnvironmentRenderer.installGroundedProp(", forest)
        self.assertIn("plan.variant(column: column, row: row)", forest)
        self.assertIn("tile.anchorPoint = .zero", shared)
        self.assertIn("ground.zPosition = -18", shared)
        self.assertIn("sprite.anchorPoint = CGPoint(x: 0.5, y: anchorY)", shared)
        self.assertNotIn("physicsBody", shared)
        self.assertIn("static func installPortal", forest)
