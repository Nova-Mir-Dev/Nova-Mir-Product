export interface NavPage {
  label: string
  path: string
  icon?: string
}

export const APP_CONFIG = {
  title: 'Nova Mir',
  subtitle: 'Web development for small businesses',
  logo: '',
  navStyle: 'top-bar',
  email: 'hello@novamir.dev',
}

export const NAV_PAGES: NavPage[] = [
  {
    label: 'Home',
    path: '/',
  },
  {
    label: 'Services',
    path: '/services',
  },
  {
    label: 'Process',
    path: '/process',
  },
  {
    label: 'Portfolio',
    path: '/portfolio',
  },
  {
    label: 'Pricing',
    path: '/pricing',
  },
  {
    label: 'About',
    path: '/about',
  },
  {
    label: 'Contact',
    path: '/contact',
  },
  {
    label: 'Terms',
    path: '/terms',
  },
] as const
