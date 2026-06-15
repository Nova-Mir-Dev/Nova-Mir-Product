'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ThemeProvider, Container, Text } from 'azimuth-ui'
import { APP_CONFIG, NAV_PAGES } from '@/lib/navigation'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header
      style={{
        borderBottom: '1px solid var(--azimuth-color-border)',
        background: 'var(--azimuth-color-surface)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Container
        style={{ maxWidth: 960, margin: '0 auto', padding: '0.75rem 1rem' }}
      >
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Text weight="bold" element={{ size: 'lg' }}>
              {APP_CONFIG.title}
            </Text>
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
            className="nav-toggle"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {menuOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>

          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'center',
            }}
            className="nav-links"
          >
            <div
              style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}
            >
              {NAV_PAGES.filter((p) => p.path !== '/terms').map((page) => (
                <a
                  key={page.path}
                  href={page.path}
                  style={{
                    textDecoration: 'none',
                    color: 'var(--azimuth-color-text-secondary)',
                    fontSize: '0.875rem',
                    transition: 'color 150ms ease',
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.color = 'var(--azimuth-color-text)')
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.color =
                      'var(--azimuth-color-text-secondary)')
                  }
                  onFocus={(e) =>
                    (e.currentTarget.style.color = 'var(--azimuth-color-text)')
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.color =
                      'var(--azimuth-color-text-secondary)')
                  }
                >
                  {page.label}
                </a>
              ))}
            </div>
            <a
              href="/dashboard"
              style={{
                textDecoration: 'none',
                color: 'var(--azimuth-color-text-secondary)',
                fontSize: '0.875rem',
                transition: 'color 150ms ease',
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.color = 'var(--azimuth-color-text)')
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.color =
                  'var(--azimuth-color-text-secondary)')
              }
              onFocus={(e) =>
                (e.currentTarget.style.color = 'var(--azimuth-color-text)')
              }
              onBlur={(e) =>
                (e.currentTarget.style.color =
                  'var(--azimuth-color-text-secondary)')
              }
            >
              Clients
            </a>
          </div>
        </nav>
      </Container>

      <style>{`
        @media (max-width: 640px) {
          .nav-toggle { display: block !important; }
          .nav-links {
            display: ${menuOpen ? 'flex' : 'none'} !important;
            flex-direction: column;
            padding: 1rem;
            gap: 0.75rem;
            border-top: 1px solid var(--azimuth-color-border);
          }
        }
      `}</style>
    </header>
  )
}

function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--azimuth-color-border)',
        marginTop: '4rem',
        padding: '2rem 1rem',
      }}
    >
      <Container style={{ maxWidth: 960, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <Text element={{ size: 'sm' }} color="muted">
              &copy; {new Date().getFullYear()} {APP_CONFIG.title}
            </Text>
            <Text
              element={{ size: 'xs' }}
              color="muted"
              style={{ marginTop: '0.25rem' }}
            >
              {APP_CONFIG.email}
            </Text>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a
              href="/contact"
              style={{
                fontSize: '0.875rem',
                color: 'var(--azimuth-color-text-secondary)',
                textDecoration: 'none',
              }}
            >
              Contact
            </a>
            <a
              href="/privacy"
              style={{
                fontSize: '0.875rem',
                color: 'var(--azimuth-color-text-secondary)',
                textDecoration: 'none',
              }}
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              style={{
                fontSize: '0.875rem',
                color: 'var(--azimuth-color-text-secondary)',
                textDecoration: 'none',
              }}
            >
              Terms of Service
            </a>
            <a
              href="/admin"
              style={{
                fontSize: '0.875rem',
                color: 'var(--azimuth-color-text-secondary)',
                textDecoration: 'none',
              }}
            >
              Admin
            </a>
          </div>
        </div>
      </Container>
    </footer>
  )
}

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider config={{ mode: 'system' }}>
      <div
        style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      >
        <Navbar />
        <main id="main-content" style={{ flex: 1 }}>
          {children}
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}
