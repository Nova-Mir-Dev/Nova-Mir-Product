import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createMockClient,
  clientUser,
  buildRequest,
  unauthUser,
  type MockClient,
} from '@/lib/__tests__/api-test-helpers'

vi.mock('@/lib/supabase-server', () => ({ createClient: vi.fn() }))
vi.mock('@/lib/rate-limit', () => ({ rateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 99, reset: 0 }) }))

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

const entityParams = (entity: string) => ({ params: Promise.resolve({ entity }) })

describe('GET /api/crud/[entity]', () => {
  it('400 when entity is invalid', async () => {
    const { GET } = await import('../route')
    const res = await GET(
      buildRequest('http://localhost/api/crud/bogus', { method: 'GET' }),
      entityParams('bogus'),
    )
    expect(res.status).toBe(400)
    expect((await res.json()).code).toBe('VALIDATION_ERROR')
  })

  it('401 unauthenticated', async () => {
    await setClient(createMockClient({ user: unauthUser }))
    const { GET } = await import('../route')
    const res = await GET(buildRequest('http://localhost/api/crud/users', { method: 'GET' }), entityParams('users'))
    expect(res.status).toBe(401)
  })

  it('200 scaffold response for allowed entity', async () => {
    await setClient(createMockClient({ user: clientUser }))
    const { GET } = await import('../route')
    const res = await GET(buildRequest('http://localhost/api/crud/users?limit=5', { method: 'GET' }), entityParams('users'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.entity).toBe('users')
    expect(body.limit).toBe(5)
  })
})

describe('POST /api/crud/[entity]', () => {
  it('400 when entity is invalid', async () => {
    const { POST } = await import('../route')
    const res = await POST(
      buildRequest('http://localhost/api/crud/bogus', { method: 'POST', body: {} }),
      entityParams('bogus'),
    )
    expect(res.status).toBe(400)
  })

  it('401 unauthenticated', async () => {
    await setClient(createMockClient({ user: unauthUser }))
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/crud/projects', { method: 'POST', body: {} }), entityParams('projects'))
    expect(res.status).toBe(401)
  })

  it('429 rate-limited', async () => {
    const { rateLimit } = await import('@/lib/rate-limit')
    vi.mocked(rateLimit).mockResolvedValueOnce({ allowed: false, remaining: 0, reset: 0 })
    await setClient(createMockClient({ user: clientUser }))
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/crud/tasks', { method: 'POST', body: {} }), entityParams('tasks'))
    expect(res.status).toBe(429)
  })

  it('201 scaffold response on success', async () => {
    await setClient(createMockClient({ user: clientUser }))
    const { POST } = await import('../route')
    const res = await POST(buildRequest('http://localhost/api/crud/tasks', { method: 'POST', body: { foo: 'bar' } }), entityParams('tasks'))
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.entity).toBe('tasks')
    expect(body.data).toEqual({ foo: 'bar' })
  })
})