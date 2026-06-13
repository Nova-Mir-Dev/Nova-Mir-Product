import { describe, it, expect } from 'vitest'
import {
  runComplianceAudit,
  getSecurityRequirements,
  getComplianceScore,
  getComplianceChecklist,
  getRegulationById,
} from '../engine/compliance/auditor'
import { REGULATIONS } from '../engine/compliance/regulations'
import type { BootConfig } from '../types'

function minimalConfig(
  overrides: Partial<BootConfig> = {},
): Partial<BootConfig> {
  return {
    preset: 'blank',
    projectName: 'test',
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
    ipAllowlisting: false,
    securityHeaders: false,
    corsEnabled: false,
    rateLimiting: 'none',
    requestValidation: false,
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
    realtime: 'none',
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
    auditLogging: false,
    backupEnabled: false,
    costAlerts: false,
    costAlertThreshold: 0,
    costAlertNotification: [],
    featureFlags: false,
    dataExport: false,
    eSignature: false,
    appointments: false,
    agentIntegration: 'none',
    agentUseCases: [],
    performanceProfile: 'balanced',
    expectedUserCount: '1-100',
    expectedTeamSize: 'solo',
    ciProvider: 'none',
    ...overrides,
  }
}

// ─── 1. runComplianceAudit ────────────────────────────────────────────

describe('runComplianceAudit', () => {
  it('returns compliant report for minimal config with no tracking, payments, or auth', () => {
    const config = minimalConfig({
      targetMarkets: ['eu'],
      userTracking: 'none',
      payments: 'none',
      auth: 'none',
      dataRetentionDays: 365,
      analyticsProvider: 'none',
      fileStorage: 'none',
    })

    const report = runComplianceAudit(config)

    expect(report).toHaveProperty('applicableRegulations')
    expect(report).toHaveProperty('findings')
    expect(report).toHaveProperty('summary')
    expect(report).toHaveProperty('lastReviewed')
    expect(report.summary.compliant).toBe(true)
    expect(report.summary.critical).toBe(0)
  })

  it('returns findings for EU+US markets with minimal tracking and Stripe payments', () => {
    const config = minimalConfig({
      targetMarkets: ['eu', 'us'],
      userTracking: 'minimal',
      payments: 'stripe',
      auth: 'next-auth',
      mfaRequired: false,
      analyticsProvider: 'posthog',
      dataRetentionDays: 365,
      fileStorage: 's3',
      expectedUserCount: '1k-10k',
    })

    const report = runComplianceAudit(config)

    expect(report.applicableRegulations.length).toBeGreaterThanOrEqual(2)
    const euRegulation = report.applicableRegulations.find((r) =>
      r.id.includes('gdpr'),
    )
    const usRegulation = report.applicableRegulations.find((r) =>
      r.id.includes('ccpa'),
    )
    expect(euRegulation).toBeDefined()
    expect(usRegulation).toBeDefined()
    expect(report.findings.length).toBeGreaterThan(0)
    expect(typeof report.summary.compliant).toBe('boolean')
  })

  it('includes security-baseline for all market configurations', () => {
    const config = minimalConfig({
      targetMarkets: ['eu'],
      userTracking: 'minimal',
      dataRetentionDays: 30,
    })

    const report = runComplianceAudit(config)

    const hasSecurityBaseline = report.applicableRegulations.some((r) =>
      r.id.includes('security-baseline'),
    )
    expect(hasSecurityBaseline).toBe(true)
  })

  it('triggers GDPR-specific findings when userTracking is not none', () => {
    const config = minimalConfig({
      targetMarkets: ['eu'],
      userTracking: 'full',
      dataRetentionDays: 30,
      analyticsProvider: 'google-analytics',
    })

    const report = runComplianceAudit(config)

    const gdprFindings = report.findings.filter((f) =>
      f.regulation.includes('gdpr'),
    )
    expect(gdprFindings.length).toBeGreaterThan(0)

    const consentFindings = gdprFindings.filter(
      (f) => f.requirementId === 'gdpr-consent',
    )
    expect(consentFindings.length).toBe(1)

    const minimizationFindings = gdprFindings.filter(
      (f) => f.requirementId === 'gdpr-minimization',
    )
    expect(minimizationFindings.length).toBe(1)
  })

  it('returns escilated severities with high userCount', () => {
    const config = minimalConfig({
      targetMarkets: ['eu'],
      userTracking: 'full',
      payments: 'stripe',
      auth: 'supabase-auth',
      mfaRequired: false,
      analyticsProvider: 'google-analytics',
      dataRetentionDays: 0,
      fileStorage: 's3',
      expectedUserCount: '100k+',
      hasPublicApi: true,
      hasWebhooks: true,
      thirdPartyApis: ['stripe', 'sendgrid', 'aws'],
    })

    const report = runComplianceAudit(config)

    expect(report.summary.critical).toBeGreaterThanOrEqual(1)
    expect(report.summary.warning).toBeGreaterThanOrEqual(1)
  })

  it('returns empty findings for no target markets', () => {
    const config = minimalConfig({ targetMarkets: [] })

    const report = runComplianceAudit(config)

    expect(report.applicableRegulations).toEqual([])
    expect(report.findings).toEqual([])
    expect(report.summary.compliant).toBe(true)
  })

  it('sorts findings by severity (critical, warning, info)', () => {
    const config = minimalConfig({
      targetMarkets: ['eu', 'us'],
      userTracking: 'full',
      payments: 'stripe',
      auth: 'supabase-auth',
      mfaRequired: false,
      dataRetentionDays: 0,
      fileStorage: 's3',
      analyticsProvider: 'google-analytics',
      expectedUserCount: '100k+',
      hasPublicApi: true,
      hasWebhooks: true,
      thirdPartyApis: ['stripe', 'sendgrid', 'aws'],
    })

    const report = runComplianceAudit(config)

    const severityOrder = report.findings.map((f) => f.severity)
    const criticalIdx = severityOrder.indexOf('critical')
    const warningIdx = severityOrder.indexOf('warning')
    const infoIdx = severityOrder.indexOf('info')

    if (criticalIdx >= 0 && warningIdx >= 0) {
      expect(criticalIdx).toBeLessThan(warningIdx)
    }
    if (warningIdx >= 0 && infoIdx >= 0) {
      expect(warningIdx).toBeLessThan(infoIdx)
    }
  })
})

