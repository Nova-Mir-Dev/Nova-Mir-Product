export type Role = "viewer" | "editor" | "admin";

export interface RolePermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
  canManageBilling: boolean;
  canViewAuditLogs: boolean;
}

export const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  viewer: {
    canRead: true,
    canWrite: false,
    canDelete: false,
    canManageUsers: false,
    canManageBilling: false,
    canViewAuditLogs: false,
  },
  editor: {
    canRead: true,
    canWrite: true,
    canDelete: false,
    canManageUsers: false,
    canManageBilling: false,
    canViewAuditLogs: false,
  },
  admin: {
    canRead: true,
    canWrite: true,
    canDelete: true,
    canManageUsers: true,
    canManageBilling: true,
    canViewAuditLogs: true,
  },
};

export function hasPermission(
  role: Role,
  permission: keyof RolePermissions,
): boolean {
  return ROLE_PERMISSIONS[role]?.[permission] ?? false;
}

export function requiresMfa(role: Role): boolean {
  return role === "admin";
}
