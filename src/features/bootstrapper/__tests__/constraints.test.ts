import { describe, it, expect } from 'vitest'
import { CONSTRAINTS, validateConfig } from '../engine/constraints'
import type { BootConfig } from '../types'

/* ------------------------------------------------------------------ */
/*  Test helpers                                                      */
/* ------------------------------------------------------------------ */

function constraint(id: string) {
  // Use the violation message as a fingerprint since constraints are
  // unnamed objects.  We index by the nth occurrence for known messages.
  const msgs: Record<string, (idx?: number) => number> = {
    'vercel-sqlite': () => 0,
    'vercel-mongodb': () => 1,
    'dynamodb-not-aws': () => 2,
    'sqlite-provider': () => 3,
    'postgresql-turso': () => 4,
    'mysql-planetscale': () => 5,
    'nextauth-relational-db': () => 6,
    'supabase-auth-provider': () => 7,
    'saml-no-auth0': () => 8,
    'sso-no-auth': () => 9,
    'sso-jwt': () => 10,
    'gdpr-tracking': () => 11,
    'gdpr-ga': () => 12,
    'gdpr-retention': () => 13,
    'gdpr-region': () => 14,
    'pipeda-tracking': () => 15,
    'lgpd-retention': () => 16,
    'lgpd-tracking': () => 17,
    'payments-pci': () => 18,
    'payments-email': () => 19,
    'scale-sqlite': () => 20,
    'scale-mongodb': () => 21,
    'security-tracking': () => 22,
    'speed-mfa': () => 23,
    'security-ga': () => 24,
    'tracking-no-analytics': () => 25,
    'vercel-filestorage': () => 26,
    'scale-monitoring': () => 27,
    'api-monitoring': () => 28,
    'team-ci': () => 29,
    'nextjs-hosting': () => 30,
    'remix-vercel': () => 31,
    'astro-gcp': () => 32,
    'filestorage-payments': () => 33,
    'slack-webhooks': () => 34,
    'teams-microsoft': () => 35,
    'zoom-auth': () => 36,
    'comm-webhooks': () => 37,
    'comm-email': () => 38,
    'comm-gdpr': () => 39,
  }

  const idx = msgs[id]()
  const c = CONSTRAINTS[idx]
  return {
    applies: (config: Record<string, unknown>) => c.applies(config),
    violations: (config: Record<string, unknown>) => c.violations(config),
  }
}

/* ------------------------------------------------------------------ */
/*  Category: Hosting / Database Compatibility                        */
/* ------------------------------------------------------------------ */

describe('Hosting / Database Compatibility', () => {
  it('vercel + sqlite yields error', () => {
    const c = constraint('vercel-sqlite')
    const config = { hosting: 'vercel' as const, database: 'sqlite' as const }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)).toHaveLength(1)
    expect(c.violations(config)[0].severity).toBe('error')
  })

  it('vercel + sqlite does not apply when database is postgresql', () => {
    const c = constraint('vercel-sqlite')
    expect(c.applies({ hosting: 'vercel', database: 'postgresql' })).toBe(false)
  })

  it('vercel + mongodb yields warning', () => {
    const c = constraint('vercel-mongodb')
    const config = { hosting: 'vercel' as const, database: 'mongodb' as const }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })

  it('vercel + mongodb does not apply when database is postgresql', () => {
    const c = constraint('vercel-mongodb')
    expect(c.applies({ hosting: 'vercel', database: 'postgresql' })).toBe(false)
  })

  it('dynamodb outside aws yields warning', () => {
    const c = constraint('dynamodb-not-aws')
    const config = {
      database: 'dynamodb' as const,
      hosting: 'vercel' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })

  it('dynamodb on aws does not apply', () => {
    const c = constraint('dynamodb-not-aws')
    expect(c.applies({ database: 'dynamodb', hosting: 'aws' })).toBe(false)
  })
})

/* ------------------------------------------------------------------ */
/*  Category: Database ↔ Provider Compatibility                       */
/* ------------------------------------------------------------------ */

