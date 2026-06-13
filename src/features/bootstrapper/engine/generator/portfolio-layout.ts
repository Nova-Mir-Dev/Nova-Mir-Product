import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'
import { renderClientLayout } from './generator-renderers'

export function generatePortfolioClientLayout(
  config: BootConfig,
): GeneratedFile[] {
  if (config.preset !== 'portfolio-clients') return []
  return [
    {
      path: 'src/app/dashboard/layout.tsx',
      content: renderClientLayout([
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Projects', path: '/dashboard/projects' },
        { label: 'Billing', path: '/dashboard/billing' },
        { label: 'Documents', path: '/dashboard/documents' },
        { label: 'Contact', path: '/dashboard/contact' },
      ]),
    },
  ]
}
