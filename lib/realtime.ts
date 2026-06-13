import { createClient } from "@/lib/supabase";

export function subscribeToChannel(channel: string, callback: (payload: unknown) => void) {
  const supabase = createClient();
  return supabase.channel(channel).on("broadcast", { event: "*" }, (payload: unknown) => callback(payload)).subscribe();
}

export function broadcast(channel: string, event: string, payload: unknown) {
  const supabase = createClient();
  return supabase.channel(channel).send({ type: "broadcast", event, payload });
}