import { Button, Card, Stack, Text } from 'azimuth-ui'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { uploadDocument } from './actions'

interface Document {
  id: string
  name: string
  file_url: string
  uploaded_at: string
  file_type: string
  file_size: number
  status: string
  category?: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const CATEGORIES = ['contracts', 'guides', 'specs', 'credentials'] as const
const CATEGORY_LABELS: Record<string, string> = {
  contracts: 'Contracts',
  guides: 'Handoff Guides',
  specs: 'Project Specs',
  credentials: 'Site Credentials',
}

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/clients/auth/login')

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('uploaded_at', { ascending: false })

  const raw = (documents ?? []) as Document[]
  const error = params.error ? decodeURIComponent(params.error) : null

  const pendingSignatures = raw.filter((d) => d.status === 'pending')

  const categorized = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = raw.filter((d) => d.category === cat)
      return acc
    },
    {} as Record<string, Document[]>,
  )

  const uncategorized = raw.filter((d) => !d.category)

  return (
    <Stack spacing="lg">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
          Documents
        </Text>
        <form
          action={uploadDocument}
          style={{
            display: 'flex',
            gap: 'var(--azimuth-spacing-sm)',
            alignItems: 'center',
          }}
        >
          <input type="file" name="file" required />
          <Button variant="primary" type="submit">
            Upload
          </Button>
        </form>
      </div>

      {error && (
        <Card>
          <Text element={{ size: 'sm' }} color="accent">
            {error}
          </Text>
        </Card>
      )}

      {pendingSignatures.length > 0 && (
        <Stack spacing="sm">
          <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
            Pending Signature ({pendingSignatures.length})
          </Text>
          {pendingSignatures.map((doc) => (
            <Card key={doc.id}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Stack spacing="xs">
                  <Text weight="semibold">{doc.name}</Text>
                  <Text element={{ size: 'sm' }} color="secondary">
                    Awaiting your signature
                  </Text>
                </Stack>
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="primary" type="button">
                    Review & Sign
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </Stack>
      )}

      {CATEGORIES.map((cat) => {
        const docs = categorized[cat] ?? []
        if (docs.length === 0) return null
        return (
          <Stack key={cat} spacing="sm">
            <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
              {CATEGORY_LABELS[cat]}
            </Text>
            {docs.map((doc) => (
              <Card key={doc.id}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Stack spacing="xs">
                    <Text weight="semibold">{doc.name}</Text>
                    <Text element={{ size: 'sm' }} color="secondary">
                      {formatFileSize(doc.file_size)} —{' '}
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </Text>
                  </Stack>
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="tertiary" type="button">
                      Download
                    </Button>
                  </a>
                </div>
              </Card>
            ))}
          </Stack>
        )
      })}

      {uncategorized.length > 0 && (
        <Stack spacing="sm">
          <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
            All Documents
          </Text>
          {uncategorized.map((doc) => (
            <Card key={doc.id}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Stack spacing="xs">
                  <Text weight="semibold">{doc.name}</Text>
                  <Text element={{ size: 'sm' }} color="secondary">
                    {formatFileSize(doc.file_size)} —{' '}
                    {new Date(doc.uploaded_at).toLocaleDateString()}
                  </Text>
                </Stack>
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="tertiary" type="button">
                    Download
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </Stack>
      )}

      {raw.length === 0 && (
        <Card>
          <Stack
            spacing="sm"
            style={{
              textAlign: 'center',
              padding: 'var(--azimuth-spacing-lg)',
            }}
          >
            <Text color="secondary">No documents available yet.</Text>
            <Text element={{ size: 'sm' }} color="secondary">
              Upload a file above or check back once your project starts.
            </Text>
          </Stack>
        </Card>
      )}
    </Stack>
  )
}
