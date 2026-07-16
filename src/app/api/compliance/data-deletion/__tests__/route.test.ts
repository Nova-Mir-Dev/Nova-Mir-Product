import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createMockClient,
  clientUser,
  buildRequest,
  unauthUser,
  JSON_CT,
  type MockClient,
} from '@/lib/__tests__/api-test-helpers'

vi.mock('@/lib/supabase-server', () => ({ createClient: vi.fn() }))
vi.mock('@/lib/supabase-admin', () => ({ createServiceClient: vi.fn() }))
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi
    .fn()
    .mockResolvedValue({ allowed: true, remaining: 2, reset: 0 }),
}))
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}))

const deleteUser = vi.fn().mockResolvedValue({ error: null })

beforeEach(() => {
  vi.clearAllMocks()
  deleteUser.mockResolvedValue({ error: null })
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
})

async function setSession(client: MockClient) {
  const { createClient } = await import('@/lib/supabase-server')
  vi.mocked(createClient).mockResolvedValue(client)
}

async function setService() {
  const base = createMockClient({
    tables: { portfolio_invoices: { select: { data: [] } } },
  })
  const svc = {
    ...base,
    auth: { ...base.auth, admin: { deleteUser } },
  } as unknown as MockClient
  const { createServiceClient } = await import('@/lib/supabase-admin')
  vi.mocked(createServiceClient).mockReturnValue(svc)
}

function post() {
  return buildRequest('http://localhost/api/compliance/data-deletion', {
    method: 'POST',
    headers: JSON_CT,
    body: JSON.stringify({ confirmation: 'DELETE' }),
  })
}

describe('POST /api/compliance/data-deletion', () => {
  it('401 when unauthenticated', async () => {
    await setSession(createMockClient({ user: unauthUser }))
    const { POST } = await import('../route')
    expect((await POST(post())).status).toBe(401)
  })

  it('200 and deletes the auth user when all deletes succeed', async () => {
    await setSession(createMockClient({ user: clientUser }))
    await setService()
    const { POST } = await import('../route')
    const res = await POST(post())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.deleted).toBe(true)
    expect(deleteUser).toHaveBeenCalledWith('client-1')
  })

  it('500 and does not delete the auth user when a table delete fails', async () => {
    await setSession(createMockClient({ user: clientUser }))
    const base = createMockClient({
      tables: {
        portfolio_invoices: { select: { data: [] } },
        // a delete that reports an error must abort before auth-user deletion
        sessions: { delete: { data: null, error: { message: 'denied' } } },
      },
    })
    const svc = {
      ...base,
      auth: { ...base.auth, admin: { deleteUser } },
    } as unknown as MockClient
    const { createServiceClient } = await import('@/lib/supabase-admin')
    vi.mocked(createServiceClient).mockReturnValue(svc)

    const { POST } = await import('../route')
    const res = await POST(post())
    expect(res.status).toBe(500)
    expect(deleteUser).not.toHaveBeenCalled()
  })
})
