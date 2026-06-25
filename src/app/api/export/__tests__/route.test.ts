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
vi.mock('@/lib/rate-limit', () => ({ rateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 99, reset: 0 }) }))
vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))

beforeEach(() => {
  vi.clearAllMocks()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  delete process.env.UPSTASH_REDIS_REST_URL
})

async function setClient(client: MockClient) {
  const { createClient } = await import('@/lib/supabase-server')
  vi.mocked(createClient).mockResolvedValue(client)
}

describe('GET /api/export', () => {
  it('401 unauthenticated', async () => {
    await setClient(createMockClient({ user: unauthUser }))
    const { GET } = await import('../route')
    const res = await GET(buildRequest('http://localhost/api/export', { method: 'GET' }))
    expect(res.status).toBe(401)
  })

  it('403 forbidden role', async () => {
    await setClient(createMockClient({ user: clientUser, tables: { users: { select: { data: clientProfile } } } }))
    const { GET } = await import('../route')
    const res = await GET(buildRequest('http://localhost/api/export', { method: 'GET' }))
    expect(res.status).toBe(403)
  })

  it('429 rate-limited', async () => {
    const { rateLimit } = await import('@/lib/rate-limit')
    vi.mocked(rateLimit).mockResolvedValueOnce({ allowed: false, remaining: 0, reset: 0 })
    await setClient(createMockClient({ user: adminUser, tables: { users: { select: { data: adminProfile } } } }))
    const { GET } = await import('../route')
    const res = await GET(buildRequest('http://localhost/api/export', { method: 'GET' }))
    expect(res.status).toBe(429)
  })

  it('400 when entity unknown', async () => {
    await setClient(createMockClient({ user: adminUser, tables: { users: { select: { data: adminProfile } } } }))
    const { GET } = await import('../route')
    const res = await GET(buildRequest('http://localhost/api/export?entity=bogus', { method: 'GET' }))
    expect(res.status).toBe(400)
  })

  it('200 returns JSON by default', async () => {
    await setClient(createMockClient({
      user: adminUser,
      tables: {
        users: { select: { data: adminProfile } },
        leads: { select: { data: [{ id: 'l1', name: 'L' }] } } as TableOps,
      },
    }))
    const { GET } = await import('../route')
    const res = await GET(buildRequest('http://localhost/api/export?entity=leads', { method: 'GET' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body[0].id).toBe('l1')
  })

  it('200 returns CSV when format=csv', async () => {
    await setClient(createMockClient({
      user: adminUser,
      tables: {
        users: { select: { data: adminProfile } },
        leads: { select: { data: [{ id: 'l1', name: 'L, Inc' }] } } as TableOps,
      },
    }))
    const { GET } = await import('../route')
    const res = await GET(buildRequest('http://localhost/api/export?entity=leads&format=csv', { method: 'GET' }))
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('text/csv')
    const text = await res.text()
    expect(text).toContain('"L, Inc"')
  })

  it('200 returns empty CSV when no rows', async () => {
    await setClient(createMockClient({
      user: adminUser,
      tables: {
        users: { select: { data: adminProfile } },
        leads: { select: { data: [] } } as TableOps,
      },
    }))
    const { GET } = await import('../route')
    const res = await GET(buildRequest('http://localhost/api/export?entity=leads&format=csv', { method: 'GET' }))
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('')
  })

  it('500 when fetch fails', async () => {
    await setClient(createMockClient({
      user: adminUser,
      tables: {
        users: { select: { data: adminProfile } },
        leads: { select: { data: null, error: { message: 'db' } } } as TableOps,
      },
    }))
    const { GET } = await import('../route')
    const res = await GET(buildRequest('http://localhost/api/export?entity=leads', { method: 'GET' }))
    expect(res.status).toBe(500)
  })
})