"""Artifact reuse must not bypass source, binary or historical outcome checks."""
import hashlib
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import run_startup_recovery as recovery


class ArtifactReuseTests(unittest.TestCase):
    def test_app_or_acceptance_source_changes_require_fresh_full_validation(self):
        for changed in ('OutpostZero/OutpostScene.swift', 'scripts/analyze_qa_replays.py',
                        'scripts/analyze_phase4_playtests.py', 'assets/new.png'):
            with self.subTest(changed=changed), patch.object(recovery.subprocess, 'check_output', return_value=changed):
                with self.assertRaisesRegex(ValueError, 'fresh full validation'):
                    recovery.verify(Path('baseline'))

    def test_wrong_binary_cannot_reuse_previous_evidence(self):
        with patch.object(recovery.subprocess, 'check_output', return_value=''), \
             patch.object(recovery.Path, 'read_bytes', return_value=b'wrong app'):
            with self.assertRaisesRegex(ValueError, 'Compiled app differs'):
                recovery.verify(Path('baseline'))

    def test_historical_defeat_cannot_be_selected_for_recovery(self):
        digest = hashlib.sha256(b'app').hexdigest()
        manifest = {'source': recovery.APP_SOURCE, 'app_sha256': digest}
        with patch.object(recovery.subprocess, 'check_output', return_value='scripts/simulator_startup.py'), \
             patch.object(recovery.Path, 'read_bytes', return_value=b'app'), \
             patch.object(recovery, 'APP_HASH', digest), \
             patch.object(recovery, 'evidence', return_value=(None, manifest, [])), \
             patch.object(recovery, 'assess', return_value={'passed': False}):
            with self.assertRaisesRegex(ValueError, 'cannot be retried'):
                recovery.verify(Path('baseline'))


if __name__ == '__main__':
    unittest.main()
