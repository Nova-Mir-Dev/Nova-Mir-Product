export const LAST_REVIEWED = '2026-05-19'

export type Market =
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

export interface ProjectConfig {
  userTracking: string
  dataRetentionDays: number
  targetMarkets: Market[]
  fileStorage: string
  payments: string
  analyticsProvider: string
  expectedUserCount: string
  auth: string
  hasPublicApi: boolean
  hasWebhooks: boolean
  thirdPartyApis: string[]
  mfaRequired: boolean
}

export interface Regulation {
  id: string
  name: string
  markets: Market[]
  description: string
  requirements: RegulationRequirement[]
}

export interface RegulationRequirement {
  id: string
  category:
    | 'data-collection'
    | 'user-rights'
    | 'security'
    | 'storage'
    | 'disclosure'
    | 'consent'
    | 'deletion'
    | 'encryption'
    | 'access-control'
    | 'monitoring'
    | 'api-security'
  description: string
  applies: (config: ProjectConfig) => boolean
  mitigation: string
}

export const REGULATIONS: Regulation[] = [
  {
    id: 'gdpr',
    name: 'GDPR (General Data Protection Regulation)',
    markets: ['eu'],
    description:
      "EU regulation on data protection and privacy for all individuals within the European Economic Area. Applies to any organization processing personal data of EU residents, regardless of the organization's location.",
    requirements: [
      {
        id: 'gdpr-consent',
        category: 'consent',
        description:
          'GDPR requires explicit, freely given, specific, informed, and unambiguous consent for processing personal data. Consent must be obtained before data collection begins and users must be able to withdraw consent at any time.',
        applies: (config) => config.userTracking !== 'none',
        mitigation:
          'Implement a consent management platform (CMP) with granular opt-in controls. Do not rely on pre-checked boxes or implied consent. Record and timestamp all consent events.',
      },
      {
        id: 'gdpr-access',
        category: 'user-rights',
        description:
          'Data subjects have the right to access their personal data and obtain confirmation of whether their data is being processed. Organizations must respond within 30 days with a copy of the data in a commonly used electronic format.',
        applies: () => true,
        mitigation:
          'Build a self-service data export portal or a documented manual process. Ensure all personal data across systems can be located and compiled within 30 days.',
      },
      {
        id: 'gdpr-erasure',
        category: 'deletion',
        description:
          'The right to erasure ("right to be forgotten") allows individuals to request deletion of their personal data when it is no longer necessary, consent is withdrawn, or processing is unlawful.',
        applies: () => true,
        mitigation:
          'Implement a data deletion workflow that cascades across all storage systems, backups, and third-party processors. Maintain an audit log of deletion requests.',
      },
      {
        id: 'gdpr-portability',
        category: 'user-rights',
        description:
          'Data subjects have the right to receive their personal data in a structured, commonly used, and machine-readable format (e.g., JSON, CSV), and to transmit it to another controller without hindrance (Article 20).',
        applies: () => true,
        mitigation:
          'Build a data export endpoint that returns all personal data in a portable format. Support direct transfer to another controller where technically feasible. Document the export schema.',
      },
      {
        id: 'gdpr-minimization',
        category: 'data-collection',
        description:
          'Data minimization requires that only personal data adequate, relevant, and limited to what is necessary for the specified purposes be collected and processed.',
        applies: (config) => config.userTracking === 'full',
        mitigation:
          'Audit all data collection points and remove any fields not strictly needed. Replace full tracking with pseudonymous analytics. Document the purpose for every data field collected.',
      },
      {
        id: 'gdpr-dpa',
        category: 'disclosure',
        description:
          'A Data Processing Agreement (DPA) is required for every third-party subprocessor that handles personal data. The DPA must define processing scope, duration, nature, purpose, and data subject categories.',
        applies: (config) =>
          config.analyticsProvider !== 'none' ||
          config.fileStorage !== 'none' ||
          config.payments !== 'none',
        mitigation:
          'Sign DPAs with every vendor that processes personal data: analytics providers, cloud storage, payment processors, email services, and hosting. Maintain a public list of subprocessors.',
      },
      {
        id: 'gdpr-breach',
        category: 'security',
        description:
          'Personal data breaches must be reported to the relevant supervisory authority within 72 hours of becoming aware. If the breach poses a high risk to individuals, they must also be notified without undue delay.',
        applies: () => true,
        mitigation:
          'Create and test an incident response plan. Set up monitoring and alerting for unauthorized access. Pre-draft breach notification templates and identify the lead supervisory authority.',
      },
      {
        id: 'gdpr-dpo',
        category: 'disclosure',
        description:
          'A Data Protection Officer (DPO) must be appointed when: (a) processing is carried out by a public authority, (b) core activities involve regular and systematic monitoring of data subjects on a large scale, or (c) processing involves large-scale special categories of data or criminal convictions. DPOs are required at 250+ employees or when large-scale personal data processing occurs.',
        applies: (config) =>
          config.expectedUserCount === '10k-100k' ||
          config.expectedUserCount === '100k+' ||
          config.userTracking === 'full',
        mitigation:
          'Designate a DPO (internal or external). Publish DPO contact details. Ensure the DPO is involved in all data protection matters and reports directly to the highest management level.',
      },
      {
        id: 'gdpr-transfer',
        category: 'storage',
        description:
          'Cross-border transfers of personal data outside the EU/EEA are restricted. Transfers are only permitted to countries with an adequacy decision, or under appropriate safeguards such as Standard Contractual Clauses (SCCs) or Binding Corporate Rules.',
        applies: (config) =>
          config.fileStorage !== 'none' && config.fileStorage !== 'local',
        mitigation:
          'Use EU-based data centers or ensure Standard Contractual Clauses are in place with any non-EU storage provider. Conduct a Transfer Impact Assessment (TIA) and document the legal basis for each transfer.',
      },
      {
        id: 'gdpr-transparency',
        category: 'disclosure',
        description:
          'Organizations must provide clear, concise, and transparent information about how personal data is processed, including purposes, legal basis, retention periods, and data subject rights.',
        applies: () => true,
        mitigation:
          'Publish a layered privacy notice that covers data categories, purposes, legal bases, retention, rights, and third-party sharing. Make it accessible in plain language, not legalese.',
      },
      {
        id: 'gdpr-retention',
        category: 'storage',
        description:
          'Personal data must not be kept longer than necessary for the purposes for which it is processed. An explicit retention policy with defined time limits is required.',
        applies: (config) => config.dataRetentionDays <= 0,
        mitigation:
          'Define and document retention periods for every data category. Implement automated data purging after retention expires. Align retention with the documented processing purpose.',
      },
      {
        id: 'gdpr-dpia',
        category: 'data-collection',
        description:
          'A Data Protection Impact Assessment (DPIA) is required when processing is likely to result in a high risk to individuals, such as systematic profiling, large-scale processing of sensitive data, or systematic monitoring of public areas.',
        applies: (config) =>
          config.userTracking === 'full' &&
          (config.expectedUserCount === '10k-100k' ||
            config.expectedUserCount === '100k+'),
        mitigation:
          'Conduct a DPIA that describes the processing, assesses necessity and proportionality, evaluates risks to individuals, and documents mitigation measures. Consult the supervisory authority if residual risks remain high.',
      },
      {
        id: 'gdpr-cookie-consent',
        category: 'consent',
        description:
          "Under the ePrivacy Directive as interpreted alongside GDPR, consent is required before placing non-essential cookies or similar tracking technologies on a user's device. Cookie walls are not valid consent.",
        applies: (config) =>
          config.userTracking !== 'none' || config.analyticsProvider !== 'none',
        mitigation:
          'Implement a cookie consent banner that blocks non-essential cookies until affirmative consent is given. Categorize cookies (necessary, analytics, marketing) and allow granular opt-in per category.',
      },
    ],
  },
  {
    id: 'uk-gdpr',
    name: 'UK GDPR (United Kingdom General Data Protection Regulation)',
    markets: ['uk'],
    description:
      "Post-Brexit UK data protection framework that mirrors EU GDPR but is enforced by the Information Commissioner's Office (ICO) under the Data Protection Act 2018. Organizations targeting the UK market must comply independently of EU GDPR.",
    requirements: [
      {
        id: 'uk-gdpr-consent',
        category: 'consent',
        description:
          'UK GDPR requires explicit, freely given, specific, informed, and unambiguous consent for processing personal data, enforced by the ICO. Consent must be as rigorous as under EU GDPR.',
        applies: (config) => config.userTracking !== 'none',
        mitigation:
          'Deploy a consent management platform with UK-specific cookie guidance (ICO "How to use cookies" guidelines). Do not use cookie walls or bundled consent for non-essential processing.',
      },
      {
        id: 'uk-gdpr-access',
        category: 'user-rights',
        description:
          'Data subjects in the UK have the right of access to personal data. Organizations must respond within one month and provide data in a portable, commonly used format.',
        applies: () => true,
        mitigation:
          'Provide a Subject Access Request (SAR) portal or documented process. Train staff to recognize and route SARs within the statutory timeframe.',
      },
      {
        id: 'uk-gdpr-erasure',
        category: 'deletion',
        description:
          'UK individuals have a qualified right to erasure of their personal data. Requests must be handled promptly and verified.',
        applies: () => true,
        mitigation:
          'Build deletion workflows that cover primary storage, backups (where feasible), logs, and all third-party processors. Register with the ICO and maintain records of processing activities (ROPA).',
      },
      {
        id: 'uk-gdpr-portability',
        category: 'user-rights',
        description:
          'UK GDPR grants data subjects the right to data portability: the right to receive personal data in a structured, commonly used, machine-readable format and transmit it to another controller.',
        applies: () => true,
        mitigation:
          'Provide a data export mechanism supporting portable formats (JSON, CSV). Document the data schema and support direct controller-to-controller transfers where feasible.',
      },
      {
        id: 'uk-gdpr-minimization',
        category: 'data-collection',
        description:
          'Data minimization under UK GDPR mandates that personal data be adequate, relevant, and limited to what is necessary for the specified purposes.',
        applies: (config) => config.userTracking === 'full',
        mitigation:
          'Remove superfluous data fields and scale back full-user profiling to essential analytics. Document the necessity of each data point in your ROPA.',
      },
      {
        id: 'uk-gdpr-dpa',
        category: 'disclosure',
        description:
          'UK GDPR requires a contract (DPA) with each processor handling personal data, specifying the subject matter, duration, nature, purpose, and obligations of both parties.',
        applies: (config) =>
          config.analyticsProvider !== 'none' ||
          config.fileStorage !== 'none' ||
          config.payments !== 'none',
        mitigation:
          'Execute UK-compliant DPAs with all vendors. Ensure processor terms reflect the UK-specific international transfer regime and ICO enforcement powers.',
      },
      {
        id: 'uk-gdpr-breach',
        category: 'security',
        description:
          'Personal data breaches must be notified to the ICO within 72 hours. High-risk breaches affecting individuals must also be communicated to those individuals.',
        applies: () => true,
        mitigation:
          'Prepare an ICO-compliant breach notification procedure. Pre-register contact details with the ICO. Conduct periodic breach simulation exercises.',
      },
      {
        id: 'uk-gdpr-dpo',
        category: 'disclosure',
        description:
          'A Data Protection Officer must be appointed when processing involves large-scale regular and systematic monitoring or large-scale processing of special category data (250+ employees or large-scale personal data processing).',
        applies: (config) =>
          config.expectedUserCount === '10k-100k' ||
          config.expectedUserCount === '100k+' ||
          config.userTracking === 'full',
        mitigation:
          'Appoint a DPO registered with the ICO. Ensure the DPO has direct access to the board and adequate resources. Include DPO details in the privacy notice.',
      },
      {
        id: 'uk-gdpr-transfer',
        category: 'storage',
        description:
          'UK international data transfers require an adequacy regulation from the UK government or appropriate safeguards (UK International Data Transfer Agreement or UK Addendum to EU SCCs).',
        applies: (config) =>
          config.fileStorage !== 'none' && config.fileStorage !== 'local',
        mitigation:
          'Use UK or adequacy-approved storage locations. For transfers elsewhere, execute the UK International Data Transfer Agreement (IDTA) or UK Addendum. Conduct a Transfer Risk Assessment (TRA).',
      },
      {
        id: 'uk-gdpr-transparency',
        category: 'disclosure',
        description:
          'UK GDPR requires transparent information about processing, including the identity of the controller, purposes, legal basis, recipients, and retention.',
        applies: () => true,
        mitigation:
          "Publish a UK-specific privacy notice covering ICO registration details, UK legal bases, and rights under the Data Protection Act 2018. Use ICO's recommended template structure.",
      },
      {
        id: 'uk-gdpr-retention',
        category: 'storage',
        description:
          "Personal data must not be retained longer than necessary. A documented retention policy with specific timeframes is required by the ICO's accountability principle.",
        applies: (config) => config.dataRetentionDays <= 0,
        mitigation:
          'Define retention schedules per data category. Automate deletion or anonymization when retention expires. Review retention policies at least annually.',
      },
      {
        id: 'uk-gdpr-cookie-consent',
        category: 'consent',
        description:
          'The ICO enforces cookie consent requirements under PECR: non-essential cookies and tracking technologies require prior informed consent. Cookie walls that deny service if consent is withheld are non-compliant.',
        applies: (config) =>
          config.userTracking !== 'none' || config.analyticsProvider !== 'none',
        mitigation:
          'Deploy a cookie consent banner compliant with ICO PECR guidance. Block analytics and marketing cookies until affirmative consent. Allow granular category selection.',
      },
    ],
  },
  {
    id: 'ccpa-cpra',
    name: 'CCPA/CPRA (California Consumer Privacy Act / California Privacy Rights Act)',
    markets: ['us'],
    description:
      "California's comprehensive privacy law, expanded by the CPRA in 2023. Applies to for-profit businesses that collect California residents' personal information and meet any of: $25M+ gross revenue, buying/selling data of 100k+ consumers, or deriving 50%+ revenue from selling data.",
    requirements: [
      {
        id: 'ccpa-know',
        category: 'user-rights',
        description:
          'Consumers have the right to know what personal information is collected, the categories and specific pieces of personal information, the sources, the business purpose, and the categories of third parties with whom it is shared.',
        applies: () => true,
        mitigation:
          'Publish a "Notice at Collection" and a comprehensive privacy policy. Build a consumer request portal supporting requests to know. Prepare a data map identifying all categories of PI and their flow.',
      },
      {
        id: 'ccpa-delete',
        category: 'deletion',
        description:
          'Consumers have the right to request deletion of personal information collected from them, subject to statutory exceptions (e.g., legal obligations, security, debugging). Businesses must extend deletion requests to third parties who received the data.',
        applies: () => true,
        mitigation:
          'Implement a deletion workflow that covers all systems, including third-party processors. Maintain a documented list of applicable deletion exceptions and notify consumers when exceptions apply.',
      },
      {
        id: 'ccpa-opt-out',
        category: 'consent',
        description:
          'Consumers have the right to opt out of the sale or sharing of their personal information. CPRA expanded this to include cross-context behavioral advertising. A clear "Do Not Sell or Share My Personal Information" link is required on the homepage.',
        applies: (config) =>
          config.userTracking === 'full' ||
          config.analyticsProvider === 'google-analytics' ||
          config.analyticsProvider === 'facebook-pixel',
        mitigation:
          'Add a conspicuous "Do Not Sell or Share My Personal Information" link. Implement a global opt-out mechanism (GPC signal). Honor opt-out preference signals and wait 12 months before requesting re-consent.',
      },
      {
        id: 'ccpa-sensitive',
        category: 'consent',
        description:
          'CPRA introduced sensitive personal information (SPI) categories including precise geolocation, race, religion, genetic data, biometrics, health, sexual orientation, citizenship/immigration status, and union membership. Businesses must offer a "Limit the Use of My Sensitive Personal Information" link.',
        applies: (config) => config.userTracking === 'full',
        mitigation:
          'Identify whether SPI is collected. If so, offer a "Limit the Use of My Sensitive Personal Information" link. Obtain explicit opt-in consent before processing SPI for secondary purposes.',
      },
      {
        id: 'ccpa-lookback',
        category: 'deletion',
        description:
          'When responding to a verified request to know or to delete, businesses must cover personal information collected in the 12 months preceding the request, unless the consumer specifies a longer period. This 12-month lookback applies to both access and deletion rights.',
        applies: () => true,
        mitigation:
          'Ensure data storage and query systems support retrieval and deletion of at least 12 months of historical personal information. Implement consumer identity verification before acting on requests.',
      },
      {
        id: 'ccpa-notice',
        category: 'disclosure',
        description:
          'Businesses must provide a privacy notice that covers: categories of PI collected, sources, business/commercial purposes, categories of third parties, and consumer rights under CCPA/CPRA.',
        applies: () => true,
        mitigation:
          'Create a CCPA/CPRA-compliant privacy notice updated at least annually. Include the effective date, consumer rights, and a toll-free phone number (if applicable under revenue thresholds).',
      },
      {
        id: 'ccpa-retention',
        category: 'storage',
        description:
          'CPRA requires that personal information not be retained longer than reasonably necessary for each disclosed purpose. Businesses must disclose retention criteria.',
        applies: (config) => config.dataRetentionDays <= 0,
        mitigation:
          'Establish and publish retention schedules per purpose category. Implement data lifecycle automation. Align retention with documented business purposes stated in the privacy notice.',
      },
      {
        id: 'ccpa-correction',
        category: 'user-rights',
        description:
          'Under CPRA, consumers have the right to correct inaccurate personal information. Businesses must use commercially reasonable efforts to correct upon verified request.',
        applies: () => true,
        mitigation:
          'Provide a mechanism for consumers to request corrections. Build a workflow to propagate corrections across systems. Document when correction is infeasible and why.',
      },
      {
        id: 'ccpa-automated-decision',
        category: 'user-rights',
        description:
          'Under CPRA, consumers have the right to opt out of automated decision-making technology, including profiling, that produces legal or similarly significant effects. Businesses must provide meaningful information about the logic involved.',
        applies: (config) => config.userTracking === 'full',
        mitigation:
          'Provide an opt-out mechanism for automated decision-making. Disclose what decisions are automated, the logic used, and the likely outcomes. Conduct and document an algorithmic fairness assessment.',
      },
      {
        id: 'ccpa-cookie-consent',
        category: 'consent',
        description:
          'While CCPA/CPRA does not explicitly mandate cookie consent banners, cross-context behavioral advertising disclosure and opt-out rights effectively require a consent or notice mechanism on first visit.',
        applies: (config) =>
          config.userTracking !== 'none' || config.analyticsProvider !== 'none',
        mitigation:
          'Implement a cookie notice or consent banner disclosing tracking and advertising practices. Honor GPC signals. Provide the "Do Not Sell or Share" opt-out link on the banner.',
      },
    ],
  },
  {
    id: 'pipeda',
    name: 'PIPEDA (Personal Information Protection and Electronic Documents Act)',
    markets: ['ca'],
    description:
      'Canadian federal privacy law governing how private-sector organizations collect, use, and disclose personal information in the course of commercial activities. Provincial substantially similar laws may apply in Alberta, British Columbia, and Quebec.',
    requirements: [
      {
        id: 'pipeda-consent',
        category: 'consent',
        description:
          'PIPEDA requires meaningful, informed consent for the collection, use, and disclosure of personal information. Consent must be obtained before or at the time of collection and the form of consent (express or implied) must be appropriate given sensitivity.',
        applies: (config) => config.userTracking !== 'none',
        mitigation:
          'Implement consent banners that explain what data is collected, why, and with whom it is shared. For sensitive information, obtain express opt-in consent. Allow users to understand the reasonable consequences of withholding consent.',
      },
      {
        id: 'pipeda-accuracy',
        category: 'data-collection',
        description:
          'Personal information must be as accurate, complete, and up-to-date as necessary for the purposes for which it is to be used. Organizations must correct, amend, or annotate inaccurate information upon challenge.',
        applies: () => true,
        mitigation:
          'Provide a mechanism for users to update their personal information. Validate key fields at collection. Implement periodic data quality reviews and correction workflows.',
      },
      {
        id: 'pipeda-safeguards',
        category: 'security',
        description:
          'Personal information must be protected by security safeguards appropriate to the sensitivity of the information. Safeguards cover physical, technical, and organizational measures.',
        applies: (config) =>
          config.payments !== 'none' || config.userTracking !== 'none',
        mitigation:
          'Encrypt data at rest and in transit. Implement access controls, audit logging, and staff training. Conduct periodic security assessments and vulnerability scans.',
      },
      {
        id: 'pipeda-openness',
        category: 'disclosure',
        description:
          'Organizations must be open about their policies and practices for managing personal information. Information about policies must be readily available in a form understandable to the individual.',
        applies: () => true,
        mitigation:
          'Publish a clear privacy policy describing data handling practices, accountability roles, and complaint procedures. Make the policy accessible and include contact details for the designated privacy officer.',
      },
      {
        id: 'pipeda-access',
        category: 'user-rights',
        description:
          'Upon written request, individuals must be informed of the existence, use, and disclosure of their personal information and be given access to it. Organizations must respond within 30 days (extendable to 30 more).',
        applies: () => true,
        mitigation:
          'Establish a formal access request process with 30-day response SLA. Build data retrieval capability across all systems. Document and communicate any statutory exemptions for denying access.',
      },
      {
        id: 'pipeda-retention',
        category: 'storage',
        description:
          'Personal information must be retained only as long as necessary for the fulfillment of the identified purposes. Once no longer needed, it must be securely destroyed, erased, or anonymized.',
        applies: (config) => config.dataRetentionDays <= 0,
        mitigation:
          'Define retention guidelines per data category. Implement secure disposal procedures (shredding, cryptographic erasure, degaussing). Document disposal practices.',
      },
      {
        id: 'pipeda-accountability',
        category: 'disclosure',
        description:
          "Organizations are responsible for personal information under their control and must designate an individual accountable for compliance with PIPEDA's principles.",
        applies: () => true,
        mitigation:
          'Designate a Privacy Officer and publish their contact information. Establish internal compliance procedures, staff training, and regular audits of privacy practices.',
      },
      {
        id: 'pipeda-cookie-consent',
        category: 'consent',
        description:
          'Under PIPEDA, the collection of personal information through cookies and tracking technologies requires meaningful consent. The OPC has issued guidance on online behavioural advertising requiring opt-in consent for tracking.',
        applies: (config) =>
          config.userTracking !== 'none' || config.analyticsProvider !== 'none',
        mitigation:
          'Deploy a consent banner explaining tracking purposes and third-party data sharing. Obtain express consent for behavioural advertising. Honor browser Do Not Track signals.',
      },
    ],
  },
  {
    id: 'lgpd',
    name: 'LGPD (Lei Geral de Proteção de Dados)',
    markets: ['br'],
    description:
      "Brazil's comprehensive data protection law modeled closely on GDPR. Enforced by the Autoridade Nacional de Proteção de Dados (ANPD). Applies to any processing of personal data in Brazil or of individuals located in Brazil.",
    requirements: [
      {
        id: 'lgpd-consent',
        category: 'consent',
        description:
          'LGPD requires consent that is free, informed, and unambiguous. Consent must be obtained for specific purposes, and generic or blanket authorizations are void. Consent withdrawal must be easy and free of charge.',
        applies: (config) => config.userTracking !== 'none',
        mitigation:
          'Deploy consent management in Portuguese. Use granular, specific consent options. Provide a simple mechanism to withdraw consent and immediately halt processing upon withdrawal.',
      },
      {
        id: 'lgpd-mapping',
        category: 'data-collection',
        description:
          'Organizations must maintain a data mapping or Record of Processing Activities (ROPA) documenting all personal data processing, including categories, purposes, legal basis, data flows, and retention.',
        applies: () => true,
        mitigation:
          'Conduct a data mapping exercise across all systems. Maintain a living ROPA document that is updated with every new processing activity. The ANPD may require simplified records for small businesses.',
      },
      {
        id: 'lgpd-dpo',
        category: 'disclosure',
        description:
          'A Data Protection Officer (Encarregado) must be appointed. The ANPD mandates DPOs for all controllers, though specific exemptions for small businesses may be defined by regulation. Large-scale data processing and sensitive data handling require a DPO regardless of size.',
        applies: (config) =>
          config.expectedUserCount === '10k-100k' ||
          config.expectedUserCount === '100k+' ||
          config.userTracking === 'full',
        mitigation:
          'Designate an Encarregado and publish their contact information. Ensure the DPO acts as a communication channel with data subjects and the ANPD, and provides guidance on compliance.',
      },
      {
        id: 'lgpd-impact',
        category: 'data-collection',
        description:
          'The ANPD may require a Data Protection Impact Assessment (Relatório de Impacto à Proteção de Dados) for high-risk processing. Controllers should proactively conduct one when processing sensitive data or profiling users.',
        applies: (config) => config.userTracking === 'full',
        mitigation:
          'Conduct a DPIA/RIPD documenting the processing flow, risk assessment, and mitigation measures. Keep the RIPD updated and available for ANPD review upon request.',
      },
      {
        id: 'lgpd-rights',
        category: 'user-rights',
        description:
          'Data subjects have extensive rights including confirmation of processing, access, correction, portability, deletion, information about sharing, objection to processing, and review of automated decisions.',
        applies: () => true,
        mitigation:
          'Build a rights-request portal supporting all LGPD subject rights. Ensure the ability to provide data in a structured, interoperable format for portability requests. Train support staff on LGPD response procedures.',
      },
      {
        id: 'lgpd-breach',
        category: 'security',
        description:
          'Controllers must notify the ANPD and the affected data subjects of security incidents that may cause relevant risk or harm. Notification must occur within a reasonable timeframe defined by the ANPD.',
        applies: () => true,
        mitigation:
          'Create an incident response plan that includes ANPD notification procedures. Pre-draft notification templates in Portuguese. Log all security incidents and the response timeline.',
      },
      {
        id: 'lgpd-transfer',
        category: 'storage',
        description:
          'International data transfers are permitted to countries with an adequacy decision by the ANPD, or under standard contractual clauses, binding corporate rules, or other ANPD-approved mechanisms.',
        applies: (config) =>
          config.fileStorage !== 'none' && config.fileStorage !== 'local',
        mitigation:
          'Identify where data is stored. For non-Brazil storage locations, establish the legal basis for transfer (adequacy, SCCs, BCRs). The ANPD maintains a list of adequate countries.',
      },
      {
        id: 'lgpd-retention',
        category: 'storage',
        description:
          'Personal data must be deleted after the purpose of processing is fulfilled, except when retention is required by law or for specific exceptions (research, legal compliance, credit protection).',
        applies: (config) => config.dataRetentionDays <= 0,
        mitigation:
          'Define data retention periods for each processing purpose. Implement automated purging. Document legal bases for any extended retention.',
      },
      {
        id: 'lgpd-cookie-consent',
        category: 'consent',
        description:
          'LGPD requires consent for tracking technologies. Cookie consent banners must be presented in Portuguese, with clear purposes and an easy opt-out. Implied consent through continued browsing is not sufficient.',
        applies: (config) =>
          config.userTracking !== 'none' || config.analyticsProvider !== 'none',
        mitigation:
          'Implement a Portuguese-language cookie consent banner with granular opt-in controls. Block tracking scripts until consent is obtained. Provide a persistent consent management widget.',
      },
    ],
  },
  {
    id: 'app',
    name: 'APP (Australian Privacy Principles)',
    markets: ['au'],
    description:
      'The 13 Australian Privacy Principles under the Privacy Act 1988 govern the collection, use, storage, and disclosure of personal information by APP entities. Enforced by the Office of the Australian Information Commissioner (OAIC).',
    requirements: [
      {
        id: 'app-notification',
        category: 'disclosure',
        description:
          "APP 5 requires organizations to notify individuals of the collection of personal information, including the entity's identity, the purposes of collection, consequences of not providing information, and the privacy policy.",
        applies: (config) => config.userTracking !== 'none',
        mitigation:
          'Provide a collection notice at each point of data collection. Include the organization name, collection purpose, access/complaint rights, and whether data is likely to be disclosed overseas.',
      },
      {
        id: 'app-cross-border',
        category: 'storage',
        description:
          'APP 8 requires APP entities to take reasonable steps to ensure overseas recipients do not breach the APPs before disclosing personal information cross-border. The entity remains accountable.',
        applies: (config) =>
          config.analyticsProvider !== 'none' ||
          (config.fileStorage !== 'none' && config.fileStorage !== 'local'),
        mitigation:
          'Contractually require overseas recipients to comply with the APPs. Conduct due diligence on foreign processors. Disclose which countries data may be sent to in the privacy policy.',
      },
      {
        id: 'app-quality',
        category: 'data-collection',
        description:
          'APP 10 requires entities to take reasonable steps to ensure personal information collected, used, or disclosed is accurate, up-to-date, complete, and relevant.',
        applies: () => true,
        mitigation:
          'Implement data validation at entry points. Allow users to correct their information. Periodically verify data quality for key records.',
      },
      {
        id: 'app-security',
        category: 'security',
        description:
          'APP 11 requires entities to take reasonable steps to protect personal information from misuse, interference, loss, unauthorized access, modification, or disclosure.',
        applies: (config) =>
          config.payments !== 'none' || config.userTracking !== 'none',
        mitigation:
          'Apply encryption, access controls, and intrusion detection. Destroy or de-identify personal information when no longer needed. Train staff on data security practices.',
      },
      {
        id: 'app-access',
        category: 'user-rights',
        description:
          'APP 12 requires entities to give individuals access to their personal information upon request, generally within 30 days. APP 13 requires correction of personal information when it is inaccurate, out-of-date, incomplete, irrelevant, or misleading.',
        applies: () => true,
        mitigation:
          'Establish an access and correction request process with a 30-day response target. Provide written reasons if access is denied, including the applicable exception under the Privacy Act.',
      },
      {
        id: 'app-anonymity',
        category: 'data-collection',
        description:
          'APP 2 requires entities to give individuals the option of remaining anonymous or using a pseudonym when dealing with the entity, where lawful and practicable.',
        applies: (config) => config.userTracking === 'full',
        mitigation:
          'Allow users to interact without providing personal information where feasible. Offer pseudonymous account options. Only require identification when demonstrably necessary.',
      },
      {
        id: 'app-direct-marketing',
        category: 'consent',
        description:
          'APP 7 restricts the use of personal information for direct marketing. Individuals must have a simple means to opt out. For sensitive information, express consent is required.',
        applies: (config) => config.userTracking !== 'none',
        mitigation:
          'Include an unsubscribe mechanism in every direct marketing communication. Do not use or disclose sensitive information for marketing without express consent. Honor opt-out requests promptly.',
      },
      {
        id: 'app-cookie-consent',
        category: 'consent',
        description:
          'While Australia does not have a specific cookie law, the OAIC expects APP entities to notify and obtain consent where cookies collect personal information. The Privacy Act applies where cookies identify individuals.',
        applies: (config) =>
          config.userTracking !== 'none' || config.analyticsProvider !== 'none',
        mitigation:
          'Implement a cookie notice explaining what data is collected and the purposes. If cookies identify individuals (e.g., user profiles, tracking across sessions), obtain consent.',
      },
    ],
  },
  {
    id: 'pdpb',
    name: 'PDPB (Digital Personal Data Protection Act)',
    markets: ['in'],
    description:
      "India's comprehensive data protection law, enacted in 2023. Applies to digital personal data processed within India or in connection with offering goods and services to Indian residents. Enforced by the Data Protection Board of India.",
    requirements: [
      {
        id: 'pdpb-consent-manager',
        category: 'consent',
        description:
          'The PDPB introduces the concept of Consent Managers—intermediaries registered with the Data Protection Board that help data principals give, manage, review, and withdraw consent. Organizations must integrate with registered Consent Managers.',
        applies: (config) => config.userTracking !== 'none',
        mitigation:
          'Integrate with a Data Protection Board-registered Consent Manager. Provide granular consent options for each processing purpose. Allow easy withdrawal through the Consent Manager interface.',
      },
      {
        id: 'pdpb-fiduciary',
        category: 'disclosure',
        description:
          'Data Fiduciaries are accountable for complying with the Act regardless of any agreement to the contrary. Obligations include purpose limitation, data minimization, storage limitation, and reasonable security safeguards.',
        applies: () => true,
        mitigation:
          'Designate a Data Protection Officer as the point of contact for the Data Protection Board. Document compliance policies, conduct periodic data audits, and ensure contractual obligations align with fiduciary duties.',
      },
      {
        id: 'pdpb-purpose',
        category: 'data-collection',
        description:
          'Personal data may only be processed for a lawful purpose for which consent has been obtained. Purpose limitation is strictly enforced—data cannot be re-purposed without fresh consent or a new lawful basis.',
        applies: (config) => config.userTracking === 'full',
        mitigation:
          'Define specific, granular processing purposes at collection. If full tracking is enabled, ensure each tracking purpose has separate consent. Only re-purpose data with fresh notice and consent.',
      },
      {
        id: 'pdpb-retention',
        category: 'storage',
        description:
          'Data Fiduciaries must not retain personal data beyond the period necessary for the stated purpose. Once the purpose is satisfied, data must be erased unless retention is required by law.',
        applies: (config) => config.dataRetentionDays <= 0,
        mitigation:
          'Establish retention schedules per processing purpose. Implement automated data deletion. Retain records only when required by Indian law (e.g., tax, companies act compliance).',
      },
      {
        id: 'pdpb-grievance',
        category: 'user-rights',
        description:
          'Data Fiduciaries must establish an accessible grievance redressal mechanism. Data Principals can escalate complaints to the Data Protection Board if grievances are not resolved satisfactorily.',
        applies: () => true,
        mitigation:
          "Publish a grievance officer's contact details and complaint procedure. Set response SLAs and track resolution metrics. Register the grievance mechanism with the Data Protection Board as required.",
      },
      {
        id: 'pdpb-children',
        category: 'consent',
        description:
          'Processing of personal data of children (under 18) requires verifiable parental consent. Certain data fiduciaries are prohibited from tracking, behavioral monitoring, or targeted advertising directed at children.',
        applies: (config) => config.userTracking !== 'none',
        mitigation:
          'Implement age verification and parental consent mechanisms if the service is accessible to children. Do not profile or track children. Classify whether the service falls under the "Significant Data Fiduciary" category.',
      },
      {
        id: 'pdpb-breach',
        category: 'security',
        description:
          'Personal data breaches must be reported to the Data Protection Board and affected data principals. The Board may prescribe specific timelines and formats for breach notification.',
        applies: () => true,
        mitigation:
          'Implement breach detection and notification procedures compliant with DPB guidelines. Maintain an incident log and root-cause analysis process. Pre-draft notification templates for affected data principals.',
      },
      {
        id: 'pdpb-cookie-consent',
        category: 'consent',
        description:
          'Under the PDPB, notice and consent are required before collecting personal data through cookies or tracking technologies. A Consent Manager interface is the prescribed mechanism for managing cookie consent.',
        applies: (config) =>
          config.userTracking !== 'none' || config.analyticsProvider !== 'none',
        mitigation:
          'Integrate cookie consent with the registered Consent Manager. Block non-essential cookies until consent is recorded. Maintain consent logs for audit by the Data Protection Board.',
      },
    ],
  },
  {
    id: 'appi',
    name: 'APPI (Act on the Protection of Personal Information)',
    markets: ['jp'],
    description:
      "Japan's comprehensive data protection law, substantially amended in 2020 and 2022. Enforced by the Personal Information Protection Commission (PPC). Applies to personal information handled by business operators in Japan.",
    requirements: [
      {
        id: 'appi-sensitive-consent',
        category: 'consent',
        description:
          'APPI requires prior opt-in consent for the acquisition of sensitive personal information (race, creed, social status, medical history, criminal record, victimization). Opt-out is insufficient for sensitive data.',
        applies: (config) => config.userTracking === 'full',
        mitigation:
          'Identify whether sensitive personal information is collected. If so, obtain explicit opt-in consent before acquisition. Do not acquire sensitive data through indirect means without proper notification.',
      },
      {
        id: 'appi-purpose',
        category: 'data-collection',
        description:
          'Organizations must specify the purpose of utilization of personal information as explicitly as possible and must not use data beyond the scope necessary to achieve that purpose without prior consent.',
        applies: () => true,
        mitigation:
          'Document specific utilization purposes in Japanese. Obtain fresh consent before using data for a new purpose. Publish utilization purposes in a privacy policy accessible to data subjects.',
      },
      {
        id: 'appi-breach',
        category: 'security',
        description:
          'Amendments in 2022 require mandatory reporting of data breaches to the PPC and notification to affected data subjects when the breach involves sensitive data, a risk of financial harm, or is large-scale.',
        applies: () => true,
        mitigation:
          'Establish a breach response procedure compliant with PPC rules. Determine reporting triggers (sensitive data, more than 1,000 records, risk of financial damage). Submit reports within the PPC-mandated timeframe.',
      },
      {
        id: 'appi-access',
        category: 'user-rights',
        description:
          'Data subjects have the right to request disclosure, correction, addition, deletion, and cessation of use of their personal data. Organizations must respond without delay upon identity verification.',
        applies: () => true,
        mitigation:
          'Provide a standardized request form for disclosure and correction. Verify identity before fulfilling requests. Respond within two weeks unless a longer period is communicated with justification.',
      },
      {
        id: 'appi-security',
        category: 'security',
        description:
          'APPI requires necessary and appropriate measures to prevent leakage, loss, or damage of personal data, and to supervise employees and contractors with access to data.',
        applies: (config) =>
          config.payments !== 'none' || config.userTracking !== 'none',
        mitigation:
          'Implement organizational, personnel, physical, and technical security measures as recommended by the PPC guidelines. Supervise contractors with data access. Conduct periodic internal audits.',
      },
      {
        id: 'appi-transfer',
        category: 'storage',
        description:
          'Transfers of personal data to third parties in foreign countries require prior consent unless the country has an equivalent level of protection. Alternatively, the third party must implement equivalent measures.',
        applies: (config) =>
          config.fileStorage !== 'none' && config.fileStorage !== 'local',
        mitigation:
          "Obtain consent for foreign transfers specifying the destination country. Assess the recipient's data protection framework. For EU/UK adequacy countries, document the adequacy finding. For others, require contractual measures.",
      },
      {
        id: 'appi-retention',
        category: 'storage',
        description:
          'Personal data must be deleted without delay when it is no longer needed for the utilization purpose. Organizations must strive to delete personal information when the retention period expires.',
        applies: (config) => config.dataRetentionDays <= 0,
        mitigation:
          'Define and document retention periods per utilization purpose. Implement automated deletion schedules. The PPC expects proactive data lifecycle management, not indefinite retention.',
      },
      {
        id: 'appi-cookie-consent',
        category: 'consent',
        description:
          'The PPC has issued guidance requiring notification or publication of purposes when personal information is collected via cookies. Third-party cookie data sharing requires prior consent.',
        applies: (config) =>
          config.userTracking !== 'none' || config.analyticsProvider !== 'none',
        mitigation:
          'Disclose cookie purposes in a Japanese-language privacy policy. Obtain consent before sharing cookie data with third parties. Provide an opt-out mechanism for tracking cookies.',
      },
    ],
  },
  {
    id: 'security-baseline',
    name: 'Security Baseline (Universal Requirements)',
    markets: [
      'us',
      'eu',
      'uk',
      'ca',
      'au',
      'br',
      'in',
      'jp',
      'mx',
      'no',
      'ch',
      'is',
      'ar',
      'co',
      'cl',
      'kr',
      'sg',
      'cn',
      'za',
      'ae',
      'ke',
      'ng',
    ],
    description:
      'Universal security and operational requirements that apply regardless of target market. These represent industry-standard security practices and conditional compliance obligations triggered by specific features of your application.',
    requirements: [
      {
        id: 'sec-tls-https',
        category: 'security',
        description:
          'TLS/HTTPS must be enforced for all connections. Plain HTTP must be disabled or redirected to HTTPS. TLS certificates must be valid and auto-renewed. HSTS headers must be configured with a minimum max-age of one year.',
        applies: () => true,
        mitigation:
          'Enable HTTPS-only on your hosting provider. Redirect all HTTP traffic to HTTPS (301). Set Strict-Transport-Security header with max-age=31536000; includeSubDomains. Use a CDN with automatic TLS certificate management.',
      },
      {
        id: 'sec-csp',
        category: 'security',
        description:
          'A Content Security Policy (CSP) header must be implemented to prevent XSS, clickjacking, and other code injection attacks. CSP should restrict script sources, disable inline scripts, and whitelist trusted origins.',
        applies: () => true,
        mitigation:
          'Configure Content-Security-Policy headers. Start with report-only mode to collect violations. Define strict source directives (script-src, style-src, connect-src). Move inline scripts to external files with nonces or hashes.',
      },
      {
        id: 'sec-encryption-rest',
        category: 'encryption',
        description:
          'Data at rest must be encrypted using AES-256 or equivalent. Applies to databases, file storage, backups, and logs. Encryption keys must be managed securely with rotation policies.',
        applies: (config) =>
          config.fileStorage !== 'none' ||
          config.payments !== 'none' ||
          config.userTracking !== 'none',
        mitigation:
          'Enable server-side and client-side encryption for databases (TDE, pgcrypto). Use KMS for key management with automatic rotation. Encrypt file/object storage buckets at rest. Ensure backup encryption.',
      },
      {
        id: 'sec-encryption-transit',
        category: 'encryption',
        description:
          'All data in transit must be encrypted using TLS 1.2 or higher. This includes API calls, database connections, inter-service communication, webhooks, and third-party integrations.',
        applies: () => true,
        mitigation:
          'Enforce TLS 1.2+ on all endpoints. Use mutual TLS for service-to-service communication. Pin certificates for high-security integrations. Monitor for deprecated cipher suites and protocols.',
      },
      {
        id: 'sec-audit-logging',
        category: 'monitoring',
        description:
          'Comprehensive audit logging must capture authentication events, data access, configuration changes, API calls, and security events. Logs must be tamper-proof, centralized, and retained for a defined period (minimum 90 days for security incidents).',
        applies: () => true,
        mitigation:
          'Implement structured logging with correlation IDs. Centralize logs in an append-only, immutable store. Log authentication, authorization decisions, PII access, and admin actions. Set up log-based alerting for anomalous patterns.',
      },
      {
        id: 'sec-access-control',
        category: 'access-control',
        description:
          'Role-Based Access Control (RBAC) must be implemented with the principle of least privilege. Separate read/write/admin roles. No shared credentials. Multi-factor authentication required for admin and privileged accounts.',
        applies: (config) =>
          config.auth !== 'none' ||
          config.payments !== 'none' ||
          config.fileStorage !== 'none',
        mitigation:
          'Define granular RBAC roles (viewer, editor, admin). Implement MFA for all privileged accounts. Use short-lived tokens (JWT with 15-minute expiry). Audit role assignments quarterly. Revoke access on role change or termination.',
      },
      {
        id: 'sec-vulnerability-disclosure',
        category: 'disclosure',
        description:
          'A vulnerability disclosure program must be established with a published security contact (security.txt), a responsible disclosure policy with safe harbor provisions, and a defined response SLA (acknowledge within 48 hours, resolve within 90 days).',
        applies: () => true,
        mitigation:
          'Publish a security.txt file at /.well-known/security.txt. Create a security@ email alias or bug bounty program. Define a vulnerability disclosure policy with safe harbor. Maintain a public changelog for security fixes.',
      },
      {
        id: 'sec-dependency-scanning',
        category: 'security',
        description:
          'Automated dependency scanning must be implemented to detect known vulnerabilities (CVEs) in open-source and third-party libraries. Scans must run on every CI build and alert on critical/high severity findings.',
        applies: () => true,
        mitigation:
          'Integrate Dependabot, Snyk, or npm audit into CI pipeline. Set minimum severity thresholds for build failure (critical/high). Maintain a Software Bill of Materials (SBOM). Establish a patch SLA based on CVSS score.',
      },
      {
        id: 'sec-pci-dss-scope',
        category: 'security',
        description:
          'If payment processing is enabled, PCI-DSS compliance scope must be documented. Determine whether you are a merchant, service provider, or outsourcing to a compliant processor (SAQ A). The scope document defines all systems, networks, and processes that store, process, or transmit cardholder data.',
        applies: (config) => config.payments !== 'none',
        mitigation:
          'Complete a PCI-DSS scoping exercise. If using Stripe/Paddle/LemonSqueezy (hosted checkout), qualify for SAQ A (minimal scope). Document cardholder data flow. Segment payment systems from the rest of the infrastructure. Complete annual SAQ self-assessment.',
      },
      {
        id: 'sec-pci-tls',
        category: 'encryption',
        description:
          'PCI-DSS requires TLS 1.2 or higher for all payment-related communications. TLS 1.0 and 1.1 are prohibited. SSL and early TLS must be disabled entirely. Strong cipher suites are required.',
        applies: (config) => config.payments !== 'none',
        mitigation:
          'Disable TLS 1.0 and 1.1 on all servers. Enforce TLS 1.2+ with strong cipher suites (ECDHE-based). Validate payment page certificate chain. Run quarterly SSL Labs scans on payment domains.',
      },
      {
        id: 'sec-password-policy',
        category: 'access-control',
        description:
          'If authentication is enabled, enforce a password policy: minimum 8 characters (12+ recommended), require mix of character classes (uppercase, lowercase, digit, special), prevent common/compromised passwords, and support password managers (no max length limit below 128 characters).',
        applies: (config) => config.auth !== 'none',
        mitigation:
          'Configure auth provider with minimum password length (12). Check passwords against HaveIBeenPwned API. Disallow context-specific words (app name, username). Support passkeys and passwordless authentication as alternatives.',
      },
      {
        id: 'sec-account-lockout',
        category: 'access-control',
        description:
          'If authentication is enabled, implement account lockout after consecutive failed login attempts (5-10 attempts within a sliding window). Implement progressive delays (exponential backoff) and IP-based rate limiting to prevent brute force and credential stuffing attacks.',
        applies: (config) => config.auth !== 'none',
        mitigation:
          'Configure lockout after 5 failed attempts within 15 minutes. Implement exponential backoff (1s → 2s → 4s → 8s). Rate-limit login endpoints by IP (20 requests/minute). Notify users of lockout events and provide self-service unlock via email.',
      },
      {
        id: 'sec-file-validation',
        category: 'security',
        description:
          'If file uploads are enabled, validate file types by content (magic bytes), not extension. Enforce maximum file size limits. Restrict allowed MIME types to a whitelist. Scan filenames for path traversal attacks.',
        applies: (config) => config.fileStorage !== 'none',
        mitigation:
          'Validate file types server-side using magic bytes (libmagic). Enforce per-file and per-request size limits. Whitelist allowed extensions and MIME types. Sanitize filenames to prevent path traversal. Process uploads in an isolated environment.',
      },
      {
        id: 'sec-malware-scanning',
        category: 'security',
        description:
          'If file uploads are enabled, implement malware scanning on all uploaded files. Scan synchronously before accepting uploads or asynchronously with quarantine. Consider ClamAV or cloud-based scanning services.',
        applies: (config) => config.fileStorage !== 'none',
        mitigation:
          'Integrate ClamAV or a cloud malware scanning API (VirusTotal, AWS GuardDuty). Quarantine unscanned files. Block known malicious file types (.exe, .bat, .dll) unless explicitly needed. Scan files on download as well as upload.',
      },
      {
        id: 'sec-api-key-rotation',
        category: 'api-security',
        description:
          'If a public API is exposed, implement an API key rotation policy. Support multiple active keys per client to enable zero-downtime rotation. Keys must be revocable. Document key rotation interval (recommended: 90 days).',
        applies: (config) => config.hasPublicApi,
        mitigation:
          'Support multiple concurrent API keys per client. Implement key creation, revocation, and expiry. Notify clients before key expiry. Provide a self-service key management portal. Allow key scoping by endpoint and method.',
      },
      {
        id: 'sec-rate-limiting',
        category: 'api-security',
        description:
          'If a public API is exposed, implement rate limiting at the API gateway or application layer. Configure per-key and per-IP limits. Return standard 429 Too Many Requests with Retry-After header and clear error messages.',
        applies: (config) => config.hasPublicApi,
        mitigation:
          'Configure API rate limiting (e.g., 100 requests/minute per key, 1000/hour per IP). Use sliding window or token bucket algorithm. Return 429 with Retry-After header. Implement burst allowance for short spikes. Monitor and alert on rate limit hits.',
      },
      {
        id: 'sec-webhook-signing',
        category: 'security',
        description:
          'If webhooks are sent or received, implement cryptographic signature verification (HMAC-SHA256). Sign outgoing webhooks with a shared secret. Verify incoming webhooks before processing. Use timestamp validation to prevent replay attacks.',
        applies: (config) => config.hasWebhooks,
        mitigation:
          'Sign outgoing webhooks with HMAC-SHA256 using a per-endpoint secret. Verify incoming webhook signatures before payload processing. Include timestamp in signature and reject payloads older than 5 minutes. Rotate webhook secrets periodically.',
      },
      {
        id: 'sec-vendor-assessment',
        category: 'security',
        description:
          "If third-party APIs are integrated, conduct a vendor security assessment. Review the vendor's SOC 2 report, penetration test results, data processing practices, and incident response capabilities. Maintain a vendor risk register.",
        applies: (config) => config.thirdPartyApis.length > 0,
        mitigation:
          'Request SOC 2 Type II report from each critical vendor. Review vendor security documentation and certifications (ISO 27001, PCI-DSS). Document data shared with each vendor. Establish a vendor review cadence (annual for critical, biannual for others).',
      },
    ],
  },
]
