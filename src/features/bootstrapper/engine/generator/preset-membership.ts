import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'
import {
  renderMembershipDashboardLayout,
  renderMemberDirectoryPage,
  renderGatedContentPage,
  renderSubscriptionApi,
  renderPricingPage,
  renderClientDashboardPage,
} from './generator-renderers'

export function generateMembershipFiles(config: BootConfig): GeneratedFile[] {
  if (config.preset !== 'membership-site') return []

  return [
    {
      path: 'src/app/page.tsx',
      content: renderPricingPage(),
    },
    {
      path: 'src/app/dashboard/layout.tsx',
      content: renderMembershipDashboardLayout(),
    },
    {
      path: 'src/app/dashboard/page.tsx',
      content: renderClientDashboardPage(),
    },
    {
      path: 'src/app/dashboard/members/page.tsx',
      content: renderMemberDirectoryPage(),
    },
    {
      path: 'src/app/dashboard/content/page.tsx',
      content: renderGatedContentPage(),
    },
    {
      path: 'src/app/api/subscriptions/route.ts',
      content: renderSubscriptionApi(),
    },
  ]
}
