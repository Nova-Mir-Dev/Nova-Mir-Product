import { describe, it, expect } from 'vitest'
import { NAV_PAGES, APP_CONFIG } from '../navigation'
import type { NavPage } from '../navigation'

describe('NAV_PAGES', () => {
  it('is an array of NavPage objects', () => {
    expect(Array.isArray(NAV_PAGES)).toBe(true)
    for (const page of NAV_PAGES) {
      expect(typeof page.label).toBe('string')
      expect(typeof page.path).toBe('string')
      expect(page.path).toMatch(/^\//)
    }
  })

  it('has expected pages', () => {
    const labels = NAV_PAGES.map((p) => p.label)
    expect(labels).toContain('Home')
    expect(labels).toContain('Services')
    expect(labels).toContain('Process')
    expect(labels).toContain('Portfolio')
    expect(labels).toContain('Contact')
    expect(labels).toContain('Pricing')
  })

  it('has unique paths', () => {
    const paths = NAV_PAGES.map((p) => p.path)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('conforms to NavPage interface', () => {
    const _checkType: NavPage = NAV_PAGES[0]!
    expect(_checkType).toBeDefined()
  })
})

describe('APP_CONFIG', () => {
  it('has required fields', () => {
    expect(APP_CONFIG.title).toBe('Nova Mir')
    expect(APP_CONFIG.email).toBe('hello@novamir.dev')
  })

  it('has all expected keys', () => {
    const keys = Object.keys(APP_CONFIG)
    expect(keys).toContain('title')
    expect(keys).toContain('description')
    expect(keys).toContain('email')
  })
})
