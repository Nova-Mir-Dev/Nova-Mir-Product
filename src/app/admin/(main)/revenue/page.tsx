import { createClient } from '@/lib/supabase-server'
import RevenuePage from '@/features/admin/revenue/revenue-page'
import type {
  RevenueEntry,
  ExpenseEntry,
  BusinessSummary,
} from '@/features/admin/types'

function computeSummary(
  revenues: RevenueEntry[],
  expenses: ExpenseEntry[],
): BusinessSummary {
  const totalRevenue = revenues.reduce((sum, r) => sum + Number(r.amount), 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const netProfit = totalRevenue - totalExpenses
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

  const revenueByCategory: Record<string, number> = {}
  for (const r of revenues) {
    revenueByCategory[r.category] =
      (revenueByCategory[r.category] || 0) + Number(r.amount)
  }

  const expensesByCategory: Record<string, number> = {}
  for (const e of expenses) {
    expensesByCategory[e.category] =
      (expensesByCategory[e.category] || 0) + Number(e.amount)
  }

  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const thisMonthRevenue = revenues
    .filter((r) => r.recorded_at?.startsWith(thisMonth))
    .reduce((sum, r) => sum + Number(r.amount), 0)
  const thisMonthExpenses = expenses
    .filter((e) => e.recorded_at?.startsWith(thisMonth))
    .reduce((sum, e) => sum + Number(e.amount), 0)

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    revenueByCategory,
    expensesByCategory,
    revenueCount: revenues.length,
    expenseCount: expenses.length,
    thisMonthRevenue,
    thisMonthExpenses,
  }
}

export default async function AdminRevenuePage({
  searchParams,
}: {
  searchParams: Promise<{ revenueForm?: string; expenseForm?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const [revenueResult, expenseResult] = await Promise.all([
    supabase
      .from('revenue_entries')
      .select('*')
      .order('recorded_at', { ascending: false }),
    supabase
      .from('expense_entries')
      .select('*')
      .order('recorded_at', { ascending: false }),
  ])

  // Surface a data-layer failure instead of rendering $0 totals.
  if (revenueResult.error || expenseResult.error) {
    throw new Error('Failed to load revenue data')
  }

  const rawRevenues = (revenueResult.data ?? []) as RevenueEntry[]
  const rawExpenses = (expenseResult.data ?? []) as ExpenseEntry[]
  const summary = computeSummary(rawRevenues, rawExpenses)

  return (
    <RevenuePage
      revenues={rawRevenues}
      expenses={rawExpenses}
      summary={summary}
      showRevenueForm={params.revenueForm === 'true'}
      showExpenseForm={params.expenseForm === 'true'}
    />
  )
}
