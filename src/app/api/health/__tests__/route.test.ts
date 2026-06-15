import { describe, it, expect } from 'vitest'
import { GET } from '../route'

describe('GET /api/health', () => {
  it('returns 200 with status "healthy"', async () => {
    const response = GET()
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.status).toBe('healthy')
  })

  it('returns the expected response shape', async () => {
    const response = GET()
    const body = await response.json()
    expect(body).toHaveProperty('status', 'healthy')
    expect(body).toHaveProperty('timestamp')
    expect(body).toHaveProperty('uptime')
  })

  it('returns an ISO timestamp', async () => {
    const response = GET()
    const body = await response.json()
    expect(() => new Date(body.timestamp)).not.toThrow()
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp)
  })

  it('returns a positive uptime value', async () => {
    const response = GET()
    const body = await response.json()
    expect(typeof body.uptime).toBe('number')
    expect(body.uptime).toBeGreaterThanOrEqual(0)
  })
})
