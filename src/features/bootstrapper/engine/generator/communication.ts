import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'

export function generateCommunicationFiles(
  config: BootConfig,
): GeneratedFile[] {
  const { communicationPlatforms, projectName } = config
  const files: GeneratedFile[] = []

  if (communicationPlatforms.includes('slack')) {
    files.push({
      path: 'slack-app/app.ts',
      content: `import { App } from '@slack/bolt'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

const app = new App({
  token: getEnv('SLACK_BOT_TOKEN'),
  signingSecret: getEnv('SLACK_SIGNING_SECRET'),
  socketMode: false,
})

app.message('hello', async ({ message, say }) => {
  await say(\`Hey there <@\${(message as any).user}>\`)
})

export { app }
`,
    })

    files.push({
      path: 'slack-app/manifest.json',
      content: JSON.stringify(
        {
          display_information: {
            name: projectName,
            description: `${projectName} Slack bot`,
          },
          features: {
            bot_user: { display_name: projectName },
          },
          oauth_config: {
            scopes: {
              bot: ['chat:write', 'commands', 'channels:history'],
            },
          },
          settings: {
            event_subscriptions: {
              request_url: `https://your-domain.com/api/slack/events`,
            },
            interactivity: {
              is_enabled: true,
              request_url: `https://your-domain.com/api/slack/interactive`,
            },
          },
        },
        null,
        2,
      ),
    })

    files.push({
      path: 'slack-app/.env.example',
      content:
        'SLACK_BOT_TOKEN=xoxb-your-bot-token\nSLACK_SIGNING_SECRET=your-signing-secret\n',
    })
  }

  if (communicationPlatforms.includes('teams')) {
    files.push({
      path: 'teams-app/manifest.json',
      content: JSON.stringify(
        {
          $schema:
            'https://developer.microsoft.com/en-us/json-schemas/teams/v1.16/MicrosoftTeams.schema.json',
          manifestVersion: '1.16',
          version: '1.0.0',
          id: '{{TEAMS_APP_ID}}',
          packageName: `com.${projectName}.teams`,
          name: { short: projectName, full: projectName },
          description: {
            short: `${projectName} Teams bot`,
            full: `${projectName} Teams integration`,
          },
          bots: [
            {
              botId: '{{BOT_ID}}',
              scopes: ['personal', 'team', 'groupChat'],
              supportsFiles: false,
              isNotificationOnly: false,
            },
          ],
          validDomains: ['your-domain.com'],
        },
        null,
        2,
      ),
    })

    files.push({
      path: 'teams-app/bot.ts',
      content: `import { TeamsActivityHandler, TurnContext } from 'botbuilder'

export class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super()
    this.onMessage(async (context: TurnContext, next) => {
      const text = context.activity.text
      await context.sendActivity(\`You said: \${text}\`)
      await next()
    })
  }
}
`,
    })

    files.push({
      path: 'teams-app/.env.example',
      content:
        'TEAMS_APP_ID=your-app-id\nTEAMS_APP_PASSWORD=your-app-password\nBOT_ID=your-bot-id\n',
    })
  }

  if (communicationPlatforms.includes('zoom')) {
    files.push({
      path: 'zoom-app/.env.example',
      content: [
        'ZOOM_CLIENT_ID=your-client-id',
        'ZOOM_CLIENT_SECRET=your-client-secret',
        'ZOOM_VERIFICATION_TOKEN=your-verification-token',
        'ZOOM_REDIRECT_URI=http://localhost:3000/api/zoom/callback',
      ].join('\n'),
    })

    files.push({
      path: 'zoom-app/auth.ts',
      content: `function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

export async function getZoomAccessToken(code: string) {
  const res = await fetch('https://zoom.us/oauth/token', {
    method: 'POST',
    headers: {
      Authorization: \`Basic \${Buffer.from(
        \`\${getEnv('ZOOM_CLIENT_ID')}:\${getEnv('ZOOM_CLIENT_SECRET')}\`,
      ).toString('base64')}\`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: getEnv('ZOOM_REDIRECT_URI') }),
  })
  return res.json()
}

export async function refreshZoomToken(refreshToken: string) {
  const res = await fetch('https://zoom.us/oauth/token', {
    method: 'POST',
    headers: {
      Authorization: \`Basic \${Buffer.from(
        \`\${getEnv('ZOOM_CLIENT_ID')}:\${getEnv('ZOOM_CLIENT_SECRET')}\`,
      ).toString('base64')}\`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
  })
  return res.json()
}
`,
    })

    files.push({
      path: 'zoom-app/webhook.ts',
      content: `import { NextResponse } from 'next/server'
import crypto from 'node:crypto'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

export function verifyZoomWebhook(body: string, signature: string, timestamp: string) {
  const message = \`v0:\${timestamp}:\${body}\`
  const hash = crypto.createHmac('sha256', getEnv('ZOOM_VERIFICATION_TOKEN')).update(message).digest('hex')
  return \`v0=\${hash}\` === signature
}

export function handleZoomEvent(event: string, payload: unknown) {
  switch (event) {
    case 'endpoint.url_validation':
      const { plainToken } = payload as { plainToken: string }
      const hash = crypto.createHmac('sha256', getEnv('ZOOM_VERIFICATION_TOKEN')).update(plainToken).digest('hex')
      return NextResponse.json({ plainToken, encryptedToken: hash })
    case 'meeting.started':
      console.log('Meeting started:', payload)
      break
    default:
      console.log('Unhandled Zoom event:', event)
  }
  return NextResponse.json({ received: true })
}
`,
    })
  }

  return files
}
