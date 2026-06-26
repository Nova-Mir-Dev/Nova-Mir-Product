import { Button, Card, Input, Stack, Text } from 'azimuth-ui'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { MfaPanel } from '@/features/auth/mfa-panel'
import { listMfaFactors } from '@/features/auth/mfa'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/clients/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('name, email')
    .eq('id', user.id)
    .single()

  const factorsResult = await listMfaFactors()
  const factors: { id: string; type: string; created_at: string }[] =
    factorsResult && 'all' in factorsResult
      ? factorsResult.all
          .filter((f) => f.status === 'verified')
          .map((f) => ({
            id: f.id,
            type: f.factor_type,
            created_at: f.created_at,
          }))
      : []

  return (
    <Stack spacing="lg">
      <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
        Settings
      </Text>

      <Card>
        <Stack spacing="md">
          <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
            Profile
          </Text>
          <Stack spacing="sm">
            <Text element={{ size: 'sm' }} color="secondary">
              Name
            </Text>
            <Text weight="semibold">
              {(profile as { name?: string } | null)?.name ?? 'Not set'}
            </Text>
          </Stack>
          <Stack spacing="sm">
            <Text element={{ size: 'sm' }} color="secondary">
              Email
            </Text>
            <Text weight="semibold">{user.email}</Text>
          </Stack>
          <form>
            <Input
              label={{ text: 'Full Name' }}
              name="name"
              placeholder="Enter your name"
            />
            <div style={{ marginTop: 'var(--azimuth-space-sm)' }}>
              <Button variant="primary" type="submit">
                Save
              </Button>
            </div>
          </form>
        </Stack>
      </Card>

      <Card>
        <Stack spacing="md">
          <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
            Notifications
          </Text>
          <Stack spacing="sm">
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <input type="checkbox" defaultChecked />
              <Text element={{ size: 'sm' }}>Email notifications</Text>
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <input type="checkbox" defaultChecked />
              <Text element={{ size: 'sm' }}>Project updates</Text>
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <input type="checkbox" defaultChecked />
              <Text element={{ size: 'sm' }}>Invoice reminders</Text>
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <input type="checkbox" />
              <Text element={{ size: 'sm' }}>Marketing emails</Text>
            </label>
          </Stack>
        </Stack>
      </Card>

      <MfaPanel factors={factors} />

      <Card>
        <Stack spacing="md">
          <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
            Security
          </Text>
          <Stack spacing="sm">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <Text weight="semibold">Passkeys</Text>
                <Text element={{ size: 'sm' }} color="secondary">
                  Passwordless login with biometrics
                </Text>
              </div>
              <Button variant="tertiary" size="sm" type="button">
                Add Passkey
              </Button>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <Text weight="semibold">Active Sessions</Text>
                <Text element={{ size: 'sm' }} color="secondary">
                  Manage your logged-in devices
                </Text>
              </div>
              <Button variant="tertiary" size="sm" type="button">
                View Sessions
              </Button>
            </div>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  )
}
