export type PresetName =
  | 'blank'
  | 'saas-starter'
  | 'portfolio-clients'
  | 'marketing-site'
  | 'lead-gen-site'
  | 'booking-site'
  | 'storefront'
  | 'internal-tool'
  | 'membership-site'

/** Maps expectedUserCount to compute/scaling/cost values */
export interface ComputeProfile {
  computeTier: BootConfig['computeTier']
  scalingStrategy: BootConfig['scalingStrategy']
  maxConnections: number
  maxStorageGb: number
  maxBandwidthGb: number
  costAlertThreshold: number
}

export const COMPUTE_PROFILES: Record<string, ComputeProfile> = {
  '1-100': {
    computeTier: 'free',
    scalingStrategy: 'vertical',
    maxConnections: 10,
    maxStorageGb: 5,
    maxBandwidthGb: 10,
    costAlertThreshold: 20,
  },
  '100-1k': {
    computeTier: 'starter',
    scalingStrategy: 'vertical',
    maxConnections: 25,
    maxStorageGb: 50,
    maxBandwidthGb: 50,
    costAlertThreshold: 50,
  },
  '1k-10k': {
    computeTier: 'standard',
    scalingStrategy: 'horizontal',
    maxConnections: 50,
    maxStorageGb: 200,
    maxBandwidthGb: 500,
    costAlertThreshold: 200,
  },
  '10k-100k': {
    computeTier: 'pro',
    scalingStrategy: 'horizontal',
    maxConnections: 100,
    maxStorageGb: 500,
    maxBandwidthGb: 5000,
    costAlertThreshold: 1000,
  },
  '100k+': {
    computeTier: 'enterprise',
    scalingStrategy: 'horizontal',
    maxConnections: 250,
    maxStorageGb: 2000,
    maxBandwidthGb: 50000,
    costAlertThreshold: 5000,
  },
}

export const REGIONS: Record<
  string,
  { label: string; markets: string[]; description: string } | undefined
> = {
  'north-america': {
    label: 'North America',
    markets: ['ca', 'us'],
    description: 'Canada (PIPEDA), US (CCPA/CPRA)',
  },
  europe: {
    label: 'Europe',
    markets: ['ch', 'eu', 'is', 'no', 'uk'],
    description:
      'EU (GDPR), UK (UK GDPR), Switzerland (FADP), Norway, Iceland (equivalent laws)',
  },
  'latin-america': {
    label: 'Latin America',
    markets: ['ar', 'br', 'cl', 'co', 'mx'],
    description:
      'Brazil (LGPD), Argentina, Colombia, Chile, Mexico (LFPDPPP) — all GDPR-like frameworks',
  },
  'asia-pacific': {
    label: 'Asia-Pacific',
    markets: ['au', 'cn', 'in', 'jp', 'kr', 'sg'],
    description:
      'Australia (APP), China (PIPL), India (DPDPA), Japan (APPI), South Korea (PIPA), Singapore (PDPA)',
  },
  'middle-east-africa': {
    label: 'Middle East & Africa',
    markets: ['ae', 'ke', 'ng', 'za'],
    description:
      'UAE (PDPL), Kenya (DPA), Nigeria (NDPR), South Africa (POPIA)',
  },
}

export const COUNTRY_NAMES: Record<string, string> = {
  us: 'United States',
  eu: 'European Union',
  uk: 'United Kingdom',
  ca: 'Canada',
  au: 'Australia',
  br: 'Brazil',
  in: 'India',
  jp: 'Japan',
  mx: 'Mexico',
  no: 'Norway',
  ch: 'Switzerland',
  is: 'Iceland',
  ar: 'Argentina',
  co: 'Colombia',
  cl: 'Chile',
  kr: 'South Korea',
  sg: 'Singapore',
  cn: 'China',
  za: 'South Africa',
  ae: 'United Arab Emirates',
  ke: 'Kenya',
  ng: 'Nigeria',
}

export const COUNTRY_INFO: Record<
  string,
  { name: string; regulation: string }
