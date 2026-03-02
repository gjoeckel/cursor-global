# AGENT-STARTUP.md (per-project template)

Copy this into your project’s **resources** folder as `AGENT-STARTUP.md`. Keep it minimal (~50 lines); use for operational context, not full docs (see [AGENT-QUICKSTART](AGENT-QUICKSTART.md)).

---

## Purpose

One paragraph: what this project is and what the agent is helping with.

---

## Key paths

- **Development:** (from project-paths `development.folder`)
- **Resources:** (from project-paths `resources.folder`)
- **Notable subpaths:** e.g. Box mapping output, docs, scripts

---

## Recent focus / decisions

Last 1–2 weeks: what changed, key decisions, open questions.

---

## Links

- Deep docs / architecture / runbooks (in this resources folder or cursor-ops `docs/`).

---

## Boundaries

- **Always:** (e.g. write to `docs/`, run tests before commit)
- **Ask first:** (e.g. schema changes, new deps)
- **Never:** (e.g. commit secrets, edit `node_modules/`)
