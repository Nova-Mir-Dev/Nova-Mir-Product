import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../resend', () => ({
  getResend: vi.fn(),
}))

vi.mock('@/emails/welcome', () => ({
  WelcomeEmail: () => null,
}))

let sendMock: ReturnType<typeof vi.fn>
let getResendMock: ReturnType<typeof vi.fn>

beforeEach(async () => {
  vi.resetModules()
  delete process.env.EMAIL_FROM

  sendMock = vi.fn()
  getResendMock = vi.fn(() => ({ emails: { send: sendMock } }))

  const resendModule = await import('../resend')
  vi.mocked(resendModule.getResend).mockImplementation(getResendMock)
})

describe('sendWelcomeEmail', () => {
  it('sends welcome email with correct params', async () => {
    process.env.EMAIL_FROM = 'test@example.com'
    const { sendWelcomeEmail } = await import('../email')
    await sendWelcomeEmail('user@test.com', 'Alice')

    expect(sendMock).toHaveBeenCalledTimes(1)
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'test@example.com',
        to: 'user@test.com',
        subject: 'Welcome!',
      }),
    )
  })

  it('throws when EMAIL_FROM is missing', async () => {
    const { sendWelcomeEmail } = await import('../email')
    await expect(sendWelcomeEmail('user@test.com', 'Alice')).rejects.toThrow('Missing required environment variable')
  })
})

describe('sendPasswordReset', () => {
  it('sends password reset email with valid link', async () => {
    process.env.EMAIL_FROM = 'noreply@example.com'
    const { sendPasswordReset } = await import('../email')
    await sendPasswordReset('user@test.com', 'https://example.com/reset?token=abc')

    expect(sendMock).toHaveBeenCalledTimes(1)
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'noreply@example.com',
        to: 'user@test.com',
        subject: 'Reset your password',
        html: expect.stringContaining('https://example.com/reset?token=abc'),
      }),
    )
  })

  it('throws for invalid reset link', async () => {
    process.env.EMAIL_FROM = 'noreply@example.com'
    const { sendPasswordReset } = await import('../email')
    await expect(sendPasswordReset('user@test.com', 'not-a-url')).rejects.toThrow('Invalid reset link')
  })

  it('throws when EMAIL_FROM is missing', async () => {
    const { sendPasswordReset } = await import('../email')
    await expect(sendPasswordReset('user@test.com', 'https://example.com/reset')).rejects.toThrow('Missing required environment variable')
  })
})
