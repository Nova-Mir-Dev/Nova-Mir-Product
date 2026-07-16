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

const updatePayload = vi.fn()
const updateEq = vi.fn().mockResolvedValue({ error: null })

beforeEach(() => {
  vi.clearAllMocks()
  updateEq.mockResolvedValue({ error: null })
})

async function setSession(client: MockClient) {
  const { createClient } = await import('@/lib/supabase-server')
  vi.mocked(createClient).mockResolvedValue(client)
}

async function setService() {
  const svc = {
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

function form(fields: Record<string, string>) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.set(k, v)
  return fd
}

describe('updateLeadAction', () => {
  it('rejects unauthenticated', async () => {
    await setSession(createMockClient({ user: unauthUser }))
    const { updateLeadAction } = await import('../actions')
    await expect(updateLeadAction(form({ id: 'l1' }))).rejects.toThrow(
      'Unauthorized',
    )
  })

  it('rejects a non-admin', async () => {
    await setSession(
      createMockClient({
        user: clientUser,
        tables: { users: { select: { data: { role: 'client' } } } },
      }),
    )
    const { updateLeadAction } = await import('../actions')
    await expect(updateLeadAction(form({ id: 'l1' }))).rejects.toThrow(
      'Forbidden',
    )
  })

  it('requires a lead id', async () => {
    await setSession(asAdmin())
    await setService()
    const { updateLeadAction } = await import('../actions')
    await expect(updateLeadAction(form({ id: '' }))).rejects.toThrow(/Lead ID/i)
  })

  it('rejects an invalid status', async () => {
    await setSession(asAdmin())
    await setService()
    const { updateLeadAction } = await import('../actions')
    await expect(
      updateLeadAction(form({ id: 'l1', status: 'bogus' })),
    ).rejects.toThrow()
  })

  it('updates the lead with a valid status', async () => {
    await setSession(asAdmin())
    await setService()
    const { updateLeadAction } = await import('../actions')
    await updateLeadAction(form({ id: 'l1', status: 'won', notes: 'hi' }))
    expect(updatePayload).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'won', notes: 'hi' }),
    )
    expect(updateEq).toHaveBeenCalledWith('id', 'l1')
  })
})
