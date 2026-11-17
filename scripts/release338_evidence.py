"""Build-338-only acceptance of the owner's reviewed simulator infrastructure gap."""
import json
import os
from pathlib import Path
import subprocess
import urllib.request

SOURCE = '4e5d4494d45e389c88a038c03e61c6358b6c1dc3'
RUN = 43994798717
ALLOWED = {'.github/workflows/testflight.yml', '.github/workflows/ios-build.yml',
           'scripts/release338_evidence.py', 'scripts/release338_preflight.js',
           'scripts/verify_build338_bundle.py', 'tests/test_release338_evidence.py',
           'docs/build338/RELEASE.md'}
MISSING = 'phase4-gameplay / Fresh World 1 — moving seed 335 batch 2'
ACCEPTANCE = 'phase4-gameplay / Assess World 1 gameplay outcomes'

def validate_evidence(run, jobs):
    assert run['head_sha'] == SOURCE and run['status'] == 'completed'
    assert run['id'] == RUN and run['conclusion'] == 'failure'
    assert run['path'] == '.github/workflows/ios-build.yml'
    required = {'build', 'simulator-review', 'defense-visual-review',
                'Focused gameplay presentation'}
    required.update(f'phase4-gameplay / Fresh World 1 — {profile} seed {seed} batch {batch}'
                    for profile, seed in [('stationary', 335), ('moving', 335), ('moving', 336)]
                    for batch in [2, 4])
    required.remove(MISSING)
    status = {j['name']: j['conclusion'] for j in jobs}
    assert all(status.get(name) == 'success' for name in required), status
    failed = {j['name'] for j in jobs if j['conclusion'] not in ('success', 'skipped')}
    assert failed == {MISSING, ACCEPTANCE}, failed
    assert status[MISSING] == status[ACCEPTANCE] == 'failure'

def main():
    assert os.environ['RELEASE_BUILD_NUMBER'] == '338', 'Exception is only for build 338'
    assert os.environ['GITHUB_REF'] == 'refs/heads/main'
    repo, sha = os.environ['GITHUB_REPOSITORY'], os.environ['GITHUB_SHA']
    def get(path):
        request = urllib.request.Request('https://api.github.com/repos/'+repo+'/'+path,
            headers={'Authorization': 'Bearer '+os.environ['GITHUB_TOKEN'],
                     'Accept': 'application/vnd.github+json'})
        with urllib.request.urlopen(request, timeout=35) as response:
            return json.load(response)
    assert get('branches/main')['commit']['sha'] == sha, 'main moved'
    subprocess.run(['git', 'merge-base', '--is-ancestor', SOURCE, sha], check=True)
    changed = set(subprocess.check_output(['git', 'diff', '--name-only', SOURCE, sha], text=True).splitlines())
    assert changed <= ALLOWED, 'Unvalidated source changes: '+repr(changed-ALLOWED)
    assert subprocess.check_output(['git','rev-parse',sha+':OutpostZero'],text=True) == subprocess.check_output(['git','rev-parse',SOURCE+':OutpostZero'],text=True)
    run = get(f'actions/runs/{RUN}')
    jobs = get(f'actions/runs/{RUN}/jobs?per_page=100')['jobs']
    validate_evidence(run, jobs)
    report = {'release_source_sha':sha, 'approved_source_sha':SOURCE, 'evidence_run':RUN,
              'application_tree':subprocess.check_output(['git','rev-parse',sha+':OutpostZero'],text=True).strip(),
              'accepted_gap':MISSING+' failed during boot before app launch; owner accepted for device testing',
              'full_campaign_pass':False}
    Path('release338-source.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report,indent=2))
if __name__ == '__main__':
    main()
