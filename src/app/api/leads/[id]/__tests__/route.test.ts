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

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}))
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 99, reset: 0 }),
}))
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}))
vi.mock('next/headers', () => ({ cookies: () => ({ getAll: () => [], setAll: () => {} }) }))

beforeEach(() => {
  vi.clearAllMocks()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  delete process.env.UPSTASH_REDIS_REST_URL
})

async function setClient(client: MockClient) {
  const { createServerClient } = await import('@supabase/ssr')
  vi.mocked(createServerClient).mockReturnValue(client)
}

const validPayload = { status: 'won' }

describe('PATCH /api/leads/[id]', () => {
  it('429 rate-limited', async () => {
    const { rateLimit } = await import('@/lib/rate-limit')
    vi.mocked(rateLimit).mockResolvedValueOnce({ allowed: false, remaining: 0, reset: 0 })
    await setClient(createMockClient({ user: adminUser }))
    const { PATCH } = await import('../route')
    const res = await PATCH(
      buildRequest('http://localhost/api/leads/lead-1', { method: 'PATCH', body: validPayload }),
      { params: Promise.resolve({ id: 'lead-1' }) },
    )
    expect(res.status).toBe(429)
  })

  it('401 when unauthenticated', async () => {
    await setClient(createMockClient({ user: unauthUser }))
    const { PATCH } = await import('../route')
    const res = await PATCH(
      buildRequest('http://localhost/api/leads/lead-1', { method: 'PATCH', body: validPayload }),
      { params: Promise.resolve({ id: 'lead-1' }) },
    )
    expect(res.status).toBe(401)
  })

  it('403 when role is not admin', async () => {
    const client = createMockClient({ user: clientUser, tables: { users: { select: { data: clientProfile } } } })
    await setClient(client)
    const { PATCH } = await import('../route')
    const res = await PATCH(
      buildRequest('http://localhost/api/leads/lead-1', { method: 'PATCH', body: validPayload }),
      { params: Promise.resolve({ id: 'lead-1' }) },
    )
    expect(res.status).toBe(403)
  })

  it('400 when validation fails', async () => {
    const client = createMockClient({ user: adminUser, tables: { users: { select: { data: adminProfile } } } })
    await setClient(client)
    const { PATCH } = await import('../route')
    const res = await PATCH(
      buildRequest('http://localhost/api/leads/lead-1', { method: 'PATCH', body: { status: 'not-a-status' } }),
      { params: Promise.resolve({ id: 'lead-1' }) },
    )
    expect(res.status).toBe(400)
  })

  it('200 on success', async () => {
    const updated = { id: 'lead-1', status: 'won' }
    const client = createMockClient({
      user: adminUser,
      tables: {
        users: { select: { data: adminProfile } },
        leads: { update: { data: updated }, select: { data: updated } },
      },
    })
    await setClient(client)
    const { PATCH } = await import('../route')
    const res = await PATCH(
      buildRequest('http://localhost/api/leads/lead-1', { method: 'PATCH', body: validPayload }),
      { params: Promise.resolve({ id: 'lead-1' }) },
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.id).toBe('lead-1')
  })

  it('404 when lead not found (PGRST116)', async () => {
    const client = createMockClient({
      user: adminUser,
      tables: {
        users: { select: { data: adminProfile } },
        leads: { update: { data: null, error: { code: 'PGRST116', message: 'Not found' } } },
      },
    })
    await setClient(client)
    const { PATCH } = await import('../route')
    const res = await PATCH(
      buildRequest('http://localhost/api/leads/lead-x', { method: 'PATCH', body: validPayload }),
      { params: Promise.resolve({ id: 'lead-x' }) },
    )
    expect(res.status).toBe(404)
  })

  it('500 on generic DB error', async () => {
    const client = createMockClient({
      user: adminUser,
      tables: {
        users: { select: { data: adminProfile } },
        leads: { update: { data: null, error: { code: 'XX000', message: 'boom' } } },
      },
    })
    await setClient(client)
    const { PATCH } = await import('../route')
    const res = await PATCH(
      buildRequest('http://localhost/api/leads/lead-1', { method: 'PATCH', body: validPayload }),
      { params: Promise.resolve({ id: 'lead-1' }) },
    )
    expect(res.status).toBe(500)
  })
})