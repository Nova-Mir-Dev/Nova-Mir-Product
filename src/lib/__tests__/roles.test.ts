import { describe, it, expect } from 'vitest'
import { hasPermission, requiresMfa, ROLE_PERMISSIONS } from '../roles'
import type { Role } from '../roles'

const ROLES: Role[] = ['viewer', 'editor', 'admin']

describe('ROLE_PERMISSIONS', () => {
  it('has correct structure for all roles', () => {
    for (const role of ROLES) {
      const perms = ROLE_PERMISSIONS[role]
      expect(typeof perms.canRead).toBe('boolean')
      expect(typeof perms.canWrite).toBe('boolean')
      expect(typeof perms.canDelete).toBe('boolean')
      expect(typeof perms.canManageUsers).toBe('boolean')
      expect(typeof perms.canManageBilling).toBe('boolean')
      expect(typeof perms.canViewAuditLogs).toBe('boolean')
    }
  })

  it('admin has all permissions', () => {
    const perms = ROLE_PERMISSIONS.admin
    expect(perms.canRead).toBe(true)
    expect(perms.canWrite).toBe(true)
    expect(perms.canDelete).toBe(true)
    expect(perms.canManageUsers).toBe(true)
    expect(perms.canManageBilling).toBe(true)
    expect(perms.canViewAuditLogs).toBe(true)
  })

  it('viewer has only read permission', () => {
    const perms = ROLE_PERMISSIONS.viewer
    expect(perms.canRead).toBe(true)
    expect(perms.canWrite).toBe(false)
    expect(perms.canDelete).toBe(false)
    expect(perms.canManageUsers).toBe(false)
    expect(perms.canManageBilling).toBe(false)
    expect(perms.canViewAuditLogs).toBe(false)
  })

  it('editor has read and write but not delete', () => {
    const perms = ROLE_PERMISSIONS.editor
    expect(perms.canRead).toBe(true)
    expect(perms.canWrite).toBe(true)
    expect(perms.canDelete).toBe(false)
    expect(perms.canManageUsers).toBe(false)
    expect(perms.canManageBilling).toBe(false)
    expect(perms.canViewAuditLogs).toBe(false)
  })
})

describe('hasPermission', () => {
  it('returns correct permissions for each role', () => {
    expect(hasPermission('admin', 'canDelete')).toBe(true)
    expect(hasPermission('viewer', 'canDelete')).toBe(false)
    expect(hasPermission('editor', 'canWrite')).toBe(true)
    expect(hasPermission('viewer', 'canWrite')).toBe(false)
  })

  it('returns false for unknown roles', () => {
    expect(hasPermission('unknown' as Role, 'canRead')).toBe(false)
  })
})

describe('requiresMfa', () => {
  it('requires MFA for admin', () => {
    expect(requiresMfa('admin')).toBe(true)
  })

  it('does not require MFA for viewer or editor', () => {
    expect(requiresMfa('viewer')).toBe(false)
    expect(requiresMfa('editor')).toBe(false)
  })
})
