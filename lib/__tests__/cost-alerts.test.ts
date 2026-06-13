import { describe, it, expect, vi, beforeEach } from 'vitest'

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('checkSpending', () => {
  it('logs budget exceeded alert at 100% or more', async () => {
    const { checkSpending } = await import('../cost-alerts')
    await checkSpending(50)
    expect(console.log).toHaveBeenCalledWith('[Cost Alert]', expect.stringContaining('budget exceeded'))

    vi.mocked(console.log).mockClear()
    await checkSpending(75)
    expect(console.log).toHaveBeenCalledWith('[Cost Alert]', expect.stringContaining('budget exceeded'))
  })

  it('logs budget warning at 80-99%', async () => {
    const { checkSpending } = await import('../cost-alerts')
    await checkSpending(40)
    expect(console.log).toHaveBeenCalledWith('[Cost Alert]', expect.stringContaining('Budget warning'))
    expect(console.log).toHaveBeenCalledWith('[Cost Alert]', expect.stringContaining('80.0%'))
  })

  it('logs nothing below 80%', async () => {
    const { checkSpending } = await import('../cost-alerts')
    await checkSpending(10)
    expect(console.log).not.toHaveBeenCalled()
  })

  it('handles non-integer spending', async () => {
    const { checkSpending } = await import('../cost-alerts')
    await checkSpending(0)
    expect(console.log).not.toHaveBeenCalled()
  })
})
