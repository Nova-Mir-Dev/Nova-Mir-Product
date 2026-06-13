import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("users")
    .select("id, name, email, role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name ?? null,
      role: "client",
    });
  }

  return NextResponse.json(profile);
}
