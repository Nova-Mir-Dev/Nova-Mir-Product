import { createClient } from '@supabase/supabase-js'

function getEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error('Missing required environment variable: ' + name);
  return val;
}

export const db = createClient(
  getEnv('SUPABASE_URL'),
  getEnv('SUPABASE_ANON_KEY')
)
