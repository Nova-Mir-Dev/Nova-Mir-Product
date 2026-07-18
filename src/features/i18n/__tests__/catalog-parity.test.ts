import { describe, it, expect } from 'vitest'
import en from '../../../../messages/en.json'
import es from '../../../../messages/es.json'

function keyPaths(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    return value && typeof value === 'object' && !Array.isArray(value)
      ? keyPaths(value as Record<string, unknown>, path)
      : [path]
  })
}

describe('message catalog parity (Nova-Mir-Product-e1iy.2.1)', () => {
  it('en and es expose identical key paths (no missing translations)', () => {
    const enKeys = keyPaths(en as Record<string, unknown>).sort()
    const esKeys = keyPaths(es as Record<string, unknown>).sort()
    expect(esKeys).toEqual(enKeys)
  })

  it('includes the client-portal Dashboard namespace', () => {
    const enKeys = keyPaths(en as Record<string, unknown>)
    expect(enKeys).toContain('Dashboard.nav.home')
    expect(enKeys).toContain('Dashboard.nav.settings')
    expect(enKeys).toContain('Dashboard.language.label')
    expect(enKeys).toContain('Dashboard.backToSite')
  })
})
