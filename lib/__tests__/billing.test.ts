import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = {
  getStripe: vi.fn(),
}

vi.mock('../stripe', () => ({
  getStripe: mocks.getStripe,
}))

beforeEach(() => {
  vi.clearAllMocks()
  delete process.env.STRIPE_SUCCESS_URL
  delete process.env.STRIPE_CANCEL_URL
  delete process.env.STRIPE_RETURN_URL

  mocks.getStripe.mockReturnValue({
    checkout: { sessions: { create: vi.fn() } },
    billingPortal: { sessions: { create: vi.fn() } },
  })
})

describe('handleStripeEvent', () => {
  it('handles checkout.session.completed', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { handleStripeEvent } = await import('../billing')

    await handleStripeEvent({ type: 'checkout.session.completed', data: { object: { id: 'cs_test_123' } } } as any)

    expect(logSpy).toHaveBeenCalledWith('Checkout completed:', 'cs_test_123')
    logSpy.mockRestore()
  })

  it('handles customer.subscription.updated', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { handleStripeEvent } = await import('../billing')

    await handleStripeEvent({ type: 'customer.subscription.updated', data: { object: { id: 'sub_123' } } } as any)

    expect(logSpy).toHaveBeenCalledWith('Subscription updated:', 'sub_123')
    logSpy.mockRestore()
  })

  it('handles customer.subscription.deleted', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { handleStripeEvent } = await import('../billing')

    await handleStripeEvent({ type: 'customer.subscription.deleted', data: { object: { id: 'sub_456' } } } as any)

    expect(logSpy).toHaveBeenCalledWith('Subscription cancelled:', 'sub_456')
    logSpy.mockRestore()
  })

  it('handles unknown event types', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { handleStripeEvent } = await import('../billing')

    await handleStripeEvent({ type: 'unknown.event', data: { object: {} } } as any)

    expect(logSpy).toHaveBeenCalledWith('Unhandled event type:', 'unknown.event')
    logSpy.mockRestore()
  })
})

describe('createCheckoutSession', () => {
  it('creates a checkout session', async () => {
    process.env.STRIPE_SUCCESS_URL = 'https://example.com/success'
    process.env.STRIPE_CANCEL_URL = 'https://example.com/cancel'

    const stripeMock = mocks.getStripe()
    vi.mocked(stripeMock.checkout.sessions.create).mockResolvedValue({ id: 'cs_test' })

    const { createCheckoutSession } = await import('../billing')
    const result = await createCheckoutSession('cus_123', 'price_456')

    expect(stripeMock.checkout.sessions.create).toHaveBeenCalledWith({
      customer: 'cus_123',
      line_items: [{ price: 'price_456', quantity: 1 }],
      mode: 'subscription',
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
    })
    expect(result).toEqual({ id: 'cs_test' })
  })

  it('throws when env vars are missing', async () => {
    const { createCheckoutSession } = await import('../billing')
    await expect(createCheckoutSession('cus_123', 'price_456')).rejects.toThrow('Missing required environment variable')
  })
})

describe('createCustomerPortal', () => {
  it('creates a customer portal session and returns url', async () => {
    process.env.STRIPE_RETURN_URL = 'https://example.com/return'

    const stripeMock = mocks.getStripe()
    vi.mocked(stripeMock.billingPortal.sessions.create).mockResolvedValue({ url: 'https://billing.stripe.com/session/abc' })

    const { createCustomerPortal } = await import('../billing')
    const url = await createCustomerPortal('cus_123')

    expect(stripeMock.billingPortal.sessions.create).toHaveBeenCalledWith({
      customer: 'cus_123',
      return_url: 'https://example.com/return',
    })
    expect(url).toBe('https://billing.stripe.com/session/abc')
  })

  it('throws when env vars are missing', async () => {
    const { createCustomerPortal } = await import('../billing')
    await expect(createCustomerPortal('cus_123')).rejects.toThrow('Missing required environment variable')
  })
})
