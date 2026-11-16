"""Actual material/source/bundle inputs, not rendered gameplay approval."""
import hashlib
import json
from pathlib import Path
import unittest
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]


class MaterialTests(unittest.TestCase):
    def test_authored_source_provenance_and_all_periodic_edges(self):
        manifest = json.loads((ROOT/'docs/build338/ground-provenance.json').read_text())
        self.assertEqual(hashlib.sha256((ROOT/manifest['source']).read_bytes()).hexdigest(), manifest['source_sha256'])
        self.assertEqual(manifest['pixels_per_world_point'],2)
        for theme in ['outpost','swamp','caves','sanctuary']:
            images=[]
            for variant in range(4):
                name=f'build338_ground_{theme}_{variant}'
                folder=ROOT/f'OutpostZero/Assets.xcassets/{name}.imageset'
                p=folder/f'{name}.png'
                image=Image.open(p).convert('RGBA');image.load()
                self.assertEqual(image.size,(1024,1024))
                self.assertEqual(image.getchannel('A').getextrema(),(255,255))
                self.assertEqual(json.loads((folder/'Contents.json').read_text())['images'][0]['filename'],p.name)
                self.assertEqual(image.crop((0,0,1,1024)).tobytes(),image.crop((1023,0,1024,1024)).tobytes())
                self.assertEqual(image.crop((0,0,1024,1)).tobytes(),image.crop((0,1023,1024,1024)).tobytes())
                images.append(image)
            for image in images[1:]:
                for box in [(0,0,24,1024),(1000,0,1024,1024),(0,0,1024,24),(0,1000,1024,1024)]:
                    self.assertEqual(image.crop(box).tobytes(),images[0].crop(box).tobytes())
            self.assertEqual(len({hashlib.sha256(im.tobytes()).hexdigest() for im in images}),4)

    def test_portal_preserves_approved_pixels_and_has_no_rectangular_overlays(self):
        source=ROOT/'OutpostZero/ArtAssets/outpost_zero_portal_approved_transparent.png'
        # Hash recorded directly from the latest-main approval baseline.
        reference=json.loads((ROOT/'docs/build338/approved-assets.json').read_text())
        self.assertEqual(hashlib.sha256(source.read_bytes()).hexdigest(),reference['portal_sha256'])
        renderer=(ROOT/'OutpostZero/WorldOneEnvironment.swift').read_text()
        for old in ['portalWallJamb','portalWallLintel','portalWallMortar']:
            self.assertNotIn(old,renderer)
        self.assertIn('124*ratio',renderer)
        self.assertIn('portalRecessEnergy',renderer)