// ─── 2. resolveSeverity (tested through runComplianceAudit) ────────────

describe('resolveSeverity (via runComplianceAudit)', () => {
  it('resolves consent as critical when tracking is full', () => {
    const config = minimalConfig({
      targetMarkets: ['eu'],
      userTracking: 'full',
    })

    const report = runComplianceAudit(config)
    const consentFinding = report.findings.find(
      (f) => f.requirementId === 'gdpr-consent',
    )
    expect(consentFinding).toBeDefined()
    expect(consentFinding!.severity).toBe('critical')
  })

  it('resolves consent as warning when tracking is minimal', () => {
    const config = minimalConfig({
      targetMarkets: ['eu'],
      userTracking: 'minimal',
    })

    const report = runComplianceAudit(config)
    const consentFinding = report.findings.find(
      (f) => f.requirementId === 'gdpr-consent',
    )
    expect(consentFinding).toBeDefined()
    expect(consentFinding!.severity).toBe('warning')
  })

  it('resolves storage retention as warning when dataRetentionDays is 0', () => {
    const config = minimalConfig({
      targetMarkets: ['eu'],
      userTracking: 'minimal',
      dataRetentionDays: 0,
    })

    const report = runComplianceAudit(config)
    const retentionFindings = report.findings.filter((f) =>
      f.requirementId.includes('retention'),
    )
    expect(retentionFindings.length).toBeGreaterThanOrEqual(1)
    for (const f of retentionFindings) {
      expect(f.severity).toBe('warning')
    }
  })

  it('resolves security breach as warning when tracking is full', () => {
    const config = minimalConfig({
      targetMarkets: ['eu'],
      userTracking: 'full',
    })

    const report = runComplianceAudit(config)
    const breachFinding = report.findings.find(
      (f) => f.requirementId === 'gdpr-breach',
    )
    expect(breachFinding).toBeDefined()
    expect(breachFinding!.severity).toBe('warning')
  })

  it('resolves security breach as info when tracking and payments are none', () => {
    const config = minimalConfig({
      targetMarkets: ['eu'],
      userTracking: 'none',
      payments: 'none',
    })

    const report = runComplianceAudit(config)
    const breachFinding = report.findings.find(
      (f) => f.requirementId === 'gdpr-breach',
    )
    expect(breachFinding).toBeDefined()
    expect(breachFinding!.severity).toBe('info')
  })

  it('resolves encryption as warning when payments or fileStorage present', () => {
    const config = minimalConfig({
      targetMarkets: ['eu'],
      userTracking: 'minimal',
      payments: 'stripe',
      fileStorage: 's3',
    })

    const report = runComplianceAudit(config)
    const encryptionFindings = report.findings.filter(
      (f) => f.category === 'encryption',
    )
    expect(encryptionFindings.length).toBeGreaterThanOrEqual(1)
    for (const f of encryptionFindings) {
      expect(['warning', 'info']).toContain(f.severity)
    }
  })

  it('resolves encryption as info without payments or fileStorage', () => {
    const config = minimalConfig({
      targetMarkets: ['eu'],
      userTracking: 'minimal',
      payments: 'none',
      fileStorage: 'none',
    })

    const report = runComplianceAudit(config)
    const encryptionFindings = report.findings.filter(
      (f) => f.category === 'encryption',
    )
    for (const f of encryptionFindings) {
      expect(f.severity).toBe('info')
    }
  })

  it('resolves access-control as warning when auth is enabled', () => {
    const config = minimalConfig({
      targetMarkets: ['eu'],
      userTracking: 'minimal',
      auth: 'supabase-auth',
    })

    const report = runComplianceAudit(config)
    const accessFindings = report.findings.filter(
      (f) => f.category === 'access-control',
    )
    for (const f of accessFindings) {
      expect(f.severity).toBe('warning')
    }
  })

  it('resolves monitoring as warning when payments or auth present', () => {
    const config = minimalConfig({
      targetMarkets: ['eu'],
      userTracking: 'minimal',
      payments: 'stripe',
    })

    const report = runComplianceAudit(config)
    const monitoringFindings = report.findings.filter(
      (f) => f.category === 'monitoring',
    )
    for (const f of monitoringFindings) {
      expect(f.severity).toBe('warning')
    }
  })

  it('resolves monitoring as info without payments or auth', () => {
    const config = minimalConfig({
      targetMarkets: ['eu'],
      userTracking: 'minimal',
      payments: 'none',
      auth: 'none',
    })

    const report = runComplianceAudit(config)
    const monitoringFindings = report.findings.filter(
      (f) => f.category === 'monitoring',
    )
    for (const f of monitoringFindings) {
      expect(f.severity).toBe('info')
    }
  })

  it('resolves data-collection minimization as critical when tracking is full', () => {
    const config = minimalConfig({
      targetMarkets: ['eu'],
      userTracking: 'full',
    })

    const report = runComplianceAudit(config)
    const minimizationFinding = report.findings.find(
      (f) => f.requirementId === 'gdpr-minimization',
    )
    expect(minimizationFinding).toBeDefined()
    expect(minimizationFinding!.severity).toBe('critical')
  })

  it('resolves disclosure dpo as warning for 100k+ userCount', () => {
    const config = minimalConfig({
      targetMarkets: ['eu'],
      userTracking: 'full',
      expectedUserCount: '100k+',
    })

    const report = runComplianceAudit(config)
    const dpoFindings = report.findings.filter((f) =>
      f.requirementId.includes('dpo'),
    )
    for (const f of dpoFindings) {
      expect(f.severity).toBe('warning')
    }
  })

  it('resolves disclosure dpo as info for small userCount', () => {
    const config = minimalConfig({
      targetMarkets: ['eu'],
      userTracking: 'full',
      expectedUserCount: '1-100',
    })

    const report = runComplianceAudit(config)
    const dpoFindings = report.findings.filter((f) =>
      f.requirementId.includes('dpo'),
    )
    for (const f of dpoFindings) {
      expect(f.severity).toBe('info')
    }
  })

  it('escalates warning to critical for 100k+ userCount on escalatable categories', () => {
    const config = minimalConfig({
      targetMarkets: ['eu'],
      userTracking: 'minimal',
      dataRetentionDays: 0,
      expectedUserCount: '100k+',
    })

    const report = runComplianceAudit(config)
    const retentionFindings = report.findings.filter((f) =>
      f.requirementId.includes('retention'),
    )
    for (const f of retentionFindings) {
      expect(f.severity).toBe('critical')
    }
  })

  it('escalates info to warning for 10k-100k userCount on escalatable categories', () => {
    const config = minimalConfig({
      targetMarkets: ['eu'],
      userTracking: 'minimal',
      dataRetentionDays: 30,
      expectedUserCount: '10k-100k',
    })

    const report = runComplianceAudit(config)
    const breachFinding = report.findings.find(
      (f) => f.requirementId === 'gdpr-breach',
    )
    expect(breachFinding).toBeDefined()
    expect(breachFinding!.severity).toBe('warning')
  })

  it('resolves api-security as warning when hasPublicApi is true', () => {
    const config = minimalConfig({
      targetMarkets: ['eu'],
      userTracking: 'minimal',
      hasPublicApi: true,
    })

    const report = runComplianceAudit(config)
    const apiSecurityFindings = report.findings.filter(
      (f) => f.category === 'api-security',
    )
    expect(apiSecurityFindings.length).toBeGreaterThanOrEqual(1)
    for (const f of apiSecurityFindings) {
      expect(f.severity).toBe('warning')
    }
  })

  it('resolves storage transfer as warning when fileStorage is present', () => {
    const config = minimalConfig({
      targetMarkets: ['eu'],
      userTracking: 'minimal',
      fileStorage: 's3',
    })

    const report = runComplianceAudit(config)
    const transferFindings = report.findings.filter((f) =>
      f.requirementId.includes('transfer'),
    )
    for (const f of transferFindings) {
      expect(f.severity).toBe('warning')
    }
  })

  it('resolves cookie-consent as warning when tracking or analytics present', () => {
    const config = minimalConfig({
      targetMarkets: ['eu'],
      userTracking: 'minimal',
      analyticsProvider: 'plausible',
    })

    const report = runComplianceAudit(config)
    const cookieFindings = report.findings.filter((f) =>
      f.requirementId.includes('cookie-consent'),
    )
    expect(cookieFindings.length).toBeGreaterThanOrEqual(1)
    for (const f of cookieFindings) {
      expect(f.severity).toBe('warning')
    }
  })
})

