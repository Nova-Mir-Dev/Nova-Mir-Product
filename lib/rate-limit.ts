const store = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(
  key: string,
  maxRequests = 100,
  windowMs = 60000,
): boolean {
  const now = Date.now()
  const entry = store.get(key)
  if (!entry || now > entry.resetTime) {
    store.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  if (entry.count >= maxRequests) return false
  entry.count++
  return true
}

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetTime) store.delete(key)
  }
}, 60000)
