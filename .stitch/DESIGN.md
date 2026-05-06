---
name: Vibrant Gourmet
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#5d3f3d'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#926e6b'
  outline-variant: '#e7bcb9'
  surface-tint: '#c0001c'
  primary: '#bb001b'
  on-primary: '#ffffff'
  primary-container: '#e6182a'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb3ad'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e4e2e1'
  on-secondary-container: '#656464'
  tertiary: '#795600'
  on-tertiary: '#ffffff'
  tertiary-container: '#986d00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad7'
  primary-fixed-dim: '#ffb3ad'
  on-primary-fixed: '#410004'
  on-primary-fixed-variant: '#930013'
  secondary-fixed: '#e4e2e1'
  secondary-fixed-dim: '#c8c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#474747'
  tertiary-fixed: '#ffdea8'
  tertiary-fixed-dim: '#ffba20'
  on-tertiary-fixed: '#271900'
  on-tertiary-fixed-variant: '#5e4200'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  h3:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.0'
  price-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1.0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding-mobile: 16px
  container-padding-desktop: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  section-gap: 48px
---

## Brand & Style
This design system centers on a "Crave-First" philosophy, blending **Corporate Modern** efficiency with high-energy visual cues. The personality is authoritative yet welcoming, designed to reduce friction between hunger and fulfillment. The aesthetic leverages high-density white space and high-resolution food imagery to create an "appetite-inducing" environment.

The visual style is characterized by:
- **High-Velocity Navigation:** Instant feedback and smooth transitions to reflect professional speed.
- **Imagery Dominance:** UI elements are secondary to the food, acting as a clean frame for the product.
- **Action-Oriented Contrast:** Using high-saturation reds against stark white and charcoal to drive conversions.

## Colors
The palette is engineered for biological response and legibility. 
- **Primary (Vibrant Red):** Reserved exclusively for primary actions, critical alerts, and branding. It is the "Add to Cart" color.
- **Secondary (Deep Charcoal):** Used for primary headings and body text to ensure maximum readability and a premium feel.
- **Accent (Amber):** Used for social proof (ratings), special offers, and highlighting specific item modifications.
- **Neutral/Background:** A mix of pure white (#FFFFFF) for cards and a soft light gray (#F7F7F7) for page backgrounds to create subtle depth.

## Typography
This design system utilizes **Plus Jakarta Sans** for headings to provide a modern, friendly, and slightly rounded geometric feel that complements food photography. **Inter** is used for all functional text and body copy due to its exceptional legibility at small sizes on mobile devices.

- **Weight Strategy:** Use Bold/ExtraBold for names of dishes and prices to ensure they pop.
- **Hierarchy:** Maintain a clear vertical rhythm. Subtitles (ingredients) should use a medium-gray tint to secondary color to maintain focus on the dish name.

## Layout & Spacing
The layout follows a **Fluid Grid** model for mobile-first views and a **12-column Fixed Grid** (1200px max-width) for the admin dashboard.

- **Mobile Rhythm:** Use a 16px safe-area margin. Product cards should utilize the full width or 50% width in a two-column grid depending on category density.
- **Whitespace:** Elements are given generous "breathing room" to prevent the interface from feeling cluttered or "cheap."
- **Sticky Zones:** The mobile interface must feature a sticky top category navigation and a sticky bottom "View Cart" bar.

## Elevation & Depth
This design system employs **Ambient Shadows** and **Tonal Layering** to create a sense of physical stacks, similar to plates on a table.

- **Level 0 (Background):** #F7F7F7.
- **Level 1 (Cards/Sheets):** #FFFFFF with a very soft, diffused shadow (0px 4px 20px rgba(0,0,0,0.05)).
- **Level 2 (Floating/Interactive):** Active buttons and sticky footers use a more pronounced shadow to indicate they sit above the content (0px 8px 30px rgba(234, 29, 44, 0.15)).
- **Separators:** Use 1px light gray borders (#EEEEEE) only when necessary; prefer whitespace for separation.

## Shapes
A **Rounded** strategy is applied to evoke a friendly, approachable, and organic feel associated with food.

- **Standard Elements:** Buttons, cards, and input fields use an 8px (0.5rem) radius.
- **Large Containers:** Bottom sheets and prominent hero cards use a 16px-24px radius on top corners.
- **Search Bars:** Should use a fully pill-shaped (rounded-full) design to distinguish them from actionable cards.

## Components
- **Product Cards:** Horizontal layout for list views (image on right), vertical for featured items. Prices are anchored to the bottom right in `price-display` style.
- **Add Buttons:** Large, circular or wide-pill buttons using the Primary Red. On mobile, the '+' icon should be large and easy to tap (min 44x44px hit area).
- **Sticky Cart Bar:** A full-width bottom component in Deep Charcoal with white text, showing "Total: $XX.XX" on the left and "View Cart" on the right.
- **Category Tabs:** A horizontal scrolling list of pill-shaped buttons. Active state: Primary Red background with White text. Inactive: Light gray background with Charcoal text.
- **Quantity Selector:** A combined component with a minus icon, quantity number, and plus icon, using a soft gray background to avoid competing with the main 'Add' action.
- **Admin Dashboard Tables:** Clean, high-contrast rows with subtle hover states and clear status badges (e.g., "Pending" in Amber, "Completed" in Green).
