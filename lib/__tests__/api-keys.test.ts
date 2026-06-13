import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createHash, randomBytes } from 'node:crypto'

vi.mock('@/lib/supabase-server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}))

import { generateApiKey, validateApiKey } from '../api-keys'

describe('generateApiKey', () => {
  it('returns prefix and hash', () => {
    const result = generateApiKey()
    expect(result).toHaveProperty('prefix')
    expect(result).toHaveProperty('hash')
  })

  it('prefix starts with ak_ and is 8 characters', () => {
    const result = generateApiKey()
    expect(result.prefix).toMatch(/^ak_/)
    expect(result.prefix).toHaveLength(8)
  })

  it('hash is a 64-character hex string', () => {
    const result = generateApiKey()
    expect(result.hash).toMatch(/^[a-f0-9]{64}$/)
  })

  it('generates unique keys', () => {
    const r1 = generateApiKey()
    const r2 = generateApiKey()
    expect(r1.prefix).not.toBe(r2.prefix)
    expect(r1.hash).not.toBe(r2.hash)
  })
})

describe('validateApiKey', () => {
  it('returns true for a correct key-hash pair', () => {
    const rawKey = 'ak_' + randomBytes(32).toString('hex')
    const hash = createHash('sha256').update(rawKey).digest('hex')
    expect(validateApiKey(rawKey, hash)).toBe(true)
  })

  it('returns false for wrong key', () => {
    const rawKey = 'ak_' + randomBytes(32).toString('hex')
    const hash = createHash('sha256').update(rawKey).digest('hex')
    expect(validateApiKey('wrong_key_value', hash)).toBe(false)
  })

  it('returns false for empty key', () => {
    const hash = createHash('sha256').update('somekey').digest('hex')
    expect(validateApiKey('', hash)).toBe(false)
  })

  it('returns false for empty hash', () => {
    expect(validateApiKey('test-key', '')).toBe(false)
  })
})
