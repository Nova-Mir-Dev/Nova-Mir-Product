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

describe('GET /api/documents', () => {
  it('401 unauthenticated', async () => {
    await setClient(createMockClient({ user: unauthUser }))
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('200 returns empty documents list on success', async () => {
    await setClient(createMockClient({ user: clientUser }))
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(200)
    expect((await res.json()).documents).toEqual([])
  })
})

describe('POST /api/documents', () => {
  it('401 unauthenticated', async () => {
    await setClient(createMockClient({ user: unauthUser }))
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/documents', { method: 'POST', body: { title: 'T', filePath: '/x.pdf' } }))
    expect(res.status).toBe(401)
  })

  it('429 rate-limited', async () => {
    const { rateLimit } = await import('@/lib/rate-limit')
    vi.mocked(rateLimit).mockResolvedValueOnce({ allowed: false, remaining: 0, reset: 0 })
    await setClient(createMockClient({ user: clientUser }))
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/documents', { method: 'POST', body: { title: 'T', filePath: '/x.pdf' } }))
    expect(res.status).toBe(429)
  })

  it('400 validation failure', async () => {
    await setClient(createMockClient({ user: clientUser }))
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/documents', { method: 'POST', body: { title: '', filePath: '/x.pdf' } }))
    expect(res.status).toBe(400)
  })

  it('201 returns document metadata on success', async () => {
    await setClient(createMockClient({ user: clientUser }))
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/documents', { method: 'POST', body: { title: 'My Doc', filePath: 'safe-file.pdf' } }))
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.title).toBe('My Doc')
    expect(body.userId).toBe('client-1')
    expect(body.status).toBe('pending')
  })
})