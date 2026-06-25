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
vi.mock('@/features/bootstrapper/engine/constraints', () => ({
  validateConfig: vi.fn(() => []),
}))
vi.mock('@/features/bootstrapper/engine/compliance/auditor', () => ({
  runComplianceAudit: vi.fn(() => ({ violations: [] })),
}))
vi.mock('@/features/bootstrapper/api/generate', () => ({
  generateProject: vi.fn(() => ({ files: [], warnings: [], projectName: 'X' })),
}))
vi.mock('@/features/bootstrapper/types', () => ({
  PRESETS: { starter: { id: 'starter', name: 'Starter', description: 'd' } },
  DEFAULT_CONFIG: { preset: 'starter' },
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

describe('GET /api/admin/bootstrap', () => {
  it('401 unauthenticated', async () => {
    await setClient(createMockClient({ user: unauthUser }))
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('403 forbidden role', async () => {
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

  it('200 returns presets and supported options', async () => {
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
    expect(body.presets).toBeInstanceOf(Array)
    expect(body.options).toBeDefined()
  })
})

describe('POST /api/admin/bootstrap', () => {
  it('401 unauthenticated', async () => {
    await setClient(createMockClient({ user: unauthUser }))
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/admin/bootstrap', {
        method: 'POST',
        body: { preset: 'starter' },
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
    await setClient(
      createMockClient({
        user: adminUser,
        tables: { users: { select: { data: adminProfile } } },
      }),
    )
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/admin/bootstrap', {
        method: 'POST',
        body: { preset: 'starter' },
      }),
    )
    expect(res.status).toBe(429)
  })

  it('400 when validation fails', async () => {
    await setClient(
      createMockClient({
        user: adminUser,
        tables: { users: { select: { data: adminProfile } } },
      }),
    )
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/admin/bootstrap', {
        method: 'POST',
        body: { preset: '' },
      }),
    )
    expect(res.status).toBe(400)
  })

  it('400 when preset is unknown', async () => {
    await setClient(
      createMockClient({
        user: adminUser,
        tables: { users: { select: { data: adminProfile } } },
      }),
    )
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/admin/bootstrap', {
        method: 'POST',
        body: { preset: 'nope' },
      }),
    )
    expect(res.status).toBe(400)
  })

  it('200 validates preset and returns audit', async () => {
    await setClient(
      createMockClient({
        user: adminUser,
        tables: { users: { select: { data: adminProfile } } },
      }),
    )
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/admin/bootstrap', {
        method: 'POST',
        body: { preset: 'starter' },
      }),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.valid).toBe(true)
    expect(body.violations).toEqual([])
    expect(body.audit).toBeDefined()
  })

  it('200 in generate mode returns generated project', async () => {
    await setClient(
      createMockClient({
        user: adminUser,
        tables: { users: { select: { data: adminProfile } } },
      }),
    )
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/admin/bootstrap', {
        method: 'POST',
        body: { preset: 'starter', mode: 'generate' },
      }),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.generated).toBeDefined()
    expect(body.generated.projectName).toBe('X')
  })
})
