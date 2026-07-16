import { Alert, Button, Card, Stack, Text } from 'azimuth-ui'
import { requireAdmin } from '@/lib/auth-guard'
import { createServiceClient } from '@/lib/supabase-admin'
import { uploadClientDocument } from '@/features/admin/documents/actions'

interface LinkedClient {
  user_id: string
  name: string
}

interface DeliveredDoc {
  id: string
  name: string
  category: string | null
  created_at: string
}

export default async function AdminDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  await requireAdmin()
  const params = await searchParams

  const admin = createServiceClient()
  const [clientsRes, docsRes] = await Promise.all([
    admin
      .from('portfolio_clients')
      .select('user_id, name')
      .not('user_id', 'is', null)
      .order('name'),
    admin
      .from('documents')
      .select('id, name, category, created_at')
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  if (clientsRes.error || docsRes.error) {
    throw new Error('Failed to load documents data')
  }

  const clients = (clientsRes.data ?? []) as LinkedClient[]
  const recent = (docsRes.data ?? []) as DeliveredDoc[]
  const error = params.error ? decodeURIComponent(params.error) : null

  return (
    <Stack spacing="lg">
      <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
        Client Documents
      </Text>

      {params.success && (
        <Alert variant="info">Document delivered to the client.</Alert>
      )}
      {error && <Alert variant="alert">{error}</Alert>}

      <Card>
        <form action={uploadClientDocument} encType="multipart/form-data">
          <Stack spacing="sm">
            <Text weight="semibold">Deliver a document</Text>
            {clients.length === 0 ? (
              <Text element={{ size: 'sm' }} color="secondary">
                No clients have accepted an invite yet. Invite a client first so
                they have an account to receive documents.
              </Text>
            ) : (
              <>
                <div>
                  <Text element={{ size: 'sm' }}>Client</Text>
                  <select
                    name="clientUserId"
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid var(--azimuth-color-border)',
                    }}
                  >
                    <option value="">Select a client</option>
                    {clients.map((c) => (
                      <option key={c.user_id} value={c.user_id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Text element={{ size: 'sm' }}>Category (optional)</Text>
                  <select
                    name="category"
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid var(--azimuth-color-border)',
                    }}
                  >
                    <option value="">Uncategorized</option>
                    <option value="contracts">Contracts</option>
                    <option value="guides">Handoff Guides</option>
                    <option value="specs">Project Specs</option>
                    <option value="credentials">Site Credentials</option>
                  </select>
                </div>
                <input type="file" name="file" required />
                <Button variant="primary" type="submit">
                  Deliver Document
                </Button>
              </>
            )}
          </Stack>
        </form>
      </Card>

      <Stack spacing="sm">
        <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
          Recent deliveries
        </Text>
        {recent.length === 0 ? (
          <Text color="secondary">No documents delivered yet.</Text>
        ) : (
          recent.map((doc) => (
            <Card key={doc.id}>
              <Stack spacing="xs">
                <Text weight="semibold">{doc.name}</Text>
                <Text element={{ size: 'sm' }} color="secondary">
                  {doc.category ?? 'Uncategorized'} —{' '}
                  {new Date(doc.created_at).toLocaleDateString('en-US')}
                </Text>
              </Stack>
            </Card>
          ))
        )}
      </Stack>
    </Stack>
  )
}
