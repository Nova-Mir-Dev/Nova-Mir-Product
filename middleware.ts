import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAllowedOrigin, CORS_HEADERS, getCorsOriginHeader } from '@/lib/cors'

const PUBLIC_API_ROUTES = new Map<string, Set<string>>([
  ['/api/health', new Set(['GET'])],
  ['/api/leads', new Set(['POST'])],
])

function addCorsHeaders(response: NextResponse, origin: string | null): void {
  if (origin && isAllowedOrigin(origin)) {
    response.headers.set('Access-Control-Allow-Origin', getCorsOriginHeader(origin))
    response.headers.set('Access-Control-Allow-Methods', CORS_HEADERS['Access-Control-Allow-Methods'])
    response.headers.set('Access-Control-Allow-Headers', CORS_HEADERS['Access-Control-Allow-Headers'])
    response.headers.set('Access-Control-Max-Age', CORS_HEADERS['Access-Control-Max-Age'])
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const origin = request.headers.get('origin')
  const isApiRoute = pathname.startsWith('/api/')

  if (isApiRoute && request.method === 'OPTIONS') {
    if (isAllowedOrigin(origin)) {
      const response = new NextResponse(null, { status: 204 })
      response.headers.set('Access-Control-Allow-Origin', getCorsOriginHeader(origin))
      response.headers.set('Access-Control-Allow-Methods', CORS_HEADERS['Access-Control-Allow-Methods'])
      response.headers.set('Access-Control-Allow-Headers', CORS_HEADERS['Access-Control-Allow-Headers'])
      response.headers.set('Access-Control-Max-Age', CORS_HEADERS['Access-Control-Max-Age'])
      return response
    }
    return new NextResponse(null, { status: 204 })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    },
  )

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
    role = (profile as { role: string | null } | null)?.role ?? null
  }

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
      const url = new URL('/login', request.url)
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
      const url = new URL('/login', request.url)
      url.searchParams.set('reason', 'no_role')
      return addCorsHeaders(NextResponse.redirect(url), origin)
    }
  }

  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const url = new URL('/login', request.url)
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
      const url = new URL('/login', request.url)
      url.searchParams.set('reason', 'no_role')
      return addCorsHeaders(NextResponse.redirect(url), origin)
    }
  }

  if (pathname.startsWith('/setup')) {
    if (!user) {
      const url = new URL('/login', request.url)
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

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    if (origin && !isAllowedOrigin(origin)) {
      return addCorsHeaders(
        NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
        origin,
      )
    }
  }

  if (isApiRoute && request.method !== 'OPTIONS') {
    const publicMethods = PUBLIC_API_ROUTES.get(pathname)
    const isPublic = publicMethods?.has(request.method)

    if (!isPublic) {
      if (!user) {
        return addCorsHeaders(
          NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
          origin,
        )
      }
      if (pathname.startsWith('/api/admin') && role !== 'admin') {
        return addCorsHeaders(
          NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
          origin,
        )
      }
    }
  }

  addCorsHeaders(supabaseResponse, origin)
  return supabaseResponse
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
