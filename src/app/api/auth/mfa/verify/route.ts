import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { verifyMfa } from "@/features/auth/mfa";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  const { allowed } = await rateLimit(`mfa:verify:${ip}`, 5, 60000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const { factorId, code } = (await request.json()) as { factorId: string; code: string };
  const result = await verifyMfa(factorId, code);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ success: true });
}