> = {
  us: {
    name: 'United States',
    regulation:
      'CCPA/CPRA (California Consumer Privacy Act) — applies to businesses serving California residents. No federal comprehensive privacy law; sectoral laws apply elsewhere.',
  },
  eu: {
    name: 'European Union',
    regulation:
      'GDPR (General Data Protection Regulation) — the gold standard for data protection. Applies to all EU member states uniformly. Requires explicit consent, DSARs, breach notification within 72h.',
  },
  uk: {
    name: 'United Kingdom',
    regulation:
      'UK GDPR — post-Brexit equivalent of GDPR, enforced by the ICO under the Data Protection Act 2018. Substantively identical to EU GDPR.',
  },
  ca: {
    name: 'Canada',
    regulation:
      'PIPEDA (Personal Information Protection and Electronic Documents Act) — applies to private-sector organizations collecting personal information in the course of commercial activities.',
  },
  au: {
    name: 'Australia',
    regulation:
      'APP (Australian Privacy Principles) under the Privacy Act 1988 — 13 principles covering collection, use, disclosure, quality, security, and access.',
  },
  br: {
    name: 'Brazil',
    regulation:
      'LGPD (Lei Geral de Proteção de Dados) — closely modeled on GDPR. Applies to any organization processing data of individuals in Brazil. Requires DPO appointment, DPIA for high-risk processing.',
  },
  in: {
    name: 'India',
    regulation:
      'DPDPA (Digital Personal Data Protection Act) 2023 — newer framework focused on consent, data fiduciary obligations, and data principal rights. Significant penalties for breaches.',
  },
  jp: {
    name: 'Japan',
    regulation:
      'APPI (Act on Protection of Personal Information) — amended in 2020 to align more closely with GDPR. Covers cross-border transfers, data subject rights, and breach notification.',
  },
  mx: {
    name: 'Mexico',
    regulation:
      'LFPDPPP (Ley Federal de Protección de Datos Personales en Posesión de los Particulares) — comprehensive GDPR-like law with consent requirements, ARCO rights (access, rectification, cancellation, opposition), and breach notification.',
  },
  no: {
    name: 'Norway',
    regulation:
      'GDPR (via EEA Agreement) — Norway is part of the European Economic Area and applies the GDPR as EEA law. Enforcement by the Norwegian Data Protection Authority (Datatilsynet).',
  },
  ch: {
    name: 'Switzerland',
    regulation:
      'FADP (Federal Act on Data Protection) / nFADP — revised in 2023 to align closely with GDPR. Applies to processing of personal data of Swiss residents.',
  },
  is: {
    name: 'Iceland',
    regulation:
      'GDPR (via EEA Agreement) — Iceland applies the GDPR as an EEA member state, enforced by the Icelandic Data Protection Authority (Persónuvernd).',
  },
  ar: {
    name: 'Argentina',
    regulation:
      'PDPA (Personal Data Protection Act) / Law 25.326 — recognized as adequate by the EU. GDPR-like framework with consent, data subject rights, and DPA registration.',
  },
  co: {
    name: 'Colombia',
    regulation:
      'Law 1581 of 2012 (Data Protection Law) — GDPR-like framework. Requires consent, data subject rights (access, correction, deletion), and registration with the SIC.',
  },
  cl: {
    name: 'Chile',
    regulation:
      'Law 19.628 (protection of private life) — undergoing reform to align with GDPR standards. Current law covers consent, data quality, and security measures.',
  },
  kr: {
    name: 'South Korea',
    regulation:
      'PIPA (Personal Information Protection Act) — one of the strictest APAC laws. Requires consent, data minimization, breach notification, and DPO appointment. Recognized as adequate by the EU.',
  },
  sg: {
    name: 'Singapore',
    regulation:
      'PDPA (Personal Data Protection Act) — consent-based framework with notification obligations, access/correction rights, and data breach notification. Excludes business contact info.',
  },
  cn: {
    name: 'China',
    regulation:
      'PIPL (Personal Information Protection Law) 2021 — comprehensive framework modeled on GDPR. Applies to processing of PI of individuals in China. Strict cross-border transfer rules.',
  },
  za: {
    name: 'South Africa',
    regulation:
      'POPIA (Protection of Personal Information Act) — GDPR-like framework with 8 conditions for lawful processing. Requires information officer appointment and breach notification.',
  },
  ae: {
    name: 'United Arab Emirates',
    regulation:
      "PDPL (Federal Decree-Law No. 45 of 2021) — UAE's first comprehensive federal data protection law. GDPR-influenced with consent, data subject rights, and cross-border transfer restrictions.",
  },
  ke: {
    name: 'Kenya',
    regulation:
      'Data Protection Act 2019 — GDPR-inspired framework. Requires registration with the Office of the Data Protection Commissioner, consent, data subject rights, and breach notification.',
  },
  ng: {
    name: 'Nigeria',
    regulation:
      'NDPR (Nigeria Data Protection Regulation) 2019 — issued by NITDA. Covers consent, data subject rights, data breach notification, and registration for data controllers processing significant data.',
  },
}

export interface NavPage {
  label: string
  path: string
  icon?: string
}

export interface BootConfig {
  /** Preset template — pre-fills many options */
  preset: PresetName

  // ─── Core Platform ────────────────────────────────────────────────
  projectName: string
  /** Free-text description of the project's purpose and goals. Used in generated AGENTS.md and .opencode/PROJECT.md */
  projectDescription?: string
  framework: 'nextjs' | 'vite-react' | 'remix' | 'astro'

  hosting: 'vercel' | 'aws' | 'gcp' | 'azure' | 'custom'
  hostingRegion: string

  database: 'postgresql' | 'mysql' | 'sqlite' | 'mongodb' | 'dynamodb'
  databaseProvider:
    | 'supabase'
    | 'planetscale'
    | 'neon'
    | 'turso'
    | 'atlas'
    | 'self-hosted'
  /** Tenant isolation strategy — row-level (shared) vs schema/database-per-tenant (isolated) */
  multiTenancy: 'none' | 'shared' | 'isolated'
  /** Connection pool size — derived from expectedUserCount, overridable */
  maxConnections: number
  /** Storage quota in GB */
  maxStorageGb: number
  /** Bandwidth limit in GB/month */
  maxBandwidthGb: number

