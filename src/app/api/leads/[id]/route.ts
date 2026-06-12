import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { rateLimit } from '@/lib/rate-limit'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'
    if (!rateLimit(`leads-patch:${ip}`, 20, 60000)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      )
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {},
        },
      },
    )
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Lead ID is required.' },
        { status: 400 },
      )
    }

    const body = (await request.json()) as { status?: string }

    if (!body.status?.trim()) {
      return NextResponse.json(
        { error: 'Status is required.' },
        { status: 400 },
      )
    }

    const { data, error } = await supabase
      .from('leads')
      .update({ status: body.status.trim() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Lead not found.' }, { status: 404 })
      }
      console.error('Failed to update lead:', error)
      return NextResponse.json(
        { error: 'Failed to update lead.' },
        { status: 500 },
      )
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('Lead update error:', err)
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 },
    )
  }
}
