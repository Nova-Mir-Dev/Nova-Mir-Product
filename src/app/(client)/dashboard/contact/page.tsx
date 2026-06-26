import { Button, Card, Input, Stack, Text } from 'azimuth-ui'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { createTicket } from '../support/actions'

interface Ticket {
  id: string
  subject: string
  description: string
  status: string
  created_at: string
}

const TIER_LABELS: Record<string, string> = {
  '1': 'Standard — 24h response',
  '2': 'Priority — 4h response',
  '3': 'Enterprise — 1h response',
}

export default async function ContactPage() {
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

  return (
    <Stack spacing="lg">
      <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
        Contact & Support
      </Text>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--azimuth-space-md)',
        }}
      >
        <Card>
          <Stack spacing="sm">
            <Text element={{ size: 'sm' }} color="secondary">
              Your Tier
            </Text>
            <Text element={{ as: 'p', size: 'h4' }} weight="bold">
              Tier 1
            </Text>
            <Text element={{ size: 'sm' }} color="secondary">
              {TIER_LABELS['1']}
            </Text>
          </Stack>
        </Card>
        <Card>
          <Stack spacing="sm">
            <Text element={{ size: 'sm' }} color="secondary">
              Email
            </Text>
            <Text weight="semibold">support@novamir.dev</Text>
            <Text element={{ size: 'sm' }} color="secondary">
              Response within 24 hours
            </Text>
          </Stack>
        </Card>
        <Card>
          <Stack spacing="sm">
            <Text element={{ size: 'sm' }} color="secondary">
              Emergency Contact
            </Text>
            <Text element={{ size: 'sm' }} color="secondary">
              For urgent issues outside business hours
            </Text>
            <form>
              <Button variant="primary" type="submit" size="sm">
                Page Me
              </Button>
            </form>
          </Stack>
        </Card>
      </div>

      <Card>
        <form action={createTicket}>
          <Stack spacing="sm">
            <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
              Submit a Ticket
            </Text>
            <Input
              label={{ text: 'Subject' }}
              name="subject"
              placeholder="Brief description of the issue..."
              required
            />
            <div>
              <Text element={{ size: 'sm' }} weight="semibold">
                Priority
              </Text>
              <select
                name="priority"
                required
                style={{
                  width: '100%',
                  padding: 'var(--azimuth-space-sm)',
                  border: '1px solid var(--azimuth-color-border)',
                  borderRadius: 'var(--azimuth-radius-md)',
                  fontFamily: 'inherit',
                  backgroundColor: 'var(--azimuth-color-bg)',
                }}
              >
                <option value="low">Low</option>
                <option value="medium" selected>
                  Medium
                </option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
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
            <div>
              <Button variant="primary" type="submit">
                Submit Ticket
              </Button>
            </div>
          </Stack>
        </form>
      </Card>

      <Stack spacing="sm">
        <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
          Ticket History
        </Text>
        {raw.length === 0 ? (
          <Text color="secondary" element={{ size: 'sm' }}>
            No tickets submitted yet.
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
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor:
                          ticket.status === 'open'
                            ? 'var(--azimuth-color-warning-bg, #fff4e5)'
                            : ticket.status === 'closed'
                              ? 'var(--azimuth-color-success-bg, #e6f7e6)'
                              : 'var(--azimuth-color-bg-secondary)',
                        color:
                          ticket.status === 'open'
                            ? 'var(--azimuth-color-warning, #9a5b00)'
                            : ticket.status === 'closed'
                              ? 'var(--azimuth-color-success, #166534)'
                              : 'inherit',
                      }}
                    >
                      {ticket.status}
                    </span>
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
