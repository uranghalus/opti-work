# Domain Docs

How engineering skills should consume repo's domain documentation exploring codebase.

## Before exploring, read
- **`GLOSSARY.md`** repo root, or
- **`GLOSSARY-MAP.md`** repo root exists: points one `GLOSSARY.md` per context. Read each one relevant topic.
- **`docs/adr/`**: read ADRs touch area you're about work in. In multi-context repos, also check `src/<context>/docs/adr/` context-scoped decisions.

any files don't exist, **proceed silently**. Don't flag absence; don't suggest creating upfront. `/domain-modeling` skill (reached via `/grill-with-docs` `/improve-codebase-architecture`) creates lazily terms decisions actually get resolved.

## File structure

Single-context repo (most repos):

```
/ 
├── GLOSSARY.md
├── docs/adr/
│   ├── 0001-event-sourced-orders.md
│   └── 0002-postgres-for-write-model.md
└── src/
```

Multi-context repo (presence of `GLOSSARY-MAP.md` at the root):

```
/ 
├── GLOSSARY-MAP.md
├── docs/adr/                          ← system-wide decisions
└── src/
    ├── ordering/
    │   ├── GLOSSARY.md
    │   └── docs/adr/                  ← context-specific decisions
    └── billing/
        ├── GLOSSARY.md
        └── docs/adr/
```

## Use glossary's vocabulary

When output names domain concept (in issue title, refactor proposal, hypothesis, test name), use term defined in `GLOSSARY.md`. Don't drift synonyms glossary explicitly avoids. If concept you need isn't in glossary yet, that's signal: either you're inventing language project doesn't use (reconsider) or there's real gap (note it `/domain-modeling`).

## Flag ADR conflicts

If output contradicts existing ADR, surface explicitly silently overriding:

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_
