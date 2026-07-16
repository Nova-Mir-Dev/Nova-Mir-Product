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
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi
    .fn()
    .mockResolvedValue({ allowed: true, remaining: 9, reset: 0 }),
}))
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
})

async function setClient(client: MockClient) {
  const { createClient } = await import('@/lib/supabase-server')
  vi.mocked(createClient).mockResolvedValue(client)
}

function post(body: unknown) {
  return buildRequest('http://localhost/api/compliance/data-correction', {
    method: 'POST',
    headers: JSON_CT,
    body: JSON.stringify(body),
  })
}

describe('POST /api/compliance/data-correction', () => {
  it('401 when unauthenticated', async () => {
    await setClient(createMockClient({ user: unauthUser }))
    const { POST } = await import('../route')
    const res = await POST(post({ field: 'name', value: 'X', reason: 'typo' }))
    expect(res.status).toBe(401)
  })

  it('400 when validation fails', async () => {
    await setClient(createMockClient({ user: clientUser }))
    const { POST } = await import('../route')
    const res = await POST(post({ field: 'name' }))
    expect(res.status).toBe(400)
  })

  it('400 rejects a field outside the self-correct allowlist (no mass assignment)', async () => {
    await setClient(createMockClient({ user: clientUser }))
    const { POST } = await import('../route')
    const res = await POST(post({ field: 'role', value: 'admin', reason: 'x' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/admin review/i)
  })

  it('200 corrects an allowlisted field on the caller row', async () => {
    await setClient(
      createMockClient({
        user: clientUser,
        tables: { users: { update: { data: null, error: null } } },
      }),
    )
    const { POST } = await import('../route')
    const res = await POST(
      post({ field: 'name', value: 'New Name', reason: 'typo' }),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.corrected).toBe(true)
    expect(body.field).toBe('name')
  })
})
