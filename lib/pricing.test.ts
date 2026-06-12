import { describe, it, expect } from 'vitest'
import { PRICING_TIERS } from './pricing'

describe('PRICING_TIERS', () => {
  it('has exactly 3 tiers', () => {
    expect(PRICING_TIERS).toHaveLength(3)
  })

  it('each tier has required fields', () => {
    for (const tier of PRICING_TIERS) {
      expect(tier.name).toBeTruthy()
      expect(tier.startingPrice).toMatch(/^\$[\d,]+$/)
      expect(tier.description).toBeTruthy()
      expect(tier.features.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('tiers are in ascending price order', () => {
    const prices = PRICING_TIERS.map(t => 
      parseInt(t.startingPrice.replace(/[$,]/g, ''))
    )
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]!).toBeGreaterThan(prices[i - 1]!)
    }
  })
})
