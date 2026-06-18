import { describe, it, expect } from 'vitest'

describe('Auth flow structure', () => {
  it('has auth login page', async () => {
    const mod = await import('@/app/admin/auth/login/page')
    expect(mod.default).toBeDefined()
  })

  it('has auth API endpoints', async () => {
    const mod = await import('@/app/api/auth/me/route')
    expect(mod.GET).toBeDefined()
  })

  it('has middleware for auth protection', async () => {
    const mod = await import('../../middleware')
    expect(mod.middleware).toBeDefined()
  })

  it('has supabase server client for auth', async () => {
    const mod = await import('@/lib/supabase-server')
    expect(mod.createClient).toBeDefined()
  })
})
