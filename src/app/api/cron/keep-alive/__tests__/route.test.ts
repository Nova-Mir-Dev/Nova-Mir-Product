import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import {
  createMockClient,
  type MockClient,
} from '@/lib/__tests__/api-test-helpers'

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  process.env.CRON_SECRET = 'test-cron-secret'
})

async function setAnonClient(client: MockClient) {
  const { createClient } = await import('@supabase/supabase-js')
  vi.mocked(createClient).mockReturnValue(client)
}

function createRequest(authorization?: string) {
  return new NextRequest('http://localhost:3000/api/cron/keep-alive', {
    headers: authorization ? { authorization } : {},
  })
}

describe('GET /api/cron/keep-alive', () => {
  it('401 without authorization header', async () => {
    const { GET } = await import('../route')
    const res = await GET(createRequest())
    expect(res.status).toBe(401)
  })

  it('401 with wrong bearer token', async () => {
    const { GET } = await import('../route')
    const res = await GET(createRequest('Bearer wrong-secret'))
    expect(res.status).toBe(401)
  })

  it('401 when CRON_SECRET is unset', async () => {
    delete process.env.CRON_SECRET
    const { GET } = await import('../route')
    const res = await GET(createRequest('Bearer undefined'))
    expect(res.status).toBe(401)
  })

  it('200 with correct bearer and successful query', async () => {
    await setAnonClient(
      createMockClient({
        tables: { pricing_tiers: { select: { data: [{ name: 'Starter' }] } } },
      }),
    )
    const { GET } = await import('../route')
    const res = await GET(createRequest('Bearer test-cron-secret'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.db).toBe(true)
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp)
  })

  it('503 when the query errors', async () => {
    await setAnonClient(
      createMockClient({
        tables: {
          pricing_tiers: { select: { data: null, error: { message: 'down' } } },
        },
      }),
    )
    const { GET } = await import('../route')
    const res = await GET(createRequest('Bearer test-cron-secret'))
    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body.ok).toBe(false)
    expect(body.db).toBe(false)
  })
})
