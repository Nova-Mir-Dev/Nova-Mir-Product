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

const validInvoice = {
  id: 'inv-1',
  user_id: 'client-1',
  client_name: 'Client One',
  amount: 100,
  status: 'paid',
  due_date: null,
  created_at: '2024-01-01',
  paid_at: null,
}

describe('GET /api/clients/invoices', () => {
  it('401 when unauthenticated', async () => {
    await setClient(createMockClient({ user: unauthUser }))
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('200 returns invoices for the user', async () => {
    await setClient(
      createMockClient({
        user: clientUser,
        tables: { portfolio_invoices: { select: { data: [validInvoice] } } },
      }),
    )
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body[0].id).toBe('inv-1')
  })

  it('500 when DB returns an error', async () => {
    await setClient(
      createMockClient({
        user: clientUser,
        tables: {
          portfolio_invoices: {
            select: { data: null, error: { message: 'db' } },
          },
        },
      }),
    )
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(500)
  })

  it('500 when invoices do not match schema', async () => {
    await setClient(
      createMockClient({
        user: clientUser,
        tables: { portfolio_invoices: { select: { data: [{ id: 'inv-1' }] } } },
      }),
    )
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(500)
  })
})
