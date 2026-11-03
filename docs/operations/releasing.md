[← README](../../README.md)

# Releasing

How a version of harness-framework is cut. The rules are the Git rules of the [entry file](../../AGENTS.md) (release and hotfix
branches, merge commits, the owner's approval of each merge); this guide is the order of the steps.

1. Branch `release/<x.y.z>` from the integration branch (a hotfix: `hotfix/<x.y.z>` from the production branch).
2. Cut a development version first: on the release branch run `harness release --dev` (it sets `<x.y.z>-dev.<n>` in the version files and leaves the changelog and its fragments), commit it as `chore(release): <x.y.z>-dev.<n>`, and tag the commit `v<x.y.z>-dev.<n>`. A project that uses the framework syncs the tag (`harness sync --to <x.y.z>-dev.<n>`) and runs `harness check all` before the final tag exists, which is how a word of its own that reached `core/` is found. A fix goes on the release branch and gets the next development version.
3. Run `harness release --dry-run`, then `harness release`: it sets the version of the version files and moves the changelog fragments into
   the [changelog](../../CHANGELOG.md) under the version.
4. Run `npm run docs:check`, `npm run lint` and `npm run test:coverage`, commit, and open the pull request into the production
   branch; after it is merged, merge the production branch back into the integration branch by a second pull request.
5. Tag the merge commit on the production branch `v<x.y.z>`; the host's release workflow publishes the changelog section of the version.
