import { getResend } from './resend'
import { WelcomeEmail } from '@/emails/welcome'

function getEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error('Missing required environment variable: ' + name);
  return val;
}

export async function sendWelcomeEmail(to: string, name: string) {
  return getResend().emails.send({
    from: getEnv('EMAIL_FROM'),
    to,
    subject: 'Welcome!',
    react: WelcomeEmail({ name }),
  })
}

export async function sendPasswordReset(to: string, link: string) {
  try {
    new URL(link)
  } catch {
    throw new Error('Invalid reset link')
  }
  return getResend().emails.send({
    from: getEnv('EMAIL_FROM'),
    to,
    subject: 'Reset your password',
    html: `<p>Click <a href="${link}">here</a> to reset your password.</p>`,
  })
}
