---
name: Madadjeu Design System
colors:
  surface: '#fdf8f8'
  surface-dim: '#ddd9d8'
  surface-bright: '#fdf8f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3f2'
  surface-container: '#f1edec'
  surface-container-high: '#ebe7e6'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#444748'
  inverse-surface: '#313030'
  inverse-on-surface: '#f4f0ef'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#6d5b48'
  on-secondary: '#ffffff'
  secondary-container: '#f4dbc3'
  on-secondary-container: '#725f4c'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1c19'
  on-tertiary-container: '#848480'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#f7dec6'
  secondary-fixed-dim: '#dac2ab'
  on-secondary-fixed: '#26190a'
  on-secondary-fixed-variant: '#544432'
  tertiary-fixed: '#e4e2dd'
  tertiary-fixed-dim: '#c8c6c2'
  on-tertiary-fixed: '#1b1c19'
  on-tertiary-fixed-variant: '#474744'
  background: '#fdf8f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
  deep-charcoal: '#1A1A1A'
  muted-gold: '#B7A18B'
  soft-cream: '#F9F7F2'
  rich-wood: '#4A3728'
  ink-black: '#000000'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  section-gap: 120px
---

## Brand & Style

The design system is engineered to evoke the "Safe" visual identity—a traditional luxury aesthetic rooted in high-end editorial magazines. It targets a discerning international clientele seeking a sophisticated, calm, and exclusive stay at Hotel Résidence Madadjeu. 

The design style is **Minimalist Editorial**. It prioritizes generous whitespace (the "luxury of space") and high-contrast typography to create a sense of quiet authority. The interface avoids unnecessary decorative elements, allowing the high-quality photography of the residence and the precision of the grid to define the premium experience. The emotional response should be one of immediate relief and refined comfort, mirroring the physical atmosphere of a boutique hotel.

## Colors

The palette is warm, moody, and grounded, utilizing high-contrast neutrals to mimic premium print media. 

- **Primary (Deep Charcoal):** Used for all primary typography and structural borders to maintain a sharp, authoritative presence.
- **Secondary (Muted Gold):** Reserved for subtle accents, interactive states, and sophisticated highlights. It provides a warm metallic contrast to the cooler charcoals.
- **Tertiary (Soft Cream):** The primary background color. It is softer and more inviting than pure white, reducing eye strain and evoking high-quality stationery.
- **Rich Wood:** An auxiliary accent color used sparingly for depth in iconography or secondary UI elements to ground the digital experience in the hotel's physical materials.

## Typography

Typography is the cornerstone of this design system. We use a high-contrast serif for narrative elements and a functional sans-serif for utility.

- **Playfair Display (Headlines):** Used for all expressive headings. It should be set with tight leading and slight negative letter-spacing in larger sizes to mimic editorial headlines.
- **Work Sans (Body & Labels):** Provides a clean, reliable counterpoint to the serif. It ensures high legibility for multi-lingual content (FR/EN) and technical details.
- **Editorial Hierarchy:** Always prioritize the serif for room titles and welcome messaging. Use `label-caps` for secondary information like "Room Amenities" or "Location Details" to maintain a structured, organized aesthetic.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop to maintain white space "gutters" on the periphery, reinforcing the editorial feel. 

- **12-Column Grid:** Elements should span 4, 6, or 8 columns to create asymmetrical, dynamic compositions.
- **Spacious Verticals:** Use a generous `section-gap` (120px) between major content blocks to allow the eye to rest.
- **Mobile Reflow:** On mobile, the 12-column grid collapses to a single column with a 20px margin. Images should transition from landscape or square to a 4:5 vertical aspect ratio where possible to maximize screen real estate.

## Elevation & Depth

This design system eschews heavy shadows in favor of **Tonal Layers** and **Subtle Dividers**.

- **Flat Depth:** Hierarchy is created through the contrast of `Soft Cream` backgrounds and `Deep Charcoal` foregrounds. 
- **Dividers:** Use hairline borders (1px) in `Muted Gold` or a low-opacity `Deep Charcoal` to separate list items or sections.
- **Floating CTA:** The "Book Now" button is the only element allowed an elevation effect. It uses an **Ambient Shadow** (0px 4px 20px rgba(0,0,0,0.08)) to appear softly lifted above the content without breaking the minimalist aesthetic.

## Shapes

The shape language is primarily **Soft (0.25rem)**. 

- **Images:** Should remain perfectly sharp (0px) to maintain a crisp, professional architectural look.
- **UI Elements:** Buttons and form inputs use a subtle 4px radius (`rounded-sm`) to feel approachable yet precise. 
- **Pill Style:** Only use pill-shaped containers for secondary tags (e.g., "Suite," "Deluxe") or the chat bubble to distinguish them from primary structural components.

## Components

### Buttons
- **Primary:** Pill-shaped, `Deep Charcoal` background with `Soft Cream` text. No border.
- **Secondary:** Underline style. `Work Sans` Bold, all caps, with a 1px `Muted Gold` underline set 4px below the baseline.
- **Floating CTA:** A fixed pill-shaped button in the bottom right corner, utilizing the `Muted Gold` background to ensure it is the primary action.

### Room Grid
- Images should be large and full-width within their column span.
- Typography (Price and Title) should sit flush-left below the image with zero padding.

### Accordion FAQ
- Minimalist style: No container box. A single 1px divider between items.
- Use a simple `+` and `-` icon in `Muted Gold` for toggle states.

### Input Fields
- Underline style preferred over boxed inputs. 
- A 1px `Deep Charcoal` bottom border that thickens to 2px on focus.

### Concierge Chat Bubble
- A small, fixed circle in the bottom left. 
- Iconography should be thin-line (1pt stroke) to match the elegant serif aesthetic.

### Multi-lingual Toggle
- Located in the top right of the header. 
- Uses `label-caps` typography: `FR | EN`. The active language is highlighted in `Muted Gold`.
