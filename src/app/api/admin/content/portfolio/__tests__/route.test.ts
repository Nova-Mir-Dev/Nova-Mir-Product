import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createMockClient,
  adminUser,
  clientUser,
  adminProfile,
  clientProfile,
  buildRequest,
  unauthUser,
  type MockClient,
  type TableOps,
} from '@/lib/__tests__/api-test-helpers'

vi.mock('@/lib/supabase-server', () => ({ createClient: vi.fn() }))
vi.mock('@/lib/supabase-admin', () => ({ createServiceClient: vi.fn() }))
vi.mock('@/lib/rate-limit', () => ({ rateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 99, reset: 0 }) }))
vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn(), captureMessage: vi.fn() }))
vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }))

beforeEach(() => {
  vi.clearAllMocks()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
  delete process.env.UPSTASH_REDIS_REST_URL
})

async function setClients(server: MockClient, admin: MockClient) {
  const { createClient } = await import('@/lib/supabase-server')
  const { createServiceClient } = await import('@/lib/supabase-admin')
  vi.mocked(createClient).mockResolvedValue(server)
  vi.mocked(createServiceClient).mockReturnValue(admin)
}

const ctxAdmin = (adminTables: Record<string, TableOps>) =>
  setClients(
    createMockClient({ user: adminUser, tables: { users: { select: { data: adminProfile } } } }),
    createMockClient({ tables: adminTables }),
  )

const createPayload = {
  title: 'Project',
  slug: 'project',
  sort_order: 0,
  is_published: true,
  status: 'draft' as const,
}

describe('GET /api/admin/content/portfolio', () => {
  it('401 unauthenticated', async () => {
    await setClients(createMockClient({ user: unauthUser }), createMockClient())
    const { GET } = await import('../route')
    const res = await GET(buildRequest('http://localhost/api/admin/content/portfolio', { method: 'GET' }))
    expect(res.status).toBe(401)
  })

  it('403 forbidden', async () => {
    await setClients(
      createMockClient({ user: clientUser, tables: { users: { select: { data: clientProfile } } } }),
      createMockClient(),
    )
    const { GET } = await import('../route')
    const res = await GET(buildRequest('http://localhost/api/admin/content/portfolio', { method: 'GET' }))
    expect(res.status).toBe(403)
  })

  it('200 returns projects', async () => {
    await ctxAdmin({ portfolio_projects: { select: { data: [{ id: 'p1', title: 'P', is_published: true }] } } })
    const { GET } = await import('../route')
    const res = await GET(buildRequest('http://localhost/api/admin/content/portfolio?published=true', { method: 'GET' }))
    expect(res.status).toBe(200)
    expect((await res.json())[0].id).toBe('p1')
  })

  it('500 when fetch fails', async () => {
    await ctxAdmin({ portfolio_projects: { select: { data: null, error: { message: 'db' } } } })
    const { GET } = await import('../route')
    const res = await GET(buildRequest('http://localhost/api/admin/content/portfolio', { method: 'GET' }))
    expect(res.status).toBe(500)
  })
})

describe('POST /api/admin/content/portfolio', () => {
  it('429 rate-limited', async () => {
    const { rateLimit } = await import('@/lib/rate-limit')
    vi.mocked(rateLimit).mockResolvedValueOnce({ allowed: false, remaining: 0, reset: 0 })
    await ctxAdmin({ portfolio_projects: { insert: { data: {} } } })
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/admin/content/portfolio', { method: 'POST', body: createPayload }))
    expect(res.status).toBe(429)
  })

  it('400 validation failure', async () => {
    await ctxAdmin({})
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/admin/content/portfolio', { method: 'POST', body: { title: '' } }))
    expect(res.status).toBe(400)
  })

  it('201 creates project', async () => {
    await ctxAdmin({ portfolio_projects: { insert: { data: { id: 'p-1', title: 'P' } } } })
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/admin/content/portfolio', { method: 'POST', body: createPayload }))
    expect(res.status).toBe(201)
    expect((await res.json()).id).toBe('p-1')
  })

  it('500 when insert fails', async () => {
    await ctxAdmin({ portfolio_projects: { insert: { data: null, error: { message: 'db' } } } })
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/admin/content/portfolio', { method: 'POST', body: createPayload }))
    expect(res.status).toBe(500)
  })
})

describe('PUT /api/admin/content/portfolio', () => {
  it('400 validation failure', async () => {
    await ctxAdmin({})
    const { PUT } = await import('../route')
    const res = await PUT(buildRequest('http://localhost/api/admin/content/portfolio', { method: 'PUT', body: { id: '' } }))
    expect(res.status).toBe(400)
  })

  it('200 updates project', async () => {
    await ctxAdmin({ portfolio_projects: { update: { data: { id: 'p-1', title: 'Updated' } } } })
    const { PUT } = await import('../route')
    const res = await PUT(buildRequest('http://localhost/api/admin/content/portfolio', { method: 'PUT', body: { id: 'p-1', title: 'Updated' } }))
    expect(res.status).toBe(200)
    expect((await res.json()).title).toBe('Updated')
  })

  it('500 when update fails', async () => {
    await ctxAdmin({ portfolio_projects: { update: { data: null, error: { message: 'db' } } } })
    const { PUT } = await import('../route')
    const res = await PUT(buildRequest('http://localhost/api/admin/content/portfolio', { method: 'PUT', body: { id: 'p-1', title: 'Updated' } }))
    expect(res.status).toBe(500)
  })
})

describe('DELETE /api/admin/content/portfolio', () => {
  it('400 when id missing', async () => {
    await ctxAdmin({})
    const { DELETE } = await import('../route')
    const res = await DELETE(buildRequest('http://localhost/api/admin/content/portfolio', { method: 'DELETE' }))
    expect(res.status).toBe(400)
  })

  it('200 deletes project', async () => {
    await ctxAdmin({ portfolio_projects: { delete: { data: null, error: null } } })
    const { DELETE } = await import('../route')
    const res = await DELETE(buildRequest('http://localhost/api/admin/content/portfolio?id=p-1', { method: 'DELETE' }))
    expect(res.status).toBe(200)
  })

  it('500 when delete fails', async () => {
    await ctxAdmin({ portfolio_projects: { delete: { data: null, error: { message: 'db' } } } })
    const { DELETE } = await import('../route')
    const res = await DELETE(buildRequest('http://localhost/api/admin/content/portfolio?id=p-1', { method: 'DELETE' }))
    expect(res.status).toBe(500)
  })
})