[← README](../README.md)

# Migration notes

One note for every version of the framework from `0.1.1` on: `migrations/<version>.md` says what a project that takes the version **from the previous one** must do. A project that skips versions reads the notes from its own version to the target, in order ([taking a version](../README.md#taking-a-version)).

A note holds what needs judgment (a project file that restates a changed rule, a choice the project makes). A change a tool can make is not written as an instruction: it is a migration script that the tool runs.

## Shape

Every note has the same title and sections, in this order (`harness release` checks them):

| Section | Holds |
| ------- | ----- |
| `# Migration to <version> from <previous version>` | the title |
| What changed for a project | the changes a project can feel, in a few lines each |
| Areas touched | written by `harness release`, between two markers, from the list below; never by hand |
| Required actions | what the project must do, each with the check that proves it is done |
| Optional actions | what it may do |
| How to verify | the commands that show the project is healthy on the new version |

A version that needs nothing from a project says so in its required actions.

## Scripts

A version may also ship `migrations/<version>.mjs`: the mechanical changes of the version (a moved file, a renamed profile key, a split phase) as code. `harness migrate` runs, with the tools of the target version, the scripts of every version after the project's own up to the target that the lock (`migrations.applied`) does not record, in version order, so a jump from `0.1.0` to `0.3.0` runs the scripts of every version in between. A lock without the record counts as `0.1.0` with nothing applied.

A script is `export default ({ root, profile }) => lines`, which may be async and returns the lines to print. It **checks its starting state** and does nothing when its work is done, because it can run twice (a run that stopped resumes, a lost record repeats it, and a development version runs the script of its final version, which the final version runs again). The script of a development version's final version is not recorded as applied until the final version itself. Run in the framework's own repository (mode `self`) or in a detached project, `migrate` only regenerates the managed files.

The **migration test** (`tests/migration/`) bootstraps a project from every released tag with the tools of that tag, takes the current tree with the project's own `sync`, runs `migrate` and requires `harness check all` to pass; a script that breaks a project of any earlier version fails it.

## Areas

`areas.json` is the fixed list of areas (entry rules, Git rules, plan format, procedures, review method, adapter contract, and the others) with the globs that belong to each. `harness release` lists in a note the areas whose files changed in `core/`, `tools/`, `adapters/` and `profile/` since the tag of the previous release. A changed file that belongs to no area stops the release until the list is extended, so the list stays complete. The probes of a project are matched to the areas.

## The notes

- [0.1.1](./0.1.1.md)
