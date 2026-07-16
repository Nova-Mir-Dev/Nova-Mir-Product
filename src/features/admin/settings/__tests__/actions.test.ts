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

const apiKeyInsert = vi.fn().mockResolvedValue({ error: null })

beforeEach(() => {
  vi.clearAllMocks()
  apiKeyInsert.mockResolvedValue({ error: null })
})

async function setSession(client: MockClient) {
  const { createClient } = await import('@/lib/supabase-server')
  vi.mocked(createClient).mockResolvedValue(client)
}

async function setService() {
  const svc = {
    from: vi.fn(() => ({ insert: apiKeyInsert })),
  } as unknown as MockClient
  const { createServiceClient } = await import('@/lib/supabase-admin')
  vi.mocked(createServiceClient).mockReturnValue(svc)
}

const asAdmin = () =>
  createMockClient({
    user: adminUser,
    tables: { users: { select: { data: { role: 'admin' } } } },
  })

function form(fields: Record<string, string> = {}) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.set(k, v)
  return fd
}

describe('updateProfile', () => {
  it('rejects unauthenticated', async () => {
    await setSession(createMockClient({ user: unauthUser }))
    const { updateProfile } = await import('../actions')
    await expect(updateProfile(form({ name: 'X' }))).rejects.toThrow(
      'Unauthorized',
    )
  })

  it('updates the profile for a signed-in user', async () => {
    await setSession(
      createMockClient({
        user: adminUser,
        tables: { users: { update: { data: null, error: null } } },
      }),
    )
    const { updateProfile } = await import('../actions')
    await expect(
      updateProfile(form({ name: 'New Name' })),
    ).resolves.not.toThrow()
  })
})

describe('createApiKey', () => {
  it('returns Unauthorized for an anonymous caller', async () => {
    await setSession(createMockClient({ user: unauthUser }))
    const { createApiKey } = await import('../actions')
    expect(await createApiKey(null, form())).toEqual({
      success: false,
      error: 'Unauthorized',
    })
  })

  it('returns Forbidden for a non-admin', async () => {
    await setSession(
      createMockClient({
        user: clientUser,
        tables: { users: { select: { data: { role: 'client' } } } },
      }),
    )
    const { createApiKey } = await import('../actions')
    expect(await createApiKey(null, form())).toEqual({
      success: false,
      error: 'Forbidden',
    })
  })

  it('creates a key and returns the raw value for an admin', async () => {
    await setSession(asAdmin())
    await setService()
    const { createApiKey } = await import('../actions')
    const res = await createApiKey(null, form())
    expect(res.success).toBe(true)
    expect(typeof res.key).toBe('string')
    expect(apiKeyInsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'admin-1' }),
    )
  })
})
