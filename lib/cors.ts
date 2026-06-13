export const CORS_ORIGINS = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter((s) => s.length > 0)

export function getCorsHeaders(origin: string | null): Record<string, string> {
  if (CORS_ORIGINS.length === 0) return {}
  if (origin && CORS_ORIGINS.includes(origin))
    return { 'Access-Control-Allow-Origin': origin }
  if (origin && origin === process.env.VERCEL_URL)
    return { 'Access-Control-Allow-Origin': origin }
  return {}
}

export const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false
  if (CORS_ORIGINS.length === 0) return false
  return CORS_ORIGINS.includes(origin) || origin === process.env.VERCEL_URL
}

export function getCorsOriginHeader(origin: string | null): string {
  if (origin && isAllowedOrigin(origin)) return origin
  return CORS_ORIGINS[0] || ''
}
