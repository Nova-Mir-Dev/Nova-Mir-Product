import 'server-only'
import type { App as SlackApp } from '@slack/bolt'

let _app: SlackApp | null = null

async function getApp() {
  if (_app) return _app
  const { App } = await import('@slack/bolt')
  _app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: false,
  })
  return _app
}

export async function notifyNewLead(lead: {
  name: string
  email: string
  businessName: string
  phone?: string
  serviceInterest?: string
  budgetRange?: string
  message: string
}) {
  if (!process.env.SLACK_BOT_TOKEN || !process.env.SLACK_SIGNING_SECRET) {
    return
  }

  const app = await getApp()

  await app.client.chat.postMessage({
    channel: process.env.SLACK_LEADS_CHANNEL || '#leads',
    text: `New lead: ${lead.name} from ${lead.businessName}`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: 'New Lead :zap:' },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Name:* ${lead.name}` },
          { type: 'mrkdwn', text: `*Email:* ${lead.email}` },
          { type: 'mrkdwn', text: `*Business:* ${lead.businessName}` },
          { type: 'mrkdwn', text: `*Phone:* ${lead.phone || 'N/A'}` },
          {
            type: 'mrkdwn',
            text: `*Service:* ${lead.serviceInterest || 'N/A'}`,
          },
          { type: 'mrkdwn', text: `*Budget:* ${lead.budgetRange || 'N/A'}` },
        ],
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Message:*\n${lead.message}` },
      },
    ],
  })
}
