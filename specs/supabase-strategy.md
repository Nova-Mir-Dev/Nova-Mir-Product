# Decision: Supabase Project Strategy

## Objective

Resolve AZF-ezu / `Nova-Mir-Product-rhw`: decide whether Product, Admin, and Clients should share one Supabase project or stay separate.

## Evidence Reviewed

Only one active `schema.sql` was found in the local Nova Mir workspace:

- `Nova-Mir-Product/schema.sql`

No separate Admin or Clients `schema.sql` files were present locally. Planning context states the Admin and Client portals were consolidated into `Nova-Mir-Product`, and the old portal repos are archived.

This means the current actionable source of truth is Product's schema, not three independently deployable schemas.

## Current Product Schema

Core portal tables:

- `users`
- `sessions`
- `api_keys`
- `audit_logs`
- `activity_logs`
- `appointments`
- `leads`

Client work tables:

- `portfolio_clients`
- `projects`
- `documents`
- `signatures`
- `support_tickets`

Billing tables:

- `portfolio_invoices`
- `line_items`
- `payments`

Managed marketing content tables:

- `pricing_tiers`
- `portfolio_projects`
- `public_nav_links`
- `hero_headlines`
- `testimonials`
- `process_steps`
- `content_history`

Compliance table:

- `ccpa_opt_outs`

## Divergence Found Inside The Current Schema

The launch blocker is not currently three local schemas fighting each other. It is that app code and Product's canonical schema are already out of sync.

Known mismatches:

| Area | Schema | App expectation |
| --- | --- | --- |
| Invoices | `portfolio_invoices` has `user_id`, `client_name`, `amount`, `status`, `due_date`, `paid_at` | Code/types reference `client_id`, `date`, `invoice_number` |
| Line items | `line_items` has `quantity`, `unit_price` | Code references `amount` |
| Revenue | No `revenue_entries` or `expense_entries` tables | Admin revenue page queries both |
| Clients | `portfolio_clients` has contact fields only | Types reference `status`, `project_count` |
| Leads | Schema uses `business_name`, `service_interest`, `budget_range` | Admin types reference `company`, `notes` |
| Projects | `projects` has no `deadline` or `progress` | Admin types reference both |
| Support tickets | Schema has `description` | Admin types reference `message` |

RLS is also inconsistent with app access patterns:

- Several admin-managed tables use `auth.role() = 'service_role'` policies.
- Admin server pages often use the normal SSR Supabase client, not a service-role client behind explicit route-level authorization.
- Client dashboard reads `portfolio_invoices` and `activity_logs`, but those tables are service-role-only in schema.

## Option A: One Shared Supabase Project

Use one Supabase project and one canonical schema for Product, Admin, and Clients.

Pros:

- One source of truth for clients, projects, invoices, documents, support, and leads.
- No cross-database sync for the core business workflow.
- Simpler DSAR/compliance handling.
- Simpler reporting and audit logs.
- Matches the current consolidated Product repo direction.

Cons:

- Requires schema cleanup before launch.
- RLS must be correct because all portals share the same database.
- Admin operations need a deliberate pattern: either correct admin RLS policies or server-only service-role access after inline auth checks.
- A bad migration can affect all portals.

## Option B: Separate Supabase Projects

Run Product, Admin, and Clients as separate Supabase projects.

Pros:

- Strong blast-radius isolation.
- Each portal can evolve its own schema independently.
- Less risk of a client-facing policy exposing admin-only data if configured correctly.

Cons:

- Lead, client, project, invoice, and document state must be synced through APIs.
- More environment variables, migrations, backups, monitoring, and operational failure modes.
- Auth and user identity become fragmented.
- DSAR/compliance requests must query every project.
- Reporting requires ETL or bridge APIs.
- Does not match the current consolidated repo unless the old portal repos are revived.

## Option C: Hybrid

Keep one Supabase project for the operational workflow, but isolate boundaries using schemas, RLS, and bridge APIs where there is a real trust boundary.

Recommended hybrid shape:

- One Supabase project for operational data: users, leads, clients, projects, invoices, documents, support, audit logs.
- One canonical `public` schema unless there is a proven need for separate Postgres schemas.
- Bridge API contracts for portal-to-portal actions and future externalized portals.
- Admin-only operations go through server routes with inline auth and narrow service-role usage, or through explicit admin RLS policies.
- Public marketing content can stay in the same project with anon read policies for published rows.

## Recommendation

Use one shared Supabase project for launch, with a single canonical Product schema.

Do not split into three separate projects now. The active codebase is consolidated, no separate local portal schemas were found, and Nova Mir's portal workflow depends on shared entities. Separate projects would add sync complexity before the underlying schema is stable.

Before launch, reconcile schema-vs-app drift and fix RLS access patterns. The one-project approach is only safe if the schema and policy layer become intentional rather than accidental.

## Required Follow-Up Work

- Create a canonical migration strategy for Product's schema.
- Reconcile invoice, line item, revenue, client, lead, project, and support-ticket fields with app usage.
- Decide the admin data-access pattern: admin RLS policies vs server-only service-role reads after inline auth.
- Add extension setup for `gen_random_uuid()` so fresh Supabase projects deploy deterministically.
- Keep the API bridge contracts in `specs/api-contracts.md` so future portal extraction remains possible without redesign.
