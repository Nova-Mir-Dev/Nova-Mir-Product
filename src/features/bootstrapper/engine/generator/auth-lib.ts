import type { GeneratedFile } from './types'

export function generateSupabaseServer(): GeneratedFile[] {
  return [
    {
      path: 'lib/supabase-server.ts',
      content: `import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getEnv('SUPABASE_SERVICE_ROLE_KEY'),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        },
      },
    },
  );
}
`,
    },
  ]
}

export function generateSupabaseAdmin(): GeneratedFile[] {
  return [
    {
      path: 'lib/supabase-admin.ts',
      content: `import "server-only";
import { createClient } from "@supabase/supabase-js";

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

export function createServiceClient() {
  return createClient(
    getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getEnv('SUPABASE_SERVICE_ROLE_KEY'),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
`,
    },
  ]
}

export function generateRoles(): GeneratedFile[] {
  return [
    {
      path: 'lib/roles.ts',
      content: `export type Role = "viewer" | "editor" | "admin";

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
`,
    },
  ]
}

export function generateSanitize(): GeneratedFile[] {
  return [
    {
      path: 'lib/sanitize.ts',
      content: `export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\\.{2,}/g, ".")
    .replace(/^\\./, "_")
    .slice(0, 255);
}
`,
    },
  ]
}
