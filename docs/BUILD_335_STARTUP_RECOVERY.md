# Build 335: simulator startup recovery

## Diagnosis of run 43417058233

The failed moving/335/batch-4 jobs used different disposable device UUIDs and different hosted workers. Both workers had macOS 15.8.2, macos-15-arm64 image 20261104.0514.1 and Xcode 16.4. The successful moving cases used the same image and exact executable. No prior app data was reused: create, boot, bootstatus, install and launch preceded shutdown/delete on the owned device only.

| Job | Discovery | Initial launch | Result |
|---|---:|---:|---|
| Moving 335/4, attempt 1, 131862746819 | ~74s | 90s timeout | Empty app stdout/stderr, no PID reply or QA marker |
| Moving 335/4, attempt 2, 131873724068 | ~85s | 90s timeout | Same absence of app output/PID/marker |
| Moving 335/2, 131862747140 | ~36s | ~34s | PID 4627; actual Room 20 completion |
| Moving 336/4, 131862746875 | ~4s | ~7s | PID 2172; actual Room 20 completion |

Bootstatus reported migration and system-app readiness complete in both failed launches. Installation returned successfully. The old runner did not inspect bundle registration or capture launchctl/process/crash state before deleting the device. Empty logs therefore do not prove an app never existed; the underlying launch-service versus app-startup cause cannot be recovered conclusively from the old evidence. Cold host/service latency is a plausible contributor, not an established sole cause. Mocked unit-test timeout warnings earlier in job logs are not actual simulator failures.

## Recovery boundary

There are at most two fresh disposable devices per runner invocation. The existing bounded discovery handling remains. Boot (60s command, 240s readiness, 30s process-control probe), installation (150s plus 30s bundle-container resolution) and initial launch are the only recoverable phases. Each initial launch has a 120s client bound plus up to 60s waiting for late QA evidence on the same process. A failed client does not itself justify another launch.

Any QA/config/replay/terminal marker latches that device into observation, including wrong configuration and real defeat. Partial app output, an acknowledged launch without a marker, crash reports, a live app or unknown process state forbids recovery. After an unacknowledged empty launch failure, read-only device, launchctl, host-process and unified-log probes (20s each) plus new app crash reports are retained. Recovery requires successful process probes showing no app, no crash evidence and empty app logs. Shutdown/delete must both return successfully, then logs are rechecked for late output before creating the second device. A cleanup failure forbids recovery. Existing campaign evidence cannot be overwritten by invoking the runner again at the same output path.

All attempt logs, diagnostics, UUIDs, launch-client timing/reply and the recovery ledger are uploaded. Gameplay observation, terminal validation and the original seeded replay analyzer have no retry path. Balance, driver policy, seeds, fixed ticks and acceptance functions are unchanged.

## Focused native validation

Dispatch the existing iOS workflow on the PR branch with `validation_scope=startup-recovery`. This scope executes the focused recovery job without compilation, visual fixtures or repeating completed campaigns. The startup-only commit uses GitHub's `[skip ci]` directive to avoid an automatic full PR cycle; the explicit dispatch still runs. Normal full-workflow behavior and release checks remain in place.

The focused job downloads the exact executable and the five completed, predeclared case artifacts from run 43417058233. It rejects any app or acceptance-source changes since 05e81452924aa36eecb815f242df0ea791f4280d and checks executable SHA-256 308eb99a248d8d94656f9484ad3a0274906583f49abc6de87d53cc599bc15795. The app source remains the original tested PR merge b7da5a48c3db4114f5169cab5d60a5832c2027fd; the new harness SHA is recorded separately. It does not relabel the old binary as new source.

Only missing moving/335/batch-4 is run. Then the unchanged analyzer requires all six original cases, all original gameplay assertions, exact paired trace/terminal equivalence, and matching source, executable, architecture, OS, Xcode, device type and runtime. Historical defeats cannot be supplied for recovery. A real moving defeat or divergent trace remains a failure. This one-off mode is deliberately pinned to the original artifact IDs and is not a replacement for fresh validation after app changes. Artifact expiry or environment drift fails closed.

No merge or TestFlight upload is part of recovery.
