import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'
import { GLOBAL_CSS } from './shared-css'
import { PACKAGE_VERSIONS } from './package-versions'

export function generateRemixFiles(config: BootConfig): GeneratedFile[] {
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
    "dev": "remix vite:dev",
    "build": "remix vite:build",
    "start": "remix-serve ./build/server/index.js",
    "setup": "npx tsx scripts/start-setup.ts",
    "cleanup": "npx tsx scripts/cleanup-setup.ts",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "azimuth-ui": "${PACKAGE_VERSIONS['azimuth-ui']!}",
    "@remix-run/node": "${PACKAGE_VERSIONS['@remix-run/node']!}",
    "@remix-run/react": "${PACKAGE_VERSIONS['@remix-run/react']!}",
    "@remix-run/serve": "${PACKAGE_VERSIONS['@remix-run/serve']!}",
    "isbot": "${PACKAGE_VERSIONS['isbot']!}",
    "react": "${PACKAGE_VERSIONS['react']!}",
    "react-dom": "${PACKAGE_VERSIONS['react-dom']!}"
  },
  "devDependencies": {
    "@remix-run/dev": "${PACKAGE_VERSIONS['@remix-run/dev']!}",
    "@types/react": "${PACKAGE_VERSIONS['@types/react']!}",
    "@types/react-dom": "${PACKAGE_VERSIONS['@types/react-dom']!}",
    "eslint": "${PACKAGE_VERSIONS['eslint']!}",
    "prettier": "${PACKAGE_VERSIONS['prettier']!}",
    "typescript": "${PACKAGE_VERSIONS['typescript']!}",
    "vite": "${PACKAGE_VERSIONS['vite']!}"
  }
}`,
    },
    {
      path: 'vite.config.ts',
      content: `import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [remix()],
  server: {
    port: 3000,
    strictPort: true,
  },
})`,
    },
    {
      path: 'tsconfig.json',
      content: `{
  "compilerOptions": {
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "~/*": ["./app/*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    "**/.server/**/*.ts",
    "**/.server/**/*.tsx",
    "**/.client/**/*.ts",
    "**/.client/**/*.tsx"
  ]
}`,
    },
    {
      path: 'app/root.tsx',
      content: `import type { LinksFunction, MetaFunction } from '@remix-run/node'
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import { ThemeProvider } from 'azimuth-ui'
import './globals.css'

export const meta: MetaFunction = () => [
  { title: '${projectName}' },
  {
    name: 'description',
    content: 'Bootstrapped with project-bootstrapper',
  },
]

export const links: LinksFunction = () => [
  { rel: 'icon', href: '/favicon.ico' },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider config={{ mode: 'system' }}>
          {children}
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}`,
    },
    {
      path: 'app/routes/_index.tsx',
      content: `import type { MetaFunction } from '@remix-run/node'

export const meta: MetaFunction = () => [
  { title: '${projectName} - Home' },
]

export default function Index() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold tracking-tight">
        Welcome to ${projectName}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Your project is ready. Start editing{' '}
        <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
          app/routes/_index.tsx
        </code>
        .
      </p>
    </main>
  )
}`,
    },
    {
      path: 'app/globals.css',
      content: GLOBAL_CSS,
    },
    {
      path: 'eslint.config.js',
      content: `import js from '@eslint/js'
import globals from 'globals'

export default [
  {
    ignores: ['build/**', '.cache/**', 'public/build/**'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
]`,
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
