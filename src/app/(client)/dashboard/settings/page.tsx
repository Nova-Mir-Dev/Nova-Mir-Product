import { Button, Card, Input, Stack, Text } from 'azimuth-ui'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { MfaPanel } from '@/features/auth/mfa-panel'
import { listMfaFactors } from '@/features/auth/mfa'
import { updateClientProfile, updateClientPassword } from './actions'

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
          .filter((f: { status: string }) => f.status === 'verified')
          .map((f: { factor_type: string; id: string; created_at: string }) => ({
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
              Email
            </Text>
            <Text weight="semibold">{user.email}</Text>
          </Stack>
          <form action={updateClientProfile}>
            <Stack spacing="sm">
              <Input
                label={{ text: 'Full Name' }}
                name="name"
                defaultValue={
                  (profile as { name?: string } | null)?.name ?? ''
                }
                placeholder="Enter your name"
              />
              <Button variant="primary" type="submit">
                Save
              </Button>
            </Stack>
          </form>
        </Stack>
      </Card>

      <Card>
        <Stack spacing="md">
          <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
            Password
          </Text>
          <Stack spacing="sm">
            <Text element={{ size: 'sm' }} color="secondary">
              Change your account password.
            </Text>
            <form action={updateClientPassword}>
              <Input
                label={{ text: 'New Password' }}
                name="password"
                type="password"
                placeholder="Enter new password"
              />
              <div style={{ marginTop: 'var(--azimuth-space-sm)' }}>
                <Button variant="primary" type="submit">
                  Update Password
                </Button>
              </div>
            </form>
          </Stack>
        </Stack>
      </Card>

      <Card>
        <Stack spacing="md">
          <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
            Two-Factor Authentication
          </Text>
          <MfaPanel factors={factors} />
        </Stack>
      </Card>

      <Card>
        <Stack spacing="md">
          <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
            Data
          </Text>
          <Stack spacing="sm">
            <Text element={{ size: 'sm' }} color="secondary">
              Download your data for backup or portability.
            </Text>
            <a href="/api/export">
              <Button variant="tertiary" type="button">
                Export My Data
              </Button>
            </a>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  )
}
