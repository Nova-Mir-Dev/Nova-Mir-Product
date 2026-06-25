'use client'
import { useState, useCallback } from 'react'
import {
  Container,
  Text,
  Button,
  Card,
  Stack,
  Input,
  ProgressBar,
  Alert,
} from 'azimuth-ui'
import { saveEnvVars, generateSlackManifest } from './actions'

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
  instructions: string
  fields: FieldDef[]
}

const SERVICES: ServiceDef[] = [
  {
    name: 'Supabase',
    url: 'https://supabase.com/dashboard/project/_/settings/api',
    description:
      'Database, auth, and file storage. Create a Supabase project, then copy your API keys from Project Settings → API.',
    instructions:
      'Create a project at supabase.com, then go to Project Settings → API to find these values.',
    fields: [
      {
        key: 'NEXT_PUBLIC_SUPABASE_URL',
        label: 'Project URL',
        instruction:
          'Found in Settings → API → Project URL. Looks like: https://xxx.supabase.co',
        docLink: 'https://supabase.com/dashboard/project/_/settings/api',
      },
      {
        key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        label: 'Anon Public Key',
        instruction:
          'Found in Settings → API → anon/public key. Starts with eyJ...',
        docLink: 'https://supabase.com/dashboard/project/_/settings/api',
      },
      {
        key: 'SUPABASE_SERVICE_ROLE_KEY',
        label: 'Service Role Key',
        instruction:
          'Found in Settings → API → service_role key. Keep this secret — never expose it to the browser.',
        isSecret: true,
        docLink: 'https://supabase.com/dashboard/project/_/settings/api',
      },
      {
        key: 'DATABASE_URL',
        label: 'Database URL (optional — CLI migrations)',
        instruction:
          'Found in Settings → Database → Connection string → URI. Needed for running migrations locally.',
        docLink: 'https://supabase.com/dashboard/project/_/settings/database',
      },
    ],
  },
  {
    name: 'Resend',
    url: 'https://resend.com/api-keys',
    description:
      'Transactional email. Create an account, verify a domain, and generate an API key.',
    instructions:
      'Sign up at resend.com, verify a domain (e.g. yourdomain.com), then create an API key.',
    fields: [
      {
        key: 'RESEND_API_KEY',
        label: 'API Key',
        instruction:
          'Create at resend.com/api-keys. Starts with re_. Copy it exactly — it only shows once.',
        isSecret: true,
        docLink: 'https://resend.com/api-keys',
      },
      {
        key: 'EMAIL_FROM',
        label: 'From Address',
        instruction:
          'The verified sender email, e.g. hello@yourdomain.com. Must match a domain you verified in Resend.',
      },
    ],
  },
  {
    name: 'Sentry',
    url: 'https://sentry.io/settings/account/api/',
    description:
      'Error tracking and performance monitoring. Create a project in Sentry and configure the DSN.',
    instructions:
      'Create a Next.js project in Sentry, then get the DSN from Project Settings → Client Keys (DSN).',
    fields: [
      {
        key: 'NEXT_PUBLIC_SENTRY_DSN',
        label: 'DSN',
        instruction:
          'Found in Sentry → Project Settings → Client Keys (DSN). Looks like: https://xxx@xxx.ingest.us.sentry.io/xxx',
        docLink: 'https://docs.sentry.io/platforms/javascript/guides/nextjs/',
      },
      {
        key: 'SENTRY_AUTH_TOKEN',
        label: 'Auth Token',
        instruction:
          'Create at sentry.io/settings/account/api/auth-tokens/. Needs project:releases and org:read scopes.',
        isSecret: true,
        docLink: 'https://sentry.io/settings/account/api/auth-tokens/',
      },
      {
        key: 'SENTRY_ORG',
        label: 'Organization Slug',
        instruction:
          'Found in Sentry top-left org switcher. The URL-safe version of your org name (e.g. "my-org").',
        isSecret: true,
      },
      {
        key: 'SENTRY_PROJECT',
        label: 'Project Slug',
        instruction:
          'Found in Sentry → Project Settings. The URL-safe version of your project name (e.g. "my-nextjs-app").',
        isSecret: true,
      },
    ],
  },
  {
    name: 'Slack',
    url: 'https://api.slack.com/apps',
    description:
      'Internal notifications and bot interactions. We can generate a manifest you import into Slack.',
    instructions:
      'We will generate a Slack manifest file. Download it, then go to api.slack.com/apps → Create New App → From manifest.',
    fields: [
      {
        key: 'SLACK_BOT_TOKEN',
        label: 'Bot Token',
        instruction:
          'After creating the app from the manifest, go to OAuth & Permissions → Install to Workspace, then copy the Bot User OAuth Token (starts with xoxb-).',
        isSecret: true,
        docLink: 'https://api.slack.com/apps',
      },
      {
        key: 'SLACK_SIGNING_SECRET',
        label: 'Signing Secret',
        instruction:
          'Found in Slack App Dashboard → Basic Information → App Credentials → Signing Secret.',
        isSecret: true,
      },
    ],
  },
  {
    name: 'Axiom',
    url: 'https://app.axiom.co/settings',
    description:
      'Structured log management. Create a dataset and generate an API token.',
    instructions:
      'Go to app.axiom.co, create a dataset, then create an API token in Settings → API Tokens.',
    fields: [
      {
        key: 'NEXT_PUBLIC_AXIOM_DATASET',
        label: 'Dataset Name',
        instruction:
          'Create a dataset in Axiom → Datasets. Use the exact name you chose (e.g. "nova-mir-logs").',
        docLink: 'https://app.axiom.co/datasets',
      },
      {
        key: 'AXIOM_API_TOKEN',
        label: 'API Token',
        instruction:
          'Create in Axiom → Settings → API Tokens → New Token. Needs "ingest" permission.',
        isSecret: true,
      },
    ],
  },
  {
    name: 'Twilio',
    url: 'https://console.twilio.com',
    description:
      'SMS messaging. Create an account, get a phone number, and find your credentials.',
    instructions:
      'Sign up at twilio.com, buy a phone number capable of SMS, then find your Account SID and Auth Token in the Console.',
    fields: [
      {
        key: 'TWILIO_ACCOUNT_SID',
        label: 'Account SID',
        instruction: 'Found in Twilio Console dashboard. Starts with AC...',
        isSecret: true,
        docLink: 'https://console.twilio.com',
      },
      {
        key: 'TWILIO_AUTH_TOKEN',
        label: 'Auth Token',
        instruction:
          'Found in Twilio Console dashboard, below Account SID. Keep this secret.',
        isSecret: true,
      },
      {
        key: 'TWILIO_PHONE_NUMBER',
        label: 'Phone Number',
        instruction:
          'Buy a number in Twilio Console → Phone Numbers. Use E.164 format: +1XXXXXXXXXX',
        isSecret: true,
      },
    ],
  },
  {
    name: 'Upstash Redis',
    url: 'https://console.upstash.com/redis',
    description:
      'Rate limiting and caching (optional). Create a free Redis database.',
    instructions:
      'Go to console.upstash.com → Create Database → Global. Copy the REST URL and token.',
    fields: [
      {
        key: 'UPSTASH_REDIS_REST_URL',
        label: 'REST URL',
        instruction:
          'Found in Upstash Console → Redis Database → Details → REST API → REST URL.',
        docLink: 'https://console.upstash.com/redis',
      },
      {
        key: 'UPSTASH_REDIS_REST_TOKEN',
        label: 'REST Token',
        instruction:
          'Found in Upstash Console → Redis Database → Details → REST API → REST Token.',
        isSecret: true,
      },
    ],
  },
  {
    name: 'Vercel',
    url: 'https://vercel.com/dashboard',
    description:
      'Deployment platform. Connect your repo and set environment variables.',
    instructions:
      'Push your code to GitHub, import the repo (github.com/rosejas13/Nova-Mir-Admin) into Vercel, then add all env vars from .env.production into Vercel Project Settings → Environment Variables.',
    fields: [],
  },
]

