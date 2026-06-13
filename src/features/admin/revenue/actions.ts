'use server'

import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import { validateRevenueEntry, validateExpenseEntry } from './revenue-utils'

export async function createRevenueEntry(_prevState: { error: string } | null, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') return { error: 'Forbidden' }

  const data = Object.fromEntries(formData) as Record<string, FormDataEntryValue | null>
  const validation = validateRevenueEntry(data)
  if (validation) return validation

  const amountCents = Math.round(Number(data.amount) * 100)

  const admin = createServiceClient()
  const { error: insertError } = await admin.from('revenue_entries').insert({
    client_name: (data.clientName as string).trim(),
    description: (data.description as string).trim(),
    amount: amountCents,
    category: data.category as string,
    recorded_at: new Date(data.recordedAt as string).toISOString(),
  })

  if (insertError) return { error: 'Failed to create revenue entry' }

  revalidatePath('/admin/revenue')
  revalidatePath('/admin')
  return null
}

export async function createExpenseEntry(_prevState: { error: string } | null, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') return { error: 'Forbidden' }

  const data = Object.fromEntries(formData) as Record<string, FormDataEntryValue | null>
  const validation = validateExpenseEntry(data)
  if (validation) return validation

  const amountCents = Math.round(Number(data.amount) * 100)

  const admin = createServiceClient()
  const { error: insertError } = await admin.from('expense_entries').insert({
    vendor: (data.vendor as string).trim(),
    description: (data.description as string).trim(),
    amount: amountCents,
    category: data.category as string,
    recorded_at: new Date(data.recordedAt as string).toISOString(),
    receipt_url: (data.receiptUrl as string)?.trim() || null,
  })

  if (insertError) return { error: 'Failed to create expense entry' }

  revalidatePath('/admin/revenue')
  revalidatePath('/admin')
  return null
}

export async function deleteRevenueEntry(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')

  const id = formData.get('id') as string
  if (!id) throw new Error('Revenue entry ID is required')

  const admin = createServiceClient()
  const { error } = await admin.from('revenue_entries').delete().eq('id', id)
  if (error) throw new Error('Failed to delete revenue entry')

  revalidatePath('/admin/revenue')
  revalidatePath('/admin')
}

export async function deleteExpenseEntry(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')

  const id = formData.get('id') as string
  if (!id) throw new Error('Expense entry ID is required')

  const admin = createServiceClient()
  const { error } = await admin.from('expense_entries').delete().eq('id', id)
  if (error) throw new Error('Failed to delete expense entry')

  revalidatePath('/admin/revenue')
  revalidatePath('/admin')
}
