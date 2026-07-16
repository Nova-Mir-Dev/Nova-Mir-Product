export type BadgeVariant =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'accent'

export const statusBadgeVariant = (status: string): BadgeVariant => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'neutral'
    case 'pending':
      return 'warning'
    case 'suspended':
      return 'danger'
    default:
      return 'info'
  }
}

export const projectStatusVariant = (status: string): BadgeVariant => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'success'
    case 'in_progress':
      return 'info'
    case 'on_hold':
      return 'warning'
    case 'cancelled':
      return 'danger'
    default:
      return 'neutral'
  }
}

export const invoiceStatusVariant = (status: string): BadgeVariant => {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'success'
    case 'pending':
      return 'warning'
    case 'overdue':
      return 'danger'
    default:
      return 'neutral'
  }
}

export const ticketStatusVariant = (status: string): BadgeVariant => {
  switch (status.toLowerCase()) {
    case 'open':
      return 'info'
    case 'in_progress':
      return 'warning'
    case 'resolved':
      return 'success'
    case 'closed':
      return 'neutral'
    default:
      return 'neutral'
  }
}
