---
name: Moravian Terroir
colors:
  surface: '#fff8f8'
  surface-dim: '#e7d6d8'
  surface-bright: '#fff8f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff0f2'
  surface-container: '#fceaec'
  surface-container-high: '#f6e4e6'
  surface-container-highest: '#f0dee1'
  on-surface: '#22191b'
  on-surface-variant: '#554243'
  inverse-surface: '#382e30'
  inverse-on-surface: '#ffecef'
  outline: '#887173'
  outline-variant: '#dbc0c2'
  surface-tint: '#a03c4d'
  primary: '#4a0014'
  on-primary: '#ffffff'
  primary-container: '#6a1327'
  on-primary-container: '#f07b8b'
  inverse-primary: '#ffb2ba'
  secondary: '#924752'
  on-secondary: '#ffffff'
  secondary-container: '#ffa1ad'
  on-secondary-container: '#7a343f'
  tertiary: '#3b1600'
  on-tertiary: '#ffffff'
  tertiary-container: '#5c2600'
  on-tertiary-container: '#f0813a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9dc'
  primary-fixed-dim: '#ffb2ba'
  on-primary-fixed: '#400010'
  on-primary-fixed-variant: '#812537'
  secondary-fixed: '#ffd9dc'
  secondary-fixed-dim: '#ffb2ba'
  on-secondary-fixed: '#3d0512'
  on-secondary-fixed-variant: '#75303b'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#ffb68e'
  on-tertiary-fixed: '#331200'
  on-tertiary-fixed-variant: '#763300'
  background: '#fff8f8'
  on-background: '#22191b'
  surface-variant: '#f0dee1'
typography:
  display-hero:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: 0em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.04em
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.06em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
The design system embodies the heritage, prestige, and quiet luxury of Central European viticulture. Tailored for connoisseurs, cellar-door visitors, and premium hospitality patrons, the interface blends artisanal depth with contemporary, effortless utility. It projects sensory warmth, refined restraint, and pedigree without leaning into dusty antiquation.

The design movement combines **Contemporary Editorial Elegance** with **Tactile Modernism**:
- Deep, vinous tones ground structural moments and high-impact calls to action.
- Soft, warm-rose tinted surfaces replace stark white canvas planes, evoking cellar parchment, limewash, and barrel rooms.
- High-contrast, hyper-clean sans-serif typography establishes clarity, pairing crisp editorial presence with accessible data density.
- Card planes feel curated and tactile through gentle curves and delicate, wine-tinted ambient glows.

## Colors
The color palette anchors on the deep pigmentation of aged Moravian Pinot Noir and Frankovka, balanced by creamy, flushed rose foundations.

- **Primary (`#6A1327`) & Deep Vintage Variant (`#480D1A`)**: Serves as the primary brand marker, key navigation highlights, primary interaction anchors, and prominent display badges. An active hover state scales to bright garnet (`#801B31`).
- **Secondary (`#480D1A`)**: Used for extreme-emphasis branding, heavy borders on highlighted containers, and dark tonal headers.
- **Tertiary Accent (`#B45309`)**: Amber gold derived from botrytis and oak maturation. Employed strictly for reserve tiers, awards, critical alerts, and selected status indicators.
- **Backgrounds & Canvas Surfaces**:
  - Base canvas: `#FDF8F8` (Parchment blush)
  - Card & Container background: `#FFFFFF`
  - Subtle layer/hover background: `#FFF5F5`
- **Text & Contrast Hierarchy**:
  - Primary text: Slate Charcoal (`#1F1618`) ensures an uncompromising 12:1+ contrast against light surfaces.
  - Secondary text / Terroir Muted: `#4A3B3E` (minimum 4.8:1 contrast on `#FDF8F8`).
  - Subtle borders: `#EEDCDD`.

## Typography
Typographic personality relies on **Hanken Grotesk** across display, body, and operational tiers. Its geometry provides modernist rigor, while its open apertures and subtle humanism echo classic print viticulture catalogs.

- **Display & Headlines**: Tightly tracked (`-0.01em` to `-0.03em`) to deliver gravitas and sharp definition. Avoid uppercase styling on headlines over 24px; use sentence case for effortless luxury.
- **Labels & Overlines**: Uppercase transformation applied to `label-md` and `label-sm` with wider tracking (`0.06em` to `0.08em`) to demarcate vintages, appellations, and classification tiers.
- **Body Text**: Generous vertical rhythm (1.5x) preserving effortless reading cadence on high-resolution displays.

