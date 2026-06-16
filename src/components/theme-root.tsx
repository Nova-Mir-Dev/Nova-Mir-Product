'use client'

import { ThemeProvider } from 'azimuth-ui'

export function ThemeRoot({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider config={{ mode: 'system' }}>
      {children}
    </ThemeProvider>
  )
}
