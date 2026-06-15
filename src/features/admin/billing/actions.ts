'use server'

import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import { generateInvoiceNumber, computeLineItems } from './billing-utils'

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

  if (!clientName?.trim()) {
    throw new Error('Client name is required')
  }

  const admin = createServiceClient()

  const { data: userRecord } = await admin
    .from('users')
    .select('id')
    .eq('name', clientName.trim())
    .maybeSingle()

  const year = new Date().getFullYear()
  const { count } = await admin
    .from('portfolio_invoices')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${year}-01-01T00:00:00Z`)
    .lt('created_at', `${year + 1}-01-01T00:00:00Z`)

  const invoiceNumber = generateInvoiceNumber((count ?? 0) + 1)
  const items = computeLineItems(formData)
  const totalAmount =
    items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) ||
    Math.round(Number(formData.get('amount') || '0') * 100)

  const { data: invoice, error: createError } = await admin
    .from('portfolio_invoices')
    .insert({
      client_name: clientName.trim(),
      user_id: userRecord?.id ?? null,
      amount: totalAmount,
      status: 'pending',
      invoice_number: invoiceNumber,
      date: new Date().toISOString(),
    })
    .select()
    .single()

  if (createError) throw new Error('Failed to create invoice')

  const firstItem = items[0]
  if (firstItem) {
    const { error: liError } = await admin.from('line_items').insert({
      description: firstItem.description,
      quantity: firstItem.quantity,
      unit_price: firstItem.unitPrice,
      amount: firstItem.unitPrice * firstItem.quantity,
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