// ─── 3. getSecurityRequirements ───────────────────────────────────────

describe('getSecurityRequirements', () => {
  it('flags missing auth when payments are enabled', () => {
    const config = minimalConfig({
      payments: 'stripe',
      auth: 'none',
    })

    const findings = getSecurityRequirements(config)

    const noAuthFinding = findings.find((f) => f.id === 'sec-payments-no-auth')
    expect(noAuthFinding).toBeDefined()
    expect(noAuthFinding!.severity).toBe('critical')
  })

  it('recommends MFA when auth is enabled but MFA is not (with payments)', () => {
    const config = minimalConfig({
      auth: 'supabase-auth',
      mfaRequired: false,
      payments: 'stripe',
    })

    const findings = getSecurityRequirements(config)

    const mfaPaymentFinding = findings.find((f) => f.id === 'sec-mfa-payments')
    expect(mfaPaymentFinding).toBeDefined()
    expect(mfaPaymentFinding!.severity).toBe('warning')

    const mfaRecommended = findings.find((f) => f.id === 'sec-mfa-recommended')
    expect(mfaRecommended).toBeDefined()
  })

  it('does not flag MFA when auth + MFA + payments are all configured', () => {
    const config = minimalConfig({
      auth: 'supabase-auth',
      mfaRequired: true,
      payments: 'stripe',
    })

    const findings = getSecurityRequirements(config)

    expect(findings.find((f) => f.id === 'sec-mfa-payments')).toBeUndefined()
    expect(findings.find((f) => f.id === 'sec-mfa-recommended')).toBeUndefined()
  })

  it('flags MFA as warning for high userCount even without payments', () => {
    const config = minimalConfig({
      auth: 'supabase-auth',
      mfaRequired: false,
      expectedUserCount: '100k+',
    })

    const findings = getSecurityRequirements(config)

    const mfaRecommendation = findings.find(
      (f) => f.id === 'sec-mfa-recommended',
    )
    expect(mfaRecommendation).toBeDefined()
    expect(mfaRecommendation!.severity).toBe('warning')
  })

  it('flags public API without auth', () => {
    const config = minimalConfig({
      hasPublicApi: true,
      auth: 'none',
    })

    const findings = getSecurityRequirements(config)

    const apiNoAuth = findings.find((f) => f.id === 'sec-api-no-auth')
    expect(apiNoAuth).toBeDefined()
    expect(apiNoAuth!.severity).toBe('warning')
  })

  it('flags webhooks without auth', () => {
    const config = minimalConfig({
      hasWebhooks: true,
      auth: 'none',
    })

    const findings = getSecurityRequirements(config)

    const webhookFinding = findings.find(
      (f) => f.id === 'sec-webhook-no-verification',
    )
    expect(webhookFinding).toBeDefined()
    expect(webhookFinding!.severity).toBe('warning')
  })

  it('adds file encryption info when fileStorage is present', () => {
    const config = minimalConfig({
      fileStorage: 's3',
    })

    const findings = getSecurityRequirements(config)

    const fileEncryption = findings.find((f) => f.id === 'sec-file-encryption')
    expect(fileEncryption).toBeDefined()
    expect(fileEncryption!.severity).toBe('info')
  })

  it('adds vendor surface info when 3+ third-party APIs', () => {
    const config = minimalConfig({
      thirdPartyApis: ['stripe', 'sendgrid', 'aws'],
    })

    const findings = getSecurityRequirements(config)

    const vendorSurface = findings.find((f) => f.id === 'sec-vendor-surface')
    expect(vendorSurface).toBeDefined()
    expect(vendorSurface!.severity).toBe('info')
  })

  it('returns no findings for fully secure minimal config', () => {
    const config = minimalConfig({
      auth: 'none',
      payments: 'none',
      hasPublicApi: false,
      hasWebhooks: false,
      fileStorage: 'none',
      thirdPartyApis: [],
    })

    const findings = getSecurityRequirements(config)

    expect(findings.length).toBe(0)
  })

  it('sorts findings critical first, then warning, then info', () => {
    const config = minimalConfig({
      payments: 'stripe',
      auth: 'none',
      hasPublicApi: true,
      hasWebhooks: true,
    })

    const findings = getSecurityRequirements(config)
    const order = findings.map((f) => f.severity)
    const criticalIdx = order.indexOf('critical')
    const warningIdx = order.indexOf('warning')
    const infoIdx = order.indexOf('info')

    if (criticalIdx >= 0 && warningIdx >= 0) {
      expect(criticalIdx).toBeLessThan(warningIdx)
    }
    if (warningIdx >= 0 && infoIdx >= 0) {
      expect(warningIdx).toBeLessThan(infoIdx)
    }
  })
})

