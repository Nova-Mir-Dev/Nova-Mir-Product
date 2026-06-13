import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ConfigForm from '../components/config-form'
import type { ConfigValues } from '../types'

const defaultConfig: ConfigValues = {
  projectName: '',
  framework: 'nextjs',
  hosting: 'vercel',
  database: 'postgresql',
  auth: 'supabase-auth',
  payments: 'stripe',
}

describe('ConfigForm', () => {
  it('renders section heading', () => {
    render(
      <ConfigForm
        config={defaultConfig}
        preset="saas-starter"
        onChange={() => {}}
      />,
    )

    expect(screen.getByText('2. Configure')).toBeInTheDocument()
  })

  it('renders all field labels', () => {
    render(
      <ConfigForm
        config={defaultConfig}
        preset="saas-starter"
        onChange={() => {}}
      />,
    )

    expect(screen.getAllByText('Project Name').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Framework').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Hosting').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Database').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Auth').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Payments').length).toBeGreaterThan(0)
  })

  it('shows preset-based placeholder in project name input', () => {
    render(
      <ConfigForm
        config={defaultConfig}
        preset="marketing-site"
        onChange={() => {}}
      />,
    )

    const input = screen.getByPlaceholderText('marketing-site-app')
    expect(input).toBeInTheDocument()
  })

  it('renders inputs with correct default values', () => {
    render(
      <ConfigForm
        config={defaultConfig}
        preset="saas-starter"
        onChange={() => {}}
      />,
    )

    expect(
      screen.getAllByDisplayValue('Next.js').length,
    ).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByDisplayValue('Vercel').length).toBeGreaterThanOrEqual(
      1,
    )
    expect(
      screen.getAllByDisplayValue('PostgreSQL').length,
    ).toBeGreaterThanOrEqual(1)
    expect(
      screen.getAllByDisplayValue('Supabase Auth').length,
    ).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByDisplayValue('Stripe').length).toBeGreaterThanOrEqual(
      1,
    )
  })
})
