'use client'

import { useEffect, useState } from 'react'
import { Card, Stack, Text } from 'azimuth-ui'

interface DsarEvent {
  id: string
  action: string
  metadata: Record<string, unknown>
  created_at: string
}

export function DsarPage() {
  const [events, setEvents] = useState<DsarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/compliance/dsar')
      const data = await res.json()
      if (data.events) setEvents(data.events)
      setLoading(false)
    }
    void load()
  }, [])

  if (loading) return <Text>Loading...</Text>

  return (
    <Stack spacing="lg">
      <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
        Data Subject Access Requests (DSAR)
      </Text>
      <Card>
        {events.length === 0 ? (
          <Text color="secondary">No DSAR requests found.</Text>
        ) : (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '8px',
                      borderBottom: '1px solid var(--azimuth-color-border)',
                    }}
                  >
                    Date
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '8px',
                      borderBottom: '1px solid var(--azimuth-color-border)',
                    }}
                  >
                    Type
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '8px',
                      borderBottom: '1px solid var(--azimuth-color-border)',
                    }}
                  >
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const type = event.action.replace('dsar_', '')
                  const meta = event.metadata as {
                    email?: string
                    user_id?: string
                  }
                  return (
                    <tr key={event.id}>
                      <td
                        style={{
                          padding: '8px',
                          borderBottom: '1px solid var(--azimuth-color-border)',
                        }}
                      >
                        <Text element={{ size: 'sm' }}>
                          {new Date(event.created_at).toLocaleDateString()}
                        </Text>
                      </td>
                      <td
                        style={{
                          padding: '8px',
                          borderBottom: '1px solid var(--azimuth-color-border)',
                        }}
                      >
                        <Text element={{ size: 'sm' }}>{type}</Text>
                      </td>
                      <td
                        style={{
                          padding: '8px',
                          borderBottom: '1px solid var(--azimuth-color-border)',
                        }}
                      >
                        <Text element={{ size: 'sm' }} color="secondary">
                          {meta.email ?? meta.user_id ?? '-'}
                        </Text>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </Stack>
  )
}
