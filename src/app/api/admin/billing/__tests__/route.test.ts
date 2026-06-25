import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createMockClient,
  adminUser,
  clientUser,
  adminProfile,
  clientProfile,
  buildRequest,
  unauthUser,
  type MockClient,
  type TableOps,
} from '@/lib/__tests__/api-test-helpers'

vi.mock('@/lib/supabase-server', () => ({
  createClient: vi.fn(),
}))
vi.mock('@/lib/supabase-admin', () => ({
  createServiceClient: vi.fn(),
}))
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi
    .fn()
    .mockResolvedValue({ allowed: true, remaining: 99, reset: 0 }),
}))
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}))
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
  delete process.env.UPSTASH_REDIS_REST_URL
})

async function setClients(server: MockClient, admin: MockClient) {
  const { createClient } = await import('@/lib/supabase-server')
  const { createServiceClient } = await import('@/lib/supabase-admin')
  vi.mocked(createClient).mockResolvedValue(server)
  vi.mocked(createServiceClient).mockReturnValue(admin)
}

const validPayload = {
  clientName: 'Acme Co',
  amount: 1500,
}

describe('GET /api/admin/billing', () => {
  it('401 unauthenticated', async () => {
    await setClients(createMockClient({ user: unauthUser }), createMockClient())
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('403 forbidden role', async () => {
    const server = createMockClient({
      user: clientUser,
      tables: { users: { select: { data: clientProfile } } },
    })
    await setClients(server, createMockClient())
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(403)
  })

  it('200 returns invoices on success', async () => {
    const server = createMockClient({
      user: adminUser,
      tables: { users: { select: { data: adminProfile } } },
    })
    const admin = createMockClient({
      tables: {
        portfolio_invoices: {
          select: {
            data: [
              {
                id: 'i1',
                client_name: 'A',
                amount: 100,
                status: 'pending',
                line_items: [],
              },
            ],
          },
        } as TableOps,
      },
    })
    await setClients(server, admin)
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.invoices[0].client_name).toBe('A')
    expect(body.summary.pending).toBe(1)
  })

  it('500 when fetch fails', async () => {
    const server = createMockClient({
      user: adminUser,
      tables: { users: { select: { data: adminProfile } } },
    })
    const admin = createMockClient({
      tables: {
        portfolio_invoices: {
          select: { data: null, error: { message: 'db' } },
        },
      },
    })
    await setClients(server, admin)
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(500)
  })
})

describe('POST /api/admin/billing', () => {
  it('401 unauthenticated', async () => {
    await setClients(createMockClient({ user: unauthUser }), createMockClient())
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/admin/billing', {
        method: 'POST',
        body: validPayload,
      }),
    )
    expect(res.status).toBe(401)
  })

  it('403 forbidden role', async () => {
    const server = createMockClient({
      user: clientUser,
      tables: { users: { select: { data: clientProfile } } },
    })
    await setClients(server, createMockClient())
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/admin/billing', {
        method: 'POST',
        body: validPayload,
      }),
    )
    expect(res.status).toBe(403)
  })

  it('429 rate-limited', async () => {
    const { rateLimit } = await import('@/lib/rate-limit')
    vi.mocked(rateLimit).mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      reset: 0,
    })
    const server = createMockClient({
      user: adminUser,
      tables: { users: { select: { data: adminProfile } } },
    })
    await setClients(server, createMockClient())
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/admin/billing', {
        method: 'POST',
        body: validPayload,
      }),
    )
    expect(res.status).toBe(429)
  })

  it('400 on validation failure', async () => {
    const server = createMockClient({
      user: adminUser,
      tables: { users: { select: { data: adminProfile } } },
    })
    await setClients(server, createMockClient())
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/admin/billing', {
        method: 'POST',
        body: { clientName: '' },
      }),
    )
    expect(res.status).toBe(400)
  })

  it('400 when amount and lineItems both missing', async () => {
    const server = createMockClient({
      user: adminUser,
      tables: { users: { select: { data: adminProfile } } },
    })
    await setClients(server, createMockClient())
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/admin/billing', {
        method: 'POST',
        body: { clientName: 'A' },
      }),
    )
    expect(res.status).toBe(400)
  })

  it('201 with invoice when amount provided', async () => {
    const server = createMockClient({
      user: adminUser,
      tables: { users: { select: { data: adminProfile } } },
    })
    const invoiceRow = {
      id: 'inv-1',
      client_name: 'Acme Co',
      client_id: null,
      amount: 150000,
      status: 'pending',
      date: '2024-01-01',
      created_at: '2024-01-01',
      invoice_number: 'INV-2024-00001',
      due_date: null,
      paid_at: null,
    }
    const admin = createMockClient({
      tables: {
        portfolio_invoices: {
          selectCount: { count: 0, data: null },
          insert: { data: invoiceRow },
        } as TableOps,
      },
    })
    await setClients(server, admin)
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/admin/billing', {
        method: 'POST',
        body: validPayload,
      }),
    )
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.id).toBe('inv-1')
    expect(body.amount).toBe(150000)
  })

  it('500 when invoice insert fails', async () => {
    const server = createMockClient({
      user: adminUser,
      tables: { users: { select: { data: adminProfile } } },
    })
    const admin = createMockClient({
      tables: {
        portfolio_invoices: {
          selectCount: { count: 0, data: null },
          insert: { data: null, error: { message: 'db' } },
        } as TableOps,
      },
    })
    await setClients(server, admin)
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/admin/billing', {
        method: 'POST',
        body: validPayload,
      }),
    )
    expect(res.status).toBe(500)
  })
})

