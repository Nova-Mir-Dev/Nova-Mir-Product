import { Resend } from 'resend'

let _resend: Resend | null = null

export function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) throw new Error('Missing required environment variable: RESEND_API_KEY')
    _resend = new Resend(apiKey)
  }
  return _resend
}
