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
  const phone = (formData.get('phone') as string) || null
  const company = (formData.get('company') as string) || null

  if (!name?.trim() || !email?.trim()) {
    throw new Error('Name and email are required')
  }

  const admin = createServiceClient()

  const { data: authUser, error: authError } =
    await admin.auth.admin.createUser({
      email: email.trim(),
      email_confirm: true,
      user_metadata: { name: name.trim(), role: 'client' },
    })
  if (authError)
    throw new Error('Failed to create user account: ' + authError.message)

  const { error: clientError } = await admin.from('portfolio_clients').insert({
    user_id: authUser.user.id,
    name: name.trim(),
    email: email.trim(),
    phone,
    company,
  })
  if (clientError) {
    await admin.auth.admin.deleteUser(authUser.user.id)
    throw new Error('Failed to create client profile: ' + clientError.message)
  }

  revalidatePath('/admin/clients')
}
