import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'
import {
  renderAuthMeApi,
  renderAdminClientsApi,
  renderAdminBillingApi,
  renderAdminAuditApi,
} from './generator-renderers'

export function generatePortfolioApiFiles(config: BootConfig): GeneratedFile[] {
  if (config.preset !== 'portfolio-clients') return []

  return [
    {
      path: 'src/app/api/auth/me/route.ts',
      content: renderAuthMeApi(),
    },
    {
      path: 'src/app/api/admin/clients/route.ts',
      content: renderAdminClientsApi(),
    },
    {
      path: 'src/app/api/admin/billing/route.ts',
      content: renderAdminBillingApi(),
    },
    {
      path: 'src/app/api/admin/audit/route.ts',
      content: renderAdminAuditApi(),
    },
  ]
}
