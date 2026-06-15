import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

beforeEach(() => {
  vi.restoreAllMocks()
  vi.resetModules()
  delete process.env.UPSTASH_REDIS_REST_URL
  delete process.env.UPSTASH_REDIS_TOKEN
})

describe('rateLimit with in-memory fallback', () => {
  it('allows requests within the limit', async () => {
    const { rateLimit } = await import('../rate-limit')
    const result = await rateLimit('test-key', 5, 60000)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(4)
    expect(typeof result.reset).toBe('number')
  })

  it('blocks requests above the limit', async () => {
    const { rateLimit } = await import('../rate-limit')
    for (let i = 0; i < 3; i++) {
      await rateLimit('limited-key', 2, 60000)
    }
    const result = await rateLimit('limited-key', 2, 60000)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('separates state by different keys', async () => {
    const { rateLimit } = await import('../rate-limit')
    await rateLimit('key-a', 1, 60000)
    const a2 = await rateLimit('key-a', 1, 60000)
    expect(a2.allowed).toBe(false)

    const b1 = await rateLimit('key-b', 1, 60000)
    expect(b1.allowed).toBe(true)
  })

  it('resets after window expires', async () => {
    const { rateLimit } = await import('../rate-limit')
    await rateLimit('expire-key', 1, 50)
    const blocked = await rateLimit('expire-key', 1, 50)
    expect(blocked.allowed).toBe(false)

    await new Promise((r) => setTimeout(r, 60))

    const reset = await rateLimit('expire-key', 1, 50)
    expect(reset.allowed).toBe(true)
  })
})
