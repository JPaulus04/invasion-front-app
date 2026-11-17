import copy
import unittest
from scripts.release338_evidence import SOURCE, RUN, MISSING, ACCEPTANCE, validate_evidence

class Release338EvidenceTests(unittest.TestCase):
    def setUp(self):
        self.run={'id':RUN,'head_sha':SOURCE,'status':'completed','conclusion':'failure','path':'.github/workflows/ios-build.yml'}
        names=['build','simulator-review','defense-visual-review','Focused gameplay presentation']
        names += [f'phase4-gameplay / Fresh World 1 — {p} seed {s} batch {b}' for p,s in [('stationary',335),('moving',335),('moving',336)] for b in [2,4]]
        self.jobs=[{'name':n,'conclusion':'failure' if n==MISSING else 'success'} for n in names]
        self.jobs.append({'name':ACCEPTANCE,'conclusion':'failure'})
    def test_only_reviewed_gap_accepted(self):
        validate_evidence(self.run,self.jobs)
    def test_changed_source_rejected(self):
        self.run['head_sha']='different'
        with self.assertRaises(AssertionError):validate_evidence(self.run,self.jobs)
    def test_compile_failure_rejected(self):
        self.jobs[0]['conclusion']='failure'
        with self.assertRaises(AssertionError):validate_evidence(self.run,self.jobs)
    def test_other_missing_replay_rejected(self):
        self.jobs[-2]['conclusion']='cancelled'
        with self.assertRaises(AssertionError):validate_evidence(self.run,self.jobs)
    def test_missing_visual_review_rejected(self):
        self.jobs.pop(1)
        with self.assertRaises(AssertionError):validate_evidence(self.run,self.jobs)
    def test_different_run_rejected(self):
        self.run['id']=123
        with self.assertRaises(AssertionError):validate_evidence(self.run,self.jobs)