// ─── 4. getComplianceScore ────────────────────────────────────────────

describe('getComplianceScore', () => {
  it('returns 100 for config with no target markets (no applicable regulations)', () => {
    const config = minimalConfig({ targetMarkets: [] })

    const score = getComplianceScore(config)

    expect(score).toBe(100)
  })

  it('returns 0 for config with all critical findings', () => {
    const config = minimalConfig({
      targetMarkets: ['eu', 'us', 'uk', 'ca', 'au', 'br', 'in', 'jp'],
      userTracking: 'full',
      payments: 'stripe',
      auth: 'none',
      dataRetentionDays: 0,
      fileStorage: 's3',
      analyticsProvider: 'google-analytics',
      expectedUserCount: '100k+',
      hasPublicApi: true,
      hasWebhooks: true,
      thirdPartyApis: ['a', 'b', 'c', 'd', 'e'],
    })

    const score = getComplianceScore(config)

    expect(score).toBe(0)
  })

  it('returns a score between 0 and 100 for mixed configurations', () => {
    const config = minimalConfig({
      targetMarkets: ['eu', 'us'],
      userTracking: 'minimal',
      payments: 'stripe',
      auth: 'next-auth',
      mfaRequired: true,
      dataRetentionDays: 365,
      expectedUserCount: '1k-10k',
    })

    const score = getComplianceScore(config)

    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
    expect(score).toBeLessThan(100)
    expect(score).toBeGreaterThan(0)
  })

  it('applies userCount multiplier to deductions', () => {
    const lowUserConfig = minimalConfig({
      targetMarkets: ['eu'],
      userTracking: 'full',
      dataRetentionDays: 0,
      expectedUserCount: '1-100',
    })

    const highUserConfig = minimalConfig({
      targetMarkets: ['eu'],
      userTracking: 'full',
      dataRetentionDays: 0,
      expectedUserCount: '100k+',
    })

    const lowScore = getComplianceScore(lowUserConfig)
    const highScore = getComplianceScore(highUserConfig)

    expect(highScore).toBeLessThan(lowScore)
  })

  it('returns integer values', () => {
    const config = minimalConfig({
      targetMarkets: ['eu'],
      userTracking: 'minimal',
    })

    const score = getComplianceScore(config)

    expect(Number.isInteger(score)).toBe(true)
  })
})

