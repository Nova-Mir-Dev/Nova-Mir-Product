import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import { validateConfig } from '@/features/bootstrapper/engine/constraints'
import { runComplianceAudit } from '@/features/bootstrapper/engine/compliance/auditor'
import { generateProject } from '@/features/bootstrapper/api/generate'
import { PRESETS, DEFAULT_CONFIG } from '@/features/bootstrapper/types'
import type { BootConfig } from '@/features/bootstrapper/types'

const BootstrapSchema = z.object({
  preset: z.string().min(1, 'Preset is required'),
  projectName: z.string().max(100).optional(),
  framework: z.enum(['nextjs', 'vite-react', 'remix', 'astro']).optional(),
  hosting: z.enum(['vercel', 'aws', 'gcp', 'azure', 'custom']).optional(),
  database: z
    .enum(['postgresql', 'mysql', 'sqlite', 'mongodb', 'dynamodb'])
    .optional(),
  auth: z
    .enum(['none', 'jwt', 'next-auth', 'supabase-auth', 'clerk', 'auth0'])
    .optional(),
  payments: z.enum(['none', 'stripe', 'lemonsqueezy', 'paddle']).optional(),
  mode: z.enum(['validate', 'generate']).optional(),
})

const SUPPORTED_OPTIONS = {
  frameworks: ['nextjs', 'vite-react', 'remix', 'astro'],
  hosting: ['vercel', 'aws', 'gcp', 'azure', 'custom'],
  databases: ['postgresql', 'mysql', 'sqlite', 'mongodb', 'dynamodb'],
  databaseProviders: [
    'supabase',
    'planetscale',
    'neon',
    'turso',
    'atlas',
    'self-hosted',
  ],
  auth: ['none', 'jwt', 'next-auth', 'supabase-auth', 'clerk', 'auth0'],
  authProviders: ['google', 'github', 'microsoft', 'apple', 'saml'],
  payments: ['none', 'stripe', 'lemonsqueezy', 'paddle'],
  storage: [
    'none',
    's3',
    'cloudinary',
    'supabase-storage',
    'cloudflare-r2',
    'vercel-blob',
  ],
  monitoring: ['none', 'sentry', 'datadog', 'grafana'],
  logging: ['none', 'axiom', 'logtail'],
  analytics: ['none', 'plausible', 'posthog', 'google-analytics', 'mixpanel'],
  cdn: ['none', 'cloudfront', 'cloudflare'],
  cache: ['none', 'upstash-redis', 'valkey', 'memory'],
  search: ['none', 'pgvector', 'meilisearch', 'typesense'],
  ai: ['none', 'vercel-ai-sdk', 'openai'],
  realtime: ['none', 'supabase-realtime', 'socket.io', 'pusher'],
  backgroundJobs: ['none', 'inngest', 'trigger-dev', 'bullmq'],
  email: ['none', 'resend', 'sendgrid', 'ses', 'postmark'],
  apiStyles: ['none', 'server-actions', 'route-handlers', 'trpc'],
  performanceProfiles: ['speed', 'balanced', 'security'],
  userScales: ['1-100', '100-1k', '1k-10k', '10k-100k', '100k+'],
  teamSizes: ['solo', 'small-team', 'mid-team', 'enterprise'],
  targetMarkets: [
    { id: 'north-america', label: 'North America', markets: ['ca', 'us'] },
    { id: 'europe', label: 'Europe', markets: ['ch', 'eu', 'is', 'no', 'uk'] },
    {
      id: 'latin-america',
      label: 'Latin America',
      markets: ['ar', 'br', 'cl', 'co', 'mx'],
    },
    {
      id: 'asia-pacific',
      label: 'Asia-Pacific',
      markets: ['au', 'cn', 'in', 'jp', 'kr', 'sg'],
    },
    {
      id: 'middle-east-africa',
      label: 'Middle East & Africa',
      markets: ['ae', 'ke', 'ng', 'za'],
    },
  ],
}

async function checkAuth(): Promise<
  { user: { id: string } } | NextResponse<{ error: string }>
> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  return { user }
}

export async function GET() {
  const authResult = await checkAuth()
  if (authResult instanceof NextResponse) return authResult

  return NextResponse.json({
    presets: Object.values(PRESETS).map((p) => ({
      id: (p as { id: string }).id,
      name: (p as { name: string }).name,
      description: (p as { description: string }).description,
    })),
    options: SUPPORTED_OPTIONS,
  })
}

export async function POST(request: Request) {
  const authResult = await checkAuth()
  if (authResult instanceof NextResponse) return authResult

  const { allowed } = await rateLimit(
    `admin:bootstrap:${authResult.user.id}`,
    20,
    60000,
  )
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    )
  }

  const raw = await request.json().catch(() => ({}))
  const parsed = BootstrapSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        issues: parsed.error.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      },
      { status: 400 },
    )
  }

  const { mode = 'validate', ...configFields } = parsed.data

  if (!(configFields.preset in PRESETS)) {
    return NextResponse.json(
      { error: `Unknown preset: ${configFields.preset}` },
      { status: 400 },
    )
  }

  const presetDefaults =
    (PRESETS as Record<string, Partial<BootConfig>>)[configFields.preset] ?? {}
  const config: BootConfig = {
    ...DEFAULT_CONFIG,
    ...presetDefaults,
    ...configFields,
  } as BootConfig

  const violations = validateConfig(config)
  const audit = runComplianceAudit(config)

  if (mode === 'generate') {
    const result = generateProject(config)
    return NextResponse.json({
      valid: violations.filter((v) => v.severity === 'error').length === 0,
      violations,
      audit,
      generated: {
        files: result.files,
        warnings: result.warnings,
        projectName: result.projectName,
      },
    })
  }

  return NextResponse.json({
    valid: violations.filter((v) => v.severity === 'error').length === 0,
    violations,
    audit,
    config: {
      preset: config.preset,
      projectName: config.projectName,
      framework: config.framework,
      hosting: config.hosting,
      database: config.database,
      auth: config.auth,
      payments: config.payments || 'none',
    },
  })
}
