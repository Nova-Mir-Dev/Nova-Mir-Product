'use client'

import { useCallback, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  FileUpload,
  Input,
  Pagination,
  Select,
  Stack,
  Text,
} from 'azimuth-ui'
import { useClientPagination } from '@/features/admin/hooks/use-client-pagination'
import type { Column } from 'azimuth-ui'

interface PortfolioProject {
  id: string
  title: string
  slug: string
  description: string | null
  href: string | null
  thumbnail_url: string | null
  status: string
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

interface PortfolioPageProps {
  projects: PortfolioProject[]
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

const emptyForm: {
  title: string
  slug: string
  description: string
  href: string
  thumbnail_url: string
  status: 'draft' | 'published'
  sort_order: number
  is_published: boolean
} = {
  title: '',
  slug: '',
  description: '',
  href: '',
  thumbnail_url: '',
  status: 'draft',
  sort_order: 0,
  is_published: true,
}

export function PortfolioPage({ projects: initial }: PortfolioPageProps) {
  const [projects, setProjects] = useState(initial)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const { page, setPage, totalPages, pageData } = useClientPagination(
    projects,
    20,
  )

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setCreating(false)
  }

  const handleEdit = (project: PortfolioProject) => {
    setForm({
      title: project.title,
      slug: project.slug,
      description: project.description ?? '',
      href: project.href ?? '',
      thumbnail_url: project.thumbnail_url ?? '',
      status: project.status as 'draft' | 'published',
      sort_order: project.sort_order,
      is_published: project.is_published,
    })
    setEditingId(project.id)
    setCreating(false)
  }

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      if (editingId) {
        const res = await fetch('/api/admin/content/portfolio', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...form }),
        })
        if (!res.ok) throw new Error('Failed to update')
        const updated = await res.json()
        setProjects((prev) =>
          prev.map((p) => (p.id === editingId ? updated : p)),
        )
      } else {
        const res = await fetch('/api/admin/content/portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error('Failed to create')
        const created = await res.json()
        setProjects((prev) => [...prev, created])
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
      if (!confirm('Delete this project? This cannot be undone.')) return
      try {
        const res = await fetch(`/api/admin/content/portfolio?id=${id}`, {
          method: 'DELETE',
        })
        if (!res.ok) throw new Error('Failed to delete')
        setProjects((prev) => prev.filter((p) => p.id !== id))
        if (editingId === id) resetForm()
      } catch {
        alert('Failed to delete. Please try again.')
      }
    },
    [editingId],
  )

  const handleImageUpload = useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Only JPEG, PNG, and WebP images are accepted.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB.')
      return
    }
    setUploading(true)
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      })
      if (!res.ok) throw new Error('Failed to get upload URL')
      const { uploadUrl, publicUrl } = await res.json()
      await fetch(uploadUrl, { method: 'PUT', body: file })
      setForm((f) => ({ ...f, thumbnail_url: publicUrl }))
    } catch {
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [])

  const statusBadge = (status: string) => (
    <Badge variant={status === 'published' ? 'success' : 'warning'}>
      {status}
    </Badge>
  )

  const columns: Column<PortfolioProject>[] = [
    {
      key: 'thumbnail_url',
      title: '',
      render: (_, row) =>
        row.thumbnail_url ? (
          <img
            src={row.thumbnail_url}
            alt=""
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--azimuth-radius-sm)',
              objectFit: 'cover',
            }}
          />
        ) : null,
    },
    { key: 'title', title: 'Title' },
    {
      key: 'status',
      title: 'Status',
      render: (_, row) => statusBadge(row.status),
    },
    {
      key: 'sort_order',
      title: 'Sort',
      render: (_, row) => String(row.sort_order),
    },
    {
      key: 'is_published',
      title: 'Published',
      render: (_, row) => (row.is_published ? 'Yes' : 'No'),
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
          Portfolio Projects
        </Text>
        <Button
          variant="primary"
          type="button"
          onClick={() => {
            resetForm()
            setCreating(true)
          }}
        >
          Add Project
        </Button>
      </Stack>

      {(creating || editingId) && (
        <Card>
          <Stack spacing="sm">
            <Text weight="semibold">
              {editingId ? 'Edit Project' : 'New Project'}
            </Text>
            <Input
              label={{ text: 'Title' }}
              name="title"
              value={{
                value: form.title,
                onChange: (e) => {
                  const v = e.target.value
                  setForm((f) => ({
                    ...f,
                    title: v,
                    slug: editingId ? f.slug : slugify(v),
                  }))
                },
              }}
            />
            <Input
              label={{ text: 'Slug' }}
              name="slug"
              value={{
                value: form.slug,
                onChange: (e) =>
                  setForm((f) => ({ ...f, slug: e.target.value })),
              }}
            />
            <Input
              label={{ text: 'Description' }}
              name="description"
              value={{
                value: form.description,
                onChange: (e) =>
                  setForm((f) => ({ ...f, description: e.target.value })),
              }}
            />
            <Input
              label={{ text: 'Href' }}
              name="href"
              value={{
                value: form.href,
                onChange: (e) =>
                  setForm((f) => ({ ...f, href: e.target.value })),
              }}
            />
            <Input
              label={{ text: 'Href' }}
              name="href"
              value={{
                value: form.href,
                onChange: (e) =>
                  setForm((f) => ({ ...f, href: e.target.value })),
              }}
            />
            <Stack spacing="xs">
              <Text element={{ size: 'sm' }} weight="semibold">
                Thumbnail Image
              </Text>
              {form.thumbnail_url && (
                <div style={{ position: 'relative', width: 200 }}>
                  <img
                    src={form.thumbnail_url}
                    alt="Project thumbnail"
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: 'var(--azimuth-radius-md)',
                      border: '1px solid var(--azimuth-color-border)',
                    }}
                  />
                  <Button
                    variant="tertiary"
                    size="sm"
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, thumbnail_url: '' }))
                    }
                    style={{ position: 'absolute', top: 4, right: 4 }}
                  >
                    Remove
                  </Button>
                </div>
              )}
              <FileUpload
                onFilesSelected={handleImageUpload}
                accept="image/jpeg,image/png,image/webp"
                multiple={false}
                maxSize={5}
                disabled={uploading}
              />
              {uploading && <Text element={{ size: 'sm' }}>Uploading...</Text>}
            </Stack>
            <Stack direction="horizontal" spacing="md">
              <Select
                label={{ text: 'Status' }}
                options={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'published', label: 'Published' },
                ]}
                value={form.status}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as 'draft' | 'published',
                  }))
                }
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
            <Stack
              direction="horizontal"
              spacing="md"
              style={{ alignItems: 'center' }}
            >
              <label>
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, is_published: e.target.checked }))
                  }
                />
                <Text element={{ size: 'sm' }} style={{ marginLeft: '0.5rem' }}>
                  Published
                </Text>
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

      {projects.length === 0 ? (
        <EmptyState
          title="No portfolio projects"
          description="Add your first project to showcase your work."
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
