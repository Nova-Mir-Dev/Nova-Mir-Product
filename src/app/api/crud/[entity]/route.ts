import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import {
  unauthorized,
  validationError,
  rateLimited,
  internalError,
} from '@/lib/api-error'
import { z } from 'zod'

const crudBodySchema = z.object({}).passthrough()

const ALLOWED_ENTITIES = new Set(['users', 'projects', 'tasks'])

export async function GET(
  request: Request,
  { params }: { params: Promise<{ entity: string }> },
) {
  try {
    const { entity } = await params
    if (!ALLOWED_ENTITIES.has(entity)) {
      return validationError('Invalid entity')
    }
    const supabase = await createServerClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error || !user) return unauthorized()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    return NextResponse.json({
      entity,
      method: 'GET',
      limit,
      offset,
      message:
        'CRUD scaffold ready. Implement data fetching for ' + entity + '.',
    })
  } catch {
    return internalError()
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ entity: string }> },
) {
  try {
    const { entity } = await params
    if (!ALLOWED_ENTITIES.has(entity)) {
      return validationError('Invalid entity')
    }
    const supabase = await createServerClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error || !user) return unauthorized()

    const { allowed } = await rateLimit(`crud:${user.id}`, 30, 60000)
    if (!allowed) {
      return rateLimited()
    }

    const parsed = crudBodySchema.safeParse(await request.json())
    if (!parsed.success)
      return validationError('Request body must be a JSON object.')

    return NextResponse.json(
      {
        entity,
        method: 'POST',
        data: parsed.data,
        message:
          'CRUD scaffold ready. Implement create logic for ' + entity + '.',
      },
      { status: 201 },
    )
  } catch {
    return internalError()
  }
}
