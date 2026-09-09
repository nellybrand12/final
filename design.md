# Design System & Color Tokens: Hôtel Résidence Madadjeu

This document defines the official design tokens and color system for the Hôtel Résidence Madadjeu application across both **Light** and **Dark** modes.

> **Hard Constraint**: All UI colors must reference tokens defined in this document. No arbitrary or unlisted hex values may be introduced into components. Every dark-mode adaptation is a color-only swap that preserves 100% of the site's layout, spacing, typography scale, borders width, shadows, and component structure.

---

## 1. Surfaces Hierarchy

| Token Name | Light Theme Value | Dark Theme Value | Usage Description |
|---|---|---|---|
| `--color-surface` | `#fdf8f8` | `#121111` | Main page background (public site & app backdrop) |
| `--color-surface-dim` | `#ddd9d8` | `#0e0d0d` | Recessed/subdued background areas |
| `--color-surface-bright` | `#fdf8f8` | `#201f1f` | Elevated surface highlight |
| `--color-surface-container-lowest` | `#ffffff` | `#161515` | Lowest elevation cards, main content panels, tables |
| `--color-surface-container-low` | `#f7f3f2` | `#1c1b1b` | Secondary content cards, side panels, nested blocks |
| `--color-surface-container` | `#f1edec` | `#222121` | Input field backgrounds, interactive item wells |
| `--color-surface-container-high` | `#ebe7e6` | `#292828` | Hover states, interactive pill badges |
| `--color-surface-container-highest` | `#e5e2e1` | `#302f2f` | Active states, emphasized control surfaces |

---

## 2. Content & Typography Tokens

| Token Name | Light Theme Value | Dark Theme Value | Usage Description |
|---|---|---|---|
| `--color-on-surface` | `#1c1b1b` | `#f7f3f2` | Primary body text, headings, prominent typography |
| `--color-on-surface-variant` | `#444748` | `#b5b1ae` | Secondary text, subtitles, captions, placeholder labels |
| `--color-deep-charcoal` | `#1a1a1a` | `#1a1a1a` (inverted via `dark:text-soft-cream`) | Classic dark charcoal typography, inverted to soft-cream in dark theme |
| `--color-soft-cream` | `#f9f7f2` | `#f9f7f2` | Warm off-white for luxury accents, dark mode heading contrast |
| `--color-ink-black` | `#000000` | `#000000` | Deepest absolute black for luxury overlays |

---

## 3. Borders & Outline Tokens

| Token Name | Light Theme Value | Dark Theme Value | Usage Description |
|---|---|---|---|
| `--color-outline` | `#747878` | `#8e8b8a` | Prominent structural borders and dividers |
| `--color-outline-variant` | `#c4c7c7` | `#3d3b3a` | Subtle hairline dividers, card borders, nested frames |

---

## 4. Brand Accent Identity

The brand identity rests on two core pillars: **Golden-Brown** and **Maroon/Burgundy**.

### Golden-Brown Palette
Used for luxury framing, CTA buttons, stars, section badges, and active indicators.

| Token Name | Light Theme Value | Dark Theme Value | Notes & Accessibility |
|---|---|---|---|
| `--color-muted-gold` | `#b7a18b` | `#b7a18b` | Base muted champagne gold; contrast > 8.0:1 on `#121111` |
| `--color-muted-gold-dark` | `#d4c2b0` | `#d4c2b0` | Elevated high-luminance gold for fine borders and active states |
| `--color-golden-brown` | `#8c7653` | `#8c7653` | Medium warm golden-brown for tertiary accents |
| `--color-golden-brown-dark` | `#c5a880` | `#c5a880` | Soft golden-brown accent with enhanced contrast |
| `--color-secondary` | `#6d5b48` | `#6d5b48` | Deep bronze/golden-brown |

### Maroon / Burgundy Palette
Used for brand icons, event hall badges, section markers, and active filters.

| Token Name | Light Theme Value | Dark Theme Value | Notes & Accessibility |
|---|---|---|---|
| `--color-brand-maroon` / `--color-brand-burgundy` | `#6B1D2F` | `#6B1D2F` | Light mode rich cabernet/burgundy base (`hsl(346, 57%, 27%)`) |
| `--color-brand-maroon-dark` / `--color-brand-burgundy-dark` | `#B83D52` | `#B83D52` | Dark mode garnet maroon (`hsl(350, 50%, 48%)`); contrast ratio 3.41:1 against `#121212`, 3.17:1 against `#1a1a1a`. Stays firmly in the deep wine spectrum without shifting to pink. |

---

## 5. Administrative Dashboard Tokens

To ensure admin pages (CRUD, tables, forms, filters, modals) never break in dark mode:

| Component Role | Light Theme Class / Value | Dark Theme Class / Value |
|---|---|---|
| Dashboard Backdrop | `bg-gray-50` (`#f9fafb`) | `dark:bg-neutral-950` (`#0f0f0f`) |
| Sidebar & Top Header | `bg-white` (`#ffffff`) | `dark:bg-neutral-900` (`#171717`) |
| Admin Panels & Cards | `bg-white` (`#ffffff`) | `dark:bg-neutral-900` (`#171717`) |
| Structural Borders | `border-gray-200` (`#e5e7eb`) | `dark:border-neutral-800` (`#262626`) |
| Subtle Borders | `border-gray-100` (`#f3f4f6`) | `dark:border-neutral-800/80` |
| Text Primary | `text-gray-900` (`#111827`) | `dark:text-neutral-100` (`#f5f5f5`) |
| Text Secondary / Muted | `text-gray-500` / `text-gray-600` | `dark:text-neutral-400` (`#a3a3a3`) |
| Text Subtle | `text-gray-400` | `dark:text-neutral-500` (`#737373`) |
| Form Inputs & Selects | `bg-white border-gray-300` | `dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100` |
| Table Headers (`thead`) | `bg-gray-50 text-gray-500` | `dark:bg-neutral-800/60 dark:text-neutral-400` |
| Table Dividers | `divide-gray-200` | `dark:divide-neutral-800` |
| Nav Item Active | `bg-gray-100 text-deep-charcoal` | `dark:bg-neutral-800 dark:text-white` |
| Nav Item Hover | `hover:bg-gray-50 hover:text-gray-900` | `hover:dark:bg-neutral-800/60 hover:dark:text-white` |
| Primary Admin Action | `bg-deep-charcoal text-white hover:bg-black` | `dark:bg-muted-gold dark:text-deep-charcoal hover:dark:bg-soft-cream` |

---

## 6. Status Badges & Alerts

| State | Light Theme Colors | Dark Theme Colors |
|---|---|---|
| **Confirmed / Paid** | `bg-green-100 text-green-800 border-green-200` | `dark:bg-green-950/70 dark:text-green-300 dark:border-green-800/50` |
| **Pending / Action Required** | `bg-yellow-100 text-yellow-800 border-yellow-200` | `dark:bg-yellow-950/70 dark:text-yellow-300 dark:border-yellow-800/50` |
| **Cancelled / Failed / Error** | `bg-red-100 text-red-800 border-red-200` | `dark:bg-red-950/70 dark:text-red-300 dark:border-red-800/50` |
