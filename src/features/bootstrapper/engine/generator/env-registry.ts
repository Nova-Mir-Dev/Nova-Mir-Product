import type { BootConfig } from '../../types'

interface EnvVar {
  key: string
  label: string
  description: string
  example: string
  docLink?: string
}

type ServiceField = { key: string; label: string; docLink?: string }

type Service = {
  name: string
  url: string
  description: string
  fields: ServiceField[]
}

interface EnvVarEntry {
  condition: (config: BootConfig) => boolean
  vars: EnvVar[]
  comment?: string
  service?: {
    name: string
    url: string
    description: string
  }
}

const SUPABASE_URL_VAR: EnvVar = {
  key: 'NEXT_PUBLIC_SUPABASE_URL',
  label: 'Project URL',
  description: 'Supabase project URL',
  example: '',
  docLink: 'https://supabase.com/dashboard/project/_/settings/api',
}

const SUPABASE_ANON_KEY_VAR: EnvVar = {
  key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  label: 'Anon Public Key',
  description: 'Supabase anonymous key (safe for client)',
  example: '',
}

const SUPABASE_SERVICE_ROLE_VAR: EnvVar = {
  key: 'SUPABASE_SERVICE_ROLE_KEY',
  label: 'Service Role Key (Server-only)',
  description: 'Supabase service role key (server-only)',
  example: '  # Server-only — never expose to client',
  docLink: 'https://supabase.com/dashboard/project/_/settings/api',
}

const STRIPE_SECRET_VAR: EnvVar = {
  key: 'STRIPE_SECRET_KEY',
  label: 'Secret Key',
  description: 'Stripe secret key (server-only)',
  example: 'sk_live_',
  docLink: 'https://dashboard.stripe.com/apikeys',
}

const STRIPE_PUBLISHABLE_VAR: EnvVar = {
  key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  label: 'Publishable Key',
  description: 'Stripe publishable key (safe for client)',
  example: 'pk_',
}

const STRIPE_WEBHOOK_VAR: EnvVar = {
  key: 'STRIPE_WEBHOOK_SECRET',
  label: 'Webhook Signing Secret',
  description: 'Stripe webhook signing secret',
  example: 'whsec_',
  docLink: 'https://dashboard.stripe.com/webhooks',
}

const RESEND_API_KEY_VAR: EnvVar = {
  key: 'RESEND_API_KEY',
  label: 'API Key',
  description: 'Resend API key',
  example: 're_',
  docLink: 'https://resend.com/api-keys',
}

const EMAIL_FROM_VAR: EnvVar = {
  key: 'EMAIL_FROM',
  label: 'From Address',
  description: 'From address for transactional emails',
  example: '',
}

const SENTRY_DSN_VAR: EnvVar = {
  key: 'NEXT_PUBLIC_SENTRY_DSN',
  label: 'DSN',
  description: 'Sentry DSN for client-side error tracking',
  example: '',
  docLink: 'https://docs.sentry.io/platforms/javascript/guides/nextjs/',
}

const SENTRY_AUTH_TOKEN_VAR: EnvVar = {
  key: 'SENTRY_AUTH_TOKEN',
  label: 'Auth Token (source map uploads)',
  description: 'Sentry auth token for sourcemap uploads',
  example: '',
  docLink: 'https://sentry.io/settings/account/api/auth-tokens/',
}

const SENTRY_ORG_VAR: EnvVar = {
  key: 'SENTRY_ORG',
  label: 'Organization Slug',
  description: 'Sentry organisation slug',
  example: '',
}

const SENTRY_PROJECT_VAR: EnvVar = {
  key: 'SENTRY_PROJECT',
  label: 'Project Slug',
  description: 'Sentry project slug',
  example: '',
}

const SLACK_BOT_TOKEN_VAR: EnvVar = {
  key: 'SLACK_BOT_TOKEN',
  label: 'Bot Token',
  description: 'Slack bot token for messaging',
  example: 'xoxb-',
  docLink: 'https://api.slack.com/apps',
}

const SLACK_SIGNING_SECRET_VAR: EnvVar = {
  key: 'SLACK_SIGNING_SECRET',
  label: 'Signing Secret',
  description: 'Slack signing secret for verifying requests',
  example: '',
}

const AXIOM_DATASET_VAR: EnvVar = {
  key: 'NEXT_PUBLIC_AXIOM_DATASET',
  label: 'Dataset Name',
  description: 'Axiom dataset name for log ingestion',
  example: '',
  docLink: 'https://app.axiom.co/datasets',
}

