import { describe, it, expect, vi, beforeEach } from 'vitest'

let StripeMock: ReturnType<typeof vi.fn>

vi.mock('stripe', () => {
  StripeMock = vi.fn(function () {
    return { test: true }
  })
  return { default: StripeMock }
})

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  delete process.env.STRIPE_SECRET_KEY
})

describe('getStripe', () => {
  it('creates a Stripe instance with secret key', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123'

    const { getStripe } = await import('../stripe')
    const stripe = getStripe()

    expect(StripeMock).toHaveBeenCalledWith(
      'sk_test_123',
      expect.objectContaining({
        apiVersion: '2025-02-24.acacia',
        typescript: true,
      }),
    )
    expect(stripe).toEqual({ test: true })
  })

  it('returns the same instance on subsequent calls (singleton)', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123'

    const { getStripe } = await import('../stripe')
    const a = getStripe()
    const b = getStripe()

    expect(StripeMock).toHaveBeenCalledTimes(1)
    expect(a).toBe(b)
  })

  it('throws when STRIPE_SECRET_KEY is missing', async () => {
    const { getStripe } = await import('../stripe')
    expect(() => getStripe()).toThrow('Missing required environment variable')
  })
})
