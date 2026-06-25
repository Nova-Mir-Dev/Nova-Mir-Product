'use server'

import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { leadStatusSchema } from '@/features/leads/schemas'
import { revalidatePath } from 'next/cache'

export async function updateLeadAction(formData: FormData) {
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
  const status = formData.get('status') as string
  const notes = formData.get('notes') as string

  if (!id) throw new Error('Lead ID is required')

  const admin = createServiceClient()
  const updates: Record<string, string> = {
    updated_at: new Date().toISOString(),
  }
  if (status) {
    const parsed = leadStatusSchema.safeParse(status)
    if (!parsed.success) throw new Error('Invalid lead status')
    updates.status = parsed.data
  }
  if (notes !== null) updates.notes = notes

  const { error } = await admin.from('leads').update(updates).eq('id', id)
  if (error) throw new Error('Failed to update lead')

  revalidatePath('/admin/leads')
}

export async function convertToClientAction(formData: FormData) {
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
  if (!id) throw new Error('Lead ID is required')

  const admin = createServiceClient()

  const { data: lead, error: leadError } = await admin
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()
  if (leadError || !lead) throw new Error('Lead not found')

  const { error: clientError } = await admin.from('portfolio_clients').insert({
    name: lead.name,
    email: lead.email,
  })
  if (clientError) throw new Error('Failed to create client')

  const { error: updateError } = await admin
    .from('leads')
    .update({ status: 'won', updated_at: new Date().toISOString() })
    .eq('id', id)
  if (updateError) throw new Error('Failed to update lead status')

  revalidatePath('/admin/leads')
  revalidatePath('/admin/clients')
}
