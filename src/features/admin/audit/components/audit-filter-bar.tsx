'use client'

import { Input, Button } from 'azimuth-ui'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import styles from './audit-filter-bar.module.css'

export interface AuditFilterBarProps {
  searchParams: { action?: string; client?: string; from?: string; to?: string }
}

export const AuditFilterBar = ({ searchParams }: AuditFilterBarProps) => {
  const router = useRouter()

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const form = new FormData(e.currentTarget)
      const params = new URLSearchParams()
      const action = form.get('action') as string
      const client = form.get('client') as string
      const from = form.get('from') as string
      const to = form.get('to') as string
      if (action) params.set('action', action)
      if (client) params.set('client', client)
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      const qs = params.toString()
      router.push(qs ? `/admin/audit?${qs}` : '/admin/audit')
    },
    [router],
  )

  const hasFilters = !!(
    searchParams.action ||
    searchParams.client ||
    searchParams.from ||
    searchParams.to
  )

  return (
    <form onSubmit={handleSubmit} className={styles.filterForm}>
      <Input
        label={{ text: 'Action' }}
        name="action"
        defaultValue={searchParams.action || ''}
        placeholder="Filter by action..."
      />
      <Input
        label={{ text: 'Client' }}
        name="client"
        defaultValue={searchParams.client || ''}
        placeholder="Filter by client..."
      />
      <Input
        label={{ text: 'From' }}
        name="from"
        defaultValue={searchParams.from || ''}
        type="date"
      />
      <Input
        label={{ text: 'To' }}
        name="to"
        defaultValue={searchParams.to || ''}
        type="date"
      />
      <div className={styles.filterActions}>
        <Button variant="primary" type="submit">
          Filter
        </Button>
        {hasFilters && (
          <Button
            variant="tertiary"
            type="button"
            onClick={() => router.push('/admin/audit')}
          >
            Clear
          </Button>
        )}
      </div>
    </form>
  )
}
