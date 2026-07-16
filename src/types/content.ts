export interface PricingTierRow {
  id: string
  name: string
  slug: string
  starting_price: number
  description: string | null
  features: string[]
  founding_note: string | null
  is_featured: boolean
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface PortfolioProjectRow {
  id: string
  title: string
  slug: string
  description: string | null
  href: string | null
  thumbnail_url: string | null
  status: 'draft' | 'published'
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface NavLinkRow {
  id: string
  label: string
  path: string
  parent_id: string | null
  section: 'main' | 'footer' | 'client'
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface HeadlineRow {
  id: string
  headline: string
  subtitle: string
  cta_label: string
  cta_href: string
  industry: string | null
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface ProcessStepRow {
  id: string
  step_number: number
  title: string
  description: string
  page: string
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface TestimonialRow {
  id: string
  quote: string
  author_name: string
  author_business: string | null
  author_avatar_url: string | null
  rating: number | null
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}
