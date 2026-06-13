import type { BootConfig } from '../types'

export interface ConstraintViolation {
  field: keyof BootConfig
  message: string
  severity: 'warning' | 'error' | 'info'
}

export interface Constraint {
  applies: (config: Partial<BootConfig>) => boolean
  violations: (config: Partial<BootConfig>) => ConstraintViolation[]
}

export const CONSTRAINTS: Constraint[] = [
  // ── Hosting / Database Compatibility ──────────────────────────────────

  {
    applies: (c) => c.hosting === 'vercel' && c.database === 'sqlite',
    violations: () => [
      {
        field: 'database',
        message:
          'SQLite is not suitable for Vercel deployments — serverless functions have ephemeral filesystems. Use PostgreSQL with Supabase or Neon instead.',
        severity: 'error',
      },
    ],
  },
  {
    applies: (c) => c.hosting === 'vercel' && c.database === 'mongodb',
    violations: () => [
      {
        field: 'database',
        message:
          'MongoDB connections may exhaust Vercel serverless connection pools at scale. Consider using MongoDB Atlas with the Data API, or switch to a serverless-friendly store.',
        severity: 'warning',
      },
    ],
  },
  {
    applies: (c) => c.database === 'dynamodb' && c.hosting !== 'aws',
    violations: () => [
      {
        field: 'hosting',
        message:
          'DynamoDB is an AWS-native service. Running it outside AWS adds operational overhead and egress costs. Consider hosting on AWS or switching to a cloud-agnostic database.',
        severity: 'warning',
      },
    ],
  },

  // ── Database ↔ Database Provider Compatibility ───────────────────────

  {
    applies: (c) =>
      c.database === 'sqlite' &&
      c.databaseProvider !== 'turso' &&
      c.databaseProvider !== 'self-hosted',
    violations: () => [
      {
        field: 'databaseProvider',
        message:
          'For SQLite in production, the only managed providers are Turso (libsql) or self-hosted with Litestream replication.',
        severity: 'error',
      },
    ],
  },
  {
    applies: (c) =>
      c.database === 'postgresql' && c.databaseProvider === 'turso',
    violations: () => [
      {
        field: 'databaseProvider',
        message:
          'Turso provides libsql (SQLite fork), not PostgreSQL. Switch your database to SQLite or choose Supabase, Neon, or self-hosted for PostgreSQL.',
        severity: 'error',
      },
    ],
  },
  {
    applies: (c) =>
      c.database === 'mysql' && c.databaseProvider === 'planetscale',
    violations: () => [
      {
        field: 'database',
        message:
          'PlanetScale is a MySQL-compatible platform. Confirm that MySQL is the intended engine (set database to "mysql").',
        severity: 'warning',
      },
    ],
  },

  // ── Auth / Database Requirements ──────────────────────────────────────

  {
    applies: (c) =>
      c.auth === 'next-auth' &&
      c.database !== 'postgresql' &&
      c.database !== 'mysql',
    violations: () => [
      {
        field: 'auth',
        message:
          'NextAuth.js (Auth.js) requires a relational database adapter. SQLite works for development but PostgreSQL or MySQL is strongly recommended for production.',
        severity: 'error',
      },
    ],
  },
  {
    applies: (c) =>
      c.auth === 'supabase-auth' && c.databaseProvider !== 'supabase',
    violations: () => [
      {
        field: 'auth',
        message:
          'Supabase Auth is tightly integrated with the Supabase platform. If using a different database provider, consider switching auth to next-auth or clerk.',
        severity: 'error',
      },
    ],
  },

  // ── SSO Providers / Auth Backend ──────────────────────────────────────

  {
    applies: (c) =>
      (c.ssoProviders ?? []).includes('saml') && c.auth !== 'auth0',
    violations: () => [
      {
        field: 'ssoProviders',
        message:
          'SAML-based SSO requires an enterprise-grade identity provider. Auth0 has the most mature SAML support. Clerk and next-auth have limited SAML capabilities.',
        severity: 'warning',
      },
    ],
  },
  {
    applies: (c) => (c.ssoProviders ?? []).length > 0 && c.auth === 'none',
    violations: () => [
      {
        field: 'auth',
        message:
          'SSO providers are configured but authentication is set to "none". Enable an auth backend to support social login.',
        severity: 'error',
      },
    ],
  },
  {
    applies: (c) => (c.ssoProviders ?? []).length > 0 && c.auth === 'jwt',
    violations: () => [
      {
        field: 'auth',
        message:
          'Pure JWT auth does not include built-in OAuth/OIDC flows. You would need to implement each provider integration manually. Consider next-auth, clerk, or auth0 for built-in social login support.',
        severity: 'warning',
      },
    ],
  },

  // ── GDPR (EU / UK) ────────────────────────────────────────────────────

  {
    applies: (c) =>
      ((c.targetMarkets ?? []).includes('eu') ||
        (c.targetMarkets ?? []).includes('uk')) &&
      c.userTracking !== 'none' &&
      c.userTracking !== 'minimal',
    violations: () => [
      {
        field: 'userTracking',
        message:
          'Under GDPR, "analytics" and "full" tracking levels require explicit user consent with a clear opt-out mechanism. Set userTracking to "minimal" (no PII) or "none" unless you have a consent management platform in place.',
        severity: 'error',
      },
    ],
  },
  {
    applies: (c) =>
      ((c.targetMarkets ?? []).includes('eu') ||
        (c.targetMarkets ?? []).includes('uk')) &&
      c.analyticsProvider === 'google-analytics',
    violations: () => [
      {
        field: 'analyticsProvider',
        message:
          'Google Analytics (GA4) requires a Data Processing Agreement and consent management for GDPR compliance. Consider privacy-first alternatives like Plausible or self-hosted PostHog for EU/UK markets.',
        severity: 'warning',
      },
    ],
  },
  {
    applies: (c) =>
      ((c.targetMarkets ?? []).includes('eu') ||
        (c.targetMarkets ?? []).includes('uk')) &&
      (c.dataRetentionDays ?? 0) > 730,
    violations: () => [
      {
        field: 'dataRetentionDays',
        message:
          'GDPR requires data minimization — retaining user data beyond 2 years should have a documented lawful basis. Consider reducing retention or implementing automated data lifecycle policies.',
        severity: 'warning',
      },
    ],
  },
  {
    applies: (c) =>
      ((c.targetMarkets ?? []).includes('eu') ||
        (c.targetMarkets ?? []).includes('uk')) &&
      c.hostingRegion !== 'eu-west-1' &&
      c.hostingRegion !== 'eu-central-1' &&
      !(c.hostingRegion ?? '').startsWith('eu-'),
    violations: () => [
      {
        field: 'hostingRegion',
        message:
          'Hosting EU user data outside the EU complicates GDPR compliance. Consider deploying to an EU region (eu-west-1, eu-central-1) and implementing Standard Contractual Clauses.',
        severity: 'warning',
      },
    ],
  },

  // ── PIPEDA (CA) ──────────────────────────────────────────────────────

  {
    applies: (c) =>
      (c.targetMarkets ?? []).includes('ca') && c.userTracking === 'full',
    violations: () => [
      {
        field: 'userTracking',
        message:
          'Under PIPEDA, "full" tracking that collects PII without meaningful consent may violate Canadian privacy law. Ensure you obtain express consent and provide a clear privacy notice.',
        severity: 'warning',
      },
    ],
  },

  // ── LGPD (BR) ────────────────────────────────────────────────────────

  {
    applies: (c) =>
      (c.targetMarkets ?? []).includes('br') && c.dataRetentionDays === 0,
    violations: () => [
      {
        field: 'dataRetentionDays',
        message:
          'LGPD (Lei Geral de Proteção de Dados) requires data controllers to justify retention periods. A dataRetentionDays of 0 is invalid — specify a positive retention policy, or document why no retention is needed.',
        severity: 'error',
      },
    ],
  },
  {
    applies: (c) =>
      (c.targetMarkets ?? []).includes('br') && c.userTracking === 'analytics',
    violations: () => [
      {
        field: 'userTracking',
        message:
          'LGPD treats analytics data as personal data if it can identify users. Even anonymous analytics should be disclosed in the privacy policy in Portuguese (LGPD Art. 9).',
        severity: 'warning',
      },
    ],
  },

  // ── Payments / PCI-DSS ───────────────────────────────────────────────

  {
    applies: (c) => c.payments !== 'none',
    violations: () => [
      {
        field: 'payments',
        message:
          'Handling payments brings PCI-DSS scope. Ensure you use hosted checkout pages or tokenization (Stripe Elements, Paddle overlay) to minimize compliance burden. Never store raw card numbers.',
        severity: 'warning',
      },
    ],
  },
  {
    applies: (c) => c.payments !== 'none' && c.emailProvider === 'none',
    violations: () => [
      {
        field: 'emailProvider',
        message:
          'Payment processing requires transactional emails (receipts, invoices, refunds). Set an emailProvider to avoid relying on your own SMTP for critical payment communications.',
        severity: 'warning',
      },
    ],
  },

  // ── Scale / Database Appropriateness ──────────────────────────────────

  {
    applies: (c) =>
      c.expectedUserCount !== '1-100' &&
      c.expectedUserCount !== '100-1k' &&
      c.database === 'sqlite',
    violations: () => [
      {
        field: 'database',
        message:
          'SQLite is unsuitable for applications with more than ~1,000 concurrent users due to its single-writer architecture. Use PostgreSQL or MySQL for multi-user workloads.',
        severity: 'error',
      },
    ],
  },
  {
    applies: (c) => c.expectedUserCount === '100k+' && c.database === 'mongodb',
    violations: () => [
      {
        field: 'database',
        message:
          'MongoDB at 100k+ users requires careful sharding strategy and dedicated ops expertise. PostgreSQL with read replicas and connection pooling often scales more predictably at this tier.',
        severity: 'warning',
      },
    ],
  },

  // ── Performance / Security Tradeoffs ──────────────────────────────────

  {
    applies: (c) =>
      c.performanceProfile === 'security' && c.userTracking !== 'none',
    violations: () => [
      {
        field: 'performanceProfile',
        message:
          '"Security" profile conflicts with user tracking — any client-side tracking scripts increase the attack surface and may leak sensitive data. Set userTracking to "none" or switch to a "balanced" profile.',
        severity: 'warning',
      },
    ],
  },
  {
    applies: (c) =>
      c.performanceProfile === 'speed' &&
      c.mfaRequired === false &&
      c.auth !== 'none',
    violations: () => [
      {
        field: 'mfaRequired',
        message:
          'Speed-optimized profiles often trade off security hardening. Consider enabling MFA even when prioritizing performance — the UX overhead is minimal with TOTP or passkeys.',
        severity: 'warning',
      },
    ],
  },
  {
    applies: (c) =>
      c.performanceProfile === 'security' &&
      c.analyticsProvider === 'google-analytics',
    violations: () => [
      {
        field: 'analyticsProvider',
        message:
          'Google Analytics loads third-party scripts that are incompatible with a strict security posture (CSP policies, subresource integrity concerns). Use a self-hosted or privacy-first analytics provider.',
        severity: 'warning',
      },
    ],
  },

  // ── Analytics ↔ Tracking ─────────────────────────────────────────────

  {
    applies: (c) =>
      (c.userTracking === 'analytics' || c.userTracking === 'full') &&
      c.analyticsProvider === 'none',
    violations: () => [
      {
        field: 'analyticsProvider',
        message:
          'User tracking is enabled but no analytics provider is configured. Select an analytics provider to collect and visualize the tracking data.',
        severity: 'error',
      },
    ],
  },

  // ── Storage Requirements ──────────────────────────────────────────────

  {
    applies: (c) =>
      c.fileStorage !== 'none' &&
      c.hosting === 'vercel' &&
      c.fileStorage !== 'vercel-blob' &&
      c.fileStorage !== 'supabase-storage',
    violations: () => [
      {
        field: 'fileStorage',
        message:
          'When hosting on Vercel, S3, R2, or Cloudinary require additional configuration for CORS and signed URLs. Vercel Blob and Supabase Storage have first-class Vercel integrations.',
        severity: 'warning',
      },
    ],
  },

  // ── Monitoring for Production Scale ───────────────────────────────────

  {
    applies: (c) =>
      c.expectedUserCount !== '1-100' &&
      c.expectedUserCount !== '100-1k' &&
      c.monitoring === 'none',
    violations: () => [
      {
        field: 'monitoring',
        message:
          'Applications serving more than 1,000 users should have observability in place. Set up Sentry for error tracking or Datadog/Grafana for full-stack monitoring before launch.',
        severity: 'warning',
      },
    ],
  },
  {
    applies: (c) =>
      ((c.hasPublicApi ?? false) || (c.hasWebhooks ?? false)) &&
      c.monitoring === 'none',
    violations: () => [
      {
        field: 'monitoring',
        message:
          'Public APIs and webhooks need monitoring for uptime tracking, latency alerts, and delivery success rates. Enable Sentry at minimum to catch integration failures.',
        severity: 'warning',
      },
    ],
  },

  // ── CI / Team Size ────────────────────────────────────────────────────

  {
    applies: (c) => c.expectedTeamSize !== 'solo' && c.ciProvider === 'none',
    violations: () => [
      {
        field: 'ciProvider',
        message:
          'Teams larger than solo benefit from automated CI to prevent regressions, run linting, and enforce code review gates. Enable GitHub Actions or an equivalent CI provider.',
        severity: 'warning',
      },
    ],
  },

  // ── Framework / Hosting Optimization ──────────────────────────────────

  {
    applies: (c) =>
      c.framework === 'nextjs' && c.hosting !== 'vercel' && c.hosting !== 'aws',
    violations: () => [
      {
        field: 'hosting',
        message:
          'Next.js has first-class support on Vercel and AWS (via OpenNext/SST). Other platforms may require custom server configurations for ISR, middleware, and edge functions. Verify your host supports all Next.js features you plan to use.',
        severity: 'warning',
      },
    ],
  },
  {
    applies: (c) => c.framework === 'remix' && c.hosting === 'vercel',
    violations: () => [
      {
        field: 'framework',
        message:
          'Remix runs on Vercel but was architected for long-running servers (Fly.io, Railway). Vercel serverless cold starts may impact Remix loader performance. Consider hosting on Fly.io for optimal Remix latency.',
        severity: 'warning',
      },
    ],
  },
  {
    applies: (c) => c.framework === 'astro' && c.hosting === 'gcp',
    violations: () => [
      {
        field: 'hosting',
        message:
          'Astro static sites on GCP require Cloud CDN + Cloud Storage setup rather than Cloud Run. For SSR with Astro, verify the adapter (Node, Vercel, Deno) matches your target hosting environment.',
        severity: 'warning',
      },
    ],
  },

  // ── File Storage / Payments ──────────────────────────────────────────

  {
    applies: (c) =>
      c.fileStorage !== 'none' &&
      c.payments !== 'none' &&
      (c.targetMarkets ?? []).some((m) => ['eu', 'uk', 'ca', 'br'].includes(m)),
    violations: () => [
      {
        field: 'fileStorage',
        message:
          'Storing user files alongside payment processing means uploaded files may contain PII subject to data protection law. Ensure your file storage provider supports encryption at rest and provides a mechanism for data subject access requests.',
        severity: 'warning',
      },
    ],
  },

  // ── Communication Platforms ─────────────────────────────────────────

  {
    applies: (c) =>
      (c.communicationPlatforms ?? []).includes('slack') &&
      !(c.hasWebhooks ?? false),
    violations: () => [
      {
        field: 'hasWebhooks',
        message:
          'Slack apps typically use the Events API (webhooks) or Socket Mode. If deploying to production, enable webhooks to receive Slack events reliably.',
        severity: 'warning',
      },
    ],
  },
  {
    applies: (c) =>
      (c.communicationPlatforms ?? []).includes('teams') &&
      !(c.ssoProviders ?? []).includes('microsoft') &&
      (c.auth === 'none' || c.auth === 'jwt'),
    violations: () => [
      {
        field: 'auth',
        message:
          'Microsoft Teams apps require Microsoft identity. Enable the Microsoft SSO provider and use Auth0, next-auth, or Azure AD as your auth backend.',
        severity: 'error',
      },
    ],
  },
  {
    applies: (c) =>
      (c.communicationPlatforms ?? []).includes('zoom') && c.auth === 'none',
    violations: () => [
      {
        field: 'auth',
        message:
          'Zoom apps require OAuth 2.0 for user authorization. Enable an auth backend that supports OAuth flows.',
        severity: 'error',
      },
    ],
  },
  {
    applies: (c) =>
      (c.communicationPlatforms ?? []).length > 0 && !(c.hasWebhooks ?? false),
    violations: () => [
      {
        field: 'hasWebhooks',
        message:
          'Communication platform apps (Slack, Teams, Zoom) all rely on webhooks for event delivery. Enable webhooks in your project.',
        severity: 'warning',
      },
    ],
  },
  {
    applies: (c) =>
      (c.communicationPlatforms ?? []).length > 0 && c.emailProvider === 'none',
    violations: () => [
      {
        field: 'emailProvider',
        message:
          'Platform apps often send notifications, error alerts, or user invites via email. Configure an email provider for reliable delivery.',
        severity: 'warning',
      },
    ],
  },
  {
    applies: (c) =>
      (c.communicationPlatforms ?? []).length > 0 &&
      (c.targetMarkets ?? []).some((m) => ['eu', 'uk'].includes(m)),
    violations: () => [
      {
        field: 'communicationPlatforms',
        message:
          'Slack, Teams, and Zoom may process user data outside the EU. For GDPR/UK GDPR compliance, verify each platform has a DPA (Data Processing Agreement) and Standard Contractual Clauses in place.',
        severity: 'warning',
      },
    ],
  },
]

export function validateConfig(
  config: Partial<BootConfig>,
): ConstraintViolation[] {
  return CONSTRAINTS.filter((c) => c.applies(config)).flatMap((c) =>
    c.violations(config),
  )
}
