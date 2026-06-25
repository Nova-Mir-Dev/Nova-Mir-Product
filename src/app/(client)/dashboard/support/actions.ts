'use server'

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createTicket(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/dashboard/support?error=Unauthorized')

  const subject = formData.get('subject') as string
  const message = formData.get('message') as string

  if (!subject?.trim() || !message?.trim()) {
    redirect('/dashboard/support?error=Subject+and+message+are+required')
  }

  const { error } = await supabase.from('support_tickets').insert({
    user_id: user.id,
    subject: subject.trim(),
    description: message.trim(),
    status: 'open',
  })

  if (error)
    redirect('/dashboard/support?error=' + encodeURIComponent(error.message))

  revalidatePath('/dashboard/support')
  redirect('/dashboard/support')
}