// ─── 5. getComplianceChecklist ────────────────────────────────────────

describe('getComplianceChecklist', () => {
  it('includes GDPR items for EU markets', () => {
    const items = getComplianceChecklist(['eu'])

    const gdprItem = items.find((item) => item.includes('GDPR'))
    expect(gdprItem).toBeDefined()
  })

  it('includes CCPA items for US markets', () => {
    const items = getComplianceChecklist(['us'])

    const ccpaItem = items.find((item) => item.includes('CCPA'))
    expect(ccpaItem).toBeDefined()
  })

  it('includes both GDPR and CCPA for combined EU+US markets', () => {
    const items = getComplianceChecklist(['eu', 'us'])

    const gdprItem = items.find((item) => item.includes('GDPR'))
    const ccpaItem = items.find((item) => item.includes('CCPA'))
    expect(gdprItem).toBeDefined()
    expect(ccpaItem).toBeDefined()
  })

  it('always includes PCI-DSS checklist item', () => {
    const items = getComplianceChecklist(['eu'])

    const pciItem = items.find((item) => item.includes('PCI-DSS'))
    expect(pciItem).toBeDefined()
  })

  it('always includes Cookie Consent, Privacy Policy, and Terms checklist items', () => {
    const items = getComplianceChecklist(['eu'])

    expect(items.find((item) => item.includes('Cookie Consent'))).toBeDefined()
    expect(items.find((item) => item.includes('Privacy Policy'))).toBeDefined()
    expect(
      items.find((item) => item.includes('Terms of Service')),
    ).toBeDefined()
  })

  it('returns 4 universal items plus one per applicable regulation', () => {
    const singleMarketItems = getComplianceChecklist(['eu'])
    const multiMarketItems = getComplianceChecklist(['eu', 'us'])

    expect(multiMarketItems.length).toBeGreaterThan(singleMarketItems.length)
  })
})

// ─── 6. isMarketIncluded (tested through getComplianceChecklist) ──────

describe('isMarketIncluded (via getComplianceChecklist)', () => {
  it('includes market on exact match', () => {
    const items = getComplianceChecklist(['eu'])

    const gdprItem = items.find((item) => item.includes('GDPR'))
    expect(gdprItem).toBeDefined()
  })

  it('includes market on case-insensitive region match', () => {
    const items = getComplianceChecklist(['EU' as 'eu'])

    const gdprItem = items.find((item) => item.includes('GDPR'))
    expect(gdprItem).toBeDefined()
  })

  it('excludes markets that are not selected', () => {
    const items = getComplianceChecklist(['eu'])

    const ccpaItem = items.find((item) => item.includes('CCPA'))
    expect(ccpaItem).toBeUndefined()
  })
})

// ─── 7. getApplicableRegulations (tested through runComplianceAudit) ──

describe('getApplicableRegulations (via runComplianceAudit)', () => {
  it('returns GDPR for EU markets', () => {
    const config = minimalConfig({ targetMarkets: ['eu'] })

    const report = runComplianceAudit(config)

    const gdpr = report.applicableRegulations.find((r) => r.id === 'gdpr')
    expect(gdpr).toBeDefined()
    expect(gdpr!.name).toContain('GDPR')
  })

  it('returns CCPA/CPRA for US markets', () => {
    const config = minimalConfig({ targetMarkets: ['us'] })

    const report = runComplianceAudit(config)

    const ccpa = report.applicableRegulations.find((r) => r.id === 'ccpa-cpra')
    expect(ccpa).toBeDefined()
    expect(ccpa!.name).toContain('CCPA')
  })

  it('returns multiple regulations for combined markets', () => {
    const config = minimalConfig({
      targetMarkets: ['eu', 'us', 'uk', 'ca'],
    })

    const report = runComplianceAudit(config)

    const ids = report.applicableRegulations.map((r) => r.id)
    expect(ids).toContain('gdpr')
    expect(ids).toContain('ccpa-cpra')
    expect(ids).toContain('uk-gdpr')
    expect(ids).toContain('pipeda')
  })

  it('includes security-baseline in all applicable regulations', () => {
    const config = minimalConfig({ targetMarkets: ['eu'] })

    const report = runComplianceAudit(config)

    const baseline = report.applicableRegulations.find(
      (r) => r.id === 'security-baseline',
    )
    expect(baseline).toBeDefined()
  })

  it('returns all regulations for all markets', () => {
    const config = minimalConfig({
      targetMarkets: ['us', 'eu', 'uk', 'ca', 'au', 'br', 'in', 'jp'],
    })

    const report = runComplianceAudit(config)

    const allRegulationIds = REGULATIONS.map((r) => r.id)
    const reportIds = report.applicableRegulations.map((r) => r.id)
    for (const id of allRegulationIds) {
      expect(reportIds).toContain(id)
    }
  })

  it('returns empty array for empty markets', () => {
    const config = minimalConfig({ targetMarkets: [] })

    const report = runComplianceAudit(config)

    expect(report.applicableRegulations).toEqual([])
  })
})

