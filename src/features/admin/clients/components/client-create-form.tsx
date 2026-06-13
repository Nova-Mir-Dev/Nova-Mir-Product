import Link from 'next/link'
import { Button, Card, Input, Stack } from 'azimuth-ui'
import { createClientAction } from '../actions'

export function ClientCreateForm() {
  return (
    <Card>
      <form action={createClientAction}>
        <Stack spacing="sm">
          <Input label={{ text: 'Name' }} name="name" required />
          <Input label={{ text: 'Email' }} name="email" type="email" required />
          <Stack direction="horizontal" spacing="sm">
            <Button variant="primary" type="submit">
              Create
            </Button>
            <Link href="/admin/clients">
              <Button variant="tertiary" type="button">
                Cancel
              </Button>
            </Link>
          </Stack>
        </Stack>
      </form>
    </Card>
  )
}