## Layout & Spacing
The layout adheres to an 8px base rhythm governed by a fluid responsive grid:
- **Mobile (< 768px)**: 4 columns, `margin: 1.25rem`, `gutter: 1rem`. All actionable interactive items honor a minimum 48px hit dimension.
- **Tablet (768px - 1024px)**: 8 columns, `margin: 2rem`, `gutter: 1.5rem`.
- **Desktop (> 1024px)**: 12 columns, max bounded container `1280px`, `margin: 3rem`, `gutter: 1.5rem`.

Negative space is intentional and generous, allowing vintage imagery, harvest notes, and terroir profiles breathing room without dense stacking.

## Elevation & Depth
Depth avoids artificial, heavy black shadows, relying instead on **tinted ambient occlusion** that carries the tonal undertone of Burgundy:

- **Level 0 (Flat)**: Background `#FDF8F8` with delicate hairline borders (`#EEDCDD`, 1px solid).
- **Level 1 (Card Default)**: `#FFFFFF` surface accompanied by `0 2px 8px -2px rgba(74, 13, 26, 0.04), 0 1px 3px 0 rgba(74, 13, 26, 0.02)`.
- **Level 2 (Hover / Floating Cards)**: `0 12px 24px -4px rgba(74, 13, 26, 0.08), 0 4px 8px -2px rgba(74, 13, 26, 0.03)`.
- **Level 3 (Modals / Drawers)**: `0 24px 48px -12px rgba(31, 22, 24, 0.16)`. Accompanied by a wine-smoke backdrop blur overlay: `rgba(31, 22, 24, 0.45)` with `backdrop-filter: blur(6px)`.

## Shapes
A roundedness level of `2` provides a sophisticated balance: modern, structured elements paired with soft, inviting corners.

- **Cards & Visual Containers**: `rounded-xl` (1.5rem / 24px) for cards, preview panels, and dialog surfaces, lending an organic, barrel-softened aesthetic.
- **Buttons, Field Inputs & Interactive Badges**: `rounded-lg` (0.75rem / 12px) to maintain structured clarity and tactile finger-press affordance.
- **Tags, Micro-Pills & Tasting Notes**: Full pill curvature (`9999px`) to create clear geometric contrast against content cards.

## Components

### Buttons
- **Primary**: Background `#6A1327`, text `#FFFFFF`, font `label-lg`, height `48px` minimum, padding `0 1.5rem`, `border-radius: 12px`. Hover state transitions to `#801B31` with shadow elevation Level 2. Active state shifts to `#480D1A`.
- **Secondary / Terroir Ghost**: Transparent surface, border `1.5px solid #6A1327`, text `#6A1327`. Hover fills with `#FFF5F5`.
- **Tertiary / Subdued**: Text `#4A3B3E`, hover background `#EEDCDD`, height `44px`.

### Cards (`rounded-xl`)
- Crisp white surface (`#FFFFFF`) framed by a subtle border (`1px solid #F3E6E7`) and Level 1 elevation.
- Internal padding strictly scaled to `space-lg` (24px) or `space-xl` (40px) on desktop.
- Hover states transition seamlessly to Level 2 elevation and border color `#EEDCDD`.

### Input Fields & Selects
- Height: `48px` with clear 44px+ internal click boundary.
- Surface: `#FFFFFF`, border: `1.5px solid #EEDCDD`, corner radius `12px`, text `#1F1618`.
- Focus state: Border transitions to `#6A1327` with a ring of `0 0 0 3px rgba(106, 19, 39, 0.15)`.

### Chips & Badges
- **Tasting Notes & Appellations**: Background `#FFF5F5`, border `1px solid #EEDCDD`, text `#4A3B3E`, pill-shaped, height `32px`, padding `0 12px`.
- **Vintage / Reserve Highlight**: Amber Gold background `rgba(180, 83, 9, 0.12)`, text `#B45309`, border `1px solid rgba(180, 83, 9, 0.3)`.

### Selection Controls (Checkbox & Radio)
- Minimum tap box size `44px x 44px` enclosing a `20px x 20px` visible mark.
- Unchecked: Border `2px solid #4A3B3E`, background `#FFFFFF`.
- Checked: Fill `#6A1327`, glyph `#FFFFFF`.

### Specialized Domain Component: Tasting Matrix & Terroir Spec List
- Key-value metadata stacked with `border-bottom: 1px solid #F3E6E7`, padding `12px 0`.
- Key set in `label-sm` (uppercase `#4A3B3E`), value set in `body-md` (bold `#1F1618`).