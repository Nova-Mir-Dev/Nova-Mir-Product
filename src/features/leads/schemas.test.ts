import { describe, it, expect } from 'vitest'
import { createLeadSchema, updateLeadStatusSchema } from './schemas'

describe('createLeadSchema', () => {
  const validLead = {
    name: 'John Doe',
    email: 'john@example.com',
    businessName: 'Acme Inc',
    message: 'I need a website',
    consent: true,
  }

  it('passes with valid data', () => {
    const result = createLeadSchema.safeParse(validLead)
    expect(result.success).toBe(true)
  })

  it('fails when name is empty', () => {
    const result = createLeadSchema.safeParse({ ...validLead, name: '' })
    expect(result.success).toBe(false)
  })

  it('fails when email is invalid', () => {
    const result = createLeadSchema.safeParse({
      ...validLead,
      email: 'not-an-email',
    })
    expect(result.success).toBe(false)
  })

  it('fails when consent is false', () => {
    const result = createLeadSchema.safeParse({ ...validLead, consent: false })
    expect(result.success).toBe(false)
  })

  it('fails when message is empty', () => {
    const result = createLeadSchema.safeParse({ ...validLead, message: '' })
    expect(result.success).toBe(false)
  })

  it('accepts optional fields as undefined', () => {
    const result = createLeadSchema.safeParse(validLead)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.phone).toBeNull()
      expect(result.data.serviceInterest).toBeNull()
    }
  })
})

describe('updateLeadStatusSchema', () => {
  it('passes with valid status', () => {
    const result = updateLeadStatusSchema.safeParse({ status: 'won' })
    expect(result.success).toBe(true)
  })

  it('fails with invalid status', () => {
    const result = updateLeadStatusSchema.safeParse({ status: 'invalid' })
    expect(result.success).toBe(false)
  })
})
