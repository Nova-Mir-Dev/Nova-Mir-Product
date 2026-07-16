import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createMockClient,
  adminUser,
  clientUser,
  unauthUser,
  buildRequest,
  JSON_CT,
  type MockClient,
} from '@/lib/__tests__/api-test-helpers'

vi.mock('@/lib/supabase-server', () => ({ createClient: vi.fn() }))
vi.mock('@/lib/supabase-admin', () => ({ createServiceClient: vi.fn() }))
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi
    .fn()
    .mockResolvedValue({ allowed: true, remaining: 9, reset: 0 }),
}))
vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }))
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
})

async function setSession(client: MockClient) {
  const { createClient } = await import('@/lib/supabase-server')
  vi.mocked(createClient).mockResolvedValue(client)
}
async function setService(client: MockClient) {
  const { createServiceClient } = await import('@/lib/supabase-admin')
  vi.mocked(createServiceClient).mockReturnValue(client)
}

const asAdmin = () =>
  createMockClient({
    user: adminUser,
    tables: { users: { select: { data: { role: 'admin' } } } },
  })

describe('GET /api/admin/content/pricing', () => {
  it('401 when unauthenticated', async () => {
    await setSession(createMockClient({ user: unauthUser }))
    const { GET } = await import('../route')
    expect((await GET()).status).toBe(401)
  })

  it('403 for a non-admin user', async () => {
    await setSession(
      createMockClient({
        user: clientUser,
        tables: { users: { select: { data: { role: 'client' } } } },
      }),
    )
    const { GET } = await import('../route')
    expect((await GET()).status).toBe(403)
  })

  it('200 returns tiers for an admin', async () => {
    await setSession(asAdmin())
    await setService(
      createMockClient({
        tables: {
          pricing_tiers: { select: { data: [{ id: 't1', name: 'Starter' }] } },
        },
      }),
    )
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body[0].id).toBe('t1')
  })

  it('400 when a create payload is invalid', async () => {
    await setSession(asAdmin())
    await setService(createMockClient({}))
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/admin/content/pricing', {
        method: 'POST',
        headers: JSON_CT,
        body: JSON.stringify({ name: '' }),
      }),
    )
    expect(res.status).toBe(400)
  })
})
