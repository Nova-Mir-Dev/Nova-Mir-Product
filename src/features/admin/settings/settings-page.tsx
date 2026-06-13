'use client'

import {
  Stack,
  Text,
  Card,
  Input,
  Button,
  Divider,
  Tabs,
  EmptyState,
} from 'azimuth-ui'
import { useActionState } from 'react'
import { updateProfile, createApiKey, revokeApiKey } from './actions'
import type { CreateApiKeyResult } from './actions'
import styles from './settings-page.module.css'

interface TabItem {
  id: string
  label: string
  content: React.ReactNode
  disabled?: boolean
}

export interface ApiKeyItem {
  id: string
  prefix: string
  created_at: string
}

export interface SettingsPageProps {
  user: { email: string; name: string | null }
  apiKeys?: ApiKeyItem[]
}

export const SettingsPage = ({ user, apiKeys = [] }: SettingsPageProps) => {
  const tabs: TabItem[] = [
    { id: 'profile', label: 'Profile', content: <ProfileTab user={user} /> },
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

const ProfileTab = ({
  user,
}: {
  user: { email: string; name: string | null }
}) => (
  <Card>
    <Stack spacing="md">
      <Text element={{ size: 'lg' }} weight="semibold">
        Profile
      </Text>
      <Divider />
      <form action={updateProfile}>
        <Stack spacing="sm">
          <Input
            label={{ text: 'Name' }}
            name="name"
            defaultValue={user.name || ''}
            placeholder="Your name"
          />
          <Input
            label={{ text: 'Email' }}
            name="email"
            value={{ value: user.email, disabled: true }}
          />
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </Stack>
      </form>
    </Stack>
  </Card>
)

const ApiKeysTab = ({ apiKeys }: { apiKeys: ApiKeyItem[] }) => {
  const [createResult, createAction, isCreating] = useActionState<
    CreateApiKeyResult | null,
    FormData
  >(createApiKey, null)

  return (
    <Card>
      <Stack spacing="md">
        <Stack spacing="xs">
          <Text element={{ size: 'lg' }} weight="semibold">
            API Keys
          </Text>
          <Text element={{ size: 'sm' }}>
            Manage API keys for programmatic access.
          </Text>
        </Stack>
        <Divider />
        {createResult?.success && createResult.key && (
          <Card>
            <Stack spacing="xs">
              <Text weight="semibold">API Key Created</Text>
              <Text element={{ size: 'sm' }}>
                Copy this key now. You won&apos;t be able to see it again.
              </Text>
              <Text className={styles.apiKeyPrefix}>{createResult.key}</Text>
            </Stack>
          </Card>
        )}
        {createResult?.error && (
          <Text element={{ size: 'sm' }}>{createResult.error}</Text>
        )}
        {apiKeys.length === 0 ? (
          <EmptyState
            title="No API keys"
            description="You haven't created any API keys yet."
          />
        ) : (
          <Stack spacing="xs">
            {apiKeys.map((key) => (
              <div key={key.id} className={styles.apiKeyRow}>
                <Stack spacing="xs">
                  <span className={styles.apiKeyPrefix}>{key.prefix}...</span>
                  <Text element={{ size: 'xs' }}>
                    Created {new Date(key.created_at).toLocaleDateString()}
                  </Text>
                </Stack>
                <form action={revokeApiKey}>
                  <input type="hidden" name="id" value={key.id} />
                  <Button variant="danger" size="sm" type="submit">
                    Revoke
                  </Button>
                </form>
              </div>
            ))}
          </Stack>
        )}
        <Divider />
        <form action={createAction}>
          <Button variant="primary" type="submit" disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create API Key'}
          </Button>
        </form>
      </Stack>
    </Card>
  )
}
