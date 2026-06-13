// ── Supabase helpers ────────────────────────────────────────

export function renderSupabaseServerImport(): string {
  return `import { createClient } from "@/lib/supabase-server";\n`
}

// ── Layout helpers ──────────────────────────────────────────

export interface NavItem {
  label: string
  path: string
}

function renderNavItemsArray(items: NavItem[]): string {
  return items
    .map(
      (item, i) =>
        `    { label: "${item.label}", path: "${item.path}" }${i < items.length - 1 ? ',' : ''}`,
    )
    .join('\n')
}

export function renderAdminLayout(navItems: NavItem[]): string {
  const navItemsCode = renderNavItemsArray(navItems)

  return `import { redirect } from "next/navigation";
import Link from "next/link";
import { Stack, Text } from "azimuth-ui";
import { createClient } from "@/lib/supabase-server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/login");

  const navItems = [
${navItemsCode}
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <nav style={{ width: 240, borderRight: "1px solid var(--azimuth-color-border)" }}>
        <Stack spacing="sm" style={{ padding: "var(--azimuth-spacing-md)" }}>
          <Text element={{ as: "h2", size: "h5" }} weight="semibold">
            Admin
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

export function renderClientLayout(navItems: NavItem[]): string {
  const navItemsCode = renderNavItemsArray(navItems)

  return `"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button, Stack, Text } from "azimuth-ui";

interface ClientUser {
  id: string;
  role: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.role !== "client") {
          router.push("/login");
          return;
        }
        setUser(data as ClientUser);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <Text>Loading...</Text>;
  if (!user) return null;

  const navItems = [
${navItemsCode}
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <nav style={{ width: 240, borderRight: "1px solid var(--azimuth-color-border)" }}>
        <Stack spacing="sm" style={{ padding: "var(--azimuth-spacing-md)" }}>
          <Text element={{ as: "h2", size: "h5" }} weight="semibold">
            Dashboard
          </Text>
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={pathname === item.path ? "primary" : "ghost"}
              onClick={() => router.push(item.path)}
            >
              {item.label}
            </Button>
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

// ── Auth page renderers ─────────────────────────────────────

export function renderAuthMiddleware(): string {
  return `import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
      cookieOptions: {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .single()

  const role = (profile as { role: string | null } | null)?.role

  if (pathname === '/' || pathname === '') {
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    if (role === 'client') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('reason', 'no_role')
    return NextResponse.redirect(loginUrl)
  }

  if (pathname.startsWith('/admin') && role !== 'admin') {
    if (role === 'client') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (pathname.startsWith('/dashboard') && role !== 'client') {
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|login|auth|api/auth|api/stripe|api/slack|\\.well-known).*)'],
}
`
}

export function renderLoginPage(): string {
  return `'use client'

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Button, Card, Input, Text, Stack } from "azimuth-ui"

type Tab = "admin" | "client"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || ""
  const [tab, setTab] = useState<Tab>("admin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    router.push(redirect || "/admin")
  }

  async function handleClientLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const origin = typeof window !== "undefined" ? window.location.origin : ""

    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: origin,
      },
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setLoading(false)
    router.push("/login/check-email?email=" + encodeURIComponent(email))
  }

  return (
    <div style={{ maxWidth: 400, margin: "4rem auto" }}>
      <Card>
        <Stack spacing="md">
          <Text element={{ as: "h1", size: "h3" }} weight="bold" style={{ textAlign: "center" }}>
            Sign In
          </Text>

          <div style={{ display: "flex", borderBottom: "1px solid var(--azimuth-color-border)" }}>
            <button
              onClick={() => { setTab("admin"); setError("") }}
              style={{
                flex: 1,
                padding: "var(--azimuth-spacing-sm)",
                border: "none",
                background: "none",
                cursor: "pointer",
                fontWeight: tab === "admin" ? 600 : 400,
                borderBottom: tab === "admin" ? "2px solid var(--azimuth-color-primary)" : "2px solid transparent",
                color: tab === "admin" ? "var(--azimuth-color-primary)" : "var(--azimuth-color-text-secondary)",
                fontSize: "inherit",
                fontFamily: "inherit",
              }}
            >
              Admin
            </button>
            <button
              onClick={() => { setTab("client"); setError("") }}
              style={{
                flex: 1,
                padding: "var(--azimuth-spacing-sm)",
                border: "none",
                background: "none",
                cursor: "pointer",
                fontWeight: tab === "client" ? 600 : 400,
                borderBottom: tab === "client" ? "2px solid var(--azimuth-color-primary)" : "2px solid transparent",
                color: tab === "client" ? "var(--azimuth-color-primary)" : "var(--azimuth-color-text-secondary)",
                fontSize: "inherit",
                fontFamily: "inherit",
              }}
            >
              Client
            </button>
          </div>

          {error && <Text color="error">{error}</Text>}

          <form onSubmit={tab === "admin" ? handleAdminLogin : handleClientLogin}>
            <Stack spacing="md">
              <Input
                label={{ text: "Email" }}
                type="email"
                value={{ value: email, onChange: (e) => setEmail(e.target.value) }}
                required
                placeholder="you@example.com"
              />

              {tab === "admin" && (
                <Input
                  label={{ text: "Password" }}
                  type="password"
                  value={{ value: password, onChange: (e) => setPassword(e.target.value) }}
                  required
                  placeholder="Enter your password"
                />
              )}

              {tab === "client" && (
                <Text element={{ size: "sm" }} color="secondary">
                  We&apos;ll send a magic link to your email. No password needed.
                </Text>
              )}

              <Button type="submit" variant="primary" fullWidth>
                {loading
                  ? "Please wait..."
                  : tab === "admin"
                  ? "Sign In"
                  : "Send Magic Link"
                }
              </Button>
            </Stack>
          </form>
        </Stack>
      </Card>
    </div>
  )
}
`
}

export function renderMagicLinkPage(): string {
  return `'use client'

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Button, Card, Text, Stack } from "azimuth-ui"

export default function CheckEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [error, setError] = useState("")

  async function handleResend() {
    if (!email) return
    setResending(true)
    setError("")

    const supabase = createClient()
    const origin = typeof window !== "undefined" ? window.location.origin : ""

    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: origin,
      },
    })

    if (err) {
      setError(err.message)
      setResending(false)
      return
    }

    setResent(true)
    setResending(false)
  }

  return (
    <div style={{ maxWidth: 400, margin: "4rem auto" }}>
      <Card>
        <Stack spacing="md" style={{ textAlign: "center" }}>
          <Text element={{ as: "h1", size: "h3" }} weight="bold">
            Check your email
          </Text>

          <Text>
            We sent a magic link to <strong>{email || "your email"}</strong>.
            Click the link to sign in.
          </Text>

          {error && <Text color="error">{error}</Text>}

          {resent ? (
            <Text element={{ size: "sm" }}>Magic link resent! Check your inbox.</Text>
          ) : (
            <Button variant="ghost" onClick={handleResend}>
              {resending ? "Sending..." : "Resend magic link"}
            </Button>
          )}

          <Button variant="ghost" onClick={() => router.push("/login")}>
            Back to login
          </Button>
        </Stack>
      </Card>
    </div>
  )
}
`
}

export function renderAuthShell(): string {
  return `'use client'

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { ThemeProvider, Text } from "azimuth-ui"

export function AuthShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const publicPaths = ["/login", "/auth"]
    if (publicPaths.some((p) => pathname.startsWith(p))) {
      setLoading(false)
      return
    }

    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated")
        return res.json()
      })
      .then(() => setLoading(false))
      .catch(() => {
        router.push(\`/login?redirect=\${encodeURIComponent(pathname)}\`)
      })
  }, [router, pathname])

  if (loading) return <Text>Loading...</Text>

  return <ThemeProvider>{children}</ThemeProvider>
}
`
}

export function renderRootLayout(projectName: string): string {
  return `import type { Metadata } from 'next'
import { Sora, Onest } from 'next/font/google'
import { AuthShell } from './_components/auth-shell'
import { ThemeScript } from './_components/theme-script'
import './globals.css'
import 'azimuth-ui/styles.css'

const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
})

const onest = Onest({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: '${projectName}',
  description: 'Client portal and project management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className={\`\${sora.variable} \${onest.variable}\`}>
        <a href="#main-content" className="sr-only">
          Skip to content
        </a>
        <ThemeScript />
        <AuthShell>{children}</AuthShell>
      </body>
    </html>
  )
}
`
}

// ── API route file renderers ────────────────────────────────

export function renderAuthMeApi(): string {
  return `import { NextResponse } from "next/server";
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
`
}

export function renderAdminClientsApi(): string {
  return `import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: clients, error: clientsError } = await supabase
    .from("portfolio_clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (clientsError) return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });

  const mapped = (clients ?? []).map((c: Record<string, unknown>) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    projectCount: c.project_count ?? 0,
    status: c.status ?? "active",
  }));

  return NextResponse.json(mapped);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await request.json()) as { name: string; email: string };
  if (!body.name?.trim() || !body.email?.trim()) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const { data: client, error: createError } = await supabase
    .from("portfolio_clients")
    .insert({ name: body.name.trim(), email: body.email.trim() })
    .select()
    .single();

  if (createError) return NextResponse.json({ error: "Failed to create client" }, { status: 500 });

  const mapped = {
    id: client.id,
    name: client.name,
    email: client.email,
    projectCount: client.project_count ?? 0,
    status: client.status ?? "active",
  };

  return NextResponse.json(mapped, { status: 201 });
}
`
}

export function renderAdminBillingApi(): string {
  return `import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: invoices, error: invoicesError } = await supabase
    .from("portfolio_invoices")
    .select("*")
    .order("created_at", { ascending: false });

  if (invoicesError) return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });

  const mapped = (invoices ?? []).map((inv: Record<string, unknown>) => ({
    id: inv.id,
    clientName: inv.client_name,
    amount: inv.amount,
    status: inv.status,
    date: inv.date,
  }));

  const summary = {
    paid: mapped.filter((i: { status: string }) => i.status === "paid").length,
    pending: mapped.filter((i: { status: string }) => i.status === "pending").length,
    overdue: mapped.filter((i: { status: string }) => i.status === "overdue").length,
  };

  return NextResponse.json({ invoices: mapped, summary });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await request.json()) as { clientName: string; amount: number };
  if (!body.clientName?.trim() || typeof body.amount !== "number" || body.amount <= 0) {
    return NextResponse.json({ error: "Valid client name and amount are required" }, { status: 400 });
  }

  const { data: invoice, error: createError } = await supabase
    .from("portfolio_invoices")
    .insert({
      client_name: body.clientName.trim(),
      amount: Math.round(body.amount),
      status: "pending",
      date: new Date().toISOString(),
    })
    .select()
    .single();

  if (createError) return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });

  const mapped = {
    id: invoice.id,
    clientName: invoice.client_name,
    amount: invoice.amount,
    status: invoice.status,
    date: invoice.date,
  };

  return NextResponse.json(mapped, { status: 201 });
}
`
}

export function renderAdminAuditApi(): string {
  return `import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const actionFilter = searchParams.get("action")?.toLowerCase();
  const clientFilter = searchParams.get("client")?.toLowerCase();
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  let query = supabase.from("activity_logs").select("*").order("timestamp", { ascending: false });

  if (dateFrom) query = query.gte("timestamp", dateFrom);
  if (dateTo) query = query.lte("timestamp", dateTo);

  const { data: entries, error: fetchError } = await query;

  if (fetchError) return NextResponse.json({ error: "Failed to fetch audit log" }, { status: 500 });

  let filtered = entries ?? [];
  if (actionFilter) filtered = filtered.filter((e) => e.action?.toLowerCase().includes(actionFilter));
  if (clientFilter) filtered = filtered.filter((e) => e.client_name?.toLowerCase().includes(clientFilter));

  const mapped = filtered.map((e: Record<string, unknown>) => ({
    id: e.id,
    action: e.action,
    clientName: e.client_name,
    performedBy: e.performed_by,
    timestamp: e.timestamp,
    details: e.details,
  }));

  return NextResponse.json(mapped);
}
`
}

// ── Complete page renderers for portfolio pages ────────────

export function renderAdminClientsPage(): string {
  return `import { Button, Card, Input, Stack, Text } from "azimuth-ui";
import { createClient } from "@/lib/supabase-server";
import { createClient as createClientAction } from "./actions";

interface Client {
  id: string;
  name: string;
  email: string;
  project_count: number;
  status: string;
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; create?: string }>
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("portfolio_clients")
    .select("*")
    .order("created_at", { ascending: false });

  const raw = (clients ?? []) as Client[];
  const search = params.q?.toLowerCase() || "";
  const filtered = search
    ? raw.filter(
        (c) =>
          c.name?.toLowerCase().includes(search) ||
          c.email?.toLowerCase().includes(search),
      )
    : raw;

  return (
    <Stack spacing="md">
      <Text element={{ as: "h1", size: "h3" }} weight="semibold">
        Client Management
      </Text>

      <form method="GET" style={{ display: "flex", gap: "var(--azimuth-spacing-sm)" }}>
        <Input
          label={{ text: "Search" }}
          name="q"
          defaultValue={params.q || ""}
          placeholder="Search clients..."
        />
        <Button variant="primary" type="submit">
          Search
        </Button>
        {params.q && (
          <a href="/admin/clients">
            <Button variant="ghost" type="button">Clear</Button>
          </a>
        )}
        <a href={"/admin/clients?create=true"}>
          <Button variant="primary" type="button">
            Add Client
          </Button>
        </a>
      </form>

      {params.create === "true" && (
        <Card>
          <form action={createClientAction}>
            <Stack spacing="sm">
              <Input label={{ text: "Name" }} name="name" required />
              <Input label={{ text: "Email" }} name="email" type="email" required />
              <div style={{ display: "flex", gap: "var(--azimuth-spacing-sm)" }}>
                <Button variant="primary" type="submit">Create</Button>
                <a href="/admin/clients">
                  <Button variant="ghost" type="button">Cancel</Button>
                </a>
              </div>
            </Stack>
          </form>
        </Card>
      )}

      {filtered.length === 0 ? (
        <Text>No clients found.</Text>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Projects</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((client) => (
              <tr key={client.id}>
                <td>{client.name}</td>
                <td>{client.email}</td>
                <td>{client.project_count}</td>
                <td>{client.status}</td>
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

export function renderAdminClientsActions(): string {
  return `"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function createClientAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!name?.trim() || !email?.trim()) {
    throw new Error("Name and email are required");
  }

  const { error } = await supabase.from("portfolio_clients").insert({
    name: name.trim(),
    email: email.trim(),
  });

  if (error) throw new Error("Failed to create client");

  revalidatePath("/admin/clients");
}
`
}

export function renderAdminBillingPage(): string {
  return `import { Button, Card, Input, Stack, Text } from "azimuth-ui";
import { createClient } from "@/lib/supabase-server";
import { createInvoice } from "./actions";

interface Invoice {
  id: string;
  client_name: string;
  amount: number;
  status: string;
  date: string;
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ create?: string }>
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: invoices } = await supabase
    .from("portfolio_invoices")
    .select("*")
    .order("created_at", { ascending: false });

  const raw = (invoices ?? []) as Invoice[];

  const summary = {
    paid: raw.filter((i) => i.status === "paid").length,
    pending: raw.filter((i) => i.status === "pending").length,
    overdue: raw.filter((i) => i.status === "overdue").length,
  };

  return (
    <Stack spacing="md">
      <Text element={{ as: "h1", size: "h3" }} weight="semibold">
        Billing Overview
      </Text>

      <div style={{ display: "flex", gap: "var(--azimuth-spacing-md)" }}>
        <Card><Text>Paid: {summary.paid}</Text></Card>
        <Card><Text>Pending: {summary.pending}</Text></Card>
        <Card><Text>Overdue: {summary.overdue}</Text></Card>
      </div>

      <a href={"/admin/billing?create=true"}>
        <Button variant="primary" type="button">
          Create Invoice
        </Button>
      </a>

      {params.create === "true" && (
        <Card>
          <form action={createInvoice}>
            <Stack spacing="sm">
              <Input label={{ text: "Client Name" }} name="clientName" required />
              <Input label={{ text: "Amount" }} name="amount" type="number" step="0.01" required />
              <div style={{ display: "flex", gap: "var(--azimuth-spacing-sm)" }}>
                <Button variant="primary" type="submit">Create</Button>
                <a href="/admin/billing">
                  <Button variant="ghost" type="button">Cancel</Button>
                </a>
              </div>
            </Stack>
          </form>
        </Card>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Client</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {raw.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.client_name}</td>
              <td>{Number(inv.amount).toFixed(2)}</td>
              <td>{inv.status}</td>
              <td>{new Date(inv.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Stack>
  );
}
`
}

export function renderAdminBillingActions(): string {
  return `"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function createInvoice(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const clientName = formData.get("clientName") as string;
  const amount = Number(formData.get("amount"));

  if (!clientName?.trim() || !amount || amount <= 0) {
    throw new Error("Valid client name and amount are required");
  }

  const { error } = await supabase.from("portfolio_invoices").insert({
    client_name: clientName.trim(),
    amount: Math.round(amount),
    status: "pending",
    date: new Date().toISOString(),
  });

  if (error) throw new Error("Failed to create invoice");

  revalidatePath("/admin/billing");
}
`
}

export function renderAdminAuditPage(): string {
  return `import { Button, Card, Input, Stack, Text } from "azimuth-ui";
import { createClient } from "@/lib/supabase-server";

interface AuditEntry {
  id: string;
  action: string;
  client_name: string;
  performed_by: string;
  timestamp: string;
  details: string;
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; client?: string; from?: string; to?: string }>
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("activity_logs").select("*").order("timestamp", { ascending: false });

  if (params.from) query = query.gte("timestamp", params.from);
  if (params.to) query = query.lte("timestamp", params.to);

  const { data: entries } = await query;

  let filtered = (entries ?? []) as AuditEntry[];

  const actionFilter = params.action?.toLowerCase();
  if (actionFilter) {
    filtered = filtered.filter((e) => e.action?.toLowerCase().includes(actionFilter));
  }

  const clientFilter = params.client?.toLowerCase();
  if (clientFilter) {
    filtered = filtered.filter((e) => e.client_name?.toLowerCase().includes(clientFilter));
  }

  return (
    <Stack spacing="md">
      <Text element={{ as: "h1", size: "h3" }} weight="semibold">
        Audit Log
      </Text>

      <form method="GET" style={{ display: "flex", gap: "var(--azimuth-spacing-sm)", flexWrap: "wrap" }}>
        <Input
          label={{ text: "Action" }}
          name="action"
          defaultValue={params.action || ""}
          placeholder="Filter by action..."
        />
        <Input
          label={{ text: "Client" }}
          name="client"
          defaultValue={params.client || ""}
          placeholder="Filter by client..."
        />
        <Input
          label={{ text: "From" }}
          name="from"
          defaultValue={params.from || ""}
          type="date"
        />
        <Input
          label={{ text: "To" }}
          name="to"
          defaultValue={params.to || ""}
          type="date"
        />
        <Button variant="primary" type="submit">Filter</Button>
        {(params.action || params.client || params.from || params.to) && (
          <a href="/admin/audit">
            <Button variant="ghost" type="button">Clear</Button>
          </a>
        )}
      </form>

      {filtered.length === 0 ? (
        <Text>No audit entries found.</Text>
      ) : (
        <Stack spacing="sm">
          {filtered.map((entry) => (
            <Card key={entry.id}>
              <Stack spacing="xs">
                <Text element={{ size: "sm" }} weight="semibold">
                  {entry.action}
                </Text>
                <Text element={{ size: "sm" }}>
                  Client: {entry.client_name} — By: {entry.performed_by}
                </Text>
                <Text element={{ size: "sm" }}>
                  {new Date(entry.timestamp).toLocaleString()}
                </Text>
                <Text element={{ size: "sm" }}>
                  {entry.details}
                </Text>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
`
}

export function renderClientDashboardPage(): string {
  return `import { Card, Stack, Text } from "azimuth-ui";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

interface Project {
  id: string;
  name: string;
  status: string;
  deadline: string;
  progress: number;
}

interface Activity {
  id: string;
  action: string;
  project_name: string;
  timestamp: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileRes, projectsRes, activityRes] = await Promise.all([
    supabase.from("users").select("id, name, email").eq("id", user.id).single(),
    supabase.from("projects").select("*").eq("client_id", user.id),
    supabase.from("activity_logs").select("*").eq("user_id", user.id).order("timestamp", { ascending: false }).limit(10),
  ]);

  const profile = (profileRes.data ?? null) as UserProfile | null;
  const projects = (projectsRes.data ?? []) as Project[];
  const recentActivity = (activityRes.data ?? []) as Activity[];

  const activeProjects = projects.filter((p) => p.status === "active" || p.status === "in_progress");

  return (
    <Stack spacing="lg">
      <Text element={{ as: "h1", size: "h3" }} weight="semibold">
        Welcome{profile ? ", " + profile.name : ""}
      </Text>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--azimuth-spacing-md)" }}>
        <Card>
          <Stack spacing="xs">
            <Text element={{ size: "sm" }} color="secondary">Active Projects</Text>
            <Text element={{ as: "p", size: "h2" }} weight="bold">{activeProjects.length}</Text>
          </Stack>
        </Card>
        <Card>
          <Stack spacing="xs">
            <Text element={{ size: "sm" }} color="secondary">Total Projects</Text>
            <Text element={{ as: "p", size: "h2" }} weight="bold">{projects.length}</Text>
          </Stack>
        </Card>
      </div>

      {activeProjects.length > 0 ? (
        <Stack spacing="sm">
          <Text element={{ as: "h2", size: "h5" }} weight="semibold">
            Project Progress
          </Text>
          {activeProjects.slice(0, 3).map((project) => (
            <Card key={project.id}>
              <Stack spacing="xs">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Text weight="semibold">{project.name}</Text>
                  <Text element={{ size: "sm" }} color="secondary">{project.status}</Text>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={project.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  style={{
                    height: 8,
                    backgroundColor: "var(--azimuth-color-bg-secondary)",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: project.progress + "%",
                      height: "100%",
                      backgroundColor: "var(--azimuth-color-primary)",
                      borderRadius: 4,
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
                <Text element={{ size: "sm" }} color="secondary">
                  {project.progress}% complete — Deadline: {new Date(project.deadline).toLocaleDateString()}
                </Text>
              </Stack>
            </Card>
          ))}
        </Stack>
      ) : (
        <Card>
          <Stack spacing="sm" style={{ textAlign: "center", padding: "var(--azimuth-spacing-lg)" }}>
            <Text color="secondary">No active projects yet.</Text>
            <a href="/dashboard/projects">
              <Text>View Projects</Text>
            </a>
          </Stack>
        </Card>
      )}

      <Stack spacing="sm">
        <Text element={{ as: "h2", size: "h5" }} weight="semibold">
          Recent Activity
        </Text>
        {recentActivity.length > 0 ? (
          <Stack spacing="xs">
            {recentActivity.map((activity) => (
              <Card key={activity.id}>
                <Stack spacing="xs">
                  <Text element={{ size: "sm" }} weight="semibold">
                    {activity.action}
                  </Text>
                  <Text element={{ size: "sm" }} color="secondary">
                    {activity.project_name} — {new Date(activity.timestamp).toLocaleString()}
                  </Text>
                </Stack>
              </Card>
            ))}
          </Stack>
        ) : (
          <Text color="secondary" element={{ size: "sm" }}>No recent activity.</Text>
        )}
      </Stack>
    </Stack>
  );
}
`
}

export function renderClientProjectsPage(): string {
  return `import Link from "next/link";
import { Card, Stack, Text } from "azimuth-ui";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

interface Project {
  id: string;
  name: string;
  status: string;
  deadline: string;
  description: string;
}

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("client_id", user.id)
    .order("deadline", { ascending: true });

  const raw = (projects ?? []) as Project[];

  return (
    <Stack spacing="md">
      <Text element={{ as: "h1", size: "h3" }} weight="semibold">
        My Projects
      </Text>

      {raw.length === 0 ? (
        <Card>
          <Stack spacing="sm" style={{ textAlign: "center", padding: "var(--azimuth-spacing-lg)" }}>
            <Text color="secondary">No projects assigned yet.</Text>
            <Text element={{ size: "sm" }} color="secondary">
              When projects are assigned, they will appear here.
            </Text>
          </Stack>
        </Card>
      ) : (
        <Stack spacing="sm">
          {raw.map((project) => (
            <Card key={project.id}>
              <Stack spacing="xs">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Text weight="semibold">{project.name}</Text>
                  <Text element={{ size: "sm" }} color="secondary">{project.status}</Text>
                </div>
                <Text element={{ size: "sm" }} color="secondary">
                  {project.description}
                </Text>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Text element={{ size: "sm" }} color="secondary">
                    Deadline: {new Date(project.deadline).toLocaleDateString()}
                  </Text>
                  <Link href={"/dashboard/projects/" + project.id}>
                    <Text>View Details</Text>
                  </Link>
                </div>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
`
}

export function renderClientDocumentsActions(): string {
  return `"use server";

import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function uploadDocument(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/dashboard/documents?error=Unauthorized");

  const file = formData.get("file") as File;
  if (!file) redirect("/dashboard/documents?error=No+file+selected");

  const fileName = user.id + "/" + Date.now() + "_" + file.name;
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(fileName, file);

  if (uploadError) redirect("/dashboard/documents?error=" + encodeURIComponent(uploadError.message));

  const { data: { publicUrl } } = supabase.storage
    .from("documents")
    .getPublicUrl(fileName);

  const { error: dbError } = await supabase.from("documents").insert({
    user_id: user.id,
    name: file.name,
    file_url: publicUrl,
    file_type: file.type,
    file_size: file.size,
  });

  if (dbError) redirect("/dashboard/documents?error=" + encodeURIComponent(dbError.message));

  revalidatePath("/dashboard/documents");
  redirect("/dashboard/documents");
}
`
}

export function renderClientDocumentsPage(): string {
  return `import { Button, Card, Stack, Text } from "azimuth-ui";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { uploadDocument } from "./actions";

interface Document {
  id: string;
  name: string;
  file_url: string;
  uploaded_at: string;
  file_type: string;
  file_size: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", user.id)
    .order("uploaded_at", { ascending: false });

  const raw = (documents ?? []) as Document[];
  const error = params.error ? decodeURIComponent(params.error) : null;

  return (
    <Stack spacing="md">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Text element={{ as: "h1", size: "h3" }} weight="semibold">
          My Documents
        </Text>
        <form action={uploadDocument} style={{ display: "flex", gap: "var(--azimuth-spacing-sm)", alignItems: "center" }}>
          <input type="file" name="file" required />
          <Button variant="primary" type="submit">
            Upload Document
          </Button>
        </form>
      </div>

      {error && (
        <Card>
          <Text element={{ size: "sm" }} color="error">{error}</Text>
        </Card>
      )}

      {raw.length === 0 ? (
        <Card>
          <Stack spacing="sm" style={{ textAlign: "center", padding: "var(--azimuth-spacing-lg)" }}>
            <Text color="secondary">No documents uploaded yet.</Text>
            <Text element={{ size: "sm" }} color="secondary">
              Use the upload button above to add files.
            </Text>
          </Stack>
        </Card>
      ) : (
        <Stack spacing="sm">
          {raw.map((doc) => (
            <Card key={doc.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Stack spacing="xs">
                  <Text weight="semibold">{doc.name}</Text>
                  <Text element={{ size: "sm" }} color="secondary">
                    {formatFileSize(doc.file_size)} — {new Date(doc.uploaded_at).toLocaleDateString()}
                  </Text>
                </Stack>
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" type="button">
                    Download
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
`
}

export function renderClientSupportActions(): string {
  return `"use server";

import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createTicket(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/dashboard/support?error=Unauthorized");

  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  if (!subject?.trim() || !message?.trim()) {
    redirect("/dashboard/support?error=Subject+and+message+are+required");
  }

  const { error } = await supabase.from("support_tickets").insert({
    user_id: user.id,
    subject: subject.trim(),
    message: message.trim(),
    status: "open",
  });

  if (error) redirect("/dashboard/support?error=" + encodeURIComponent(error.message));

  revalidatePath("/dashboard/support");
  redirect("/dashboard/support");
}
`
}

export function renderClientSupportPage(projectName: string): string {
  return `import { Button, Card, Input, Stack, Text } from "azimuth-ui";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { createTicket } from "./actions";

const FAQ_ITEMS = [
  { question: "How do I reset my password?", answer: "Go to the login page and click 'Forgot password'. A reset link will be sent to your email." },
  { question: "How do I update my profile?", answer: "Your profile information can be updated in the account settings section." },
  { question: "Who do I contact for billing issues?", answer: "Please submit a support ticket with 'Billing' in the subject line, and our team will get back to you within 24 hours." },
];

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ create?: string; error?: string }>
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const raw = (tickets ?? []) as Ticket[];
  const error = params.error ? decodeURIComponent(params.error) : null;

  return (
    <Stack spacing="md">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Text element={{ as: "h1", size: "h3" }} weight="semibold">
          Support
        </Text>
        <a href={"/dashboard/support?create=true"}>
          <Button variant="primary" type="button">
            Submit Ticket
          </Button>
        </a>
      </div>

      {error && (
        <Card>
          <Text element={{ size: "sm" }} color="error">{error}</Text>
        </Card>
      )}

      {params.create === "true" && (
        <Card>
          <form action={createTicket}>
            <Stack spacing="sm">
              <Text weight="semibold">Submit a Support Ticket</Text>
              <Input
                label={{ text: "Subject" }}
                name="subject"
                placeholder="Brief description of the issue..."
                required
              />
              <div>
                <Text element={{ size: "sm" }} weight="semibold">Message</Text>
                <textarea
                  name="message"
                  placeholder="Describe your issue in detail..."
                  rows={4}
                  required
                  style={{
                    width: "100%",
                    padding: "var(--azimuth-spacing-sm)",
                    border: "1px solid var(--azimuth-color-border)",
                    borderRadius: "var(--azimuth-radius-md)",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "var(--azimuth-spacing-sm)" }}>
                <Button variant="primary" type="submit">Submit</Button>
                <a href="/dashboard/support">
                  <Button variant="ghost" type="button">Cancel</Button>
                </a>
              </div>
            </Stack>
          </form>
        </Card>
      )}

      <Card>
        <Stack spacing="sm">
          <Text element={{ as: "h2", size: "h5" }} weight="semibold">
            Contact Information
          </Text>
          <Text element={{ size: "sm" }}>Email: support@${projectName}.com</Text>
          <Text element={{ size: "sm" }}>Response time: Within 24 hours</Text>
        </Stack>
      </Card>

      <Card>
        <Stack spacing="sm">
          <Text element={{ as: "h2", size: "h5" }} weight="semibold">
            Frequently Asked Questions
          </Text>
          {FAQ_ITEMS.map((item, index) => (
            <details key={index}>
              <summary style={{ cursor: "pointer", padding: "var(--azimuth-spacing-sm) 0" }}>
                <Text weight="semibold">{item.question}</Text>
              </summary>
              <Text element={{ size: "sm" }} color="secondary" style={{ padding: "0 var(--azimuth-spacing-md) var(--azimuth-spacing-sm)" }}>
                {item.answer}
              </Text>
            </details>
          ))}
        </Stack>
      </Card>

      <Stack spacing="sm">
        <Text element={{ as: "h2", size: "h5" }} weight="semibold">
          My Tickets
        </Text>
          {raw.length === 0 ? (
            <Text color="secondary" element={{ size: "sm" }}>No support tickets submitted yet.</Text>
          ) : (
            <Stack spacing="xs">
              {raw.map((ticket) => (
                <Card key={ticket.id}>
                  <Stack spacing="xs">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Text weight="semibold">{ticket.subject}</Text>
                      <Text element={{ size: "sm" }} color="secondary">{ticket.status}</Text>
                    </div>
                    <Text element={{ size: "sm" }} color="secondary">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>
  );
}
`
}

// ── Membership site renderers ───────────────────────────────

export function renderMembershipDashboardLayout(): string {
  return `import { redirect } from "next/navigation";
import Link from "next/link";
import { Stack, Text } from "azimuth-ui";
import { createClient } from "@/lib/supabase-server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("members")
    .select("subscription_tier, subscription_status")
    .eq("id", user.id)
    .single();

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Members", path: "/dashboard/members" },
    { label: "Content", path: "/dashboard/content" },
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

export function renderMemberDirectoryPage(): string {
  return `import { Input, Button, Text, Stack, Card } from "azimuth-ui";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

interface Member {
  id: string;
  subscription_tier: string;
  subscription_status: string;
  joined_at: string;
}

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const search = params.q?.toLowerCase() || "";

  const { data: members } = await supabase
    .from("members")
    .select("id, subscription_tier, subscription_status, joined_at")
    .order("joined_at", { ascending: false });

  const raw = (members ?? []) as Member[];
  const filtered = search
    ? raw.filter(
        (m) =>
          m.id?.toLowerCase().includes(search) ||
          m.subscription_tier?.toLowerCase().includes(search),
      )
    : raw;

  return (
    <Stack spacing="md">
      <Text element={{ as: "h1", size: "h3" }} weight="semibold">
        Members
      </Text>

      <form method="GET" style={{ display: "flex", gap: "var(--azimuth-spacing-sm)" }}>
        <Input
          label={{ text: "Search" }}
          name="q"
          defaultValue={params.q || ""}
          placeholder="Search members..."
        />
        <Button variant="primary" type="submit">
          Search
        </Button>
        {params.q && (
          <a href="/dashboard/members">
            <Button variant="ghost" type="button">Clear</Button>
          </a>
        )}
      </form>

      {filtered.length === 0 ? (
        <Text>No members found.</Text>
      ) : (
        <Stack spacing="sm">
          {filtered.map((member) => (
            <Card key={member.id}>
              <Stack spacing="xs">
                <Text weight="semibold">{member.id}</Text>
                <Text element={{ size: "sm" }}>
                  Tier: {member.subscription_tier} — Status: {member.subscription_status}
                </Text>
                <Text element={{ size: "sm" }}>
                  Joined: {new Date(member.joined_at).toLocaleDateString()}
                </Text>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
`
}

export function renderGatedContentPage(): string {
  return `import { Input, Button, Text, Stack, Card } from "azimuth-ui";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

interface GatedContent {
  id: number;
  title: string;
  body: string;
  required_tier: string;
  is_published: boolean;
  created_at: string;
}

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ create?: string }>
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: content } = await supabase
    .from("gated_content")
    .select("*")
    .order("created_at", { ascending: false });

  const raw = (content ?? []) as GatedContent[];

  return (
    <Stack spacing="md">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Text element={{ as: "h1", size: "h3" }} weight="semibold">
          Content
        </Text>
        <a href={"/dashboard/content?create=true"}>
          <Button variant="primary" type="button">
            Add Content
          </Button>
        </a>
      </div>

      {params.create === "true" && (
        <Card>
          <form>
            <Stack spacing="sm">
              <Input label={{ text: "Title" }} name="title" required />
              <div>
                <Text element={{ size: "sm" }} weight="semibold">Body</Text>
                <textarea
                  name="body"
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "var(--azimuth-spacing-sm)",
                    border: "1px solid var(--azimuth-color-border)",
                    borderRadius: "var(--azimuth-radius-md)",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
              </div>
              <Input
                label={{ text: "Required Tier" }}
                name="required_tier"
                placeholder="free, premium, or pro"
                required
              />
              <div style={{ display: "flex", gap: "var(--azimuth-spacing-sm)" }}>
                <Button variant="primary" type="submit">Create</Button>
                <a href="/dashboard/content">
                  <Button variant="ghost" type="button">Cancel</Button>
                </a>
              </div>
            </Stack>
          </form>
        </Card>
      )}

      {raw.length === 0 ? (
        <Card>
          <Stack spacing="sm" style={{ textAlign: "center", padding: "var(--azimuth-spacing-lg)" }}>
            <Text color="secondary">No content created yet.</Text>
          </Stack>
        </Card>
      ) : (
        <Stack spacing="sm">
          {raw.map((item) => (
            <Card key={item.id}>
              <Stack spacing="xs">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Text weight="semibold">{item.title}</Text>
                  <Text element={{ size: "sm" }}>
                    {item.is_published ? "Published" : "Draft"}
                  </Text>
                </div>
                <Text element={{ size: "sm" }} color="secondary">
                  Required Tier: {item.required_tier}
                </Text>
                {item.body && (
                  <Text element={{ size: "sm" }} color="secondary">
                    {item.body.substring(0, 200)}
                    {item.body.length > 200 ? "..." : ""}
                  </Text>
                )}
                <Text element={{ size: "sm" }}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
`
}

export function renderSubscriptionApi(): string {
  return `import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: member } = await supabase
    .from("members")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  return NextResponse.json({
    id: member.id,
    subscription_tier: member.subscription_tier,
    subscription_status: member.subscription_status,
    stripe_customer_id: member.stripe_customer_id,
    joined_at: member.joined_at,
    expires_at: member.expires_at,
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { priceId: string };
  if (!body.priceId?.trim()) {
    return NextResponse.json({ error: "priceId is required" }, { status: 400 });
  }

  const { data: member } = await supabase
    .from("members")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(getEnv('STRIPE_SECRET_KEY'));

  const session = await stripe.checkout.sessions.create({
    customer: (member as { stripe_customer_id: string | null } | null)?.stripe_customer_id || undefined,
    customer_email: (member as { stripe_customer_id: string | null } | null)?.stripe_customer_id ? undefined : (user.email ?? undefined),
    mode: "subscription",
    line_items: [{ price: body.priceId, quantity: 1 }],
    success_url: new URL("/dashboard?checkout=success", request.url).toString(),
    cancel_url: new URL("/pricing?checkout=canceled", request.url).toString(),
    metadata: { userId: user.id },
  });

  return NextResponse.json({ url: session.url, sessionId: session.id });
}
`
}

export function renderPricingPage(): string {
  return `import { Text, Card, Button, Stack } from "azimuth-ui";

const TIERS = [
  { name: "Free", price: "$0", description: "Basic access", tier: "free" },
  { name: "Premium", price: "$19", description: "Full access to all content", tier: "premium" },
  { name: "Pro", price: "$49", description: "Everything plus priority support", tier: "pro" },
];

export default function HomePage() {
  return (
    <div style={{ maxWidth: 900, margin: "4rem auto", padding: "0 var(--azimuth-spacing-md)" }}>
      <Stack spacing="lg" style={{ textAlign: "center" }}>
        <Text element={{ as: "h1", size: "h1" }} weight="bold">
          Pricing
        </Text>
        <Text color="secondary" element={{ size: "lg" }}>
          Choose the plan that fits your needs.
        </Text>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "var(--azimuth-spacing-md)" }}>
          {TIERS.map((tier) => (
            <Card key={tier.tier}>
              <Stack spacing="md" style={{ textAlign: "center", padding: "var(--azimuth-spacing-lg)" }}>
                <Text element={{ as: "h2", size: "h4" }} weight="semibold">
                  {tier.name}
                </Text>
                <Text element={{ as: "p", size: "h1" }} weight="bold">
                  {tier.price}<Text element={{ size: "sm" }}>/mo</Text>
                </Text>
                <Text color="secondary">{tier.description}</Text>
                <Button variant={tier.tier === "free" ? "ghost" : "primary"} fullWidth>
                  {tier.tier === "free" ? "Get Started" : "Subscribe"}
                </Button>
              </Stack>
            </Card>
          ))}
        </div>
      </Stack>
    </div>
  );
}
`
}
