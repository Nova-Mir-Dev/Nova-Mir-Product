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

describe('GET /api/compliance/data-access', () => {
  it('429 when rate-limited', async () => {
    const { rateLimit } = await import('@/lib/rate-limit')
    vi.mocked(rateLimit).mockResolvedValueOnce({ allowed: false, remaining: 0, reset: 0 })
    const { GET } = await import('../route')
    const res = await GET(buildRequest('http://localhost/api/compliance/data-access', { method: 'GET' }))
    expect(res.status).toBe(429)
  })

  it('401 when unauthenticated', async () => {
    await setClient(createMockClient({ user: unauthUser }))
    const { GET } = await import('../route')
    const res = await GET(buildRequest('http://localhost/api/compliance/data-access', { method: 'GET' }))
    expect(res.status).toBe(401)
  })

  it('200 returns bundled personal data', async () => {
    const client = createMockClient({
      user: clientUser,
      tables: {
        users: { select: { data: { id: 'u1', email: 'c@x.com', name: 'C', role: 'viewer', created_at: '2024-01-01' } } },
        sessions: { select: { data: [] } },
        projects: { select: { data: [] } },
        appointments: { select: { data: [] } },
        payments: { select: { data: [] } },
        documents: { select: { data: [] } },
        api_keys: { select: { data: [] } },
        support_tickets: { select: { data: [] } },
        leads: { select: { data: [] } },
        portfolio_clients: { select: { data: [] } },
        signatures: { select: { data: [] } },
        activity_logs: { select: { data: [] } },
      },
    })
    await setClient(client)
    const { GET } = await import('../route')
    const res = await GET(buildRequest('http://localhost/api/compliance/data-access', { method: 'GET' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.personalData).toBeDefined()
    expect(body.processingPurposes).toBeInstanceOf(Array)
    expect(body.retentionPeriods).toBeDefined()
    expect(body.dataSharing).toBeDefined()
  })

  it('500 when an exception is thrown', async () => {
    const { createClient } = await import('@/lib/supabase-server')
    vi.mocked(createClient).mockRejectedValueOnce(new Error('boom'))
    const { GET } = await import('../route')
    const res = await GET(buildRequest('http://localhost/api/compliance/data-access', { method: 'GET' }))
    expect(res.status).toBe(500)
  })
})