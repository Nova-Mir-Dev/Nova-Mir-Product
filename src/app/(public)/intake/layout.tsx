import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Project Intake',
  description:
    'Tell Nova Mir about your project. Fill out our detailed intake form to get started.',
  robots: { index: false, follow: false },
}

export default function IntakeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
