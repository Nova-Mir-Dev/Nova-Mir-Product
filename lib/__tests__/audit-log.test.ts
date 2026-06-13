import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase-server', () => ({
  createClient: vi.fn(),
}))

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('audit functions', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('logs to console in non-production environment', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { audit } = await import('../audit-log')
    audit({ action: 'test.action', entity: 'test', userId: 'user-1' })
    expect(logSpy).toHaveBeenCalled()
    const logged = JSON.parse(logSpy.mock.calls[0]![0] as string)
    expect(logged.action).toBe('test.action')
    expect(logged.entity).toBe('test')
    expect(logged.userId).toBe('user-1')
    logSpy.mockRestore()
  })

  it('auditLogin calls audit with correct action for success', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { auditLogin } = await import('../audit-log')
    auditLogin('user-1', true)
    const logged = JSON.parse(logSpy.mock.calls[0]![0] as string)
    expect(logged.action).toBe('login.success')
    expect(logged.entity).toBe('session')
    expect(logged.userId).toBe('user-1')
    logSpy.mockRestore()
  })

  it('auditLogin calls audit with correct action for failure', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { auditLogin } = await import('../audit-log')
    auditLogin('user-1', false)
    const logged = JSON.parse(logSpy.mock.calls[0]![0] as string)
    expect(logged.action).toBe('login.failure')
    logSpy.mockRestore()
  })

  it('auditDataAccess logs data.read action', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { auditDataAccess } = await import('../audit-log')
    auditDataAccess('user-1', 'appointment', 'apt-123')
    const logged = JSON.parse(logSpy.mock.calls[0]![0] as string)
    expect(logged.action).toBe('data.read')
    expect(logged.entity).toBe('appointment')
    expect(logged.entityId).toBe('apt-123')
    expect(logged.userId).toBe('user-1')
    logSpy.mockRestore()
  })

  it('auditDataMutation logs correct data action', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { auditDataMutation } = await import('../audit-log')
    auditDataMutation('user-1', 'create', 'invoice', 'inv-456', { amount: 100 })
    const logged = JSON.parse(logSpy.mock.calls[0]![0] as string)
    expect(logged.action).toBe('data.create')
    expect(logged.entity).toBe('invoice')
    expect(logged.entityId).toBe('inv-456')
    expect(logged.metadata).toEqual({ amount: 100 })
    logSpy.mockRestore()
  })

  it('auditAdminAction logs admin action', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { auditAdminAction } = await import('../audit-log')
    auditAdminAction('admin-1', 'user.impersonate', { targetUserId: 'user-2' })
    const logged = JSON.parse(logSpy.mock.calls[0]![0] as string)
    expect(logged.action).toBe('admin.user.impersonate')
    expect(logged.entity).toBe('admin')
    expect(logged.userId).toBe('admin-1')
    logSpy.mockRestore()
  })
})
