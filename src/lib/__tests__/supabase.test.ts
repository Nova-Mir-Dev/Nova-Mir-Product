import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  delete process.env.NEXT_PUBLIC_SUPABASE_URL
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
})

describe('createClient', () => {
  it('creates a supabase browser client with URL and anon key', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-123'

    const { createBrowserClient } = await import('@supabase/ssr')
    const { createClient } = await import('../supabase')

    createClient()

    expect(createBrowserClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'anon-key-123',
    )
  })

  it('throws when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-123'

    const { createClient } = await import('../supabase')
    expect(() => createClient()).toThrow(
      'Missing required environment variable',
    )
  })

  it('throws when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'

    const { createClient } = await import('../supabase')
    expect(() => createClient()).toThrow(
      'Missing required environment variable',
    )
  })
})
