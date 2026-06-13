'use server'

import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

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

  const clientName = formData.get('clientName') as string
  const description = formData.get('description') as string
  const amount = formData.get('amount') as string
  const category = formData.get('category') as string
  const recordedAt = formData.get('recordedAt') as string

  if (!clientName?.trim()) return { error: 'Client name is required' }
  if (!description?.trim()) return { error: 'Description is required' }
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return { error: 'Valid amount is required' }
  if (!category?.trim()) return { error: 'Category is required' }
  if (!recordedAt?.trim()) return { error: 'Date is required' }

  const allowedCategories = ['service', 'product', 'consulting', 'retainer', 'other']
  if (!allowedCategories.includes(category)) return { error: 'Invalid category' }

  const amountCents = Math.round(Number(amount) * 100)

  const admin = createServiceClient()
  const { error: insertError } = await admin.from('revenue_entries').insert({
    client_name: clientName.trim(),
    description: description.trim(),
    amount: amountCents,
    category,
    recorded_at: new Date(recordedAt).toISOString(),
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

  const vendor = formData.get('vendor') as string
  const description = formData.get('description') as string
  const amount = formData.get('amount') as string
  const category = formData.get('category') as string
  const recordedAt = formData.get('recordedAt') as string
  const receiptUrl = formData.get('receiptUrl') as string | null

  if (!vendor?.trim()) return { error: 'Vendor is required' }
  if (!description?.trim()) return { error: 'Description is required' }
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return { error: 'Valid amount is required' }
  if (!category?.trim()) return { error: 'Category is required' }
  if (!recordedAt?.trim()) return { error: 'Date is required' }

  const allowedCategories = ['software', 'hosting', 'contractor', 'travel', 'office', 'marketing', 'other']
  if (!allowedCategories.includes(category)) return { error: 'Invalid category' }

  const amountCents = Math.round(Number(amount) * 100)

  const admin = createServiceClient()
  const { error: insertError } = await admin.from('expense_entries').insert({
    vendor: vendor.trim(),
    description: description.trim(),
    amount: amountCents,
    category,
    recorded_at: new Date(recordedAt).toISOString(),
    receipt_url: receiptUrl?.trim() || null,
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
