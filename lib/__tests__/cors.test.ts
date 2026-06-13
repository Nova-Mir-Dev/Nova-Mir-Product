import { describe, it, expect, beforeEach, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
  delete process.env.CORS_ORIGINS
  delete process.env.VERCEL_URL
})

describe('isAllowedOrigin', () => {
  it('allows origins from CORS_ORIGINS', async () => {
    process.env.CORS_ORIGINS = 'https://example.com,https://app.example.com'
    const { isAllowedOrigin } = await import('../cors')
    expect(isAllowedOrigin('https://example.com')).toBe(true)
    expect(isAllowedOrigin('https://app.example.com')).toBe(true)
  })

  it('rejects origins not in CORS_ORIGINS', async () => {
    process.env.CORS_ORIGINS = 'https://example.com'
    const { isAllowedOrigin } = await import('../cors')
    expect(isAllowedOrigin('https://evil.com')).toBe(false)
  })

  it('allows VERCEL_URL origin', async () => {
    process.env.CORS_ORIGINS = 'https://example.com'
    process.env.VERCEL_URL = 'my-app.vercel.app'
    const { isAllowedOrigin } = await import('../cors')
    expect(isAllowedOrigin('my-app.vercel.app')).toBe(true)
  })

  it('rejects null and undefined origins', async () => {
    process.env.CORS_ORIGINS = 'https://example.com'
    const { isAllowedOrigin } = await import('../cors')
    expect(isAllowedOrigin(null)).toBe(false)
    expect(isAllowedOrigin(undefined as unknown as string | null)).toBe(false)
  })

  it('returns false when CORS_ORIGINS is not set', async () => {
    const { isAllowedOrigin } = await import('../cors')
    expect(isAllowedOrigin('https://example.com')).toBe(false)
  })
})

describe('getCorsHeaders', () => {
  it('returns origin header for allowed origin', async () => {
    process.env.CORS_ORIGINS = 'https://example.com'
    const { getCorsHeaders } = await import('../cors')
    const headers = getCorsHeaders('https://example.com')
    expect(headers['Access-Control-Allow-Origin']).toBe('https://example.com')
  })

  it('returns empty object for disallowed origin', async () => {
    process.env.CORS_ORIGINS = 'https://example.com'
    const { getCorsHeaders } = await import('../cors')
    expect(getCorsHeaders('https://evil.com')).toEqual({})
  })

  it('returns empty object when no CORS_ORIGINS set', async () => {
    delete process.env.CORS_ORIGINS
    const { getCorsHeaders } = await import('../cors')
    expect(getCorsHeaders('https://example.com')).toEqual({})
  })
})

describe('CORS_HEADERS', () => {
  it('has expected headers', async () => {
    const { CORS_HEADERS } = await import('../cors')
    expect(CORS_HEADERS['Access-Control-Allow-Methods']).toMatch(/GET|POST|PATCH|DELETE|OPTIONS/)
    expect(CORS_HEADERS['Access-Control-Allow-Headers']).toMatch(/Content-Type|Authorization/)
    expect(CORS_HEADERS['Access-Control-Max-Age']).toBe('86400')
  })
})

describe('getCorsOriginHeader', () => {
  it('returns the origin if allowed', async () => {
    process.env.CORS_ORIGINS = 'https://example.com'
    const { getCorsOriginHeader } = await import('../cors')
    expect(getCorsOriginHeader('https://example.com')).toBe('https://example.com')
  })

  it('returns first allowed origin if not allowed', async () => {
    process.env.CORS_ORIGINS = 'https://fallback.com,https://example.com'
    const { getCorsOriginHeader } = await import('../cors')
    expect(getCorsOriginHeader('https://evil.com')).toBe('https://fallback.com')
  })

  it('returns empty string when no origins configured', async () => {
    const { getCorsOriginHeader } = await import('../cors')
    expect(getCorsOriginHeader('https://example.com')).toBe('')
  })
})
