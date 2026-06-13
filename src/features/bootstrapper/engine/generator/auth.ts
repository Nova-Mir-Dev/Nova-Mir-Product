import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'

export function generateAuthFiles(config: BootConfig): GeneratedFile[] {
  const { auth, ssoProviders, projectName: _projectName } = config

  const files: GeneratedFile[] = []

  switch (auth) {
    case 'none':
      return []

    case 'jwt': {
      const authLib: GeneratedFile = {
        path: 'lib/auth.ts',
        content: `import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

const SECRET = new TextEncoder().encode(getEnv('JWT_SECRET'))

export interface Session {
  userId: string
  email: string
  role: string
}

export async function signToken(payload: Session): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as Session
  } catch {
    return null
  }
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null
  return verifyToken(token)
}
`,
      }

      const middleware: GeneratedFile = {
        path: 'middleware.ts',
        content: `import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

const SECRET = new TextEncoder().encode(getEnv('JWT_SECRET'))
const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }
  const token = request.cookies.get('token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  try {
    await jwtVerify(token, SECRET)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|login|auth|api/auth|api/stripe|api/slack|\\.well-known).*)'],
}
`,
      }

      files.push(authLib, middleware)
      break
    }

    case 'next-auth': {
      const authLib: GeneratedFile = {
        path: 'lib/auth.ts',
        content: `import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from './db'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
${ssoProviders
  .map((p) => {
    switch (p) {
      case 'google':
        return "    Google({ clientId: getEnv('GOOGLE_CLIENT_ID'), clientSecret: getEnv('GOOGLE_CLIENT_SECRET') }),"
      case 'github':
        return "    GitHub({ clientId: getEnv('GITHUB_CLIENT_ID'), clientSecret: getEnv('GITHUB_CLIENT_SECRET') }),"
      case 'microsoft':
        return "    AzureAD({ clientId: getEnv('AZURE_AD_CLIENT_ID'), clientSecret: getEnv('AZURE_AD_CLIENT_SECRET'), tenantId: getEnv('AZURE_AD_TENANT_ID') }),"
      case 'apple':
        return "    Apple({ clientId: getEnv('APPLE_CLIENT_ID'), clientSecret: getEnv('APPLE_CLIENT_SECRET') }),"
      default:
        return ''
    }
  })
  .filter(Boolean)
  .join('\n')}
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
      }
      return session
    },
  },
})
`,
      }

      const authHandlers: GeneratedFile = {
        path: 'auth.ts',
        content: `import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers
`,
      }

      files.push(authLib, authHandlers)
      break
    }

    case 'supabase-auth': {
      const middleware: GeneratedFile = {
        path: 'middleware.ts',
        content: `import { createServerClient } from '@supabase/ssr'
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

  if (!user) {
    const url = new URL(request.url)
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', url.pathname + url.search)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|login|auth|api/auth|api/stripe|api/slack|\\.well-known).*)'],
}
`,
      }

      const supabaseLib: GeneratedFile = {
        path: 'lib/supabase.ts',
        content: `import { createClient } from '@supabase/supabase-js'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

export const supabase = createClient(
  getEnv('NEXT_PUBLIC_SUPABASE_URL'),
  getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
)
`,
      }

      const supabaseServer: GeneratedFile = {
        path: 'lib/supabase-server.ts',
        content: `import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getEnv('SUPABASE_SERVICE_ROLE_KEY'),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        },
      },
    },
  );
}
`,
      }

      files.push(middleware, supabaseLib, supabaseServer)
      break
    }

    case 'clerk': {
      const middleware: GeneratedFile = {
        path: 'middleware.ts',
        content: `import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/api/webhooks(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) await auth.protect()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|login|auth|api/auth|api/stripe|api/slack|\\.well-known).*?(?:api|trpc))?/.*'],
}
`,
      }

      const clerkLib: GeneratedFile = {
        path: 'lib/clerk.ts',
        content: `import { clerkClient } from '@clerk/nextjs/server'

export async function getUser(id: string) {
  const client = await clerkClient()
  return client.users.getUser(id)
}
`,
      }

      files.push(middleware, clerkLib)
      break
    }

    case 'auth0': {
      const auth0Lib: GeneratedFile = {
        path: 'lib/auth0.ts',
        content: `import { initAuth0 } from '@auth0/nextjs-auth0'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

export default initAuth0({
  secret: getEnv('AUTH0_SECRET'),
  issuerBaseURL: getEnv('AUTH0_ISSUER_BASE_URL'),
  baseURL: getEnv('AUTH0_BASE_URL'),
  clientID: getEnv('AUTH0_CLIENT_ID'),
  clientSecret: getEnv('AUTH0_CLIENT_SECRET'),
})
`,
      }

      files.push(auth0Lib)
      break
    }
  }

  const loginPage: GeneratedFile = {
    path: 'src/app/login/page.tsx',
    content: `import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return <LoginForm />;
}
`,
  }

  const loginForm: GeneratedFile = {
    path: 'src/features/auth/login-form.tsx',
    content: `"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Button, Card, Input, Text, Stack } from "azimuth-ui";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); return; }
    router.push("/");
  }

  return (
    <div style={{ maxWidth: 400, margin: "4rem auto" }}>
      <Card>
        <Stack spacing="md">
          <Text element={{ as: "h1", size: "h2" }} weight="bold">Sign In</Text>
          {error && <Text color="error">{error}</Text>}
          <form onSubmit={handleSubmit}>
            <Stack spacing="md">
              <Input label={{ text: "Email" }} value={{ value: email, onChange: (e) => setEmail(e.target.value) }} required />
              <Input label={{ text: "Password" }} value={{ value: password, onChange: (e) => setPassword(e.target.value) }} required />
              <Button type="submit" variant="primary" fullWidth>Sign In</Button>
            </Stack>
          </form>
        </Stack>
      </Card>
    </div>
  );
}
`,
  }

  files.push(loginPage, loginForm)
  return files
}

