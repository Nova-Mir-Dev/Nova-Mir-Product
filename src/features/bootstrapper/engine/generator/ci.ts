import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'

export function generateCiFiles(config: BootConfig): GeneratedFile[] {
  const { ciProvider, framework } = config

  if (ciProvider !== 'github-actions') return []

  const installCmd = framework === 'nextjs' ? 'npm ci' : 'npm ci'

  const ciYml: GeneratedFile = {
    path: '.github/workflows/ci.yml',
    content: `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: ${installCmd}
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: ${installCmd}
      - run: npx tsc --noEmit

  test:
    runs-on: ubuntu-latest
    needs: [lint, typecheck]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: ${installCmd}
      - run: npm test

  build:
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]
    env:
      NEXT_PUBLIC_SUPABASE_URL: \${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: \${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: ${installCmd}
      - run: npm run build
`,
  }

  return [ciYml]
}

export function generateDependabotConfig(config: BootConfig): GeneratedFile[] {
  if (config.ciProvider === 'none') return []

  return [
    {
      path: '.github/dependabot.yml',
      content: `version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "automerge"
    commit-message:
      prefix: "chore"
      include: "scope"

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    labels:
      - "dependencies"
      - "ci"
`,
    },
  ]
}
