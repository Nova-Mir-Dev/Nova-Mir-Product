import { createClient } from "@/lib/supabase-server";

type AuditEvent = {
  action: string;
  entity: string;
  entityId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
};

async function persistAudit(event: AuditEvent) {
  try {
    const supabase = await createClient();
    await supabase.from("audit_logs").insert({
      action: event.action,
      entity: event.entity,
      entity_id: event.entityId || null,
      user_id: event.userId || null,
      metadata: event.metadata || null,
    });
  } catch {
    // Fall back to console if DB insert fails
    console.log(JSON.stringify(event));
  }
}

export function audit(event: AuditEvent): void {
  if (process.env.NODE_ENV === "production") {
    persistAudit(event);
  } else {
    console.log(JSON.stringify(event));
  }
}

export function auditLogin(userId: string, success: boolean): void {
  audit({
    action: success ? "login.success" : "login.failure",
    entity: "session",
    userId,
  });
}

export function auditDataAccess(
  userId: string,
  entity: string,
  entityId?: string,
): void {
  audit({
    action: "data.read",
    entity,
    entityId,
    userId,
  });
}

export function auditDataMutation(
  userId: string,
  action: "create" | "update" | "delete",
  entity: string,
  entityId?: string,
  metadata?: Record<string, unknown>,
): void {
  audit({
    action: `data.${action}`,
    entity,
    entityId,
    userId,
    metadata,
  });
}

export function auditAdminAction(
  userId: string,
  action: string,
  metadata?: Record<string, unknown>,
): void {
  audit({
    action: `admin.${action}`,
    entity: "admin",
    userId,
    metadata,
  });
}
