import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createMockClient,
  adminUser,
  adminProfile,
  buildRequest,
  unauthUser,
  type MockClient,
} from '@/lib/__tests__/api-test-helpers'

vi.mock('@/lib/supabase-server', () => ({ createClient: vi.fn() }))
vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn(), captureMessage: vi.fn() }))

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

describe('GET /api/auth/me', () => {
  it('401 unauthenticated', async () => {
    await setClient(createMockClient({ user: unauthUser }))
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.code).toBe('UNAUTHORIZED')
  })

  it('401 when auth error present', async () => {
    const { GET } = await import('../route')
    await setClient(createMockClient({ authError: { message: 'bad token' } }))
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('401 when profile missing', async () => {
    const client = createMockClient({
      user: adminUser,
      tables: { users: { select: { data: null, error: { code: 'PGRST116' } } } },
    })
    await setClient(client)
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('200 returns profile on success', async () => {
    const client = createMockClient({
      user: adminUser,
      tables: { users: { select: { data: adminProfile } } },
    })
    await setClient(client)
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.email).toBe('admin@example.com')
    expect(body.role).toBe('admin')
  })

  it('500 when createClient throws', async () => {
    const { createClient } = await import('@/lib/supabase-server')
    vi.mocked(createClient).mockRejectedValueOnce(new Error('boom'))
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.code).toBe('INTERNAL_ERROR')
  })

  it('buildRequest helper accepts method override', () => {
    const req = buildRequest('http://localhost/x', { method: 'PUT', body: { a: 1 } })
    expect(req.method).toBe('PUT')
    expect(req.headers.get('content-type')).toBe('application/json')
  })
})