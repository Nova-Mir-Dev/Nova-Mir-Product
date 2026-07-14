---
name: Nova Mir
description: A full-stack service platform for custom websites and operations systems
colors:
  primary-teal: '#2e9e8e'
  primary-teal-hover: '#258a7c'
  accent-ember: '#e8734a'
  accent-ember-hover: '#d4623a'
  neutral-bg: '#f8f8f5'
  neutral-surface: '#fdfdfc'
  neutral-text: '#303030'
  neutral-text-secondary: '#585858'
  neutral-border: '#dededb'
  danger: '#a23a3a'
typography:
  display:
    fontFamily: 'Sora, system-ui, sans-serif'
    fontWeight: 600
    lineHeight: 1.05
  body:
    fontFamily: 'Onest, system-ui, sans-serif'
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: '4px'
  md: '8px'
  lg: '12px'
spacing:
  xs: '0.25rem'
  sm: '0.5rem'
  md: '1rem'
  lg: '1.5rem'
  xl: '2rem'
components:
  button-primary:
    backgroundColor: '{colors.primary-teal}'
    textColor: '#ffffff'
    rounded: '{rounded.md}'
    padding: '0.5rem 1.25rem'
  button-primary-hover:
    backgroundColor: '{colors.primary-teal-hover}'
  button-danger:
    backgroundColor: '{colors.danger}'
    textColor: '#ffffff'
    rounded: '{rounded.md}'
  button-tertiary:
    backgroundColor: 'transparent'
    textColor: '{colors.neutral-text}'
    rounded: '{rounded.md}'
  card:
    backgroundColor: '{colors.neutral-surface}'
    rounded: '{rounded.md}'
    padding: '{spacing.md}'
  input:
    backgroundColor: '{colors.neutral-surface}'
    borderColor: '{colors.neutral-border}'
    rounded: '{rounded.md}'
    padding: '{spacing.sm} {spacing.md}'
---

# Design System: Nova Mir

## 1. Overview

**Creative North Star: "The Studio"**

A warm, capable workspace — not a sterile dashboard, not a toy. The Studio metaphor runs through every surface: clean without being cold, crafted without being precious. Tools are organized but not cramped. Light enters generously.

This system uses **Muted Seafoam + Ember** as its color story — a cool teal (`--azimuth-color-primary`) provides confidence and stability, while a warm terracotta accent (`--azimuth-color-accent`) brings human warmth. Neutrals are tinted warm, never gray. Whites are soft, never pure `#fff`. Blacks are soft, never pure `#000`.

The system explicitly rejects the **AI chatbot wrapper** layout and the **generic SaaS admin** aesthetic. Nothing here looks templated. Every surface has intentional spacing, thoughtful hierarchy, and a human scale.

**Key Characteristics:**

- Warm-tinted neutrals replacing pure white/gray
- Cool teal primary for stability, warm terracotta accent for humanity
- Generous spacing (Azimuth `md`–`lg` as default rhythm)
- Rounded corners (8px default radius) — soft but not pill-like
- Minimal shadows — depth through tonal layering, not drop shadows
- Bespoke assembly — standard Azimuth components arranged thoughtfully, never in stock patterns

## 2. Colors: The Muted Seafoam + Ember Palette

The palette has two anchors: a cool teal that conveys capability and a warm terracotta that conveys approachability. Neutrals are tinted warm (85deg hue) so the overall feel is sunny without being yellow.

### Primary

- **Muted Seafoam** (`#2e9e8e`, oklch(50% 0.13 195deg)): The confident anchor. Used for primary buttons, active nav items, links, and anything requiring user action.
- **Muted Seafoam Hover** (`#258a7c`, oklch(45% 0.14 195deg)): Darkened for hover states on primary interactive elements.
- **Seafoam Subtle** (`#e0f0ec`, oklch(92% 0.04 195deg)): Tinted background for selected/focused states, pill backgrounds.

### Accent

- **Ember** (`#e8734a`): The warm accent. Used sparingly — badges, notifications, highlights, and small attention-seeking elements. Its rarity is the point.
- **Ember Hover** (`#d4623a`, oklch(60% 0.18 35deg)): Darkened for hover states.

### Neutral

