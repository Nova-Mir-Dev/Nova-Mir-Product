import { describe, it, expect, vi, beforeEach } from 'vitest'

beforeEach(() => {
  vi.resetModules()
  delete process.env.CORS_ORIGINS
  delete process.env.VERCEL_URL
})

describe('isAllowedOrigin', () => {
  it('returns false for null origin', async () => {
    process.env.CORS_ORIGINS = 'https://example.com'
    const { isAllowedOrigin } = await import('../cors')
    expect(isAllowedOrigin(null)).toBe(false)
  })

  it('returns false when CORS_ORIGINS is not set', async () => {
    const { isAllowedOrigin } = await import('../cors')
    expect(isAllowedOrigin('https://example.com')).toBe(false)
  })

  it('returns true for allowed origin', async () => {
    process.env.CORS_ORIGINS = 'https://example.com,https://app.example.com'
    const { isAllowedOrigin } = await import('../cors')
    expect(isAllowedOrigin('https://example.com')).toBe(true)
    expect(isAllowedOrigin('https://app.example.com')).toBe(true)
  })

  it('returns false for disallowed origin', async () => {
    process.env.CORS_ORIGINS = 'https://example.com'
    const { isAllowedOrigin } = await import('../cors')
    expect(isAllowedOrigin('https://evil.com')).toBe(false)
  })

  it('returns true for VERCEL_URL match', async () => {
    process.env.CORS_ORIGINS = 'https://example.com'
    process.env.VERCEL_URL = 'my-app.vercel.app'
    const { isAllowedOrigin } = await import('../cors')
    expect(isAllowedOrigin('my-app.vercel.app')).toBe(true)
  })
})

describe('getCorsOriginHeader', () => {
  it('returns origin when allowed', async () => {
    process.env.CORS_ORIGINS = 'https://example.com'
    const { getCorsOriginHeader } = await import('../cors')
    expect(getCorsOriginHeader('https://example.com')).toBe(
      'https://example.com',
    )
  })

  it('returns first origin from list when origin not allowed', async () => {
    process.env.CORS_ORIGINS = 'https://fallback.com,https://example.com'
    const { getCorsOriginHeader } = await import('../cors')
    expect(getCorsOriginHeader('https://evil.com')).toBe('https://fallback.com')
  })

  it('returns empty string when no CORS_ORIGINS set', async () => {
    const { getCorsOriginHeader } = await import('../cors')
    expect(getCorsOriginHeader('https://example.com')).toBe('')
  })
})
