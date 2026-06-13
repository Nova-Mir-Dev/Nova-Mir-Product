export const REVENUE_CATEGORIES = [
  'service',
  'product',
  'consulting',
  'retainer',
  'other',
] as const

export const EXPENSE_CATEGORIES = [
  'software',
  'hosting',
  'contractor',
  'travel',
  'office',
  'marketing',
  'other',
] as const

export function validateRevenueEntry(
  data: Record<string, FormDataEntryValue | null>,
): { error?: string } | null {
  const clientName = data.clientName as string
  const description = data.description as string
  const amount = data.amount as string
  const category = data.category as string
  const recordedAt = data.recordedAt as string

  if (!clientName?.trim()) return { error: 'Client name is required' }
  if (!description?.trim()) return { error: 'Description is required' }
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
    return { error: 'Valid amount is required' }
  if (!category?.trim()) return { error: 'Category is required' }
  if (!recordedAt?.trim()) return { error: 'Date is required' }

  const revenueCategories: readonly string[] = REVENUE_CATEGORIES
  if (!revenueCategories.includes(category))
    return { error: 'Invalid category' }

  return null
}

export function validateExpenseEntry(
  data: Record<string, FormDataEntryValue | null>,
): { error?: string } | null {
  const vendor = data.vendor as string
  const description = data.description as string
  const amount = data.amount as string
  const category = data.category as string
  const recordedAt = data.recordedAt as string

  if (!vendor?.trim()) return { error: 'Vendor is required' }
  if (!description?.trim()) return { error: 'Description is required' }
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
    return { error: 'Valid amount is required' }
  if (!category?.trim()) return { error: 'Category is required' }
  if (!recordedAt?.trim()) return { error: 'Date is required' }

  const expenseCategories: readonly string[] = EXPENSE_CATEGORIES
  if (!expenseCategories.includes(category))
    return { error: 'Invalid category' }

  return null
}
