import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAllowedOrigin, CORS_HEADERS, getCorsOriginHeader } from '@/lib/cors'
import { rateLimit } from '@/lib/rate-limit'

const PUBLIC_API_ROUTES = new Map<string, Set<string>>([
  ['/api/health', new Set(['GET'])],
  ['/api/leads', new Set(['POST'])],
])

function addCorsHeaders(
  response: NextResponse,
  origin: string | null,
  apiRoute = false,
): NextResponse {
  if (!apiRoute) return response
  if (origin && isAllowedOrigin(origin)) {
    response.headers.set(
      'Access-Control-Allow-Origin',
      getCorsOriginHeader(origin),
    )
    response.headers.set(
      'Access-Control-Allow-Methods',
      CORS_HEADERS['Access-Control-Allow-Methods'],
    )
    response.headers.set(
      'Access-Control-Allow-Headers',
      CORS_HEADERS['Access-Control-Allow-Headers'],
    )
    response.headers.set(
      'Access-Control-Max-Age',
      CORS_HEADERS['Access-Control-Max-Age'],
    )
  }
  return response
}

const supabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function hasSupabaseEnv(): boolean {
  return !!supabaseUrl() && !!supabaseAnonKey()
}

async function getAuth(request: NextRequest) {
  if (!hasSupabaseEnv())
    return {
      user: null,
      role: null,
      supabaseResponse: NextResponse.next({ request }),
    }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl()!, supabaseAnonKey()!, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        supabaseResponse = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options)
        }
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let role: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    role = (profile?.role as string) ?? null
  }

  return { user, role, supabaseResponse }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const origin = request.headers.get('origin')
  const host = request.headers.get('host') || ''
  const isApiRoute = pathname.startsWith('/api/')

  if (host.endsWith('.vercel.app')) {
    const url = new URL('https://www.novamir.dev' + pathname)
    url.search = request.nextUrl.search
    return NextResponse.redirect(url, 301)
  }

  if (isApiRoute && request.method === 'OPTIONS') {
    if (isAllowedOrigin(origin)) {
      const response = new NextResponse(null, { status: 204 })
      response.headers.set(
        'Access-Control-Allow-Origin',
        getCorsOriginHeader(origin),
      )
      response.headers.set(
        'Access-Control-Allow-Methods',
        CORS_HEADERS['Access-Control-Allow-Methods'],
      )
      response.headers.set(
        'Access-Control-Allow-Headers',
        CORS_HEADERS['Access-Control-Allow-Headers'],
      )
      response.headers.set(
        'Access-Control-Max-Age',
        CORS_HEADERS['Access-Control-Max-Age'],
      )
      return response
    }
    return new NextResponse(null, { status: 204 })
  }

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    if (origin && !isAllowedOrigin(origin)) {
      return addCorsHeaders(
        NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
        origin,
        isApiRoute,
      )
    }
    const referer = request.headers.get('referer')
    if (
      !origin &&
      (!process.env.NEXT_PUBLIC_SITE_URL || !referer?.startsWith(process.env.NEXT_PUBLIC_SITE_URL))
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/setup') ||
    (pathname === '/' && hasSupabaseEnv())
  ) {
    const { user, role, supabaseResponse } = await getAuth(request)

    if (pathname === '/' && user) {
      if (role === 'admin') {
        return addCorsHeaders(
          NextResponse.redirect(new URL('/admin', request.url)),
          origin,
        )
      }
      if (role === 'client') {
        return addCorsHeaders(
          NextResponse.redirect(new URL('/dashboard', request.url)),
          origin,
        )
      }
      addCorsHeaders(supabaseResponse, origin)
      return supabaseResponse
    }

    if (pathname.startsWith('/admin')) {
      if (!user) {
        const url = new URL('/admin/auth/login', request.url)
        url.searchParams.set('redirect', pathname)
        return addCorsHeaders(NextResponse.redirect(url), origin)
      }
      if (role === 'client') {
        return addCorsHeaders(
          NextResponse.redirect(new URL('/dashboard', request.url)),
          origin,
        )
      }
      if (role !== 'admin') {
        const url = new URL('/admin/auth/login', request.url)
        url.searchParams.set('reason', 'no_role')
        return addCorsHeaders(NextResponse.redirect(url), origin)
      }
    }

    if (pathname.startsWith('/dashboard')) {
      if (!user) {
        const url = new URL('/clients/auth/login', request.url)
        url.searchParams.set('redirect', pathname)
        return addCorsHeaders(NextResponse.redirect(url), origin)
      }
      if (role === 'admin') {
        return addCorsHeaders(
          NextResponse.redirect(new URL('/admin', request.url)),
          origin,
        )
      }
      if (role !== 'client') {
        const url = new URL('/clients/auth/login', request.url)
        url.searchParams.set('reason', 'no_role')
        return addCorsHeaders(NextResponse.redirect(url), origin)
      }
    }

    if (pathname.startsWith('/setup')) {
      if (!user) {
        const url = new URL('/admin/auth/login', request.url)
        url.searchParams.set('redirect', pathname)
        return addCorsHeaders(NextResponse.redirect(url), origin)
      }
      if (role !== 'admin') {
        return addCorsHeaders(
          NextResponse.redirect(new URL('/', request.url)),
          origin,
        )
      }
    }

    return addCorsHeaders(supabaseResponse, origin)
  }

  if (isApiRoute && request.method !== 'OPTIONS') {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      '127.0.0.1'
    const identifier = `${ip}:${request.method}:${pathname}`

    const publicMethods = PUBLIC_API_ROUTES.get(pathname)
    const isPublic = publicMethods?.has(request.method)
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)

    let limit: number
    if (isMutation) limit = 5
    else if (isPublic) limit = 10
    else limit = 30

    const result = await rateLimit(identifier, limit, 10000)

    if (!result.allowed) {
      const response = NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        { status: 429 },
      )
      response.headers.set(
        'Retry-After',
        String(Math.ceil((result.reset - Date.now()) / 1000)),
      )
      addCorsHeaders(response, origin, true)
      return response
    }

    const { user, role, supabaseResponse } = await getAuth(request)

    if (!isPublic) {
      if (!user) {
        return addCorsHeaders(
          NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
          origin,
          true,
        )
      }
      if (pathname.startsWith('/api/admin') && role !== 'admin') {
        return addCorsHeaders(
          NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
          origin,
          true,
        )
      }
    }

    addCorsHeaders(supabaseResponse, origin, true)
    return supabaseResponse
  }

  const response = NextResponse.next({ request })
  addCorsHeaders(response, origin)
  return response
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/dashboard/:path*',
    '/setup/:path*',
    '/api/:path*',
  ],
}
