import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createMockClient,
  adminUser,
  buildRequest,
  unauthUser,
  type MockClient,
} from '@/lib/__tests__/api-test-helpers'

vi.mock('@/lib/supabase-server', () => ({ createClient: vi.fn() }))
vi.mock('@/lib/rate-limit', () => ({ rateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 99, reset: 0 }) }))
vi.mock('@/features/auth/mfa', () => ({ verifyMfa: vi.fn() }))
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

const validPayload = { factorId: 'factor-1', code: '123456' }

describe('POST /api/auth/mfa/verify', () => {
  it('401 when unauthenticated', async () => {
    await setClient(createMockClient({ user: unauthUser }))
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/auth/mfa/verify', { method: 'POST', body: validPayload }))
    expect(res.status).toBe(401)
  })

  it('429 when rate-limited', async () => {
    const { rateLimit } = await import('@/lib/rate-limit')
    vi.mocked(rateLimit).mockResolvedValueOnce({ allowed: false, remaining: 0, reset: 0 })
    await setClient(createMockClient({ user: adminUser }))
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/auth/mfa/verify', { method: 'POST', body: validPayload }))
    expect(res.status).toBe(429)
  })

  it('400 when validation fails (missing code)', async () => {
    await setClient(createMockClient({ user: adminUser }))
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/auth/mfa/verify', { method: 'POST', body: { factorId: 'factor-1' } }))
    expect(res.status).toBe(400)
  })

  it('200 on success', async () => {
    await setClient(createMockClient({ user: adminUser }))
    const { verifyMfa } = await import('@/features/auth/mfa')
    vi.mocked(verifyMfa).mockResolvedValueOnce({ success: true })
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/auth/mfa/verify', { method: 'POST', body: validPayload }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  it('400 when verifyMfa returns an error', async () => {
    await setClient(createMockClient({ user: adminUser }))
    const { verifyMfa } = await import('@/features/auth/mfa')
    vi.mocked(verifyMfa).mockResolvedValueOnce({ error: 'Verification failed' })
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/auth/mfa/verify', { method: 'POST', body: validPayload }))
    expect(res.status).toBe(400)
  })
})