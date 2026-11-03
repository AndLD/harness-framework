---
name: A word found in core
about: The CORE scan of a project reports a word in the framework's core/
title: 'core: "<word>" in <file>'
labels: ['defect', 'core-scan']
---

<!-- `harness check core` of a project that uses the framework scans the vendored core/ with the project's own terms. An ordinary word is answered in the project (terms.productGeneric); a product, tool or project word that names something real is a leak, and this is where to report it. -->

**Framework version** (`version` in `harness.lock.json`):

**File, line and word** (as `harness check core` prints them):

**The line** (copy it):

**What the word is** (pick one):

- [ ] a product or project word of mine that the framework's core should not hold
- [ ] a tool, stack, runtime or host name
- [ ] an ordinary word that I think the core uses on purpose (I added it to `terms.productGeneric`; it may belong in `core/vocabulary.json`)

**Recorded in the project** (`terms.exceptions` of the profile file holds this hit for the version above, until the fix arrives):

- [ ] yes
- [ ] no
