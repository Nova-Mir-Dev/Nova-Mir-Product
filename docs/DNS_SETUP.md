# DNS Configuration

## Required Records
- [ ] A/AAAA records pointing to your hosting provider
- [ ] CNAME for www subdomain
- [ ] TXT records for domain verification (vercel hosting)
- [ ] MX records for email (if using custom domain email)
- [ ] TXT record for SPF
- [ ] TXT record for DKIM
- [ ] TXT record for DMARC

## DNSSEC
- [ ] Enable DNSSEC if supported by your registrar

## TTL Values
- A/AAAA: 300 (5 minutes)
- CNAME: 3600 (1 hour)
- MX: 3600 (1 hour)
- TXT: 3600 (1 hour)