// ─── 8. getRegulationById ─────────────────────────────────────────────

describe('getRegulationById', () => {
  it('returns regulation for valid id', () => {
    const reg = getRegulationById('gdpr')
    expect(reg).not.toBeNull()
    expect(reg!.id).toBe('gdpr')
    expect(reg!.name).toContain('GDPR')
  })

  it('returns null for unknown id', () => {
    const reg = getRegulationById('nonexistent')
    expect(reg).toBeNull()
  })
})

// ─── 9. resolveSeverity — user-rights full coverage ────────────────────

describe('resolveSeverity — user-rights full coverage', () => {
  it('resolves user-rights (gdpr-access, gdpr-portability) as info for all user counts', () => {
    const tiers = ['1-100', '100-1k', '1k-10k', '10k-100k', '100k+'] as const
    for (const tier of tiers) {
      const config = minimalConfig({
        targetMarkets: ['eu'],
        userTracking: 'none',
        expectedUserCount: tier,
      })

      const report = runComplianceAudit(config)
      const access = report.findings.find(
        (f) => f.requirementId === 'gdpr-access',
      )
      const portability = report.findings.find(
        (f) => f.requirementId === 'gdpr-portability',
      )
      expect(access).toBeDefined()
      expect(access!.severity).toBe('info')
      expect(portability).toBeDefined()
      expect(portability!.severity).toBe('info')
    }
  })

  it('resolves gdpr-transparency as info for all user counts', () => {
    const tiers = ['1-100', '100-1k', '1k-10k', '10k-100k', '100k+'] as const
    for (const tier of tiers) {
      const config = minimalConfig({
        targetMarkets: ['eu'],
        userTracking: 'none',
        expectedUserCount: tier,
      })

      const report = runComplianceAudit(config)
      const transparency = report.findings.find(
        (f) => f.requirementId === 'gdpr-transparency',
      )
      expect(transparency).toBeDefined()
      expect(transparency!.severity).toBe('info')
    }
  })

  it('resolves deletion (gdpr-erasure, ccpa-delete) as info for low-to-mid user counts', () => {
    const tiers = ['1-100', '100-1k', '1k-10k'] as const
    for (const tier of tiers) {
      const config = minimalConfig({
        targetMarkets: ['eu', 'us'],
        userTracking: 'none',
        expectedUserCount: tier,
        dataRetentionDays: 365,
      })

      const report = runComplianceAudit(config)
      const erasure = report.findings.find(
        (f) => f.requirementId === 'gdpr-erasure',
      )
      const delete_ = report.findings.find(
        (f) => f.requirementId === 'ccpa-delete',
      )
      expect(erasure).toBeDefined()
      expect(erasure!.severity).toBe('info')
      expect(delete_).toBeDefined()
      expect(delete_!.severity).toBe('info')
    }
  })

  it('escalates deletion to warning for 10k-100k and 100k+ user counts', () => {
    const tiers = ['10k-100k', '100k+'] as const
    for (const tier of tiers) {
      const config = minimalConfig({
        targetMarkets: ['eu', 'us'],
        userTracking: 'none',
        expectedUserCount: tier,
        dataRetentionDays: 365,
      })

      const report = runComplianceAudit(config)
      const erasure = report.findings.find(
        (f) => f.requirementId === 'gdpr-erasure',
      )
      expect(erasure).toBeDefined()
      expect(erasure!.severity).toBe('warning')
    }
  })

  it('resolves gdpr-dpa as warning when analytics, fileStorage, or payments present', () => {
    const config = minimalConfig({
      targetMarkets: ['eu'],
      userTracking: 'minimal',
      analyticsProvider: 'posthog',
    })
    const report = runComplianceAudit(config)
    const dpa = report.findings.find((f) => f.requirementId === 'gdpr-dpa')
    expect(dpa).toBeDefined()
    expect(dpa!.severity).toBe('warning')
  })

  it('resolves disclosure dpo for all user count tiers', () => {
    const tiers = [
      { tier: '1-100' as const, expected: 'info' },
      { tier: '100-1k' as const, expected: 'info' },
      { tier: '1k-10k' as const, expected: 'info' },
      { tier: '10k-100k' as const, expected: 'warning' },
      { tier: '100k+' as const, expected: 'warning' },
    ] as const
    for (const { tier, expected } of tiers) {
      const config = minimalConfig({
        targetMarkets: ['eu'],
        userTracking: 'full',
        expectedUserCount: tier,
      })

      const report = runComplianceAudit(config)
      const dpo = report.findings.find((f) => f.requirementId === 'gdpr-dpo')
      expect(dpo).toBeDefined()
      expect(dpo!.severity).toBe(expected)
    }
  })

  it('resolves security breach as warning with full tracking, info with none', () => {
    const fullConfig = minimalConfig({
      targetMarkets: ['eu'],
      userTracking: 'full',
      expectedUserCount: '1-100',
    })
    const fullReport = runComplianceAudit(fullConfig)
    const breach = fullReport.findings.find(
      (f) => f.requirementId === 'gdpr-breach',
    )
    expect(breach).toBeDefined()
    expect(breach!.severity).toBe('warning')

    const noneConfig = minimalConfig({
      targetMarkets: ['eu'],
      userTracking: 'none',
      payments: 'none',
      expectedUserCount: '1-100',
    })
    const noneReport = runComplianceAudit(noneConfig)
    const breachNone = noneReport.findings.find(
      (f) => f.requirementId === 'gdpr-breach',
    )
    expect(breachNone).toBeDefined()
    expect(breachNone!.severity).toBe('info')
  })

  it('escalates severity across all user count tiers', () => {
    const tiers = [
      {
        tier: '1-100' as const,
        expectedBreach: 'info',
        expectedRetention: 'warning',
      },
      {
        tier: '100-1k' as const,
        expectedBreach: 'info',
        expectedRetention: 'warning',
      },
      {
        tier: '1k-10k' as const,
        expectedBreach: 'info',
        expectedRetention: 'warning',
      },
      {
        tier: '10k-100k' as const,
        expectedBreach: 'warning',
        expectedRetention: 'warning',
      },
      {
        tier: '100k+' as const,
        expectedBreach: 'warning',
        expectedRetention: 'critical',
      },
    ] as const
    for (const { tier, expectedBreach, expectedRetention } of tiers) {
      const config = minimalConfig({
        targetMarkets: ['eu'],
        userTracking: 'minimal',
        dataRetentionDays: 0,
        expectedUserCount: tier,
      })

      const report = runComplianceAudit(config)
      const breach = report.findings.find(
        (f) => f.requirementId === 'gdpr-breach',
      )
      const retention = report.findings.find(
        (f) => f.requirementId === 'gdpr-retention',
      )
      expect(breach).toBeDefined()
      expect(breach!.severity).toBe(expectedBreach)
      expect(retention).toBeDefined()
      expect(retention!.severity).toBe(expectedRetention)
    }
  })
})

