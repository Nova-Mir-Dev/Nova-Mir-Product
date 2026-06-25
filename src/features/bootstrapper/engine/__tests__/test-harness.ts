import { generate } from '../generator/orchestrator'
import type { BootConfig } from '../../types'
import type { GeneratedFile, GeneratorResult } from '../generator/types'

/**
 * Build a complete, valid BootConfig fixture for generator tests.
 * Defaults mirror the `portfolio-clients` preset (Supabase auth + audit
 * logging + API keys) so smoke tests can assert auth/schema content.
 */
export function buildFixtureConfig(
  overrides: Partial<BootConfig> = {},
): BootConfig {
  return {
    preset: 'portfolio-clients',
    projectName: 'test-fixture-app',
    projectDescription: 'Fixture project for generator smoke tests',
    framework: 'nextjs',
    hosting: 'vercel',
    hostingRegion: 'us-east-1',
    database: 'postgresql',
    databaseProvider: 'supabase',
    multiTenancy: 'shared',
    maxConnections: 10,
    maxStorageGb: 5,
    maxBandwidthGb: 10,
    auth: 'supabase-auth',
    totpEnabled: true,
    passkeysEnabled: true,
    mfaRequired: false,
    ssoProviders: [],
    apiKeyAuth: true,
    ipAllowlisting: true,
    securityHeaders: true,
    corsEnabled: true,
    rateLimiting: 'memory',
    requestValidation: true,
    inputSanitization: true,
    sqliPrevention: true,
    edgeCdn: 'cloudfront',
    wafEnabled: true,
    dnsManaged: true,
    customDomains: true,
    apiGateway: 'cloudfront',
    pwaEnabled: true,
    apiStyle: 'route-handlers',
    hasCrudEndpoints: true,
    hasPublicApi: true,
    hasWebhooks: true,
    thirdPartyApis: [],
    webhookReliability: 'queue',
    fileStorage: 'supabase-storage',
    fileAccessControl: 'user-tracking',
    fileValidation: true,
    search: 'pgvector',
    cache: 'upstash-redis',
    imageProcessing: true,
    pdfGeneration: true,
    ogImageGeneration: true,
    eventQueue: 'redis-streams',
    realtime: 'supabase-realtime',
    backgroundJobs: 'inngest',
    inAppNotifications: true,
    chatProvider: 'slack',
    emailProvider: 'resend',
    smsProvider: 'twilio',
    pushNotifications: true,
    communicationPlatforms: ['slack'],
    monitoring: 'sentry',
    uptimeMonitoring: true,
    auditLogging: true,
    backupEnabled: true,
    logManagement: 'axiom',
    costAlerts: true,
    costAlertThreshold: 50,
    costAlertNotification: ['email', 'slack'],
    featureFlags: true,
    appointments: true,
    dataExport: true,
    eSignature: true,
    agentIntegration: 'vercel-ai-sdk',
    agentUseCases: ['search'],
    payments: 'stripe',
    targetMarkets: ['us', 'eu', 'uk', 'ca', 'au', 'mx'],
    dataRetentionDays: 365,
    userTracking: 'minimal',
    analyticsProvider: 'plausible',
    appTitle: 'Test Fixture App',
    appLogo: '',
    navStyle: 'sidebar-collapsible',
    navPages: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Projects', path: '/projects' },
    ],
    performanceProfile: 'balanced',
    expectedUserCount: '1-100',
    expectedTeamSize: 'solo',
    computeTier: 'free',
    scalingStrategy: 'vertical',
    ciProvider: 'github-actions',
    ...overrides,
  }
}

export interface HarnessResult {
  result: GeneratorResult
  files: GeneratedFile[]
  paths: string[]
  /** Read a generated file's content by relative path; throws if absent. */
  read: (path: string) => string
  /** True if a file with the given relative path was generated. */
  has: (path: string) => boolean
}

/**
 * Run the bootstrapper generator against the fixture config and return
 * helpers for inspecting the in-memory file map. The orchestrator produces
 * an in-memory `GeneratorResult` (no disk I/O), so no temp directory is
 * needed — callers inspect the returned `GeneratorResult.files` directly.
 */
export function runGenerator(
  overrides: Partial<BootConfig> = {},
): HarnessResult {
  const config = buildFixtureConfig(overrides)
  const result = generate(config)
  const map = new Map(result.files.map((f) => [f.path, f.content]))
  return {
    result,
    files: result.files,
    paths: result.files.map((f) => f.path),
    read: (path: string): string => {
      const content = map.get(path)
      if (content === undefined) {
        throw new Error(`Generated file not found: ${path}`)
      }
      return content
    },
    has: (path: string): boolean => map.has(path),
  }
}