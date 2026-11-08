[← Issue queue](../README.md)

# Archived issues

The issues that are done, moved here by `harness plan summary`. Do not read this index to find work: the open issues are in the [issue queue](../README.md).
It is read to find out whether a new report is a problem that was fixed already.

<!-- issue-queue:start -->
| Issue | Title | Area | SP | Reported |
| ----- | ----- | ---- | -- | -------- |
| [I-1](./I-1.md) | The framework's tests that `harness sync` copies fail in a pinned project | bootstrap and sync | 2 | [issue 30](https://github.com/AndLD/harness-framework/issues/30) |
| [I-2](./I-2.md) | `migrate` counts a project that an older `sync` updated as `0.1.0` | bootstrap and sync | 2 | [issue 61](https://github.com/AndLD/harness-framework/issues/61) |
| [I-3](./I-3.md) | The migration adds the folders of the new plan layout to the layer map of a project with its own layers | profile file | 3 | [issue 62](https://github.com/AndLD/harness-framework/issues/62) |
| [I-4](./I-4.md) | The migration keeps a task that a branch claims, though it is still ⬜ | plan format | 2 | [issue 63](https://github.com/AndLD/harness-framework/issues/63) |
| [I-5](./I-5.md) | A probe table of the older shape fails `check probes` without saying which columns it expects, and the note does not list the action | checks | 2 | [issue 64](https://github.com/AndLD/harness-framework/issues/64) |
| [I-7](./I-7.md) | `harness branch update` left merge conflict markers in a file it reported as resolved, and no check refuses them | Git rules | 2 | — |
| [I-8](./I-8.md) | A push from a linked worktree runs the gate's tests with the hook's `GIT_DIR`, and they rewrite the repository's Git config | Git rules | 2 | — |
| [I-9](./I-9.md) | A condition inside a line (`{{#if role}}…{{/if}}`) is left unrendered in the generated skills | procedures | 2 | — |
| [I-10](./I-10.md) | A flow continued from another account resumes a worker that account cannot find, and nothing falls back to a fresh one | runtime adapters | 3 | — |
| [I-11](./I-11.md) | a worker started on the command line has no permission to edit files or run commands, and the executor's means do not say how to give it | runtime adapters | 3 | — |
| [I-12](./I-12.md) | The migration of `0.3.0` writes prose into the release table's id column, leaves a skipped release as the next one, and leaves a prose order of phases without a message | bootstrap and sync | 3 | — |
| [I-13](./I-13.md) | The first `check all` after taking `0.3.0` fails on the new releases file and on a generic word of the core, and the notes say nothing of either or of the cost of the gate | checks | 2 | — |
| [I-14](./I-14.md) | `harness flow status` takes a consumer's pull request for a development version as the take of the final version it extends | checks | 1 | — |
| [I-15](./I-15.md) | The migration of `0.3.0` takes ids from a mere mention in the old words, and leaves a sentence broken where the old table stood | bootstrap and sync | 2 | — |
| [I-16](./I-16.md) | The notes of a development version and the migration say too little: the final note is not printed on a development-only path, a check is false after the next version, and the arrows action has no answer for phases no release holds | bootstrap and sync | 2 | — |
| [I-17](./I-17.md) | Pushing the tag of a release from the branch of the work fails the migration tests, and the procedure `release` does not say from which branch to push it | procedures | 1 | — |
| [I-18](./I-18.md) | A pull request that the update workflow brings up to date is left BLOCKED, because the required `pr-title` check of the new head never runs | checks | 2 | — |
| [I-19](./I-19.md) | The pre-push hook of a linked worktree runs the main checkout's tools, so it checks the worktree's generated files against the wrong `core/` | Git rules | 1 | — |
| [I-20](./I-20.md) | A flow cannot decide a change of the meaning of a contract at a level: it stops for the owner whatever the mode | procedures | 1 | — |
| [I-21](./I-21.md) | A flow cannot ask its workers for plain commands, which a strict permission mode would let through | procedures | 1 | — |
| [I-22](./I-22.md) | A bootstrap does not create the folder of the off-plan record | bootstrap and sync | 1 | — |
| [I-23](./I-23.md) | The take of a version names no services that the project's gate needs | procedures | 1 | — |
| [I-24](./I-24.md) | The tests fail on the tree that `harness release` leaves before its commit | checks | 1 | — |
| [I-25](./I-25.md) | The list of notes in `migrations/README.md` is written by hand and stops at `0.2.0` | bootstrap and sync | 1 | — |
| [I-26](./I-26.md) | `harness plan-write on` writes a settings file that the project's formatter rejects | runtime adapters | 1 | — |
| [I-27](./I-27.md) | A project cannot give its flows a default for the workers' permissions | plan format | 2 | — |
| [I-28](./I-28.md) | `harness flow status` reads a take that a later take superseded as not done | checks | 1 | — |
| [I-29](./I-29.md) | The usage gate does not know the plan `pro` in lower case | checks | 1 | — |
| [I-31](./I-31.md) | The node-ts quiet test commands do not reach Jest from a workspaces root, and two quiet defaults are missing | stack adapters | 1 | — |
| [I-32](./I-32.md) | `harness flow audit` misses the command-line workers of a flow | checks | 1 | — |
| [I-33](./I-33.md) | The migration tests take "the last release" from the newest tag, so they fail once a version is tagged | checks | 1 | — |
| [I-36](./I-36.md) | `harness flow status` reads a development take whose draft was closed as not done | checks | 1 | — |
<!-- issue-queue:end -->
