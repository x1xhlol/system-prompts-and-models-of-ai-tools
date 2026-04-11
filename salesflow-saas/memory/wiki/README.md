# Dealix Wiki System — Second Brain

## Purpose
The wiki is the canonical knowledge layer for Dealix. Every important decision, architecture choice, customer insight, and operational pattern lives here in structured, linkable pages. AI agents and human contributors both read and write to this wiki.

## Page Template

Every wiki page must follow this frontmatter structure:

```markdown
# Page Title (عنوان الصفحة)

**Type**: architecture | product | gtm | customer | operations | security | tooling | glossary
**Summary**: One-line English summary
**Summary_AR**: ملخص بسطر واحد بالعربية
**Key Facts**:
  - Fact 1
  - Fact 2
  - Fact 3
**Provenance**: Where this knowledge came from (e.g., "ADR-001", "Customer interview — Acme Corp", "Claude session 2026-04-10")
**Confidence**: high | medium | low
**Related Pages**: [page1](./page1.md), [page2](./page2.md)
**Last Updated**: 2026-04-11
**Stale**: false

---

(Page body goes here — use headers, bullet lists, code blocks, diagrams as needed.)
```

### Field Definitions

| Field | Required | Description |
|-------|----------|-------------|
| **Type** | Yes | Category for indexing. Must match one of the defined types. |
| **Summary** | Yes | English one-liner. Max 120 characters. |
| **Summary_AR** | Yes | Arabic one-liner. Max 120 characters. |
| **Key Facts** | Yes | 3-7 bullet points capturing the essential knowledge. |
| **Provenance** | Yes | Source of the information. Links to ADRs, sessions, interviews, docs. |
| **Confidence** | Yes | `high` = verified by multiple sources or production data. `medium` = single reliable source. `low` = inferred or speculative. |
| **Related Pages** | Yes | At least one link to another wiki page. Orphan pages are flagged by lint. |
| **Last Updated** | Yes | ISO date of last meaningful update. |
| **Stale** | Yes | `true` if page has not been reviewed in 30+ days. |

## How to Create a Page

1. Choose the correct **type** from the list above.
2. Create a new `.md` file in `memory/wiki/` using kebab-case naming: `feature-flags.md`, `customer-acme.md`.
3. Fill in all template fields. Do not leave any blank.
4. Add at least one link in **Related Pages** pointing to an existing wiki page.
5. Add the new page to `memory/indexes/master-index.md` under the appropriate section.
6. If the page summarizes a decision, also create or link to an ADR in `memory/adr/`.

## Linking Conventions

- Use relative paths: `[Architecture](./architecture.md)`
- Link to ADRs: `[ADR-001](../adr/001-multi-tenant.md)`
- Link to memory sections: `[Launch Plan](../growth/launch-plan.md)`
- Cross-reference inside page body using inline links, not footnotes.
- Every page should have at least 2 outbound links.
- When mentioning a glossary term for the first time, link to `[glossary](./glossary.md)`.

## Review Schedule

| Cadence | Action |
|---------|--------|
| **Weekly** | Run `KnowledgeBrain.lint()` to detect stale pages (>30 days without update), orphan pages (no inbound links), missing provenance, and duplicates. |
| **Bi-weekly** | Review all `low` confidence pages. Upgrade to `medium` if verified, or archive if obsolete. |
| **Monthly** | Review master index for completeness. Ensure every active service, integration, and process has a wiki page. |
| **Per release** | Update architecture and product pages affected by the release. |

## Stale Page Protocol

1. `KnowledgeBrain.lint()` marks pages as `Stale: true` if `Last Updated` is older than 30 days.
2. Stale pages appear in the weekly review report.
3. A reviewer either:
   - Updates the page and sets `Stale: false` with a new `Last Updated` date.
   - Archives the page by moving it to `memory/wiki/archive/` and removing it from the master index.
   - Confirms the page is still accurate and bumps `Last Updated` without content changes.

## Quality Rules

- No page may exist without provenance. "Unknown" is not acceptable.
- Confidence must be justified: `high` requires a link to source material.
- Arabic summaries are mandatory. Dealix is Arabic-first.
- Pages must not exceed 500 lines. Split large topics into sub-pages.
- Code examples must be tested or marked with `<!-- untested -->`.
