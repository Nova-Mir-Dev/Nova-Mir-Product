import { describe, it, expect } from 'vitest'
import { locales } from '@/i18n/locales'
import en from '../../../../messages/en.json'
import es from '../../../../messages/es.json'
import ru from '../../../../messages/ru.json'

type Catalog = Record<string, unknown>

const catalogs: Record<string, Catalog> = { en, es, ru }

function keyPaths(obj: Catalog, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    return value && typeof value === 'object' && !Array.isArray(value)
      ? keyPaths(value as Catalog, path)
      : [path]
  })
}

function valueAt(obj: Catalog, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>((acc, key) => (acc as Catalog | undefined)?.[key], obj)
}

function placeholders(message: string): string[] {
  return (message.match(/\{[a-zA-Z0-9_]+\}/g) ?? []).sort()
}

describe('message catalog parity (Nova-Mir-Product-e1iy.2.1)', () => {
  it('every locale in i18n/locales.ts has a catalog under test', () => {
    expect(Object.keys(catalogs).sort()).toEqual([...locales].sort())
  })

  const enKeys = keyPaths(en as Catalog).sort()

  for (const locale of Object.keys(catalogs).filter((l) => l !== 'en')) {
    it(`${locale} exposes identical key paths to en (no missing translations)`, () => {
      expect(keyPaths(catalogs[locale]!).sort()).toEqual(enKeys)
    })

    it(`${locale} has no empty strings`, () => {
      for (const path of enKeys) {
        expect(valueAt(catalogs[locale]!, path), path).toBeTruthy()
      }
    })

    it(`${locale} preserves ICU placeholders from en`, () => {
      for (const path of enKeys) {
        const source = valueAt(en as Catalog, path)
        const translated = valueAt(catalogs[locale]!, path)
        if (typeof source !== 'string' || typeof translated !== 'string')
          continue
        expect(placeholders(translated), path).toEqual(placeholders(source))
      }
    })
  }

  it('includes the client-portal Dashboard namespace', () => {
    expect(enKeys).toContain('Dashboard.nav.home')
    expect(enKeys).toContain('Dashboard.nav.settings')
    expect(enKeys).toContain('Dashboard.language.label')
    expect(enKeys).toContain('Dashboard.backToSite')
  })
})
