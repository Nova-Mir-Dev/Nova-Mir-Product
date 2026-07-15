import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { internalError } from '@/lib/api-error'
import { z } from 'zod'
import { randomUUID } from 'crypto'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB

const uploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  fileSize: z.number().max(MAX_SIZE),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createServiceClient()
    const { data: profile } = await admin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const parsed = uploadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid file metadata' },
        { status: 400 },
      )
    }

    const { fileType } = parsed.data
    const ext = fileType.split('/')[1]
    const filePath = `${user.id}/${randomUUID()}.${ext}`

    const { data, error } = await admin.storage
      .from('portfolio-images')
      .createSignedUploadUrl(filePath)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create upload URL' },
        { status: 500 },
      )
    }

    const publicUrl = admin.storage
      .from('portfolio-images')
      .getPublicUrl(filePath).data.publicUrl

    return NextResponse.json({
      uploadUrl: data.signedUrl,
      publicUrl,
      filePath,
    })
  } catch (err) {
    Sentry.captureException(err)
    return internalError()
  }
}
