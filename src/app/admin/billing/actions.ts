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
  const amount = Number(formData.get('amount'))

  if (!clientName?.trim() || !amount || amount <= 0) {
    throw new Error('Valid client name and amount are required')
  }

  const admin = createServiceClient()
  const { error } = await admin.from('portfolio_invoices').insert({
    client_name: clientName.trim(),
    amount: Math.round(amount),
    status: 'pending',
    date: new Date().toISOString(),
  })

  if (error) throw new Error('Failed to create invoice')

  revalidatePath('/admin/billing')
}
