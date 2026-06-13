import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'
import { GLOBAL_CSS } from './shared-css'
import { PACKAGE_VERSIONS } from './package-versions'

function generatePackageJson(config: BootConfig): string {
  const {
    projectName,
    databaseProvider,
    auth,
    monitoring,
    payments,
    emailProvider,
    communicationPlatforms,
    ciProvider,
  } = config

  const scripts: Record<string, string> = {
    dev: 'next dev --port 3000',
    build: 'next build',
    start: 'next start',
    setup: 'npx tsx scripts/start-setup.ts',
    cleanup: 'npx tsx scripts/cleanup-setup.ts',
    typecheck: 'tsc --noEmit',
    lint: 'eslint .',
    format: 'prettier --write .',
  }

  if (ciProvider !== 'none') {
    scripts.test = 'vitest run'
  }

  const versions = PACKAGE_VERSIONS as Record<string, string>
  const dependencies: Record<string, string> = {
    'azimuth-ui': versions['azimuth-ui']!,
    next: versions.next!,
    react: versions.react!,
    'react-dom': versions['react-dom']!,
  }

  if (databaseProvider === 'supabase') {
    dependencies['@supabase/supabase-js'] =
      PACKAGE_VERSIONS['@supabase/supabase-js']!
  }
  if (auth === 'supabase-auth') {
    dependencies['@supabase/ssr'] = PACKAGE_VERSIONS['@supabase/ssr']!
  }
  if (monitoring === 'sentry') {
    dependencies['@sentry/nextjs'] = PACKAGE_VERSIONS['@sentry/nextjs']!
  }
  if (payments === 'stripe') {
    dependencies['stripe'] = PACKAGE_VERSIONS['stripe']!
  }
  if (emailProvider === 'resend') {
    dependencies['resend'] = PACKAGE_VERSIONS['resend']!
  }
  if (emailProvider !== 'none') {
    dependencies['@react-email/components'] =
      PACKAGE_VERSIONS['@react-email/components']!
  }
  if (communicationPlatforms.includes('slack')) {
    dependencies['@slack/bolt'] = PACKAGE_VERSIONS['@slack/bolt']!
  }
  if (config.logManagement === 'axiom') {
    dependencies['@axiomhq/axiom-node'] =
      PACKAGE_VERSIONS['@axiomhq/axiom-node']!
  }
  if (config.requestValidation) {
    dependencies['zod'] = PACKAGE_VERSIONS['zod']!
  }
  if (config.rateLimiting === 'upstash') {
    dependencies['@upstash/ratelimit'] = PACKAGE_VERSIONS['@upstash/ratelimit']!
    dependencies['@upstash/redis'] = PACKAGE_VERSIONS['@upstash/redis']!
  }
  if (config.cache === 'upstash-redis') {
    dependencies['@upstash/redis'] = PACKAGE_VERSIONS['@upstash/redis']!
  }
  if (config.smsProvider === 'twilio') {
    dependencies['twilio'] = PACKAGE_VERSIONS['twilio']!
  }

  const devDependencies: Record<string, string> = {
    '@eslint/js': PACKAGE_VERSIONS['@eslint/js']!,
    '@types/node': PACKAGE_VERSIONS['@types/node']!,
    '@types/react': PACKAGE_VERSIONS['@types/react']!,
    '@types/react-dom': PACKAGE_VERSIONS['@types/react-dom']!,
    eslint: PACKAGE_VERSIONS['eslint']!,
    'eslint-config-next': PACKAGE_VERSIONS['eslint-config-next']!,
    prettier: PACKAGE_VERSIONS['prettier']!,
    typescript: PACKAGE_VERSIONS['typescript']!,
    'typescript-eslint': PACKAGE_VERSIONS['typescript-eslint']!,
  }

  if (ciProvider !== 'none') {
    devDependencies['@testing-library/react'] =
      PACKAGE_VERSIONS['@testing-library/react']!
    devDependencies['jsdom'] = PACKAGE_VERSIONS['jsdom']!
    devDependencies['vitest'] = PACKAGE_VERSIONS['vitest']!
  }

  const sortKeys = (obj: Record<string, string>): Record<string, string> => {
    return Object.keys(obj)
      .sort()
      .reduce<Record<string, string>>((acc, key) => {
        acc[key] = obj[key]!
        return acc
      }, {})
  }

  const pkg = {
    name: projectName,
    private: true,
    version: '0.1.0',
    scripts: sortKeys(scripts),
    dependencies: sortKeys(dependencies),
    devDependencies: sortKeys(devDependencies),
  }

  return JSON.stringify(pkg, null, 2)
}