export default function SetupPage() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({})
  const [result, setResult] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)
  const [saving, setSaving] = useState(false)
  const [deploymentUrl, setDeploymentUrl] = useState(
    'https://nova-mir-admin.vercel.app',
  )
  const [appName, setAppName] = useState('Nova Mir Admin')
  const [generatedSlack, setGeneratedSlack] = useState(false)

  const setValue = useCallback((key: string, value: string) => {
    setEnvVars((prev) => ({ ...prev, [key]: value }))
  }, [])

  const totalFields = SERVICES.reduce((c, s) => c + s.fields.length, 0)
  const filledFields = SERVICES.reduce(
    (c, s) =>
      c +
      s.fields.filter((f) => (envVars[f.key] || '').trim().length > 0).length,
    0,
  )
  const allFilled = totalFields === filledFields

  async function handleSave() {
    setSaving(true)
    setResult(null)
    const res = await saveEnvVars(envVars)
    if (res.success) {
      setResult({
        type: 'success',
        message: `Written to ${res.path}. Use .env.production as a template for Vercel env vars.`,
      })
    } else {
      setResult({ type: 'error', message: res.error || 'Failed to save' })
    }
    setSaving(false)
  }

  async function handleGenerateSlack() {
    setResult(null)
    const res = await generateSlackManifest({
      appName,
      redirectUrl: deploymentUrl,
    })
    if (res.success) {
      setGeneratedSlack(true)
      setResult({
        type: 'info',
        message: `Slack manifest generated at ${res.path}. Go to api.slack.com/apps → Create New App → From manifest and upload this file.`,
      })
    } else {
      setResult({
        type: 'error',
        message: res.error || 'Failed to generate manifest',
      })
    }
  }

  return (
    <Container
      maxWidth={800}
      style={{ margin: '2rem auto', padding: '0 1rem' }}
    >
      <Stack spacing="lg">
        <div>
          <Text element={{ as: 'h1', size: 'h2' }} weight="bold">
            Setup
          </Text>
          <Text color="secondary">
            Fill in your service credentials below. Secrets are sent directly to
            the server and written to <code>.env.local</code>. For production
            deployment, use <code>.env.production</code> as a reference for
            Vercel environment variables.
          </Text>
        </div>

        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--azimuth-radius)',
            background: 'var(--azimuth-color-surface)',
          }}
        >
          <ProgressBar
            value={totalFields > 0 ? (filledFields / totalFields) * 100 : 0}
          />
          <Text element={{ size: 'xs' }} color="muted" style={{ marginTop: 4 }}>
            {filledFields} of {totalFields} values filled
          </Text>
        </div>

        {result && (
          <Alert variant={result.type === 'error' ? 'alert' : 'info'}>
            <Stack spacing="sm">
              <Text weight="semibold">
                {result.type === 'success'
                  ? 'Saved'
                  : result.type === 'error'
                    ? 'Error'
                    : 'Done'}
              </Text>
              <Text element={{ size: 'sm' }}>{result.message}</Text>
            </Stack>
          </Alert>
        )}

        {SERVICES.map((svc) => {
          const svcFilled = svc.fields.filter(
            (f) => (envVars[f.key] || '').trim().length > 0,
          ).length
          return (
            <Card key={svc.name}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem',
                }}
              >
                <div>
                  <Text element={{ as: 'h3', size: 'h4' }} weight="semibold">
                    {svc.name}
                    <Text
                      element={{ size: 'xs' }}
                      color="muted"
                      style={{ marginLeft: 8 }}
                    >
                      {svcFilled}/{svc.fields.length}
                    </Text>
                  </Text>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open(svc.url, '_blank')}
                >
                  Open ↗
                </Button>
              </div>

              <Text
                element={{ size: 'sm' }}
                color="secondary"
                style={{ marginBottom: 12 }}
              >
                {svc.description}
              </Text>

              {svc.fields.length === 0 && (
                <Text element={{ size: 'xs' }} color="muted">
                  {svc.instructions}
                </Text>
              )}

              {svc.fields.map((f) => (
                <div key={f.key} style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                    }}
                  >
                    <label htmlFor={f.key}>
                      <Text element={{ size: 'sm' }} weight="semibold">
                        {f.label}
                        {f.isSecret && (
                          <Text
                            element={{ size: 'xs' }}
                            color="muted"
                            style={{ marginLeft: 6 }}
                          >
                            (server-only)
                          </Text>
                        )}
                      </Text>
                    </label>
                    {f.docLink && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => window.open(f.docLink, '_blank')}
                      >
                        Find it ↗
                      </Button>
                    )}
                  </div>
                  <Text
                    element={{ size: 'xs' }}
                    color="muted"
                    style={{ marginBottom: 4, display: 'block' }}
                  >
                    {f.instruction}
                  </Text>
                  <Input
                    id={f.key}
                    type={f.isSecret ? 'password' : 'text'}
                    value={{
                      value: envVars[f.key] || '',
                      onChange: (e) => setValue(f.key, e.target.value),
                    }}
                  />
                </div>
              ))}
            </Card>
          )
        })}

        <Card>
          <Stack spacing="sm">
            <Text element={{ as: 'h3', size: 'h4' }} weight="semibold">
              Slack App Manifest
            </Text>
            <Text element={{ size: 'sm' }} color="secondary">
              Generate a Slack manifest file you can import directly into the
              Slack API dashboard. This creates a bot with message permissions
              and event subscriptions.
            </Text>
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-end',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: 180 }}>
                <Input
                  label={{ text: 'App Name' }}
                  value={{
                    value: appName,
                    onChange: (e) => setAppName(e.target.value),
                  }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <Input
                  label={{ text: 'Deployment URL' }}
                  value={{
                    value: deploymentUrl,
                    onChange: (e) => setDeploymentUrl(e.target.value),
                  }}
                />
              </div>
              <Button
                variant="secondary"
                onClick={handleGenerateSlack}
                disabled={generatedSlack}
              >
                {generatedSlack ? 'Generated ✓' : 'Generate Manifest'}
              </Button>
            </div>
          </Stack>
        </Card>

        <Card>
          <Stack spacing="sm">
            <Text element={{ as: 'h3', size: 'h4' }} weight="semibold">
              Deployment Readiness
            </Text>
            <Text element={{ size: 'sm' }} color="secondary">
              {allFilled
                ? 'All fields are filled. Ready to save and deploy.'
                : 'Fill in all fields above for a complete deployment.'}
            </Text>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              {[
                {
                  label: 'Supabase project',
                  ok: !!envVars['NEXT_PUBLIC_SUPABASE_URL'],
                },
                {
                  label: 'Auth configured',
                  ok: !!envVars['SUPABASE_SERVICE_ROLE_KEY'],
                },
                { label: 'Email provider', ok: !!envVars['RESEND_API_KEY'] },
                {
                  label: 'Error monitoring',
                  ok: !!envVars['NEXT_PUBLIC_SENTRY_DSN'],
                },
                {
                  label: 'Slack integration',
                  ok: generatedSlack || !!envVars['SLACK_BOT_TOKEN'],
                },
                {
                  label: 'Log management',
                  ok: !!envVars['NEXT_PUBLIC_AXIOM_DATASET'],
                },
                { label: 'SMS provider', ok: !!envVars['TWILIO_ACCOUNT_SID'] },
                {
                  label: 'Rate limiting',
                  ok: !!envVars['UPSTASH_REDIS_REST_URL'],
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Text
                    element={{ size: 'sm' }}
                    color={item.ok ? undefined : 'muted'}
                  >
                    {item.ok ? '✓' : '○'} {item.label}
                  </Text>
                  {!item.ok && (
                    <Text element={{ size: 'xs' }} color="muted">
                      (optional)
                    </Text>
                  )}
                </div>
              ))}
            </div>
          </Stack>
        </Card>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving || filledFields === 0}
          >
            {saving ? 'Saving...' : 'Write .env.local'}
          </Button>
          {allFilled && (
            <Button
              variant="secondary"
              onClick={() => window.open('https://vercel.com/new', '_blank')}
            >
              Deploy to Vercel ↗
            </Button>
          )}
        </div>
      </Stack>
    </Container>
  )
}
