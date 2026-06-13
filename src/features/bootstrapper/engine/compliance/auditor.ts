import type {
  Market,
  ProjectConfig,
  RegulationRequirement,
} from './regulations'
import { REGULATIONS, LAST_REVIEWED } from './regulations'
import { REGIONS, type BootConfig } from '../../types'

export interface AuditFinding {
  regulation: string
  regulationName: string
  requirementId: string
  category: string
  severity: 'critical' | 'warning' | 'info'
  description: string
  mitigation: string
}

export interface AuditReport {
  applicableRegulations: Array<{ id: string; name: string }>
  findings: AuditFinding[]
  summary: {
    critical: number
    warning: number
    info: number
    compliant: boolean
  }
  lastReviewed: string
}

export interface SecurityFinding {
  id: string
  category:
    | 'encryption'
    | 'access-control'
    | 'authentication'
    | 'api-security'
    | 'monitoring'
    | 'file-security'
    | 'dependency'
    | 'general'
  severity: 'critical' | 'warning' | 'info'
  description: string
  recommendation: string
}

function expandRegions(markets: string[]): string[] {
  const result: string[] = []
  for (const m of markets) {
    if (REGIONS[m]) {
      result.push(...REGIONS[m].markets)
    } else {
      result.push(m)
    }
  }
  return [...new Set(result)]
}

function isMarketIncluded(markets: Market[], configMarkets: Market[]): boolean {
  const normalized = configMarkets.map((m) => m.toLowerCase()) as Market[]
  return markets.some((m) => normalized.includes(m.toLowerCase() as Market))
}

function getApplicableRegulations(configMarkets: Market[]) {
  return REGULATIONS.filter((r) => isMarketIncluded(r.markets, configMarkets))
}

const DEFAULT_CONFIG: ProjectConfig = {
  userTracking: 'minimal',
  dataRetentionDays: 0,
  targetMarkets: [],
  fileStorage: 'none',
  payments: 'none',
  analyticsProvider: 'none',
  expectedUserCount: '1-100',
  auth: 'none',
  hasPublicApi: false,
  hasWebhooks: false,
  thirdPartyApis: [],
  mfaRequired: false,
}

function buildConfigForRequirements(
  config: Partial<BootConfig>,
): ProjectConfig {
  const expandedMarkets = expandRegions(
    config.targetMarkets ?? DEFAULT_CONFIG.targetMarkets,
  )
  return {
    userTracking: config.userTracking ?? DEFAULT_CONFIG.userTracking,
    dataRetentionDays:
      config.dataRetentionDays ?? DEFAULT_CONFIG.dataRetentionDays,
    targetMarkets: expandedMarkets as Market[],
    fileStorage: config.fileStorage ?? DEFAULT_CONFIG.fileStorage,
    payments: config.payments ?? DEFAULT_CONFIG.payments,
    analyticsProvider:
      config.analyticsProvider ?? DEFAULT_CONFIG.analyticsProvider,
    expectedUserCount:
      config.expectedUserCount ?? DEFAULT_CONFIG.expectedUserCount,
    auth: config.auth ?? DEFAULT_CONFIG.auth,
    hasPublicApi: config.hasPublicApi ?? DEFAULT_CONFIG.hasPublicApi,
    hasWebhooks: config.hasWebhooks ?? DEFAULT_CONFIG.hasWebhooks,
    thirdPartyApis: config.thirdPartyApis ?? DEFAULT_CONFIG.thirdPartyApis,
    mfaRequired: config.mfaRequired ?? DEFAULT_CONFIG.mfaRequired,
  }
}

function getUserCountSeverityMultiplier(expectedUserCount: string): number {
  switch (expectedUserCount) {
    case '100k+':
      return 2.0
    case '10k-100k':
      return 1.5
    case '1k-10k':
      return 1.2
    default:
      return 1.0
  }
}

function escalateWithUserCount(
  severity: 'critical' | 'warning' | 'info',
  config: ProjectConfig,
  requirement: RegulationRequirement,
): 'critical' | 'warning' | 'info' {
  if (severity === 'critical') return 'critical'

  const userCount = config.expectedUserCount
  const escalatableCategories = [
    'data-collection',
    'consent',
    'security',
    'storage',
    'deletion',
  ]

  if (!escalatableCategories.includes(requirement.category)) {
    return severity
  }

  if (userCount === '100k+') {
    if (severity === 'warning') return 'critical'
    return 'warning'
  }

  if (userCount === '10k-100k' && severity === 'info') {
    return 'warning'
  }

  return severity
}

