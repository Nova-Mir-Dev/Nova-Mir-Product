import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'

export function generateDeploymentGuide(config: BootConfig): GeneratedFile[] {
  const lines: string[] = []

  lines.push(`# Deployment Guide — ${config.projectName}`)
  lines.push('')
  lines.push(
    'This guide covers everything you need to deploy this project manually.',
  )
  lines.push('Completed items can be checked off as you go.')
  lines.push('')

  // ── Prerequisites ──
  lines.push('## Prerequisites')
  lines.push('')
  lines.push('- [ ] Node.js 20+ installed')
  lines.push('- [ ] npm 10+ installed')
  if (config.ciProvider === 'github-actions') {
    lines.push('- [ ] Git repository connected to GitHub')
  }
  lines.push('')

  // ── 1. Environment Variables ──
  lines.push('## 1. Environment Variables')
  lines.push('')
  lines.push('Copy `.env.example` to `.env.local` and fill in every variable:')
  lines.push('```bash')
  lines.push('cp .env.example .env.local')
  lines.push('```')
  lines.push('')

  // Database
  if (config.databaseProvider === 'supabase') {
    lines.push('### Supabase Setup')
    lines.push('')
    lines.push(
      '- [ ] Create a project at [supabase.com/dashboard](https://supabase.com/dashboard)',
    )
    lines.push('- [ ] Go to Project Settings > API')
    lines.push('- [ ] Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`')
    lines.push('- [ ] Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`')
    lines.push(
      '- [ ] Copy `service_role` secret → `SUPABASE_SERVICE_ROLE_KEY` (never expose to client!)',
    )
    if (config.auth === 'supabase-auth') {
      lines.push('- [ ] Go to Authentication > Settings')
      lines.push('- [ ] Enable Email provider (or your chosen providers)')
      lines.push('- [ ] Set Site URL to your production domain')
      lines.push(
        '- [ ] Add redirect URLs for OAuth callbacks: `https://YOUR_DOMAIN/auth/callback`',
      )
    }
    lines.push('')
  }

  if (config.databaseProvider === 'neon') {
    lines.push('### Neon Setup')
    lines.push('')
    lines.push('- [ ] Create a project at [neon.tech](https://neon.tech)')
    lines.push('- [ ] Copy the connection string → `DATABASE_URL`')
    lines.push('')
  }

  if (config.databaseProvider === 'planetscale') {
    lines.push('### PlanetScale Setup')
    lines.push('')
    lines.push(
      '- [ ] Create a database at [planetscale.com](https://planetscale.com)',
    )
    lines.push('- [ ] Copy the connection string → `DATABASE_URL`')
    lines.push('')
  }

  // Auth (non-supabase)
  if (config.auth === 'jwt') {
    lines.push('### JWT Setup')
    lines.push('')
    lines.push('- [ ] Generate a secure secret: `openssl rand -hex 32`')
    lines.push('- [ ] Set `JWT_SECRET` to the generated value')
    lines.push('- [ ] Never commit this value to version control')
    lines.push('')
  }

  if (config.auth === 'next-auth') {
    lines.push('### NextAuth Setup')
    lines.push('')
    lines.push('- [ ] Generate a secret: `openssl rand -hex 32`')
    lines.push('- [ ] Set `AUTH_SECRET` to the generated value')
    for (const p of config.ssoProviders) {
      switch (p) {
        case 'google':
          lines.push(
            '- [ ] Create OAuth credentials at [Google Cloud Console](https://console.cloud.google.com/apis/credentials)',
          )
          lines.push('- [ ] Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`')
          break
        case 'github':
          lines.push(
            '- [ ] Create OAuth app at [GitHub Developer Settings](https://github.com/settings/developers)',
          )
          lines.push('- [ ] Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`')
          break
        case 'microsoft':
          lines.push(
            '- [ ] Register app at [Azure AD](https://portal.azure.com)',
          )
          lines.push(
            '- [ ] Set `AZURE_AD_CLIENT_ID`, `AZURE_AD_CLIENT_SECRET`, `AZURE_AD_TENANT_ID`',
          )
          break
        case 'apple':
          lines.push(
            '- [ ] Create Services ID at [Apple Developer](https://developer.apple.com)',
          )
          lines.push('- [ ] Set `APPLE_CLIENT_ID` and `APPLE_CLIENT_SECRET`')
          break
      }
    }
    lines.push('')
  }

  if (config.auth === 'auth0') {
    lines.push('### Auth0 Setup')
    lines.push('')
    lines.push(
      '- [ ] Create an application at [Auth0 Dashboard](https://manage.auth0.com)',
    )
    lines.push(
      '- [ ] Copy Domain, Client ID, Client Secret → `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`',
    )
    lines.push(
      '- [ ] Configure Allowed Callback URLs: `https://YOUR_DOMAIN/api/auth/callback`',
    )
    lines.push('- [ ] Configure Allowed Logout URLs: `https://YOUR_DOMAIN`')
    lines.push('')
  }

  // Payments
  if (config.payments === 'stripe') {
    lines.push('### Stripe Setup')
    lines.push('')
    lines.push('- [ ] Create an account at [stripe.com](https://stripe.com)')
    lines.push('- [ ] Go to Developers > API keys')
    lines.push(
      '- [ ] Copy `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`',
    )
    lines.push('- [ ] Copy `Secret key` → `STRIPE_SECRET_KEY`')
    lines.push('- [ ] Go to Webhooks in the Stripe Dashboard')
    lines.push('- [ ] Add endpoint: `https://YOUR_DOMAIN/api/stripe/webhook`')
    lines.push(
      '- [ ] Select events: `checkout.session.completed`, `customer.subscription.updated`',
    )
    lines.push('- [ ] Copy `Signing secret` → `STRIPE_WEBHOOK_SECRET`')
    if (config.hosting === 'vercel') {
      lines.push(
        '- [ ] Install Stripe Vercel integration for automatic webhook setup',
      )
    }
    lines.push('')
  }

  // Email
  if (config.emailProvider === 'resend') {
    lines.push('### Resend Setup')
    lines.push('')
    lines.push('- [ ] Create an account at [resend.com](https://resend.com)')
    lines.push('- [ ] Go to API Keys → Create API Key → `RESEND_API_KEY`')
    lines.push('- [ ] Verify your domain in Resend')
    lines.push('- [ ] Set `EMAIL_FROM` to your verified sender address')
    lines.push('')
  }

  // Monitoring
  if (config.monitoring === 'sentry') {
    lines.push('### Sentry Setup')
    lines.push('')
    lines.push('- [ ] Create a project at [sentry.io](https://sentry.io)')
    lines.push('- [ ] Copy DSN → `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN`')
    lines.push('- [ ] Go to Settings > Developer Settings > Auth Tokens')
    lines.push(
      '- [ ] Create token with `project:releases` scope → `SENTRY_AUTH_TOKEN`',
    )
    lines.push(
      '- [ ] Set `SENTRY_ORG` and `SENTRY_PROJECT` for source map uploads',
    )
    lines.push('')
  }

  // Slack
  if (config.communicationPlatforms.includes('slack')) {
    lines.push('### Slack App Setup')
    lines.push('')
    lines.push(
      '- [ ] Go to [api.slack.com/apps](https://api.slack.com/apps) → Create New App',
    )
    lines.push('- [ ] Enable Socket Mode if using `slack-app/` standalone')
    lines.push('- [ ] Set `SLACK_BOT_TOKEN` from OAuth & Permissions')
    lines.push('- [ ] Set `SLACK_SIGNING_SECRET` from Basic Information')
    lines.push(
      '- [ ] Configure Event Subscriptions URL: `https://YOUR_DOMAIN/api/slack/events`',
    )
    lines.push('')
  }

  // Axiom
  if (config.logManagement === 'axiom') {
    lines.push('### Axiom Setup')
    lines.push('')
    lines.push('- [ ] Create an account at [axiom.co](https://axiom.co)')
    lines.push('- [ ] Create a dataset from the Axiom dashboard')
    lines.push('- [ ] Copy dataset name → `NEXT_PUBLIC_AXIOM_DATASET`')
    lines.push('- [ ] Go to Settings → API Tokens → Create Token')
    lines.push('- [ ] Copy API token → `AXIOM_API_TOKEN`')
    lines.push('')
  }

  // MFA
  if (config.totpEnabled && config.auth === 'supabase-auth') {
    lines.push('### 2FA Setup')
    lines.push('')
    lines.push(
      '- [ ] TOTP is handled by Supabase Auth — no additional setup needed',
    )
    lines.push('- [ ] Users enroll via the MFA panel in account settings')
    lines.push('- [ ] Test the enrollment flow end-to-end after deployment')
    lines.push('')
  }

  // Passkeys
  if (config.passkeysEnabled && config.auth === 'supabase-auth') {
    lines.push('### Passkeys Setup')
    lines.push('')
    lines.push(
      '- [ ] Passkeys are handled by Supabase Auth — no additional setup needed',
    )
    lines.push('- [ ] Users register passkeys via the passkeys UI component')
    lines.push('- [ ] Test passkey registration and sign-in after deployment')
    lines.push('')
  }

  // ── 2. Database ──
  lines.push('## 2. Database')
  lines.push('')
  if (config.databaseProvider === 'supabase') {
    lines.push('- [ ] Run migrations in Supabase SQL Editor or via CLI:')
    lines.push('```bash')
    lines.push('npx supabase db push')
    lines.push('```')
    lines.push(
      '- [ ] Verify tables created: `users`, ' +
        (config.auditLogging ? '`audit_logs`, ' : '') +
        (config.apiKeyAuth ? '`api_keys`, ' : '') +
        (config.appointments ? '`appointments`, ' : '') +
        (config.eSignature ? '`documents`, `signatures`' : ''),
    )
  } else {
    lines.push('- [ ] Push schema to your database provider')
    lines.push('- [ ] Verify all required tables exist')
  }
  lines.push('')

  // ── 3. Hosting ──
  lines.push('## 3. Hosting')
  lines.push('')
  if (config.hosting === 'vercel') {
    lines.push('### Deploy to Vercel')
    lines.push('')
    lines.push(
      '- [ ] Connect your Git repository at [vercel.com](https://vercel.com)',
    )
    lines.push('- [ ] Import project — Vercel auto-detects Next.js')
    lines.push(
      '- [ ] Add all environment variables in Project Settings > Environment Variables',
    )
    lines.push('- [ ] Deploy — Vercel auto-builds on every push to main')
    lines.push('- [ ] Set up custom domain in Project Settings > Domains')
    lines.push('- [ ] Enable automatic HTTPS (enabled by default)')
    lines.push('')
  } else if (config.hosting === 'aws') {
    lines.push('### Deploy to AWS')
    lines.push('')
    lines.push('- [ ] Build the project: `npm run build`')
    lines.push('- [ ] Deploy to your chosen service (Amplify, ECS, EC2)')
    lines.push(
      '- [ ] Configure environment variables in your deployment service',
    )
    lines.push('- [ ] Set up TLS termination (ALB + ACM recommended)')
    lines.push('')
  } else {
    lines.push('### Deploy to ' + config.hosting)
    lines.push('')
    lines.push('- [ ] Build the project: `npm run build`')
    lines.push('- [ ] Deploy the `.next` output to your hosting provider')
    lines.push('- [ ] Configure environment variables')
    lines.push('- [ ] Enable HTTPS')
    lines.push('')
  }

  // ── 4. DNS & Domain ──
  lines.push('## 4. DNS & Domain')
  lines.push('')
  lines.push('- [ ] Point your domain to your hosting provider')
  lines.push('- [ ] Verify HTTPS/TLS is working')
  if (config.hosting === 'vercel') {
    lines.push("- [ ] Vercel provides automatic SSL via Let's Encrypt")
  }
  lines.push('')

  // ── 5. CI/CD ──
  if (config.ciProvider === 'github-actions') {
    lines.push('## 5. CI/CD')
    lines.push('')
    lines.push('- [ ] Push to GitHub — CI runs on every push and PR')
    lines.push(
      '- [ ] Add repository secrets in Settings > Secrets and Variables > Actions:',
    )
    lines.push(
      '- [ ] Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`',
    )
    if (config.payments === 'stripe') {
      lines.push('- [ ] `STRIPE_SECRET_KEY` (if build step accesses Stripe)')
    }
    lines.push(
      '- [ ] Dependabot is configured for weekly npm + Actions updates',
    )
    lines.push('')
  }

  // ── 6. Post-Deploy Verification ──
  lines.push('## 6. Post-Deploy Verification')
  lines.push('')
  lines.push('- [ ] Verify the app loads at your production URL')
  lines.push('- [ ] Test authentication flow (sign up, sign in, sign out)')
  if (config.totpEnabled) {
    lines.push('- [ ] Test 2FA enrollment and verification')
  }
  if (config.payments === 'stripe') {
    lines.push('- [ ] Test Stripe checkout flow in test mode')
    lines.push(
      '- [ ] Verify webhook events are received (check Stripe Dashboard > Webhooks > Attempts)',
    )
  }
  if (config.emailProvider !== 'none') {
    lines.push('- [ ] Send a test email to verify email delivery')
  }
  if (config.fileStorage !== 'none') {
    lines.push('- [ ] Test file upload and retrieval')
  }
  if (config.communicationPlatforms.length > 0) {
    lines.push(
      '- [ ] Test ' +
        config.communicationPlatforms.join(' and ') +
        ' integration',
    )
  }
  lines.push(
    '- [ ] Check ' +
      (config.monitoring !== 'none' ? config.monitoring : 'application') +
      ' logs for errors',
  )
  lines.push(
    '- [ ] Verify compliance docs are accessible (`/docs/COMPLIANCE`, etc.)',
  )
  lines.push('- [ ] Check `/.well-known/security.txt` is accessible')
  lines.push('')

  // ── 7. Compliance & Legal ──
  lines.push('## 7. Compliance & Legal')
  lines.push('')
  if (
    config.targetMarkets.some((m) => ['eu', 'uk', 'no', 'ch', 'is'].includes(m))
  ) {
    lines.push('### GDPR Requirements')
    lines.push('')
    lines.push(
      '- [ ] Appoint a Data Protection Officer (DPO) — update `docs/PRIVACY.md` with contact',
    )
    lines.push('- [ ] Maintain an Article 30 processing register')
    lines.push(
      '- [ ] Complete Data Protection Impact Assessment (DPIA) for high-risk processing',
    )
    lines.push('- [ ] Sign Data Processing Agreements with all vendors')
    lines.push('- [ ] Establish procedure to respond to DSARs within 30 days')
    lines.push(
      '- [ ] Establish breach notification procedure (72-hour deadline)',
    )
    lines.push('')
  }
  if (config.targetMarkets.includes('us')) {
    lines.push('### CCPA/CPRA Requirements')
    lines.push('')
    lines.push(
      "- [ ] Implement 'Do Not Sell or Share My Personal Information' mechanism",
    )
    lines.push('- [ ] Document categories of personal information collected')
    lines.push(
      '- [ ] Establish procedure to verify consumer identity for deletion/access requests',
    )
    lines.push('')
  }

  // ── 8. Security Checklist ──
  lines.push('## 8. Security Checklist')
  lines.push('')
  lines.push('- [ ] All environment variables are set (no placeholder values)')
  lines.push('- [ ] API keys and secrets are not in version control')
  lines.push('- [ ] HTTPS is enforced for all traffic')
  lines.push('- [ ] CSP headers are not in report-only mode')
  if (config.ipAllowlisting) {
    lines.push(
      "- [ ] IP allowlist is configured with your team's IPs in `ALLOWED_IPS`",
    )
  }
  lines.push('- [ ] Test all API endpoints with authentication required')
  lines.push('- [ ] Set up automated dependency updates (Dependabot/Snyk)')
  lines.push('- [ ] Review `docs/SECURITY.md` for complete checklist')
  lines.push('')

  lines.push('---')
  lines.push('')

  lines.push(
    'Generated by [Project Bootstrapper](https://github.com/rosejas13/project-bootstrapper)',
  )
  lines.push('')

  return [{ path: 'docs/DEPLOYMENT.md', content: lines.join('\n') }]
}
