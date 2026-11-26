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

    def test_device_feedback_routes_and_preview(self):
        source = (ROOT / "OutpostZero" / "OutpostScene.swift").read_text()
        hub = source.split("let islandAssets:", 1)[1].split("overlayText((unlocked", 1)[0]
        for mapping in ('0: "world_forest_island"', '1: "world_toxic_island"', '2: "world_iron_island"', '3: "world_ice_island"'):
            self.assertIn(mapping, hub)
        self.assertIn("productionImage(named: assetName)", hub)
        self.assertIn("dimensions.width*factor, height: dimensions.height*factor", hub)
        self.assertGreater(hub.index("WorldShowcase.island"), hub.index("} else {"))
        preview = source.split('"-previewDimensionalHazards"', 1)[1].split("#endif", 1)[0]
        self.assertIn("DimensionalLiquidPreview.install", preview)
        self.assertIn("acidVisualNodes.append(shape)", preview)
        self.assertIn("DimensionalLiquidPreview.updateAcid", source)
        renderer = (ROOT / "OutpostZero" / "WorldOneEnvironment.swift").read_text()
        liquid = renderer.split("enum DimensionalLiquidPreview", 1)[1]
        self.assertIn("patch.outlinePath()", liquid)
        self.assertIn("cg.clip()", liquid)
        self.assertIn("format.opaque = false", liquid)
        self.assertIn("768/max(w,h)", liquid)
        self.assertNotIn("physicsBody", liquid)

    def test_hazard_review_requires_real_preview_nodes(self):
        source = (ROOT / "OutpostZero" / "OutpostScene.swift").read_text()
        fixture = source.split("private func captureBuild342Hazards", 1)[1].split("private func prepareBuild341StonebackLive", 1)[0]
        self.assertIn("Requested dimensional liquid did not load", fixture)
        self.assertIn("patch.outlinePath().boundingBoxOfPath", fixture)
        self.assertIn("DimensionalLiquidPreview.updateAcid", fixture)
        self.assertIn("[BUILD342 HAZARDS]", fixture)
        script = (ROOT / "scripts" / "check_build342_hazards.py").read_text()
        for name in ("2-1-legacy", "2-1-idle", "2-1-active", "2-30-active", "3-1-water", "4-1-water"):
            self.assertIn(name, script)
        self.assertIn("Human visual comparison still required", script)