  // ─── Auth & Security ──────────────────────────────────────────────
  auth: 'none' | 'jwt' | 'next-auth' | 'supabase-auth' | 'clerk' | 'auth0'
  /** TOTP-based 2FA (Supabase Auth supports this natively) */
  totpEnabled: boolean
  /** Passkey/WebAuthn support (Supabase Auth — passcode-based) */
  passkeysEnabled: boolean
  /** SSO providers — only relevant if auth !== 'none' */
  ssoProviders: ('google' | 'github' | 'microsoft' | 'apple' | 'saml')[]
  /** Legacy — kept for compatibility, superseded by totpEnabled/passkeysEnabled */
  mfaRequired: boolean
  /** Least-privilege by default — API keys scoped to minimum permissions */
  apiKeyAuth: boolean
  /** IP allowlisting for admin/management endpoints */
  ipAllowlisting: boolean

  // ─── Security Defaults ────────────────────────────────────────────
  /** CSP, HSTS, X-Frame-Options, X-Content-Type-Options, etc. */
  securityHeaders: boolean
  /** Cross-origin resource sharing config */
  corsEnabled: boolean
  /** Request rate limiting strategy */
  rateLimiting: 'none' | 'memory' | 'upstash'
  /** Zod-based request validation for all API inputs */
  requestValidation: boolean
  /** Input sanitization — strip XSS, SQL injection attempts */
  inputSanitization: boolean
  /** SQL injection prevention — parameterized queries enforced */
  sqliPrevention: boolean

  // ─── Edge / Network (CDN, WAF, DNS) ───────────────────────────────
  /** Edge CDN for asset delivery and DDoS absorption */
  edgeCdn: 'none' | 'cloudfront' | 'cloudflare'
  /** WAF at edge — SQLi/XSS/rate-limit protection before origin */
  wafEnabled: boolean
  /** Managed DNS (Route53 or Cloudflare) */
  dnsManaged: boolean
  /** Custom domains with auto-issued SSL certs */
  customDomains: boolean
  /** API Gateway for unified auth, throttling, caching */
  apiGateway: 'none' | 'cloudfront' | 'kong' | 'custom'

  // ─── PWA ───────────────────────────────────────────────────────────
  /** Progressive Web App support — manifest, service worker, icons */
  pwaEnabled: boolean

  // ─── API Layer ─────────────────────────────────────────────────────
  /** How the app's backend API is built */
  apiStyle: 'none' | 'server-actions' | 'route-handlers' | 'trpc'

  /** Scaffold basic CRUD route patterns for data models */
  hasCrudEndpoints: boolean
  hasPublicApi: boolean
  hasWebhooks: boolean
  /** Third-party APIs the app integrates with */
  thirdPartyApis: string[]
  /** Event-driven API / webhook delivery via message queue */
  webhookReliability: 'none' | 'in-memory' | 'queue'

  // ─── File Handling ────────────────────────────────────────────────
  fileStorage:
    | 'none'
    | 's3'
    | 'cloudinary'
    | 'supabase-storage'
    | 'cloudflare-r2'
    | 'vercel-blob'
  /** File access via signed URLs with DB permission tracking */
  fileAccessControl: 'public' | 'signed-urls' | 'user-tracking'
  /** File type/size validation middleware */
  fileValidation: boolean

  // ─── Data & Performance ───────────────────────────────────────────
  /** Full-text + vector search engine */
  search: 'none' | 'pgvector' | 'meilisearch' | 'typesense'
  /** Caching / KV store (sessions, rate limits, API cache) */
  cache: 'none' | 'upstash-redis' | 'valkey' | 'memory'
  /** Image/video processing pipeline (resize, optimize, transcode) */
  imageProcessing: boolean
  /** PDF/document generation (invoices, reports, contracts) */
  pdfGeneration: boolean
  /** Auto-generated OG images / link previews */
  ogImageGeneration: boolean

  // ─── Async & Real-time ────────────────────────────────────────────
  /** Event bus / message queue for decoupled services */
  eventQueue: 'none' | 'sqs' | 'rabbitmq' | 'redis-streams'
  /** Real-time / WebSocket connections */
  realtime: 'none' | 'supabase-realtime' | 'socket.io' | 'pusher'
  /** Background job processing / cron scheduling */
  backgroundJobs: 'none' | 'inngest' | 'trigger-dev' | 'bullmq'

  // ─── Notifications & Communication ─────────────────────────────────
  /** In-app notification inbox + toast system */
  inAppNotifications: boolean
  /** Chat bot integration */
  chatProvider: 'none' | 'slack' | 'discord' | 'whatsapp'
  /** Email service provider for transactional emails */
  emailProvider: 'none' | 'resend' | 'sendgrid' | 'ses' | 'postmark'
  /** SMS service provider for phone notifications */
  smsProvider: 'none' | 'twilio' | 'vonage' | 'aws-sns'
  /** Push notification support for mobile/web */
  pushNotifications: boolean
  /** Platform-specific app scaffolding */
  communicationPlatforms: ('slack' | 'teams' | 'zoom')[]

  // ─── Operations & Observability ───────────────────────────────────
  /** Structured log ingestion and metrics */
  monitoring: 'none' | 'sentry' | 'datadog' | 'grafana'
  /** Uptime monitoring / synthetic checks */
  uptimeMonitoring: boolean
  /** Immutable, queryable audit trail */
  auditLogging: boolean
  backupEnabled: boolean
  /** Log management platform */
  logManagement: 'none' | 'axiom' | 'logtail'

