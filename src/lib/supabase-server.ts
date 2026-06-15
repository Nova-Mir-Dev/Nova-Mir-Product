import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        },
      },
    },
  )
}

/**
 * WARNING: Bypasses Row Level Security (RLS) because it authenticates with
 * the `SUPABASE_SERVICE_ROLE_KEY`. Only use in trusted server contexts where
 * RLS bypass is intentional (e.g. admin-only server actions, background jobs).
 * Must be imported with `import 'server-only'` — do NOT use in client
 * components or user-facing SSR.
 */
export async function createAdminClient() {
  const cookieStore = await cookies()
  return createServerClient(
    getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getEnv('SUPABASE_SERVICE_ROLE_KEY'),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        },
      },
    },
  )
}