function resolveSeverity(
  requirement: RegulationRequirement,
  config: ProjectConfig,
): 'critical' | 'warning' | 'info' {
  const category = requirement.category
  const tracking = config.userTracking
  const retention = config.dataRetentionDays
  const analytics = config.analyticsProvider
  const payments = config.payments
  const fileStorage = config.fileStorage
  const auth = config.auth
  const hasPublicApi = config.hasPublicApi

  if (category === 'consent' && tracking === 'full') {
    return escalateWithUserCount('critical', config, requirement)
  }

  if (
    category === 'data-collection' &&
    requirement.id.includes('minimization')
  ) {
    return escalateWithUserCount(
      tracking === 'full' ? 'critical' : 'warning',
      config,
      requirement,
    )
  }

  if (category === 'storage' && retention <= 0) {
    return escalateWithUserCount('warning', config, requirement)
  }

  if (category === 'security' && requirement.id.includes('breach')) {
    return escalateWithUserCount(
      tracking === 'full' ? 'warning' : 'info',
      config,
      requirement,
    )
  }

  if (category === 'security') {
    if (payments !== 'none')
      return escalateWithUserCount('warning', config, requirement)
    return escalateWithUserCount('warning', config, requirement)
  }

  if (category === 'encryption') {
    if (payments !== 'none' || fileStorage !== 'none')
      return escalateWithUserCount('warning', config, requirement)
    return escalateWithUserCount('info', config, requirement)
  }

  if (category === 'access-control') {
    if (auth !== 'none' || payments !== 'none')
      return escalateWithUserCount('warning', config, requirement)
    return escalateWithUserCount('info', config, requirement)
  }

  if (category === 'api-security') {
    if (hasPublicApi)
      return escalateWithUserCount('warning', config, requirement)
    return escalateWithUserCount('info', config, requirement)
  }

  if (category === 'data-collection' && requirement.id.includes('impact')) {
    return escalateWithUserCount(
      tracking === 'full' ? 'critical' : 'info',
      config,
      requirement,
    )
  }

  if (category === 'consent' && tracking !== 'none') {
    return escalateWithUserCount('warning', config, requirement)
  }

  if (category === 'disclosure' && requirement.id.includes('dpo')) {
    if (
      config.expectedUserCount === '100k+' ||
      config.expectedUserCount === '10k-100k'
    ) {
      return 'warning'
    }
    return 'info'
  }

  if (
    category === 'storage' &&
    requirement.id.includes('transfer') &&
    fileStorage !== 'none'
  ) {
    return escalateWithUserCount('warning', config, requirement)
  }

  if (
    requirement.id.includes('breach') &&
    tracking === 'none' &&
    payments === 'none'
  ) {
    return 'info'
  }

  if (
    analytics !== 'none' &&
    (requirement.id.includes('dpa') || requirement.id.includes('cross-border'))
  ) {
    return escalateWithUserCount('warning', config, requirement)
  }

  if (requirement.id.includes('cookie-consent') && tracking !== 'none') {
    return escalateWithUserCount('warning', config, requirement)
  }

  if (category === 'monitoring') {
    return escalateWithUserCount(
      payments !== 'none' || auth !== 'none' ? 'warning' : 'info',
      config,
      requirement,
    )
  }

  return escalateWithUserCount('info', config, requirement)
}

export function runComplianceAudit(config: Partial<BootConfig>): AuditReport {
  const resolved = buildConfigForRequirements(config)
  const markets = resolved.targetMarkets
  const applicable = getApplicableRegulations(markets)

  if (applicable.length === 0) {
    return {
      applicableRegulations: [],
      findings: [],
      summary: {
        critical: 0,
        warning: 0,
        info: 0,
        compliant: true,
      },
      lastReviewed: LAST_REVIEWED,
    }
  }

  const findings: AuditFinding[] = []

  for (const regulation of applicable) {
    for (const requirement of regulation.requirements) {
      if (requirement.applies(resolved)) {
        const severity = resolveSeverity(requirement, resolved)
        findings.push({
          regulation: regulation.id,
          regulationName: regulation.name,
          requirementId: requirement.id,
          category: requirement.category,
          severity,
          description: requirement.description,
          mitigation: requirement.mitigation,
        })
      }
    }
  }

  const critical = findings.filter((f) => f.severity === 'critical').length
  const warning = findings.filter((f) => f.severity === 'warning').length
  const info = findings.filter((f) => f.severity === 'info').length

  findings.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 }
    return order[a.severity] - order[b.severity]
  })

  return {
    applicableRegulations: applicable.map((r) => ({ id: r.id, name: r.name })),
    findings,
    summary: {
      critical,
      warning,
      info,
      compliant: critical === 0,
    },
    lastReviewed: LAST_REVIEWED,
  }
}

export function getRegulationById(id: string) {
  return REGULATIONS.find((r) => r.id === id) ?? null
}

