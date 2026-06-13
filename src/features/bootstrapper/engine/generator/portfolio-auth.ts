import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'
import {
  renderAuthMiddleware,
  renderLoginPage,
  renderMagicLinkPage,
  renderAuthShell,
  renderRootLayout,
} from './generator-renderers'

export function generatePortfolioMiddleware(
  config: BootConfig,
): GeneratedFile[] {
  if (config.preset !== 'portfolio-clients') return []
  if (config.auth !== 'supabase-auth') return []

  return [
    {
      path: 'middleware.ts',
      content: renderAuthMiddleware(),
    },
  ]
}

export function generatePortfolioLoginPage(
  config: BootConfig,
): GeneratedFile[] {
  if (config.preset !== 'portfolio-clients') return []
  if (config.auth !== 'supabase-auth') return []

  return [
    {
      path: 'src/app/login/page.tsx',
      content: renderLoginPage(),
    },
  ]
}

export function generatePortfolioMagicLinkPage(
  config: BootConfig,
): GeneratedFile[] {
  if (config.preset !== 'portfolio-clients') return []
  if (config.auth !== 'supabase-auth') return []

  return [
    {
      path: 'src/app/login/check-email/page.tsx',
      content: renderMagicLinkPage(),
    },
  ]
}

export function generatePortfolioAuthLayout(
  config: BootConfig,
): GeneratedFile[] {
  if (config.preset !== 'portfolio-clients') return []

  const { projectName } = config

  return [
    {
      path: 'src/app/_components/auth-shell.tsx',
      content: renderAuthShell(),
    },
    {
      path: 'src/app/layout.tsx',
      content: renderRootLayout(projectName),
    },
  ]
}
