import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createMockClient,
  clientUser,
  buildRequest,
  unauthUser,
  type MockClient,
} from '@/lib/__tests__/api-test-helpers'

vi.mock('@/lib/supabase-server', () => ({ createClient: vi.fn() }))
vi.mock('@/lib/rate-limit', () => ({ rateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 99, reset: 0 }) }))
vi.mock('@/lib/in-app-notifications', () => ({
  getNotifications: vi.fn(() => [{ id: 'n1', read_at: null }]),
  markAsRead: vi.fn(() => Promise.resolve()),
  markAllAsRead: vi.fn(() => Promise.resolve()),
}))
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

describe('GET /api/notifications', () => {
  it('401 unauthenticated', async () => {
    await setClient(createMockClient({ user: unauthUser }))
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('200 returns notifications for the user', async () => {
    await setClient(createMockClient({ user: clientUser }))
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body[0].id).toBe('n1')
  })
})

describe('POST /api/notifications', () => {
  it('401 unauthenticated', async () => {
    await setClient(createMockClient({ user: unauthUser }))
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/notifications', { method: 'POST', body: {} }))
    expect(res.status).toBe(401)
  })

  it('429 rate-limited', async () => {
    const { rateLimit } = await import('@/lib/rate-limit')
    vi.mocked(rateLimit).mockResolvedValueOnce({ allowed: false, remaining: 0, reset: 0 })
    await setClient(createMockClient({ user: clientUser }))
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/notifications', { method: 'POST', body: {} }))
    expect(res.status).toBe(429)
  })

  it('400 validation failure when notificationIds has empty string', async () => {
    await setClient(createMockClient({ user: clientUser }))
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/notifications', { method: 'POST', body: { notificationIds: [''] } }))
    expect(res.status).toBe(400)
  })

  it('200 marks specific notifications as read', async () => {
    await setClient(createMockClient({ user: clientUser }))
    const { markAsRead } = await import('@/lib/in-app-notifications')
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/notifications', { method: 'POST', body: { notificationIds: ['n1', 'n2'] } }))
    expect(res.status).toBe(200)
    expect(markAsRead).toHaveBeenCalledTimes(2)
  })

  it('200 marks all read when no ids provided', async () => {
    await setClient(createMockClient({ user: clientUser }))
    const { markAllAsRead } = await import('@/lib/in-app-notifications')
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/notifications', { method: 'POST', body: {} }))
    expect(res.status).toBe(200)
    expect(markAllAsRead).toHaveBeenCalledTimes(1)
  })
})