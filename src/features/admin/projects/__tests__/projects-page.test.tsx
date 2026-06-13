import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ProjectsPage, ProjectsPageSkeleton } from '../projects-page'
import type { Project } from '@/features/admin/types'

const mockProjects: Project[] = [
  {
    id: '1',
    client_id: 'c1',
    name: 'Website Redesign',
    description: 'Full redesign',
    status: 'active',
    deadline: '2025-06-01',
    progress: 45,
    created_at: '2025-01-01',
  },
]

describe('ProjectsPage', () => {
  it('renders heading', () => {
    const { getByText } = render(<ProjectsPage projects={[]} />)
    expect(getByText('Projects')).toBeDefined()
  })

  it('shows empty state when no projects', () => {
    const { getAllByText } = render(<ProjectsPage projects={[]} />)
    expect(getAllByText('No projects found').length).toBeGreaterThan(0)
  })

  it('renders project data', () => {
    const { getByText } = render(<ProjectsPage projects={mockProjects} />)
    expect(getByText('Website Redesign')).toBeDefined()
    expect(getByText('active')).toBeDefined()
  })

  it('renders skeleton', () => {
    const { container } = render(<ProjectsPageSkeleton />)
    expect(
      container.querySelectorAll('[class*="skeleton"]').length,
    ).toBeGreaterThan(0)
  })
})
