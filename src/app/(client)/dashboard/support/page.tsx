import { Button, Card, Input, Stack, Text } from 'azimuth-ui'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { createTicket } from './actions'

const FAQ_ITEMS = [
  {
    question: 'How do I reset my password?',
    answer:
      "Go to the login page and click 'Forgot password'. A reset link will be sent to your email.",
  },
  {
    question: 'How do I update my profile?',
    answer:
      'Your profile information can be updated in the account settings section.',
  },
  {
    question: 'Who do I contact for billing issues?',
    answer:
      "Please submit a support ticket with 'Billing' in the subject line, and our team will get back to you within 24 hours.",
  },
]

interface Ticket {
  id: string
  subject: string
  description: string
  status: string
  created_at: string
}

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ create?: string; error?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/clients/auth/login')

  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const raw = (tickets ?? []) as Ticket[]
  const error = params.error ? decodeURIComponent(params.error) : null

  return (
    <Stack spacing="md">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
          Support
        </Text>
        <a href={'/dashboard/support?create=true'}>
          <Button variant="primary" type="button">
            Submit Ticket
          </Button>
        </a>
      </div>

      {error && (
        <Card>
          <Text element={{ size: 'sm' }} color="accent">
            {error}
          </Text>
        </Card>
      )}

      {params.create === 'true' && (
        <Card>
          <form action={createTicket}>
            <Stack spacing="sm">
              <Text weight="semibold">Submit a Support Ticket</Text>
              <Input
                label={{ text: 'Subject' }}
                name="subject"
                placeholder="Brief description of the issue..."
                required
              />
              <div>
                <Text element={{ size: 'sm' }} weight="semibold">
                  Message
                </Text>
                <textarea
                  name="message"
                  placeholder="Describe your issue in detail..."
                  rows={4}
                  required
                  style={{
                    width: '100%',
                    padding: 'var(--azimuth-space-sm)',
                    border: '1px solid var(--azimuth-color-border)',
                    borderRadius: 'var(--azimuth-radius-md)',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 'var(--azimuth-space-sm)' }}>
                <Button variant="primary" type="submit">
                  Submit
                </Button>
                <a href="/dashboard/support">
                  <Button variant="tertiary" type="button">
                    Cancel
                  </Button>
                </a>
              </div>
            </Stack>
          </form>
        </Card>
      )}

      <Card>
        <Stack spacing="sm">
          <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
            Contact Information
          </Text>
          <Text element={{ size: 'sm' }}>
            Email: support@nova-mir-clients.com
          </Text>
          <Text element={{ size: 'sm' }}>Response time: Within 24 hours</Text>
        </Stack>
      </Card>

      <Card>
        <Stack spacing="sm">
          <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
            Frequently Asked Questions
          </Text>
          {FAQ_ITEMS.map((item, index) => (
            <details key={index}>
              <summary
                style={{
                  cursor: 'pointer',
                  padding: 'var(--azimuth-space-sm) 0',
                }}
              >
                <Text weight="semibold">{item.question}</Text>
              </summary>
              <Text
                element={{ size: 'sm' }}
                color="secondary"
                style={{
                  padding: '0 var(--azimuth-space-md) var(--azimuth-space-sm)',
                }}
              >
                {item.answer}
              </Text>
            </details>
          ))}
        </Stack>
      </Card>

      <Stack spacing="sm">
        <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
          My Tickets
        </Text>
        {raw.length === 0 ? (
          <Text color="secondary" element={{ size: 'sm' }}>
            No support tickets submitted yet.
          </Text>
        ) : (
          <Stack spacing="xs">
            {raw.map((ticket) => (
              <Card key={ticket.id}>
                <Stack spacing="xs">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text weight="semibold">{ticket.subject}</Text>
                    <Text element={{ size: 'sm' }} color="secondary">
                      {ticket.status}
                    </Text>
                  </div>
                  <Text element={{ size: 'sm' }} color="secondary">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </Text>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </Stack>
  )
}
