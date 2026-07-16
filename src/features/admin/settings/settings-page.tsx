import { Stack, Text, Tabs } from 'azimuth-ui'
import { ProfileTab } from './components/profile-tab'
import { SecurityTab } from './components/security-tab'
import { ApiKeysTab, type ApiKeyItem } from './components/api-keys-tab'

interface TabItem {
  id: string
  label: string
  content: React.ReactNode
  disabled?: boolean
}

export type { ApiKeyItem }

export interface SettingsPageProps {
  user: { email: string; name: string | null }
  apiKeys?: ApiKeyItem[]
  factors: {
    id: string
    type: string
    created_at: string
    friendly_name?: string | null
  }[]
  notificationPrefs?: Record<string, boolean>
}

export const SettingsPage = ({
  user,
  apiKeys = [],
  factors,
  notificationPrefs = {},
}: SettingsPageProps) => {
  const tabs: TabItem[] = [
    {
      id: 'profile',
      label: 'Profile',
      content: <ProfileTab user={user} notificationPrefs={notificationPrefs} />,
    },
    {
      id: 'security',
      label: 'Security',
      content: <SecurityTab factors={factors} />,
    },
    {
      id: 'api-keys',
      label: 'API Keys',
      content: <ApiKeysTab apiKeys={apiKeys} />,
    },
  ]

  return (
    <Stack spacing="md">
      <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
        Settings
      </Text>
      <Tabs tabs={tabs} defaultTab="profile" />
    </Stack>
  )
}
