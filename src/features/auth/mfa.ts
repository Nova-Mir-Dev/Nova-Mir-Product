"use server";

import { createClient } from "@/lib/supabase-server";

export async function enrollMfa() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
  });
  if (error) return { error: error.message };
  return {
    id: data.id,
    qr: data.totp.qr_code,
    secret: data.totp.secret,
    uri: data.totp.uri,
  };
}

export async function verifyMfa(factorId: string, code: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.mfa.challenge({
    factorId,
  });
  if (error) return { error: error.message };
  const { data: _verifyData, error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: data.id,
    code,
  });
  if (verifyError) return { error: verifyError.message };
  return { success: true };
}

export async function removeMfa(factorId: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) return { error: error.message };
  return { success: true };
}

export async function listMfaFactors() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) return { error: error.message };
  return data;
}