describe('Database ↔ Provider Compatibility', () => {
  it('sqlite with unsupported provider yields error', () => {
    const c = constraint('sqlite-provider')
    const config = {
      database: 'sqlite' as const,
      databaseProvider: 'supabase' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('error')
  })

  it('sqlite with turso does not apply', () => {
    const c = constraint('sqlite-provider')
    expect(c.applies({ database: 'sqlite', databaseProvider: 'turso' })).toBe(
      false,
    )
  })

  it('sqlite with self-hosted does not apply', () => {
    const c = constraint('sqlite-provider')
    expect(
      c.applies({ database: 'sqlite', databaseProvider: 'self-hosted' }),
    ).toBe(false)
  })

  it('non-sqlite database does not trigger sqlite-provider constraint', () => {
    const c = constraint('sqlite-provider')
    expect(
      c.applies({ database: 'postgresql', databaseProvider: 'supabase' }),
    ).toBe(false)
  })

  it('postgresql + turso yields error', () => {
    const c = constraint('postgresql-turso')
    const config = {
      database: 'postgresql' as const,
      databaseProvider: 'turso' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('error')
  })

  it('postgresql + neon does not apply', () => {
    const c = constraint('postgresql-turso')
    expect(
      c.applies({ database: 'postgresql', databaseProvider: 'neon' }),
    ).toBe(false)
  })

  it('mysql + planetscale yields warning', () => {
    const c = constraint('mysql-planetscale')
    const config = {
      database: 'mysql' as const,
      databaseProvider: 'planetscale' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })

  it('mysql + supabase does not apply', () => {
    const c = constraint('mysql-planetscale')
    expect(c.applies({ database: 'mysql', databaseProvider: 'supabase' })).toBe(
      false,
    )
  })
})

/* ------------------------------------------------------------------ */
/*  Category: Auth / Database Requirements                            */
/* ------------------------------------------------------------------ */

describe('Auth / Database Requirements', () => {
  it('next-auth without postgresql/mysql yields error', () => {
    const c = constraint('nextauth-relational-db')
    const config = {
      auth: 'next-auth' as const,
      database: 'sqlite' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('error')
  })

  it('next-auth with postgresql does not apply', () => {
    const c = constraint('nextauth-relational-db')
    expect(c.applies({ auth: 'next-auth', database: 'postgresql' })).toBe(false)
  })

  it('non-next-auth does not trigger constraint', () => {
    const c = constraint('nextauth-relational-db')
    expect(c.applies({ auth: 'clerk', database: 'sqlite' })).toBe(false)
  })

  it('supabase-auth with non-supabase provider yields error', () => {
    const c = constraint('supabase-auth-provider')
    const config = {
      auth: 'supabase-auth' as const,
      databaseProvider: 'neon' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('error')
  })

  it('supabase-auth with supabase provider does not apply', () => {
    const c = constraint('supabase-auth-provider')
    expect(
      c.applies({ auth: 'supabase-auth', databaseProvider: 'supabase' }),
    ).toBe(false)
  })

  it('non-supabase-auth does not trigger constraint', () => {
    const c = constraint('supabase-auth-provider')
    expect(c.applies({ auth: 'clerk', databaseProvider: 'neon' })).toBe(false)
  })
})

/* ------------------------------------------------------------------ */
/*  Category: SSO Providers                                            */
/* ------------------------------------------------------------------ */

describe('SSO Providers', () => {
  it('saml without auth0 yields warning', () => {
    const c = constraint('saml-no-auth0')
    const config = { ssoProviders: ['saml'], auth: 'clerk' as const }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })

  it('saml with auth0 does not apply', () => {
    const c = constraint('saml-no-auth0')
    expect(c.applies({ ssoProviders: ['saml'], auth: 'auth0' })).toBe(false)
  })

  it('non-saml sso providers do not trigger', () => {
    const c = constraint('saml-no-auth0')
    expect(c.applies({ ssoProviders: ['google'], auth: 'clerk' })).toBe(false)
  })

  it('sso providers with no auth yields error', () => {
    const c = constraint('sso-no-auth')
    const config = {
      ssoProviders: ['google'],
      auth: 'none' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('error')
  })

  it('empty sso providers with no auth does not apply', () => {
    const c = constraint('sso-no-auth')
    expect(c.applies({ ssoProviders: [], auth: 'none' })).toBe(false)
  })

  it('sso providers with jwt yields warning', () => {
    const c = constraint('sso-jwt')
    const config = { ssoProviders: ['google'], auth: 'jwt' as const }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })

  it('empty sso providers with jwt does not apply', () => {
    const c = constraint('sso-jwt')
    expect(c.applies({ ssoProviders: [], auth: 'jwt' })).toBe(false)
  })
})

/* ------------------------------------------------------------------ */
/*  Category: GDPR Compliance                                          */
/* ------------------------------------------------------------------ */

describe('GDPR / EU-UK Compliance', () => {
  it('eu market with full tracking yields error', () => {
    const c = constraint('gdpr-tracking')
    const config = {
      targetMarkets: ['eu'],
      userTracking: 'full' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('error')
  })

  it('eu market with analytics tracking yields error', () => {
    const c = constraint('gdpr-tracking')
    expect(
      c.applies({ targetMarkets: ['eu'], userTracking: 'analytics' }),
    ).toBe(true)
  })

  it('eu market with minimal tracking does not apply', () => {
    const c = constraint('gdpr-tracking')
    expect(c.applies({ targetMarkets: ['eu'], userTracking: 'minimal' })).toBe(
      false,
    )
  })

  it('eu market with no tracking does not apply', () => {
    const c = constraint('gdpr-tracking')
    expect(c.applies({ targetMarkets: ['eu'], userTracking: 'none' })).toBe(
      false,
    )
  })

  it('us market with full tracking does not apply', () => {
    const c = constraint('gdpr-tracking')
    expect(c.applies({ targetMarkets: ['us'], userTracking: 'full' })).toBe(
      false,
    )
  })

  it('eu market with google-analytics yields warning', () => {
    const c = constraint('gdpr-ga')
    const config = {
      targetMarkets: ['eu'],
      analyticsProvider: 'google-analytics' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })

  it('uk market with google-analytics yields warning', () => {
    const c = constraint('gdpr-ga')
    expect(
      c.applies({
        targetMarkets: ['uk'],
        analyticsProvider: 'google-analytics',
      }),
    ).toBe(true)
  })

  it('eu market with plausible does not apply', () => {
    const c = constraint('gdpr-ga')
    expect(
      c.applies({ targetMarkets: ['eu'], analyticsProvider: 'plausible' }),
    ).toBe(false)
  })

  it('eu market with retention > 730 days yields warning', () => {
    const c = constraint('gdpr-retention')
    const config = { targetMarkets: ['eu'], dataRetentionDays: 731 }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })

  it('eu market with retention exactly 730 does not apply', () => {
    const c = constraint('gdpr-retention')
    expect(c.applies({ targetMarkets: ['eu'], dataRetentionDays: 730 })).toBe(
      false,
    )
  })

  it('us market with high retention does not apply', () => {
    const c = constraint('gdpr-retention')
    expect(c.applies({ targetMarkets: ['us'], dataRetentionDays: 1000 })).toBe(
      false,
    )
  })

  it('eu market with non-eu hosting region yields warning', () => {
    const c = constraint('gdpr-region')
    const config = {
      targetMarkets: ['eu'],
      hostingRegion: 'us-east-1',
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })

  it('eu market with eu-west-1 does not apply', () => {
    const c = constraint('gdpr-region')
    expect(
      c.applies({ targetMarkets: ['eu'], hostingRegion: 'eu-west-1' }),
    ).toBe(false)
  })

  it('eu market with eu-central-1 does not apply', () => {
    const c = constraint('gdpr-region')
    expect(
      c.applies({ targetMarkets: ['eu'], hostingRegion: 'eu-central-1' }),
    ).toBe(false)
  })

  it('us market with non-eu region does not apply', () => {
    const c = constraint('gdpr-region')
    expect(
      c.applies({ targetMarkets: ['us'], hostingRegion: 'us-east-1' }),
    ).toBe(false)
  })
})

/* ------------------------------------------------------------------ */
/*  Category: PIPEDA (CA)                                              */
/* ------------------------------------------------------------------ */

describe('PIPEDA / Canada Compliance', () => {
  it('ca market with full tracking yields warning', () => {
    const c = constraint('pipeda-tracking')
    const config = {
      targetMarkets: ['ca'],
      userTracking: 'full' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })

  it('ca market with analytics tracking does not apply', () => {
    const c = constraint('pipeda-tracking')
    expect(
      c.applies({ targetMarkets: ['ca'], userTracking: 'analytics' }),
    ).toBe(false)
  })

  it('us market with full tracking does not apply', () => {
    const c = constraint('pipeda-tracking')
    expect(c.applies({ targetMarkets: ['us'], userTracking: 'full' })).toBe(
      false,
    )
  })
})

/* ------------------------------------------------------------------ */
/*  Category: LGPD (BR)                                                */
/* ------------------------------------------------------------------ */

describe('LGPD / Brazil Compliance', () => {
  it('br market with 0 retention yields error', () => {
    const c = constraint('lgpd-retention')
    const config = { targetMarkets: ['br'], dataRetentionDays: 0 }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('error')
  })

  it('br market with positive retention does not apply', () => {
    const c = constraint('lgpd-retention')
    expect(c.applies({ targetMarkets: ['br'], dataRetentionDays: 365 })).toBe(
      false,
    )
  })

  it('us market with 0 retention does not apply', () => {
    const c = constraint('lgpd-retention')
    expect(c.applies({ targetMarkets: ['us'], dataRetentionDays: 0 })).toBe(
      false,
    )
  })

  it('br market with analytics tracking yields warning', () => {
    const c = constraint('lgpd-tracking')
    const config = {
      targetMarkets: ['br'],
      userTracking: 'analytics' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })

  it('br market with minimal tracking does not apply', () => {
    const c = constraint('lgpd-tracking')
    expect(c.applies({ targetMarkets: ['br'], userTracking: 'minimal' })).toBe(
      false,
    )
  })
})

/* ------------------------------------------------------------------ */
/*  Category: Payments / PCI-DSS                                      */
/* ------------------------------------------------------------------ */

describe('Payments / PCI-DSS', () => {
  it('any payments provider yields warning', () => {
    const c = constraint('payments-pci')
    const config = { payments: 'stripe' as const }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })

  it('no payments does not apply', () => {
    const c = constraint('payments-pci')
    expect(c.applies({ payments: 'none' })).toBe(false)
  })

  it('payments without email provider yields warning', () => {
    const c = constraint('payments-email')
    const config = {
      payments: 'stripe' as const,
      emailProvider: 'none' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })

  it('payments with email provider does not apply', () => {
    const c = constraint('payments-email')
    expect(c.applies({ payments: 'stripe', emailProvider: 'resend' })).toBe(
      false,
    )
  })
})

/* ------------------------------------------------------------------ */
/*  Category: Scale / Database Appropriateness                        */
/* ------------------------------------------------------------------ */

describe('Scale / Database Appropriateness', () => {
  it('large user count with sqlite yields error', () => {
    const c = constraint('scale-sqlite')
    const config = {
      expectedUserCount: '1k-10k' as const,
      database: 'sqlite' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('error')
  })

  it('small user count with sqlite does not apply', () => {
    const c = constraint('scale-sqlite')
    expect(c.applies({ expectedUserCount: '1-100', database: 'sqlite' })).toBe(
      false,
    )
  })

  it('medium user count with sqlite does not apply', () => {
    const c = constraint('scale-sqlite')
    expect(c.applies({ expectedUserCount: '100-1k', database: 'sqlite' })).toBe(
      false,
    )
  })

  it('100k+ with mongodb yields warning', () => {
    const c = constraint('scale-mongodb')
    const config = {
      expectedUserCount: '100k+' as const,
      database: 'mongodb' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })

  it('small user count with mongodb does not apply', () => {
    const c = constraint('scale-mongodb')
    expect(
      c.applies({ expectedUserCount: '1k-10k', database: 'mongodb' }),
    ).toBe(false)
  })
})

/* ------------------------------------------------------------------ */
/*  Category: Performance / Security Tradeoffs                        */
/* ------------------------------------------------------------------ */

describe('Performance / Security Tradeoffs', () => {
  it('security profile with tracking yields warning', () => {
    const c = constraint('security-tracking')
    const config = {
      performanceProfile: 'security' as const,
      userTracking: 'minimal' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })

  it('security profile with no tracking does not apply', () => {
    const c = constraint('security-tracking')
    expect(
      c.applies({ performanceProfile: 'security', userTracking: 'none' }),
    ).toBe(false)
  })

  it('speed profile without mfa and with auth yields warning', () => {
    const c = constraint('speed-mfa')
    const config = {
      performanceProfile: 'speed' as const,
      mfaRequired: false,
      auth: 'jwt' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })

  it('speed profile with mfa enabled does not apply', () => {
    const c = constraint('speed-mfa')
    expect(
      c.applies({
        performanceProfile: 'speed',
        mfaRequired: true,
        auth: 'jwt',
      }),
    ).toBe(false)
  })

  it('speed profile with no auth does not apply', () => {
    const c = constraint('speed-mfa')
    expect(
      c.applies({
        performanceProfile: 'speed',
        mfaRequired: false,
        auth: 'none',
      }),
    ).toBe(false)
  })

  it('security profile with google-analytics yields warning', () => {
    const c = constraint('security-ga')
    const config = {
      performanceProfile: 'security' as const,
      analyticsProvider: 'google-analytics' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })

  it('security profile with plausible does not apply', () => {
    const c = constraint('security-ga')
    expect(
      c.applies({
        performanceProfile: 'security',
        analyticsProvider: 'plausible',
      }),
    ).toBe(false)
  })
})

/* ------------------------------------------------------------------ */
/*  Category: Analytics ↔ Tracking                                    */
/* ------------------------------------------------------------------ */

describe('Analytics ↔ Tracking', () => {
  it('analytics tracking without provider yields error', () => {
    const c = constraint('tracking-no-analytics')
    const config = {
      userTracking: 'analytics' as const,
      analyticsProvider: 'none' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('error')
  })

  it('full tracking without provider yields error', () => {
    const c = constraint('tracking-no-analytics')
    expect(c.applies({ userTracking: 'full', analyticsProvider: 'none' })).toBe(
      true,
    )
  })

  it('analytics tracking with plausible does not apply', () => {
    const c = constraint('tracking-no-analytics')
    expect(
      c.applies({ userTracking: 'analytics', analyticsProvider: 'plausible' }),
    ).toBe(false)
  })

  it('no tracking without provider does not apply', () => {
    const c = constraint('tracking-no-analytics')
    expect(c.applies({ userTracking: 'none', analyticsProvider: 'none' })).toBe(
      false,
    )
  })
})

/* ------------------------------------------------------------------ */
/*  Category: Storage Requirements                                     */
/* ------------------------------------------------------------------ */

describe('Storage Requirements', () => {
  it('non-vercel file storage on vercel yields warning', () => {
    const c = constraint('vercel-filestorage')
    const config = {
      fileStorage: 's3' as const,
      hosting: 'vercel' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })

  it('vercel-blob on vercel does not apply', () => {
    const c = constraint('vercel-filestorage')
    expect(c.applies({ fileStorage: 'vercel-blob', hosting: 'vercel' })).toBe(
      false,
    )
  })

  it('supabase-storage on vercel does not apply', () => {
    const c = constraint('vercel-filestorage')
    expect(
      c.applies({ fileStorage: 'supabase-storage', hosting: 'vercel' }),
    ).toBe(false)
  })

  it('no file storage on vercel does not apply', () => {
    const c = constraint('vercel-filestorage')
    expect(c.applies({ fileStorage: 'none', hosting: 'vercel' })).toBe(false)
  })

  it('non-vercel storage on aws does not apply', () => {
    const c = constraint('vercel-filestorage')
    expect(c.applies({ fileStorage: 's3', hosting: 'aws' })).toBe(false)
  })
})

/* ------------------------------------------------------------------ */
/*  Category: Monitoring                                               */
/* ------------------------------------------------------------------ */

describe('Monitoring', () => {
  it('large user count without monitoring yields warning', () => {
    const c = constraint('scale-monitoring')
    const config = {
      expectedUserCount: '1k-10k' as const,
      monitoring: 'none' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })

  it('small user count without monitoring does not apply', () => {
    const c = constraint('scale-monitoring')
    expect(c.applies({ expectedUserCount: '1-100', monitoring: 'none' })).toBe(
      false,
    )
  })

  it('medium user count without monitoring does not apply', () => {
    const c = constraint('scale-monitoring')
    expect(c.applies({ expectedUserCount: '100-1k', monitoring: 'none' })).toBe(
      false,
    )
  })

  it('public api without monitoring yields warning', () => {
    const c = constraint('api-monitoring')
    const config = {
      hasPublicApi: true,
      hasWebhooks: false,
      monitoring: 'none' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })

  it('webhooks without monitoring yields warning', () => {
    const c = constraint('api-monitoring')
    expect(
      c.applies({
        hasPublicApi: false,
        hasWebhooks: true,
        monitoring: 'none',
      }),
    ).toBe(true)
  })

  it('no api or webhooks without monitoring does not apply', () => {
    const c = constraint('api-monitoring')
    expect(
      c.applies({
        hasPublicApi: false,
        hasWebhooks: false,
        monitoring: 'none',
      }),
    ).toBe(false)
  })
})

/* ------------------------------------------------------------------ */
/*  Category: CI / Team Size                                           */
/* ------------------------------------------------------------------ */

describe('CI / Team Size', () => {
  it('non-solo team without CI yields warning', () => {
    const c = constraint('team-ci')
    const config = {
      expectedTeamSize: 'small-team' as const,
      ciProvider: 'none' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })

  it('solo without CI does not apply', () => {
    const c = constraint('team-ci')
    expect(c.applies({ expectedTeamSize: 'solo', ciProvider: 'none' })).toBe(
      false,
    )
  })
})

/* ------------------------------------------------------------------ */
/*  Category: Framework / Hosting Optimization                        */
/* ------------------------------------------------------------------ */

describe('Framework / Hosting Optimization', () => {
  it('nextjs on non-vercel/aws hosting yields warning', () => {
    const c = constraint('nextjs-hosting')
    const config = {
      framework: 'nextjs' as const,
      hosting: 'gcp' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })

  it('nextjs on vercel does not apply', () => {
    const c = constraint('nextjs-hosting')
    expect(c.applies({ framework: 'nextjs', hosting: 'vercel' })).toBe(false)
  })

  it('nextjs on aws does not apply', () => {
    const c = constraint('nextjs-hosting')
    expect(c.applies({ framework: 'nextjs', hosting: 'aws' })).toBe(false)
  })

  it('remix on vercel yields warning', () => {
    const c = constraint('remix-vercel')
    const config = {
      framework: 'remix' as const,
      hosting: 'vercel' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })

  it('remix on fly/aws does not apply', () => {
    const c = constraint('remix-vercel')
    expect(c.applies({ framework: 'remix', hosting: 'aws' })).toBe(false)
  })

  it('astro on gcp yields warning', () => {
    const c = constraint('astro-gcp')
    const config = {
      framework: 'astro' as const,
      hosting: 'gcp' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })

  it('astro on vercel does not apply', () => {
    const c = constraint('astro-gcp')
    expect(c.applies({ framework: 'astro', hosting: 'vercel' })).toBe(false)
  })
})

/* ------------------------------------------------------------------ */
/*  Category: File Storage / Payments                                  */
/* ------------------------------------------------------------------ */

describe('File Storage / Payments', () => {
  it('filestorage + payments in regulated market yields warning', () => {
    const c = constraint('filestorage-payments')
    const config = {
      fileStorage: 's3' as const,
      payments: 'stripe' as const,
      targetMarkets: ['eu'],
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })

  it('multiple regulated markets all trigger', () => {
    const c = constraint('filestorage-payments')
    expect(
      c.applies({
        fileStorage: 's3',
        payments: 'stripe',
        targetMarkets: ['uk'],
      }),
    ).toBe(true)
    expect(
      c.applies({
        fileStorage: 's3',
        payments: 'stripe',
        targetMarkets: ['ca'],
      }),
    ).toBe(true)
    expect(
      c.applies({
        fileStorage: 's3',
        payments: 'stripe',
        targetMarkets: ['br'],
      }),
    ).toBe(true)
  })

  it('us market with filestorage + payments does not apply', () => {
    const c = constraint('filestorage-payments')
    expect(
      c.applies({
        fileStorage: 's3',
        payments: 'stripe',
        targetMarkets: ['us'],
      }),
    ).toBe(false)
  })

  it('no filestorage with payments does not apply', () => {
    const c = constraint('filestorage-payments')
    expect(
      c.applies({
        fileStorage: 'none',
        payments: 'stripe',
        targetMarkets: ['eu'],
      }),
    ).toBe(false)
  })
})

/* ------------------------------------------------------------------ */
/*  Category: Communication Platforms                                  */
/* ------------------------------------------------------------------ */

describe('Communication Platforms', () => {
  it('slack without webhooks yields warning', () => {
    const c = constraint('slack-webhooks')
    const config = {
      communicationPlatforms: ['slack'],
      hasWebhooks: false,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })

  it('slack with webhooks does not apply', () => {
    const c = constraint('slack-webhooks')
    expect(
      c.applies({ communicationPlatforms: ['slack'], hasWebhooks: true }),
    ).toBe(false)
  })

  it('teams without microsoft sso and bad auth yields error', () => {
    const c = constraint('teams-microsoft')
    const config = {
      communicationPlatforms: ['teams'],
      ssoProviders: [],
      auth: 'none' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('error')
  })

  it('teams with jwt auth yields error', () => {
    const c = constraint('teams-microsoft')
    expect(
      c.applies({
        communicationPlatforms: ['teams'],
        ssoProviders: [],
        auth: 'jwt',
      }),
    ).toBe(true)
  })

  it('teams with microsoft sso does not apply', () => {
    const c = constraint('teams-microsoft')
    expect(
      c.applies({
        communicationPlatforms: ['teams'],
        ssoProviders: ['microsoft'],
        auth: 'none',
      }),
    ).toBe(false)
  })

  it('teams with next-auth does not apply', () => {
    const c = constraint('teams-microsoft')
    expect(
      c.applies({
        communicationPlatforms: ['teams'],
        ssoProviders: [],
        auth: 'next-auth',
      }),
    ).toBe(false)
  })

  it('zoom without auth yields error', () => {
    const c = constraint('zoom-auth')
    const config = {
      communicationPlatforms: ['zoom'],
      auth: 'none' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('error')
  })

  it('zoom with auth does not apply', () => {
    const c = constraint('zoom-auth')
    expect(
      c.applies({ communicationPlatforms: ['zoom'], auth: 'next-auth' }),
    ).toBe(false)
  })

  it('any communication platform without webhooks yields warning', () => {
    const c = constraint('comm-webhooks')
    const config = {
      communicationPlatforms: ['slack'],
      hasWebhooks: false,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })

  it('communication platforms with webhooks does not apply', () => {
    const c = constraint('comm-webhooks')
    expect(
      c.applies({ communicationPlatforms: ['slack'], hasWebhooks: true }),
    ).toBe(false)
  })

  it('no communication platforms does not apply', () => {
    const c = constraint('comm-webhooks')
    expect(c.applies({ communicationPlatforms: [], hasWebhooks: false })).toBe(
      false,
    )
  })

  it('communication platforms without email yields warning', () => {
    const c = constraint('comm-email')
    const config = {
      communicationPlatforms: ['slack'],
      emailProvider: 'none' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })

  it('communication platforms with email does not apply', () => {
    const c = constraint('comm-email')
    expect(
      c.applies({ communicationPlatforms: ['slack'], emailProvider: 'resend' }),
    ).toBe(false)
  })

  it('communication platforms in eu/uk market yields warning', () => {
    const c = constraint('comm-gdpr')
    const config = {
      communicationPlatforms: ['slack'],
      targetMarkets: ['eu'],
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })

  it('communication platforms in uk market yields warning', () => {
    const c = constraint('comm-gdpr')
    expect(
      c.applies({ communicationPlatforms: ['slack'], targetMarkets: ['uk'] }),
    ).toBe(true)
  })

  it('communication platforms in us market does not apply', () => {
    const c = constraint('comm-gdpr')
    expect(
      c.applies({ communicationPlatforms: ['slack'], targetMarkets: ['us'] }),
    ).toBe(false)
  })

  it('no communication platforms does not trigger', () => {
    const c = constraint('comm-gdpr')
    expect(
      c.applies({ communicationPlatforms: [], targetMarkets: ['eu'] }),
    ).toBe(false)
  })
})

/* ------------------------------------------------------------------ */
/*  Category: validateConfig (integration)                             */
/* ------------------------------------------------------------------ */

describe('validateConfig integration', () => {
  it('returns no violations for a well-formed config', () => {
    const config: Partial<BootConfig> = {
      hosting: 'aws',
      database: 'postgresql',
      databaseProvider: 'supabase',
      auth: 'next-auth',
      ssoProviders: ['google'],
      targetMarkets: ['us'],
      dataRetentionDays: 365,
      userTracking: 'none',
      analyticsProvider: 'none',
      payments: 'none',
      expectedUserCount: '1-100',
      performanceProfile: 'balanced',
      fileStorage: 'none',
      monitoring: 'sentry',
      hasPublicApi: false,
      hasWebhooks: false,
      expectedTeamSize: 'solo',
      ciProvider: 'none',
      framework: 'nextjs',
      hostingRegion: 'us-east-1',
      emailProvider: 'resend',
      communicationPlatforms: [],
      mfaRequired: false,
    }
    expect(validateConfig(config)).toHaveLength(0)
  })

  it('returns violations for a config that breaks many rules', () => {
    const config: Partial<BootConfig> = {
      hosting: 'vercel',
      hostingRegion: 'us-east-1',
      database: 'sqlite',
      databaseProvider: 'supabase',
      auth: 'none',
      ssoProviders: ['google'],
      targetMarkets: ['eu'],
      dataRetentionDays: 0,
      userTracking: 'full',
      analyticsProvider: 'none',
      payments: 'stripe',
      emailProvider: 'none',
      expectedUserCount: '10k-100k',
      performanceProfile: 'security',
      fileStorage: 's3',
      monitoring: 'none',
      hasPublicApi: true,
      hasWebhooks: false,
      expectedTeamSize: 'mid-team',
      ciProvider: 'none',
      framework: 'nextjs',
      communicationPlatforms: ['slack'],
      mfaRequired: false,
    }
    const violations = validateConfig(config)
    expect(violations.length).toBeGreaterThan(0)
  })

  it('returns violations for eu analytics tracking config', () => {
    const config: Partial<BootConfig> = {
      targetMarkets: ['eu'],
      userTracking: 'full',
      analyticsProvider: 'google-analytics',
    }
    const violations = validateConfig(config)
    // Should get GDPR tracking error + GDPR GA warning + GDPR region warning
    expect(violations.some((v) => v.field === 'userTracking')).toBe(true)
    expect(violations.some((v) => v.field === 'analyticsProvider')).toBe(true)
  })

  it('returns violations for team without CI', () => {
    const config: Partial<BootConfig> = {
      expectedTeamSize: 'mid-team',
      ciProvider: 'none',
      expectedUserCount: '1-100',
    }
    const violations = validateConfig(config)
    expect(violations.some((v) => v.field === 'ciProvider')).toBe(true)
  })

  it('returns violations for SSO without auth backend', () => {
    const config: Partial<BootConfig> = {
      auth: 'none',
      ssoProviders: ['google', 'github'],
    }
    const violations = validateConfig(config)
    expect(violations.some((v) => v.field === 'auth')).toBe(true)
  })
})

/* ------------------------------------------------------------------ */
/*  Category: Scale / Database Appropriateness — Edge Cases            */
/* ------------------------------------------------------------------ */

describe('Scale / Database Appropriateness — edge cases', () => {
  it('scale-sqlite with 10k-100k users applies', () => {
    const c = constraint('scale-sqlite')
    const config = {
      expectedUserCount: '10k-100k' as const,
      database: 'sqlite' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('error')
  })

  it('scale-sqlite with 100k+ users applies', () => {
    const c = constraint('scale-sqlite')
    const config = {
      expectedUserCount: '100k+' as const,
      database: 'sqlite' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('error')
  })

  it('scale-sqlite with 100-1k users does not apply (boundary)', () => {
    const c = constraint('scale-sqlite')
    expect(c.applies({ expectedUserCount: '100-1k', database: 'sqlite' })).toBe(
      false,
    )
  })

  it('scale-mongodb with 1k-10k users does not apply (boundary)', () => {
    const c = constraint('scale-mongodb')
    expect(
      c.applies({ expectedUserCount: '1k-10k', database: 'mongodb' }),
    ).toBe(false)
  })

  it('scale-mongodb with 10k-100k users does not apply', () => {
    const c = constraint('scale-mongodb')
    expect(
      c.applies({ expectedUserCount: '10k-100k', database: 'mongodb' }),
    ).toBe(false)
  })
})

/* ------------------------------------------------------------------ */
/*  Category: Multi-Market Constraint Combinations                     */
/* ------------------------------------------------------------------ */

describe('Multi-Market Constraint Combinations', () => {
  it('eu and uk markets both trigger gdpr-tracking', () => {
    const c = constraint('gdpr-tracking')
    expect(
      c.applies({
        targetMarkets: ['eu', 'uk'],
        userTracking: 'full',
      }),
    ).toBe(true)
  })

  it('eu and uk markets both trigger gdpr-ga', () => {
    const c = constraint('gdpr-ga')
    expect(
      c.applies({
        targetMarkets: ['eu', 'uk'],
        analyticsProvider: 'google-analytics',
      }),
    ).toBe(true)
  })

  it('eu and uk markets with google-analytics yields violation', () => {
    const c = constraint('gdpr-ga')
    const config = {
      targetMarkets: ['eu', 'uk'],
      analyticsProvider: 'google-analytics' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config).length).toBeGreaterThan(0)
  })

  it('filestorage-payments with au market does not apply', () => {
    const c = constraint('filestorage-payments')
    expect(
      c.applies({
        fileStorage: 's3',
        payments: 'stripe',
        targetMarkets: ['au'],
      }),
    ).toBe(false)
  })

  it('filestorage-payments with ca market applies', () => {
    const c = constraint('filestorage-payments')
    expect(
      c.applies({
        fileStorage: 's3',
        payments: 'stripe',
        targetMarkets: ['ca'],
      }),
    ).toBe(true)
  })

  it('multiple markets with full tracking triggers only GDPR for EU/UK', () => {
    const c = constraint('gdpr-tracking')
    expect(
      c.applies({
        targetMarkets: ['eu', 'uk', 'us', 'ca'],
        userTracking: 'full',
      }),
    ).toBe(true)
  })
})

/* ------------------------------------------------------------------ */
/*  Category: Cross-Field Interaction Edge Cases                       */
/* ------------------------------------------------------------------ */

describe('Cross-Field Interaction Edge Cases', () => {
  it('payments=stripe with emailProvider=none triggers payments-email', () => {
    const c = constraint('payments-email')
    const config = {
      payments: 'stripe' as const,
      emailProvider: 'none' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })

  it('teams with jwt and no microsoft sso applies teams-microsoft', () => {
    const c = constraint('teams-microsoft')
    const config = {
      communicationPlatforms: ['teams'],
      ssoProviders: [],
      auth: 'jwt' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('error')
  })

  it('teams with auth=clerk does not apply teams-microsoft', () => {
    const c = constraint('teams-microsoft')
    expect(
      c.applies({
        communicationPlatforms: ['teams'],
        ssoProviders: [],
        auth: 'clerk',
      }),
    ).toBe(false)
  })

  it('zoom with auth=supabase-auth does not apply', () => {
    const c = constraint('zoom-auth')
    expect(
      c.applies({ communicationPlatforms: ['zoom'], auth: 'supabase-auth' }),
    ).toBe(false)
  })

  it('small-team with ciProvider=github-actions does not apply team-ci', () => {
    const c = constraint('team-ci')
    expect(
      c.applies({
        expectedTeamSize: 'small-team',
        ciProvider: 'github-actions',
      }),
    ).toBe(false)
  })

  it('large-team with ciProvider=none applies team-ci', () => {
    const c = constraint('team-ci')
    const config = {
      expectedTeamSize: 'large-team' as const,
      ciProvider: 'none' as const,
    }
    expect(c.applies(config)).toBe(true)
    expect(c.violations(config)[0].severity).toBe('warning')
  })
})

/* ------------------------------------------------------------------ */
/*  Category: validateConfig — Additional Integration Tests            */
/* ------------------------------------------------------------------ */

describe('validateConfig — Additional Integration Tests', () => {
  it('returns no violations for full EU compliance setup', () => {
    const config: Partial<BootConfig> = {
      hosting: 'aws',
      database: 'postgresql',
      databaseProvider: 'supabase',
      auth: 'next-auth',
      ssoProviders: [],
      targetMarkets: ['eu'],
      dataRetentionDays: 365,
      userTracking: 'minimal',
      analyticsProvider: 'plausible',
      payments: 'none',
      expectedUserCount: '1-100',
      performanceProfile: 'balanced',
      fileStorage: 'none',
      monitoring: 'sentry',
      hasPublicApi: false,
      hasWebhooks: false,
      expectedTeamSize: 'solo',
      ciProvider: 'none',
      framework: 'nextjs',
      hostingRegion: 'eu-west-1',
      emailProvider: 'resend',
      communicationPlatforms: [],
      mfaRequired: false,
    }
    expect(validateConfig(config)).toHaveLength(0)
  })

  it('violations includes email field when payments without email', () => {
    const config: Partial<BootConfig> = {
      payments: 'stripe',
      emailProvider: 'none',
    }
    const violations = validateConfig(config)
    expect(violations.some((v) => v.field === 'emailProvider')).toBe(true)
  })

  it('no comm-webhooks violation when communication platforms have webhooks', () => {
    const config: Partial<BootConfig> = {
      communicationPlatforms: ['slack'],
      hasWebhooks: true,
    }
    const violations = validateConfig(config)
    expect(violations.some((v) => v.field === 'hasWebhooks')).toBe(false)
  })

  it('marketing site with security profile has no violations', () => {
    const config: Partial<BootConfig> = {
      hosting: 'aws',
      database: 'postgresql',
      databaseProvider: 'supabase',
      auth: 'none',
      ssoProviders: [],
      targetMarkets: ['us'],
      dataRetentionDays: 365,
      userTracking: 'none',
      analyticsProvider: 'none',
      payments: 'none',
      expectedUserCount: '1-100',
      performanceProfile: 'security',
      fileStorage: 'none',
      monitoring: 'none',
      hasPublicApi: false,
      hasWebhooks: false,
      expectedTeamSize: 'solo',
      ciProvider: 'none',
      framework: 'nextjs',
      hostingRegion: 'us-east-1',
      emailProvider: 'none',
      communicationPlatforms: [],
      mfaRequired: false,
    }
    expect(validateConfig(config)).toHaveLength(0)
  })

  it('returns multiple violations for bad EU setup', () => {
    const config: Partial<BootConfig> = {
      targetMarkets: ['eu'],
      userTracking: 'full',
      analyticsProvider: 'google-analytics',
      hostingRegion: 'us-east-1',
    }
    const violations = validateConfig(config)
    expect(violations.length).toBeGreaterThanOrEqual(3)
    expect(violations.some((v) => v.field === 'userTracking')).toBe(true)
    expect(violations.some((v) => v.field === 'analyticsProvider')).toBe(true)
    expect(violations.some((v) => v.field === 'hostingRegion')).toBe(true)
  })
})

/* ------------------------------------------------------------------ */
/*  Category: applies() returns false for unrelated fields             */
/* ------------------------------------------------------------------ */

describe('applies() returns false for unrelated fields', () => {
  it("vercel-sqlite doesn't apply with aws hosting", () => {
    const c = constraint('vercel-sqlite')
    expect(c.applies({ hosting: 'aws', database: 'sqlite' })).toBe(false)
  })

  it("nextauth-relational-db doesn't apply with no auth", () => {
    const c = constraint('nextauth-relational-db')
    expect(c.applies({ auth: 'none', database: 'sqlite' })).toBe(false)
  })

  it("gdpr-tracking doesn't apply with us-only markets", () => {
    const c = constraint('gdpr-tracking')
    expect(c.applies({ targetMarkets: ['us'], userTracking: 'full' })).toBe(
      false,
    )
  })

  it("scale-sqlite doesn't apply with postgresql", () => {
    const c = constraint('scale-sqlite')
    expect(
      c.applies({ expectedUserCount: '10k-100k', database: 'postgresql' }),
    ).toBe(false)
  })
})
