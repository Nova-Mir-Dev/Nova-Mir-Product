import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'

function renderLeadDashboardLayout(): string {
  return `import { redirect } from "next/navigation";
import Link from "next/link";
import { Stack, Text } from "azimuth-ui";
import { createClient } from "@/lib/supabase-server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const navItems = [
    { label: "Leads", path: "/dashboard/leads" },
    { label: "Settings", path: "/dashboard/settings" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <nav style={{ width: 240, borderRight: "1px solid var(--azimuth-color-border)" }}>
        <Stack spacing="sm" style={{ padding: "var(--azimuth-spacing-md)" }}>
          <Text element={{ as: "h2", size: "h5" }} weight="semibold">
            Dashboard
          </Text>
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              style={{ textDecoration: "none", display: "block" }}
            >
              <Text>{item.label}</Text>
            </Link>
          ))}
        </Stack>
      </nav>
      <main style={{ flex: 1, padding: "var(--azimuth-spacing-lg)" }}>
        {children}
      </main>
    </div>
  );
}
`
}

function renderLeadDashboardLeadsPage(): string {
  return `import { Button, Input, Stack, Text, Card } from "azimuth-ui";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

interface Lead {
  id: number;
  name: string;
  email: string;
  company: string | null;
  status: string;
  created_at: string;
}

const STATUSES = ["new", "contacted", "qualified", "converted"];

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let query = supabase.from("leads").select("*").order("created_at", { ascending: false });

  const statusFilter = params.status?.toLowerCase() || "";
  if (statusFilter && STATUSES.includes(statusFilter)) {
    query = query.eq("status", statusFilter);
  }

  const { data: leads } = await query;
  const raw = (leads ?? []) as Lead[];

  const search = params.q?.toLowerCase() || "";
  const filtered = search
    ? raw.filter(
        (l) =>
          l.name?.toLowerCase().includes(search) ||
          l.email?.toLowerCase().includes(search),
      )
    : raw;

  return (
    <Stack spacing="md">
      <Text element={{ as: "h1", size: "h3" }} weight="semibold">
        Leads
      </Text>

      <form method="GET" style={{ display: "flex", gap: "var(--azimuth-spacing-sm)", flexWrap: "wrap" }}>
        <Input
          label={{ text: "Search" }}
          name="q"
          defaultValue={params.q || ""}
          placeholder="Search by name or email..."
        />
        <select
          name="status"
          defaultValue={params.status || ""}
          style={{
            padding: "var(--azimuth-spacing-sm)",
            border: "1px solid var(--azimuth-color-border)",
            borderRadius: "var(--azimuth-radius-md)",
            fontFamily: "inherit",
          }}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <Button variant="primary" type="submit">Filter</Button>
        {(params.q || params.status) && (
          <a href="/dashboard/leads">
            <Button variant="ghost" type="button">Clear</Button>
          </a>
        )}
      </form>

      {filtered.length === 0 ? (
        <Card>
          <Stack spacing="sm" style={{ textAlign: "center", padding: "var(--azimuth-spacing-lg)" }}>
            <Text color="secondary">No leads yet.</Text>
            <Text element={{ size: "sm" }} color="secondary">
              Leads captured from your landing page will appear here.
            </Text>
          </Stack>
        </Card>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.name}</td>
                <td>{lead.email}</td>
                <td>{lead.business_name || "-"}</td>
                <td>{lead.status}</td>
                <td>{new Date(lead.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Stack>
  );
}
`
}

function renderLeadCaptureApi(): string {
  return `import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = (await request.json()) as { name: string; email: string; business_name?: string; message?: string };

  if (!body.name?.trim() || !body.email?.trim()) {
    return NextResponse.json(
      { error: "Name and email are required" },
      { status: 400 },
    );
  }

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      name: body.name.trim(),
      email: body.email.trim(),
      business_name: body.businessName?.trim() || null,
      message: body.message?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 },
    );
  }

  return NextResponse.json(lead, { status: 201 });
}
`
}

function renderLeadFormAction(): string {
  return `"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function submitLead(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const company = formData.get("company") as string;
  const message = formData.get("message") as string;

  if (!name?.trim() || !email?.trim()) {
    return { success: false, error: "Name and email are required" };
  }

  const { error } = await supabase.from("leads").insert({
    name: name.trim(),
    email: email.trim(),
    company: company?.trim() || null,
    message: message?.trim() || null,
  });

  if (error) {
    return { success: false, error: "Failed to submit. Please try again." };
  }

  revalidatePath("/");
  return { success: true };
}
`
}

