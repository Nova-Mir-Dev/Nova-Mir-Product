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

interface PricingTier {
  id: string
  name: string
  slug: string
  starting_price: number
  description: string | null
  features: string[]
  founding_note: string | null
  is_featured: boolean
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

interface PricingPageProps {
  tiers: PricingTier[]
}

function emptyForm() {
  return {
    name: '',
    starting_price: 0,
    description: '',
    features: '',
    founding_note: '',
    is_featured: false,
    sort_order: 0,
    is_published: true,
  }
}

export function PricingPage({ tiers: initial }: PricingPageProps) {
  const [tiers, setTiers] = useState(initial)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const { page, setPage, totalPages, pageData } = useClientPagination(
    tiers,
    20,
  )

  const resetForm = () => {
    setForm(emptyForm())
    setEditingId(null)
    setCreating(false)
  }

  const handleEdit = (tier: PricingTier) => {
    setForm({
      name: tier.name,
      starting_price: tier.starting_price,
      description: tier.description ?? '',
      features: (tier.features ?? []).join('\n'),
      founding_note: tier.founding_note ?? '',
      is_featured: tier.is_featured,
      sort_order: tier.sort_order,
      is_published: tier.is_published,
    })
    setEditingId(tier.id)
    setCreating(false)
  }

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const body = {
        name: form.name,
        starting_price: form.starting_price,
        description: form.description || null,
        features: form.features
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
        founding_note: form.founding_note || null,
        is_featured: form.is_featured,
        sort_order: form.sort_order,
        is_published: form.is_published,
      }

      if (editingId) {
        const res = await fetch('/api/admin/content/pricing', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...body }),
        })
        if (!res.ok) throw new Error('Failed to update')
        const updated = await res.json()
        setTiers((prev) => prev.map((t) => (t.id === editingId ? updated : t)))
      } else {
        const res = await fetch('/api/admin/content/pricing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error('Failed to create')
        const created = await res.json()
        setTiers((prev) => [...prev, created])
      }
      resetForm()
    } catch {
      alert('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }, [editingId, form])

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Delete this pricing tier? This cannot be undone.')) return
      try {
        const res = await fetch(`/api/admin/content/pricing?id=${id}`, {
          method: 'DELETE',
        })
        if (!res.ok) throw new Error('Failed to delete')
        setTiers((prev) => prev.filter((t) => t.id !== id))
        if (editingId === id) resetForm()
      } catch {
        alert('Failed to delete. Please try again.')
      }
    },
    [editingId],
  )

  const truncate = (text: string, max: number) =>
    text.length > max ? text.slice(0, max) + '...' : text

  const columns: Column<PricingTier>[] = [
    {
      key: 'name',
      title: 'Name',
      render: (_, row) => truncate(row.name, 40),
    },
    {
      key: 'starting_price',
      title: 'Starting Price',
      render: (_, row) => `$${row.starting_price.toLocaleString()}`,
    },
    {
      key: 'is_featured',
      title: 'Popular',
      render: (_, row) =>
        row.is_featured ? (
          <Badge variant="success">Yes</Badge>
        ) : (
          <Text color="muted">—</Text>
        ),
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
          <Button
            variant="tertiary"
            size="sm"
            type="button"
            onClick={() => handleEdit(row)}
          >
            Edit
          </Button>
          <Button
            variant="tertiary"
            size="sm"
            type="button"
            onClick={() => handleDelete(row.id)}
          >
            Delete
          </Button>
        </Stack>
      ),
    },
  ]

  return (
    <Stack spacing="md">
      <Stack
        direction="horizontal"
        spacing="md"
        style={{ justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
          Pricing Tiers
        </Text>
        <Button
          variant="primary"
          type="button"
          onClick={() => {
            resetForm()
            setCreating(true)
          }}
        >
          Add Pricing Tier
        </Button>
      </Stack>

      {(creating || editingId) && (
        <Card>
          <Stack spacing="sm">
            <Text weight="semibold">
              {editingId ? 'Edit Pricing Tier' : 'New Pricing Tier'}
            </Text>
            <Stack direction="horizontal" spacing="md">
              <Input
                label={{ text: 'Name' }}
                name="name"
                value={{
                  value: form.name,
                  onChange: (e) =>
                    setForm((f) => ({ ...f, name: e.target.value })),
                }}
              />
              <Input
                label={{ text: 'Starting Price ($)' }}
                name="starting_price"
                type="number"
                value={{
                  value: String(form.starting_price),
                  onChange: (e) =>
                    setForm((f) => ({
                      ...f,
                      starting_price: Number(e.target.value),
                    })),
                }}
              />
            </Stack>
            <Input
              label={{ text: 'Description' }}
              name="description"
              value={{
                value: form.description,
                onChange: (e) =>
                  setForm((f) => ({ ...f, description: e.target.value })),
              }}
            />
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              <Text element={{ size: 'sm' }}>Features (one per line)</Text>
              <textarea
                name="features"
                value={form.features}
                onChange={(e) =>
                  setForm((f) => ({ ...f, features: e.target.value }))
                }
                style={{
                  minHeight: '6rem',
                  padding: '0.5rem',
                  borderRadius: 'var(--azimuth-radius)',
                  border: '1px solid var(--azimuth-color-border)',
                  background: 'var(--azimuth-color-background)',
                  color: 'var(--azimuth-color-text)',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                }}
              />
            </label>
            <Stack direction="horizontal" spacing="md">
              <Input
                label={{ text: 'Founding Note' }}
                name="founding_note"
                value={{
                  value: form.founding_note,
                  onChange: (e) =>
                    setForm((f) => ({ ...f, founding_note: e.target.value })),
                }}
              />
              <Input
                label={{ text: 'Sort Order' }}
                name="sort_order"
                type="number"
                value={{
                  value: String(form.sort_order),
                  onChange: (e) =>
                    setForm((f) => ({
                      ...f,
                      sort_order: Number(e.target.value),
                    })),
                }}
              />
            </Stack>
            <Stack direction="horizontal" spacing="lg">
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, is_published: e.target.checked }))
                  }
                />
                <Text element={{ size: 'sm' }}>Published</Text>
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, is_featured: e.target.checked }))
                  }
                />
                <Text element={{ size: 'sm' }}>Popular Badge</Text>
              </label>
            </Stack>
            <Stack direction="horizontal" spacing="xs">
              <Button
                variant="primary"
                type="button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="tertiary" type="button" onClick={resetForm}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Card>
      )}

      {tiers.length === 0 ? (
        <EmptyState
          title="No pricing tiers"
          description="Add your first pricing tier to display on the site."
        />
      ) : (
        <>
          <DataTable
            data={{ columns, data: pageData }}
            pagination={{
              virtual: { enabled: true, threshold: 50, maxHeight: 600 },
            }}
          />
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              showFirstLast
            />
          )}
        </>
      )}
    </Stack>
  )
}
