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

const insert = vi.fn().mockResolvedValue({ error: null })
const deleteEq = vi.fn().mockResolvedValue({ error: null })

beforeEach(() => {
  vi.clearAllMocks()
  insert.mockResolvedValue({ error: null })
  deleteEq.mockResolvedValue({ error: null })
})

async function setSession(client: MockClient) {
  const { createClient } = await import('@/lib/supabase-server')
  vi.mocked(createClient).mockResolvedValue(client)
}

async function setService() {
  const svc = {
    from: vi.fn(() => ({
      insert,
      delete: () => ({ eq: deleteEq }),
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

const validRevenue = {
  clientName: 'Acme',
  description: 'Website build',
  amount: '1800',
  category: 'service',
  recordedAt: '2026-07-01',
}

describe('createRevenueEntry', () => {
  it('returns Unauthorized for an anonymous caller', async () => {
    await setSession(createMockClient({ user: unauthUser }))
    const { createRevenueEntry } = await import('../actions')
    const res = await createRevenueEntry(null, form(validRevenue))
    expect(res).toEqual({ error: 'Unauthorized' })
  })

  it('returns Forbidden for a non-admin', async () => {
    await setSession(
      createMockClient({
        user: clientUser,
        tables: { users: { select: { data: { role: 'client' } } } },
      }),
    )
    const { createRevenueEntry } = await import('../actions')
    const res = await createRevenueEntry(null, form(validRevenue))
    expect(res).toEqual({ error: 'Forbidden' })
  })

  it('returns a validation error for a bad category', async () => {
    await setSession(asAdmin())
    await setService()
    const { createRevenueEntry } = await import('../actions')
    const res = await createRevenueEntry(
      null,
      form({ ...validRevenue, category: 'bogus' }),
    )
    expect(res).toMatchObject({ error: expect.stringMatching(/category/i) })
  })

  it('inserts and returns null on success (amount converted to cents)', async () => {
    await setSession(asAdmin())
    await setService()
    const { createRevenueEntry } = await import('../actions')
    const res = await createRevenueEntry(null, form(validRevenue))
    expect(res).toBeNull()
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 180000, category: 'service' }),
    )
  })
})

describe('deleteRevenueEntry', () => {
  it('rejects a non-admin', async () => {
    await setSession(
      createMockClient({
        user: clientUser,
        tables: { users: { select: { data: { role: 'client' } } } },
      }),
    )
    const { deleteRevenueEntry } = await import('../actions')
    await expect(deleteRevenueEntry(form({ id: 'r1' }))).rejects.toThrow(
      'Forbidden',
    )
  })

  it('deletes the entry for an admin', async () => {
    await setSession(asAdmin())
    await setService()
    const { deleteRevenueEntry } = await import('../actions')
    await deleteRevenueEntry(form({ id: 'r1' }))
    expect(deleteEq).toHaveBeenCalledWith('id', 'r1')
  })
})
