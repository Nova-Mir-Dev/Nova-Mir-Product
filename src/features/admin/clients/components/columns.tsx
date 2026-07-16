import { Badge } from 'azimuth-ui'
import type { Project, Invoice, SupportTicket } from '@/features/admin/types'
import {
  projectStatusVariant,
  invoiceStatusVariant,
  ticketStatusVariant,
} from './status-variants'

export const projectColumns = [
  { key: 'name', title: 'Name', sortable: true },
  {
    key: 'status',
    title: 'Status',
    sortable: true,
    render: (_: unknown, row: unknown) => {
      const p = row as Project
      return (
        <Badge variant={projectStatusVariant(p.status)}>
          {p.status.replace(/_/g, ' ')}
        </Badge>
      )
    },
  },
  {
    key: 'progress',
    title: 'Progress',
    sortable: true,
    render: (value: unknown) =>
      value !== null && typeof value === 'number' ? `${value}%` : '—',
  },
  {
    key: 'deadline',
    title: 'Deadline',
    sortable: true,
    render: (value: unknown) =>
      value ? new Date(value as string).toLocaleDateString('en-US') : '—',
  },
]

export const invoiceColumns = [
  { key: 'client_name', title: 'Client', sortable: true },
  {
    key: 'amount',
    title: 'Amount',
    sortable: true,
    render: (value: unknown) => `$${(value as number).toFixed(2)}`,
  },
  {
    key: 'date',
    title: 'Date',
    sortable: true,
    render: (value: unknown) =>
      new Date(String(value)).toLocaleDateString('en-US'),
  },
  {
    key: 'status',
    title: 'Status',
    sortable: true,
    render: (_: unknown, row: unknown) => {
      const inv = row as Invoice
      return (
        <Badge variant={invoiceStatusVariant(inv.status)}>{inv.status}</Badge>
      )
    },
  },
]

export const ticketColumns = [
  { key: 'subject', title: 'Subject', sortable: true },
  {
    key: 'status',
    title: 'Status',
    sortable: true,
    render: (_: unknown, row: unknown) => {
      const t = row as SupportTicket
      return (
        <Badge variant={ticketStatusVariant(t.status)}>
          {t.status.replace(/_/g, ' ')}
        </Badge>
      )
    },
  },
]

export const activityColumns = [
  { key: 'action', title: 'Action', sortable: true },
  { key: 'performed_by', title: 'Performed By', sortable: true },
  {
    key: 'timestamp',
    title: 'Timestamp',
    sortable: true,
    render: (value: unknown) => new Date(String(value)).toLocaleString('en-US'),
  },
  {
    key: 'details',
    title: 'Details',
    render: (value: unknown) => (value ? (value as string) : '—'),
  },
]
