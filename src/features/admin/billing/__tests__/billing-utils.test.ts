import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateInvoiceNumber, computeLineItems } from '../billing-utils'

describe('generateInvoiceNumber', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('formats INV-{year}-{padded count}', () => {
    vi.setSystemTime(new Date('2026-06-13'))
    expect(generateInvoiceNumber(1)).toBe('INV-2026-00001')
  })

  it('pads count to 5 digits', () => {
    vi.setSystemTime(new Date('2026-06-13'))
    expect(generateInvoiceNumber(42)).toBe('INV-2026-00042')
    expect(generateInvoiceNumber(99999)).toBe('INV-2026-99999')
  })

  it('uses current year', () => {
    vi.setSystemTime(new Date(2024, 0, 1))
    expect(generateInvoiceNumber(5)).toBe('INV-2024-00005')
  })

  it('handles count 0', () => {
    vi.setSystemTime(new Date('2026-06-13'))
    expect(generateInvoiceNumber(0)).toBe('INV-2026-00000')
  })
})

describe('computeLineItems', () => {
  it('returns line item from description and unitPrice', () => {
    const fd = new FormData()
    fd.set('description', 'Web development')
    fd.set('quantity', '2')
    fd.set('unitPrice', '150.50')

    const items = computeLineItems(fd)
    expect(items).toHaveLength(1)
    expect(items[0]).toEqual({
      description: 'Web development',
      quantity: 2,
      unitPrice: 15050,
    })
  })

  it('defaults quantity to 1', () => {
    const fd = new FormData()
    fd.set('description', 'Consulting')
    fd.set('unitPrice', '100')

    const items = computeLineItems(fd)
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(1)
  })

  it('trims description', () => {
    const fd = new FormData()
    fd.set('description', '  Design work  ')
    fd.set('unitPrice', '50')

    const items = computeLineItems(fd)
    expect(items[0].description).toBe('Design work')
  })

  it('returns empty array when only amount is provided', () => {
    const fd = new FormData()
    fd.set('amount', '500')

    const items = computeLineItems(fd)
    expect(items).toEqual([])
  })

  it('throws when both description+price and amount are missing', () => {
    const fd = new FormData()
    expect(() => computeLineItems(fd)).toThrow(
      'Description + unit price or amount is required',
    )
  })

  it('throws when only description without price', () => {
    const fd = new FormData()
    fd.set('description', 'Work')
    fd.set('unitPrice', '0')

    expect(() => computeLineItems(fd)).toThrow(
      'Description + unit price or amount is required',
    )
  })

  it('rounds unitPrice to cents', () => {
    const fd = new FormData()
    fd.set('description', 'Service')
    fd.set('unitPrice', '99.999')
    fd.set('quantity', '1')

    const items = computeLineItems(fd)
    expect(items[0].unitPrice).toBe(10000)
  })
})
