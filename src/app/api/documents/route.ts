import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase-server";
import { sanitizeFilename } from "@/lib/sanitize";
import { rateLimit } from "@/lib/rate-limit";

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

  const { allowed } = await rateLimit(`documents:${user.id}`, 20, 60000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const body = (await request.json()) as { title: string; filePath: string };
  const safePath = sanitizeFilename(body.filePath || `doc_${Date.now()}.pdf`);
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
