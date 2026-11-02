[← Harness review method](../../../core/reviews/harness/README.md)

# Harness review bindings

The values of the [harness review method](../../../core/reviews/harness/README.md) for harness-framework: its layers, measurements, bounded
contexts, budgets and cold-start probes (section 4 of the method). The first harness review writes them; until then this file holds what the
tools already know.

- **Values:** the [project profile](../../profile.md), with the term lists of the CORE scan (its section 9).
- **Checks:** `npm run docs:check` runs every check of the framework.
- **Reports:** one dated file per review next to this one, from the report template of the method.

## Layers

<!-- harness:begin layers -->
| Layer | Files and sections |
| ----- | ------------------ |
| **CORE** | `AGENTS.md` (the managed blocks non-negotiables, git-rules), `harness/**` (the vendored copy) |
| **DOMAIN** | – |
| **ADAPTER** | `docs/engineering/**`, `docs/operations/**`, `.github/**`, `.claude/**`, `scripts/**` |
| **PROFILE** | `harness-profile.json`, `harness.lock.json`, `docs/profile.md`, `**/bindings.md` |
| **STATE** | `docs/development-plan/**`, `docs/design.md`, `docs/quality-reviews/harness/20*.md`, `CHANGELOG.md`, `changelog.d/**` |
| **ENTRY** | `AGENTS.md`, `CLAUDE.md`, `README.md` |

Not in the map: nothing.
The map covers the tracked files that match `AGENTS.md`, `CLAUDE.md`, `README.md`, `CHANGELOG.md`, `changelog.d/**`, `docs/**`, `.github/**`, `.claude/**`, `scripts/**`, `harness-profile.json`, `harness.lock.json`.
<!-- harness:end layers -->
