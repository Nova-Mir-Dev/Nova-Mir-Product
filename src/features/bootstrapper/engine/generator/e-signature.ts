import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'

export function generateESignatureFiles(config: BootConfig): GeneratedFile[] {
  if (!config.eSignature) return []
  return [
    {
      path: 'lib/e-signature.ts',
      content: `import { createHash } from "node:crypto";

export interface ESignatureRequest {
  documentId: string;
  signerId: string;
  ipAddress?: string;
}

export function hashSignature(payload: string): string {
  return createHash("sha256").update(payload).digest("hex");
}

export function createSignaturePayload(request: ESignatureRequest): string {
  return JSON.stringify({
    documentId: request.documentId,
    signerId: request.signerId,
    timestamp: new Date().toISOString(),
  });
}

export function signDocument(request: ESignatureRequest): {
  payload: string;
  hash: string;
  timestamp: string;
} {
  const payload = createSignaturePayload(request);
  const hash = hashSignature(payload);
  return { payload, hash, timestamp: new Date().toISOString() };
}
`,
    },
    {
      path: 'src/app/api/documents/route.ts',
      content: `import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase-server";
import { sanitizeFilename } from "@/lib/sanitize";

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ documents: [] });
}

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as { title: string; filePath: string };
  const safePath = sanitizeFilename(body.filePath || \`doc_\${Date.now()}.pdf\`);
  return NextResponse.json(
    {
      id: crypto.randomUUID(),
      title: body.title,
      filePath: safePath,
      userId: user.id,
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    { status: 201 },
  );
}
`,
    },
  ]
}
