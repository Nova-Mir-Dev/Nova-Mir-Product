// The only routes under /clients are the auth pages (login, check-email, mfa),
// which render standalone. The client dashboard lives under (client)/dashboard
// with its own layout, so this segment just passes children through.
export default function ClientsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
