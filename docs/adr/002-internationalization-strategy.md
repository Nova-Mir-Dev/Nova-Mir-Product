# ADR-002: Internationalization Strategy

- **Status**: Accepted
- **Date**: 2026-06-25
- **Context**: The project needs i18n for target markets (ca, us, eu, uk, mx, au). Spanish
  (mx) is the immediate non-English priority. The App Router has established patterns for i18n
  using `[locale]` path segments, but restructuring all existing routes into `[locale]/` groups
  would touch every file in the project.
- **Decision**: Use `next-intl` without routing (not `next-intl/plugin` routing). Locale is
  detected from a cookie (set by a locale switcher), falling back to `Accept-Language` header,
  then to `'en'`. The locale is whitelisted to `['en', 'es']`. `NextIntlClientProvider` is
  added to the root layout. This avoids restructuring all existing routes into `[locale]` groups.
- **Consequences**:
  - Positive: No route restructuring. SEO-friendly with `hreflang` added manually in metadata.
  - Negative: No locale-based URL segments for SEO signalling. Must manually wire `hreflang` alternates.
  - Mitigation: Use `generateMetadata` in public pages to emit `<link rel="alternate">` tags.
  - Migration path: If locale-path-based routing becomes necessary, wrap routes in `[locale]`
    group at that point — the `i18n/request.ts` path needs no change.
