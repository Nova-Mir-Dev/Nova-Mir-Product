import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  delete process.env.NEXT_PUBLIC_SUPABASE_URL
  delete process.env.SUPABASE_SERVICE_ROLE_KEY
})

describe('createServiceClient', () => {
  it('creates a supabase admin client', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://admin.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc-key-789'

    const { createClient } = await import('@supabase/supabase-js')
    const { createServiceClient } = await import('../supabase-admin')

    const result = createServiceClient()

    expect(createClient).toHaveBeenCalledWith(
      'https://admin.supabase.co',
      'svc-key-789',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )
  })

  it('throws when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
    const { createServiceClient } = await import('../supabase-admin')
    expect(() => createServiceClient()).toThrow(
      'Missing required environment variable',
    )
  })

  it('throws when SUPABASE_SERVICE_ROLE_KEY is missing', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://admin.supabase.co'
    const { createServiceClient } = await import('../supabase-admin')
    expect(() => createServiceClient()).toThrow(
      'Missing required environment variable',
    )
  })
})
