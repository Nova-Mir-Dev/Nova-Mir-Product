import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { logAudit } from '@/lib/audit-log'
import { revalidatePath } from 'next/cache'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

const lineItemSchema = z.object({
  description: z.string().trim().min(1, 'Description is required').max(500),
  quantity: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().positive('Unit price must be positive'),
})

const createInvoiceBodySchema = z.object({
  clientName: z.string().trim().min(1, 'Client name is required').max(200),
  amount: z.number().positive().optional(),
  clientId: z.string().trim().optional(),
  lineItems: z.array(lineItemSchema).optional(),
  dueDate: z.string().trim().optional(),
})

const updateInvoiceBodySchema = z.object({
  id: z.string().trim().min(1, 'Invoice ID is required'),
  status: z.string().trim().min(1, 'Status is required'),
  paidAt: z.string().trim().optional().nullable(),
})

async function authCheck() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user)
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin')
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }

  return { user }
}

export async function GET() {
  try {
    const check = await authCheck()
    if ('error' in check) return check.error

    const admin = createServiceClient()
    const { data: invoices, error: invoicesError } = await admin
      .from('portfolio_invoices')
      .select('*, line_items(*)')
      .order('created_at', { ascending: false })

    if (invoicesError)
      return NextResponse.json(
        { error: 'Failed to fetch invoices' },
        { status: 500 },
      )

    const mapped = (invoices ?? []).map((inv: Record<string, unknown>) => ({
      id: inv.id,
      client_name: inv.client_name,
      client_id: inv.client_id,
      amount: inv.amount,
      status: inv.status,
      date: inv.date,
      created_at: inv.created_at,
      invoice_number: inv.invoice_number,
      due_date: inv.due_date,
      paid_at: inv.paid_at,
      line_items: inv.line_items,
    }))

    const summary = {
      paid: mapped.filter((i) => i.status === 'paid').length,
      pending: mapped.filter((i) => i.status === 'pending').length,
      overdue: mapped.filter((i) => i.status === 'overdue').length,
    }

    return NextResponse.json({ invoices: mapped, summary })
  } catch (err) {
    Sentry.captureException(err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const check = await authCheck()
    if ('error' in check) return check.error

    const { allowed } = await rateLimit(
      `admin:billing:${check.user.id}`,
      30,
      60000,
    )
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      )
    }

    const parsed = createInvoiceBodySchema.safeParse(await request.json())
    if (!parsed.success) {
      Sentry.captureMessage('Billing POST validation failed', {
        extra: {
          issueCount: parsed.error.issues.length,
          issuePaths: parsed.error.issues.map((i) => i.path.join('.')),
        },
      })
      return NextResponse.json({ error: 'Validation failed.' }, { status: 400 })
    }
    const body = parsed.data

    const admin = createServiceClient()

    const year = new Date().getFullYear()
    const { count } = await admin
      .from('portfolio_invoices')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${year}-01-01T00:00:00Z`)
      .lt('created_at', `${year + 1}-01-01T00:00:00Z`)

    const nextNum = (count ?? 0) + 1
    const invoiceNumber = `INV-${year}-${String(nextNum).padStart(5, '0')}`

    let totalAmount = 0
    let lineItemsData:
      | {
          description: string
          quantity: number
          unit_price: number
          amount: number
        }[]
      | undefined

    if (body.lineItems && body.lineItems.length > 0) {
      lineItemsData = body.lineItems.map((li) => {
        const unitPriceCents = Math.round(li.unitPrice * 100)
        const amount = li.quantity * unitPriceCents
        totalAmount += amount
        return {
          description: li.description,
          quantity: li.quantity,
          unit_price: unitPriceCents,
          amount,
        }
      })
    } else if (body.amount && body.amount > 0) {
      totalAmount = Math.round(body.amount * 100)
    } else {
      return NextResponse.json(
        { error: 'Valid amount or line items are required' },
        { status: 400 },
      )
    }

    let userId: string | null
    if (body.clientId) {
      const { data: clientRecord } = await admin
        .from('portfolio_clients')
        .select('user_id')
        .eq('id', body.clientId)
        .single()
      userId = clientRecord?.user_id ?? null
    } else {
      const { data: userRecord } = await admin
        .from('users')
        .select('id')
        .eq('name', body.clientName)
        .maybeSingle()
      userId = userRecord?.id ?? null
    }

    const { data: invoice, error: createError } = await admin
      .from('portfolio_invoices')
      .insert({
        client_name: body.clientName,
        client_id: body.clientId || null,
        user_id: userId,
        amount: totalAmount,
        status: 'pending',
        invoice_number: invoiceNumber,
        due_date: body.dueDate || null,
        date: new Date().toISOString(),
      })
      .select()
      .single()

    if (createError)
      return NextResponse.json(
        { error: 'Failed to create invoice' },
        { status: 500 },
      )

    void logAudit({
      action: 'billing.invoice.create',
      entity: 'invoice',
      entityId: invoice.id,
      metadata: { status: invoice.status, total_cents: totalAmount },
      userId: check.user.id,
    })

    if (lineItemsData && lineItemsData.length > 0) {
      const { error: liError } = await admin.from('line_items').insert(
        lineItemsData.map((li) => ({
          ...li,
          invoice_id: invoice.id,
        })),
      )
      if (liError) Sentry.captureException(liError)
    }

    revalidatePath('/admin/billing')

    const mapped = {
      id: invoice.id,
      client_name: invoice.client_name,
      client_id: invoice.client_id,
      amount: invoice.amount,
      status: invoice.status,
      date: invoice.date,
      created_at: invoice.created_at,
      invoice_number: invoice.invoice_number,
      due_date: invoice.due_date,
      paid_at: invoice.paid_at,
      line_items: lineItemsData,
    }

    return NextResponse.json(mapped, { status: 201 })
  } catch (err) {
    Sentry.captureException(err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const check = await authCheck()
    if ('error' in check) return check.error

    const { allowed } = await rateLimit(
      `admin:billing:${check.user.id}`,
      30,
      60000,
    )
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      )
    }

    const parsed = updateInvoiceBodySchema.safeParse(await request.json())
    if (!parsed.success) {
      Sentry.captureMessage('Billing PATCH validation failed', {
        extra: {
          issueCount: parsed.error.issues.length,
          issuePaths: parsed.error.issues.map((i) => i.path.join('.')),
        },
      })
      return NextResponse.json({ error: 'Validation failed.' }, { status: 400 })
    }
    const body = parsed.data

    const admin = createServiceClient()

    const updateData: Record<string, unknown> = { status: body.status }
    if (body.status === 'paid') {
      updateData.paid_at = body.paidAt || new Date().toISOString()
    }

    const { data: invoice, error: updateError } = await admin
      .from('portfolio_invoices')
      .update(updateData)
      .eq('id', body.id)
      .select('*, line_items(*)')
      .single()

    if (updateError)
      return NextResponse.json(
        { error: 'Failed to update invoice' },
        { status: 500 },
      )

    revalidatePath('/admin/billing')

    const mapped = {
      id: invoice.id,
      client_name: invoice.client_name,
      client_id: invoice.client_id,
      amount: invoice.amount,
      status: invoice.status,
      date: invoice.date,
      created_at: invoice.created_at,
      invoice_number: invoice.invoice_number,
      due_date: invoice.due_date,
      paid_at: invoice.paid_at,
      line_items: invoice.line_items,
    }

    return NextResponse.json(mapped)
  } catch (err) {
    Sentry.captureException(err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
