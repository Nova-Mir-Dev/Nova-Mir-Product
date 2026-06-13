import { Redis } from "@upstash/redis";

function getEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error("Missing required environment variable: " + name);
  return val;
}

const redis = new Redis({
  url: getEnv("UPSTASH_REDIS_URL"),
  token: getEnv("UPSTASH_REDIS_TOKEN"),
});

export async function cacheGet<T>(key: string): Promise<T | null> {
  return redis.get<T>(key);
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
  await redis.set(key, value, { ex: ttlSeconds });
}

export async function cacheDelete(key: string): Promise<void> {
  await redis.del(key);
}
