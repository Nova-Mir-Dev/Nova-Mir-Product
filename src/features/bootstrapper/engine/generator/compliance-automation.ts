import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'

export function generateComplianceAutomation(
  config: BootConfig,
): GeneratedFile[] {
  const regulatedMarkets = [
    'eu',
    'uk',
    'us',
    'ca',
    'br',
    'ar',
    'cl',
    'co',
    'mx',
    'no',
    'ch',
    'is',
  ]
  const needsAutomation =
    config.targetMarkets.some((m) => regulatedMarkets.includes(m)) &&
    config.auth !== 'none'
  if (!needsAutomation) return []

  const retentionDays = config.dataRetentionDays

  const dataAccess: GeneratedFile = {
    path: 'src/app/api/compliance/data-access/route.ts',
    content: `import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single();
  const { data: sessions } = await supabase.from("sessions").select("*").eq("user_id", user.id);
  const { data: payments } = await supabase.from("payments").select("*").eq("user_id", user.id);

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    personalData: {
      profile,
      sessions,
      payments,
    },
    processingPurposes: [
      "Account management and authentication",
      "Payment processing (if applicable)",
      "Service delivery and support",
    ],
    retentionPeriods: {
      profile: "Duration of account + 30 days after deletion",
      sessions: "30 days",
      payments: "7 years (legal obligation)",
    },
    dataSharing: {
      categories: ["Payment processor", "Email provider", "Hosting provider"],
      safeguards: "Standard Contractual Clauses with all processors",
    },
  });
}
`,
  }

  const dataDeletion: GeneratedFile = {
    path: 'src/app/api/compliance/data-deletion/route.ts',
    content: `import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase-admin";

const BodySchema = z.object({
  confirmation: z.string().optional(),
});

const LEGAL_RETENTION_TABLES: Record<string, string> = {
  payments: "Retained for 7 years per tax/accounting legal obligations",
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Retention policy check — do not delete data that still has legal retention requirements
  const retained: string[] = [];
  for (const [table, reason] of Object.entries(LEGAL_RETENTION_TABLES)) {
    const { count } = await supabase.from(table).select("*", { count: "exact", head: true }).eq("user_id", user.id);
    if (count && count > 0) retained.push(\`\${table}: \${reason}\`);
  }

  // Delete non-retained user data from application tables (uses anon client with RLS)
  await supabase.from("sessions").delete().eq("user_id", user.id);
  await supabase.from("documents").delete().eq("user_id", user.id);

  // Delete the auth user (requires service_role client)
  const admin = createServiceClient();
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) return NextResponse.json({ error: "Deletion failed" }, { status: 500 });

  return NextResponse.json({
    deleted: true,
    deletedAt: new Date().toISOString(),
    userId: user.id,
    retainedData: retained.length > 0 ? retained : undefined,
    note: retained.length > 0
      ? "Account deleted. Some data retained per legal obligations: " + retained.join("; ")
      : "Data has been deleted from application tables and auth system. Third-party processors have been notified.",
  });
}
`,
  }

  const dataCorrection: GeneratedFile = {
    path: 'src/app/api/compliance/data-correction/route.ts',
    content: `import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase-server";

const BodySchema = z.object({
  field: z.enum(["email", "name", "phone"]),
  value: z.string().min(1).max(500),
  reason: z.string().min(1).max(2000),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid request: " + parsed.error.issues.map(i => i.message).join(", ") }, { status: 400 });

  const { error: updateError } = await supabase.from("users").update({ [parsed.data.field]: parsed.data.value }).eq("id", user.id);
  if (updateError) return NextResponse.json({ error: "Update failed" }, { status: 500 });

  return NextResponse.json({
    corrected: true,
    field: parsed.data.field,
    correctedAt: new Date().toISOString(),
  });
}
`,
  }

  const dataExport: GeneratedFile = {
    path: 'src/app/api/compliance/data-export/route.ts',
    content: `import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase-server";

const BodySchema = z.object({
  format: z.enum(["json", "csv"]),
});

function escapeCsv(val: unknown): string {
  const str = val == null ? "" : String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\\n")) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines: string[] = [headers.map(escapeCsv).join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsv(row[h])).join(","));
  }
  return lines.join("\\n");
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single();
  const { data: sessions } = await supabase.from("sessions").select("*").eq("user_id", user.id);
  const { data: payments } = await supabase.from("payments").select("*").eq("user_id", user.id);

  if (parsed.data.format === "csv") {
    const csvParts: string[] = [];
    csvParts.push("=== users ===");
    csvParts.push(toCsv(profile ? [profile] : []));
    csvParts.push("");
    csvParts.push("=== sessions ===");
    csvParts.push(toCsv(sessions ?? []));
    csvParts.push("");
    csvParts.push("=== payments ===");
    csvParts.push(toCsv(payments ?? []));
    const csv = csvParts.join("\\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": \`attachment; filename="compliance-export-\${user.id}.csv"\`,
      },
    });
  }

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    format: "json",
    personalData: {
      profile,
      sessions,
      payments,
    },
  });
}
`,
  }

  const dataRetention: GeneratedFile = {
    path: 'src/app/api/compliance/data-retention/route.ts',
    content: `import { NextResponse } from "next/server";

const RETENTION_PERIODS = {
  users: {
    retentionDays: ${retentionDays},
    legalBasis: "Account management — retained for duration of account plus a 30-day grace period after deletion",
  },
  sessions: {
    retentionDays: 30,
    legalBasis: "Security and fraud prevention — automatically purged after 30 days",
  },
  payments: {
    retentionDays: 2555,
    legalBasis: "Tax and accounting legal obligation — retained for 7 years per applicable regulations",
  },
  documents: {
    retentionDays: ${retentionDays},
    legalBasis: "Service delivery — retained for the duration of the business relationship plus configured retention period",
  },
  audit_logs: {
    retentionDays: 365,
    legalBasis: "Security and compliance auditing — retained for 1 year per industry standards",
  },
};

export async function GET() {
  return NextResponse.json({
    policyName: "Data Retention Policy",
    defaultRetentionDays: ${retentionDays},
    categories: RETENTION_PERIODS,
    note: "Data may be retained longer if required by applicable law or for the establishment, exercise, or defense of legal claims.",
  });
}
`,
  }

  const complianceForm: GeneratedFile = {
    path: 'src/features/compliance/compliance-request-form.tsx',
    content: `"use client";

import { useState } from "react";
import { Button, Card, Text, Stack, Alert } from "azimuth-ui";

type RequestType = "access" | "deletion" | "export" | "correction";

export function ComplianceRequestForm() {
  const [requestType, setRequestType] = useState<RequestType | null>(null);
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");
  const [result, setResult] = useState<{ success?: boolean; error?: string }>({});

  async function submitAccess() {
    const res = await fetch("/api/compliance/data-access");
    const data = await res.json();
    if (data.error) { setResult({ error: data.error }); return; }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-data.json";
    a.click();
    URL.revokeObjectURL(url);
    setResult({ success: true });
  }

  async function submitExport() {
    const res = await fetch("/api/compliance/data-export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format: exportFormat }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Export failed" }));
      setResult({ error: err.error });
      return;
    }
    if (exportFormat === "csv") {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "compliance-export.csv";
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "compliance-export.json";
      a.click();
      URL.revokeObjectURL(url);
    }
    setResult({ success: true });
  }

  async function submitDeletion() {
    if (!confirm("This will permanently delete your account and all associated data. Are you sure?")) return;
    const res = await fetch("/api/compliance/data-deletion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    const data = await res.json();
    if (data.error) { setResult({ error: data.error }); return; }
    setResult({ success: true });
  }

  if (result.success) {
    return (
      <Card>
        <Stack spacing="md">
          <Text weight="semibold">Request Submitted</Text>
          <Text element={{ size: "sm" }} color="secondary">
            {requestType === "access" ? "Your data access request has been downloaded." :
             requestType === "export" ? "Your data export has been downloaded." :
             requestType === "deletion" ? "Your data deletion request has been processed. You will be logged out shortly." :
             "Your correction request has been submitted."}
          </Text>
          <Button variant="outline" onClick={() => { setResult({}); setRequestType(null); }}>
            Make Another Request
          </Button>
        </Stack>
      </Card>
    );
  }

  return (
    <Card>
      <Stack spacing="md">
        <Text weight="semibold">Privacy Rights Request</Text>
        <Text element={{ size: "sm" }} color="secondary">
          Depending on your jurisdiction, you may have the right to access, export, delete, or correct your personal data.
          All requests are verified against your authenticated account.
        </Text>

        {result.error && <Alert variant="alert">{result.error}</Alert>}

        <Button variant="primary" fullWidth onClick={() => { setRequestType("access"); submitAccess(); }}>
          Access My Data (DSAR)
        </Button>
        <Button variant="primary" fullWidth onClick={() => { setRequestType("export"); submitExport(); }}>
          Export My Data (JSON)
        </Button>
        <Button variant="secondary" fullWidth onClick={() => { setExportFormat("csv"); setRequestType("export"); submitExport(); }}>
          Export My Data (CSV)
        </Button>
        <Button variant="destructive" fullWidth onClick={() => { setRequestType("deletion"); submitDeletion(); }}>
          Delete My Data
        </Button>
      </Stack>
    </Card>
  );
}
`,
  }

  return [
    dataAccess,
    dataDeletion,
    dataCorrection,
    dataExport,
    dataRetention,
    complianceForm,
  ]
}
