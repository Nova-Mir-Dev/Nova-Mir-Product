import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { unauthorized, internalError } from '@/lib/api-error'
import { z } from 'zod'

const invoiceSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  client_name: z.string(),
  amount: z.number(),
  status: z.string(),
  due_date: z.string().nullable(),
  created_at: z.string(),
  paid_at: z.string().nullable(),
})

export async function GET() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error || !user) return unauthorized()

    const admin = createServiceClient()
    const { data: invoices, error: invoicesError } = await admin
      .from('portfolio_invoices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (invoicesError) return internalError()

    const parsed = z.array(invoiceSchema).parse(invoices ?? [])
    return NextResponse.json(parsed)
  } catch {
    return internalError()
  }
}