- **Warm Paper** (`#f8f8f5`, oklch(98.5% 0.005 85deg)): Page background. Not quite white — a whisper of warmth.
- **Warm Card** (`#fdfdfc`, oklch(99% 0.003 85deg)): Surface/card background. Almost white, but warm.
- **Warm Card Hover** (`#f0f0ed`, oklch(97% 0.005 85deg)): Hover state for interactive cards and list items.
- **Soft Ink** (`#303030`, oklch(20% 0.01 85deg)): Primary text. Not pure black, very dark warm gray.
- **Soft Ink Secondary** (`#585858`, oklch(35% 0.012 85deg)): Secondary text, metadata, labels.
- **Soft Ink Muted** (`#6b6b6b`, oklch(42% 0.01 85deg)): Placeholder text, disabled states.
- **Warm Line** (`#dededb`, oklch(78% 0.008 85deg)): Borders, dividers, stroke on inputs at rest. Subtle, warm.

### Feedback

- **Success**: Soft sage green (`#2e7a2e`) on pale green tint (`#e0f0e0`)
- **Warning**: Warm amber (`#7a6e2e`) on pale gold tint (`#f5f0e0`)
- **Error**: Deep brick (`#a23a3a`) on pale rose tint (`#fae0e0`)

### Named Rules

**The Rarity Rule.** The Ember accent is used on ≤5% of any given screen. Its scarcity is what makes it work. If a screen has more than one Ember element, question whether it's necessary.

**The 85-Degree Rule.** Every neutral is tinted 85deg on the OKLCH hue axis. This is what keeps the palette warm without being beige.

## 3. Typography

**Display Font:** Sora (Google Fonts, variable weight)
**Body Font:** Onest (Google Fonts, variable weight)
**Mono Font:** `ui-monospace, 'Cascadia Code', 'Fira Code', monospace`

**Character:** Sora is geometric but warm — its open apertures and generous x-height make it readable at display sizes while staying friendly. Onest is a humanist sans that pairs naturally with Sora: rounder, softer, designed for long-form reading. Together they say "capable but approachable."

Sora is used exclusively for headings (`h1`–`h5`). Onest is used for everything else: body text, labels, inputs, navigation, tables.

### Hierarchy

- **Display** (Sora 600, clamp(2.5rem, 7vw, 4rem), 1.05): Hero headlines on the public site. Rare in the admin.
- **H1** (Sora 600, 2.5rem / 1.1): Page titles. One per page.
- **H2** (Sora 600, 2rem / 1.15): Section headings.
- **H3** (Sora 600, 1.75rem / 1.2): Card titles, panel headings.
- **H4** (Sora 600, 1.5rem / 1.25): Sub-section headings.
- **H5** (Sora 600, 1.25rem / 1.3): Small card titles, sidebar labels.
- **Body** (Onest 400, 1rem / 1.6): Default text. Max line length 70ch.
- **Body Small** (Onest 400, 0.875rem / 1.5): Secondary text, metadata.
- **Label** (Onest 500, 0.75rem / 1.4, 0.05em letter-spacing, uppercase): Form labels, nav section headers, badges.

### Named Rules

**The No-Template Rule.** Never use default browser font sizes or system font stacks. Every text element must use the defined Sora/Onest hierarchy. If it looks like unstyled HTML, it fails.

## 4. Elevation

The Studio uses **minimal elevation through tonal layering, not shadows**. Depth is conveyed by shifting the surface background color, not by casting drop shadows.

Cards and containers sit at `--azimuth-color-surface` (`#fdfdfc`) on a `--azimuth-color-bg` (`#f8f8f5`) page. The 1% lightness difference is enough to create separation without visual noise.

Shadows exist but are restrained — used only for:

- **Temporary overlays**: menus, dropdowns, tooltips
- **Floating elements**: modals, toasts, fixed headers
- **Never**: cards, containers, navigation panels

### Shadow Vocabulary

- **Menu/Dropdown** (`0 4px 16px rgba(0,0,0,0.08)`): Dropdowns, popovers, flyout menus.
- **Modal** (`0 8px 32px rgba(0,0,0,0.12)`): Dialog overlays with backdrop.
- **Toast** (`0 2px 8px rgba(0,0,0,0.06)`): Notification toasts, subtle lift.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to state (open, hover, elevated). A card should never cast a shadow in its default state.

## 5. Components

### Buttons

