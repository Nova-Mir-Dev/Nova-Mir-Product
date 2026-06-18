'use client'

import { useCallback, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  Input,
  Pagination,
  Stack,
  Text,
} from 'azimuth-ui'
import { useClientPagination } from '@/features/admin/hooks/use-client-pagination'
import type { Column } from 'azimuth-ui'

interface HeroHeadline {
  id: string
  headline: string
  subtitle: string
  cta_label: string
  cta_href: string
  industry: string | null
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

interface HeroHeadlinesPageProps {
  headlines: HeroHeadline[]
}

const emptyForm = {
  headline: '',
  subtitle: '',
  cta_label: 'Get Started',
  cta_href: '/contact',
  industry: '',
  sort_order: 0,
  is_published: true,
}

export function HeroHeadlinesPage({ headlines: initial }: HeroHeadlinesPageProps) {
  const [headlines, setHeadlines] = useState(initial)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const { page, setPage, totalPages, pageData } = useClientPagination(headlines, 20)

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setCreating(false)
  }

  const handleEdit = (headline: HeroHeadline) => {
    setForm({
      headline: headline.headline,
      subtitle: headline.subtitle,
      cta_label: headline.cta_label,
      cta_href: headline.cta_href,
      industry: headline.industry ?? '',
      sort_order: headline.sort_order,
      is_published: headline.is_published,
    })
    setEditingId(headline.id)
    setCreating(false)
  }

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const body = {
        ...form,
        industry: form.industry || null,
      }

      if (editingId) {
        const res = await fetch('/api/admin/content/hero-headlines', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...body }),
        })
        if (!res.ok) throw new Error('Failed to update')
        const updated = await res.json()
        setHeadlines((prev) => prev.map((h) => (h.id === editingId ? updated : h)))
      } else {
        const res = await fetch('/api/admin/content/hero-headlines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error('Failed to create')
        const created = await res.json()
        setHeadlines((prev) => [...prev, created])
      }
      resetForm()
    } catch {
      alert('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }, [editingId, form])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this headline? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/admin/content/hero-headlines?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setHeadlines((prev) => prev.filter((h) => h.id !== id))
      if (editingId === id) resetForm()
    } catch {
      alert('Failed to delete. Please try again.')
    }
  }, [editingId])

  const truncate = (text: string, max: number) =>
    text.length > max ? text.slice(0, max) + '...' : text

  const columns: Column<HeroHeadline>[] = [
    {
      key: 'headline',
      title: 'Headline',
      render: (_, row) => truncate(row.headline, 60),
    },
    {
      key: 'industry',
      title: 'Industry',
      render: (_, row) =>
        row.industry ? <Badge variant="neutral">{row.industry}</Badge> : <Text color="muted">—</Text>,
    },
    {
      key: 'is_published',
      title: 'Published',
      render: (_, row) =>
        row.is_published ? (
          <Badge variant="success">Yes</Badge>
        ) : (
          <Badge variant="warning">No</Badge>
        ),
    },
    {
      key: 'sort_order',
      title: 'Sort',
      render: (_, row) => String(row.sort_order),
    },
    {
      key: 'actions',
      title: '',
      render: (_, row) => (
        <Stack direction="horizontal" spacing="xs">
          <Button variant="tertiary" size="sm" type="button" onClick={() => handleEdit(row)}>
            Edit
          </Button>
          <Button variant="tertiary" size="sm" type="button" onClick={() => handleDelete(row.id)}>
            Delete
          </Button>
        </Stack>
      ),
    },
  ]

  return (
    <Stack spacing="md">
      <Stack direction="horizontal" spacing="md" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
          Hero Headlines
        </Text>
        <Button variant="primary" type="button" onClick={() => { resetForm(); setCreating(true) }}>
          Add Headline
        </Button>
      </Stack>

      {(creating || editingId) && (
        <Card>
          <Stack spacing="sm">
            <Text weight="semibold">{editingId ? 'Edit Headline' : 'New Headline'}</Text>
            <Input
              label={{ text: 'Headline' }}
              name="headline"
              value={{ value: form.headline, onChange: (e) => setForm((f) => ({ ...f, headline: e.target.value })) }}
            />
            <Input
              label={{ text: 'Subtitle' }}
              name="subtitle"
              value={{ value: form.subtitle, onChange: (e) => setForm((f) => ({ ...f, subtitle: e.target.value })) }}
            />
            <Stack direction="horizontal" spacing="md">
              <Input
                label={{ text: 'CTA Label' }}
                name="cta_label"
                value={{ value: form.cta_label, onChange: (e) => setForm((f) => ({ ...f, cta_label: e.target.value })) }}
              />
              <Input
                label={{ text: 'CTA Href' }}
                name="cta_href"
                value={{ value: form.cta_href, onChange: (e) => setForm((f) => ({ ...f, cta_href: e.target.value })) }}
              />
            </Stack>
            <Stack direction="horizontal" spacing="md">
              <Input
                label={{ text: 'Industry Tag' }}
                name="industry"
                value={{ value: form.industry, onChange: (e) => setForm((f) => ({ ...f, industry: e.target.value })) }}
              />
              <Input
                label={{ text: 'Sort Order' }}
                name="sort_order"
                type="number"
                value={{ value: String(form.sort_order), onChange: (e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) })) }}
              />
            </Stack>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
              />
              <Text element={{ size: 'sm' }}>Published</Text>
            </label>
            <Stack direction="horizontal" spacing="xs">
              <Button variant="primary" type="button" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="tertiary" type="button" onClick={resetForm}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Card>
      )}

      {headlines.length === 0 ? (
        <EmptyState
          title="No hero headlines"
          description="Add your first rotating headline for the homepage hero."
        />
      ) : (
        <>
          <DataTable
            data={{ columns, data: pageData }}
            pagination={{ virtual: { enabled: true, threshold: 50, maxHeight: 600 } }}
          />
          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} showFirstLast />
          )}
        </>
      )}
    </Stack>
  )
}
