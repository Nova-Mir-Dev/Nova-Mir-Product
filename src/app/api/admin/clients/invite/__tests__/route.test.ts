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
vi.mock('@/lib/audit-log', () => ({ logAudit: vi.fn() }))

const createUser = vi.fn()
const updateEq = vi.fn().mockResolvedValue({ error: null })
const updatePayload = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  createUser.mockResolvedValue({
    data: { user: { id: 'new-user-1' } },
    error: null,
  })
  updateEq.mockResolvedValue({ error: null })
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
})

async function setSession(client: MockClient) {
  const { createClient } = await import('@/lib/supabase-server')
  vi.mocked(createClient).mockResolvedValue(client)
}

async function setService() {
  const svc = {
    auth: { admin: { createUser } },
    from: vi.fn(() => ({
      update: (payload: unknown) => {
        updatePayload(payload)
        return { eq: updateEq }
      },
    })),
  } as unknown as MockClient
  const { createServiceClient } = await import('@/lib/supabase-admin')
  vi.mocked(createServiceClient).mockReturnValue(svc)
}

const asAdmin = () =>
  createMockClient({
    user: adminUser,
    tables: { users: { select: { data: { role: 'admin' } } } },
  })

function post(body: unknown) {
  return buildRequest('http://localhost/api/admin/clients/invite', {
    method: 'POST',
    headers: JSON_CT,
    body: JSON.stringify(body),
  })
}

describe('POST /api/admin/clients/invite', () => {
  it('401 when unauthenticated', async () => {
    await setSession(createMockClient({ user: unauthUser }))
    const { POST } = await import('../route')
    expect((await POST(post({ email: 'c@x.com', name: 'C' }))).status).toBe(401)
  })

  it('403 for a non-admin', async () => {
    await setSession(
      createMockClient({
        user: clientUser,
        tables: { users: { select: { data: { role: 'client' } } } },
      }),
    )
    const { POST } = await import('../route')
    expect((await POST(post({ email: 'c@x.com', name: 'C' }))).status).toBe(403)
  })

  it('400 when the body is invalid', async () => {
    await setSession(asAdmin())
    await setService()
    const { POST } = await import('../route')
    expect((await POST(post({ email: 'not-an-email', name: '' }))).status).toBe(
      400,
    )
  })

  it('links the new auth user to the portfolio_clients row on success', async () => {
    await setSession(asAdmin())
    await setService()
    const { POST } = await import('../route')
    const res = await POST(post({ email: 'c@x.com', name: 'Client C' }))
    expect(res.status).toBe(201)
    expect(createUser).toHaveBeenCalled()
    // the fix: portfolio_clients.update must link user_id = the new auth user id
    expect(updatePayload).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'new-user-1' }),
    )
    expect(updateEq).toHaveBeenCalledWith('email', 'c@x.com')
  })
})
