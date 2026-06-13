import { createClient as createSupabaseClient } from '@supabase/supabase-js'

function getEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error('Missing required environment variable: ' + name);
  return val;
}

export function createClient() {
  return createSupabaseClient(
    getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  )
}
