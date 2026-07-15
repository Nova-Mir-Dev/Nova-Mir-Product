import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PRICING_TIERS } from '../pricing'

/**
 * Guards the three pricing sources from silently drifting (the class of bug that
 * shipped "$150,000" pricing — Nova-Mir-Product-e4j/94p). The DB is the runtime
 * source of truth, seeded from supabase/seed-content.sql; the static
 * PRICING_TIERS fallback must mirror that seed exactly on the fields both carry.
 */

interface SeedTier {
  name: string
  startingPrice: number
  description: string
  features: string[]
}

function parseSeedPricingTiers(): SeedTier[] {
  const sql = readFileSync(
    resolve(__dirname, '../../../supabase/seed-content.sql'),
    'utf-8',
  )
  const insert = sql.slice(sql.indexOf('INSERT INTO pricing_tiers'))
  const block = insert.slice(0, insert.indexOf(';') + 1)

  const rowRe =
    /\(\s*'([^']*)',\s*'[^']*',\s*(\d+),\s*'((?:[^']|'')*)',\s*'(\[[^\]]*\])'::jsonb/g
  const tiers: SeedTier[] = []
  let m: RegExpExecArray | null
  while ((m = rowRe.exec(block)) !== null) {
    tiers.push({
      name: m[1]!,
      startingPrice: Number(m[2]),
      description: m[3]!.replace(/''/g, "'"),
      features: JSON.parse(m[4]!) as string[],
    })
  }
  return tiers
}

describe('pricing source consistency', () => {
  const seed = parseSeedPricingTiers()

  it('parses all three seed tiers', () => {
    expect(seed).toHaveLength(3)
  })

  it('seed prices are plausible whole dollars (100..50000)', () => {
    for (const tier of seed) {
      expect(tier.startingPrice).toBeGreaterThanOrEqual(100)
      expect(tier.startingPrice).toBeLessThanOrEqual(50000)
    }
  })

  it('static fallback mirrors the seed on name, price, description, features', () => {
    for (const seedTier of seed) {
      const fallback = PRICING_TIERS.find((t) => t.name === seedTier.name)
      expect(fallback, `fallback tier "${seedTier.name}"`).toBeDefined()
      expect(fallback!.startingPrice).toBe(seedTier.startingPrice)
      expect(fallback!.description).toBe(seedTier.description)
      expect(fallback!.features).toEqual(seedTier.features)
    }
  })

  it('has the same tier names in the same order', () => {
    expect(seed.map((t) => t.name)).toEqual(PRICING_TIERS.map((t) => t.name))
  })
})
