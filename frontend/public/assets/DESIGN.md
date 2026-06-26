---
name: Stiqr Precision
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3e4944'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6e7a74'
  outline-variant: '#bdc9c2'
  surface-tint: '#006c53'
  primary: '#006c53'
  on-primary: '#ffffff'
  primary-container: '#4db695'
  on-primary-container: '#004333'
  inverse-primary: '#72d9b6'
  secondary: '#4d5f80'
  on-secondary: '#ffffff'
  secondary-container: '#c6d7ff'
  on-secondary-container: '#4c5d7f'
  tertiary: '#006c4b'
  on-tertiary: '#ffffff'
  tertiary-container: '#56b68c'
  on-tertiary-container: '#00442d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#8ef6d2'
  primary-fixed-dim: '#72d9b6'
  on-primary-fixed: '#002117'
  on-primary-fixed-variant: '#00513e'
  secondary-fixed: '#d7e2ff'
  secondary-fixed-dim: '#b5c7ed'
  on-secondary-fixed: '#061b39'
  on-secondary-fixed-variant: '#354767'
  tertiary-fixed: '#96f6c8'
  tertiary-fixed-dim: '#7ad9ad'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
  action-gold: '#F3B036'
  surface-dark: '#1E304F'
  stiqr-teal: '#4DB695'
  success-emerald: '#007954'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Nunito Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Nunito Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Nunito Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style

The design system is built for a tech-forward QR code platform that bridges the gap between physical touchpoints and digital experiences. The brand personality is **precise, reliable, and frictionless**. It avoids unnecessary ornamentation in favor of high-utility layouts and a professional, corporate aesthetic.

The visual style is **Corporate / Modern** with a lean towards **Precision Minimalism**. It utilizes a systematic approach to whitespace and information density, ensuring that technical data (like QR metrics) is easily digestible. The emotional response should be one of "effortless control"—where the user feels the platform is an invisible, yet powerful, engine for their connectivity needs.

## Colors

The palette is anchored by **Stiqr Teal**, a vibrant yet professional hue that signals growth and digital connectivity. 

- **Primary (#4DB695):** Used for primary actions, success states, and brand-defining accents.
- **Secondary (#1E304F):** A deep navy used for high-level navigation, headers, and text to provide a grounded, institutional feel.
- **Tertiary (#007954):** Reserved for emphasis and interactive states where a higher contrast against white is required.
- **Action Gold (#F3B036):** An accent color used sparingly for attention-grabbing notifications or "Pro" tier features.
- **Neutral System:** The design system relies on a cool-toned neutral palette for backgrounds and borders to maintain a "clean-room" tech aesthetic.

## Typography

This design system uses a dual-font approach to balance character with readability. 

**Hanken Grotesk** is used for headlines and UI labels. Its sharp, contemporary geometry reinforces the "tech-forward" positioning. **Nunito Sans** is used for all body text and descriptions, providing a soft, highly readable experience that keeps the platform approachable.

For mobile layouts, headline sizes scale down to prevent excessive line-breaking, while body text maintains its scale to ensure accessibility.

## Layout & Spacing

The design system utilizes a **12-column fluid grid** for desktop and a **4-column grid** for mobile. 

A strict 8px spacing scale (Base 8) governs all dimensions. This mathematical rhythm ensures visual consistency across complex dashboard views. 
- **Sections:** Large-scale separation uses 80px or 120px vertical padding.
- **Component Padding:** Internal padding for cards and inputs should follow the `16px (2x)` or `24px (3x)` increments.
- **Reflow:** On tablet devices, the 12-column grid collapses to 8 columns, and side margins reduce to 40px.

## Elevation & Depth

To maintain a professional and "flat-plus" aesthetic, elevation is communicated through **Tonal Layers** and **Low-contrast outlines**. 

- **Surface Levels:** The primary background is `#F8FAFC`. Elements like cards and input fields sit on top of this surface using a pure white (`#FFFFFF`) fill.
- **Borders:** Instead of heavy shadows, use a 1px border in a light neutral (`#E2E8F0`) to define boundaries.
- **Subtle Elevation:** For interactive elements like "Hovered Cards," apply an ambient shadow: `0 4px 12px rgba(30, 48, 79, 0.05)`. This adds depth without cluttering the UI.
- **Focus States:** Active inputs or focused buttons use a 2px outer glow in the Primary color with 20% opacity.

## Shapes

The shape language is **Rounded**, reflecting a modern software-as-a-service feel. 

Standard components (buttons, inputs, cards) use a `0.5rem (8px)` corner radius. This is soft enough to feel approachable but sharp enough to remain professional. Interactive elements that require high distinction, such as tags or status chips, can utilize a "Pill" shape (fully rounded) to contrast against the structural rectangularity of the layout.

## Components

### Buttons
- **Primary:** Solid `#4DB695` with white text. High-priority CTAs only.
- **Secondary:** Solid `#1E304F` with white text. Used for secondary navigation or header actions.
- **Ghost:** Border-only (`1px #4DB695`) with teal text for low-priority actions.

### Feature Cards
Feature cards use a white background, the standard 8px rounded corners, and a 1px neutral border. They should feature a 48px icon in the Primary or Tertiary color at the top-left to guide the eye.

### Input Fields
Inputs must have a clear label using `label-md`. The field itself has a 1px border that shifts from neutral to Primary on focus. Use placeholder text in a light gray to maintain the clean aesthetic.

### QR Preview Container
A specialized component for this design system. It features a centered, high-contrast QR code within a `rounded-lg` white container, surrounded by a subtle Primary-colored halo to denote the "Active" state of the generated code.

### Status Chips
Small, pill-shaped indicators for "Active," "Paused," or "Draft" states. Use low-saturation background tints of the status color (e.g., light emerald background for "Active") with high-saturation text.