import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PresetGrid from '../components/preset-grid'
import type { Preset } from '../types'

const mockPresets: Preset[] = [
  {
    id: 'saas-starter',
    name: 'SaaS Starter',
    description: 'Auth, payments, multi-tenant.',
    icon: '◎',
    popular: true,
  },
  {
    id: 'blank',
    name: 'Blank',
    description: 'Minimal Next.js scaffold.',
    icon: '◇',
    popular: false,
  },
  {
    id: 'marketing-site',
    name: 'Marketing Site',
    description: 'Public site with SEO.',
    icon: '◉',
    popular: true,
  },
]

describe('PresetGrid', () => {
  it('renders all presets', () => {
    render(<PresetGrid presets={mockPresets} selected="" onSelect={() => {}} />)

    expect(screen.getAllByText('SaaS Starter').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Blank').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Marketing Site').length).toBeGreaterThanOrEqual(
      1,
    )
  })

  it('shows section heading', () => {
    render(<PresetGrid presets={mockPresets} selected="" onSelect={() => {}} />)

    expect(screen.getAllByText('1. Choose a Preset').length).toBeGreaterThan(0)
  })

  it('renders popular badges for popular presets', () => {
    render(<PresetGrid presets={mockPresets} selected="" onSelect={() => {}} />)

    const badges = screen.getAllByText('POPULAR')
    expect(badges.length).toBeGreaterThanOrEqual(2)
  })

  it('highlights the selected preset', () => {
    render(
      <PresetGrid
        presets={mockPresets}
        selected="saas-starter"
        onSelect={() => {}}
      />,
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(3)
  })

  it('renders preset descriptions', () => {
    render(<PresetGrid presets={mockPresets} selected="" onSelect={() => {}} />)

    expect(
      screen.getAllByText('Auth, payments, multi-tenant.').length,
    ).toBeGreaterThanOrEqual(1)
    expect(
      screen.getAllByText('Minimal Next.js scaffold.').length,
    ).toBeGreaterThanOrEqual(1)
    expect(
      screen.getAllByText('Public site with SEO.').length,
    ).toBeGreaterThanOrEqual(1)
  })
})
