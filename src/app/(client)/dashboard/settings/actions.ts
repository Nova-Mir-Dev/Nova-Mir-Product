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

export async function updateClientNotificationPrefs(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const prefs = {
    notify_project_updates: formData.get('notify_project_updates') === 'on',
    notify_invoice_reminders: formData.get('notify_invoice_reminders') === 'on',
    notify_marketing: formData.get('notify_marketing') === 'on',
  }

  const { error } = await supabase.auth.updateUser({
    data: { notification_prefs: prefs },
  })
  if (error) throw new Error('Failed to update preferences')

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
