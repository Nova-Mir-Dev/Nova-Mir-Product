import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createMockClient,
  buildRequest,
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

describe('POST /api/compliance/opt-out', () => {
  it('400 when email is missing', async () => {
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/compliance/opt-out', { method: 'POST', body: {} }))
    expect(res.status).toBe(400)
  })

  it('400 when email is not a string', async () => {
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/compliance/opt-out', { method: 'POST', body: { email: 42 } }))
    expect(res.status).toBe(400)
  })

  it('500 when insert fails', async () => {
    await setClient(createMockClient({
      tables: { ccpa_opt_outs: { insert: { data: null, error: { message: 'db' } } } },
    }))
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/compliance/opt-out', { method: 'POST', body: { email: 'a@x.com' } }))
    expect(res.status).toBe(500)
  })

  it('200 records the opt-out', async () => {
    await setClient(createMockClient({
      tables: { ccpa_opt_outs: { insert: { data: null, error: null } } },
    }))
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/compliance/opt-out', {
      method: 'POST',
      body: { email: 'a@x.com' },
      headers: { 'x-forwarded-for': '1.2.3.4' },
    }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  it('400 when body is invalid JSON', async () => {
    const { POST } = await import('../route')
    const res = await POST(new Request('http://localhost/api/compliance/opt-out', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{not json',
    }))
    expect(res.status).toBe(400)
  })
})