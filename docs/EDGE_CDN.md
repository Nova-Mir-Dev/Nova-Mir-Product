# Edge CDN Configuration — cloudfront

## Setup

- [ ] Configure cloudfront distribution for your domain
- [ ] Set origin to your application URL
- [ ] Configure cache behaviors: HTML (no-cache), assets (max-age=31536000), API (no-cache)
- [ ] Enable HTTP/2 and HTTP/3
- [ ] Configure SSL/TLS certificates

## Headers

- [ ] Add security headers (HSTS, CSP, X-Frame-Options) at CDN level
- [ ] Enable Brotli and Gzip compression
- [ ] Configure CORS headers for API endpoints

## Monitoring

- [ ] Set up CDN logging
- [ ] Configure cache hit ratio alerts
- [ ] Monitor origin shield / failover