function renderLeadForm(): string {
  return `"use client";

import { useState } from "react";
import { Button, Card, Input, Text, Stack } from "azimuth-ui";
import { submitLead } from "@/app/actions/submit-lead";

export function LeadForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await submitLead(formData);

    if (result.success) {
      setStatus("success");
      (e.target as HTMLFormElement).reset();
    } else {
      setStatus("error");
      setError(result.error || "Something went wrong");
    }
  }

  if (status === "success") {
    return (
      <Card>
        <Stack spacing="md" style={{ textAlign: "center", padding: "var(--azimuth-spacing-lg)" }}>
          <Text element={{ as: "h3", size: "h4" }} weight="semibold">
            Thank you!
          </Text>
          <Text>We&apos;ll be in touch shortly.</Text>
          <Button variant="ghost" onClick={() => setStatus("idle")}>
            Submit another
          </Button>
        </Stack>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <Stack spacing="md">
          <Text element={{ as: "h3", size: "h5" }} weight="semibold">
            Get in touch
          </Text>

          <Input
            label={{ text: "Name" }}
            name="name"
            required
            placeholder="Your name"
          />
          <Input
            label={{ text: "Email" }}
            name="email"
            type="email"
            required
            placeholder="you@example.com"
          />
          <Input
            label={{ text: "Company" }}
            name="company"
            placeholder="Your company (optional)"
          />
          <div>
            <Text element={{ size: "sm" }} weight="semibold">Message</Text>
            <textarea
              name="message"
              placeholder="Tell us about your project..."
              rows={4}
              style={{
                width: "100%",
                padding: "var(--azimuth-spacing-sm)",
                border: "1px solid var(--azimuth-color-border)",
                borderRadius: "var(--azimuth-radius-md)",
                fontFamily: "inherit",
                resize: "vertical",
                marginTop: "var(--azimuth-spacing-xs)",
              }}
            />
          </div>

          {status === "error" && <Text color="error">{error}</Text>}

          <Button variant="primary" type="submit" fullWidth>
            {status === "loading" ? "Sending..." : "Send"}
          </Button>
        </Stack>
      </form>
    </Card>
  );
}
`
}

function renderLandingPage(): string {
  return `import { LeadForm } from "@/components/lead-form";
import { Text, Stack, Card } from "azimuth-ui";

export default function Home() {
  return (
    <Stack spacing="lg" style={{ padding: "var(--azimuth-spacing-xl)" }}>
      <section style={{ textAlign: "center", padding: "4rem 0" }}>
        <Stack spacing="md" style={{ maxWidth: 600, margin: "0 auto" }}>
          <Text element={{ as: "h1", size: "h2" }} weight="bold">
            Grow Your Business
          </Text>
          <Text element={{ size: "lg" }} color="secondary">
            Get more leads, close more deals, and track your pipeline all in one place.
          </Text>
        </Stack>
      </section>

      <section style={{ maxWidth: 500, margin: "0 auto" }}>
        <LeadForm />
      </section>

      <section style={{ padding: "4rem 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "var(--azimuth-spacing-md)" }}>
          <Card>
            <Stack spacing="sm">
              <Text element={{ as: "h3", size: "h5" }} weight="semibold">Capture</Text>
              <Text element={{ size: "sm" }} color="secondary">
                Embed lead capture forms on any page and start collecting qualified leads instantly.
              </Text>
            </Stack>
          </Card>
          <Card>
            <Stack spacing="sm">
              <Text element={{ as: "h3", size: "h5" }} weight="semibold">Track</Text>
              <Text element={{ size: "sm" }} color="secondary">
                Monitor your pipeline with real-time status tracking and intelligent lead scoring.
              </Text>
            </Stack>
          </Card>
          <Card>
            <Stack spacing="sm">
              <Text element={{ as: "h3", size: "h5" }} weight="semibold">Convert</Text>
              <Text element={{ size: "sm" }} color="secondary">
                Nurture leads through your funnel with automated follow-ups and smart notifications.
              </Text>
            </Stack>
          </Card>
        </div>
      </section>
    </Stack>
  );
}
`
}

export function generateLeadGenFiles(config: BootConfig): GeneratedFile[] {
  if (config.preset !== 'lead-gen-site') return []

  return [
    {
      path: 'src/app/dashboard/layout.tsx',
      content: renderLeadDashboardLayout(),
    },
    {
      path: 'src/app/dashboard/leads/page.tsx',
      content: renderLeadDashboardLeadsPage(),
    },
    {
      path: 'src/app/api/leads/route.ts',
      content: renderLeadCaptureApi(),
    },
    {
      path: 'src/app/actions/submit-lead.ts',
      content: renderLeadFormAction(),
    },
    {
      path: 'src/components/lead-form.tsx',
      content: renderLeadForm(),
    },
    {
      path: 'src/app/page.tsx',
      content: renderLandingPage(),
    },
  ]
}
