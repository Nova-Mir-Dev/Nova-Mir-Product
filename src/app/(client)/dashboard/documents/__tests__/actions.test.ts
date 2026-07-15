import { describe, it, expect, vi, beforeEach } from 'vitest'

const redirect = vi.fn((url: string) => {
  throw new Error('REDIRECT:' + url)
})
const insert = vi.fn()
const upload = vi.fn()
const getUser = vi.fn()

vi.mock('next/navigation', () => ({ redirect }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/supabase-server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser },
    storage: { from: () => ({ upload }) },
    from: () => ({ insert }),
  })),
}))

function makeForm(file: File | null) {
  const fd = new FormData()
  if (file) fd.set('file', file)
  return fd
}

function pdf(sizeBytes = 1000, type = 'application/pdf') {
  const blob = new Blob([new Uint8Array(sizeBytes)], { type })
  return new File([blob], 'report.pdf', { type })
}

beforeEach(() => {
  vi.clearAllMocks()
  getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  upload.mockResolvedValue({ error: null })
  insert.mockResolvedValue({ error: null })
})

async function run(fd: FormData): Promise<string> {
  const { uploadDocument } = await import('../actions')
  try {
    await uploadDocument(fd)
  } catch (e) {
    return (e as Error).message
  }
  return ''
}

describe('uploadDocument', () => {
  it('redirects unauthenticated users', async () => {
    getUser.mockResolvedValue({ data: { user: null } })
    expect(await run(makeForm(pdf()))).toBe(
      'REDIRECT:/dashboard/documents?error=Unauthorized',
    )
    expect(insert).not.toHaveBeenCalled()
  })

  it('rejects files over 10MB', async () => {
    const msg = await run(makeForm(pdf(11 * 1024 * 1024)))
    expect(msg).toContain('File+too+large')
    expect(upload).not.toHaveBeenCalled()
  })

  it('rejects disallowed mime types', async () => {
    const msg = await run(makeForm(pdf(1000, 'application/x-msdownload')))
    expect(msg).toContain('File+type+not+allowed')
    expect(upload).not.toHaveBeenCalled()
  })

  it('inserts a row with file_path (not file_url/status) on success', async () => {
    const msg = await run(makeForm(pdf()))
    expect(insert).toHaveBeenCalledTimes(1)
    const row = insert.mock.calls[0]![0] as Record<string, unknown>
    expect(row.user_id).toBe('user-1')
    expect(typeof row.file_path).toBe('string')
    expect((row.file_path as string).startsWith('user-1/')).toBe(true)
    expect(row).not.toHaveProperty('file_url')
    expect(row).not.toHaveProperty('status')
    expect(msg).toBe('REDIRECT:/dashboard/documents')
  })

  it('surfaces a storage upload error and does not insert', async () => {
    upload.mockResolvedValue({ error: { message: 'boom' } })
    const msg = await run(makeForm(pdf()))
    expect(msg).toContain('boom')
    expect(insert).not.toHaveBeenCalled()
  })
})
