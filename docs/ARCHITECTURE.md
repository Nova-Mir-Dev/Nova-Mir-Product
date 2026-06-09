# Architecture — nova-mir-product

This project follows the co-location pattern described in AGENTS.md.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Hosting**: vercel
- **Database**: postgresql (supabase)
- **Auth**: none
- **Payments**: none
- **Monitoring**: sentry
- **Email**: none
- **File Storage**: none
- **Cache**: upstash-redis
- **Analytics**: plausible

## Directory Structure

```
src/
├── app/                    # Next.js App Router — route segments only
│   ├── layout.tsx          # Root layout (ThemeProvider, fonts, metadata)
│   ├── globals.css         # Reset + base styles
│   └── page.tsx            # Home page
├── features/               # Feature modules — self-contained
│   └── {feature}/
│       ├── types.ts        # Feature-specific types
│       ├── {feature}.tsx   # Main component
│       ├── {feature}.module.css  # Co-located styles
│       └── use-{feature}.ts  # Custom hook
└── lib/                    # Shared utilities
    ├── db.ts               # Database client
    ├── auth.ts             # Auth configuration
    └── utils.ts            # Common helpers
```

## API Routes
- No API routes configured

## Authentication Flow
No authentication configured. All routes are public.

## Data Model
- **Database**: postgresql on supabase
- **Search**: pgvector

