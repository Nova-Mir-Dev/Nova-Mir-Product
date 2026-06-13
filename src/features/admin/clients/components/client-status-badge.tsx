import { Badge } from 'azimuth-ui'

type BadgeVariant =
  | 'neutral'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'

const variantMap: Record<string, BadgeVariant> = {
  active: 'success',
  inactive: 'neutral',
  pending: 'warning',
  suspended: 'danger',
}

export function ClientStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={variantMap[status.toLowerCase()] ?? 'info'}>{status}</Badge>
  )
}
