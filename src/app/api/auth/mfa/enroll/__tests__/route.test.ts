import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createMockClient,
  adminUser,
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
vi.mock('@/features/auth/mfa', () => ({
  enrollMfa: vi.fn(),
  verifyMfa: vi.fn(),
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

describe('POST /api/auth/mfa/enroll', () => {
  it('400 when body invalid (wrong factorType)', async () => {
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/auth/mfa/enroll', {
        method: 'POST',
        body: { factorType: 'invalid' },
      }),
    )
    expect(res.status).toBe(400)
  })

  it('400 when factorType is invalid enum value', async () => {
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/auth/mfa/enroll', {
        method: 'POST',
        body: { factorType: 'invalid' },
      }),
    )
    expect(res.status).toBe(400)
  })

  it('401 when unauthenticated', async () => {
    await setClient(createMockClient({ user: unauthUser }))
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/auth/mfa/enroll', {
        method: 'POST',
        body: {},
      }),
    )
    expect(res.status).toBe(401)
  })

  it('429 when rate-limited', async () => {
    const { rateLimit } = await import('@/lib/rate-limit')
    vi.mocked(rateLimit).mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      reset: 0,
    })
    await setClient(createMockClient({ user: adminUser }))
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/auth/mfa/enroll', {
        method: 'POST',
        body: {},
      }),
    )
    expect(res.status).toBe(429)
  })

  it('200 with id and qr on success', async () => {
    await setClient(createMockClient({ user: adminUser }))
    const { enrollMfa } = await import('@/features/auth/mfa')
    vi.mocked(enrollMfa).mockResolvedValueOnce({
      id: 'factor-1',
      qr: 'qr-code',
      secret: 's',
      uri: 'otpauth://...',
    })
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/auth/mfa/enroll', {
        method: 'POST',
        body: {},
      }),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.id).toBe('factor-1')
    expect(body.qr).toBe('qr-code')
  })

  it('400 when enrollMfa returns an error', async () => {
    await setClient(createMockClient({ user: adminUser }))
    const { enrollMfa } = await import('@/features/auth/mfa')
    vi.mocked(enrollMfa).mockResolvedValueOnce({ error: 'Enrollment failed' })
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/auth/mfa/enroll', {
        method: 'POST',
        body: {},
      }),
    )
    expect(res.status).toBe(400)
  })
})
