import * as Sentry from '@sentry/nextjs'
import { scrubPii } from '@/lib/sentry-scrub'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.25,
  environment: process.env.NODE_ENV,
  beforeSend: scrubPii,
})
