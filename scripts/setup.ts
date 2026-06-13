#!/usr/bin/env node
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as readline from 'node:readline'

const GIT_REPO = 'github.com/rosejas13/Nova-Mir-Admin'

interface FieldDef {
  key: string
  label: string
  instruction: string
  docLink?: string
  isSecret?: boolean
}

interface ServiceDef {
  name: string
  url: string
  description: string
  fields: FieldDef[]
}

const SERVICES: ServiceDef[] = [
  {
    name: 'Supabase',
    url: 'https://supabase.com/dashboard/project/_/settings/api',
    description: 'Database, auth, and file storage. Create a project, then copy keys from Settings \u2192 API.',
    fields: [
      { key: 'NEXT_PUBLIC_SUPABASE_URL', label: 'Project URL', instruction: 'Settings \u2192 API \u2192 Project URL. Looks like: https://xxx.supabase.co', docLink: 'https://supabase.com/dashboard/project/_/settings/api' },
      { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', label: 'Anon Public Key', instruction: 'Settings \u2192 API \u2192 anon/public key. Starts with eyJ...', docLink: 'https://supabase.com/dashboard/project/_/settings/api' },
      { key: 'SUPABASE_SERVICE_ROLE_KEY', label: 'Service Role Key', instruction: 'Settings \u2192 API \u2192 service_role key. Keep this secret.', docLink: 'https://supabase.com/dashboard/project/_/settings/api', isSecret: true },
      { key: 'DATABASE_URL', label: 'Database URL (optional)', instruction: 'Settings \u2192 Database \u2192 Connection string \u2192 URI. Needed for CLI migrations.', docLink: 'https://supabase.com/dashboard/project/_/settings/database' },
    ],
  },
  {
    name: 'Resend',
    url: 'https://resend.com/api-keys',
    description: 'Transactional email. Create an account, verify a domain, generate an API key.',
    fields: [
      { key: 'RESEND_API_KEY', label: 'API Key', instruction: 'resend.com/api-keys. Starts with re_. Shows once.', isSecret: true, docLink: 'https://resend.com/api-keys' },
      { key: 'EMAIL_FROM', label: 'From Address', instruction: 'Verified sender, e.g. hello@yourdomain.com' },
    ],
  },
  {
    name: 'Sentry',
    url: 'https://sentry.io/settings/account/api/',
    description: 'Error tracking. Create a Next.js project in Sentry.',
    fields: [
      { key: 'NEXT_PUBLIC_SENTRY_DSN', label: 'DSN', instruction: 'Project Settings \u2192 Client Keys (DSN)', docLink: 'https://docs.sentry.io/platforms/javascript/guides/nextjs/' },
      { key: 'SENTRY_AUTH_TOKEN', label: 'Auth Token', instruction: 'Create at sentry.io/settings/account/api/auth-tokens/. Needs project:releases + org:read.', isSecret: true, docLink: 'https://sentry.io/settings/account/api/auth-tokens/' },
      { key: 'SENTRY_ORG', label: 'Organization Slug', instruction: 'URL-safe org name from Sentry top-left', isSecret: true },
      { key: 'SENTRY_PROJECT', label: 'Project Slug', instruction: 'URL-safe project name from Sentry settings', isSecret: true },
    ],
  },
  {
    name: 'Slack',
    url: 'https://api.slack.com/apps',
    description: 'Bot notifications. I will generate a manifest you import into Slack.',
    fields: [
      { key: 'SLACK_BOT_TOKEN', label: 'Bot Token', instruction: 'After creating app from manifest: OAuth \u2192 Install to Workspace. Starts with xoxb-', isSecret: true, docLink: 'https://api.slack.com/apps' },
      { key: 'SLACK_SIGNING_SECRET', label: 'Signing Secret', instruction: 'Basic Information \u2192 App Credentials \u2192 Signing Secret', isSecret: true },
    ],
  },
  {
    name: 'Axiom',
    url: 'https://app.axiom.co/settings',
    description: 'Log management. Create a dataset and API token.',
    fields: [
      { key: 'NEXT_PUBLIC_AXIOM_DATASET', label: 'Dataset Name', instruction: 'Create a dataset in Axiom \u2192 Datasets', docLink: 'https://app.axiom.co/datasets' },
      { key: 'AXIOM_API_TOKEN', label: 'API Token', instruction: 'Settings \u2192 API Tokens \u2192 New Token (ingest permission)', isSecret: true },
    ],
  },
  {
    name: 'Twilio',
    url: 'https://console.twilio.com',
    description: 'SMS messaging. Buy a phone number, get your credentials.',
    fields: [
      { key: 'TWILIO_ACCOUNT_SID', label: 'Account SID', instruction: 'Twilio Console dashboard. Starts with AC...', isSecret: true, docLink: 'https://console.twilio.com' },
      { key: 'TWILIO_AUTH_TOKEN', label: 'Auth Token', instruction: 'Twilio Console dashboard, below Account SID', isSecret: true },
      { key: 'TWILIO_PHONE_NUMBER', label: 'Phone Number', instruction: 'Buy a number in Console \u2192 Phone Numbers. E.164: +1XXXXXXXXXX', isSecret: true },
    ],
  },
  {
    name: 'Upstash Redis',
    url: 'https://console.upstash.com/redis',
    description: 'Rate limiting + caching (optional). Create a free Redis database.',
    fields: [
      { key: 'UPSTASH_REDIS_URL', label: 'REST URL', instruction: 'Console \u2192 Redis DB \u2192 Details \u2192 REST API \u2192 URL', docLink: 'https://console.upstash.com/redis' },
      { key: 'UPSTASH_REDIS_TOKEN', label: 'REST Token', instruction: 'Console \u2192 Redis DB \u2192 Details \u2192 REST API \u2192 Token', isSecret: true },
    ],
  },
]

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const prompt = (q: string): Promise<string> => new Promise((r) => rl.question(q, r))

function mask(value: string): string {
  if (value.length <= 8) return '*'.repeat(value.length)
  return value.slice(0, 4) + '*'.repeat(value.length - 8) + value.slice(-4)
}

async function main() {
  console.log()
  console.log('\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557')
  console.log('\u2551  Nova Mir Admin \u2014 Setup')
  console.log('\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255b')
  console.log()
  console.log('Repo: ' + GIT_REPO)
  console.log('Press Enter to skip any field (leave it empty).')
  console.log()

  const envPath = path.join(process.cwd(), '.env.local')
  const existing: Record<string, string> = {}
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
      const eqIdx = line.indexOf('=')
      if (eqIdx > 0 && !line.startsWith('#'))
        existing[line.slice(0, eqIdx).trim()] = line.slice(eqIdx + 1).trim()
    }
  }

  const envVars: Record<string, string> = {}
  for (const svc of SERVICES) {
    console.log('')
    console.log('\u2500\u2500 ' + svc.name + ' \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
    console.log('  ' + svc.description)
    console.log('  \u2197 ' + svc.url)
    console.log()

    for (const field of svc.fields) {
      const current = existing[field.key] || ''
      const defaultHint = current ? ' [' + mask(current) + ']' : ''
      const secretTag = field.isSecret ? ' (server-only)' : ''

      console.log('  ' + field.label + secretTag)
      console.log('    \u2139\uFE0F ' + field.instruction)
      if (field.docLink) console.log('    \u2197 ' + field.docLink)

      const answer = await prompt('    ' + field.key + defaultHint + ': ')
      const val = answer.trim() || current
      if (val) envVars[field.key] = val
      console.log()
    }
  }

  console.log('\u2500\u2500 Deployment \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  const deployUrl = (await prompt('  Deployment URL (e.g. https://nova-mir-admin.vercel.app): ')).trim() || 'https://nova-mir-admin.vercel.app'
  const appName = (await prompt('  Slack App Name [Nova Mir Admin]: ')).trim() || 'Nova Mir Admin'

  if (deployUrl) {
    envVars['CORS_ORIGINS'] = (envVars['CORS_ORIGINS'] ? envVars['CORS_ORIGINS'] + ',' : '') + 'http://localhost:3000,' + deployUrl.replace(/\/$/, '')
  }

  console.log()

  const entries = Object.entries(envVars).filter(([, v]) => v.trim().length > 0)
  entries.sort(([a], [b]) => a.localeCompare(b))

  fs.writeFileSync(envPath, '# Generated by npm run setup\n' + entries.map(([k, v]) => k + '=' + v.trim()).join('\n') + '\n')
  console.log('\u2705  .env.local written (' + entries.length + ' vars)')

  const prodEntries = entries.map(([k, v]) => k + '=' + (k.startsWith('NEXT_PUBLIC_') ? v.trim() : '<set-in-vercel-dashboard>'))
  fs.writeFileSync(path.join(process.cwd(), '.env.production'), '# Reference for Vercel env vars — replace <set-in-vercel-dashboard> values\n' + prodEntries.join('\n') + '\n')
  console.log('\u2705  .env.production written (reference for Vercel)')

  const slackManifest = {
    display_information: {
      name: appName,
      description: 'Admin portal notifications and interactions',
      background_color: '#0f172a',
    },
    features: { bot_user: { display_name: appName, always_online: false } },
    oauth_config: {
      redirect_urls: [deployUrl.replace(/\/$/, '') + '/api/slack/oauth_redirect'],
      scopes: { bot: ['chat:write', 'channels:history', 'groups:history', 'users:read'] },
    },
    settings: {
      event_subscriptions: { request_url: deployUrl.replace(/\/$/, '') + '/api/slack/events', bot_events: ['message.channels', 'message.im'] },
      org_deploy_enabled: false,
      socket_mode_enabled: false,
      token_rotation_enabled: false,
    },
  }
  fs.writeFileSync(path.join(process.cwd(), 'public', 'slack-manifest.json'), JSON.stringify(slackManifest, null, 2))
  console.log('\u2705  public/slack-manifest.json generated')

  console.log()
  console.log('\u2500\u2500 Supabase CLI (optional) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  const runDb = (await prompt('  Run `npx supabase link` + `db push` to sync schema? (y/N): ')).trim().toLowerCase()
  if (runDb === 'y' || runDb === 'yes') {
    const { execSync } = await import('node:child_process')
    const ref = (await prompt('  Supabase project ref (from dashboard URL: project_ ref): ')).trim()
    if (ref) {
      try {
        console.log('  Linking Supabase project...')
        execSync('npx supabase link --project-ref ' + ref, { stdio: 'inherit' })
        console.log('  Pushing schema...')
        execSync('npx supabase db push', { stdio: 'inherit' })
        console.log('\u2705  Database schema synced')
      } catch {
        console.log('\u26A0\uFE0F  Supabase CLI commands failed. Make sure you have the Supabase CLI installed and are logged in.')
      }
    }
  }

  console.log()
  console.log('\u2550'.repeat(60))
  console.log('\u2705  Setup complete! Summary:')
  console.log()
  console.log('  Env vars saved:  ' + path.relative(process.cwd(), envPath))
  console.log('  Deploy template: .env.production')
  console.log('  Slack manifest:  public/slack-manifest.json')
  console.log()
  console.log('  Next steps:')
  console.log('    1. npm run dev          Start development server')
  console.log('    2. git push             Push to GitHub')
  console.log('    3. Import to Vercel:    https://vercel.com/new')
  console.log('       Repo: ' + GIT_REPO)
  console.log('    4. Add env vars to Vercel from .env.production')
  console.log('    5. Import Slack manifest: api.slack.com/apps \u2192 Create New App \u2192 From manifest')
  console.log('\u2550'.repeat(60))
  console.log()

  rl.close()
}

main().catch((err) => {
  console.error('Setup failed:', err)
  process.exit(1)
})
