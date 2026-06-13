import { Redis } from '@upstash/redis'

const UPSTASH_REDIS_URL = process.env.UPSTASH_REDIS_URL
const UPSTASH_REDIS_TOKEN = process.env.UPSTASH_REDIS_TOKEN

const redis =
  UPSTASH_REDIS_URL && UPSTASH_REDIS_TOKEN
    ? new Redis({ url: UPSTASH_REDIS_URL, token: UPSTASH_REDIS_TOKEN })
    : null

const fallbackStore = new Map<string, { count: number; resetTime: number }>()

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of fallbackStore) {
    if (now > entry.resetTime) fallbackStore.delete(key)
  }
}, 60000)

export async function rateLimit(
  key: string,
  maxRequests = 100,
  windowMs = 60000,
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const now = Date.now()
  const windowKey = Math.floor(now / windowMs)
  const redisKey = `ratelimit:${key}:${windowKey}`
  const resetTime = (windowKey + 1) * windowMs

  if (redis) {
    const count = await redis.incr(redisKey)
    if (count === 1) {
      await redis.expire(redisKey, Math.ceil(windowMs / 1000))
    }
    return {
      allowed: count <= maxRequests,
      remaining: Math.max(0, maxRequests - count),
      reset: resetTime,
    }
  }

  const entry = fallbackStore.get(key)
  if (!entry || now > entry.resetTime) {
    fallbackStore.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, reset: now + windowMs }
  }
  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, reset: entry.resetTime }
  }
  entry.count++
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    reset: entry.resetTime,
  }
}
