# Spec: Landing Page Redesign

## Objective

Redesign novamir.dev landing page (/) to convert visitors into leads. Use sales psychology (Cialdini principles, anchoring, loss aversion) and clear copy that works across industries — no niche lock-in.

## Tone

Direct, warm, no jargon. "You"-focused, not "we"-focused. Short sentences. Industry-neutral examples. Confident but not arrogant.

## Layout (top to bottom)

### 1. Hero Section (Problem-First)

- **Headline**: Problem-focused, loss aversion framing
  - Example: "Your website should be bringing in customers — not collecting dust."
  - Alternative: "Turn your website into a lead-generating machine."
- **Subhead**: Transformation + flexibility signal
  - "Whether you run a law firm, a gym, or a plumbing business — we build websites and systems that bring in customers and save you time."
- **CTAs**: "Get Started" (primary) → /contact, "See How It Works" (secondary) → /process
- **Psychology**: Loss aversion (current site is losing leads), Authority (structured offering), Reciprocity (free consultation implied)

### 2. Services Section (Midrange Featured)

- Three tier cards in a row
- **Middle card featured / larger / "Most Popular" badge**
- Tier 1: Managed Website — $1,000–$2,500
- Tier 2: Website + Lead System — $1,500–$4,500 (MOST POPULAR)
- Tier 3: Website + Operations — $3,000–$10,000+
- Each card: title, price range, 3-4 bullet features, "Learn More" link
- **Psychology**: Decoy effect (3 tiers makes middle feel safe), Anchoring (range implies value)

### 3. Process Section (How It Works)

- 3 steps: Discovery → Build → Launch
- Each step: number, title, 1-sentence description
- Clean, minimal — already exists, just polish copy
- **Psychology**: Authority (structured process), Commitment (visualizing the journey)

### 4. Portfolio / Work Samples

- Grid of project cards (thumbnail, title, brief result)
- Current pilot website as first entry
- Placeholder cards for future work: "More coming soon"
- "View All Work" link → /portfolio
- **Psychology**: Social proof (shows real work builds trust)

### 5. Pricing Summary

- Compact version of the tiers (no bullets, just title + range + one-liner)
- "Most Popular" badge on middle tier
- "See Full Pricing" link → /pricing
- **Psychology**: Repetition reinforces, Framing (investment language)

### 6. Testimonials Placeholder

- "Trusted by businesses like yours" heading
- 2-3 testimonial card outlines with "Coming soon" overlay
- Or: industry icons/logos as placeholder social proof
- **Psychology**: Anticipatory social proof, Liking (shows real people)

### 7. Bottom CTA

- "Ready to get started?"
- "Tell me about your project and I'll follow up within 1-2 business days."
- "Start Your Project" button → /contact
- **Psychology**: Commitment (final ask after building value), Scarcity (implied availability)

## Technical Notes

- Responsive (mobile-first, works on all screen sizes)
- Uses azimuth-ui components (Button, Card, Container, Stack, Text)
- CSS variables from azimuth theme (--azimuth-color-\*)
- Keep existing layout.tsx and navigation
- No new dependencies

## Open Questions

- Portfolio: Should we show the pilot project live, or wait until it's more complete?
- Pricing: Exact starting numbers for each tier on the landing page?
- Testimonials: Just hide the section until we have real ones, or show placeholder?
