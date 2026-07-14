'use client'

import { useState } from 'react'
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
import {
  updateProfile,
  updatePassword,
  updateNotificationPrefs,
  createApiKey,
  revokeApiKey,
} from './actions'
import type { CreateApiKeyResult } from './actions'
import { MfaPanel } from '@/features/auth/mfa-panel'
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

const ProfileTab = ({
  user,
  notificationPrefs,
}: {
  user: { email: string; name: string | null }
  notificationPrefs: Record<string, boolean>
}) => {
  const [pwStatus, setPwStatus] = useState<{
    success?: boolean
    error?: string
  } | null>(null)
  const [pwValue, setPwValue] = useState('')

  return (
    <Stack spacing="md">
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
      <Card>
        <Stack spacing="md">
          <Text element={{ size: 'lg' }} weight="semibold">
            Password
          </Text>
          <Divider />
          <Stack spacing="sm">
            <Input
              label={{ text: 'New Password' }}
              name="newPassword"
              type="password"
              value={{
                value: pwValue,
                onChange: (e) => setPwValue(e.target.value),
              }}
              placeholder="Enter new password"
            />
            <div role="status" aria-live="polite">
              {pwStatus?.success && (
                <Text element={{ size: 'sm' }}>Password updated.</Text>
              )}
              {pwStatus?.error && (
                <Text element={{ size: 'sm' }}>{pwStatus.error}</Text>
              )}
            </div>
            <Button
              variant="primary"
              onClick={async () => {
                if (!pwValue) return
                const result = await updatePassword(pwValue)
                if ('error' in result) setPwStatus({ error: result.error })
                else {
                  setPwStatus({ success: true })
                  setPwValue('')
                }
              }}
            >
              Update Password
            </Button>
          </Stack>
        </Stack>
      </Card>
      <Card>
        <Stack spacing="md">
          <Text element={{ size: 'lg' }} weight="semibold">
            Data
          </Text>
          <Divider />
          <Text element={{ size: 'sm' }}>
            Download a copy of your data for backup or portability.
          </Text>
          <a href="/api/export">
            <Button variant="tertiary" type="button">
              Export My Data
            </Button>
          </a>
        </Stack>
      </Card>
      <Card>
        <Stack spacing="md">
          <Text element={{ size: 'lg' }} weight="semibold">
            Notifications
          </Text>
          <Divider />
          <form action={updateNotificationPrefs}>
            <Stack spacing="sm">
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  name="notify_new_leads"
                  defaultChecked={notificationPrefs.notify_new_leads}
                />
                <Text element={{ size: 'sm' }}>
                  Email me when a new lead comes in
                </Text>
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  name="notify_new_tickets"
                  defaultChecked={notificationPrefs.notify_new_tickets}
                />
                <Text element={{ size: 'sm' }}>
                  Email me when a support ticket is created
                </Text>
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  name="notify_ticket_updates"
                  defaultChecked={notificationPrefs.notify_ticket_updates}
                />
                <Text element={{ size: 'sm' }}>
                  Email me when a ticket status changes
                </Text>
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  name="notify_slack"
                  defaultChecked={notificationPrefs.notify_slack}
                />
                <Text element={{ size: 'sm' }}>Slack notifications</Text>
              </label>
              <Button variant="primary" type="submit">
                Save Notification Preferences
              </Button>
            </Stack>
          </form>
        </Stack>
      </Card>
    </Stack>
  )
}

const SecurityTab = ({
  factors,
}: {
  factors: {
    id: string
    type: string
    created_at: string
    friendly_name?: string | null
  }[]
}) => (
  <Stack spacing="md">
    <MfaPanel factors={factors} />
  </Stack>
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
            API keys let external services authenticate against Nova Mir APIs.
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
        <div role="status" aria-live="polite">
          {createResult?.error && (
            <Text element={{ size: 'sm' }}>{createResult.error}</Text>
          )}
        </div>
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
