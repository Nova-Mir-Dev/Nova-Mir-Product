import { describe, it, expect } from 'vitest'
import { isPIIKey, PII_KEYS } from '../pii'
import { scrubPii } from '../sentry-scrub'

describe('isPIIKey', () => {
  it('returns true for known PII keys', () => {
    expect(isPIIKey('email')).toBe(true)
    expect(isPIIKey('phone')).toBe(true)
    expect(isPIIKey('name')).toBe(true)
    expect(isPIIKey('full_name')).toBe(true)
    expect(isPIIKey('password')).toBe(true)
    expect(isPIIKey('token')).toBe(true)
    expect(isPIIKey('access_token')).toBe(true)
    expect(isPIIKey('secret')).toBe(true)
    expect(isPIIKey('api_key')).toBe(true)
    expect(isPIIKey('private_key')).toBe(true)
    expect(isPIIKey('ip')).toBe(true)
    expect(isPIIKey('ip_address')).toBe(true)
    expect(isPIIKey('jwt')).toBe(true)
    expect(isPIIKey('ssn')).toBe(true)
    expect(isPIIKey('dob')).toBe(true)
    expect(isPIIKey('date_of_birth')).toBe(true)
    expect(isPIIKey('credit')).toBe(true)
    expect(isPIIKey('card')).toBe(true)
    expect(isPIIKey('cvv')).toBe(true)
    expect(isPIIKey('hash')).toBe(true)
    expect(isPIIKey('authorization')).toBe(true)
    expect(isPIIKey('cookie')).toBe(true)
    expect(isPIIKey('user_agent')).toBe(true)
    expect(isPIIKey('address')).toBe(true)
    expect(isPIIKey('message')).toBe(true)
    expect(isPIIKey('first_name')).toBe(true)
    expect(isPIIKey('last_name')).toBe(true)
  })

  it('is case insensitive', () => {
    expect(isPIIKey('EMAIL')).toBe(true)
    expect(isPIIKey('Full_Name')).toBe(true)
    expect(isPIIKey('IP_ADDRESS')).toBe(true)
  })

  it('returns false for non-PII keys', () => {
    expect(isPIIKey('namee')).toBe(false)
    expect(isPIIKey('created_at')).toBe(false)
    expect(isPIIKey('')).toBe(false)
    expect(isPIIKey('id')).toBe(false)
    expect(isPIIKey('role')).toBe(false)
    expect(isPIIKey('status')).toBe(false)
    expect(isPIIKey('description')).toBe(false)
    expect(isPIIKey('sort_order')).toBe(false)
    expect(isPIIKey('is_published')).toBe(false)
  })

  it('matches ip but not ip-related false positives', () => {
    expect(isPIIKey('ip')).toBe(true)
    expect(isPIIKey('ip_address')).toBe(true)
    expect(isPIIKey('ip_allowlist')).toBe(false)
  })
})

describe('PII_KEYS regex', () => {
  it('is exported and testable', () => {
    expect(PII_KEYS).toBeInstanceOf(RegExp)
    expect(PII_KEYS.test('email')).toBe(true)
    expect(PII_KEYS.test('not_pii')).toBe(false)
  })
})

describe('scrubPii', () => {
  const baseEvent = {
    event_id: 'test-1',
    message: 'Test error',
    timestamp: 1234567890,
  }

  it('returns null for null input', () => {
    expect(scrubPii(null)).toBeNull()
  })

  it('redacts PII from extra fields', () => {
    const event = {
      ...baseEvent,
      extra: {
        email: 'user@example.com',
        name: 'John Doe',
        password: 'secret123',
        safe_key: 'keep-me',
        token: 'eyJhbGciOiJIUzI1NiJ9.xxx',
      },
    } as any
    const result = scrubPii(event) as any
    expect(result!.extra.email).toBe('[REDACTED]')
    expect(result!.extra.name).toBe('[REDACTED]')
    expect(result!.extra.password).toBe('[REDACTED]')
    expect(result!.extra.token).toBe('[REDACTED]')
    expect(result!.extra.safe_key).toBe('keep-me')
  })

  it('deletes user email and ip_address', () => {
    const event = {
      ...baseEvent,
      user: {
        id: 'user-1',
        email: 'user@example.com',
        ip_address: '127.0.0.1',
        username: 'johndoe',
      },
    } as any
    const result = scrubPii(event) as any
    expect(result!.user.email).toBeUndefined()
    expect(result!.user.ip_address).toBeUndefined()
    expect(result!.user.id).toBe('[redacted-id]')
    expect(result!.user.username).toBe('johndoe')
  })

  it('scrubs breadcrumb data', () => {
    const event = {
      ...baseEvent,
      breadcrumbs: [
        {
          type: 'http',
          data: { email: 'user@example.com', url: '/api/test' },
        },
      ],
    } as any
    const result = scrubPii(event) as any
    expect(result!.breadcrumbs[0].data.email).toBe('[REDACTED]')
    expect(result!.breadcrumbs[0].data.url).toBe('/api/test')
  })

  it('scrubs nested objects recursively', () => {
    const event = {
      ...baseEvent,
      extra: {
        user_info: {
          email: 'nested@example.com',
          profile: { phone: '555-0100', bio: 'hello' },
        },
      },
    } as any
    const result = scrubPii(event) as any
    expect(result!.extra.user_info.email).toBe('[REDACTED]')
    expect(result!.extra.user_info.profile.phone).toBe('[REDACTED]')
    expect(result!.extra.user_info.profile.bio).toBe('hello')
  })

  it('truncates long strings', () => {
    const long = 'a'.repeat(1000)
    const event = {
      ...baseEvent,
      extra: { safe_key: long },
    } as any
    const result = scrubPii(event) as any
    expect(result!.extra.safe_key.length).toBeLessThan(600)
    expect(result!.extra.safe_key.endsWith('…')).toBe(true)
  })

  it('caps array length', () => {
    const big = Array.from({ length: 200 }, (_, i) => ({
      email: `u${i}@x.com`,
    }))
    const event = {
      ...baseEvent,
      extra: { items: big },
    } as any
    const result = scrubPii(event) as any
    expect(result!.extra.items.length).toBe(50)
  })

  it('handles null and undefined values', () => {
    const event = {
      ...baseEvent,
      extra: { email: null, phone: undefined, safe: 'ok' },
    } as any
    const result = scrubPii(event) as any
    expect(result!.extra.email).toBe('[REDACTED]')
    expect(result!.extra.phone).toBe('[REDACTED]')
    expect(result!.extra.safe).toBe('ok')
  })

  it('handles empty event gracefully', () => {
    const result = scrubPii({} as any)
    expect(result).toEqual({})
  })

  it('scrubs request data', () => {
    const event = {
      ...baseEvent,
      request: { data: { email: 'req@example.com', name: 'Req' } },
    } as any
    const result = scrubPii(event) as any
    expect(result!.request.data.email).toBe('[REDACTED]')
  })
})
