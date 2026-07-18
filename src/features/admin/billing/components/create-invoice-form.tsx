import Link from 'next/link'
import { Button, Card, Input, Stack } from 'azimuth-ui'
import { createInvoice } from '../actions'
import styles from '../billing-page.module.css'

export function CreateInvoiceForm() {
  return (
    <Card>
      <form action={createInvoice}>
        <Stack spacing="sm">
          <Input label={{ text: 'Client Name' }} name="clientName" required />
          <Input label={{ text: 'Description' }} name="description" />
          <Input
            label={{ text: 'Unit Price ($)' }}
            name="unitPrice"
            type="number"
          />
          <Input
            label={{ text: 'Quantity' }}
            name="quantity"
            type="number"
            defaultValue="1"
          />
          <div className={styles.formActions}>
            <Button variant="primary" type="submit">
              Create
            </Button>
            <Link href="/admin/billing">
              <Button variant="tertiary" type="button">
                Cancel
              </Button>
            </Link>
          </div>
        </Stack>
      </form>
    </Card>
  )
}
