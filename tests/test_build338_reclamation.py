import hashlib
import json
from pathlib import Path
import unittest
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]


class ReclamationTests(unittest.TestCase):
    def test_authored_provenance_alpha_and_fixed_scale(self):
        manifest=json.loads((ROOT/'docs/build338/polish/reclamation-provenance.json').read_text())
        self.assertEqual(manifest['pixels_per_world_point'],2)
        self.assertEqual(manifest['texture_pixels']/manifest['world_size'],2)
        self.assertEqual(len(manifest['outputs']),8)
        for source,digest in manifest['inputs_sha256'].items():
            self.assertEqual(hashlib.sha256((ROOT/source).read_bytes()).hexdigest(),digest)
        for item in manifest['outputs']:
            folder=ROOT/f"OutpostZero/Assets.xcassets/{item['asset']}.imageset"
            path=folder/(item['asset']+'.png')
            self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(),item['sha256'])
            image=Image.open(path).convert('RGBA');self.assertEqual(image.size,(512,512))
            alpha=image.getchannel('A');self.assertEqual(alpha.getextrema(),(0,255))
            self.assertGreater(len(set(alpha.getdata())),100)
            for box in [(0,0,512,1),(0,511,512,512),(0,0,1,512),(511,0,512,512)]:
                self.assertEqual(alpha.crop(box).getextrema(),(0,0))
            self.assertEqual(json.loads((folder/'Contents.json').read_text())['images'][0]['filename'],path.name)

    def test_approved_paving_and_portal_unchanged(self):
        approved=json.loads((ROOT/'docs/build338/polish/approved-inputs.json').read_text())
        for name,digest in approved.items():
            self.assertEqual(hashlib.sha256((ROOT/name).read_bytes()).hexdigest(),digest,
                             f'Approved asset changed: {name}')
