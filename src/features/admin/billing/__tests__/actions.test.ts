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
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

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
      update: () => ({ eq: updateEq }),
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

describe('createInvoice', () => {
  it('rejects unauthenticated', async () => {
    await setSession(createMockClient({ user: unauthUser }))
    const { createInvoice } = await import('../actions')
    await expect(createInvoice(form({ clientName: 'C' }))).rejects.toThrow(
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
    const { createInvoice } = await import('../actions')
    await expect(createInvoice(form({ clientName: 'C' }))).rejects.toThrow(
      'Forbidden',
    )
  })

  it('requires a client name', async () => {
    await setSession(asAdmin())
    await setService()
    const { createInvoice } = await import('../actions')
    await expect(createInvoice(form({ clientName: '' }))).rejects.toThrow(
      /Client name/i,
    )
  })
})

describe('markInvoiceAsPaid', () => {
  it('rejects a non-admin', async () => {
    await setSession(
      createMockClient({
        user: clientUser,
        tables: { users: { select: { data: { role: 'client' } } } },
      }),
    )
    const { markInvoiceAsPaid } = await import('../actions')
    await expect(markInvoiceAsPaid(form({ id: 'inv-1' }))).rejects.toThrow(
      'Forbidden',
    )
  })

  it('requires an invoice id', async () => {
    await setSession(asAdmin())
    await setService()
    const { markInvoiceAsPaid } = await import('../actions')
    await expect(markInvoiceAsPaid(form({ id: '' }))).rejects.toThrow(
      /Invoice ID/i,
    )
  })

  it('marks the invoice paid for an admin', async () => {
    await setSession(asAdmin())
    await setService()
    const { markInvoiceAsPaid } = await import('../actions')
    await markInvoiceAsPaid(form({ id: 'inv-1' }))
    expect(updateEq).toHaveBeenCalledWith('id', 'inv-1')
  })
})