const AXIOM_API_TOKEN_VAR: EnvVar = {
  key: 'AXIOM_API_TOKEN',
  label: 'API Token',
  description: 'Axiom API token for sending logs',
  example: '',
}

const TWILIO_ACCOUNT_SID_VAR: EnvVar = {
  key: 'TWILIO_ACCOUNT_SID',
  label: 'Account SID',
  description: 'Twilio account SID',
  example: '',
  docLink: 'https://console.twilio.com',
}

const TWILIO_AUTH_TOKEN_VAR: EnvVar = {
  key: 'TWILIO_AUTH_TOKEN',
  label: 'Auth Token',
  description: 'Twilio auth token',
  example: '',
}

const TWILIO_PHONE_NUMBER_VAR: EnvVar = {
  key: 'TWILIO_PHONE_NUMBER',
  label: 'Phone Number',
  description: 'Twilio phone number for sending SMS',
  example: '',
}

export const ENV_VAR_REGISTRY: EnvVarEntry[] = [
  {
    condition: () => true,
    comment: '# Supabase',
    vars: [SUPABASE_URL_VAR, SUPABASE_ANON_KEY_VAR, SUPABASE_SERVICE_ROLE_VAR],
  },
  {
    condition: (c) => c.databaseProvider === 'supabase',
    vars: [SUPABASE_URL_VAR, SUPABASE_ANON_KEY_VAR],
    service: {
      name: 'Supabase',
      url: 'https://supabase.com/dashboard',
      description:
        'Database, auth, and file storage backend. Create a project and copy your API keys.',
    },
  },
  {
    condition: (c) => c.auth === 'supabase-auth',
    vars: [SUPABASE_SERVICE_ROLE_VAR],
    service: {
      name: 'Supabase Auth',
      url: 'https://supabase.com/dashboard/project/_/auth/settings',
      description: 'Configure auth providers, site URL, and redirect URLs.',
    },
  },
  {
    condition: (c) => c.databaseProvider === 'supabase',
    comment: '# Database',
    vars: [
      {
        key: 'DATABASE_URL',
        label: 'DATABASE_URL',
        description: 'PostgreSQL connection string (Supabase managed)',
        example:
          'postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres',
      },
    ],
  },
  {
    condition: (c) => c.databaseProvider === 'planetscale',
    comment: '# Database',
    vars: [
      {
        key: 'DATABASE_URL',
        label: 'DATABASE_URL',
        description: 'MySQL connection string (PlanetScale managed)',
        example:
          'mysql://[USERNAME]:[PASSWORD]@[HOST]/[DATABASE]?ssl=%7B%22rejectUnauthorized%22%3Atrue%7D',
      },
    ],
  },
  {
    condition: (c) => c.databaseProvider === 'turso',
    comment: '# Database',
    vars: [
      {
        key: 'DATABASE_URL',
        label: 'DATABASE_URL',
        description: 'libSQL/Turso database URL',
        example: 'libsql://[DATABASE]-[ORGANIZATION].turso.io',
      },
      {
        key: 'TURSO_AUTH_TOKEN',
        label: 'TURSO_AUTH_TOKEN',
        description: 'Turso authentication token',
        example: '',
      },
    ],
  },
  {
    condition: (c) => c.databaseProvider === 'neon',
    comment: '# Database',
    vars: [
      {
        key: 'DATABASE_URL',
        label: 'DATABASE_URL',
        description: 'PostgreSQL connection string (Neon serverless)',
        example:
          'postgresql://[USERNAME]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require',
      },
    ],
  },
  {
    condition: (c) => c.databaseProvider === 'atlas',
    comment: '# Database',
    vars: [
      {
        key: 'MONGODB_URI',
        label: 'MONGODB_URI',
        description: 'MongoDB Atlas connection string',
        example:
          'mongodb+srv://[USERNAME]:[PASSWORD]@[CLUSTER].mongodb.net/[DATABASE]?retryWrites=true&w=majority',
      },
    ],
  },
  {
    condition: (c) =>
      c.databaseProvider !== 'supabase' &&
      c.databaseProvider !== 'planetscale' &&
      c.databaseProvider !== 'turso' &&
      c.databaseProvider !== 'neon' &&
      c.databaseProvider !== 'atlas',
    comment: '# Database',
    vars: [
      {
        key: 'DATABASE_URL',
        label: 'DATABASE_URL',
        description: 'Database connection string',
        example: '',
      },
    ],
  },
  {
    condition: (c) => c.auth === 'jwt',
    comment: '# Auth (JWT)',
    vars: [
      {
        key: 'JWT_SECRET',
        label: 'JWT_SECRET',
        description: 'Secret key for signing JWTs',
        example: 'your-secret-at-least-32-chars',
      },
    ],
  },
  {
    condition: (c) => c.auth === 'next-auth',
    comment: '# Auth (NextAuth)',
    vars: [
      {
        key: 'AUTH_SECRET',
        label: 'AUTH_SECRET',
        description: 'Auth.js secret for encrypting sessions',
        example: 'your-auth-secret',
      },
      {
        key: 'AUTH_URL',
        label: 'AUTH_URL',
        description: 'Base URL of the application',
        example: 'http://localhost:3000',
      },
    ],
  },
  {
    condition: (c) =>
      c.auth === 'next-auth' && c.ssoProviders.includes('google'),
    vars: [
      {
        key: 'GOOGLE_CLIENT_ID',
        label: 'GOOGLE_CLIENT_ID',
        description: 'Google OAuth client ID',
        example: '',
      },
      {
        key: 'GOOGLE_CLIENT_SECRET',
        label: 'GOOGLE_CLIENT_SECRET',
        description: 'Google OAuth client secret',
        example: '',
      },
    ],
  },
  {
    condition: (c) =>
      c.auth === 'next-auth' && c.ssoProviders.includes('github'),
    vars: [
      {
        key: 'GITHUB_CLIENT_ID',
        label: 'GITHUB_CLIENT_ID',
        description: 'GitHub OAuth client ID',
        example: '',
      },
      {
        key: 'GITHUB_CLIENT_SECRET',
        label: 'GITHUB_CLIENT_SECRET',
        description: 'GitHub OAuth client secret',
        example: '',
      },
    ],
  },
  {
    condition: (c) =>
      c.auth === 'next-auth' && c.ssoProviders.includes('microsoft'),
    vars: [
      {
        key: 'AZURE_AD_CLIENT_ID',
        label: 'AZURE_AD_CLIENT_ID',
        description: 'Azure AD application client ID',
        example: '',
      },
      {
        key: 'AZURE_AD_CLIENT_SECRET',
        label: 'AZURE_AD_CLIENT_SECRET',
        description: 'Azure AD application client secret',
        example: '',
      },
      {
        key: 'AZURE_AD_TENANT_ID',
        label: 'AZURE_AD_TENANT_ID',
        description: 'Azure AD tenant ID',
        example: '',
      },
    ],
  },
  {
    condition: (c) =>
      c.auth === 'next-auth' && c.ssoProviders.includes('apple'),
    vars: [
      {
        key: 'APPLE_CLIENT_ID',
        label: 'APPLE_CLIENT_ID',
        description: 'Apple Sign In service ID',
        example: '',
      },
      {
        key: 'APPLE_CLIENT_SECRET',
        label: 'APPLE_CLIENT_SECRET',
        description: 'Apple Sign In private key',
        example: '',
      },
    ],
  },
  {
    condition: (c) => c.auth === 'auth0',
    comment: '# Auth (Auth0)',
    vars: [
      {
        key: 'AUTH0_SECRET',
        label: 'AUTH0_SECRET',
        description: 'Auth0 secret for encrypting sessions',
        example: 'long-random-secret',
      },
      {
        key: 'AUTH0_ISSUER_BASE_URL',
        label: 'AUTH0_ISSUER_BASE_URL',
        description: 'Auth0 tenant domain URL',
        example: 'https://[tenant].auth0.com',
      },
      {
        key: 'AUTH0_BASE_URL',
        label: 'AUTH0_BASE_URL',
        description: 'Base URL of the application',
        example: 'http://localhost:3000',
      },
      {
        key: 'AUTH0_CLIENT_ID',
        label: 'AUTH0_CLIENT_ID',
        description: 'Auth0 application client ID',
        example: '',
      },
      {
        key: 'AUTH0_CLIENT_SECRET',
        label: 'AUTH0_CLIENT_SECRET',
        description: 'Auth0 application client secret',
        example: '',
      },
    ],
  },
  {
    condition: (c) => c.payments === 'stripe',
    comment: '# Stripe',
    vars: [STRIPE_SECRET_VAR, STRIPE_WEBHOOK_VAR, STRIPE_PUBLISHABLE_VAR],
    service: {
      name: 'Stripe',
      url: 'https://dashboard.stripe.com',
      description:
        'Payment processing. Create an account, get your API keys, and configure webhooks.',
    },
  },
  {
    condition: (c) => c.emailProvider === 'resend',
    comment: '# Email (Resend)',
    vars: [RESEND_API_KEY_VAR, EMAIL_FROM_VAR],
    service: {
      name: 'Resend',
      url: 'https://resend.com/domains',
      description:
        'Transactional email delivery. Create an account, verify your domain, and get your API key.',
    },
  },
  {
    condition: (c) => c.monitoring === 'sentry',
    comment: '# Sentry',
    vars: [
      SENTRY_DSN_VAR,
      SENTRY_AUTH_TOKEN_VAR,
      SENTRY_ORG_VAR,
      SENTRY_PROJECT_VAR,
    ],
    service: {
      name: 'Sentry',
      url: 'https://sentry.io/settings/account/api/',
      description:
        'Error tracking and performance monitoring. Create a project and get your DSN.',
    },
  },
  {
    condition: (c) => c.communicationPlatforms.includes('slack'),
    comment: '# Slack',
    vars: [SLACK_BOT_TOKEN_VAR, SLACK_SIGNING_SECRET_VAR],
    service: {
      name: 'Slack',
      url: 'https://api.slack.com/apps',
      description:
        'Messaging and notifications. Create a Slack app, install it to your workspace, and get your tokens.',
    },
  },
  {
    condition: (c) => c.logManagement === 'axiom',
    comment: '# Axiom',
    vars: [AXIOM_DATASET_VAR, AXIOM_API_TOKEN_VAR],
    service: {
      name: 'Axiom',
      url: 'https://app.axiom.co/settings',
      description:
        'Log management and observability. Create a dataset and get your API token.',
    },
  },
  {
    condition: (c) => c.corsEnabled,
    comment: '# CORS',
    vars: [
      {
        key: 'CORS_ORIGINS',
        label: 'CORS_ORIGINS',
        description: 'Allowed CORS origins (comma-separated, * for all)',
        example: 'http://localhost:3000',
      },
    ],
  },
  {
    condition: (c) => c.smsProvider === 'twilio',
    comment: '# Twilio',
    vars: [
      TWILIO_ACCOUNT_SID_VAR,
      TWILIO_AUTH_TOKEN_VAR,
      TWILIO_PHONE_NUMBER_VAR,
    ],
    service: {
      name: 'Twilio',
      url: 'https://console.twilio.com',
      description:
        'SMS messaging. Create an account, get a phone number, and find your credentials.',
    },
  },
  {
    condition: (c) =>
      c.rateLimiting === 'upstash' || c.cache === 'upstash-redis',
    comment: '# Upstash Redis',
    vars: [
      {
        key: 'UPSTASH_REDIS_URL',
        label: 'UPSTASH_REDIS_URL',
        description: 'Upstash Redis URL for rate limiting',
        example: '',
      },
      {
        key: 'UPSTASH_REDIS_TOKEN',
        label: 'UPSTASH_REDIS_TOKEN',
        description: 'Upstash Redis token for rate limiting',
        example: '',
      },
    ],
  },
  {
    condition: (c) => c.hosting === 'vercel',
    vars: [],
    service: {
      name: 'Vercel',
      url: 'https://vercel.com/dashboard',
      description:
        'Deployment platform. Connect your GitHub repository and deploy. Environment variables should be configured in the Vercel dashboard.',
    },
  },
]

