import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createMockClient,
  adminUser,
  clientUser,
  unauthUser,
  type MockClient,
} from '@/lib/__tests__/api-test-helpers'

vi.mock('@/lib/supabase-server', () => ({ createClient: vi.fn() }))
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi
    .fn()
    .mockResolvedValue({ allowed: true, remaining: 9, reset: 0 }),
}))
vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))

beforeEach(() => {
  vi.clearAllMocks()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
})

async function setClient(client: MockClient) {
  const { createClient } = await import('@/lib/supabase-server')
  vi.mocked(createClient).mockResolvedValue(client)
}

describe('GET /api/admin/compliance/dsar', () => {
  it('401 when unauthenticated', async () => {
    await setClient(createMockClient({ user: unauthUser }))
    const { GET } = await import('../route')
    expect((await GET()).status).toBe(401)
  })

  it('403 for a non-admin', async () => {
    await setClient(
      createMockClient({
        user: clientUser,
        tables: { users: { select: { data: { role: 'client' } } } },
      }),
    )
    const { GET } = await import('../route')
    expect((await GET()).status).toBe(403)
  })

  it('200 returns DSAR events for an admin', async () => {
    await setClient(
      createMockClient({
        user: adminUser,
        tables: {
          users: { select: { data: { role: 'admin' } } },
          activity_logs: {
            select: { data: [{ id: 'e1', action: 'dsar_access' }] },
          },
        },
      }),
    )
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.events[0].id).toBe('e1')
  })
})
