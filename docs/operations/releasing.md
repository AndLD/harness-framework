[← README](../../README.md)

# Releasing

How a version of harness-framework is cut. The rules are the Git rules of the [entry file](../../AGENTS.md) (release and hotfix
branches, merge commits, the owner's approval of each merge); this guide is the order of the steps.

1. Branch `release/<x.y.z>` from the integration branch (a hotfix: `hotfix/<x.y.z>` from the production branch).
2. Run `harness release --dry-run`, then `harness release`: it sets the version of the version files and moves the changelog fragments into
   the [changelog](../../CHANGELOG.md) under the version.
3. Run `npm run docs:check`, `npm run lint` and `npm run test:coverage`, commit, and open the pull request into the production
   branch; after it is merged, merge the production branch back into the integration branch by a second pull request.
4. Tag the merge commit on the production branch `v<x.y.z>`; the host's release workflow publishes the changelog section of the version.
