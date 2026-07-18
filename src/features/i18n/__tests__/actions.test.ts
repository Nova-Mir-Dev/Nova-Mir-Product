import { describe, it, expect, vi, beforeEach } from 'vitest'

const set = vi.fn()
vi.mock('next/headers', () => ({
  cookies: async () => ({ set }),
}))

import { setLocale } from '../actions'

describe('setLocale (Nova-Mir-Product-e1iy.2.1)', () => {
  beforeEach(() => set.mockClear())

  it('persists a supported locale as the "locale" cookie', async () => {
    await setLocale('es')
    expect(set).toHaveBeenCalledWith(
      'locale',
      'es',
      expect.objectContaining({ path: '/', sameSite: 'lax', httpOnly: true }),
    )
  })

  it('ignores an unsupported locale (no cookie written)', async () => {
    await setLocale('fr')
    expect(set).not.toHaveBeenCalled()
  })

  it('ignores an empty value', async () => {
    await setLocale('')
    expect(set).not.toHaveBeenCalled()
  })
})
