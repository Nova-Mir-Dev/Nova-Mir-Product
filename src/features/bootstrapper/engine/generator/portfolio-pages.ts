import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'
import {
  renderClientDashboardPage,
  renderClientProjectsPage,
  renderClientDocumentsPage,
  renderClientDocumentsActions,
  renderClientSupportPage,
  renderClientSupportActions,
} from './generator-renderers'

export function generatePortfolioClientPages(
  config: BootConfig,
): GeneratedFile[] {
  if (config.preset !== 'portfolio-clients') return []

  const { projectName } = config

  return [
    {
      path: 'src/app/dashboard/page.tsx',
      content: renderClientDashboardPage(),
    },
    {
      path: 'src/app/dashboard/projects/page.tsx',
      content: renderClientProjectsPage(),
    },
    {
      path: 'src/app/dashboard/documents/actions.ts',
      content: renderClientDocumentsActions(),
    },
    {
      path: 'src/app/dashboard/documents/page.tsx',
      content: renderClientDocumentsPage(),
    },
    {
      path: 'src/app/dashboard/support/actions.ts',
      content: renderClientSupportActions(),
    },
    {
      path: 'src/app/dashboard/support/page.tsx',
      content: renderClientSupportPage(projectName),
    },
  ]
}
