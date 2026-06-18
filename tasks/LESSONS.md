# Lessons

## 2026-06-18: Hardcoded content audit + DSAR completeness

- Non-obvious bug: ComplianceRequestForm component was defined, tested, but never imported on any page. Root cause: no dead-code check verifies that exported components are actually rendered. Prevention: add "orphaned component" detection to full-audit skill.
- Surprise: ~100+ hardcoded content items scattered across 20+ files. Pricing, portfolio, nav, testimonials, headlines, section titles all hardcoded. No single source of truth. Prevention: content-database audit in full-audit skill.
- Plan council finding: generic JSONB content table is an anti-pattern. Typed tables per content domain are simpler, more queryable, and produce better admin UIs. This contradicted the initial "one table for everything" instinct. Prevention: always run plan council before content architecture decisions.
- DSAR gap: data-access and data-deletion endpoints only cover `users` and `sessions`. At least 8 other tables with user data are not covered (projects, appointments, payments, documents, api_keys, etc.). Prevention: full-audit should verify that every table with a user_id FK is covered by data-access/data-deletion.
- Content table design: locale column is YAGNI until actual i18n requirement exists. sort_order on every ordered content list prevents admin frustration. content_history + draft/publish from day one prevents the #1 admin complaint.
- Bead creation via bd: multiline bodies with special characters (SQL, JSON) break shell escaping. Use temp files for complex bead bodies.
