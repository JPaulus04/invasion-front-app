"""Audit real uploads rather than generate substitute animation artwork."""
import importlib.util
import json
from pathlib import Path
import unittest
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('audit339',ROOT/'scripts/audit_build339_animations.py')
audit=importlib.util.module_from_spec(spec);spec.loader.exec_module(audit)
class Build339Tests(unittest.TestCase):
    def test_all_uploaded_frames_are_unchanged_and_reviewed(self):
        self.assertEqual(audit.audit(),json.loads((ROOT/'docs/build339/asset-inventory.json').read_text()))
    def test_defective_exports_have_explicit_whole_clip_fallbacks(self):
        a=audit.audit();self.assertEqual(a['quarantined'],44)
        self.assertFalse(any(f['quarantined'] for f in a['frames'] if f['character']=='specter'))
        self.assertEqual(sum(f['state']=='victory' for f in a['frames']),24)
        self.assertTrue(all(f['state'] not in ['idle','run'] for f in a['frames'] if f['quarantined']))
