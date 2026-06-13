"use server";

import { createClient } from "@/lib/supabase-server";
import { getStripe } from "@/lib/stripe";
import { redirect } from "next/navigation";

export async function openCustomerPortal() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  let customerId = (profile as { stripe_customer_id?: string } | null)?.stripe_customer_id;

  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: user.email,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("users")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing`,
  });

  redirect(session.url);
}
