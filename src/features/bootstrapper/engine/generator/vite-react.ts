import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'
import { GLOBAL_CSS } from './shared-css'
import { PACKAGE_VERSIONS } from './package-versions'

export function generateViteReactFiles(config: BootConfig): GeneratedFile[] {
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
    "dev": "vite --port 3000",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "setup": "npx tsx scripts/start-setup.ts",
    "cleanup": "npx tsx scripts/cleanup-setup.ts",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "azimuth-ui": "${PACKAGE_VERSIONS['azimuth-ui']!}",
    "react": "${PACKAGE_VERSIONS['react']!}",
    "react-dom": "${PACKAGE_VERSIONS['react-dom']!}"
  },
  "devDependencies": {
    "@eslint/js": "${PACKAGE_VERSIONS['@eslint/js']!}",
    "@types/react": "${PACKAGE_VERSIONS['@types/react']!}",
    "@types/react-dom": "${PACKAGE_VERSIONS['@types/react-dom']!}",
    "@vitejs/plugin-react": "${PACKAGE_VERSIONS['@vitejs/plugin-react']!}",
    "eslint": "${PACKAGE_VERSIONS['eslint']!}",
    "eslint-plugin-react-hooks": "${PACKAGE_VERSIONS['eslint-plugin-react-hooks']!}",
    "eslint-plugin-react-refresh": "${PACKAGE_VERSIONS['eslint-plugin-react-refresh']!}",
    "globals": "${PACKAGE_VERSIONS['globals']!}",
    "prettier": "${PACKAGE_VERSIONS['prettier']!}",
    "typescript": "${PACKAGE_VERSIONS['typescript']!}",
    "typescript-eslint": "${PACKAGE_VERSIONS['typescript-eslint']!}",
    "vite": "${PACKAGE_VERSIONS['vite']!}"
  }
}`,
    },
    {
      path: 'vite.config.ts',
      content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  build: {
    target: 'esnext',
    sourcemap: true,
  },
})`,
    },
    {
      path: 'tsconfig.json',
      content: `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
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
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "vite-env.d.ts"]
}`,
    },
    {
      path: 'index.html',
      content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Bootstrapped with project-bootstrapper" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
    },
    {
      path: 'src/main.tsx',
      content: `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'azimuth-ui'
import { App } from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider config={{ mode: 'system' }}>
      <App />
    </ThemeProvider>
  </StrictMode>,
)`,
    },
    {
      path: 'src/App.tsx',
      content: `export function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold tracking-tight">
        Welcome to ${projectName}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Your project is ready. Start editing{' '}
        <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
          src/App.tsx
        </code>
        .
      </p>
    </main>
  )
}`,
    },
    {
      path: 'src/index.css',
      content: GLOBAL_CSS,
    },
    {
      path: 'src/vite-env.d.ts',
      content: `/// <reference types="vite/client" />`,
    },
    {
      path: 'eslint.config.js',
      content: `import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.strictTypeChecked],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
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
