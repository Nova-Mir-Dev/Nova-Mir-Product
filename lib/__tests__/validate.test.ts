import { describe, it, expect } from 'vitest'
import {
  validate,
  ValidationError,
  emailSchema,
  passwordSchema,
  paginationSchema,
} from '../validate'
import { z } from 'zod'

describe('validate', () => {
  it('returns parsed data for valid input', () => {
    const schema = z.object({ name: z.string() })
    const result = validate(schema, { name: 'Alice' })
    expect(result).toEqual({ name: 'Alice' })
  })

  it('applies default values', () => {
    const schema = z.object({
      page: z.number().default(1),
      name: z.string(),
    })
    const result = validate(schema, { name: 'test' })
    expect(result.page).toBe(1)
  })

  it('thows ValidationError for invalid input', () => {
    const schema = z.object({ age: z.number() })
    expect(() => validate(schema, { age: 'not-a-number' })).toThrow(ValidationError)
  })

  it('ValidationError contains ZodIssue array', () => {
    const schema = z.object({ email: z.string().email() })
    try {
      validate(schema, { email: 'bad' })
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError)
      const err = e as ValidationError
      expect(err.name).toBe('ValidationError')
      expect(err.message).toBe('Validation failed')
      expect(Array.isArray(err.issues)).toBe(true)
      expect(err.issues.length).toBeGreaterThan(0)
      expect(err.issues[0]!.code).toBeDefined()
    }
  })
})

describe('emailSchema', () => {
  it('accepts valid emails', () => {
    expect(emailSchema.parse('user@example.com')).toBe('user@example.com')
  })

  it('rejects invalid emails', () => {
    expect(emailSchema.safeParse('not-an-email').success).toBe(false)
  })
})

describe('passwordSchema', () => {
  it('accepts passwords >= 8 chars', () => {
    expect(passwordSchema.parse('12345678')).toBe('12345678')
    expect(passwordSchema.parse('a'.repeat(128))).toHaveLength(128)
  })

  it('rejects passwords < 8 chars', () => {
    expect(passwordSchema.safeParse('1234567').success).toBe(false)
  })

  it('rejects passwords > 128 chars', () => {
    expect(passwordSchema.safeParse('a'.repeat(129)).success).toBe(false)
  })
})

describe('paginationSchema', () => {
  it('parses valid pagination params', () => {
    const result = paginationSchema.parse({ page: '2', limit: '50' })
    expect(result.page).toBe(2)
    expect(result.limit).toBe(50)
  })

  it('applies defaults for missing fields', () => {
    const result = paginationSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  it('rejects page < 1', () => {
    expect(paginationSchema.safeParse({ page: '0' }).success).toBe(false)
  })

  it('rejects limit > 100', () => {
    expect(paginationSchema.safeParse({ limit: '200' }).success).toBe(false)
  })
})
