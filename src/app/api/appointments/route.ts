import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json([])
}

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = (await request.json()) as {
    title: string
    description?: string
    startTime: string
    endTime: string
  }
  return NextResponse.json(
    {
      id: crypto.randomUUID(),
      ...body,
      userId: user.id,
      status: 'scheduled',
    },
    { status: 201 },
  )
}
