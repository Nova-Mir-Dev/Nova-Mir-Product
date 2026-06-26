'use server'

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { notifyNewTicket } from '@/lib/slack'

export async function createTicket(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/dashboard/support?error=Unauthorized')

  const subject = formData.get('subject') as string
  const message = formData.get('message') as string
  const priority = (formData.get('priority') as string) || 'medium'

  if (!subject?.trim() || !message?.trim()) {
    redirect('/dashboard/support?error=Subject+and+message+are+required')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('name, email')
    .eq('id', user.id)
    .single()

  const { data: ticket, error } = await supabase
    .from('support_tickets')
    .insert({
      user_id: user.id,
      subject: subject.trim(),
      description: message.trim(),
      priority,
      status: 'open',
    })
    .select()
    .single()

  if (error)
    redirect('/dashboard/support?error=' + encodeURIComponent(error.message))

  notifyNewTicket({
    id: ticket.id,
    subject: subject.trim(),
    description: message.trim(),
    priority,
    clientName: (profile as { name?: string })?.name || user.email || 'Unknown',
    clientEmail: user.email || '',
  }).catch((err) => console.error('Slack notification failed:', err))

  revalidatePath('/dashboard/support')
  redirect('/dashboard/support')
}
