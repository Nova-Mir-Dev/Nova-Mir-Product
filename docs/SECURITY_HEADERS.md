# Security Headers Configuration

Your application has the following security headers configured:

## Active Headers

- [x] **Strict-Transport-Security**: max-age=31536000; includeSubDomains
- [x] **X-Frame-Options**: SAMEORIGIN
- [x] **X-Content-Type-Options**: nosniff
- [x] **Referrer-Policy**: strict-origin-when-cross-origin
- [x] **Permissions-Policy**: camera=(), microphone=(), geolocation=(), interest-cohort=()
- [x] **X-XSS-Protection**: 0
- [x] **Cross-Origin-Opener-Policy**: same-origin

- [x] **Content-Security-Policy**: Configured in next.config.ts (includes `frame-ancestors 'none'`, `form-action 'self'`, `base-uri 'self'`, `upgrade-insecure-requests`)

## Testing

- [ ] Test headers at [securityheaders.com](https://securityheaders.com)
- [ ] Verify CSP doesn't block legitimate resources in console
- [ ] Add Sentry tunnel route to CSP if using tunnelRoute
