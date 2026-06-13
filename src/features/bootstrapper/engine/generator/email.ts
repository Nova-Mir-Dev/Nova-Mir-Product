import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'

export function generateEmailFiles(config: BootConfig): GeneratedFile[] {
  const { emailProvider } = config

  switch (emailProvider) {
    case 'none':
      return []

    case 'resend': {
      const resendLib: GeneratedFile = {
        path: 'lib/resend.ts',
        content: `import { Resend } from 'resend'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

export const resend = new Resend(getEnv('RESEND_API_KEY'))
`,
      }

      const emailLib: GeneratedFile = {
        path: 'lib/email.ts',
        content: `import { resend } from './resend'
import { WelcomeEmail } from '@/emails/welcome'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

export async function sendWelcomeEmail(to: string, name: string) {
  return resend.emails.send({
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
  return resend.emails.send({
    from: getEnv('EMAIL_FROM'),
    to,
    subject: 'Reset your password',
    html: \`<p>Click <a href="\${link}">here</a> to reset your password.</p>\`,
  })
}
`,
      }

      const welcomeTemplate: GeneratedFile = {
        path: 'emails/welcome.tsx',
        content: `import {
  Html, Head, Preview, Body, Text, Heading,
} from '@react-email/components'

interface WelcomeEmailProps {
  name: string
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to the app, {name}!</Preview>
      <Body style={{ fontFamily: 'sans-serif', padding: '20px' }}>
        <Heading>Welcome, {name}!</Heading>
        <Text>Thanks for joining. We're excited to have you on board.</Text>
      </Body>
    </Html>
  )
}
`,
      }

      return [resendLib, emailLib, welcomeTemplate]
    }

    case 'sendgrid': {
      const sendgridLib: GeneratedFile = {
        path: 'lib/sendgrid.ts',
        content: `import sgMail from '@sendgrid/mail'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

sgMail.setApiKey(getEnv('SENDGRID_API_KEY'))

export async function sendEmail(to: string, subject: string, html: string) {
  return sgMail.send({
    to,
    from: getEnv('EMAIL_FROM'),
    subject,
    html,
  })
}

export async function sendTemplate(to: string, templateId: string, dynamicData: Record<string, unknown>) {
  return sgMail.send({
    to,
    from: getEnv('EMAIL_FROM'),
    templateId,
    dynamicTemplateData: dynamicData,
  })
}
`,
      }
      return [sendgridLib]
    }

    case 'ses': {
      const sesLib: GeneratedFile = {
        path: 'lib/ses.ts',
        content: `import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

const ses = new SESClient({
  region: getEnv('AWS_REGION'),
  credentials: {
    accessKeyId: getEnv('AWS_ACCESS_KEY_ID'),
    secretAccessKey: getEnv('AWS_SECRET_ACCESS_KEY'),
  },
})

export async function sendEmail(to: string, subject: string, html: string) {
  return ses.send(
    new SendEmailCommand({
      Source: getEnv('EMAIL_FROM'),
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: { Html: { Data: html, Charset: 'UTF-8' } },
      },
    }),
  )
}
`,
      }
      return [sesLib]
    }

    case 'postmark': {
      const postmarkLib: GeneratedFile = {
        path: 'lib/postmark.ts',
        content: `import { ServerClient } from 'postmark'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

const client = new ServerClient(getEnv('POSTMARK_SERVER_TOKEN'))

export async function sendEmail(to: string, subject: string, html: string) {
  return client.sendEmail({
    From: getEnv('EMAIL_FROM'),
    To: to,
    Subject: subject,
    HtmlBody: html,
    MessageStream: 'outbound',
  })
}

export async function sendTemplate(to: string, templateAlias: string, model: Record<string, unknown>) {
  return client.sendEmailWithTemplate({
    From: getEnv('EMAIL_FROM'),
    To: to,
    TemplateAlias: templateAlias,
    TemplateModel: model,
  })
}
`,
      }
      return [postmarkLib]
    }
  }
}
