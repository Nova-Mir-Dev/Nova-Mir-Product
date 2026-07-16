'use client'

import { Card, Stack, Text, Badge } from 'azimuth-ui'

interface AdminUser {
  id: string
  email: string
  name: string | null
  role: string
  created_at: string
}

export function AdminList({ admins }: { admins: AdminUser[] }) {
  return (
    <Card>
      <Stack spacing="md">
        <Text element={{ as: 'h2', size: 'h4' }} weight="semibold">
          Current Admins
        </Text>
        {admins.length === 0 ? (
          <Text element={{ size: 'sm' }} color="secondary">
            No admin users yet.
          </Text>
        ) : (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '0.5rem',
                      borderBottom: '1px solid var(--azimuth-color-border)',
                    }}
                  >
                    <Text element={{ size: 'xs' }} weight="semibold">
                      Name
                    </Text>
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '0.5rem',
                      borderBottom: '1px solid var(--azimuth-color-border)',
                    }}
                  >
                    <Text element={{ size: 'xs' }} weight="semibold">
                      Email
                    </Text>
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '0.5rem',
                      borderBottom: '1px solid var(--azimuth-color-border)',
                    }}
                  >
                    <Text element={{ size: 'xs' }} weight="semibold">
                      Role
                    </Text>
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '0.5rem',
                      borderBottom: '1px solid var(--azimuth-color-border)',
                    }}
                  >
                    <Text element={{ size: 'xs' }} weight="semibold">
                      Created
                    </Text>
                  </th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a) => (
                  <tr key={a.id}>
                    <td
                      style={{
                        padding: '0.5rem',
                        borderBottom: '1px solid var(--azimuth-color-border)',
                      }}
                    >
                      <Text element={{ size: 'sm' }}>{a.name || '—'}</Text>
                    </td>
                    <td
                      style={{
                        padding: '0.5rem',
                        borderBottom: '1px solid var(--azimuth-color-border)',
                      }}
                    >
                      <Text element={{ size: 'sm' }}>{a.email}</Text>
                    </td>
                    <td
                      style={{
                        padding: '0.5rem',
                        borderBottom: '1px solid var(--azimuth-color-border)',
                      }}
                    >
                      <Badge
                        variant={a.role === 'admin' ? 'accent' : 'neutral'}
                      >
                        {a.role === 'admin' ? 'Admin' : a.role}
                      </Badge>
                    </td>
                    <td
                      style={{
                        padding: '0.5rem',
                        borderBottom: '1px solid var(--azimuth-color-border)',
                      }}
                    >
                      <Text element={{ size: 'xs' }} color="secondary">
                        {new Date(a.created_at).toLocaleDateString('en-US')}
                      </Text>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Stack>
    </Card>
  )
}
