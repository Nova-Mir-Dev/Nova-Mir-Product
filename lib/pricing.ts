export interface PricingTier {
  name: string
  startingPrice: string
  description: string
  features: string[]
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Managed Website',
    startingPrice: '$1,500',
    description: 'Small businesses that need a credible online presence',
    features: [
      'Custom-designed site',
      'Mobile responsive',
      'Contact form',
      'SEO basics',
      'Analytics',
      'Hosting setup',
    ],
  },
  {
    name: 'Website + Lead System',
    startingPrice: '$3,000',
    description: 'Businesses ready to capture and track leads',
    features: [
      'Everything in Managed Website',
      'Lead capture form',
      'Email notifications',
      'CRM / spreadsheet log',
      'Confirmation messages',
      'Simple reporting',
    ],
  },
  {
    name: 'Website + Operations System',
    startingPrice: '$5,000',
    description: 'Businesses needing booking, payments, and dashboards',
    features: [
      'Everything in Website + Lead System',
      'Booking / intake workflows',
      'Payment & deposit flow',
      'Dashboard',
      'Automated follow-up',
      'System documentation',
    ],
  },
]