  // ─── Cloud Cost Management ────────────────────────────────────────
  /** Send cost alerts when approaching budget threshold */
  costAlerts: boolean
  /** Monthly budget in USD — auto-derived from expectedUserCount */
  costAlertThreshold: number
  /** Where cost notifications are sent */
  costAlertNotification: ('email' | 'slack')[]

  /** Feature flags for gradual rollouts / kill switches / A/B tests */
  featureFlags: boolean
  /** Calendar / scheduling system — iCal feed, availability slots, reminders via email/SMS/push */
  appointments: boolean
  /** CSV/Excel/JSON data export + scheduled reports */
  dataExport: boolean
  /** Lightweight e-signature for contracts / NDAs / agreements */
  eSignature: boolean

  // ─── Agentic / AI Integration ─────────────────────────────────────
  /** AI provider — Vercel AI SDK wraps all providers under one interface */
  agentIntegration: 'none' | 'vercel-ai-sdk' | 'openai'
  /** Use cases for agent/AI integration */
  agentUseCases: string[]
  // ─── Payments ─────────────────────────────────────────────────────
  payments: 'none' | 'stripe' | 'lemonsqueezy' | 'paddle'

  // ─── Compliance ───────────────────────────────────────────────────
  targetMarkets: (
    | 'us'
    | 'eu'
    | 'uk'
    | 'ca'
    | 'au'
    | 'br'
    | 'in'
    | 'jp'
    | 'mx'
    | 'no'
    | 'ch'
    | 'is'
    | 'ar'
    | 'co'
    | 'cl'
    | 'kr'
    | 'sg'
    | 'cn'
    | 'za'
    | 'ae'
    | 'ke'
    | 'ng'
    | 'north-america'
    | 'europe'
    | 'latin-america'
    | 'asia-pacific'
    | 'middle-east-africa'
  )[]
  dataRetentionDays: number
  userTracking: 'none' | 'minimal' | 'analytics' | 'full'
  analyticsProvider:
    | 'none'
    | 'plausible'
    | 'posthog'
    | 'google-analytics'
    | 'mixpanel'

  // ─── Application Branding ──────────────────────────────────
  appTitle: string
  appLogo: string
  navStyle: 'sidebar-collapsible' | 'sidebar-fixed' | 'top-bar'
  navPages: NavPage[]

  // ─── Profile (Derives compute/scaling/cost defaults) ──────────────
  performanceProfile: 'speed' | 'balanced' | 'security'

  expectedUserCount: '1-100' | '100-1k' | '1k-10k' | '10k-100k' | '100k+'
  expectedTeamSize: 'solo' | 'small-team' | 'mid-team' | 'enterprise'

  /** Compute resource tier — auto-derived, overridable */
  computeTier: 'free' | 'starter' | 'standard' | 'pro' | 'enterprise'
  /** Preferred scaling direction — influences connection pooling, caching, infra */
  scalingStrategy: 'horizontal' | 'vertical'

  /** CI/CD provider */
  ciProvider: 'github-actions' | 'none'
}

/**
 * Preset definitions — each pre-fills a subset of config options.
 * Missing fields keep their current values; empty arrays and 'none' values are explicitly set.
 */
