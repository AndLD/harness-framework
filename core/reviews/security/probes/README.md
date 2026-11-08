[← Security review method](../README.md)

# The catalogue of probes

**First edition (2026-11-08), and a draft.** It was researched from the named sources by agents, not by a security specialist. It stays a draft until a person with security expertise has reviewed it, and the review log of the project's bindings records who did. It is a starting point: a probe that passes does not prove the project safe, and a weakness that no probe names is still a finding (section 9 of the method says how the catalogue grows).

Each probe has the format of section 3 of the method. The files of S5 and S6 and the playbooks of `scenarios/` come with a later edition of the catalogue.

| Dimension | File | Probes | Scriptable | Judged | Manual |
| --------- | ---- | ------ | ---------- | ------ | ------ |
| S1 Secrets | [S1-secrets.md](./S1-secrets.md) | 21 | 6 | 13 | 2 |
| S2 Dependencies and supply chain | [S2-dependencies-supply-chain.md](./S2-dependencies-supply-chain.md) | 22 | 8 | 12 | 2 |
| S3 CI and the repository host | [S3-ci-repository-host.md](./S3-ci-repository-host.md) | 22 | 8 | 9 | 5 |
| S4 Agent harness | [S4-agent-harness.md](./S4-agent-harness.md) | 25 | 3 | 20 | 2 |

## Project traits

The value `project: <trait>` of the field Applies names what a project has. Several traits mean that the probe applies when the project has all of them. The reviewer decides each from the repository and lists in the report what it found.

| Trait | The project … |
| ----- | ------------- |
| agent-runtime | is worked on by an AI coding agent |
| auto-merge | merges by auto-merge, a queue or a bot |
| builds-artifacts | builds container images or release archives |
| ci | has a CI |
| consumes-provenance | fetches artifacts that carry a signature or provenance |
| dependencies | has dependencies of a package manager |
| deploys | has deployment manifests or infrastructure as code |
| environment-file | reads environment variables from a file |
| fetches-tools | downloads tools at run time |
| holds-secrets | has at least one secret of its own |
| hooks | ships hooks of its agent runtime |
| host-push-protection | is on a host that can block pushes that hold secrets |
| multi-agent | delegates to subagents or several agents |
| outside-contributions | takes pull requests from forks or outside collaborators |
| past-secret-finding | has ever found a secret in its repository |
| private-packages | uses private packages or a private registry |
| releases | publishes a package, an image or tagged releases |
| self-hosted-runners | runs CI on its own runners |
| tool-servers | connects its agents to tool servers |
| unattended-agent | starts an agent from CI or another automation |
| vendored | keeps a vendored or synced copy of a framework or a tool tree |

## Host and runtime

A probe names what to look at in terms that fit any host and any agent runtime. The name of the feature on a given tool, and the pages of its documentation that the source ids `HOST-DOCS` and `RUNTIME-DOCS` stand for, are in a file `security.md` in the folder of the adapter. Where an adapter has no such file, the reviewer reads the documentation of the tool, and says so in the report's section on the method.

## How the sources were used

The text of a source is summarized and cited by its id, never copied. Each dimension's file ends with the table of its sources. A date beside a citation is the last day that source was read for that probe. The NIST framework is cited in its final version, and the changes of its draft revision were read.
