import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";

const ALLOWED_ENTITIES = new Set(["users", "projects", "tasks"]);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ entity: string }> },
) {
  const { entity } = await params;
  if (!ALLOWED_ENTITIES.has(entity)) {
    return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
  }
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  return NextResponse.json({
    entity,
    method: "GET",
    limit,
    offset,
    message: "CRUD scaffold ready. Implement data fetching for " + entity + ".",
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ entity: string }> },
) {
  const { entity } = await params;
  if (!ALLOWED_ENTITIES.has(entity)) {
    return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
  }
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed } = await rateLimit(`crud:${user.id}`, 30, 60000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const body = await request.json();
  return NextResponse.json({
    entity,
    method: "POST",
    data: body,
    message: "CRUD scaffold ready. Implement create logic for " + entity + ".",
  }, { status: 201 });
}
