import { Stack, Text } from 'azimuth-ui'
import { ClientList } from './components/client-list'
import { ClientCreateForm } from './components/client-create-form'
import type { PortfolioClient } from '@/features/admin/types'

interface ClientsPageProps {
  clients: PortfolioClient[]
  searchParams: {
    q?: string
    create?: string
    page?: string
    pageSize?: string
  }
  pagination: { page: number; totalPages: number }
}

export function ClientsPage({
  clients,
  searchParams,
  pagination,
}: ClientsPageProps) {
  return (
    <Stack spacing="md">
      <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
        Client Management
      </Text>

      {searchParams.create === 'true' && <ClientCreateForm />}

      <ClientList
        clients={clients}
        searchQuery={searchParams.q}
        pagination={pagination}
      />
    </Stack>
  )
}