- **Shape:** Gently rounded corners (8px, `--azimuth-radius-md`)
- **Primary:** Muted Seafoam (`--azimuth-color-primary`) background, white text, 0.5rem 1.25rem padding. Hover: darken to `--azimuth-color-primary-hover`. Focus: blue ring (`--azimuth-color-primary-ring`). Uses `--azimuth-transition-fast` (150ms ease-out) for background.
- **Danger:** Brick (`--azimuth-color-danger`) background, white text. Same shape and padding as primary.
- **Tertiary:** Transparent background (no fill), `--azimuth-color-text` text. Hover: `--azimuth-color-surface-hover` background. Used for Cancel, Skip, secondary inline controls.
- **Ghost:** No visible container, icon-only. Used in navigation and compact controls.

### Cards

- **Corner Style:** Rounded (8px, `--azimuth-radius-md`)
- **Background:** `--azimuth-color-surface`
- **Shadow Strategy:** None by default. No shadow at rest.
- **Border:** Subtle warm line (`--azimuth-color-border`) at rest. No border when nested inside another surface.
- **Internal Padding:** `--azimuth-space-md` (1rem) default. Less for compact cards (`--azimuth-space-sm`).

### Inputs

- **Style:** Bottom-border or full stroke? Full stroke (`1px solid --azimuth-color-border`), 8px radius.
- **Background:** `--azimuth-color-surface`
- **Focus:** Border shifts to Muted Seafoam (`--azimuth-color-primary`) with 2px width. No glow, no inner shadow.
- **Error:** Border shifts to brick (`--azimuth-color-danger`).
- **Disabled:** `--azimuth-color-text-muted` text, `--azimuth-color-surface-hover` background.

### Navigation (Admin Sidebar)

- **Style:** Fixed 260px sidebar on desktop, slides in as overlay on mobile (<768px). Azimuth `Sidebar` component.
- **Items:** No icon by default. Active item uses Muted Seafoam background.
- **Sections:** Uppercase, 0.75rem, letter-spaced labels for grouped items (e.g. "Content" with children).
- **Mobile:** Hamburger button top-left, slide-in overlay with backdrop.

### Navigation (Client Portal)

- **Style:** Custom horizontal tab bar at top, with bottom tab bar on mobile.
- **Active state:** Muted Seafoam (`--azimuth-color-primary`) background on the active tab.
- **Icons:** Azimuth icon components (HomeIcon, CreditCardIcon, etc.)

### DataTable

- **Style:** Borderless rows with subtle `--azimuth-color-surface-hover` on hover.
- **Header:** Semibold `--azimuth-color-text-secondary` labels, uppercase, small size.
- **Empty State:** Azimuth `EmptyState` component centered in the card.

### Chips / Badges

- **Style:** Very small (0.75rem), semibold, colored background matching semantic role.
- **Variants:** status badges (paid=green, overdue=red, pending=amber)

## 6. Do's and Don'ts

### Do:

- **Do** use warm-tinted neutrals for all backgrounds. Never use pure `#fff` or `#000`.
- **Do** space generously — `--azimuth-space-md` (1rem) is the minimum comfortable gap between related elements.
- **Do** use the Sora/Onest pairing consistently: Sora for headings only, Onest for everything else.
- **Do** use the Muted Seafoam primary sparingly in content areas — it's for interactive elements, not decoration.
- **Do** prefer inline actions (inline edit, inline expand) over modals. Modals interrupt.
- **Do** use `role="status"` and `aria-live` for all dynamic content updates.

### Don't:

- **Don't** use the AI chatbot wrapper layout (left-chat-right-panel). The Studio is a workspace, not a conversation.
- **Don't** use pure black or pure white anywhere. Always soften through the warm neutral palette.
- **Don't** add shadows to cards or containers. Flat surfaces with tonal separation.
- **Don't** overuse the Ember accent. The Rarity Rule: one Ember element per screen max.
- **Don't** use gradient text or glassmorphism — decorative effects that undermine the Studio's honest craft.
- **Don't** use side-stripe borders (border-left > 1px as an accent). Use full borders or background tints.
- **Don't** use the hero-metric template (big number, small label, gradient). Data earns its presentation through context.
- **Don't** stack identical cards (icon + heading + text, repeated). Vary layout and hierarchy.
- **Don't** skip focus-visible outlines. All interactive elements need a 2px `--azimuth-color-primary` focus ring.
