'use server'

import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function createAdminUser(formData: FormData) {
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

  const email = formData.get('email') as string
  const name = formData.get('name') as string
  const role = (formData.get('role') as string) || 'admin'

  if (!email?.trim() || !name?.trim())
    throw new Error('Name and email are required')
  if (!['admin', 'read_only'].includes(role)) throw new Error('Invalid role')

  const admin = createServiceClient()

  const { data: authUser, error: authError } =
    await admin.auth.admin.inviteUserByEmail(email.trim(), {
      data: { name: name.trim(), role },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/admin`,
    })
  if (authError) throw new Error('Failed to invite user: ' + authError.message)

  const { error: profileError } = await admin.from('users').insert({
    id: authUser.user.id,
    email: email.trim(),
    name: name.trim(),
    role,
  })
  if (profileError)
    throw new Error('Failed to create profile: ' + profileError.message)

  revalidatePath('/admin/admins')
  return { success: true }
}

export async function listAdminUsers() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const admin = createServiceClient()
  const { data: users, error } = await admin
    .from('users')
    .select('id, email, name, role, created_at, updated_at')
    .in('role', ['admin', 'read_only'])
    .order('created_at', { ascending: true })

  if (error) throw new Error('Failed to fetch admin users')
  return users
}