export function generateNextJsFiles(config: BootConfig): GeneratedFile[] {
  const {
    projectName,
    databaseProvider,
    payments,
    monitoring,
    analyticsProvider,
  } = config

  const connectSrc = ["'self'"]
  const frameSrc: string[] = []

  if (databaseProvider === 'supabase') {
    connectSrc.push('https://*.supabase.co', 'wss://*.supabase.co')
  }
  if (payments === 'stripe') {
    connectSrc.push('https://api.stripe.com')
    frameSrc.push('https://js.stripe.com')
  }
  if (payments === 'lemonsqueezy') {
    connectSrc.push('https://api.lemonsqueezy.com')
  }
  if (payments === 'paddle') {
    connectSrc.push('https://api.paddle.com')
  }
  if (monitoring === 'sentry') {
    connectSrc.push('https://*.ingest.sentry.io')
  }
  if (analyticsProvider === 'plausible') {
    connectSrc.push('https://plausible.io')
  }

  const cspValue = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    `connect-src ${connectSrc.join(' ')}`,
    "img-src 'self' data: blob:",
    ...(frameSrc.length > 0 ? [`frame-src ${frameSrc.join(' ')}`] : []),
    "font-src 'self'",
  ].join('; ')

  return [
    {
      path: 'package.json',
      content: generatePackageJson(config),
    },
    {
      path: 'next.config.ts',
      content: `import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
           { key: 'Content-Security-Policy', value: \`${cspValue}\` },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

${
  config.monitoring === 'sentry'
    ? `import { withSentryConfig } from "@sentry/nextjs";

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  disableLogger: true,
  automaticVercelMonitors: true,
});`
    : `export default nextConfig`
}`,
    },
    {
      path: 'tsconfig.json',
      content: `{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*", "./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`,
    },
    {
      path: 'src/app/_components/theme-script.tsx',
      content: `export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: \`
          (function() {
            try {
              var mode = localStorage.getItem('theme-mode') || 'system';
              if (mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.setAttribute('data-theme', 'dark');
              } else {
                document.documentElement.setAttribute('data-theme', 'light');
              }
            } catch(e) {}
          })();
        \`,
      }}
    />
  )
}`,
    },
    {
      path: 'src/app/layout.tsx',
      content: `import type { Metadata } from 'next'
import { Sora, Onest } from 'next/font/google'
import { ClientShell } from './_components/client-shell'
import { ThemeScript } from './_components/theme-script'
import './globals.css'
import 'azimuth-ui/styles.css'

const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
})

const onest = Onest({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: '${projectName}',
  description: 'Bootstrapped with project-bootstrapper',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className={\`\${sora.variable} \${onest.variable}\`}>
        <a href="#main-content" className="sr-only">
          Skip to content
        </a>
        <ThemeScript />
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  )
}`,
    },
    {
      path: 'src/app/page.tsx',
      content: `"use client";

import { Container, Text, Stack } from "azimuth-ui";
import { APP_CONFIG, NAV_PAGES } from "@/lib/navigation";

export default function Home() {
  return (
    <Container style={{ padding: "3rem 2rem", maxWidth: 640, margin: "0 auto" }}>
      <Stack spacing="lg">
        <div style={{ textAlign: "center", paddingTop: "3rem" }}>
          <Text element={{ as: "h1", size: "h1" }} weight="bold">
            {APP_CONFIG.title}
          </Text>
        </div>

        {NAV_PAGES.length > 0 && (
          <Stack spacing="sm">
            <Text weight="semibold">Application Pages</Text>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {NAV_PAGES.map((page) => (
                <a key={page.path} href={page.path} style={{
                  display: "block", padding: "0.75rem 1rem",
                  borderRadius: "var(--azimuth-radius)",
                  border: "1px solid var(--azimuth-color-border)",
                  background: "var(--azimuth-color-surface)",
                  textDecoration: "none", color: "var(--azimuth-color-text)",
                  transition: "border-color 150ms ease",
                }}>
                  <Text weight="semibold">{page.label}</Text>
                  <Text element={{ size: "xs" }} color="muted" style={{ fontFamily: "monospace" }}>{page.path}</Text>
                </a>
              ))}
            </div>
          </Stack>
        )}
      </Stack>
    </Container>
  );
}`,
    },
    {
      path: 'src/app/globals.css',
      content: GLOBAL_CSS,
    },
    {
      path: 'src/app/_components/client-shell.tsx',
      content: `'use client'

import { ThemeProvider } from 'azimuth-ui'

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider config={{ mode: 'system' }}>
      {children}
    </ThemeProvider>
  )
}`,
    },
    {
      path: 'eslint.config.mjs',
      content: `import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import tseslint from 'typescript-eslint'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = tseslint.config(
  {
    ignores: ['.next/**', 'node_modules/**', 'dist/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...compat.extends('next/core-web-vitals'),
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    rules: {
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
)

export default eslintConfig`,
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
