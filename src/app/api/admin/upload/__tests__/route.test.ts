import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createMockClient,
  adminUser,
  clientUser,
  unauthUser,
  buildRequest,
  JSON_CT,
  type MockClient,
} from '@/lib/__tests__/api-test-helpers'

vi.mock('@/lib/supabase-server', () => ({ createClient: vi.fn() }))
vi.mock('@/lib/supabase-admin', () => ({ createServiceClient: vi.fn() }))
vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))

beforeEach(() => {
  vi.clearAllMocks()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
})

async function setSession(client: MockClient) {
  const { createClient } = await import('@/lib/supabase-server')
  vi.mocked(createClient).mockResolvedValue(client)
}

async function setService(role: string) {
  const base = createMockClient({
    tables: { users: { select: { data: { role } } } },
  })
  const svc = {
    ...base,
    storage: {
      from: () => ({
        createSignedUploadUrl: vi.fn().mockResolvedValue({
          data: { signedUrl: 'https://x/upload' },
          error: null,
        }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://x/public' } }),
      }),
    },
  } as unknown as MockClient
  const { createServiceClient } = await import('@/lib/supabase-admin')
  vi.mocked(createServiceClient).mockReturnValue(svc)
}

function post(body: unknown) {
  return buildRequest('http://localhost/api/admin/upload', {
    method: 'POST',
    headers: JSON_CT,
    body: JSON.stringify(body),
  })
}

const validBody = {
  fileName: 'hero.png',
  fileType: 'image/png',
  fileSize: 1000,
}

describe('POST /api/admin/upload', () => {
  it('401 when unauthenticated', async () => {
    await setSession(createMockClient({ user: unauthUser }))
    const { POST } = await import('../route')
    expect((await POST(post(validBody))).status).toBe(401)
  })

  it('403 for a non-admin', async () => {
    await setSession(createMockClient({ user: clientUser }))
    await setService('client')
    const { POST } = await import('../route')
    expect((await POST(post(validBody))).status).toBe(403)
  })

  it('400 rejects a disallowed file type', async () => {
    await setSession(createMockClient({ user: adminUser }))
    await setService('admin')
    const { POST } = await import('../route')
    const res = await POST(
      post({ ...validBody, fileType: 'application/x-msdownload' }),
    )
    expect(res.status).toBe(400)
  })

  it('200 returns a signed upload URL for an admin', async () => {
    await setSession(createMockClient({ user: adminUser }))
    await setService('admin')
    const { POST } = await import('../route')
    const res = await POST(post(validBody))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.uploadUrl).toBe('https://x/upload')
    expect(typeof body.filePath).toBe('string')
  })
})
