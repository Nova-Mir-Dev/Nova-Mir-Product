import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'
import { GLOBAL_CSS } from './shared-css'
import { PACKAGE_VERSIONS } from './package-versions'

export function generateAstroFiles(config: BootConfig): GeneratedFile[] {
  const { projectName } = config

  return [
    {
      path: 'package.json',
      content: `{
  "name": "${projectName}",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "astro dev --port 3000",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "setup": "npx tsx scripts/start-setup.ts",
    "cleanup": "npx tsx scripts/cleanup-setup.ts",
    "typecheck": "astro check",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "@astrojs/check": "${PACKAGE_VERSIONS['@astrojs/check']!}",
    "@astrojs/react": "${PACKAGE_VERSIONS['@astrojs/react']!}",
    "azimuth-ui": "${PACKAGE_VERSIONS['azimuth-ui']!}",
    "astro": "${PACKAGE_VERSIONS['astro']!}",
    "react": "${PACKAGE_VERSIONS['react']!}",
    "react-dom": "${PACKAGE_VERSIONS['react-dom']!}",
    "typescript": "${PACKAGE_VERSIONS['typescript']!}"
  },
  "devDependencies": {
    "@types/react": "${PACKAGE_VERSIONS['@types/react']!}",
    "@types/react-dom": "${PACKAGE_VERSIONS['@types/react-dom']!}",
    "eslint": "${PACKAGE_VERSIONS['eslint']!}",
    "prettier": "${PACKAGE_VERSIONS['prettier']!}",
    "typescript-eslint": "${PACKAGE_VERSIONS['typescript-eslint']!}"
  }
}`,
    },
    {
      path: 'astro.config.mjs',
      content: `import { defineConfig } from 'astro/config'
import react from '@astrojs/react'

export default defineConfig({
  integrations: [react()],
  output: 'static',
  devToolbar: { enabled: true },
})`,
    },
    {
      path: 'tsconfig.json',
      content: `{
  "extends": "astro/tsconfigs/strictest",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}`,
    },
    {
      path: 'src/pages/index.astro',
      content: `---
import Layout from '../layouts/Layout.astro'
---

<Layout title="${projectName}">
  <main>
    <h1 class="title">Welcome to ${projectName}</h1>
    <p class="subtitle">
      Your project is ready. Start editing{' '}
      <code>src/pages/index.astro</code>.
    </p>
  </main>
</Layout>

<style>
  main {
    display: flex;
    min-height: 100vh;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 1rem;
    text-align: center;
  }

  .title {
    font-size: 2.25rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    line-height: 1.2;
  }

  .subtitle {
    margin-top: 1rem;
    font-size: 1.125rem;
    color: var(--color-muted);
  }

  code {
    border-radius: 0.375rem;
    background: var(--color-muted-bg);
    padding: 0.125rem 0.375rem;
    font-family: ui-monospace, monospace;
    font-size: 0.875rem;
  }
</style>`,
    },
    {
      path: 'src/layouts/Layout.astro',
      content: `---
import '../styles/global.css'

interface Props {
  title: string
}

const { title } = Astro.props
---

<!doctype html>
<html lang="en" data-theme="system">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Bootstrapped with project-bootstrapper" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{title}</title>
  </head>
  <body>
    <slot />
  </body>
</html>`,
    },
    {
      path: 'src/styles/global.css',
      content: GLOBAL_CSS,
    },
    {
      path: 'eslint.config.js',
      content: `import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import astroParser from 'astro-eslint-parser'

export default tseslint.config(
  { ignores: ['dist/**', '.astro/**'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.strictTypeChecked],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.astro'],
      },
    },
  },
)`,
    },
    {
      path: '.prettierrc',
      content: `{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 80,
  "tabWidth": 2
}`,
    },
  ]
}
