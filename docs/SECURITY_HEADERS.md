# Security Headers Configuration

Your application has the following security headers configured:

## Active Headers

- [x] **Strict-Transport-Security**: max-age=31536000; includeSubDomains
- [x] **X-Frame-Options**: SAMEORIGIN
- [x] **X-Content-Type-Options**: nosniff
- [x] **Referrer-Policy**: strict-origin-when-cross-origin

- [x] **Content-Security-Policy**: Configured in next.config.ts

## Testing

- [ ] Test headers at [securityheaders.com](https://securityheaders.com)
- [ ] Verify CSP doesn't block legitimate resources in console
- [ ] Add Sentry tunnel route to CSP if using tunnelRoute
