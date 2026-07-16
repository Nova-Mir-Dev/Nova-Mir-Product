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
})

async function setClient(client: MockClient) {
  const { createClient } = await import('@/lib/supabase-server')
  vi.mocked(createClient).mockResolvedValue(client)
}

const params = Promise.resolve({ id: 'inv-1' })

describe('GET /api/invoices/[id]/download', () => {
  it('401 when unauthenticated', async () => {
    await setClient(createMockClient({ user: unauthUser }))
    const { GET } = await import('../route')
    const res = await GET(
      buildRequest('http://localhost/api/invoices/inv-1/download'),
      {
        params,
      },
    )
    expect(res.status).toBe(401)
  })

  it("404 when the invoice is not the caller's (IDOR guard)", async () => {
    // The route filters by user_id = auth.uid(); another user's invoice resolves to null.
    await setClient(
      createMockClient({
        user: clientUser,
        tables: {
          portfolio_invoices: { select: { data: null, error: null } },
        },
      }),
    )
    const { GET } = await import('../route')
    const res = await GET(
      buildRequest('http://localhost/api/invoices/inv-1/download'),
      {
        params,
      },
    )
    expect(res.status).toBe(404)
  })

  it('200 returns the invoice as a download when owned', async () => {
    await setClient(
      createMockClient({
        user: clientUser,
        tables: {
          portfolio_invoices: {
            select: {
              data: { id: 'inv-1', user_id: 'client-1', amount: 100 },
            },
          },
        },
      }),
    )
    const { GET } = await import('../route')
    const res = await GET(
      buildRequest('http://localhost/api/invoices/inv-1/download'),
      {
        params,
      },
    )
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Disposition')).toContain(
      'invoice-inv-1.json',
    )
    const body = await res.json()
    expect(body.id).toBe('inv-1')
  })
})
