import { describe, it, expect, vi, beforeEach } from 'vitest'

const signOut = vi.fn().mockResolvedValue({ error: null })
const redirect = vi.fn((url: string) => {
  throw new Error('REDIRECT:' + url)
})

vi.mock('next/navigation', () => ({ redirect }))
vi.mock('@/lib/supabase-server', () => ({
  createClient: vi.fn(async () => ({ auth: { signOut } })),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('logoutAction', () => {
  it('signs the user out and redirects to the admin login', async () => {
    const { logoutAction } = await import('../actions')
    await expect(logoutAction()).rejects.toThrow('REDIRECT:/admin/auth/login')
    expect(signOut).toHaveBeenCalled()
  })
})
