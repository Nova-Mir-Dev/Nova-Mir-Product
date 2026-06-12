import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Role } from './roles'

export function generateApiKey(): { prefix: string; hash: string } {
  const key = 'ak_' + randomBytes(32).toString('hex')
  const hash = createHash('sha256').update(key).digest('hex')
  return { prefix: key.slice(0, 8), hash }
}

export function validateApiKey(key: string, storedHash: string): boolean {
  const hash = createHash('sha256').update(key).digest('hex')
  const hashBuf = Buffer.from(hash, 'utf-8')
  const storedBuf = Buffer.from(storedHash, 'utf-8')
  if (hashBuf.length !== storedBuf.length) return false
  return timingSafeEqual(hashBuf, storedBuf)
}

export async function createApiKey(
  name: string,
  role: Role,
  userId: string,
  supabase: SupabaseClient,
): Promise<{ key: string; prefix: string }> {
  const rawKey = 'ak_' + randomBytes(32).toString('hex')
  const hash = createHash('sha256').update(rawKey).digest('hex')
  const prefix = rawKey.slice(0, 8)

  const { error } = await supabase.from('api_keys').insert({
    user_id: userId,
    name,
    prefix,
    hash,
    scopes: [role],
  })

  if (error) throw error

  return { key: rawKey, prefix }
}