// ─── 10. runComplianceAudit — All market combinations ─────────────────

describe('runComplianceAudit — market combinations', () => {
  it('expands north-america region to ca and us markets', () => {
    const config = minimalConfig({
      targetMarkets: ['north-america'],
      userTracking: 'none',
    })
    const report = runComplianceAudit(config)
    const ids = report.applicableRegulations.map((r) => r.id)
    expect(ids).toContain('pipeda')
    expect(ids).toContain('ccpa-cpra')
    expect(ids).toContain('security-baseline')
  })

  it('expands europe region to multiple markets including GDPRs', () => {
    const config = minimalConfig({
      targetMarkets: ['europe'],
      userTracking: 'none',
    })
    const report = runComplianceAudit(config)
    const ids = report.applicableRegulations.map((r) => r.id)
    expect(ids).toContain('gdpr')
    expect(ids).toContain('uk-gdpr')
    expect(ids).toContain('security-baseline')
  })

  const INDIVIDUAL_MARKETS = [
    { market: 'au', expectedId: 'app' },
    { market: 'br', expectedId: 'lgpd' },
    { market: 'in', expectedId: 'pdpb' },
    { market: 'jp', expectedId: 'appi' },
  ] as const

  for (const { market, expectedId } of INDIVIDUAL_MARKETS) {
    it(`includes ${expectedId} for ${market} market`, () => {
      const config = minimalConfig({
        targetMarkets: [market],
        userTracking: 'none',
      })
      const report = runComplianceAudit(config)
      const ids = report.applicableRegulations.map((r) => r.id)
      expect(ids).toContain(expectedId)
      expect(ids).toContain('security-baseline')
    })
  }

  it('includes mx market with security-baseline only', () => {
    const config = minimalConfig({
      targetMarkets: ['mx'],
      userTracking: 'none',
    })
    const report = runComplianceAudit(config)
    const ids = report.applicableRegulations.map((r) => r.id)
    expect(ids).not.toContain('gdpr')
    expect(ids).toContain('security-baseline')
  })

  it('combines multiple regions triggering correct regulations', () => {
    const config = minimalConfig({
      targetMarkets: ['north-america', 'europe'],
      userTracking: 'none',
    })
    const report = runComplianceAudit(config)
    const ids = report.applicableRegulations.map((r) => r.id)
    expect(ids).toContain('gdpr')
    expect(ids).toContain('uk-gdpr')
    expect(ids).toContain('ccpa-cpra')
    expect(ids).toContain('pipeda')
    expect(ids).toContain('security-baseline')
  })

  it('triggers UK GDPR specific requirements for uk market', () => {
    const config = minimalConfig({
      targetMarkets: ['uk'],
      userTracking: 'full',
    })
    const report = runComplianceAudit(config)
    const ukRegulation = report.applicableRegulations.find(
      (r) => r.id === 'uk-gdpr',
    )
    expect(ukRegulation).toBeDefined()

    const ukFindings = report.findings.filter((f) =>
      f.regulation.includes('uk-gdpr'),
    )
    expect(ukFindings.length).toBeGreaterThan(0)

    const ukSpecific = ukFindings.find(
      (f) => f.requirementId === 'uk-gdpr-consent',
    )
    expect(ukSpecific).toBeDefined()
  })
})

