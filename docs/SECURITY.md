# Security Baseline

This document outlines the security baseline for nova-mir-product.

## Checklist

- [x] Authentication configured (none)
- [ ] MFA recommended but not enforced
- [x] HTTPS enforced in production
- [x] CSP headers configured (recommended for security profile)
- [x] Environment variables never committed to repository
- [ ] API keys and secrets rotated regularly
- [ ] Dependencies scanned via `npm audit` in CI
- [ ] SQL injection prevention via parameterized queries
- [ ] CORS configured for allowed origins
- [x] Rate limiting on public API endpoints
- [ ] Webhook signature verification
- [ ] File upload validation
- [ ] PCI-DSS scope minimized

## Content Security Policy

The generated CSP includes `'unsafe-inline'` and `'unsafe-eval'` which are required by Next.js during development (Turbopack injects inline scripts for hot module reloading). For production, harden the CSP by:

1. Generating nonces for inline scripts using Next.js `experimental.serverActions.allowedForwardedHosts` or a custom middleware
2. Removing `'unsafe-inline'` and `'unsafe-eval'` after verifying all scripts use nonces
3. Move theme-detection inline script to an external file loaded via Next.js `<Script>` component with nonce

## Environment Variables

All secrets and API keys are stored in environment variables. A `.env.example` file documents required values without exposing secrets. Never commit `.env` files.

## Dependency Management

Run `npm audit` regularly and keep dependencies up to date. Configure Dependabot or Renovate for automated updates.
