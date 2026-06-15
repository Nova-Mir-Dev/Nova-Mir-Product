import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import {
  unauthorized,
  validationError,
  rateLimited,
  internalError,
} from '@/lib/api-error'

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

    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Unsupported Media Type. Expected application/json.' },
        { status: 415 },
      )
    }

    const body = await request.json()

    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      Sentry.captureMessage('CRUD body validation failed', {
        extra: { body },
      })
      return validationError('Request body must be a JSON object.')
    }

    return NextResponse.json(
      {
        entity,
        method: 'POST',
        data: body,
        message:
          'CRUD scaffold ready. Implement create logic for ' + entity + '.',
      },
      { status: 201 },
    )
  } catch {
    return internalError()
  }
}
