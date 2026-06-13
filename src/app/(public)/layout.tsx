import { ClientShell } from './_components/client-shell'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientShell>{children}</ClientShell>
}
