import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase-server'
import { unauthorized, notFound, internalError } from '@/lib/api-error'
import { z } from 'zod'

const clientResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  company: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export async function GET() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error || !user) return unauthorized()

    const { data: client, error: clientError } = await supabase
      .from('portfolio_clients')
      .select('*')
      .eq('email', user.email)
      .maybeSingle()

    if (clientError) return internalError()
    if (!client) return notFound('Client profile not found')

    return NextResponse.json(clientResponseSchema.parse(client))
  } catch {
    return internalError()
  }
}
