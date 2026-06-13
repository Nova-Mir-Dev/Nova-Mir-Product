import type { BootConfig } from '../../types'
import type { GeneratedFile, GeneratorResult } from './types'
import { generateCommonFiles, generateAppConfig } from './common-files'
import { generateFrameworkFiles } from './frameworks'
import { generateSetupWizard } from './setup-wizard'
import { generateSetupCli } from './setup-cli'
import { generateSetupLauncher } from './setup-launcher'
import { generateCleanupSetup } from './cleanup-setup'
import { generateDatabaseFiles } from './database'
import {
  generateAuthFiles,
  generateAuthRbac,
  generateAuthMfa,
  generateAuthPasskeys,
} from './auth'
import { generatePaymentFiles } from './payment'
import { generateStorageFiles } from './storage'
import { generateEmailFiles } from './email'
import {
  generateMonitoringFiles,
  generateAxiomIntegration,
  generateAuditLogging,
} from './monitoring'
import { generateCiFiles, generateDependabotConfig } from './ci'
import { generateCommunicationFiles } from './communication'
import {
  generateComplianceFiles,
  generateCookieConsent,
  generateSecurityTxt,
} from './compliance'
import { generateComplianceAutomation } from './compliance-automation'
import { generateIpAllowlist } from './ip-allowlist'
import {
  generateEdgeCdn,
  generateWafDocs,
  generateDnsDocs,
  generateCustomDomainsDocs,
  generateApiGatewayDocs,
  generateApiStyle,
  generateThirdPartyApisDocs,
  generateWebhookReliabilityDocs,
} from './infra-network'
import { generateApiKeyAuth } from './api-key-auth'
import { generatePwaFiles } from './pwa'
import { generateAppointmentsFiles } from './appointments'
import { generateESignatureFiles } from './e-signature'
import { generateDeploymentGuide } from './deployment'
import {
  generateSearch,
  generateCache,
  generateBackupDocs,
  generatePerformanceConfig,
} from './infra-utils'
import {
  generateCors,
  generateRateLimiting,
  generateRequestValidation,
  generateInputSanitization,
  generateSqliPrevention,
} from './security-utils'
import {
  generateFeatureFlags,
  generateDataExport,
  generateCrudEndpoints,
  generateUptimeMonitoring,
  generateFileValidation,
} from './feature-utils'
import {
  generateAgentIntegration,
  generateAgentUseCases,
  generateHostingRegionDocs,
  generateFileAccessControl,
  generateSecurityHeadersDoc,
} from './workflow-utils'
import {
  generateSmsConfig,
  generatePushNotifications,
  generateInAppNotifications,
  generateChatProvider,
  generateCostAlerts,
} from './notification-utils'
import {
  generateImageProcessing,
  generatePdfGeneration,
  generateOgImageGeneration,
  generateEventQueue,
  generateRealtime,
  generateBackgroundJobs,
} from './media-utils'
import {
  generateSupabaseServer,
  generateSupabaseAdmin,
  generateRoles,
  generateSanitize,
} from './auth-lib'

function deduplicate(files: GeneratedFile[]): GeneratedFile[] {
  const seen = new Set<string>()
  const deduped: GeneratedFile[] = []
  for (let i = files.length - 1; i >= 0; i--) {
    const file = files[i]!
    if (!seen.has(file.path)) {
      seen.add(file.path)
      deduped.push(file)
    }
  }
  return deduped.reverse()
}

export function generate(config: BootConfig): GeneratorResult {
  const files: GeneratedFile[] = []
  const warnings: string[] = []

  files.push(...generateCommonFiles(config))
  files.push(...generateAppConfig(config))
  files.push(...generateFrameworkFiles(config))
  files.push(...generateSetupWizard(config))
  files.push(...generateSetupCli(config))
  files.push(...generateSetupLauncher(config))
  files.push(...generateCleanupSetup())
  files.push(...generateDatabaseFiles(config))
  files.push(...generateAuthFiles(config))
  files.push(...generateAuthRbac(config))
  files.push(...generateAuthMfa(config))
  files.push(...generateAuthPasskeys(config))
  files.push(...generatePaymentFiles(config))
  files.push(...generateStorageFiles(config))
  files.push(...generateEmailFiles(config))
  files.push(...generateMonitoringFiles(config))
  files.push(...generateAuditLogging(config))
  files.push(...generateCiFiles(config))
  files.push(...generateCommunicationFiles(config))
  files.push(...generateComplianceFiles(config))
  files.push(...generateCookieConsent(config))
  files.push(...generateDependabotConfig(config))
  files.push(...generateSecurityTxt(config))
  files.push(...generateIpAllowlist(config))
  files.push(...generateApiKeyAuth(config))
  files.push(...generateAxiomIntegration(config))
  files.push(...generatePwaFiles(config))
  files.push(...generateAppointmentsFiles(config))
  files.push(...generateESignatureFiles(config))
  files.push(...generateDeploymentGuide(config))
  files.push(...generateSearch(config))
  files.push(...generateCache(config))
  files.push(...generateBackupDocs(config))
  files.push(...generatePerformanceConfig(config))
  files.push(...generateCors(config))
  files.push(...generateRateLimiting(config))
  files.push(...generateRequestValidation(config))
  files.push(...generateInputSanitization(config))
  files.push(...generateSqliPrevention(config))
  files.push(...generateFeatureFlags(config))
  files.push(...generateDataExport(config))
  files.push(...generateCrudEndpoints(config))
  files.push(...generateUptimeMonitoring(config))
  files.push(...generateFileValidation(config))
  files.push(...generateEdgeCdn(config))
  files.push(...generateWafDocs(config))
  files.push(...generateDnsDocs(config))
  files.push(...generateCustomDomainsDocs(config))
  files.push(...generateApiGatewayDocs(config))
  files.push(...generateApiStyle(config))
  files.push(...generateThirdPartyApisDocs(config))
  files.push(...generateWebhookReliabilityDocs(config))
  files.push(...generateAgentIntegration(config))
  files.push(...generateAgentUseCases(config))
  files.push(...generateHostingRegionDocs(config))
  files.push(...generateFileAccessControl(config))
  files.push(...generateSecurityHeadersDoc(config))
  files.push(...generateImageProcessing(config))
  files.push(...generatePdfGeneration(config))
  files.push(...generateOgImageGeneration(config))
  files.push(...generateEventQueue(config))
  files.push(...generateRealtime(config))
  files.push(...generateBackgroundJobs(config))
  files.push(...generateSmsConfig(config))
  files.push(...generatePushNotifications(config))
  files.push(...generateInAppNotifications(config))
  files.push(...generateChatProvider(config))
  files.push(...generateCostAlerts(config))
  files.push(...generateComplianceAutomation(config))
  files.push(...generateSupabaseServer())
  files.push(...generateSupabaseAdmin())
  files.push(...generateRoles())
  files.push(...generateSanitize())

  return {
    files: deduplicate(files).sort((a, b) => a.path.localeCompare(b.path)),
    warnings,
    projectName: config.projectName,
  }
}
