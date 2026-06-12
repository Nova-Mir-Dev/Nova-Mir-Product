import 'server-only'
import { createClient } from '@supabase/supabase-js'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

export function createServiceClient() {
  return createClient(
    getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getEnv('SUPABASE_SERVICE_ROLE_KEY'),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
