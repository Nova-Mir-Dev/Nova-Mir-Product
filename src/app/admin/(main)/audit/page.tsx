import { Button, Card, Input, Stack, Text } from 'azimuth-ui'
import { createClient } from '@/lib/supabase-server'

interface AuditEntry {
  id: string
  action: string
  client_name: string
  performed_by: string
  timestamp: string
  details: string
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{
    action?: string
    client?: string
    from?: string
    to?: string
  }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('activity_logs')
    .select('*')
    .order('timestamp', { ascending: false })

  if (params.from) query = query.gte('timestamp', params.from)
  if (params.to) query = query.lte('timestamp', params.to)

  const { data: entries } = await query

  let filtered = (entries ?? []) as AuditEntry[]

  const actionFilter = params.action?.toLowerCase()
  if (actionFilter) {
    filtered = filtered.filter((e) =>
      e.action?.toLowerCase().includes(actionFilter),
    )
  }

  const clientFilter = params.client?.toLowerCase()
  if (clientFilter) {
    filtered = filtered.filter((e) =>
      e.client_name?.toLowerCase().includes(clientFilter),
    )
  }

  return (
    <Stack spacing="md">
      <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
        Audit Log
      </Text>

      <form
        method="GET"
        style={{
          display: 'flex',
          gap: 'var(--azimuth-spacing-sm)',
          flexWrap: 'wrap',
        }}
      >
        <Input
          label={{ text: 'Action' }}
          name="action"
          defaultValue={params.action || ''}
          placeholder="Filter by action..."
        />
        <Input
          label={{ text: 'Client' }}
          name="client"
          defaultValue={params.client || ''}
          placeholder="Filter by client..."
        />
        <Input
          label={{ text: 'From' }}
          name="from"
          defaultValue={params.from || ''}
          type="date"
        />
        <Input
          label={{ text: 'To' }}
          name="to"
          defaultValue={params.to || ''}
          type="date"
        />
        <Button variant="primary" type="submit">
          Filter
        </Button>
        {(params.action || params.client || params.from || params.to) && (
          <a href="/admin/audit">
            <Button variant="tertiary" type="button">
              Clear
            </Button>
          </a>
        )}
      </form>

      {filtered.length === 0 ? (
        <Text>No audit entries found.</Text>
      ) : (
        <Stack spacing="sm">
          {filtered.map((entry) => (
            <Card key={entry.id}>
              <Stack spacing="xs">
                <Text element={{ size: 'sm' }} weight="semibold">
                  {entry.action}
                </Text>
                <Text element={{ size: 'sm' }}>
                  Client: {entry.client_name} — By: {entry.performed_by}
                </Text>
                <Text element={{ size: 'sm' }}>
                  {new Date(entry.timestamp).toLocaleString()}
                </Text>
                <Text element={{ size: 'sm' }}>{entry.details}</Text>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  )
}