export function getComplianceChecklist(markets: Market[]): string[] {
  const applicable = getApplicableRegulations(markets)
  const items: string[] = []

  for (const regulation of applicable) {
    items.push(
      `[ ] ${regulation.name}: Review all ${String(regulation.requirements.length)} requirements`,
    )
  }

  items.push(
    '[ ] PCI-DSS: Determine if payment card data will be handled (applies regardless of target market)',
  )
  items.push(
    '[ ] Cookie Consent: Implement consent banner if any tracking or analytics are used',
  )
  items.push(
    '[ ] Privacy Policy: Publish a privacy policy covering all applicable jurisdictions',
  )
  items.push(
    '[ ] Terms of Service: Publish terms of service that incorporate data handling disclosures',
  )

  return items
}

export function getSecurityRequirements(
  config: Partial<BootConfig>,
): SecurityFinding[] {
  const resolved = buildConfigForRequirements(config)
  const findings: SecurityFinding[] = []

  if (resolved.auth !== 'none' && !resolved.mfaRequired) {
    findings.push({
      id: 'sec-mfa-recommended',
      category: 'authentication',
      severity:
        resolved.expectedUserCount === '100k+' ||
        resolved.expectedUserCount === '10k-100k'
          ? 'warning'
          : 'info',
      description:
        'MFA is not enforced for user accounts. Multi-factor authentication significantly reduces account takeover risk.',
      recommendation:
        'Enable MFA enforcement in your auth provider. Require TOTP or WebAuthn as a second factor for all accounts.',
    })
  }

  if (
    resolved.auth !== 'none' &&
    resolved.payments !== 'none' &&
    !resolved.mfaRequired
  ) {
    findings.push({
      id: 'sec-mfa-payments',
      category: 'authentication',
      severity: 'warning',
      description:
        'Payment processing is enabled but MFA is not enforced. PCI-DSS and security best practices require MFA for administrative access to payment systems.',
      recommendation:
        'Enforce MFA for all accounts with payment access. This is a PCI-DSS requirement for administrative access.',
    })
  }

  if (resolved.payments !== 'none' && resolved.auth === 'none') {
    findings.push({
      id: 'sec-payments-no-auth',
      category: 'access-control',
      severity: 'critical',
      description:
        'Payment processing is enabled but no authentication is configured. Payment transactions must be tied to authenticated user identities for fraud prevention and auditability.',
      recommendation:
        'Add authentication before enabling payments. At minimum, require user accounts for any payment flow.',
    })
  }

  if (resolved.hasPublicApi && resolved.auth === 'none') {
    findings.push({
      id: 'sec-api-no-auth',
      category: 'api-security',
      severity: 'warning',
      description:
        'A public API is exposed but no authentication is configured. Unauthenticated APIs are vulnerable to abuse, data scraping, and denial of service.',
      recommendation:
        'Require API key authentication or OAuth 2.0 for all public API endpoints. Issue unique keys per consumer.',
    })
  }

  if (resolved.hasWebhooks && resolved.auth === 'none') {
    findings.push({
      id: 'sec-webhook-no-verification',
      category: 'api-security',
      severity: 'warning',
      description:
        'Webhooks are enabled but webhook signature verification has not been explicitly configured. Unverified webhooks can be forged by attackers.',
      recommendation:
        'Implement HMAC-SHA256 webhook payload signing and verification. Store per-endpoint secrets securely.',
    })
  }

  if (resolved.fileStorage !== 'none') {
    findings.push({
      id: 'sec-file-encryption',
      category: 'file-security',
      severity: 'info',
      description:
        'File storage is enabled. Ensure encryption at rest is configured on your storage buckets and that access policies restrict public read access.',
      recommendation:
        'Enable default bucket encryption (AES-256 or KMS). Set bucket policies to deny public read unless intentionally public. Enable object versioning for recovery.',
    })
  }

  if (resolved.thirdPartyApis.length >= 3) {
    findings.push({
      id: 'sec-vendor-surface',
      category: 'general',
      severity: 'info',
      description: `${String(resolved.thirdPartyApis.length)} third-party APIs are integrated. Each integration expands the attack surface and introduces supply chain risk.`,
      recommendation:
        'Maintain a vendor inventory with security contacts. Review vendor SOC 2 reports annually. Use API keys with least-privilege scoping.',
    })
  }

  findings.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 }
    return order[a.severity] - order[b.severity]
  })

  return findings
}

export function getComplianceScore(config: Partial<BootConfig>): number {
  const resolved = buildConfigForRequirements(config)
  const report = runComplianceAudit(config)

  if (report.applicableRegulations.length === 0) return 100

  const multiplier = getUserCountSeverityMultiplier(resolved.expectedUserCount)

  let score = 100
  score -= report.summary.critical * 20 * multiplier
  score -= report.summary.warning * 5 * multiplier
  score -= report.summary.info * 1 * multiplier

  return Math.max(0, Math.min(100, Math.round(score)))
}
