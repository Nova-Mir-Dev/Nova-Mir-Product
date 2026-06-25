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
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi
    .fn()
    .mockResolvedValue({ allowed: true, remaining: 99, reset: 0 }),
}))

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

describe('GET /api/admin/api-keys', () => {
  it('401 unauthenticated', async () => {
    await setClient(createMockClient({ user: unauthUser }))
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('403 when role lacks canManageUsers permission', async () => {
    await setClient(
      createMockClient({
        user: clientUser,
        tables: { users: { select: { data: clientProfile } } },
      }),
    )
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(403)
  })

  it('200 returns the keys list on success', async () => {
    await setClient(
      createMockClient({
        user: adminUser,
        tables: { users: { select: { data: adminProfile } } },
      }),
    )
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.keys).toEqual([])
  })
})

describe('POST /api/admin/api-keys', () => {
  it('400 when body fails validation', async () => {
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/admin/api-keys', {
        method: 'POST',
        body: { name: 123 },
      }),
    )
    expect(res.status).toBe(400)
  })

  it('401 unauthenticated', async () => {
    await setClient(createMockClient({ user: unauthUser }))
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/admin/api-keys', {
        method: 'POST',
        body: { name: 'k' },
      }),
    )
    expect(res.status).toBe(401)
  })

  it('403 forbidden role', async () => {
    await setClient(
      createMockClient({
        user: clientUser,
        tables: { users: { select: { data: clientProfile } } },
      }),
    )
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/admin/api-keys', {
        method: 'POST',
        body: { name: 'k' },
      }),
    )
    expect(res.status).toBe(403)
  })

  it('429 rate-limited', async () => {
    const { rateLimit } = await import('@/lib/rate-limit')
    vi.mocked(rateLimit).mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      reset: 0,
    })
    await setClient(
      createMockClient({
        user: adminUser,
        tables: { users: { select: { data: adminProfile } } },
      }),
    )
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/admin/api-keys', {
        method: 'POST',
        body: { name: 'k' },
      }),
    )
    expect(res.status).toBe(429)
  })

  it('200 creates a key when admin', async () => {
    await setClient(
      createMockClient({
        user: adminUser,
        tables: { users: { select: { data: adminProfile } } },
      }),
    )
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/admin/api-keys', {
        method: 'POST',
        body: { name: 'My Key' },
      }),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.created).toBe(true)
  })
})
