import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}))

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  delete process.env.NEXT_PUBLIC_SUPABASE_URL
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  delete process.env.SUPABASE_SERVICE_ROLE_KEY
  delete process.env.NEXT_PUBLIC_SITE_URL
  delete process.env.CORS_ORIGINS
  delete process.env.VERCEL_URL
  delete process.env.UPSTASH_REDIS_REST_URL
  delete process.env.UPSTASH_REDIS_TOKEN
})

function createRequest({
  method = 'GET',
  url = 'http://localhost:3000/api/health',
  headers = {},
}: {
  method?: string
  url?: string
  headers?: Record<string, string>
} = {}): NextRequest {
  return new NextRequest(url, {
    method,
    headers: new Headers(headers),
  })
}

describe('CSRF protection', () => {
  it('blocks POST requests with disallowed origin', async () => {
    process.env.CORS_ORIGINS = 'https://example.com'
    const { middleware } = await import('../../../middleware')

    const req = createRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/leads',
      headers: { origin: 'https://evil.com' },
    })

    const response = await middleware(req)
    expect(response.status).toBe(403)
    const body = await response.json()
    expect(body.error).toBe('Forbidden')
  })

  it('blocks POST requests with missing origin and referer when SITE_URL is set', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com'
    const { middleware } = await import('../../../middleware')

    const req = createRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/leads',
    })

    const response = await middleware(req)
    expect(response.status).toBe(403)
    const body = await response.json()
    expect(body.error).toBe('Forbidden')
  })

  it('blocks POST requests with mismatched referer when SITE_URL is set', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com'
    const { middleware } = await import('../../../middleware')

    const req = createRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/leads',
      headers: { referer: 'https://evil.com/attack' },
    })

    const response = await middleware(req)
    expect(response.status).toBe(403)
    const body = await response.json()
    expect(body.error).toBe('Forbidden')
  })

  it('allows POST requests with matching referer when SITE_URL is set', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com'
    const { middleware } = await import('../../../middleware')

    const req = createRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/leads',
      headers: { referer: 'https://example.com/contact' },
    })

    const response = await middleware(req)
    expect(response.status).toBe(200)
  })

  it('blocks PUT requests with disallowed origin', async () => {
    process.env.CORS_ORIGINS = 'https://example.com'
    const { middleware } = await import('../../../middleware')

    const req = createRequest({
      method: 'PUT',
      url: 'http://localhost:3000/api/leads',
      headers: { origin: 'https://evil.com' },
    })

    const response = await middleware(req)
    expect(response.status).toBe(403)
  })

  it('blocks DELETE requests with disallowed origin', async () => {
    process.env.CORS_ORIGINS = 'https://example.com'
    const { middleware } = await import('../../../middleware')

    const req = createRequest({
      method: 'DELETE',
      url: 'http://localhost:3000/api/leads',
      headers: { origin: 'https://evil.com' },
    })

    const response = await middleware(req)
    expect(response.status).toBe(403)
  })
})

describe('CORS - OPTIONS requests', () => {
  it('returns 204 with CORS headers for allowed origin', async () => {
    process.env.CORS_ORIGINS = 'https://example.com'
    const { middleware } = await import('../../../middleware')

    const req = createRequest({
      method: 'OPTIONS',
      url: 'http://localhost:3000/api/health',
      headers: { origin: 'https://example.com' },
    })

    const response = await middleware(req)
    expect(response.status).toBe(204)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://example.com',
    )
    expect(response.headers.get('Access-Control-Allow-Methods')).toBeTruthy()
    expect(response.headers.get('Access-Control-Allow-Headers')).toBeTruthy()
    expect(response.headers.get('Access-Control-Max-Age')).toBeTruthy()
  })

  it('returns 204 without CORS headers for disallowed origin', async () => {
    process.env.CORS_ORIGINS = 'https://example.com'
    const { middleware } = await import('../../../middleware')

    const req = createRequest({
      method: 'OPTIONS',
      url: 'http://localhost:3000/api/health',
      headers: { origin: 'https://evil.com' },
    })

    const response = await middleware(req)
    expect(response.status).toBe(204)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })

  it('returns 204 without CORS headers when no origin is sent', async () => {
    process.env.CORS_ORIGINS = 'https://example.com'
    const { middleware } = await import('../../../middleware')

    const req = createRequest({
      method: 'OPTIONS',
      url: 'http://localhost:3000/api/health',
    })

    const response = await middleware(req)
    expect(response.status).toBe(204)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })
})

