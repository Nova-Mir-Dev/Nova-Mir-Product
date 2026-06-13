import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'

export function generateEdgeCdn(config: BootConfig): GeneratedFile[] {
  if (config.edgeCdn === 'none') return []
  return [
    {
      path: 'docs/EDGE_CDN.md',
      content: `# Edge CDN Configuration — ${config.edgeCdn}

## Setup
- [ ] Configure ${config.edgeCdn} distribution for your domain
- [ ] Set origin to your application URL
- [ ] Configure cache behaviors: HTML (no-cache), assets (max-age=31536000), API (no-cache)
- [ ] Enable HTTP/2 and HTTP/3
- [ ] Configure SSL/TLS certificates

## Headers
- [ ] Add security headers (HSTS, CSP, X-Frame-Options) at CDN level
- [ ] Enable Brotli and Gzip compression
- [ ] Configure CORS headers for API endpoints

## Monitoring
- [ ] Set up CDN logging
- [ ] Configure cache hit ratio alerts
- [ ] Monitor origin shield / failover
`,
    },
  ]
}

export function generateWafDocs(config: BootConfig): GeneratedFile[] {
  if (!config.wafEnabled) return []
  return [
    {
      path: 'docs/WAF_CONFIG.md',
      content: `# Web Application Firewall Configuration

## Enabled Rules
- [ ] SQL injection protection
- [ ] XSS (cross-site scripting) protection
- [ ] Rate-based rules (DDoS mitigation)
- [ ] IP reputation lists
- [ ] Geo-blocking (if needed)
- [ ] Bot control

## Monitoring
- [ ] Enable WAF logging
- [ ] Set up alerts for blocked requests
- [ ] Review logs weekly for false positives

## Testing
- [ ] Test WAF rules before enabling in production
- [ ] Run penetration test to verify WAF coverage
`,
    },
  ]
}

export function generateDnsDocs(config: BootConfig): GeneratedFile[] {
  if (!config.dnsManaged) return []
  return [
    {
      path: 'docs/DNS_SETUP.md',
      content: `# DNS Configuration

## Required Records
- [ ] A/AAAA records pointing to your hosting provider
- [ ] CNAME for www subdomain
- [ ] TXT records for domain verification (${config.hosting} hosting)
- [ ] MX records for email (if using custom domain email)
- [ ] TXT record for SPF
- [ ] TXT record for DKIM
- [ ] TXT record for DMARC

## DNSSEC
- [ ] Enable DNSSEC if supported by your registrar

## TTL Values
- A/AAAA: 300 (5 minutes)
- CNAME: 3600 (1 hour)
- MX: 3600 (1 hour)
- TXT: 3600 (1 hour)
`,
    },
  ]
}

export function generateCustomDomainsDocs(config: BootConfig): GeneratedFile[] {
  if (!config.customDomains) return []
  return [
    {
      path: 'docs/CUSTOM_DOMAINS.md',
      content: `# Custom Domain Setup

## Domain Configuration
- [ ] Purchase domain from registrar
- [ ] Configure DNS records to point to ${config.hosting}
${config.hosting === 'vercel' ? "- [ ] Add domain in Vercel Project Settings > Domains\n- [ ] Vercel automatically provisions SSL via Let's Encrypt" : "- [ ] Add domain in your hosting provider's settings\n- [ ] Configure SSL/TLS certificate"}
- [ ] Set up www subdomain redirect
- [ ] Configure apex domain

## SSL/TLS
- [ ] Verify SSL certificate is active
- [ ] Enable HSTS
- [ ] Test SSL configuration (sslabs.com/ssltest)

## Multi-Tenancy Domains
${config.multiTenancy !== 'none' ? '- [ ] Configure tenant subdomain routing if using subdomain-per-tenant pattern' : ''}
`,
    },
  ]
}

