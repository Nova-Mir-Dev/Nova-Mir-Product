'use client'

import { ThemeToggle } from './theme-toggle'

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 12,
          right: 12,
          zIndex: 9999,
        }}
      >
        <ThemeToggle />
      </div>
      {children}
    </>
  )
}
