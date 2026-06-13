import { Badge, Card, Stack, Text } from 'azimuth-ui'
import type { MonitoringClient } from '@/features/admin/types'
import styles from './client-status-card.module.css'

interface ClientStatusCardProps {
  client: MonitoringClient
}

const statusVariant = (status: MonitoringClient['status']) => {
  if (status === 'healthy') return 'success'
  if (status === 'warning') return 'warning'
  return 'danger'
}

export default function ClientStatusCard({ client }: ClientStatusCardProps) {
  return (
    <Card>
      <Stack spacing="sm">
        <div className={styles.header}>
          <span className={styles.dot} data-status={client.status} />
          <Text weight="semibold">{client.name}</Text>
        </div>
        <Badge variant={statusVariant(client.status)} size="sm">
          {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
        </Badge>
        <Text element={{ size: 'sm' }}>Projects: {client.project_count}</Text>
      </Stack>
    </Card>
  )
}
