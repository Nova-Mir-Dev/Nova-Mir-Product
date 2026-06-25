import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createMockClient,
  type MockClient,
} from '@/lib/__tests__/api-test-helpers'

vi.mock('@/lib/supabase-admin', () => ({
  createServiceClient: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('logAudit', () => {
  it('inserts an audit_logs row with the expected shape', async () => {
    const { createServiceClient } = await import('@/lib/supabase-admin')
    const { logAudit } = await import('../audit-log')

    const admin: MockClient = createMockClient({
      tables: { audit_logs: { insert: { data: null, error: null } } },
    })
    vi.mocked(createServiceClient).mockReturnValue(admin)

    await logAudit({
      action: 'billing.invoice.create',
      entity: 'invoice',
      entityId: 'inv-1',
      userId: 'user-1',
      metadata: { status: 'pending', total_cents: 15000 },
    })

    const fromMock = vi.mocked(admin.from)
    expect(fromMock).toHaveBeenCalledWith('audit_logs')
    const chain = fromMock.mock.results[0].value as {
      insert: ReturnType<typeof vi.fn>
    }
    expect(chain.insert).toHaveBeenCalledWith({
      action: 'billing.invoice.create',
      entity: 'invoice',
      entity_id: 'inv-1',
      user_id: 'user-1',
      metadata: { status: 'pending', total_cents: 15000 },
    })
  })

  it('strips email and phone from metadata before insert', async () => {
    const { createServiceClient } = await import('@/lib/supabase-admin')
    const { logAudit } = await import('../audit-log')

    const admin: MockClient = createMockClient({
      tables: { audit_logs: { insert: { data: null, error: null } } },
    })
    vi.mocked(createServiceClient).mockReturnValue(admin)

    await logAudit({
      action: 'client.invite',
      entity: 'client',
      metadata: {
        email: 'secret@example.com',
        phone: '555-1234',
        email_domain: 'example.com',
        has_password: true,
      },
    })

    const chain = vi.mocked(admin.from).mock.results[0].value as {
      insert: ReturnType<typeof vi.fn>
    }
    const payload = chain.insert.mock.calls[0][0] as {
      metadata: Record<string, unknown>
    }
    expect(payload.metadata).not.toHaveProperty('email')
    expect(payload.metadata).not.toHaveProperty('phone')
    expect(payload.metadata).toEqual({
      email_domain: 'example.com',
      has_password: true,
    })
  })

  it('swallows errors so a failed audit insert does not throw', async () => {
    const { createServiceClient } = await import('@/lib/supabase-admin')
    const { logAudit } = await import('../audit-log')

    vi.mocked(createServiceClient).mockImplementation(() => {
      throw new Error('missing service role key')
    })
    await expect(
      logAudit({ action: 'x', entity: 'y' }),
    ).resolves.toBeUndefined()

    const rejectingClient = {
      from: () => ({
        insert: () => Promise.reject(new Error('insert failed')),
      }),
    }
    vi.mocked(createServiceClient).mockReturnValue(rejectingClient as never)
    await expect(
      logAudit({ action: 'x', entity: 'y' }),
    ).resolves.toBeUndefined()
  })
})
