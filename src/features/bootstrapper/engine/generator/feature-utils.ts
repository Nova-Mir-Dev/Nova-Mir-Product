import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'

export function generateFeatureFlags(config: BootConfig): GeneratedFile[] {
  if (!config.featureFlags) return []
  return [
    {
      path: 'lib/feature-flags.ts',
      content: `type FlagValue = boolean | string | number;

class FeatureFlags {
  private flags: Map<string, FlagValue> = new Map();

  constructor(flags: Record<string, FlagValue> = {}) {
    for (const [key, value] of Object.entries(flags)) {
      this.flags.set(key, value);
    }
  }

  isEnabled(flag: string, defaultValue = false): boolean {
    const value = this.flags.get(flag);
    if (value === undefined) return defaultValue;
    return Boolean(value);
  }

  get<T extends FlagValue>(flag: string, defaultValue: T): T {
    return (this.flags.get(flag) as T) ?? defaultValue;
  }

  set(flag: string, value: FlagValue): void {
    this.flags.set(flag, value);
  }

  getAll(): Record<string, FlagValue> {
    return Object.fromEntries(this.flags);
  }
}

export const flags = new FeatureFlags();

export async function ifFeature<T>(flag: string, fn: () => Promise<T>): Promise<T | null> {
  if (flags.isEnabled(flag)) return fn();
  return null;
}
`,
    },
  ]
}

export function generateDataExport(config: BootConfig): GeneratedFile[] {
  if (!config.dataExport) return []
  return [
    {
      path: 'src/app/api/export/route.ts',
      content: `import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "json";
  const entity = searchParams.get("entity") || "users";

  // TODO: Replace with actual data fetching
  const data = [{ id: "example" }];

  if (format === "csv") {
    const headers = Object.keys(data[0] || {}).join(",");
    const rows = data.map((row: Record<string, unknown>) => Object.values(row).join(",")).join("\\n");
    return new NextResponse(\`\${headers}\\n\${rows}\`, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": \`attachment; filename="\${entity}.csv"\`,
      },
    });
  }

  return NextResponse.json(data, {
    headers: { "Content-Disposition": \`attachment; filename="\${entity}.json"\` },
  });
}
`,
    },
  ]
}

export function generateCrudEndpoints(config: BootConfig): GeneratedFile[] {
  if (!config.hasCrudEndpoints) return []
  return [
    {
      path: 'src/app/api/crud/[entity]/route.ts',
      content: `import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase-server";

const ALLOWED_ENTITIES = new Set(["users", "projects", "tasks"]);

export async function GET(
  request: Request,
  { params }: { params: { entity: string } },
) {
  if (!ALLOWED_ENTITIES.has(params.entity)) {
    return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
  }
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  return NextResponse.json({
    entity: params.entity,
    method: "GET",
    limit,
    offset,
    message: "CRUD scaffold ready. Implement data fetching for " + params.entity + ".",
  });
}

export async function POST(
  request: Request,
  { params }: { params: { entity: string } },
) {
  if (!ALLOWED_ENTITIES.has(params.entity)) {
    return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
  }
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  return NextResponse.json({
    entity: params.entity,
    method: "POST",
    data: body,
    message: "CRUD scaffold ready. Implement create logic for " + params.entity + ".",
  }, { status: 201 });
}
`,
    },
  ]
}

export function generateUptimeMonitoring(config: BootConfig): GeneratedFile[] {
  if (!config.uptimeMonitoring) return []
  return [
    {
      path: 'src/app/api/health/route.ts',
      content: `import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}

export const dynamic = "force-dynamic";
`,
    },
  ]
}

export function generateFileValidation(config: BootConfig): GeneratedFile[] {
  if (!config.fileValidation) return []
  return [
    {
      path: 'lib/file-validation.ts',
      content: `const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES: Record<string, string[]> = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
  document: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  spreadsheet: ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
};

export function validateFile(file: File, allowedCategories: string[] = ["image"]): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: \`File too large. Max size is \${MAX_FILE_SIZE / 1024 / 1024}MB.\` };
  }

  const allowedMimeTypes = allowedCategories.flatMap((cat) => ALLOWED_TYPES[cat] || []);
  if (!allowedMimeTypes.includes(file.type)) {
    return { valid: false, error: \`File type \${file.type} not allowed. Allowed: \${allowedMimeTypes.join(", ")}\` };
  }

  return { valid: true };
}

export function validateFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 255);
}
`,
    },
  ]
}
