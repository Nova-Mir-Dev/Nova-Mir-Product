'use server'

import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import { generateApiKey } from './settings-utils'

export async function updateProfile(formData: FormData) {
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

  revalidatePath('/admin/settings')
}

export interface CreateApiKeyResult {
  success: boolean
  key?: string
  error?: string
}

export async function createApiKey(
  _prevState: unknown,
  _formData: FormData,
): Promise<CreateApiKeyResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') return { success: false, error: 'Forbidden' }

  const { key: rawKey, hashedKey: hash, prefix } = await generateApiKey()
  const name = `API Key - ${new Date().toISOString().split('T')[0]}`

  const admin = createServiceClient()
  const { error } = await admin.from('api_keys').insert({
    user_id: user.id,
    name,
    prefix,
    hash,
  })

  if (error) return { success: false, error: 'Failed to create API key' }

  revalidatePath('/admin/settings')
  return { success: true, key: rawKey }
}

export async function revokeApiKey(formData: FormData) {
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
  if (!id) throw new Error('Key ID is required')

  const admin = createServiceClient()
  const { error } = await admin
    .from('api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error('Failed to revoke API key')

  revalidatePath('/admin/settings')
}
