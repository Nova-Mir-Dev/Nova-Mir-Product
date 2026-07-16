'use client'

import { useState } from 'react'
import { Stack, Text, Card, Input, Button, Divider } from 'azimuth-ui'
import {
  updateProfile,
  updatePassword,
  updateNotificationPrefs,
} from '../actions'

export const ProfileTab = ({
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
          <Text element={{ as: 'h2', size: 'lg' }} weight="semibold">
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
          <Text element={{ as: 'h2', size: 'lg' }} weight="semibold">
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
          <Text element={{ as: 'h2', size: 'lg' }} weight="semibold">
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
          <Text element={{ as: 'h2', size: 'lg' }} weight="semibold">
            Notifications
          </Text>
          <Divider />
          <form action={updateNotificationPrefs}>
            <Stack spacing="sm">
              {[
                {
                  name: 'notify_new_leads',
                  label: 'Email me when a new lead comes in',
                },
                {
                  name: 'notify_new_tickets',
                  label: 'Email me when a support ticket is created',
                },
                {
                  name: 'notify_ticket_updates',
                  label: 'Email me when a ticket status changes',
                },
                { name: 'notify_slack', label: 'Slack notifications' },
              ].map((pref) => (
                <label
                  key={pref.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    name={pref.name}
                    defaultChecked={notificationPrefs[pref.name]}
                  />
                  <Text element={{ size: 'sm' }}>{pref.label}</Text>
                </label>
              ))}
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
