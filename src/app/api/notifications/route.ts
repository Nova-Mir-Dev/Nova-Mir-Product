import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase-server";
import { getNotifications, markAllAsRead, markAsRead } from "@/lib/in-app-notifications";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(getNotifications(user.id));
}

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed } = await rateLimit(`notifications:${user.id}`, 60, 60000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const { notificationIds } = (await request.json()) as { notificationIds?: string[] };
  if (notificationIds && notificationIds.length > 0) {
    notificationIds.forEach((id) => markAsRead(user.id, id));
  } else {
    markAllAsRead(user.id);
  }
  return NextResponse.json({ success: true });
}
