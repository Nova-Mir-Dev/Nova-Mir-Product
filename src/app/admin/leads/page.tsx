'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Container, Stack, Text } from 'azimuth-ui'

interface Lead {
  id: string
  name: string
  email: string
  business_name: string
  phone: string | null
  service_interest: string | null
  budget_range: string | null
  message: string
  status: string
  source: string
  created_at: string
  updated_at: string
}

const STATUSES = [
  'new',
  'contacted',
  'qualified',
  'proposal',
  'negotiation',
  'won',
  'lost',
] as const

const STATUS_COLORS: Record<string, string> = {
  new: 'var(--azimuth-color-primary)',
  contacted: '#ca8a04',
  qualified: '#0d9488',
  proposal: '#9333ea',
  negotiation: '#ea580c',
  won: 'var(--azimuth-color-success)',
  lost: 'var(--azimuth-color-danger)',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function statusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export default function LeadTrackerPage() {
  const [allLeads, setAllLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const leads = statusFilter
    ? allLeads.filter((l) => l.status === statusFilter)
    : allLeads

  const statusCounts: Record<string, number> = { all: allLeads.length }
  for (const lead of allLeads) {
    statusCounts[lead.status] = (statusCounts[lead.status] ?? 0) + 1
  }

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/leads?limit=1000')
      if (!res.ok) throw new Error('Failed to fetch leads')
      const json = await res.json()
      setAllLeads(json.data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const handleStatusChange = useCallback(
    async (leadId: string, newStatus: string) => {
      const previous = allLeads
      setAllLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)),
      )
      setUpdatingId(leadId)
      try {
        const res = await fetch(`/api/leads/${leadId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        })
        if (!res.ok) throw new Error('Failed to update')
      } catch {
        setAllLeads(previous)
      } finally {
        setUpdatingId(null)
      }
    },
    [allLeads],
  )

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }, [])

  return (
    <Container style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem' }}>
      <Stack spacing="lg">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Stack spacing="xs">
            <Text element={{ as: 'h1', size: 'h2' }} weight="bold">
              Lead Tracker
            </Text>
            <Text element={{ size: 'sm' }} color="secondary">
              {allLeads.length} lead{allLeads.length !== 1 ? 's' : ''}
              {statusFilter
                ? ` (filtered by ${statusLabel(statusFilter)})`
                : ''}
            </Text>
          </Stack>
          <Button variant="secondary" onClick={fetchLeads}>
            Refresh
          </Button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {(['all', ...STATUSES] as const).map((s) => {
            const key = s === 'all' ? '' : s
            const active = s === 'all' ? !statusFilter : statusFilter === s
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(key)}
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: 'var(--azimuth-radius)',
                  border: `1px solid ${active ? 'var(--azimuth-color-primary)' : 'var(--azimuth-color-border)'}`,
                  background: active
                    ? 'var(--azimuth-color-primary)'
                    : 'transparent',
                  color: active
                    ? 'var(--azimuth-color-on-primary)'
                    : 'var(--azimuth-color-text)',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  transition: 'all 150ms ease',
                }}
              >
                {s === 'all' ? 'All' : statusLabel(s)}
                {statusCounts[s] !== undefined && (
                  <span style={{ marginLeft: '0.375rem', opacity: 0.7 }}>
                    ({statusCounts[s]})
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {error && (
          <Text
            element={{ size: 'sm' }}
            style={{ color: 'var(--azimuth-color-danger)' }}
          >
            {error}
          </Text>
        )}

        {loading && (
          <Text element={{ size: 'sm' }} color="secondary">
            Loading leads...
          </Text>
        )}

        {!loading && !error && leads.length === 0 && (
          <Card style={{ padding: '3rem', textAlign: 'center' }}>
            <Stack spacing="sm">
              <Text element={{ size: 'lg' }} weight="medium">
                No leads found
              </Text>
              <Text element={{ size: 'sm' }} color="secondary">
                {statusFilter
                  ? `No leads with status "${statusLabel(statusFilter)}". Try a different filter.`
                  : 'No leads have been submitted yet.'}
              </Text>
            </Stack>
          </Card>
        )}

        {!loading && leads.length > 0 && (
          <Card style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.875rem',
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--azimuth-color-border)',
                    }}
                  >
                    {[
                      'Name',
                      'Business',
                      'Email',
                      'Phone',
                      'Service',
                      'Budget',
                      'Status',
                      'Date',
                      '',
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: 'left',
                          padding: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--azimuth-color-text-secondary)',
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <>
                      <tr
                        key={lead.id}
                        onClick={() => toggleExpand(lead.id)}
                        style={{
                          borderBottom: '1px solid var(--azimuth-color-border)',
                          cursor: 'pointer',
                          transition: 'background 150ms ease',
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            'color-mix(in srgb, var(--azimuth-color-muted) 50%, transparent)')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = 'transparent')
                        }
                      >
                        <td
                          style={{
                            padding: '0.75rem',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {lead.name}
                        </td>
                        <td
                          style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}
                        >
                          {lead.business_name}
                        </td>
                        <td
                          style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}
                        >
                          {lead.email}
                        </td>
                        <td
                          style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}
                        >
                          {lead.phone ?? '—'}
                        </td>
                        <td
                          style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}
                        >
                          {lead.service_interest ?? '—'}
                        </td>
                        <td
                          style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}
                        >
                          {lead.budget_range ?? '—'}
                        </td>
                        <td
                          style={{ padding: '0.75rem' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              handleStatusChange(lead.id, e.target.value)
                            }
                            disabled={updatingId === lead.id}
                            style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: 'var(--azimuth-radius)',
                              border: `1px solid ${STATUS_COLORS[lead.status] ?? 'var(--azimuth-color-border)'}`,
                              background:
                                STATUS_COLORS[lead.status] ??
                                'var(--azimuth-color-surface)',
                              color: '#fff',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              appearance: 'auto',
                            }}
                          >
                            {STATUSES.map((s) => (
                              <option
                                key={s}
                                value={s}
                                style={{ background: '#fff', color: '#000' }}
                              >
                                {statusLabel(s)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td
                          style={{
                            padding: '0.75rem',
                            whiteSpace: 'nowrap',
                            color: 'var(--azimuth-color-text-secondary)',
                          }}
                        >
                          {formatDate(lead.created_at)}
                        </td>
                        <td
                          style={{
                            padding: '0.75rem',
                            fontSize: '0.75rem',
                            color: 'var(--azimuth-color-text-secondary)',
                          }}
                        >
                          {expandedId === lead.id ? '▲' : '▼'}
                        </td>
                      </tr>
                      {expandedId === lead.id && (
                        <tr key={`${lead.id}-detail`}>
                          <td
                            colSpan={9}
                            style={{
                              padding: '1rem 0.75rem',
                              background:
                                'color-mix(in srgb, var(--azimuth-color-muted) 50%, transparent)',
                            }}
                          >
                            <Stack spacing="sm">
                              <Text element={{ size: 'sm' }} weight="semibold">
                                Message
                              </Text>
                              <Text
                                element={{ size: 'sm' }}
                                style={{
                                  lineHeight: 1.6,
                                  whiteSpace: 'pre-wrap',
                                }}
                              >
                                {lead.message}
                              </Text>
                              <div
                                style={{
                                  display: 'flex',
                                  gap: '2rem',
                                  flexWrap: 'wrap',
                                  marginTop: '0.5rem',
                                }}
                              >
                                {lead.service_interest && (
                                  <div>
                                    <Text
                                      element={{ size: 'xs' }}
                                      color="secondary"
                                      weight="semibold"
                                    >
                                      Service Interest
                                    </Text>
                                    <Text element={{ size: 'sm' }}>
                                      {lead.service_interest}
                                    </Text>
                                  </div>
                                )}
                                {lead.budget_range && (
                                  <div>
                                    <Text
                                      element={{ size: 'xs' }}
                                      color="secondary"
                                      weight="semibold"
                                    >
                                      Budget Range
                                    </Text>
                                    <Text element={{ size: 'sm' }}>
                                      {lead.budget_range}
                                    </Text>
                                  </div>
                                )}
                                <div>
                                  <Text
                                    element={{ size: 'xs' }}
                                    color="secondary"
                                    weight="semibold"
                                  >
                                    Source
                                  </Text>
                                  <Text element={{ size: 'sm' }}>
                                    {lead.source}
                                  </Text>
                                </div>
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  gap: '2rem',
                                  flexWrap: 'wrap',
                                }}
                              >
                                <div>
                                  <Text
                                    element={{ size: 'xs' }}
                                    color="secondary"
                                    weight="semibold"
                                  >
                                    Created
                                  </Text>
                                  <Text element={{ size: 'sm' }}>
                                    {formatDate(lead.created_at)}
                                  </Text>
                                </div>
                                <div>
                                  <Text
                                    element={{ size: 'xs' }}
                                    color="secondary"
                                    weight="semibold"
                                  >
                                    Updated
                                  </Text>
                                  <Text element={{ size: 'sm' }}>
                                    {formatDate(lead.updated_at)}
                                  </Text>
                                </div>
                              </div>
                            </Stack>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </Stack>
    </Container>
  )
}