describe('CORS headers', () => {
  it('does not add CORS headers to non-API (HTML) page responses', async () => {
    process.env.CORS_ORIGINS = 'https://example.com'
    const { middleware } = await import('../../../middleware')

    const req = createRequest({
      method: 'GET',
      url: 'http://localhost:3000/',
      headers: { origin: 'https://example.com' },
    })

    const response = await middleware(req)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull()
    expect(response.headers.get('Access-Control-Allow-Methods')).toBeNull()
  })
})

describe('Rate limiting', () => {
  it('returns 429 when rate limit is exceeded for public API route', async () => {
    const { middleware } = await import('../../../middleware')

    const createReq = () =>
      new NextRequest('http://localhost:3000/api/health', {
        headers: { 'x-forwarded-for': '10.0.0.1' },
      })

    for (let i = 0; i < 10; i++) {
      const res = await middleware(createReq())
      expect(res.status).toBe(200)
    }

    const blocked = await middleware(createReq())
    expect(blocked.status).toBe(429)
    const body = await blocked.json()
    expect(body.error).toContain('Too many requests')
    expect(blocked.headers.get('Retry-After')).toBeTruthy()
  })

  it('returns 429 when mutation rate limit is exceeded', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'
    const { middleware } = await import('../../../middleware')

    const createReq = () =>
      new NextRequest('http://localhost:3000/api/leads', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '10.0.0.2',
          referer: 'http://localhost:3000/contact',
        },
      })

    for (let i = 0; i < 5; i++) {
      const res = await middleware(createReq())
      expect(res.status).toBe(200)
    }

    const blocked = await middleware(createReq())
    expect(blocked.status).toBe(429)
  })
})

describe('Graceful degradation when Supabase is unreachable', () => {
  function setSupabaseEnv() {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  }

  async function setAuthClient(getUser: () => Promise<unknown>) {
    const { createServerClient } = await import('@supabase/ssr')
    vi.mocked(createServerClient).mockReturnValue({
      auth: { getUser },
    } as never)
  }

  it('redirects /dashboard to client login with reason=service_unavailable when auth throws', async () => {
    setSupabaseEnv()
    await setAuthClient(() => Promise.reject(new Error('fetch failed')))
    const { middleware } = await import('../../../middleware')

    const res = await middleware(
      createRequest({ url: 'http://localhost:3000/dashboard' }),
    )
    expect(res.status).toBe(307)
    const location = new URL(res.headers.get('location')!)
    expect(location.pathname).toBe('/clients/auth/login')
    expect(location.searchParams.get('reason')).toBe('service_unavailable')
  })

  it('redirects /admin to admin login with reason=service_unavailable when auth throws', async () => {
    setSupabaseEnv()
    await setAuthClient(() => Promise.reject(new Error('fetch failed')))
    const { middleware } = await import('../../../middleware')

    const res = await middleware(
      createRequest({ url: 'http://localhost:3000/admin' }),
    )
    expect(res.status).toBe(307)
    const location = new URL(res.headers.get('location')!)
    expect(location.pathname).toBe('/admin/auth/login')
    expect(location.searchParams.get('reason')).toBe('service_unavailable')
  })

  it('serves / anonymously when auth throws', async () => {
    setSupabaseEnv()
    await setAuthClient(() => Promise.reject(new Error('fetch failed')))
    const { middleware } = await import('../../../middleware')

    const res = await middleware(
      createRequest({ url: 'http://localhost:3000/' }),
    )
    expect(res.status).toBe(200)
  })

  it('skips the role lookup instead of sending Bearer undefined when the service key is unset', async () => {
    setSupabaseEnv()
    await setAuthClient(() =>
      Promise.resolve({ data: { user: { id: 'user-1' } } }),
    )
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('[]'))
    const { middleware } = await import('../../../middleware')

    const res = await middleware(
      createRequest({ url: 'http://localhost:3000/admin' }),
    )
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(res.status).toBe(307)
    const location = new URL(res.headers.get('location')!)
    expect(location.searchParams.get('reason')).toBe('no_role')
    fetchSpy.mockRestore()
  })
})
