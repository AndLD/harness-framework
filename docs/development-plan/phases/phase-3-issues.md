[← Development plan](../README.md)

# Phase 3 — Issues and stabilization (9 SP, grows as issues are added)

**Status:** ⬜ Not started · **Work log:** [phase-3-log](./work-logs/phase-3-log.md)

The open-ended phase: a defect or an improvement found in use becomes a task of this phase (the Git rules of the entry file), and its size
grows with its tasks. The planned phases of the project get files of their own next to this one.

| #   | Task | Agent | SP  | Status |
| --- | ---- | ----- | --- | ------ |
| 3.1 | **`repository.url` is not filled by the bootstrap**: a new project's profile has the slug but no web address, so `harness release` writes `undefined` into the compare and tag links of the changelog (found cutting `0.1.0`; worked around in this repository's own profile). The host adapter gives the address from the slug and the host; a test bootstraps a project and releases it. | C1 | 1 | ⬜ |
| 3.2 | **A new Python project is red in CI until `uv.lock` exists**: the scaffold cannot write a lock file, and `mypy .` exits 2 on a project with no Python file. Say so in the next steps of the bootstrap and in the project's stack file, or scaffold a first module that makes both pass (found in the proof, 1.3 and 1.5). | C1 | 1 | ⬜ |
| 3.3 | **The command line and the runtime hooks do nothing, with exit code 0, when started through a symbolic link**: `process.argv[1]` is the link and `import.meta.filename` the real path, so `resolve(process.argv[1]) === resolve(import.meta.filename)` is false in `tools/harness.mjs` and in each runtime hook. A project under a linked path would have its hooks switched off without a message. Compare real paths (`realpathSync`) in all of them. Verified by a test that runs the command line and a hook through a link. Found by the conformance suite in task 17.14 of the project this framework was extracted from. | C1 | 2 | ⬜ |
| 3.4 | **Adapters of a project's own repository (`local:`)**: design §5 step 1 says a project that cannot wait for a release keeps an adapter in `harness-adapters/<axis>/<name>/` and names it `local:…` in the profile file; the tools load only the adapters of the framework tree. Build it (the loader, the sync, the conformance suite on a local path), or remove the sentence from the design, the new-adapter guide and the procedure; the owner decides first. Verified by a project with one local adapter that passes `harness adapter test` and `harness check all`. | C2 | 3 | ⬜ |
| 3.5 | **`harness sync` generates the managed files with the tools of the old version**: after a sync to a new version `harness check generated` can still fail (a stale skill) until `harness sync --local` runs again, because the first run generates with the tools already in memory. Re-run the generation with the synced tools, or run the second step inside `sync`. Verified by a test that syncs a project from one version to a next in which a procedure changed, and passes `check generated` after one command. Found in task 17.16 of the project this framework was extracted from. | C2 | 2 | ⬜ |

Task status: ⬜ not started · 🟡 in progress (branch noted in the work log) · ✅ done.

**Exit criteria:** none; the phase stays open.

## Implementation log

Printed from the merged pull requests by `harness plan log 3` (every squash commit carries a `Plan: <task id>` line).
