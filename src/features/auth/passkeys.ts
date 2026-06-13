"use client";

import { createClient } from "@/lib/supabase";

export async function registerPasskey() {
  const supabase = createClient();
  const { data: _data, error } = await supabase.auth.signInWithPasskey();
  if (error) return { error: error.message };
  return { success: true };
}

export async function signInWithPasskey() {
  const supabase = createClient();
  const { data: _data, error } = await supabase.auth.signInWithPasskey();
  if (error) return { error: error.message };
  return { success: true };
}
