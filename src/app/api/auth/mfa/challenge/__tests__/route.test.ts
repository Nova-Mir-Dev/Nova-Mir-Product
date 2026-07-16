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
vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))

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
  return buildRequest('http://localhost/api/auth/mfa/challenge', {
    method: 'POST',
    headers: JSON_CT,
    body: JSON.stringify(body),
  })
}

describe('POST /api/auth/mfa/challenge', () => {
  it('401 when unauthenticated', async () => {
    await setClient(createMockClient({ user: unauthUser }))
    const { POST } = await import('../route')
    const res = await POST(post({ factorId: 'f1' }))
    expect(res.status).toBe(401)
  })

  it('400 when factorId is missing', async () => {
    await setClient(createMockClient({ user: clientUser }))
    const { POST } = await import('../route')
    const res = await POST(post({}))
    expect(res.status).toBe(400)
  })

  it('400 when the challenge fails', async () => {
    await setClient(
      createMockClient({
        user: clientUser,
        mfa: { challenge: { data: null, error: { message: 'bad factor' } } },
      }),
    )
    const { POST } = await import('../route')
    const res = await POST(post({ factorId: 'f1' }))
    expect(res.status).toBe(400)
  })

  it('200 returns the challenge on success', async () => {
    await setClient(
      createMockClient({
        user: clientUser,
        mfa: {
          challenge: { data: { id: 'chal-1', type: 'totp' }, error: null },
        },
      }),
    )
    const { POST } = await import('../route')
    const res = await POST(post({ factorId: 'f1' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.id).toBe('chal-1')
  })
})