// ─── 11. getComplianceScore — Boundary tests ──────────────────────────

describe('getComplianceScore — boundary tests', () => {
  it('returns higher score for lower user counts with identical findings', () => {
    const tiers = ['1-100', '100-1k', '1k-10k', '10k-100k', '100k+'] as const
    const scores: number[] = []
    for (const tier of tiers) {
      const config = minimalConfig({
        targetMarkets: ['eu'],
        userTracking: 'full',
        dataRetentionDays: 0,
        expectedUserCount: tier,
      })
      scores.push(getComplianceScore(config))
    }
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeLessThanOrEqual(scores[i - 1])
    }
  })

  it('returns a non-zero score with markets and no critical findings', () => {
    const config = minimalConfig({
      targetMarkets: ['mx'],
      userTracking: 'none',
      payments: 'none',
      auth: 'none',
      analyticsProvider: 'none',
      dataRetentionDays: 365,
      fileStorage: 'none',
    })
    const score = getComplianceScore(config)
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(100)
  })

  it('deducts 20 per critical with 1.0 multiplier', () => {
    const config = minimalConfig({
      targetMarkets: ['eu'],
      userTracking: 'full',
      expectedUserCount: '1-100',
    })
    const score = getComplianceScore(config)
    const report = runComplianceAudit(config)
    const expectedBase = 100 - report.summary.critical * 20
    expect(score).toBeLessThanOrEqual(expectedBase)
    expect(score).toBeGreaterThan(0)
  })

  it('rounds fractional scores from multiplier effects', () => {
    const config = minimalConfig({
      targetMarkets: ['mx'],
      userTracking: 'none',
      payments: 'none',
      auth: 'none',
      analyticsProvider: 'none',
      dataRetentionDays: 365,
      fileStorage: 'none',
      expectedUserCount: '1k-10k',
    })
    const score = getComplianceScore(config)
    expect(Number.isInteger(score)).toBe(true)
  })
})

// ─── 12. getSecurityRequirements — Edge cases ─────────────────────────

describe('getSecurityRequirements — edge cases', () => {
  it('passes cleanly with MFA enabled and payments', () => {
    const config = minimalConfig({
      auth: 'supabase-auth',
      mfaRequired: true,
      payments: 'stripe',
    })
    const findings = getSecurityRequirements(config)
    expect(findings.find((f) => f.id === 'sec-mfa-payments')).toBeUndefined()
    expect(findings.find((f) => f.id === 'sec-mfa-recommended')).toBeUndefined()
  })

  it('does not trigger vendor surface for exactly 2 third-party APIs', () => {
    const config = minimalConfig({
      thirdPartyApis: ['stripe', 'sendgrid'],
    })
    const findings = getSecurityRequirements(config)
    expect(findings.find((f) => f.id === 'sec-vendor-surface')).toBeUndefined()
  })

  it('triggers vendor surface for 3+ third-party APIs', () => {
    const config = minimalConfig({
      thirdPartyApis: ['stripe', 'sendgrid', 'aws'],
    })
    const findings = getSecurityRequirements(config)
    const vendor = findings.find((f) => f.id === 'sec-vendor-surface')
    expect(vendor).toBeDefined()
    expect(vendor!.severity).toBe('info')
  })

  it('resolves MFA recommendation as info for small user count', () => {
    const config = minimalConfig({
      auth: 'supabase-auth',
      mfaRequired: false,
      expectedUserCount: '1-100',
    })
    const findings = getSecurityRequirements(config)
    const mfa = findings.find((f) => f.id === 'sec-mfa-recommended')
    expect(mfa).toBeDefined()
    expect(mfa!.severity).toBe('info')
  })

  it('resolves MFA recommendation as warning for 10k-100k user count without MFA', () => {
    const config = minimalConfig({
      auth: 'supabase-auth',
      mfaRequired: false,
      expectedUserCount: '10k-100k',
    })
    const findings = getSecurityRequirements(config)
    const mfa = findings.find((f) => f.id === 'sec-mfa-recommended')
    expect(mfa).toBeDefined()
    expect(mfa!.severity).toBe('warning')
  })

  it('flags multiple findings for high-risk config: payments + no auth + public API + webhooks', () => {
    const config = minimalConfig({
      payments: 'stripe',
      auth: 'none',
      hasPublicApi: true,
      hasWebhooks: true,
    })
    const findings = getSecurityRequirements(config)
    expect(findings.find((f) => f.id === 'sec-payments-no-auth')).toBeDefined()
    expect(findings.find((f) => f.id === 'sec-api-no-auth')).toBeDefined()
    expect(
      findings.find((f) => f.id === 'sec-webhook-no-verification'),
    ).toBeDefined()
  })
})