export function getEnvVarDescriptions(
  config: BootConfig,
): Record<string, string> {
  const seen = new Set<string>()
  const vars: Record<string, string> = {}

  for (const entry of ENV_VAR_REGISTRY) {
    if (!entry.condition(config)) continue
    for (const v of entry.vars) {
      if (seen.has(v.key)) continue
      seen.add(v.key)
      vars[v.key] = v.description
    }
  }

  return vars
}

export function generateEnvExample(config: BootConfig): string {
  const seen = new Set<string>()
  const lines: string[] = []

  for (const entry of ENV_VAR_REGISTRY) {
    if (!entry.condition(config)) continue
    if (!entry.comment) continue

    const entryVars = entry.vars.filter((v) => {
      if (seen.has(v.key)) return false
      seen.add(v.key)
      return true
    })

    if (entryVars.length === 0) continue

    lines.push(entry.comment)
    for (const v of entryVars) {
      if (v.key === 'EMAIL_FROM') {
        lines.push(`EMAIL_FROM=hello@${config.projectName}.com`)
      } else {
        lines.push(`${v.key}=${v.example}`)
      }
    }
    lines.push('')
  }

  return lines.join('\n')
}

export function buildServices(config: BootConfig): Service[] {
  const services: Service[] = []

  for (const entry of ENV_VAR_REGISTRY) {
    if (!entry.condition(config)) continue
    if (!entry.service) continue

    services.push({
      name: entry.service.name,
      url: entry.service.url,
      description: entry.service.description,
      fields: entry.vars.map((v) => ({
        key: v.key,
        label: v.label,
        docLink: v.docLink,
      })),
    })
  }

  return services
}