describe('PATCH /api/admin/billing', () => {
  const patchPayload = { id: 'inv-1', status: 'paid' }

  it('401 unauthenticated', async () => {
    await setClients(createMockClient({ user: unauthUser }), createMockClient())
    const { PATCH } = await import('../route')
    const res = await PATCH(
      buildRequest('http://localhost/api/admin/billing', {
        method: 'PATCH',
        body: patchPayload,
      }),
    )
    expect(res.status).toBe(401)
  })

  it('400 on validation failure', async () => {
    const server = createMockClient({
      user: adminUser,
      tables: { users: { select: { data: adminProfile } } },
    })
    await setClients(server, createMockClient())
    const { PATCH } = await import('../route')
    const res = await PATCH(
      buildRequest('http://localhost/api/admin/billing', {
        method: 'PATCH',
        body: { id: '' },
      }),
    )
    expect(res.status).toBe(400)
  })

  it('200 updates invoice status', async () => {
    const server = createMockClient({
      user: adminUser,
      tables: { users: { select: { data: adminProfile } } },
    })
    const admin = createMockClient({
      tables: {
        portfolio_invoices: {
          update: {
            data: {
              id: 'inv-1',
              client_name: 'A',
              status: 'paid',
              line_items: [],
            },
          },
        } as TableOps,
      },
    })
    await setClients(server, admin)
    const { PATCH } = await import('../route')
    const res = await PATCH(
      buildRequest('http://localhost/api/admin/billing', {
        method: 'PATCH',
        body: patchPayload,
      }),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('paid')
  })

  it('500 when update fails', async () => {
    const server = createMockClient({
      user: adminUser,
      tables: { users: { select: { data: adminProfile } } },
    })
    const admin = createMockClient({
      tables: {
        portfolio_invoices: {
          update: { data: null, error: { message: 'db' } },
        },
      },
    })
    await setClients(server, admin)
    const { PATCH } = await import('../route')
    const res = await PATCH(
      buildRequest('http://localhost/api/admin/billing', {
        method: 'PATCH',
        body: patchPayload,
      }),
    )
    expect(res.status).toBe(500)
  })
})
