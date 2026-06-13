import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}))

const mockCookieStore = {
  getAll: vi.fn(() => []),
  set: vi.fn(),
}

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => mockCookieStore),
}))

beforeEach(() => {
  vi.clearAllMocks()
  delete process.env.NEXT_PUBLIC_SUPABASE_URL
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  delete process.env.SUPABASE_SERVICE_ROLE_KEY
})

describe('createClient', () => {
  it('creates a supabase SSR client with anon key', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-123'

    const { createServerClient } = await import('@supabase/ssr')
    const { createClient } = await import('../supabase-server')

    const result = await createClient()

    expect(createServerClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'anon-key-123',
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      }),
    )
  })

  it('throws when env vars are missing', async () => {
    const { createClient } = await import('../supabase-server')
    await expect(createClient()).rejects.toThrow('Missing required environment variable')
  })
})

describe('createAdminClient', () => {
  it('creates a supabase SSR client with service role key', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key-456'

    const { createServerClient } = await import('@supabase/ssr')
    const { createAdminClient } = await import('../supabase-server')

    const result = await createAdminClient()

    expect(createServerClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'service-role-key-456',
      expect.objectContaining({
        cookies: expect.any(Object),
      }),
    )
  })

  it('throws when env vars are missing', async () => {
    const { createAdminClient } = await import('../supabase-server')
    await expect(createAdminClient()).rejects.toThrow('Missing required environment variable')
  })
})
