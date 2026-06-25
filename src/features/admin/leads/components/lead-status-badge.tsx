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
  proposal: 'accent',
  negotiation: 'warning',
  won: 'success',
  lost: 'neutral',
}

export function LeadStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={variantMap[status.toLowerCase()] ?? 'info'}>{status}</Badge>
  )
}
