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

const insertPayload = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
})

async function setSession(client: MockClient) {
  const { createClient } = await import('@/lib/supabase-server')
  vi.mocked(createClient).mockResolvedValue(client)
}

async function setService(insertResult: { data?: unknown; error?: unknown }) {
  const svc = {
    from: vi.fn(() => ({
      insert: (payload: unknown) => {
        insertPayload(payload)
        return {
          select: () => ({ single: () => Promise.resolve(insertResult) }),
        }
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

describe('createProject', () => {
  it('rejects an unauthenticated caller', async () => {
    await setSession(createMockClient({ user: unauthUser }))
    const { createProject } = await import('../actions')
    await expect(
      createProject(form({ name: 'P', clientId: 'u1' })),
    ).rejects.toThrow('Unauthorized')
  })

  it('rejects a non-admin caller', async () => {
    await setSession(
      createMockClient({
        user: clientUser,
        tables: { users: { select: { data: { role: 'client' } } } },
      }),
    )
    const { createProject } = await import('../actions')
    await expect(
      createProject(form({ name: 'P', clientId: 'u1' })),
    ).rejects.toThrow('Forbidden')
  })

  it('requires a name and client', async () => {
    await setSession(asAdmin())
    const { createProject } = await import('../actions')
    await expect(
      createProject(form({ name: '', clientId: '' })),
    ).rejects.toThrow(/required/i)
  })

  it('inserts the project with client_id set to the chosen auth user id', async () => {
    await setSession(asAdmin())
    await setService({ data: { id: 'proj-1' }, error: null })
    const { createProject } = await import('../actions')
    await createProject(form({ name: 'Website', clientId: 'user-42' }))
    expect(insertPayload).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Website', client_id: 'user-42' }),
    )
  })

  it('throws when the insert fails', async () => {
    await setSession(asAdmin())
    await setService({ data: null, error: { message: 'denied' } })
    const { createProject } = await import('../actions')
    await expect(
      createProject(form({ name: 'Website', clientId: 'user-42' })),
    ).rejects.toThrow(/Failed to create project/)
  })
})
