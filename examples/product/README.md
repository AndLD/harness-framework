[← README](../../README.md)

# Orbit Notes — product specification

What Orbit Notes is and does, written as decisions that hold however it is built. This folder is the **product knowledge**: it names no tool, no
plan task and no source path (the documentation check holds that), and it shows no build status. The plan tracks what is built, the engineering
documents say how, and this folder says what and why.

Orbit Notes is a shared notes service. A person writes **notes** in a **notebook**, shares the notebook with a **team**, and finds a note again by search.

| Document | What it holds |
| -------- | ------------- |
| [Notes](./notes.md) | writing and editing a note, and its history |
| [Sharing](./sharing.md) | teams, who may read or write a notebook, and links |
| [Search](./search.md) | finding notes |
| [Glossary](./glossary.md) | one row per concept: the term, its name in code, its aliases, its definition |
| [Open questions](./open-questions.md) | the register of what is undecided; a question is cited as `Q<n>` (its number) where it matters |
| [Backlog](./backlog.md) | ideas and wishes that no plan holds yet |

## Writing the specification

- **One file per bounded context**, next to this index, with a row for it in the table above. A context is a part of the product that has its own words.
- **Decisions, not status.** Write what the product does. Do not write what is built, planned or finished; a line that cannot be decided yet is
  a question in the register, and the line cites it by its number.
- **One word, one meaning.** A concept is defined once, in the glossary, and every file uses that word. A term set in bold in two files must be in the glossary.
- **Link, do not copy.** A fact has one home; the other files link to it.
