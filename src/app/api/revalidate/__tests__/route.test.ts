import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildRequest } from '@/lib/__tests__/api-test-helpers'

vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }))

beforeEach(() => {
  vi.clearAllMocks()
  process.env.REVALIDATION_SECRET = 'super-secret'
  delete process.env.UPSTASH_REDIS_REST_URL
})

describe('POST /api/revalidate', () => {
  it('401 when secret is missing or wrong', async () => {
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/revalidate', { method: 'POST', body: { tag: 'pricing', secret: 'wrong' } }))
    expect(res.status).toBe(401)
  })

  it('401 when secret omitted', async () => {
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/revalidate', { method: 'POST', body: { tag: 'pricing' } }))
    expect(res.status).toBe(401)
  })

  it('400 when tag is invalid', async () => {
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/revalidate', { method: 'POST', body: { tag: 'unknown', secret: 'super-secret' } }))
    expect(res.status).toBe(400)
  })

  it('400 when tag is missing', async () => {
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/revalidate', { method: 'POST', body: { secret: 'super-secret' } }))
    expect(res.status).toBe(400)
  })

  it('200 revalidates a known tag', async () => {
    const { revalidateTag } = await import('next/cache')
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/revalidate', { method: 'POST', body: { tag: 'pricing', secret: 'super-secret' } }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.revalidated).toBe(true)
    expect(body.tag).toBe('pricing')
    expect(revalidateTag).toHaveBeenCalledWith('pricing', { expire: 60 })
  })

  it('400 when body is invalid JSON', async () => {
    const { POST } = await import('../route')
    const res = await POST(new Request('http://localhost/api/revalidate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{bad',
    }))
    expect(res.status).toBe(400)
  })
})