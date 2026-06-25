import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createMockClient,
  clientUser,
  buildRequest,
  unauthUser,
  type MockClient,
} from '@/lib/__tests__/api-test-helpers'

vi.mock('@/lib/supabase-server', () => ({ createClient: vi.fn() }))

beforeEach(() => {
  vi.clearAllMocks()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  delete process.env.UPSTASH_REDIS_REST_URL
})

async function setClient(client: MockClient) {
  const { createClient } = await import('@/lib/supabase-server')
  vi.mocked(createClient).mockResolvedValue(client)
}

const validClient = {
  id: 'c-1',
  name: 'Client One',
  email: 'client@example.com',
  phone: null,
  company: null,
  notes: null,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
}

describe('GET /api/clients/me', () => {
  it('401 when unauthenticated', async () => {
    await setClient(createMockClient({ user: unauthUser }))
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(401)
    expect((await res.json()).code).toBe('UNAUTHORIZED')
  })

  it('404 when client profile not found', async () => {
    await setClient(createMockClient({
      user: clientUser,
      tables: { portfolio_clients: { select: { data: null, error: null } } },
    }))
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(404)
    expect((await res.json()).code).toBe('NOT_FOUND')
  })

  it('500 when DB error', async () => {
    await setClient(createMockClient({
      user: clientUser,
      tables: { portfolio_clients: { select: { error: { message: 'db' } } } },
    }))
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(500)
  })

  it('200 returns client profile on success', async () => {
    await setClient(createMockClient({
      user: clientUser,
      tables: { portfolio_clients: { select: { data: validClient } } },
    }))
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.id).toBe('c-1')
  })
})