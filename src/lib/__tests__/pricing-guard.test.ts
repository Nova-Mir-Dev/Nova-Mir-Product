// @vitest-environment node
import { describe, it, expect, vi, afterEach } from 'vitest'

const OVERRIDE_KEYS = [
  'NEXT_PUBLIC_TIER1_PRICE',
  'NEXT_PUBLIC_TIER1_NAME',
  'NEXT_PUBLIC_FOUNDING_OFFER_PRICE',
] as const

describe('pricing override divergence guard (Nova-Mir-Product-94p.2)', () => {
  afterEach(() => {
    for (const key of OVERRIDE_KEYS) delete process.env[key]
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('warns once when a numeric override diverges from the canonical fallback', async () => {
    process.env.NEXT_PUBLIC_TIER1_PRICE = '2500'
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.resetModules()
    const mod = await import('../pricing')

    expect(mod.PRICING_TIERS[0]!.startingPrice).toBe(2500)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('NEXT_PUBLIC_TIER1_PRICE=2500'),
    )
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('source of truth'),
    )
  })

  it('warns when a string override (tier name) diverges', async () => {
    process.env.NEXT_PUBLIC_TIER1_NAME = 'Renamed Tier'
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.resetModules()
    const mod = await import('../pricing')

    expect(mod.PRICING_TIERS[0]!.name).toBe('Renamed Tier')
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('NEXT_PUBLIC_TIER1_NAME=Renamed Tier'),
    )
  })

  it('does not warn when an override matches the canonical value', async () => {
    process.env.NEXT_PUBLIC_TIER1_PRICE = '1800'
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.resetModules()
    await import('../pricing')

    expect(warn).not.toHaveBeenCalled()
  })

  it('does not warn when no override is set (crash-protection fallback path)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.resetModules()
    const mod = await import('../pricing')

    expect(mod.PRICING_TIERS[0]!.startingPrice).toBe(1800)
    expect(warn).not.toHaveBeenCalled()
  })

  it('ignores a non-numeric price override and keeps the fallback without warning', async () => {
    process.env.NEXT_PUBLIC_TIER1_PRICE = 'not-a-number'
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.resetModules()
    const mod = await import('../pricing')

    expect(mod.PRICING_TIERS[0]!.startingPrice).toBe(1800)
    expect(warn).not.toHaveBeenCalled()
  })
})
