import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAllowedOrigin, CORS_HEADERS, getCorsOriginHeader } from '@/lib/cors'

const PUBLIC_API_ROUTES = new Map<string, Set<string>>([
  ['/api/health', new Set(['GET'])],
  ['/api/leads', new Set(['POST'])],
])

function addCorsHeaders(response: NextResponse, origin: string | null, apiRoute = false): void {
  if (!apiRoute) return
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
  const isApiRoute = pathname.startsWith('/api/')

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
    const { user, role, supabaseResponse } = await getAuth(request)

    const publicMethods = PUBLIC_API_ROUTES.get(pathname)
    const isPublic = publicMethods?.has(request.method)

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