export const PRESETS: Record<PresetName, Partial<BootConfig>> = {
  blank: {
    framework: 'nextjs',
    hosting: 'vercel',
    hostingRegion: 'us-east-1',
    database: 'postgresql',
    databaseProvider: 'supabase',
    multiTenancy: 'none',
    auth: 'none',

    totpEnabled: false,
    passkeysEnabled: false,
    mfaRequired: false,
    ssoProviders: [],
    pwaEnabled: false,
    apiKeyAuth: false,
    ipAllowlisting: false,
    inputSanitization: false,
    sqliPrevention: false,
    edgeCdn: 'none',
    wafEnabled: false,
    dnsManaged: false,
    customDomains: false,
    apiGateway: 'none',
    apiStyle: 'none',
    hasCrudEndpoints: false,
    hasPublicApi: false,
    hasWebhooks: false,
    webhookReliability: 'none',
    thirdPartyApis: [],
    fileStorage: 'none',
    fileAccessControl: 'public',
    fileValidation: false,
    imageProcessing: false,
    pdfGeneration: false,
    ogImageGeneration: false,
    search: 'none',
    cache: 'none',
    eventQueue: 'none',
    backgroundJobs: 'none',
    emailProvider: 'none',
    smsProvider: 'none',
    pushNotifications: false,
    inAppNotifications: false,
    chatProvider: 'none',
    communicationPlatforms: [],

    monitoring: 'none',
    logManagement: 'none',
    uptimeMonitoring: false,
    costAlertNotification: [],
    targetMarkets: ['north-america'],
    dataRetentionDays: 365,
    userTracking: 'none',
    analyticsProvider: 'none',
    featureFlags: false,
    dataExport: false,
    eSignature: false,
    agentIntegration: 'none',
    agentUseCases: [],
    performanceProfile: 'balanced',
    expectedUserCount: '1-100',
    expectedTeamSize: 'solo',
    ciProvider: 'none',
    appTitle: 'My App',
    appLogo: '',
    navStyle: 'sidebar-collapsible',
    navPages: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Settings', path: '/settings' },
    ],
  },
  'saas-starter': {
    framework: 'nextjs',
    hosting: 'vercel',
    hostingRegion: 'us-east-1',
    database: 'postgresql',
    databaseProvider: 'supabase',
    multiTenancy: 'shared',
    auth: 'next-auth',

    totpEnabled: true,
    passkeysEnabled: true,
    mfaRequired: true,

    ssoProviders: ['google', 'github'],
    pwaEnabled: true,
    apiKeyAuth: true,
    ipAllowlisting: true,
    securityHeaders: true,
    corsEnabled: true,
    rateLimiting: 'upstash',
    requestValidation: true,
    inputSanitization: true,
    sqliPrevention: true,
    edgeCdn: 'cloudfront',
    apiStyle: 'server-actions',
    hasCrudEndpoints: true,
    hasPublicApi: true,
    hasWebhooks: true,
    webhookReliability: 'queue',
    thirdPartyApis: [],
    fileStorage: 'supabase-storage',
    fileAccessControl: 'user-tracking',
    fileValidation: true,
    imageProcessing: true,
    pdfGeneration: true,
    ogImageGeneration: true,
    search: 'pgvector',
    cache: 'upstash-redis',
    eventQueue: 'redis-streams',
    realtime: 'supabase-realtime',
    backgroundJobs: 'inngest',
    emailProvider: 'resend',
    smsProvider: 'twilio',
    pushNotifications: true,
    inAppNotifications: true,
    chatProvider: 'slack',

    payments: 'stripe',
    monitoring: 'sentry',
    logManagement: 'axiom',
    uptimeMonitoring: true,
    auditLogging: true,
    backupEnabled: true,
    costAlerts: true,
    costAlertNotification: ['email', 'slack'],
    targetMarkets: ['north-america', 'europe'],
    dataRetentionDays: 365,
    eSignature: true,
    appointments: true,
    agentIntegration: 'vercel-ai-sdk',
    agentUseCases: ['search', 'content', 'analysis'],
    performanceProfile: 'balanced',
    expectedUserCount: '1k-10k',
    expectedTeamSize: 'small-team',
    ciProvider: 'github-actions',
    appTitle: 'My SaaS',
    appLogo: '',
    navStyle: 'sidebar-collapsible',
    navPages: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Settings', path: '/settings' },
    ],
  },
  'portfolio-clients': {
    framework: 'nextjs',
    hosting: 'vercel',
    hostingRegion: 'us-east-1',
    database: 'postgresql',
    databaseProvider: 'supabase',
    multiTenancy: 'none',
    auth: 'supabase-auth',

    totpEnabled: true,
    passkeysEnabled: true,
    mfaRequired: false,

    ssoProviders: [],
    pwaEnabled: true,
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
    apiStyle: 'route-handlers',
    hasCrudEndpoints: true,
    hasPublicApi: true,
    fileStorage: 'supabase-storage',
    fileAccessControl: 'user-tracking',
    fileValidation: true,
    imageProcessing: true,
    pdfGeneration: true,
    ogImageGeneration: true,
    search: 'pgvector',
    cache: 'upstash-redis',
    eventQueue: 'redis-streams',
    realtime: 'supabase-realtime',
    backgroundJobs: 'inngest',
    emailProvider: 'resend',
    smsProvider: 'twilio',
    pushNotifications: true,
    inAppNotifications: true,
    chatProvider: 'slack',
    communicationPlatforms: ['slack'],

    payments: 'stripe',
    monitoring: 'sentry',
    logManagement: 'axiom',
    uptimeMonitoring: true,
    auditLogging: true,
    costAlerts: true,
    costAlertThreshold: 50,
    costAlertNotification: ['email', 'slack'],
    targetMarkets: ['north-america'],
    dataRetentionDays: 365,
    userTracking: 'minimal',
    analyticsProvider: 'plausible',
    featureFlags: true,
    appointments: true,
    performanceProfile: 'balanced',
    expectedUserCount: '1-100',
    expectedTeamSize: 'solo',
    ciProvider: 'github-actions',
    appTitle: 'Client Portal',
    appLogo: '',
    navStyle: 'sidebar-collapsible',
    navPages: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Projects', path: '/projects' },
      { label: 'Invoices', path: '/invoices' },
    ],
  },
  'marketing-site': {
    framework: 'nextjs',
    hosting: 'vercel',
    hostingRegion: 'us-east-1',
    database: 'postgresql',
    databaseProvider: 'supabase',
    multiTenancy: 'none',
    auth: 'none',

    totpEnabled: false,
    passkeysEnabled: false,
    mfaRequired: false,
    ssoProviders: [],
    apiKeyAuth: false,
    ipAllowlisting: true,
    securityHeaders: true,
    corsEnabled: false,
    rateLimiting: 'memory',
    requestValidation: false,
    inputSanitization: false,
    sqliPrevention: false,
    edgeCdn: 'cloudfront',
    wafEnabled: true,
    dnsManaged: true,
    customDomains: false,
    apiGateway: 'none',
    apiStyle: 'none',
    hasCrudEndpoints: false,
    hasPublicApi: false,
    hasWebhooks: false,
    webhookReliability: 'none',
    thirdPartyApis: [],
    fileStorage: 'none',
    fileAccessControl: 'public',
    fileValidation: false,
    imageProcessing: true,
    eventQueue: 'none',
    realtime: 'none',
    backgroundJobs: 'none',
    emailProvider: 'none',
    smsProvider: 'none',
    pushNotifications: false,
    inAppNotifications: false,
    chatProvider: 'none',
    communicationPlatforms: [],

    payments: 'none',
    monitoring: 'none',
    logManagement: 'none',
    uptimeMonitoring: true,
    auditLogging: false,
    backupEnabled: false,
    costAlerts: true,
    costAlertThreshold: 20,
    costAlertNotification: ['email'],
    targetMarkets: ['north-america'],
    dataRetentionDays: 90,
    featureFlags: false,
    appointments: false,
    dataExport: false,
    eSignature: false,
    agentIntegration: 'none',
    agentUseCases: [],
    performanceProfile: 'speed',
    expectedUserCount: '1-100',
    expectedTeamSize: 'solo',

    ciProvider: 'github-actions',
    appTitle: 'Marketing Site',
    appLogo: '',
    navStyle: 'top-bar',
    navPages: [
      { label: 'Home', path: '/' },
      { label: 'About', path: '/about' },
      { label: 'Contact', path: '/contact' },
    ],
  },
  'lead-gen-site': {
    framework: 'nextjs',
    hosting: 'vercel',
    hostingRegion: 'us-east-1',
    database: 'postgresql',
    databaseProvider: 'supabase',
    multiTenancy: 'none',
    auth: 'supabase-auth',
    totpEnabled: false,
    passkeysEnabled: false,
    mfaRequired: false,
    ssoProviders: [],
    apiKeyAuth: true,
    ipAllowlisting: true,
    securityHeaders: true,
    corsEnabled: false,
    rateLimiting: 'memory',
    requestValidation: true,
    inputSanitization: true,
    sqliPrevention: true,
    edgeCdn: 'cloudfront',
    wafEnabled: true,
    dnsManaged: true,
    customDomains: false,
    apiGateway: 'none',
    apiStyle: 'server-actions',
    hasCrudEndpoints: true,
    hasPublicApi: false,
    hasWebhooks: true,
    webhookReliability: 'none',
    thirdPartyApis: [],
    fileStorage: 'supabase-storage',
    fileAccessControl: 'user-tracking',
    fileValidation: true,
    imageProcessing: true,
    eventQueue: 'none',
    realtime: 'none',
    backgroundJobs: 'none',
    emailProvider: 'resend',
    smsProvider: 'none',
    pushNotifications: false,
    inAppNotifications: false,
    chatProvider: 'none',
    communicationPlatforms: ['slack'],
    payments: 'none',
    monitoring: 'sentry',
    logManagement: 'none',
    uptimeMonitoring: true,
    auditLogging: true,
    backupEnabled: true,
    costAlerts: true,
    costAlertThreshold: 20,
    costAlertNotification: ['email', 'slack'],
    targetMarkets: ['north-america'],
    dataRetentionDays: 365,
    featureFlags: false,
    appointments: false,
    dataExport: true,
    eSignature: false,
    agentIntegration: 'none',
    agentUseCases: [],
    performanceProfile: 'speed',
    expectedUserCount: '1-100',
    expectedTeamSize: 'solo',
    ciProvider: 'github-actions',
    appTitle: 'Lead Gen Site',
    appLogo: '',
    navStyle: 'top-bar',
    navPages: [
      { label: 'Home', path: '/' },
      { label: 'Landing', path: '/landing' },
      { label: 'Dashboard', path: '/dashboard' },
    ],
  },
  'booking-site': {
    framework: 'nextjs',
    hosting: 'vercel',
    hostingRegion: 'us-east-1',
    database: 'postgresql',
    databaseProvider: 'supabase',
    multiTenancy: 'none',
    auth: 'supabase-auth',
    totpEnabled: false,
    passkeysEnabled: false,
    mfaRequired: false,
    ssoProviders: [],
    apiKeyAuth: false,
    ipAllowlisting: true,
    securityHeaders: true,
    corsEnabled: false,
    rateLimiting: 'memory',
    requestValidation: true,
    inputSanitization: true,
    sqliPrevention: true,
    edgeCdn: 'cloudfront',
    wafEnabled: true,
    dnsManaged: true,
    customDomains: false,
    apiGateway: 'none',
    apiStyle: 'server-actions',
    hasCrudEndpoints: true,
    hasPublicApi: true,
    hasWebhooks: true,
    webhookReliability: 'queue',
    thirdPartyApis: [],
    fileStorage: 'supabase-storage',
    fileAccessControl: 'user-tracking',
    fileValidation: true,
    imageProcessing: true,
    eventQueue: 'none',
    realtime: 'none',
    backgroundJobs: 'none',
    emailProvider: 'resend',
    smsProvider: 'twilio',
    pushNotifications: false,
    inAppNotifications: false,
    chatProvider: 'none',
    communicationPlatforms: [],
    payments: 'stripe',
    monitoring: 'sentry',
    logManagement: 'none',
    uptimeMonitoring: true,
    auditLogging: true,
    backupEnabled: true,
    costAlerts: true,
    costAlertThreshold: 50,
    costAlertNotification: ['email'],
    targetMarkets: ['north-america'],
    dataRetentionDays: 90,
    featureFlags: false,
    appointments: true,
    dataExport: false,
    eSignature: false,
    agentIntegration: 'none',
    agentUseCases: [],
    performanceProfile: 'speed',
    expectedUserCount: '1-100',
    expectedTeamSize: 'solo',
    ciProvider: 'github-actions',
    appTitle: 'Booking Site',
    appLogo: '',
    navStyle: 'top-bar',
    navPages: [
      { label: 'Home', path: '/' },
      { label: 'Services', path: '/services' },
      { label: 'Book', path: '/book' },
      { label: 'Dashboard', path: '/dashboard' },
    ],
  },
  storefront: {
    framework: 'nextjs',
    hosting: 'vercel',
    hostingRegion: 'us-east-1',
    database: 'postgresql',
    databaseProvider: 'supabase',
    multiTenancy: 'none',
    auth: 'supabase-auth',
    totpEnabled: false,
    passkeysEnabled: false,
    mfaRequired: false,
    ssoProviders: [],
    pwaEnabled: false,
    apiKeyAuth: true,
    ipAllowlisting: true,
    securityHeaders: true,
    corsEnabled: false,
    rateLimiting: 'memory',
    requestValidation: true,
    inputSanitization: true,
    sqliPrevention: true,
    edgeCdn: 'cloudfront',
    wafEnabled: true,
    dnsManaged: true,
    customDomains: false,
    apiGateway: 'none',
    apiStyle: 'server-actions',
    hasCrudEndpoints: true,
    hasPublicApi: true,
    hasWebhooks: true,
    webhookReliability: 'queue',
    thirdPartyApis: [],
    fileStorage: 'supabase-storage',
    fileAccessControl: 'user-tracking',
    fileValidation: true,
    imageProcessing: true,
    eventQueue: 'none',
    realtime: 'none',
    backgroundJobs: 'none',
    emailProvider: 'resend',
    smsProvider: 'none',
    pushNotifications: false,
    inAppNotifications: false,
    chatProvider: 'none',
    communicationPlatforms: [],
    payments: 'stripe',
    monitoring: 'sentry',
    logManagement: 'none',
    uptimeMonitoring: true,
    auditLogging: true,
    backupEnabled: true,
    costAlerts: true,
    costAlertThreshold: 50,
    costAlertNotification: ['email'],
    targetMarkets: ['north-america'],
    dataRetentionDays: 90,
    featureFlags: false,
    appointments: false,
    dataExport: true,
    eSignature: false,
    agentIntegration: 'none',
    agentUseCases: [],
    performanceProfile: 'balanced',
    expectedUserCount: '1-100',
    expectedTeamSize: 'solo',
    ciProvider: 'github-actions',
    appTitle: 'Storefront',
    appLogo: '',
    navStyle: 'top-bar',
    navPages: [
      { label: 'Home', path: '/' },
      { label: 'Shop', path: '/shop' },
      { label: 'Cart', path: '/cart' },
      { label: 'Dashboard', path: '/dashboard' },
    ],
  },
  'internal-tool': {
    framework: 'nextjs',
    hosting: 'vercel',
    hostingRegion: 'us-east-1',
    database: 'postgresql',
    databaseProvider: 'supabase',
    multiTenancy: 'none',
    auth: 'supabase-auth',
    totpEnabled: true,
    passkeysEnabled: true,
    mfaRequired: false,
    ssoProviders: [],
    apiKeyAuth: true,
    ipAllowlisting: true,
    securityHeaders: true,
    corsEnabled: false,
    rateLimiting: 'memory',
    requestValidation: true,
    inputSanitization: true,
    sqliPrevention: true,
    edgeCdn: 'cloudfront',
    wafEnabled: true,
    dnsManaged: false,
    customDomains: false,
    apiGateway: 'none',
    apiStyle: 'server-actions',
    hasCrudEndpoints: true,
    hasPublicApi: false,
    hasWebhooks: false,
    webhookReliability: 'none',
    thirdPartyApis: [],
    fileStorage: 'supabase-storage',
    fileAccessControl: 'user-tracking',
    fileValidation: true,
    imageProcessing: false,
    eventQueue: 'none',
    realtime: 'none',
    backgroundJobs: 'none',
    emailProvider: 'none',
    smsProvider: 'none',
    pushNotifications: false,
    inAppNotifications: true,
    chatProvider: 'slack',
    communicationPlatforms: [],
    payments: 'none',
    monitoring: 'sentry',
    logManagement: 'none',
    uptimeMonitoring: true,
    auditLogging: true,
    backupEnabled: true,
    costAlerts: true,
    costAlertThreshold: 20,
    costAlertNotification: ['email'],
    targetMarkets: ['north-america'],
    dataRetentionDays: 365,
    featureFlags: true,
    appointments: false,
    dataExport: true,
    eSignature: false,
    agentIntegration: 'none',
    agentUseCases: [],
    performanceProfile: 'speed',
    expectedUserCount: '1-100',
    expectedTeamSize: 'small-team',
    ciProvider: 'github-actions',
    appTitle: 'Internal Tool',
    appLogo: '',
    navStyle: 'sidebar-collapsible',
    navPages: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Data', path: '/data' },
      { label: 'Settings', path: '/settings' },
    ],
  },
  'membership-site': {
    framework: 'nextjs',
    hosting: 'vercel',
    hostingRegion: 'us-east-1',
    database: 'postgresql',
    databaseProvider: 'supabase',
    multiTenancy: 'none',
    auth: 'supabase-auth',
    totpEnabled: false,
    passkeysEnabled: false,
    mfaRequired: false,
    ssoProviders: [],
    apiKeyAuth: false,
    ipAllowlisting: true,
    securityHeaders: true,
    corsEnabled: false,
    rateLimiting: 'memory',
    requestValidation: true,
    inputSanitization: true,
    sqliPrevention: true,
    edgeCdn: 'cloudfront',
    wafEnabled: true,
    dnsManaged: true,
    customDomains: false,
    apiGateway: 'none',
    apiStyle: 'server-actions',
    hasCrudEndpoints: true,
    hasPublicApi: true,
    hasWebhooks: true,
    webhookReliability: 'queue',
    thirdPartyApis: [],
    fileStorage: 'supabase-storage',
    fileAccessControl: 'user-tracking',
    fileValidation: true,
    imageProcessing: true,
    eventQueue: 'none',
    realtime: 'none',
    backgroundJobs: 'none',
    emailProvider: 'resend',
    smsProvider: 'none',
    pushNotifications: false,
    inAppNotifications: false,
    chatProvider: 'none',
    communicationPlatforms: ['slack'],
    payments: 'stripe',
    monitoring: 'sentry',
    logManagement: 'none',
    uptimeMonitoring: true,
    auditLogging: true,
    backupEnabled: true,
    costAlerts: true,
    costAlertThreshold: 50,
    costAlertNotification: ['email'],
    targetMarkets: ['north-america'],
    dataRetentionDays: 90,
    featureFlags: true,
    appointments: false,
    dataExport: false,
    eSignature: false,
    agentIntegration: 'none',
    agentUseCases: [],
    performanceProfile: 'speed',
    expectedUserCount: '1-100',
    expectedTeamSize: 'solo',
    ciProvider: 'github-actions',
    appTitle: 'Membership Site',
    appLogo: '',
    navStyle: 'top-bar',
    navPages: [
      { label: 'Home', path: '/' },
      { label: 'Pricing', path: '/pricing' },
      { label: 'Dashboard', path: '/dashboard' },
    ],
  },
}

