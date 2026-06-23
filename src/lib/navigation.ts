export interface NavPage {
  path: string
  label: string
}

export const APP_CONFIG = {
  title: 'Nova Mir',
  email: 'hello@novamir.dev',
  description: 'Web development studio building sites that bring in customers.',
}

export const NAV_PAGES: NavPage[] = [
  { path: '/', label: 'Home' },
  { path: '/services', label: 'Services' },
  { path: '/process', label: 'Process' },
  { path: '/portfolio', label: 'Portfolio' },
  { path: '/pricing', label: 'Pricing' },
  { path: '/contact', label: 'Contact' },
]
