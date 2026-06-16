import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase-server'
import { sanitizeFilename } from '@/lib/sanitize'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

const createDocumentBodySchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  filePath: z.string().trim().min(1, 'File path is required').max(1000),
})

export async function GET() {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ documents: [] })
}

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { allowed } = await rateLimit(`documents:${user.id}`, 20, 60000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    )
  }

  const parsed = createDocumentBodySchema.safeParse(await request.json())
  if (!parsed.success) {
    Sentry.captureMessage('Documents validation failed', {
      extra: { issues: parsed.error.issues },
    })
    return NextResponse.json({ error: 'Validation failed.' }, { status: 400 })
  }
  const body = parsed.data
  const safePath = sanitizeFilename(body.filePath || `doc_${Date.now()}.pdf`)
  return NextResponse.json(
    {
      id: crypto.randomUUID(),
      title: body.title,
      filePath: safePath,
      userId: user.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
    { status: 201 },
  )
}
