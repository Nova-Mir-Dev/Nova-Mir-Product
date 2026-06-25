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

const createLeadBody = {
  name: 'Jane',
  email: 'jane@example.com',
}

describe('GET /api/admin/leads', () => {
  it('401 unauthenticated', async () => {
    await setClients(createMockClient({ user: unauthUser }), createMockClient())
    const { GET } = await import('../route')
    const res = await GET(buildRequest('http://localhost/api/admin/leads', { method: 'GET' }))
    expect(res.status).toBe(401)
  })

  it('403 forbidden role', async () => {
    const server = createMockClient({ user: clientUser, tables: { users: { select: { data: clientProfile } } } })
    await setClients(server, createMockClient())
    const { GET } = await import('../route')
    const res = await GET(buildRequest('http://localhost/api/admin/leads', { method: 'GET' }))
    expect(res.status).toBe(403)
  })

  it('200 returns leads with status filter', async () => {
    const server = createMockClient({ user: adminUser, tables: { users: { select: { data: adminProfile } } } })
    const admin = createMockClient({ tables: { leads: { select: { data: [{ id: 'l1', status: 'new' }] } } as TableOps } })
    await setClients(server, admin)
    const { GET } = await import('../route')
    const res = await GET(buildRequest('http://localhost/api/admin/leads?status=new', { method: 'GET' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body[0].id).toBe('l1')
  })

  it('500 when fetch fails', async () => {
    const server = createMockClient({ user: adminUser, tables: { users: { select: { data: adminProfile } } } })
    const admin = createMockClient({ tables: { leads: { select: { data: null, error: { message: 'db' } } } as TableOps } })
    await setClients(server, admin)
    const { GET } = await import('../route')
    const res = await GET(buildRequest('http://localhost/api/admin/leads', { method: 'GET' }))
    expect(res.status).toBe(500)
  })
})

describe('POST /api/admin/leads', () => {
  it('401 unauthenticated', async () => {
    await setClients(createMockClient({ user: unauthUser }), createMockClient())
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/admin/leads', { method: 'POST', body: createLeadBody }))
    expect(res.status).toBe(401)
  })

  it('403 forbidden role', async () => {
    const server = createMockClient({ user: clientUser, tables: { users: { select: { data: clientProfile } } } })
    await setClients(server, createMockClient())
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/admin/leads', { method: 'POST', body: createLeadBody }))
    expect(res.status).toBe(403)
  })

  it('400 validation failure', async () => {
    const server = createMockClient({ user: adminUser, tables: { users: { select: { data: adminProfile } } } })
    await setClients(server, createMockClient())
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/admin/leads', { method: 'POST', body: { name: '', email: 'bad' } }))
    expect(res.status).toBe(400)
  })

  it('201 creates lead on success', async () => {
    const server = createMockClient({ user: adminUser, tables: { users: { select: { data: adminProfile } } } })
    const admin = createMockClient({ tables: { leads: { insert: { data: { id: 'l2', name: 'Jane', email: 'jane@example.com' } } } as TableOps } })
    await setClients(server, admin)
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/admin/leads', { method: 'POST', body: createLeadBody }))
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.id).toBe('l2')
  })

  it('500 when insert fails', async () => {
    const server = createMockClient({ user: adminUser, tables: { users: { select: { data: adminProfile } } } })
    const admin = createMockClient({ tables: { leads: { insert: { data: null, error: { message: 'db' } } } as TableOps } })
    await setClients(server, admin)
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/admin/leads', { method: 'POST', body: createLeadBody }))
    expect(res.status).toBe(500)
  })
})

describe('PATCH /api/admin/leads', () => {
  it('401 unauthenticated', async () => {
    await setClients(createMockClient({ user: unauthUser }), createMockClient())
    const { PATCH } = await import('../route')
    const res = await PATCH(buildRequest('http://localhost/api/admin/leads', { method: 'PATCH', body: { id: 'l1' } }))
    expect(res.status).toBe(401)
  })

  it('400 validation failure', async () => {
    const server = createMockClient({ user: adminUser, tables: { users: { select: { data: adminProfile } } } })
    await setClients(server, createMockClient())
    const { PATCH } = await import('../route')
    const res = await PATCH(buildRequest('http://localhost/api/admin/leads', { method: 'PATCH', body: {} }))
    expect(res.status).toBe(400)
  })

  it('200 updates lead', async () => {
    const server = createMockClient({ user: adminUser, tables: { users: { select: { data: adminProfile } } } })
    const admin = createMockClient({ tables: { leads: { update: { data: { id: 'l1', status: 'won' } } } as TableOps } })
    await setClients(server, admin)
    const { PATCH } = await import('../route')
    const res = await PATCH(buildRequest('http://localhost/api/admin/leads', { method: 'PATCH', body: { id: 'l1', status: 'won' } }))
    expect(res.status).toBe(200)
  })

  it('500 when update fails', async () => {
    const server = createMockClient({ user: adminUser, tables: { users: { select: { data: adminProfile } } } })
    const admin = createMockClient({ tables: { leads: { update: { data: null, error: { message: 'db' } } } as TableOps } })
    await setClients(server, admin)
    const { PATCH } = await import('../route')
    const res = await PATCH(buildRequest('http://localhost/api/admin/leads', { method: 'PATCH', body: { id: 'l1', status: 'won' } }))
    expect(res.status).toBe(500)
  })
})