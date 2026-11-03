[← Harness review method]({{rel:documents.harnessReviews}})

# Harness review bindings

The values of the [harness review method]({{rel:documents.harnessReviews}}) for {{project.title}}: its layers, measurements, bounded
contexts, budgets and cold-start probes (section 4 of the method). The first harness review writes them; until then this file holds what the
tools already know.

- **Values:** the [project profile]({{rel:paths.profileDocument}}), with the term lists of the CORE scan (its section 9).
- **Checks:** `{{commands.docsCheck}}` runs every check of the framework.
- **Reports:** one dated file per review next to this one, from the report template of the method.

{{#if layers}}
## Layers

<!-- harness:begin layers -->
<!-- harness:end layers -->
{{/if}}

## Cold-start probes

<!-- The probes of this project. Each names the areas it exercises (the areas of the framework's migration notes; `harness check probes` holds the names), so that a version taken later reruns the probes it touches (`harness probes <from> <to>`). The first harness review writes the words each read. -->

| Probe | Scenario | Areas | Words read at the last review |
| ----- | -------- | ----- | ----------------------------- |
| P1 | Start the next task of the plan | entry rules, Git rules, plan format, procedures | — |
| P2 | Resume a phase or a task that a session left | plan format, procedures, engineering method | — |
| P3 | Open the pull request for a finished branch | Git rules, procedures, host adapters | — |
| P4 | Take the newest version of the framework | bootstrap and sync, profile file, templates and scaffold, checks | — |
