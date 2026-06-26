'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Container, Text, Button } from 'azimuth-ui'
import { ThemeToggle } from '@/components/theme-toggle'
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
        maxWidth={960}
        style={{ margin: '0 auto', padding: '0.75rem 1rem' }}
      >
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setMenuOpen(false)
          }}
        >
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Image
              src="/logo-icon.svg"
              alt=""
              width={32}
              height={32}
              style={{ display: 'block' }}
            />
            <Text weight="bold" element={{ size: 'lg' }}>
              {APP_CONFIG.title}
            </Text>
          </Link>

          <div className="nav-links">
            {NAV_PAGES.filter((p) => p.path !== '/terms').map((page) => (
              <a
                key={page.path}
                href={page.path}
                className="nav-link"
              >
                {page.label}
              </a>
            ))}
          </div>

          <div className="nav-actions">
            <ThemeToggle />
            <Button variant="secondary" size="sm" asChild>
              <Link href="/dashboard">Client Login</Link>
            </Button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
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
                aria-hidden="true"
              >
                {menuOpen ? (
                  <path d="M6 6l12 12M6 18L18 6" />
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18" />
                )}
              </svg>
            </button>
          </div>
        </nav>
      </Container>

      <style>{`
        .nav-links {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }
        .nav-link {
          text-decoration: none;
          color: var(--azimuth-color-text-secondary);
          font-size: 0.875rem;
          transition: color 150ms ease;
        }
        .nav-link:hover,
        .nav-link:focus {
          color: var(--azimuth-color-text);
        }
        .nav-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }
        .nav-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
        }

        @media (max-width: 640px) {
          nav { flex-wrap: wrap; }
          .nav-toggle { display: block !important; }
          .nav-links {
            order: 3;
            width: 100%;
            display: ${menuOpen ? 'flex' : 'none'} !important;
            flex-direction: column;
            padding: 1rem 0 0;
            gap: 0.75rem;
            border-top: 1px solid var(--azimuth-color-border);
            margin-top: 0.75rem;
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
      <Container maxWidth={960} style={{ margin: '0 auto' }}>
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
    <div
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <Navbar />
      <main id="main-content" style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
