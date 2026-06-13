import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
  delete process.env.ALLOWED_IPS
})

describe('isIpAllowed', () => {
  it('allows all IPs when ALLOWED_IPS is not set', async () => {
    const { isIpAllowed: check } = await import('../ip-allowlist')
    expect(check('192.168.1.1')).toBe(true)
    expect(check('10.0.0.1')).toBe(true)
  })

  it('allows explicitly listed IPs', async () => {
    process.env.ALLOWED_IPS = '192.168.1.1,10.0.0.1'
    const { isIpAllowed: check } = await import('../ip-allowlist')
    expect(check('192.168.1.1')).toBe(true)
    expect(check('10.0.0.1')).toBe(true)
  })

  it('rejects IPs not in the allowlist', async () => {
    process.env.ALLOWED_IPS = '192.168.1.1'
    const { isIpAllowed: check } = await import('../ip-allowlist')
    expect(check('10.0.0.1')).toBe(false)
  })

  it('supports wildcard patterns', async () => {
    process.env.ALLOWED_IPS = '192.168.*,10.0.*'
    const { isIpAllowed: check } = await import('../ip-allowlist')
    expect(check('192.168.1.1')).toBe(true)
    expect(check('192.168.100.50')).toBe(true)
    expect(check('10.0.0.1')).toBe(true)
    expect(check('172.16.0.1')).toBe(false)
  })

  it('handles empty string in env var', async () => {
    process.env.ALLOWED_IPS = ''
    const { isIpAllowed: check } = await import('../ip-allowlist')
    expect(check('1.2.3.4')).toBe(true)
  })
})

describe('getClientIp', () => {
  let getClientIp: (request: Request) => string
  beforeAll(async () => {
    const mod = await import('../ip-allowlist')
    getClientIp = mod.getClientIp
  })
  it('extracts IP from x-forwarded-for header', () => {
    const request = new Request('http://example.com', {
      headers: { 'x-forwarded-for': '203.0.113.1, 198.51.100.2' },
    })
    expect(getClientIp(request)).toBe('203.0.113.1')
  })

  it('falls back to 127.0.0.1 when no header', () => {
    const request = new Request('http://example.com')
    expect(getClientIp(request)).toBe('127.0.0.1')
  })
})
