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

vi.mock('@/lib/supabase-server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/supabase-admin', () => ({
  createServiceClient: vi.fn(),
}))

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 99, reset: 0 }),
}))

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}))

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

const validPayload = {
  name: 'Acme Co',
  email: 'acme@example.com',
}

describe('POST /api/admin/clients', () => {
  it('returns 401 when unauthenticated', async () => {
    const server = createMockClient({ user: unauthUser })
    const admin = createMockClient()
    await setClients(server, admin)

    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/admin/clients', { method: 'POST', body: validPayload }))
    expect(res.status).toBe(401)
  })

  it('returns 403 when role is not admin', async () => {
    const server = createMockClient({ user: clientUser, tables: { users: { select: { data: clientProfile } } } })
    const admin = createMockClient()
    await setClients(server, admin)

    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/admin/clients', { method: 'POST', body: validPayload }))
    expect(res.status).toBe(403)
  })

  it('returns 429 when rate limited', async () => {
    const { rateLimit } = await import('@/lib/rate-limit')
    vi.mocked(rateLimit).mockResolvedValueOnce({ allowed: false, remaining: 0, reset: 0 })
    const server = createMockClient({ user: adminUser, tables: { users: { select: { data: adminProfile } } } })
    const admin = createMockClient()
    await setClients(server, admin)

    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/admin/clients', { method: 'POST', body: validPayload }))
    expect(res.status).toBe(429)
  })

  it('returns 400 when validation fails', async () => {
    const server = createMockClient({ user: adminUser, tables: { users: { select: { data: adminProfile } } } })
    const admin = createMockClient()
    await setClients(server, admin)

    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/admin/clients', { method: 'POST', body: { name: '', email: 'bad' } }))
    expect(res.status).toBe(400)
  })

  it('returns 201 with created client on success', async () => {
    const created = { id: 'c-1', name: 'Acme Co', email: 'acme@example.com', project_count: 0, status: 'active' }
    const server = createMockClient({ user: adminUser, tables: { users: { select: { data: adminProfile } } } })
    const admin = createMockClient({
      tables: { portfolio_clients: { insert: { data: created }, select: { data: [] } } as TableOps },
    })
    await setClients(server, admin)

    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/admin/clients', { method: 'POST', body: validPayload }))
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.id).toBe('c-1')
    expect(body.projectCount).toBe(0)
  })

  it('returns 500 when insert fails', async () => {
    const server = createMockClient({ user: adminUser, tables: { users: { select: { data: adminProfile } } } })
    const admin = createMockClient({
      tables: { portfolio_clients: { insert: { data: null, error: { message: 'db', code: '23505' } } } as TableOps },
    })
    await setClients(server, admin)

    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/admin/clients', { method: 'POST', body: validPayload }))
    expect(res.status).toBe(500)
  })
})

describe('GET /api/admin/clients', () => {
  it('returns 401 unauthenticated', async () => {
    const server = createMockClient({ user: unauthUser })
    await setClients(server, createMockClient())

    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns 403 forbidden role', async () => {
    const server = createMockClient({ user: clientUser, tables: { users: { select: { data: clientProfile } } } })
    await setClients(server, createMockClient())

    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(403)
  })

  it('returns client list on success', async () => {
    const server = createMockClient({ user: adminUser, tables: { users: { select: { data: adminProfile } } } })
    const admin = createMockClient({
      tables: { portfolio_clients: { select: { data: [{ id: 'c1', name: 'A', email: 'a@x.com', project_count: 2, status: 'active' }] } } },
    })
    await setClients(server, admin)

    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(1)
    expect(body[0].projectCount).toBe(2)
  })

  it('returns 500 when fetch fails', async () => {
    const server = createMockClient({ user: adminUser, tables: { users: { select: { data: adminProfile } } } })
    const admin = createMockClient({
      tables: { portfolio_clients: { select: { data: null, error: { message: 'db' } } } },
    })
    await setClients(server, admin)

    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(500)
  })
})