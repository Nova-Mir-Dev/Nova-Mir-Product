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

const ctxWithAdmin = (adminTables: Record<string, TableOps>) =>
  setClients(
    createMockClient({ user: adminUser, tables: { users: { select: { data: adminProfile } } } }),
    createMockClient({ tables: adminTables }),
  )

const createPayload = {
  headline: 'Headline',
  subtitle: 'Sub',
  cta_label: 'Click',
  cta_href: '/contact',
}

describe('GET /api/admin/content/hero-headlines', () => {
  it('401 unauthenticated', async () => {
    await setClients(createMockClient({ user: unauthUser }), createMockClient())
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('403 forbidden', async () => {
    await setClients(
      createMockClient({ user: clientUser, tables: { users: { select: { data: clientProfile } } } }),
      createMockClient(),
    )
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(403)
  })

  it('200 returns all headlines', async () => {
    await ctxWithAdmin({ hero_headlines: { select: { data: [{ id: 'h1', headline: 'Hi' }] } } })
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(200)
    expect((await res.json())[0].id).toBe('h1')
  })

  it('500 when fetch fails', async () => {
    await ctxWithAdmin({ hero_headlines: { select: { data: null, error: { message: 'db' } } } })
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(500)
  })
})

describe('POST /api/admin/content/hero-headlines', () => {
  it('401 unauthenticated', async () => {
    await setClients(createMockClient({ user: unauthUser }), createMockClient())
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/admin/content/hero-headlines', { method: 'POST', body: createPayload }))
    expect(res.status).toBe(401)
  })

  it('429 rate-limited', async () => {
    const { rateLimit } = await import('@/lib/rate-limit')
    vi.mocked(rateLimit).mockResolvedValueOnce({ allowed: false, remaining: 0, reset: 0 })
    await ctxWithAdmin({ hero_headlines: { insert: { data: {} } } })
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/admin/content/hero-headlines', { method: 'POST', body: createPayload }))
    expect(res.status).toBe(429)
  })

  it('400 validation failure', async () => {
    await ctxWithAdmin({})
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/admin/content/hero-headlines', { method: 'POST', body: { headline: '' } }))
    expect(res.status).toBe(400)
  })

  it('201 creates headline', async () => {
    await ctxWithAdmin({ hero_headlines: { insert: { data: { id: 'h-1', headline: 'Hi' } } } })
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/admin/content/hero-headlines', { method: 'POST', body: createPayload }))
    expect(res.status).toBe(201)
    expect((await res.json()).id).toBe('h-1')
  })

  it('500 when insert fails', async () => {
    await ctxWithAdmin({ hero_headlines: { insert: { data: null, error: { message: 'db' } } } })
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/admin/content/hero-headlines', { method: 'POST', body: createPayload }))
    expect(res.status).toBe(500)
  })
})

describe('PUT /api/admin/content/hero-headlines', () => {
  it('400 when validation fails', async () => {
    await ctxWithAdmin({})
    const { PUT } = await import('../route')
    const res = await PUT(buildRequest('http://localhost/api/admin/content/hero-headlines', { method: 'PUT', body: { id: '' } }))
    expect(res.status).toBe(400)
  })

  it('200 updates headline', async () => {
    await ctxWithAdmin({ hero_headlines: { update: { data: { id: 'h-1', headline: 'New' } } } })
    const { PUT } = await import('../route')
    const res = await PUT(buildRequest('http://localhost/api/admin/content/hero-headlines', { method: 'PUT', body: { id: 'h-1', headline: 'New' } }))
    expect(res.status).toBe(200)
    expect((await res.json()).headline).toBe('New')
  })

  it('500 when update fails', async () => {
    await ctxWithAdmin({ hero_headlines: { update: { data: null, error: { message: 'db' } } } })
    const { PUT } = await import('../route')
    const res = await PUT(buildRequest('http://localhost/api/admin/content/hero-headlines', { method: 'PUT', body: { id: 'h-1', headline: 'New' } }))
    expect(res.status).toBe(500)
  })
})

describe('DELETE /api/admin/content/hero-headlines', () => {
  it('400 when id missing', async () => {
    await ctxWithAdmin({})
    const { DELETE } = await import('../route')
    const res = await DELETE(buildRequest('http://localhost/api/admin/content/hero-headlines', { method: 'DELETE' }))
    expect(res.status).toBe(400)
  })

  it('200 deletes headline', async () => {
    await ctxWithAdmin({ hero_headlines: { delete: { data: null, error: null } } })
    const { DELETE } = await import('../route')
    const res = await DELETE(buildRequest('http://localhost/api/admin/content/hero-headlines?id=h-1', { method: 'DELETE' }))
    expect(res.status).toBe(200)
  })

  it('500 when delete fails', async () => {
    await ctxWithAdmin({ hero_headlines: { delete: { data: null, error: { message: 'db' } } } })
    const { DELETE } = await import('../route')
    const res = await DELETE(buildRequest('http://localhost/api/admin/content/hero-headlines?id=h-1', { method: 'DELETE' }))
    expect(res.status).toBe(500)
  })
})