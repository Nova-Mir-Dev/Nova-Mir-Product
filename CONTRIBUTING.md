# Contributing — Nova Mir Product

## Getting Started

1. Clone the repo
2. Run `npm install`
3. Copy `.env.example` to `.env.local` and fill in values
4. Run `npm run dev`

## Development Workflow

1. Pick an issue from `bd ready`
2. Claim it with `bd update <id> --claim`
3. Create a feature branch: `git checkout -b feat/description`
4. Make changes
5. Run quality gates: `npm run typecheck && npm run lint && npm run build && npm test`
6. Commit and push
7. Close the issue: `bd close <id>`

## Code Style

See AGENTS.md for full style guide. Key rules:

- No comments unless explaining non-obvious business logic
- Prefer simple over clever — three similar lines beat a premature abstraction
- Component files named for what they render
- Props interfaces co-located with their component
- Features are self-contained in `src/features/{name}/`
- CSS modules co-located with their component
- Business logic extracted into hooks — components only render
- No barrel `index.ts` files in sub-folders — import directly from the file

## Quality Gates (Must Pass)

1. **TypeScript**: `npm run typecheck` — zero errors
2. **Build**: `npm run build` — must succeed
3. **Lint**: `npm run lint` — zero warnings
4. **Format**: `npm run format` — all files formatted
5. **Tests**: `npm test` — all passing
6. **A11y**: New UI must pass WCAG 2.2 AA

## Branch Strategy

- `main` — Production branch. Protected. No direct pushes.
- Feature branches from `main`, merged via PR.

## Commit Messages

Use conventional commits: `type: description` where `type` is one of: feat, fix, docs, refactor, test, chore.
