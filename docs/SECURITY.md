# Security Baseline

This document outlines the security baseline for nova-mir-product.

## Checklist

- [x] Authentication configured (Supabase SSR)
- [ ] MFA recommended but not enforced (MFA routes exist at `/api/auth/mfa/*`)
- [x] HTTPS enforced in production
- [x] CSP headers configured (recommended for security profile)
- [x] Environment variables never committed to repository
- [ ] API keys and secrets rotated regularly
- [x] Dependencies scanned via `npm audit` in CI
- [ ] SQL injection prevention via parameterized queries
- [x] CORS configured for allowed origins (allowlist via `CORS_ORIGINS` env var)
- [x] Rate limiting on public API endpoints
- [ ] Webhook signature verification
- [ ] File upload validation
- [ ] PCI-DSS scope minimized

## Content Security Policy

The CSP in `next.config.ts` includes `'unsafe-inline'` (required by Next.js hydration — see inline TODO about moving to nonces). The CSP also covers `frame-ancestors 'none'`, `form-action 'self'`, `base-uri 'self'`, `frame-src 'none'`, and `upgrade-insecure-requests`.

For production hardening, consider:

1. Generating nonces for inline scripts via middleware
2. Removing `'unsafe-inline'` after verifying nonce-based loading works
3. Moving theme-detection inline script to an external file loaded via Next.js `<Script>` component with nonce

## Environment Variables

All secrets and API keys are stored in environment variables. A `.env.example` file documents required values without exposing secrets. Never commit `.env` files.

## Dependency Management

Run `npm audit` regularly and keep dependencies up to date. Configure Dependabot or Renovate for automated updates.
