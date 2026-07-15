'use server'

import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { logAudit } from '@/lib/audit-log'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const createClientSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  email: z.string().trim().email('A valid email is required').max(254),
  phone: z.string().trim().max(50).optional(),
  company: z.string().trim().max(200).optional(),
})

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

  const parsed = createClientSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: (formData.get('phone') as string) || undefined,
    company: (formData.get('company') as string) || undefined,
  })
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input')
  }
  const { name, email, phone, company } = parsed.data

  const admin = createServiceClient()

  const { data: authUser, error: authError } =
    await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { name, role: 'client' },
    })
  if (authError)
    throw new Error('Failed to create user account: ' + authError.message)

  const { error: clientError } = await admin.from('portfolio_clients').insert({
    user_id: authUser.user.id,
    name,
    email,
    phone: phone ?? null,
    company: company ?? null,
  })
  if (clientError) {
    await admin.auth.admin.deleteUser(authUser.user.id)
    throw new Error('Failed to create client profile: ' + clientError.message)
  }

  void logAudit({
    action: 'admin.client.create',
    entity: 'client',
    entityId: authUser.user.id,
    metadata: { email_domain: email.split('@')[1] ?? '' },
    userId: user.id,
  })

  revalidatePath('/admin/clients')
}
