import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createMockClient,
  type MockClient,
} from '@/lib/__tests__/api-test-helpers'

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  delete process.env.UPSTASH_REDIS_REST_URL
})

async function setAnonClient(client: MockClient) {
  const { createClient } = await import('@supabase/supabase-js')
  vi.mocked(createClient).mockReturnValue(client)
}

describe('GET /api/content/hero-headlines', () => {
  it('200 returns published headlines on success', async () => {
    await setAnonClient(
      createMockClient({
        tables: {
          hero_headlines: {
            select: {
              data: [
                {
                  id: 'h1',
                  headline: 'Hi',
                  subtitle: 'Sub',
                  cta_label: 'CTA',
                  cta_href: '/x',
                },
              ],
            },
          },
        },
      }),
    )
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body[0].id).toBe('h1')
  })

  it('200 returns empty array when no rows', async () => {
    await setAnonClient(
      createMockClient({
        tables: { hero_headlines: { select: { data: [] } } },
      }),
    )
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([])
  })

  it('500 when supabase returns an error', async () => {
    await setAnonClient(
      createMockClient({
        tables: {
          hero_headlines: { select: { data: null, error: { message: 'db' } } },
        },
      }),
    )
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(500)
  })
})
