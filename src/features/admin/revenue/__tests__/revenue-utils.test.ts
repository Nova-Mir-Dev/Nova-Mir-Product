import { describe, it, expect } from 'vitest'
import {
  REVENUE_CATEGORIES,
  EXPENSE_CATEGORIES,
  validateRevenueEntry,
  validateExpenseEntry,
} from '../revenue-utils'

describe('REVENUE_CATEGORIES', () => {
  it('contains expected categories', () => {
    expect(REVENUE_CATEGORIES).toEqual([
      'service',
      'product',
      'consulting',
      'retainer',
      'other',
    ])
  })
})

describe('EXPENSE_CATEGORIES', () => {
  it('contains expected categories', () => {
    expect(EXPENSE_CATEGORIES).toEqual([
      'software',
      'hosting',
      'contractor',
      'travel',
      'office',
      'marketing',
      'other',
    ])
  })
})

describe('validateRevenueEntry', () => {
  const validData: Record<string, FormDataEntryValue | null> = {
    clientName: 'Acme Corp',
    description: 'Consulting services',
    amount: '5000',
    category: 'service',
    recordedAt: '2026-06-13',
  }

  it('returns null for valid data', () => {
    expect(validateRevenueEntry(validData)).toBeNull()
  })

  it('returns error for missing clientName', () => {
    expect(validateRevenueEntry({ ...validData, clientName: '' })).toEqual({
      error: 'Client name is required',
    })
  })

  it('returns error for whitespace clientName', () => {
    expect(validateRevenueEntry({ ...validData, clientName: '   ' })).toEqual({
      error: 'Client name is required',
    })
  })

  it('returns error for missing description', () => {
    expect(validateRevenueEntry({ ...validData, description: '' })).toEqual({
      error: 'Description is required',
    })
  })

  it('returns error for missing amount', () => {
    expect(validateRevenueEntry({ ...validData, amount: '' })).toEqual({
      error: 'Valid amount is required',
    })
  })

  it('returns error for non-numeric amount', () => {
    expect(validateRevenueEntry({ ...validData, amount: 'abc' })).toEqual({
      error: 'Valid amount is required',
    })
  })

  it('returns error for zero amount', () => {
    expect(validateRevenueEntry({ ...validData, amount: '0' })).toEqual({
      error: 'Valid amount is required',
    })
  })

  it('returns error for negative amount', () => {
    expect(validateRevenueEntry({ ...validData, amount: '-100' })).toEqual({
      error: 'Valid amount is required',
    })
  })

  it('returns error for missing category', () => {
    expect(validateRevenueEntry({ ...validData, category: '' })).toEqual({
      error: 'Category is required',
    })
  })

  it('returns error for invalid category', () => {
    expect(validateRevenueEntry({ ...validData, category: 'invalid' })).toEqual({
      error: 'Invalid category',
    })
  })

  it('returns error for missing recordedAt', () => {
    expect(validateRevenueEntry({ ...validData, recordedAt: '' })).toEqual({
      error: 'Date is required',
    })
  })
})

describe('validateExpenseEntry', () => {
  const validData: Record<string, FormDataEntryValue | null> = {
    vendor: 'AWS',
    description: 'Hosting costs',
    amount: '299.50',
    category: 'hosting',
    recordedAt: '2026-06-13',
  }

  it('returns null for valid data', () => {
    expect(validateExpenseEntry(validData)).toBeNull()
  })

  it('returns error for missing vendor', () => {
    expect(validateExpenseEntry({ ...validData, vendor: '' })).toEqual({
      error: 'Vendor is required',
    })
  })

  it('returns error for missing description', () => {
    expect(validateExpenseEntry({ ...validData, description: '' })).toEqual({
      error: 'Description is required',
    })
  })

  it('returns error for missing amount', () => {
    expect(validateExpenseEntry({ ...validData, amount: '' })).toEqual({
      error: 'Valid amount is required',
    })
  })

  it('returns error for invalid amount', () => {
    expect(validateExpenseEntry({ ...validData, amount: 'NaN' })).toEqual({
      error: 'Valid amount is required',
    })
  })

  it('returns error for missing category', () => {
    expect(validateExpenseEntry({ ...validData, category: '' })).toEqual({
      error: 'Category is required',
    })
  })

  it('returns error for invalid expense category', () => {
    expect(
      validateExpenseEntry({ ...validData, category: 'service' }),
    ).toEqual({
      error: 'Invalid category',
    })
  })

  it('returns error for missing recordedAt', () => {
    expect(validateExpenseEntry({ ...validData, recordedAt: '' })).toEqual({
      error: 'Date is required',
    })
  })

  it('accepts all valid expense categories', () => {
    for (const cat of EXPENSE_CATEGORIES) {
      expect(
        validateExpenseEntry({ ...validData, category: cat }),
      ).toBeNull()
    }
  })
})
