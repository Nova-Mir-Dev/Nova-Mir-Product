export interface NavPage {
  label: string;
  path: string;
  icon?: string;
}

export const APP_CONFIG = {
  title: "Nova Mir",
  logo: "",
  navStyle: "top-bar",
};

export const NAV_PAGES: NavPage[] = [
  {
    "label": "Home",
    "path": "/"
  },
  {
    "label": "Services",
    "path": "/services"
  },
  {
    "label": "Process",
    "path": "/process"
  },
  {
    "label": "Portfolio",
    "path": "/portfolio"
  },
  {
    "label": "Pricing",
    "path": "/pricing"
  },
  {
    "label": "Contact",
    "path": "/contact"
  }
] as const;