/**
 * Default config — optimized for security-first, Supabase/Vercel stack.
 * Compute/scaling are derived from expectedUserCount in use-configurator.
 */
export const DEFAULT_CONFIG: Partial<BootConfig> = {
  preset: 'blank',
  framework: 'nextjs',
  hosting: 'vercel',
  multiTenancy: 'none',
  auth: 'supabase-auth',
  totpEnabled: true,
  passkeysEnabled: true,
  mfaRequired: false,

  ssoProviders: [],
  pwaEnabled: true,
  apiKeyAuth: true,
  ipAllowlisting: true,
  securityHeaders: true,
  corsEnabled: false,
  rateLimiting: 'memory',
  requestValidation: true,
  inputSanitization: true,
  sqliPrevention: true,
  edgeCdn: 'cloudfront',
  wafEnabled: true,
  dnsManaged: false,
  customDomains: false,
  apiGateway: 'cloudfront',
  apiStyle: 'server-actions',
  hasCrudEndpoints: false,
  hasPublicApi: false,
  hasWebhooks: false,
  webhookReliability: 'none',
  thirdPartyApis: [],
  fileStorage: 'supabase-storage',
  fileAccessControl: 'user-tracking',
  fileValidation: true,
  imageProcessing: false,
  pdfGeneration: false,
  ogImageGeneration: false,
  search: 'none',
  cache: 'none',
  eventQueue: 'none',
  realtime: 'none',
  backgroundJobs: 'none',
  emailProvider: 'resend',
  communicationPlatforms: [],

  payments: 'none',
  monitoring: 'sentry',
  logManagement: 'none',
  uptimeMonitoring: false,
  auditLogging: false,
  backupEnabled: false,
  costAlerts: true,
  costAlertThreshold: 20,
  costAlertNotification: ['email'],
  targetMarkets: ['north-america'],
  dataRetentionDays: 365,
  userTracking: 'minimal',
  analyticsProvider: 'plausible',
  featureFlags: false,
  appointments: false,
  dataExport: false,
  eSignature: false,
  agentIntegration: 'none',
  agentUseCases: [],
  performanceProfile: 'balanced',
  expectedUserCount: '1-100',
  expectedTeamSize: 'solo',
  ciProvider: 'github-actions',
  // Application branding
  appTitle: 'My App',
  appLogo: '',
  navStyle: 'sidebar-collapsible',
  navPages: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Settings', path: '/settings' },
  ],
  // Compute/scaling are derived from expectedUserCount in use-configurator
}
