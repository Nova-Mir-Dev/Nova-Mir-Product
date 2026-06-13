import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { hashKey, generateApiKey } from '../settings-utils'

describe('hashKey', () => {
  beforeEach(() => {
    const mockDigest = vi.fn().mockImplementation((_algo: string, data: Uint8Array) => {
      const hash = Array.from(data).map((b) => b + 1).concat(
        Array.from({ length: 32 - data.length }, (_, i) => i + 1),
      )
      return Promise.resolve(new Uint8Array(hash.slice(0, 32)).buffer as ArrayBuffer)
    })
    vi.stubGlobal('crypto', {
      ...crypto,
      subtle: { digest: mockDigest },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns a hex string', async () => {
    const result = await hashKey('test-key')
    expect(result).toMatch(/^[0-9a-f]{64}$/)
  })

  it('returns deterministic output for same input', async () => {
    const a = await hashKey('hello')
    const b = await hashKey('hello')
    expect(a).toBe(b)
  })

  it('returns different output for different inputs', async () => {
    const a = await hashKey('key-one')
    const b = await hashKey('key-two')
    expect(a).not.toBe(b)
  })

  it('handles empty string', async () => {
    const result = await hashKey('')
    expect(result).toMatch(/^[0-9a-f]{64}$/)
  })
})

describe('generateApiKey', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', {
      ...crypto,
      subtle: {
        digest: vi.fn().mockResolvedValue(
          new Uint8Array(Array.from({ length: 32 }, (_, i) => i + 1)).buffer as ArrayBuffer,
        ),
      },
      randomUUID: vi
        .fn()
        .mockReturnValueOnce('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')
        .mockReturnValueOnce('ffffffff-gggg-hhhh-iiii-jjjjjjjjjjjj')
        .mockReturnValue('cccccccc-dddd-eeee-ffff-gggggggggggg'),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns key, hashedKey, and prefix', async () => {
    const result = await generateApiKey()
    expect(result.key).toBe(
      'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeeeffffffff-gggg-hhhh-iiii-jjjjjjjjjjjj',
    )
    expect(result.prefix).toBe('aaaaaaaa')
    expect(result.hashedKey).toMatch(/^[0-9a-f]{64}$/)
  })

  it('prefix is first 8 chars of key', async () => {
    const result = await generateApiKey()
    expect(result.prefix).toBe(result.key.slice(0, 8))
  })
})
