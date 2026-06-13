import { Badge } from 'azimuth-ui'

type BadgeVariant =
  | 'neutral'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'

const variantMap: Record<string, BadgeVariant> = {
  new: 'info',
  contacted: 'warning',
  qualified: 'accent',
  converted: 'success',
  closed: 'neutral',
}

export function LeadStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={variantMap[status.toLowerCase()] ?? 'info'}>{status}</Badge>
  )
}
