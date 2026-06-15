'use server'

import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function createClientAction(formData: FormData) {
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

  const name = formData.get('name') as string
  const email = formData.get('email') as string

  if (!name?.trim() || !email?.trim()) {
    throw new Error('Name and email are required')
  }

  const admin = createServiceClient()
  const { error } = await admin.from('portfolio_clients').insert({
    name: name.trim(),
    email: email.trim(),
  })

  if (error) throw new Error('Failed to create client')

  revalidatePath('/admin/clients')
}
