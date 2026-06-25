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

describe('GET /api/admin/audit', () => {
  it('401 unauthenticated', async () => {
    await setClients(createMockClient({ user: unauthUser }), createMockClient())
    const { GET } = await import('../route')
    const res = await GET(buildRequest('http://localhost/api/admin/audit', { method: 'GET' }))
    expect(res.status).toBe(401)
  })

  it('403 forbidden', async () => {
    const server = createMockClient({ user: clientUser, tables: { users: { select: { data: clientProfile } } } })
    await setClients(server, createMockClient())
    const { GET } = await import('../route')
    const res = await GET(buildRequest('http://localhost/api/admin/audit', { method: 'GET' }))
    expect(res.status).toBe(403)
  })

  it('429 rate-limited', async () => {
    const { rateLimit } = await import('@/lib/rate-limit')
    vi.mocked(rateLimit).mockResolvedValueOnce({ allowed: false, remaining: 0, reset: 0 })
    const server = createMockClient({ user: adminUser, tables: { users: { select: { data: adminProfile } } } })
    await setClients(server, createMockClient())
    const { GET } = await import('../route')
    const res = await GET(buildRequest('http://localhost/api/admin/audit', { method: 'GET' }))
    expect(res.status).toBe(429)
  })

  it('200 returns mapped entries', async () => {
    const server = createMockClient({ user: adminUser, tables: { users: { select: { data: adminProfile } } } })
    const admin = createMockClient({
      tables: {
        activity_logs: {
          select: {
            data: [
              {
                id: 'a1',
                action: 'LOGIN',
                client_name: 'Acme',
                performed_by: 'admin-1',
                created_at: '2024-01-01',
                details: { foo: 'bar' },
              },
            ],
          },
        },
      },
    })
    await setClients(server, admin)
    const { GET } = await import('../route')
    const res = await GET(buildRequest('http://localhost/api/admin/audit?action=login', { method: 'GET' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body[0].action).toBe('LOGIN')
    expect(body[0].clientName).toBe('Acme')
  })

  it('200 returns empty list when no entries match filter', async () => {
    const server = createMockClient({ user: adminUser, tables: { users: { select: { data: adminProfile } } } })
    const admin = createMockClient({ tables: { activity_logs: { select: { data: [] } } } })
    await setClients(server, admin)
    const { GET } = await import('../route')
    const res = await GET(buildRequest('http://localhost/api/admin/audit?action=zombie', { method: 'GET' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual([])
  })

  it('500 when fetch fails', async () => {
    const server = createMockClient({ user: adminUser, tables: { users: { select: { data: adminProfile } } } })
    const admin = createMockClient({ tables: { activity_logs: { select: { data: null, error: { message: 'db' } } } } })
    await setClients(server, admin)
    const { GET } = await import('../route')
    const res = await GET(buildRequest('http://localhost/api/admin/audit', { method: 'GET' }))
    expect(res.status).toBe(500)
  })
})