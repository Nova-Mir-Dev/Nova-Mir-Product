import { describe, it, expect } from 'vitest'
import { PRICING_TIERS } from '../pricing'

describe('PRICING_TIERS', () => {
  it('has exactly 3 tiers', () => {
    expect(PRICING_TIERS).toHaveLength(3)
  })

  it('each tier has required fields', () => {
    for (const tier of PRICING_TIERS) {
      expect(tier.name).toBeTruthy()
      expect(typeof tier.startingPrice).toBe('number')
      expect(tier.startingPrice).toBeGreaterThan(0)
      expect(tier.description).toBeTruthy()
      expect(tier.features.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('tiers are in ascending price order', () => {
    const prices = PRICING_TIERS.map((t) => t.startingPrice)
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]!).toBeGreaterThan(prices[i - 1]!)
    }
  })

  it('each tier has features specific to its offering', () => {
    for (const tier of PRICING_TIERS) {
      expect(tier.features.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('has all expected tier names', () => {
    const names = PRICING_TIERS.map((t) => t.name)
    expect(names).toEqual([
      'Managed Website',
      'Website + Lead System',
      'Website + Operations',
    ])
  })
})
