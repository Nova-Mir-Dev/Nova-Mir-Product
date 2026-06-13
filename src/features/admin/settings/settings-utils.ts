export async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(key)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function generateApiKey(): Promise<{
  key: string
  hashedKey: string
  prefix: string
}> {
  const rawKey = crypto.randomUUID() + crypto.randomUUID()
  const prefix = rawKey.slice(0, 8)
  const hashedKey = await hashKey(rawKey)
  return { key: rawKey, hashedKey, prefix }
}
