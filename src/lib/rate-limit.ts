import { Ratelimit, type Duration } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const inMemory = new Map<string, { count: number; reset: number }>()

function msToDuration(ms: number): string {
  if (ms >= 3_600_000) return `${String(Math.floor(ms / 3_600_000))}h`
  if (ms >= 60_000) return `${String(Math.floor(ms / 60_000))}m`
  if (ms >= 1000) return `${String(Math.floor(ms / 1000))}s`
  return `${String(ms)}ms`
}

export async function rateLimit(
  identifier: string,
  limit = 10,
  windowMs = 10000,
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  if (process.env.UPSTASH_REDIS_REST_URL) {
    const ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(
        limit,
        msToDuration(windowMs) as Duration,
      ),
      analytics: true,
    })
    const result = await ratelimit.limit(identifier)
    return {
      allowed: result.success,
      remaining: result.remaining,
      reset: result.reset,
    }
  }

  if (inMemory.size > 10_000) {
    inMemory.clear()
  }

  const now = Date.now()
  const key = `${identifier}:${String(Math.floor(now / windowMs))}`
  const entry = inMemory.get(key)

  if (!entry || now > entry.reset) {
    inMemory.set(key, { count: 1, reset: now + windowMs })
    return { allowed: true, remaining: limit - 1, reset: now + windowMs }
  }

  entry.count++
  if (entry.count > limit) {
    return { allowed: false, remaining: 0, reset: entry.reset }
  }

  return { allowed: true, remaining: limit - entry.count, reset: entry.reset }
}
