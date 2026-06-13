import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import MonitoringPage from '../monitoring-page'
import type { MonitoringClient } from '@/features/admin/types'

const mockClients: MonitoringClient[] = [
  { id: '1', name: 'Acme Corp', status: 'healthy', project_count: 3 },
  { id: '2', name: 'Globex Inc', status: 'warning', project_count: 1 },
  { id: '3', name: 'Initech', status: 'down', project_count: 0 },
  { id: '4', name: 'Umbrella Co', status: 'healthy', project_count: 5 },
]

describe('MonitoringPage', () => {
  it('renders the heading', () => {
    render(<MonitoringPage clients={mockClients} />)
    expect(screen.getByText('Site Monitoring')).toBeDefined()
  })

  it('renders KPI card labels', () => {
    render(<MonitoringPage clients={mockClients} />)
    expect(screen.getAllByText('Total Sites').length).toBeGreaterThanOrEqual(1)
  })

  it('renders client names', () => {
    render(<MonitoringPage clients={mockClients} />)
    expect(screen.getAllByText('Acme Corp').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Globex Inc').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Initech').length).toBeGreaterThanOrEqual(1)
  })

  it('renders empty state when no clients', () => {
    render(<MonitoringPage clients={[]} />)
    expect(screen.getByText('No Clients')).toBeDefined()
  })

  it('renders status content', () => {
    render(<MonitoringPage clients={mockClients} />)
    expect(screen.getAllByText('Healthy').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Warning').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Down').length).toBeGreaterThanOrEqual(1)
  })

  it('renders project count labels', () => {
    render(<MonitoringPage clients={mockClients} />)
    expect(screen.getAllByText(/Projects:/).length).toBeGreaterThanOrEqual(1)
  })
})
