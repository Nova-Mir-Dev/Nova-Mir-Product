import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { MockClient } from '@/lib/__tests__/api-test-helpers'

const redirect = vi.fn((url: string) => {
  throw new Error('REDIRECT:' + url)
})
const requireAdmin = vi.fn().mockResolvedValue({})
const upload = vi.fn()
const insert = vi.fn()

vi.mock('next/navigation', () => ({ redirect }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/auth-guard', () => ({ requireAdmin }))
vi.mock('@/lib/supabase-admin', () => ({ createServiceClient: vi.fn() }))

beforeEach(() => {
  vi.clearAllMocks()
  requireAdmin.mockResolvedValue({})
  upload.mockResolvedValue({ error: null })
  insert.mockResolvedValue({ error: null })
})

async function setService() {
  const svc = {
    storage: { from: () => ({ upload }) },
    from: vi.fn(() => ({ insert })),
  } as unknown as MockClient
  const { createServiceClient } = await import('@/lib/supabase-admin')
  vi.mocked(createServiceClient).mockReturnValue(svc)
}

function pdf(size = 1000, type = 'application/pdf') {
  return new File([new Uint8Array(size)], 'contract.pdf', { type })
}

function form(fields: Record<string, string | File>) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.set(k, v)
  return fd
}

async function run(fd: FormData): Promise<string> {
  const { uploadClientDocument } = await import('../actions')
  try {
    await uploadClientDocument(fd)
  } catch (e) {
    return (e as Error).message
  }
  return ''
}

describe('uploadClientDocument', () => {
  it('requires a client to be selected', async () => {
    await setService()
    const msg = await run(form({ file: pdf() }))
    expect(msg).toContain('Select+a+client')
    expect(upload).not.toHaveBeenCalled()
  })

  it('rejects a disallowed file type', async () => {
    await setService()
    const msg = await run(
      form({ clientUserId: 'u1', file: pdf(1000, 'application/x-msdownload') }),
    )
    expect(msg).toContain('File+type+not+allowed')
    expect(upload).not.toHaveBeenCalled()
  })

  it("uploads under the client's prefix and inserts a documents row owned by them", async () => {
    await setService()
    const msg = await run(
      form({ clientUserId: 'client-9', category: 'contracts', file: pdf() }),
    )
    expect(upload).toHaveBeenCalled()
    const uploadPath = upload.mock.calls[0]![0] as string
    expect(uploadPath.startsWith('client-9/')).toBe(true)
    const row = insert.mock.calls[0]![0] as Record<string, unknown>
    expect(row.user_id).toBe('client-9')
    expect(row.file_path).toBe(uploadPath)
    expect(row.category).toBe('contracts')
    expect(msg).toBe('REDIRECT:/admin/documents?success=1')
  })
})
