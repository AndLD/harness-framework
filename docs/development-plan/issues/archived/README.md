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
| [I-8](./I-8.md) | A push from a linked worktree runs the gate's tests with the hook's `GIT_DIR`, and they rewrite the repository's Git config | Git rules | 2 | — |
| [I-9](./I-9.md) | A condition inside a line (`{{#if role}}…{{/if}}`) is left unrendered in the generated skills | procedures | 2 | — |
| [I-10](./I-10.md) | A flow continued from another account resumes a worker that account cannot find, and nothing falls back to a fresh one | runtime adapters | 3 | — |
| [I-11](./I-11.md) | a worker started on the command line has no permission to edit files or run commands, and the executor's means do not say how to give it | runtime adapters | 3 | — |
| [I-12](./I-12.md) | The migration of `0.3.0` writes prose into the release table's id column, leaves a skipped release as the next one, and leaves a prose order of phases without a message | bootstrap and sync | 3 | — |
| [I-13](./I-13.md) | The first `check all` after taking `0.3.0` fails on the new releases file and on a generic word of the core, and the notes say nothing of either or of the cost of the gate | checks | 2 | — |
| [I-15](./I-15.md) | The migration of `0.3.0` takes ids from a mere mention in the old words, and leaves a sentence broken where the old table stood | bootstrap and sync | 2 | — |
<!-- issue-queue:end -->
