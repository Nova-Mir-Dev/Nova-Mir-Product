# Contributing

## Setup

```bash
git clone <repo-url>
cd nova-mir-product
npm install
cp .env.example .env.local
npm run dev
```

## Available Scripts

| Command             | Description                             |
| ------------------- | --------------------------------------- |
| `npm run dev`       | Start development server on port 3000   |
| `npm run build`     | Production build                        |
| `npm run typecheck` | TypeScript type checking (tsc --noEmit) |
| `npm run lint`      | ESLint across the project               |
| `npm run format`    | Format code with Prettier               |
| `npm test`          | Run tests with Vitest                   |

## Branch Strategy

- `main` — production-ready, always deployable
- `feat/<name>` — feature branches off `main`
- `fix/<name>` — bug fix branches
- `chore/<name>` — maintenance, tooling, dependencies

Keep branches short-lived. Rebase onto `main` before opening a PR.

## PR Workflow

1. Create a feature/fix branch from `main`
2. Make changes, keeping commits focused
3. Run quality gates (see below)
4. Open a pull request against `main`
5. Request review from at least one other contributor
6. Squash-merge once approved

## Quality Gates

All must pass before merging:

- `npm run typecheck` — zero errors
- `npm run build` — must succeed
- `npm run lint` — zero warnings
- `npm run format` — all files formatted
- `npm test` — all passing
- WCAG 2.2 AA compliance for new UI
- No secrets committed (use `.env.local` for local config)

## Issue Tracking

This project uses **bd (beads)** for issue tracking:

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

Run `bd prime` for the full command reference.

## Code Style

- **Components**: One component per file, named after what it renders
- **Hooks**: Business logic extracted into `use-{feature}.ts` hooks
- **Types**: Co-located `types.ts` per feature
- **CSS**: CSS modules co-located with their component
- **Structure**: Features live in `src/features/{feature-name}/`
- **Imports**: No barrel `index.ts` files — import directly from the source file
- **No comments** unless explaining non-obvious business logic
- **Prefer simple** over clever — three similar lines beat a premature abstraction
- **Client/server**: `'use client'` only when needed (hooks, event handlers, browser APIs)
