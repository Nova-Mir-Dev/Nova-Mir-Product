'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function updateClientProfile(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const name = formData.get('name') as string | null

  const { error } = await supabase
    .from('users')
    .update({ name: name || null })
    .eq('id', user.id)

  if (error) throw new Error('Failed to update profile')

  revalidatePath('/dashboard/settings')
}

export async function updateClientPassword(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const password = formData.get('password') as string
  if (!password) throw new Error('Password is required')

  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/settings')
}
