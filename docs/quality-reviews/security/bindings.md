[← Security review method](../../../core/reviews/security/README.md)

# Security review bindings

The values of the [security review method](../../../core/reviews/security/README.md) for harness-framework: what applies, the threat model, the scope of active tests, this
project's own probes and the review log. The first security review fills them; until then this file holds what the tools already know.

- **Values:** the [project profile](../../profile.md).
- **Reports:** one dated file per review next to this one, from the report template of the method.

## What applies

| Dimension or probe | Applies | Reason when it does not |
| ------------------ | ------- | ----------------------- |
| S1 to S4 | yes | — |
| S5 | no | the framework has no product runtime: it is a set of documents and a command-line tool that runs in a project's checkout |
| S6 | no | the framework is not deployed: nothing of it runs as a service, and it has no data of its own |

## Threat model

Not applicable (S5 and S6 do not apply).

## Scope of active tests

No scenario runs here: S5 and S6 do not apply, and the framework has no running system to test. Only the owner of the project widens this, before a run.

| Item | Value |
| ---- | ----- |
| Environments and their addresses | none |
| Accounts and data to use (test only) | none |
| Tools allowed | none |
| Out of scope | production, every system of a third party |
| Approved by, on | — |

## Private place for findings

The repository is public. The details of an open exploitable finding go to a private security advisory of the repository host (the method, section 7).

## Probes of this project

None yet.

## Review log

The catalogue of probes was reviewed by a person with security expertise: — (who, and when; until then it is a draft).

| Report | Type | Findings (🔴 / 🟠 / 🟡 / 🔵) |
| ------ | ---- | ---------------------------- |
