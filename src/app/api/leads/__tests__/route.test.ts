import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockInsert = vi.fn()

vi.mock('@/lib/supabase-server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: mockInsert,
    })),
  })),
}))

vi.mock('@/lib/slack', () => ({
  notifyNewLead: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  delete process.env.UPSTASH_REDIS_REST_URL
})

const validLeadPayload = {
  name: 'Jane Smith',
  email: 'jane@example.com',
  businessName: 'Smith Co',
  phone: '555-0100',
  serviceInterest: 'Web Design',
  budgetRange: '5k-10k',
  message: 'Interested in a new website.',
  consent: true,
}

describe('POST /api/leads', () => {
  it('returns 415 when content-type is not application/json', async () => {
    const { POST } = await import('../route')

    const request = new Request('http://localhost:3000/api/leads', {
      method: 'POST',
      headers: { 'content-type': 'application/xml' },
      body: '<lead><name>Test</name></lead>',
    })

    const response = await POST(request)
    expect(response.status).toBe(415)
    const body = await response.json()
    expect(body.error).toContain('Unsupported Media Type')
  })

  it('returns 400 when validation fails', async () => {
    const { POST } = await import('../route')

    const request = new Request('http://localhost:3000/api/leads', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: '' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toContain('Validation')
  })

  it('returns 400 when consent is not true', async () => {
    const { POST } = await import('../route')

    const request = new Request('http://localhost:3000/api/leads', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...validLeadPayload, consent: false }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 400 when email is invalid', async () => {
    const { POST } = await import('../route')

    const request = new Request('http://localhost:3000/api/leads', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...validLeadPayload, email: 'not-an-email' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 201 with lead id when valid data is provided', async () => {
    mockInsert.mockReturnValue({
      select: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({
          data: { id: 'lead-abc-123' },
          error: null,
        }),
      })),
    })

    const { POST } = await import('../route')

    const request = new Request('http://localhost:3000/api/leads', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(validLeadPayload),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.id).toBe('lead-abc-123')
  })

  it('returns 500 when database insert fails', async () => {
    mockInsert.mockReturnValue({
      select: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({
          data: null,
          error: new Error('DB error'),
        }),
      })),
    })

    const { POST } = await import('../route')

    const request = new Request('http://localhost:3000/api/leads', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(validLeadPayload),
    })

    const response = await POST(request)
    expect(response.status).toBe(500)
  })
})
