import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { unauthorized, internalError } from '@/lib/api-error'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error || !user) return unauthorized()

    const { data: profile } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('id', user.id)
      .single()

    if (!profile) return unauthorized()

    return NextResponse.json(profile)
  } catch {
    return internalError()
  }
}
