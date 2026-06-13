import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'
import { REGIONS } from '../../types'

export function generateComplianceFiles(config: BootConfig): GeneratedFile[] {
  const { targetMarkets, userTracking, dataRetentionDays, analyticsProvider } =
    config

  const hasGdpr = targetMarkets.some((m) => m === 'eu')
  const hasUkGdpr = targetMarkets.some((m) => m === 'uk')
  const hasPipeda = targetMarkets.includes('ca')
  const hasLgpd = targetMarkets.includes('br')
  const hasCcpa = targetMarkets.includes('us')
  const hasApp = targetMarkets.includes('au')
  const hasPdpa = targetMarkets.includes('ar')
  const hasLey1581 = targetMarkets.includes('co')
  const hasLfpdp = targetMarkets.includes('mx')
  const hasLey19628 = targetMarkets.includes('cl')
  const hasAppi = targetMarkets.includes('jp')
  const hasPipa = targetMarkets.includes('kr')
  const hasSgPdpa = targetMarkets.includes('sg')
  const hasPipl = targetMarkets.includes('cn')
  const hasPopia = targetMarkets.includes('za')
  const hasUaePdpl = targetMarkets.includes('ae')
  const hasKeDpa = targetMarkets.includes('ke')
  const hasNdpr = targetMarkets.includes('ng')
  const hasPdpb = targetMarkets.includes('in')

  const regulations = [
    ...(hasGdpr ? ['GDPR (EU General Data Protection Regulation)'] : []),
    ...(hasUkGdpr ? ['UK GDPR (United Kingdom)'] : []),
    ...(hasPipeda ? ['PIPEDA (Canada)'] : []),
    ...(hasLgpd ? ['LGPD (Brazil)'] : []),
    ...(hasCcpa ? ['CCPA/CPRA (California, US)'] : []),
    ...(hasApp ? ['APP / Privacy Act 1988 (Australia)'] : []),
    ...(hasPdpa ? ['PDPA / Law 25.326 (Argentina)'] : []),
    ...(hasLey1581 ? ['Law 1581 of 2012 (Colombia)'] : []),
    ...(hasLfpdp ? ['LFPDPPP (Mexico)'] : []),
    ...(hasLey19628 ? ['Law 19.628 (Chile)'] : []),
    ...(hasAppi ? ['APPI (Japan)'] : []),
    ...(hasPipa ? ['PIPA (South Korea)'] : []),
    ...(hasSgPdpa ? ['PDPA (Singapore)'] : []),
    ...(hasPipl ? ['PIPL (China)'] : []),
    ...(hasPopia ? ['POPIA (South Africa)'] : []),
    ...(hasUaePdpl ? ['PDPL (United Arab Emirates)'] : []),
    ...(hasKeDpa ? ['Data Protection Act 2019 (Kenya)'] : []),
    ...(hasNdpr ? ['NDPR (Nigeria)'] : []),
    ...(hasPdpb ? ['PDPB (India)'] : []),
  ]

  const trackingLevels: Record<string, string> = {
    none: 'No user tracking is enabled.',
    minimal: 'Anonymous page views only — no cookies or PII collected.',
    analytics:
      'Anonymous analytics with first-party cookies — no cross-site tracking.',
    full: 'Full user analytics with identified sessions, heatmaps, and event tracking.',
  }

  const complianceMdx: GeneratedFile = {
    path: 'docs/COMPLIANCE.md',
    content: `# Compliance

This document summarizes applicable regulations and compliance requirements for ${config.projectName}.

## Applicable Regulations

${regulations.map((r) => `- **${r}**`).join('\n') || '- No specific regulations identified.'}

## Key Requirements

${
  hasGdpr
    ? `### GDPR
- Obtain explicit consent before collecting personal data
- Provide a mechanism for data subject access requests (DSARs)
- Maintain a record of processing activities
- Implement data breach notification within 72 hours
- Appoint a Data Protection Officer if processing sensitive data at scale
- Data retention period: ${String(dataRetentionDays)} days
`
    : ''
}
${
  hasCcpa
    ? `### CCPA/CPRA
- Disclose categories of personal information collected
- Provide opt-out mechanism for sale/sharing of personal data
- Honor consumer deletion and correction requests
- Limit use of sensitive personal information
`
    : ''
}
${
  hasPipeda
    ? `### PIPEDA
- Obtain meaningful consent for collection, use, and disclosure
- Limit collection to purposes identified
- Implement data accuracy and safeguard measures
- Provide individuals access to their personal information
`
    : ''
}
${
  hasLgpd
    ? `### LGPD
- Appoint a Data Protection Officer (DPO)
- Maintain records of processing activities
- Conduct data protection impact assessments for high-risk processing
- Notify ANPD and data subjects of breaches
`
    : ''
}
${
  hasUkGdpr
    ? `### UK GDPR
- Substantively identical to EU GDPR, enforced by the ICO under the Data Protection Act 2018
- Appoint a UK representative if based outside the UK
- Maintain records of processing activities
- Report breaches to the ICO within 72 hours
- Conduct Data Protection Impact Assessments (DPIAs) for high-risk processing
`
    : ''
}
${
  hasApp
    ? `### APP / Privacy Act 1988 (Australia)
- 13 Australian Privacy Principles governing collection, use, and disclosure
- Notify individuals of collection and purpose
- Maintain data quality and security safeguards
- Provide access and correction rights
- Notify OAIC and affected individuals of eligible data breaches
`
    : ''
}
${
  hasPdpa
    ? `### PDPA / Law 25.326 (Argentina)
- Recognized as adequate by the EU
- Obtain consent for data collection and processing
- Register databases with the DPA (AAIP)
- Provide data subject access, rectification, and deletion rights
- Notify the AAIP of security breaches
`
    : ''
}
${
  hasLey1581
    ? `### Law 1581 of 2012 (Colombia)
- GDPR-like framework enforced by the SIC
- Obtain prior, informed consent for data processing
- Register databases with the National Database Registry (RNBD)
- Implement data security policies and procedures
- Notify the SIC of security incidents involving personal data
`
    : ''
}
${
  hasLfpdp
    ? `### LFPDPPP (Mexico)
- Comprehensive GDPR-like law with ARCO rights (Access, Rectification, Cancellation, Opposition)
- Obtain consent for processing personal data
- Publish a privacy notice describing data practices
- Implement physical, technical, and administrative security measures
- Notify the INAI and data subjects of security breaches
`
    : ''
}
${
  hasLey19628
    ? `### Law 19.628 (Chile)
- Protection of private life / personal data
- Obtain consent for data processing (explicit for sensitive data)
- Maintain data quality and security measures
- Provide access, rectification, and cancellation rights
- Undergoing reform to align with GDPR standards (Chilean Data Protection Bill)
`
    : ''
}

## Current Configuration

- User tracking level: **${userTracking}** — ${trackingLevels[userTracking]}
- Data retention: **${String(dataRetentionDays)} days**
- Analytics provider: **${analyticsProvider}**
- Markets: ${targetMarkets.join(', ')}
`,
  }

  const securityMdx: GeneratedFile = {
    path: 'docs/SECURITY.md',
    content: `# Security Baseline

This document outlines the security baseline for ${config.projectName}.

## Checklist

- [x] Authentication configured (${config.auth})
- [${config.totpEnabled ? 'x' : ' '}] ${config.totpEnabled ? 'MFA enforced via TOTP' : 'MFA recommended but not enforced'}
- [x] HTTPS enforced in production
- [${config.securityHeaders ? 'x' : ' '}] CSP headers configured (recommended for security profile)
- [x] Environment variables never committed to repository
- [ ] API keys and secrets rotated regularly
- [ ] Dependencies scanned via \`npm audit\` in CI
- [${config.inputSanitization ? 'x' : ' '}] SQL injection prevention via parameterized queries
- [${config.corsEnabled ? 'x' : ' '}] CORS configured for allowed origins
- [${config.rateLimiting !== 'none' ? 'x' : ' '}] Rate limiting on public API endpoints${config.hasPublicApi ? ' (public API enabled)' : ''}
- [${config.hasWebhooks ? 'x' : ' '}] Webhook signature verification${config.hasWebhooks ? ' (webhooks enabled)' : ''}
- [${config.fileValidation ? 'x' : ' '}] File upload validation${config.fileStorage !== 'none' ? ' (storage enabled)' : ''}
- [${config.payments === 'stripe' ? 'x' : ' '}] PCI-DSS scope minimized ${config.payments !== 'none' ? '(payments enabled — use hosted checkout)' : ''}

## Content Security Policy

The generated CSP includes \`'unsafe-inline'\` and \`'unsafe-eval'\` which are required by Next.js during development (Turbopack injects inline scripts for hot module reloading). For production, harden the CSP by:
1. Generating nonces for inline scripts using Next.js \`experimental.serverActions.allowedForwardedHosts\` or a custom middleware
2. Removing \`'unsafe-inline'\` and \`'unsafe-eval'\` after verifying all scripts use nonces
3. Move theme-detection inline script to an external file loaded via Next.js \`<Script>\` component with nonce

## Environment Variables

All secrets and API keys are stored in environment variables. A \`.env.example\` file documents required values without exposing secrets. Never commit \`.env\` files.

## Dependency Management

Run \`npm audit\` regularly and keep dependencies up to date. Configure Dependabot or Renovate for automated updates.
`,
  }

  const expandedMarketsForPrivacy = targetMarkets.flatMap(
    (m) => REGIONS[m]?.markets ?? [m],
  )
  const hasGdprExpanded = expandedMarketsForPrivacy.some((m) =>
    ['eu', 'uk', 'no', 'ch', 'is'].includes(m),
  )

  const privacyMdx: GeneratedFile = {
    path: 'docs/PRIVACY.md',
    content: `# Privacy Policy

_Last updated: ${new Date().toISOString().split('T')[0]}_

## Information We Collect

${
  userTracking === 'none'
    ? 'We do not collect any personal data or tracking information.'
    : `We collect the following information:
- **Account data**: email address, name (when provided)
- **Usage data**: ${userTracking === 'minimal' ? 'anonymous page views' : userTracking === 'analytics' ? 'interaction events and session analytics' : 'full session recordings, heatmaps, and event tracking'}
- **Analytics**: via ${analyticsProvider}${analyticsProvider === 'none' ? '' : ' (privacy-first)'}`
}

## How We Use Your Information

- To provide and maintain our service
- To communicate about your account and our service
- To improve our product through analytics

## Data Retention

We retain your personal data for **${String(dataRetentionDays)} days** after your last interaction, or as long as required by applicable law.

## Your Rights

${hasGdpr ? '### EU/EEA (GDPR)\n- Access, rectify, or delete your data\n- Data portability\n- Restrict or object to processing\n- Withdraw consent at any time\n\n' : ''}${hasUkGdpr ? "### United Kingdom (UK GDPR)\n- Access, rectify, or delete your data\n- Data portability\n- Restrict or object to processing\n- Withdraw consent at any time\n- Complain to the ICO (Information Commissioner's Office)\n\n" : ''}${hasCcpa ? '### California, US (CCPA/CPRA)\n- Know what personal information is collected\n- Delete personal information\n- Opt out of sale/sharing\n- Non-discrimination for exercising rights\n\n' : ''}${hasPipeda ? '### Canada (PIPEDA)\n- Access your personal information\n- Challenge accuracy and completeness\n\n' : ''}${hasLgpd ? '### Brazil (LGPD)\n- Confirm existence of processing\n- Access, correct, or anonymize data\n- Data portability\n- Revoke consent\n\n' : ''}${hasApp ? '### Australia (Privacy Act/APP)\n- Access your personal information\n- Correct inaccurate information\n- Complain to the OAIC\n\n' : ''}${hasPdpa ? '### Argentina (PDPA)\n- Access, rectify, update, or delete your data\n- Withdraw consent\n- Right to be informed\n\n' : ''}${hasLey1581 ? '### Colombia (Law 1581)\n- Access, update, and correct your data\n- Request proof of authorization\n- Revoke consent and request deletion\n\n' : ''}${hasLfpdp ? '### Mexico (LFPDPPP)\n- ARCO rights: Access, Rectification, Cancellation, Opposition\n- Withdraw consent\n- Limit use and disclosure\n\n' : ''}${hasLey19628 ? '### Chile (Law 19.628)\n- Access, rectify, cancel, or block your data\n- Object to processing\n- Withdraw consent\n\n' : ''}
${
  hasGdprExpanded
    ? `
## GDPR Compliance

- **Data Protection Officer**: Contact our DPO at dpo@${config.projectName}.com
- **Supervisory Authority**: You have the right to lodge a complaint with your local data protection supervisory authority within the EU/EEA
- **Article 30 Records**: We maintain a record of processing activities as required under Article 30 of the GDPR
- **Cross-Border Transfers**: Personal data transferred outside the EEA is protected by Standard Contractual Clauses (SCCs) and supplementary measures where required
- **Legal Basis**: We process personal data based on consent, contractual necessity, legitimate interest, or legal obligation`
    : ''
}
${
  hasCcpa
    ? `
## CCPA/CPRA Disclosures

- **Categories of Personal Information Collected**: Identifiers (name, email), commercial information, internet activity, and inferences drawn from the above
- **Do Not Sell or Share My Personal Information**: We do not sell personal information. You may exercise your right to opt out of sharing at any time via our [Do Not Sell or Share My Personal Information](https://${config.projectName}.com/do-not-sell) page
- **Authorized Agent**: You may designate an authorized agent to submit requests on your behalf. We will require written proof of authorization before processing such requests
- **Non-Discrimination**: We will not discriminate against you for exercising your rights under the CCPA/CPRA`
    : ''
}
${
  hasPipeda
    ? `
## PIPEDA Compliance

- **Office of the Privacy Commissioner (OPC)**: If you are not satisfied with our response to a privacy concern, you may contact the Office of the Privacy Commissioner of Canada at [www.priv.gc.ca](https://www.priv.gc.ca) or 1-800-282-1376
- **Challenging Compliance**: You have the right to challenge our compliance with PIPEDA and to file a complaint with the OPC`
    : ''
}

To exercise your rights, contact us at privacy@${config.projectName}.com.
`,
  }

  const retentionMdx: GeneratedFile = {
    path: 'docs/DATA_RETENTION.md',
    content: `# Data Retention Policy

## Policy

Data retention period: **${String(dataRetentionDays)} days**.

## Data Categories and Retention

| Category | Retention Period | Justification |
|----------|-----------------|---------------|
| User accounts | Last login + ${String(dataRetentionDays)} days | Service provision |
| Session data | 30 days | Security and debugging |
| Analytics data | ${String(dataRetentionDays)} days | Product improvement |
| Email logs | 90 days | Deliverability monitoring |
| Billing records | 7 years | ${config.payments !== 'none' ? 'Tax and financial regulations' : 'Legal compliance'} |
| ${config.fileStorage !== 'none' ? `Uploaded files | ${String(dataRetentionDays)} days | Service provision` : ''} |

## Automated Data Lifecycle

- Daily cron job purges records older than the retention period
- Soft-deletion with 30-day grace period before permanent removal
- Backup retention: 30 days with encrypted snapshots

## Data Subject Deletion Requests

Upon verified request, all personal data is deleted within 30 days. Anonymized analytics aggregates may be retained.
`,
  }

  return [complianceMdx, securityMdx, privacyMdx, retentionMdx]
}

export function generateCookieConsent(config: BootConfig): GeneratedFile[] {
  const { targetMarkets, userTracking } = config

  const expandedMarkets = targetMarkets.flatMap(
    (m) => REGIONS[m]?.markets ?? [m],
  )

  const needsConsent =
    (userTracking === 'minimal' ||
      userTracking === 'analytics' ||
      userTracking === 'full') &&
    expandedMarkets.some((m) =>
      ['eu', 'uk', 'us', 'no', 'ch', 'is'].includes(m),
    )

  if (!needsConsent) return []

  const hasGdpr = expandedMarkets.some((m) =>
    ['eu', 'uk', 'no', 'ch', 'is'].includes(m),
  )

  if (userTracking === 'minimal') {
    return [
      {
        path: 'components/privacy-notice.tsx',
        content: `"use client";

import { useState, useEffect } from "react";
import { Card, Text, Button } from "azimuth-ui";

export function PrivacyNotice() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("privacy-notice-dismissed");
    if (stored) setDismissed(true);
  }, []);

  function dismiss() {
    localStorage.setItem("privacy-notice-dismissed", "true");
    setDismissed(true);
  }

  if (dismissed) return null;

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999, padding: "1rem" }}>
      <Card style={{ maxWidth: 640, margin: "0 auto" }}>
        <Text element={{ size: "sm" }}>
          We use privacy-first analytics (Plausible) that do not use cookies or collect personal data.${
            hasGdpr
              ? ' No consent is required under GDPR for these privacy-preserving measurements.'
              : ''
          }
        </Text>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <Button variant="primary" size="sm" onClick={dismiss}>Got it</Button>
        </div>
      </Card>
    </div>
  );
}
`,
      },
    ]
  }

  const consentType = hasGdpr ? 'opt-in' : 'opt-out'

  const generatedConsentText = hasGdpr
    ? 'We use cookies and similar technologies to analyze traffic and improve your experience. Essential cookies are always active. Analytics cookies require your consent.'
    : 'We use analytics cookies to understand how you use our site. You can choose to accept or decline them.'

  const generatedButtons =
    consentType === 'opt-in'
      ? `<Button variant="secondary" onClick={reject}>Decline All</Button>
            <Button variant="primary" onClick={accept}>Accept All</Button>`
      : `<Button variant="secondary" onClick={reject}>Decline</Button>
            <Button variant="primary" onClick={accept}>Accept</Button>`

  return [
    {
      path: 'components/cookie-consent-banner.tsx',

      content: `"use client";

import { useEffect, useState } from "react";
import { Button, Card, Text, Stack } from "azimuth-ui";

type ConsentChoice = "accepted" | "rejected" | null;
const STORAGE_KEY = "cookie-consent";

export function CookieConsentBanner() {
  const [consent, setConsent] = useState<ConsentChoice>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentChoice | null;
    if (!stored) setVisible(true);
    else setConsent(stored);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setConsent("accepted");
    setVisible(false);
  }

  function reject() {
    localStorage.setItem(STORAGE_KEY, "rejected");
    setConsent("rejected");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: "1rem",
      }}
    >
      <Card
        style={{
          maxWidth: 640,
          margin: "0 auto",
          boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
        }}
      >
        <Stack spacing="md">
          <Stack spacing="xs">
            <Text element={{ as: "h3", size: "h4" }} weight="semibold">
              Cookie Consent
            </Text>
            <Text element={{ size: "sm" }} color="secondary">
              ${generatedConsentText}
            </Text>
          </Stack>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            ${generatedButtons}
          </div>
        </Stack>
      </Card>
    </div>
  );
}
`,
    },
  ]
}

export function generateSecurityTxt(config: BootConfig): GeneratedFile[] {
  return [
    {
      path: 'public/.well-known/security.txt',
      content: `# Security Contact
Contact: mailto:security@${config.projectName}.com
Encryption: https://${config.projectName}.com/.well-known/pgp-key.txt

# Disclosure Policy
Policy: https://${config.projectName}.com/security.txt

# Timeline
Preferred-Languages: en
Canonical: https://${config.projectName}.com/.well-known/security.txt
Expires: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}

# Acknowledgments
# We thank the security researchers who responsibly disclose vulnerabilities.
`,
    },
  ]
}
