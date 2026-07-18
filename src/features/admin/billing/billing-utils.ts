export function formatAmount(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

export function invoiceStatusVariant(
  status: string,
): 'success' | 'warning' | 'danger' {
  if (status === 'paid') return 'success'
  if (status === 'pending') return 'warning'
  return 'danger'
}

export function generateInvoiceNumber(count: number): string {
  const year = new Date().getFullYear()
  return `INV-${year}-${String(count).padStart(5, '0')}`
}

export function computeLineItems(formData: FormData): Array<{
  description: string
  quantity: number
  unitPrice: number
}> {
  const description = formData.get('description') as string | null
  const quantity = Number(formData.get('quantity') || '1')
  const unitPrice = Number(formData.get('unitPrice') || '0')
  const amount = Number(formData.get('amount') || '0')

  if (description?.trim() && unitPrice > 0) {
    const unitPriceCents = Math.round(unitPrice * 100)
    return [
      {
        description: description.trim(),
        quantity,
        unitPrice: unitPriceCents,
      },
    ]
  }

  if (amount > 0) {
    return []
  }

  throw new Error('Description + unit price or amount is required')
}
