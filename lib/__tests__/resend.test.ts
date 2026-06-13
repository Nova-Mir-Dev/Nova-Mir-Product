import { describe, it, expect, vi, beforeEach } from 'vitest'

let ResendMock: ReturnType<typeof vi.fn>

vi.mock('resend', () => {
  ResendMock = vi.fn(function () {
    return { test: true }
  })
  return { Resend: ResendMock }
})

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  delete process.env.RESEND_API_KEY
})

describe('getResend', () => {
  it('creates a Resend instance with API key', async () => {
    process.env.RESEND_API_KEY = 're_123abc'

    const { getResend } = await import('../resend')
    const resend = getResend()

    expect(ResendMock).toHaveBeenCalledWith('re_123abc')
    expect(resend).toEqual({ test: true })
  })

  it('returns the same instance on subsequent calls (singleton)', async () => {
    process.env.RESEND_API_KEY = 're_123abc'

    const { getResend } = await import('../resend')
    const a = getResend()
    const b = getResend()

    expect(ResendMock).toHaveBeenCalledTimes(1)
    expect(a).toBe(b)
  })

  it('throws when RESEND_API_KEY is missing', async () => {
    const { getResend } = await import('../resend')
    expect(() => getResend()).toThrow('Missing required environment variable')
  })
})
