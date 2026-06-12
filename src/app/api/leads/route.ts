import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { rateLimit } from '@/lib/rate-limit'
import { notifyNewLead } from '@/lib/slack'

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const limit = Math.min(
    Math.max(parseInt(searchParams.get('limit') || '50', 10) || 50, 1),
    100,
  )
  const offset = Math.max(
    parseInt(searchParams.get('offset') || '0', 10) || 0,
    0,
  )

  let query = supabase.from('leads').select('*', { count: 'exact' })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Failed to fetch leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ data, total: count ?? 0 })
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    if (!rateLimit(`leads:${ip}`, 10, 60000)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      )
    }

    const body = (await request.json()) as {
      name: string
      email: string
      businessName: string
      phone?: string
      serviceInterest?: string
      budgetRange?: string
      message: string
      consent?: boolean
    }

    if (
      !body.name?.trim() ||
      !body.email?.trim() ||
      !body.businessName?.trim() ||
      !body.message?.trim()
    ) {
      return NextResponse.json(
        { error: 'Name, email, business name, and message are required.' },
        { status: 400 },
      )
    }

    if (!body.consent) {
      return NextResponse.json(
        { error: 'You must consent to data storage before submitting.' },
        { status: 400 },
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 },
      )
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('leads')
      .insert({
        name: body.name.trim(),
        email: body.email.trim(),
        business_name: body.businessName.trim(),
        phone: body.phone?.trim() || null,
        service_interest: body.serviceInterest || null,
        budget_range: body.budgetRange || null,
        message: body.message.trim(),
        consent: body.consent,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to insert lead:', error)
      return NextResponse.json(
        { error: 'Failed to save your message. Please try again later.' },
        { status: 500 },
      )
    }

    notifyNewLead({
      name: body.name.trim(),
      email: body.email.trim(),
      businessName: body.businessName.trim(),
      phone: body.phone?.trim(),
      serviceInterest: body.serviceInterest,
      budgetRange: body.budgetRange,
      message: body.message.trim(),
    }).catch((err) => console.error('Slack notification failed:', err))

    return NextResponse.json({ id: data.id }, { status: 201 })
  } catch (err) {
    console.error('Lead submission error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 },
    )
  }
}
