import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createMockClient,
  clientUser,
  buildRequest,
  unauthUser,
  type MockClient,
  type TableOps,
} from '@/lib/__tests__/api-test-helpers'

vi.mock('@/lib/supabase-server', () => ({ createClient: vi.fn() }))
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi
    .fn()
    .mockResolvedValue({ allowed: true, remaining: 99, reset: 0 }),
}))
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
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

const validPayload = {
  title: 'Intro call',
  startTime: '2024-02-01T10:00:00Z',
  endTime: '2024-02-01T11:00:00Z',
}

describe('GET /api/appointments', () => {
  it('401 unauthenticated', async () => {
    await setClient(createMockClient({ user: unauthUser }))
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('200 returns appointments for the user', async () => {
    await setClient(
      createMockClient({
        user: clientUser,
        tables: {
          appointments: {
            select: {
              data: [{ id: 'a1', title: 'Appt', start_time: '2024-02-01' }],
            },
          } as TableOps,
        },
      }),
    )
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(200)
    expect((await res.json())[0].id).toBe('a1')
  })

  it('200 returns empty list when no rows', async () => {
    await setClient(
      createMockClient({
        user: clientUser,
        tables: { appointments: { select: { data: null } } as TableOps },
      }),
    )
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([])
  })
})

describe('POST /api/appointments', () => {
  it('401 unauthenticated', async () => {
    await setClient(createMockClient({ user: unauthUser }))
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/appointments', {
        method: 'POST',
        body: validPayload,
      }),
    )
    expect(res.status).toBe(401)
  })

  it('429 rate-limited', async () => {
    const { rateLimit } = await import('@/lib/rate-limit')
    vi.mocked(rateLimit).mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      reset: 0,
    })
    await setClient(createMockClient({ user: clientUser }))
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/appointments', {
        method: 'POST',
        body: validPayload,
      }),
    )
    expect(res.status).toBe(429)
  })

  it('400 when validation fails (missing title)', async () => {
    await setClient(createMockClient({ user: clientUser }))
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/appointments', {
        method: 'POST',
        body: { startTime: 'x', endTime: 'y' },
      }),
    )
    expect(res.status).toBe(400)
  })

  it('201 creates appointment on success', async () => {
    await setClient(
      createMockClient({
        user: clientUser,
        tables: {
          appointments: {
            insert: { data: { id: 'a-1', title: 'Intro' } },
          } as TableOps,
        },
      }),
    )
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/appointments', {
        method: 'POST',
        body: validPayload,
      }),
    )
    expect(res.status).toBe(201)
  })

  it('500 when insert fails', async () => {
    await setClient(
      createMockClient({
        user: clientUser,
        tables: {
          appointments: {
            insert: { data: null, error: { message: 'db' } },
          } as TableOps,
        },
      }),
    )
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/appointments', {
        method: 'POST',
        body: validPayload,
      }),
    )
    expect(res.status).toBe(500)
  })
})
