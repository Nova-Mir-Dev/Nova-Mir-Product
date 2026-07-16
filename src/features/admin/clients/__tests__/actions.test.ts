import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createMockClient,
  adminUser,
  clientUser,
  unauthUser,
  type MockClient,
} from '@/lib/__tests__/api-test-helpers'

vi.mock('@/lib/supabase-server', () => ({ createClient: vi.fn() }))
vi.mock('@/lib/supabase-admin', () => ({ createServiceClient: vi.fn() }))
vi.mock('@/lib/audit-log', () => ({ logAudit: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

const createUser = vi.fn()
const deleteUser = vi.fn().mockResolvedValue({ error: null })
const insertPayload = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  createUser.mockResolvedValue({
    data: { user: { id: 'new-1' } },
    error: null,
  })
  insertPayload.mockReturnValue({ error: null })
})

async function setSession(client: MockClient) {
  const { createClient } = await import('@/lib/supabase-server')
  vi.mocked(createClient).mockResolvedValue(client)
}

async function setService() {
  const svc = {
    auth: { admin: { createUser, deleteUser } },
    from: vi.fn(() => ({
      insert: (payload: unknown) => Promise.resolve(insertPayload(payload)),
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

function form(fields: Record<string, string>) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.set(k, v)
  return fd
}

describe('createClientAction', () => {
  it('rejects unauthenticated', async () => {
    await setSession(createMockClient({ user: unauthUser }))
    const { createClientAction } = await import('../actions')
    await expect(
      createClientAction(form({ name: 'C', email: 'c@x.com' })),
    ).rejects.toThrow('Unauthorized')
  })

  it('rejects a non-admin', async () => {
    await setSession(
      createMockClient({
        user: clientUser,
        tables: { users: { select: { data: { role: 'client' } } } },
      }),
    )
    const { createClientAction } = await import('../actions')
    await expect(
      createClientAction(form({ name: 'C', email: 'c@x.com' })),
    ).rejects.toThrow('Forbidden')
  })

  it('rejects an invalid email before creating the user', async () => {
    await setSession(asAdmin())
    await setService()
    const { createClientAction } = await import('../actions')
    await expect(
      createClientAction(form({ name: 'C', email: 'not-an-email' })),
    ).rejects.toThrow(/valid email/i)
    expect(createUser).not.toHaveBeenCalled()
  })

  it('creates the auth user and links it to the portfolio_clients row', async () => {
    await setSession(asAdmin())
    await setService()
    const { createClientAction } = await import('../actions')
    await createClientAction(form({ name: 'Client C', email: 'c@x.com' }))
    expect(createUser).toHaveBeenCalled()
    expect(insertPayload).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'new-1', email: 'c@x.com' }),
    )
  })
})