export function generateAuthMfa(config: BootConfig): GeneratedFile[] {
  if (!config.totpEnabled) return []
  const isSupabase = config.auth === 'supabase-auth'
  if (!isSupabase) return []

  return [
    {
      path: 'src/features/auth/mfa.ts',
      content: `"use server";

import { createClient } from "@/lib/supabase-server";

export async function enrollMfa() {
  const supabase = await createClient();
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
  const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
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
`,
    },
    {
      path: 'src/features/auth/mfa-panel.tsx',
      content: `"use client";

import { useState } from "react";
import { Button, Card, Input, Text, Stack } from "azimuth-ui";

export function MfaPanel({ factors }: { factors: { id: string; type: string; created_at: string }[] }) {
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [factorId, setFactorId] = useState("");
  const [verifyCode, setVerifyCode] = useState("");

  async function startEnroll() {
    const res = await fetch("/api/auth/mfa/enroll", { method: "POST" });
    const data = await res.json();
    if (data.qr) { setQrCode(data.qr); setFactorId(data.id); setEnrolling(true); }
  }

  async function completeEnroll() {
    await fetch("/api/auth/mfa/verify", { method: "POST", body: JSON.stringify({ factorId, code: verifyCode }) });
    setEnrolling(false);
    window.location.reload();
  }

  return (
    <Card>
      <Stack spacing="md">
        <Text element={{ as: "h2", size: "h4" }} weight="semibold">Two-Factor Authentication</Text>
        {factors.length > 0 ? (
          factors.map((f) => (
            <div key={f.id}>
              <Text element={{ size: "sm" }}>{String(f.type).toUpperCase()} — enabled {new Date(f.created_at).toLocaleDateString()}</Text>
            </div>
          ))
        ) : (
          <Text element={{ size: "sm" }} color="secondary">No 2FA methods configured.</Text>
        )}
        {enrolling ? (
          <Stack spacing="sm">
            <Text element={{ size: "xs" }}>Scan this QR code with your authenticator app, then enter the code:</Text>
            {qrCode && <img src={qrCode} alt="TOTP QR Code" style={{ width: 200 }} />}
            <Input label={{ text: "Verification Code" }} value={{ value: verifyCode, onChange: (e) => setVerifyCode(e.target.value) }} />
            <Button variant="primary" onClick={completeEnroll}>Verify & Enable</Button>
          </Stack>
        ) : (
          <Button variant="primary" onClick={startEnroll}>Enable 2FA</Button>
        )}
      </Stack>
    </Card>
  );
}
`,
    },
    {
      path: 'src/app/api/auth/mfa/enroll/route.ts',
      content: `import { NextResponse } from "next/server";
import { enrollMfa } from "@/features/auth/mfa";

export async function POST() {
  const result = await enrollMfa();
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ id: result.id, qr: result.qr, secret: result.secret });
}
`,
    },
    {
      path: 'src/app/api/auth/mfa/verify/route.ts',
      content: `import { NextResponse } from "next/server";
import { verifyMfa } from "@/features/auth/mfa";

export async function POST(request: Request) {
  const { factorId, code } = (await request.json()) as { factorId: string; code: string };
  const result = await verifyMfa(factorId, code);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ success: true });
}
`,
    },
  ]
}

export function generateAuthPasskeys(config: BootConfig): GeneratedFile[] {
  if (!config.passkeysEnabled) return []
  const isSupabase = config.auth === 'supabase-auth'
  if (!isSupabase) return []

  return [
    {
      path: 'src/features/auth/passkeys.ts',
      content: `"use client";

import { createClient } from "@/lib/supabase";

export async function registerPasskey() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUpWithPasskey();
  if (error) return { error: error.message };
  return { success: true };
}

export async function signInWithPasskey() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPasskey();
  if (error) return { error: error.message };
  return { success: true };
}
`,
    },
  ]
}

export function generateAuthRbac(config: BootConfig): GeneratedFile[] {
  const { auth } = config
  if (auth === 'none') return []

  return [
    {
      path: 'lib/roles.ts',
      content: `export type Role = "viewer" | "editor" | "admin";

export interface RolePermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
  canManageBilling: boolean;
  canViewAuditLogs: boolean;
}

export const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  viewer: {
    canRead: true,
    canWrite: false,
    canDelete: false,
    canManageUsers: false,
    canManageBilling: false,
    canViewAuditLogs: false,
  },
  editor: {
    canRead: true,
    canWrite: true,
    canDelete: false,
    canManageUsers: false,
    canManageBilling: false,
    canViewAuditLogs: false,
  },
  admin: {
    canRead: true,
    canWrite: true,
    canDelete: true,
    canManageUsers: true,
    canManageBilling: true,
    canViewAuditLogs: true,
  },
};

export function hasPermission(
  role: Role,
  permission: keyof RolePermissions,
): boolean {
  return ROLE_PERMISSIONS[role]?.[permission] ?? false;
}

export function requiresMfa(role: Role): boolean {
  return role === "admin";
}
`,
    },
  ]
}
