import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'

export function generateApiKeyAuth(config: BootConfig): GeneratedFile[] {
  if (!config.apiKeyAuth) return []
  return [
    {
      path: 'lib/api-keys.ts',
      content: `import { createHash, randomBytes } from "node:crypto";

export function generateApiKey(): { prefix: string; hash: string } {
  const key = "ak_" + randomBytes(32).toString("hex");
  const hash = createHash("sha256").update(key).digest("hex");
  return { prefix: key.slice(0, 8), hash };
}

export function validateApiKey(key: string, storedHash: string): boolean {
  const hash = createHash("sha256").update(key).digest("hex");
  return hash === storedHash;
}
`,
    },
    {
      path: 'src/app/api/admin/api-keys/route.ts',
      content: `import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase-server";
import { hasPermission } from "@/lib/roles";

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!hasPermission(profile?.role || "viewer", "canManageUsers")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ keys: [] });
}

export async function POST() {
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!hasPermission(profile?.role || "viewer", "canManageUsers")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ created: true });
}
`,
    },
  ]
}