export function generateApiGatewayDocs(config: BootConfig): GeneratedFile[] {
  if (config.apiGateway === 'none') return []
  return [
    {
      path: 'docs/API_GATEWAY.md',
      content: `# API Gateway Configuration — ${config.apiGateway}

## Setup
- [ ] Create API gateway instance
- [ ] Configure routes/endpoints
- [ ] Set up authentication at gateway level (API keys, JWT validation)
- [ ] Configure rate limiting
- [ ] Enable request/response transformation if needed
- [ ] Set up API versioning (URL or header-based)

## Monitoring
- [ ] Enable API gateway logging
- [ ] Configure usage analytics
- [ ] Set up alerts for 4xx/5xx spikes
- [ ] Monitor latency percentiles
`,
    },
  ]
}

export function generateApiStyle(config: BootConfig): GeneratedFile[] {
  if (config.apiStyle === 'none') return []
  const apiStyle = config.apiStyle
  return [
    {
      path: 'docs/API_STYLE.md',
      content: `# API Style: ${apiStyle}

This project uses ${apiStyle} for its API layer.

${apiStyle === 'trpc' ? '## tRPC Setup\n- End-to-end type safety\n- No code generation needed\n- All procedures under /api/trpc' : ''}
${apiStyle === 'server-actions' ? '## Server Actions\n- Use React Server Actions for mutations\n- Form actions with progressive enhancement\n- No API routes needed for basic CRUD' : ''}
${apiStyle === 'route-handlers' ? '## Route Handlers\n- API routes under /api/*\n- Standard Next.js Route Handlers\n- Use Zod for request validation' : ''}
`,
    },
  ]
}

export function generateThirdPartyApisDocs(
  config: BootConfig,
): GeneratedFile[] {
  if (config.thirdPartyApis.length === 0) return []
  return [
    {
      path: 'docs/THIRD_PARTY_APIS.md',
      content: `# Third-Party API Integrations

## Currently Configured
${config.payments !== 'none' ? `- Payment provider: ${config.payments}` : ''}
${config.emailProvider !== 'none' ? `- Email provider: ${config.emailProvider}` : ''}
${config.fileStorage !== 'none' ? `- File storage: ${config.fileStorage}` : ''}
${config.monitoring !== 'none' ? `- Monitoring: ${config.monitoring}` : ''}

## API Key Management
- [ ] Store all API keys in environment variables
- [ ] Rotate keys every 90 days
- [ ] Use separate keys for development and production
- [ ] Monitor API usage and set up rate limiting
- [ ] Document all third-party dependencies in vendor list

## Integration Testing
- [ ] Test each integration in staging before production
- [ ] Mock third-party APIs in local development
- [ ] Set up webhook retry handling for each integration
`,
    },
  ]
}

export function generateWebhookReliabilityDocs(
  config: BootConfig,
): GeneratedFile[] {
  if (config.webhookReliability === 'none') return []
  return [
    {
      path: 'lib/webhook.ts',
      content: `// Webhook handling utilities

export async function processWebhook(
  body: unknown,
  signature: string,
  secret: string,
  handler: (event: unknown) => Promise<void>,
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Verify signature (prevent replay attacks)
    const isValid = verifySignature(body, signature, secret);
    if (!isValid) return { success: false, error: "Invalid signature" };

    // 2. Idempotency check — use event ID to prevent duplicate processing
    const eventId = extractEventId(body);
    if (eventId && isDuplicate(eventId)) return { success: true }; // Already processed

    // 3. Process the event
    await handler(body);

    // 4. Mark as processed
    if (eventId) markAsProcessed(eventId);

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

function verifySignature(body: unknown, signature: string, secret: string): boolean {
  // TODO: Implement signature verification for your webhook provider
  return true;
}

const processedEvents = new Set<string>();
function isDuplicate(eventId: string): boolean { return processedEvents.has(eventId); }
function markAsProcessed(eventId: string): void { processedEvents.add(eventId); }
function extractEventId(body: unknown): string | null { return (body as any)?.id || null; }
`,
    },
  ]
}
