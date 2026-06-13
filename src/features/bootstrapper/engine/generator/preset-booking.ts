import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'

const DASHBOARD_LAYOUT = `import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Text, Stack } from 'azimuth-ui';

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const nav = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/appointments', label: 'Appointments' },
    { href: '/dashboard/settings', label: 'Settings' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{ width: 240, borderRight: '1px solid var(--azimuth-color-border)', padding: 'var(--azimuth-spacing-md)' }}>
        <Text weight="semibold" element={{ size: "lg" }} style={{ marginBottom: 'var(--azimuth-spacing-md)' }}>Booking Admin</Text>
        <Stack spacing="sm">
          {nav.map((item) => (
            <Link key={item.href} href={item.href}>
              <Text>{item.label}</Text>
            </Link>
          ))}
        </Stack>
      </nav>
      <main style={{ flex: 1, padding: 'var(--azimuth-spacing-lg)' }}>{children}</main>
    </div>
  );
}`

const APPOINTMENTS_PAGE = `import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Text, Stack, Card } from 'azimuth-ui';

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

export default async function AppointmentsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
  const params = await searchParams;
  const status = params.status || 'upcoming';
  const { data: appointments } = await supabase.from('appointments').select('*, services(name)').eq('status', status).order('start_time', { ascending: true });
  return (
    <Stack spacing="lg">
      <Text element={{ as: "h1", size: "h1" }} weight="bold">Appointments</Text>
      {!appointments?.length ? (
        <Card style={{ padding: 'var(--azimuth-spacing-lg)', textAlign: 'center' }}>
          <Text color="secondary">No ' + status + ' appointments.</Text>
        </Card>
      ) : (
        <Stack spacing="sm">
          {appointments.map((a) => (
            <Card key={a.id}>
              <Stack spacing="sm">
                <Text weight="semibold">{a.services?.name || 'Service'}</Text>
                <Text element={{ size: "sm" }} color="secondary">{new Date(a.start_time).toLocaleString()}</Text>
                <Text element={{ size: "xs" }} color="muted">Status: {a.status}</Text>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}`

const LANDING_PAGE = `import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Text, Button, Stack, Card, Grid } from 'azimuth-ui';

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
  const { data: services } = await supabase.from('services').select('*').eq('is_active', true);
  return (
    <Stack spacing="lg" style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--azimuth-spacing-xl)' }}>
      <Stack spacing="sm" style={{ textAlign: 'center' }}>
        <Text element={{ as: "h1", size: "h1" }} weight="bold">Book a Service</Text>
        <Text color="secondary">Choose a service and pick a time that works for you.</Text>
      </Stack>
      {!services?.length ? (
        <Card style={{ padding: 'var(--azimuth-spacing-lg)', textAlign: 'center' }}>
          <Text color="secondary">No services available yet.</Text>
        </Card>
      ) : (
        <Grid cols={2} gap="md">
          {services.map((s) => (
            <Card key={s.id}>
              <Stack spacing="sm">
                <Text weight="semibold">{s.name}</Text>
                <Text element={{ size: "sm" }} color="secondary">{s.description}</Text>
                <Text weight="bold">{s.duration_minutes} min{s.price_cents ? ' - $' + (s.price_cents / 100).toFixed(2) : ''}</Text>
              </Stack>
            </Card>
          ))}
        </Grid>
      )}
    </Stack>
  );
}`

const BOOKING_API = `import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get('service');
  const date = searchParams.get('date');
  const cookieStore = await cookies();
  const supabase = createServerClient(
    getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
  let query = supabase.from('appointments').select('*');
  if (serviceId) query = query.eq('service_id', parseInt(serviceId));
  if (date) { const d = new Date(date); query = query.gte('start_time', d.toISOString()).lt('start_time', new Date(d.getTime() + 86400000).toISOString()); }
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { service_id, start_time, client_name, client_email } = body;
  if (!service_id || !start_time || !client_name || !client_email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const cookieStore = await cookies();
  const supabase = createServerClient(
    getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
  const end_time = new Date(new Date(start_time).getTime() + 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase.from('appointments').insert({ service_id: parseInt(service_id), start_time, end_time, status: 'pending', client_name, client_email }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}`

export function generateBookingFiles(config: BootConfig): GeneratedFile[] {
  if (config.preset !== 'booking-site') return []

  return [
    { path: 'src/app/dashboard/layout.tsx', content: DASHBOARD_LAYOUT },
    {
      path: 'src/app/dashboard/appointments/page.tsx',
      content: APPOINTMENTS_PAGE,
    },
    { path: 'src/app/page.tsx', content: LANDING_PAGE },
    { path: 'src/app/api/bookings/route.ts', content: BOOKING_API },
  ]
}
