import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'
import {
  renderAdminLayout,
  renderAdminClientsPage,
  renderAdminClientsActions,
  renderAdminBillingPage,
  renderAdminBillingActions,
  renderAdminAuditPage,
} from './generator-renderers'

export function generatePortfolioAdminFiles(
  config: BootConfig,
): GeneratedFile[] {
  if (config.preset !== 'portfolio-clients') return []
  return [
    {
      path: 'src/app/admin/layout.tsx',
      content: renderAdminLayout([
        { label: 'Clients', path: '/admin/clients' },
        { label: 'Billing', path: '/admin/billing' },
        { label: 'Audit Log', path: '/admin/audit' },
      ]),
    },
    {
      path: 'src/app/admin/clients/actions.ts',
      content: renderAdminClientsActions(),
    },
    {
      path: 'src/app/admin/clients/page.tsx',
      content: renderAdminClientsPage(),
    },
    {
      path: 'src/app/admin/billing/actions.ts',
      content: renderAdminBillingActions(),
    },
    {
      path: 'src/app/admin/billing/page.tsx',
      content: renderAdminBillingPage(),
    },
    {
      path: 'src/app/admin/audit/page.tsx',
      content: renderAdminAuditPage(),
    },
  ]
}
