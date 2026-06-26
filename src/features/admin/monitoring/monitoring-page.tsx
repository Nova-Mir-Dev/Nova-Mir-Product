import { EmptyState, Grid, KPICard, Stack, Text } from 'azimuth-ui'
import type { MonitoringClient } from '@/features/admin/types'
import ClientStatusCard from './components/client-status-card'

interface MonitoringPageProps {
  clients: MonitoringClient[]
}

const kpiData = (clients: MonitoringClient[]) => {
  const total = clients.length
  const healthy = clients.filter((c) => c.status === 'healthy').length
  const warning = clients.filter((c) => c.status === 'warning').length
  const down = clients.filter((c) => c.status === 'down').length
  return { total, healthy, warning, down }
}

export default function MonitoringPage({ clients }: MonitoringPageProps) {
  const { total, healthy, warning, down } = kpiData(clients)

  return (
    <Stack spacing="md">
      <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
        Site Monitoring
      </Text>

      <Grid cols={{ base: 1, sm: 2, lg: 4 }} gap="var(--azimuth-space-md)">
        <KPICard value={String(total)} label="Total Sites" variant="default" />
        <KPICard value={String(healthy)} label="Healthy" variant="success" />
        <KPICard value={String(warning)} label="Warning" variant="warning" />
        <KPICard value={String(down)} label="Down" variant="danger" />
      </Grid>

      {clients.length === 0 ? (
        <EmptyState
          title="No Clients"
          description="Add clients to start monitoring their site status."
        />
      ) : (
        <Grid cols={{ base: 1, sm: 2, lg: 3 }} gap="var(--azimuth-space-md)">
          {clients.map((client) => (
            <ClientStatusCard key={client.id} client={client} />
          ))}
        </Grid>
      )}
    </Stack>
  )
}
