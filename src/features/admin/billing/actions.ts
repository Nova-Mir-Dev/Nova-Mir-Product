'use server'

import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function createInvoice(formData: FormData) {
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

  const clientName = formData.get('clientName') as string
  const description = formData.get('description') as string | null
  const quantity = Number(formData.get('quantity') || '1')
  const unitPrice = Number(formData.get('unitPrice') || '0')
  const amount = Number(formData.get('amount') || '0')

  if (!clientName?.trim()) {
    throw new Error('Client name is required')
  }

  const admin = createServiceClient()

  const year = new Date().getFullYear()
  const { count } = await admin
    .from('portfolio_invoices')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${year}-01-01T00:00:00Z`)
    .lt('created_at', `${year + 1}-01-01T00:00:00Z`)

  const nextNum = (count ?? 0) + 1
  const invoiceNumber = `INV-${year}-${String(nextNum).padStart(5, '0')}`

  let totalAmount = 0
  let lineItem:
    | { description: string; quantity: number; unit_price: number; amount: number }
    | undefined

  if (description?.trim() && unitPrice > 0) {
    const unitPriceCents = Math.round(unitPrice * 100)
    totalAmount = quantity * unitPriceCents
    lineItem = {
      description: description.trim(),
      quantity,
      unit_price: unitPriceCents,
      amount: totalAmount,
    }
  } else if (amount > 0) {
    totalAmount = Math.round(amount * 100)
  } else {
    throw new Error('Description + unit price or amount is required')
  }

  const { data: invoice, error: createError } = await admin
    .from('portfolio_invoices')
    .insert({
      client_name: clientName.trim(),
      amount: totalAmount,
      status: 'pending',
      invoice_number: invoiceNumber,
      date: new Date().toISOString(),
    })
    .select()
    .single()

  if (createError) throw new Error('Failed to create invoice')

  if (lineItem) {
    const { error: liError } = await admin.from('line_items').insert({
      ...lineItem,
      invoice_id: invoice.id,
    })
    if (liError) throw new Error('Failed to create line items')
  }

  revalidatePath('/admin/billing')
}

export async function markInvoiceAsPaid(formData: FormData) {
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
  if (!id) throw new Error('Invoice ID is required')

  const admin = createServiceClient()
  const { error } = await admin
    .from('portfolio_invoices')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw new Error('Failed to mark invoice as paid')

  revalidatePath('/admin/billing')
}
