# KampusDAO Frontend

## Design System

### Aesthetic Direction
Modern institutional governance — clean, trustworthy, data-driven. Dark mode only.

### Dials
- DESIGN_VARIANCE: 6 / 10
- MOTION_INTENSITY: 4 / 10
- VISUAL_DENSITY: 5 / 10

### Typography
- Display: Geist (variable, weights 400-700)
- Body: Geist
- Mono: Geist Mono
- Loaded via: `next/font/google`

### Color Tokens (OKLCH)
```css
:root {
  --bg: oklch(0.12 0.005 60);
  --surface: oklch(0.16 0.01 60);
  --fg: oklch(0.95 0.005 60);
  --muted: oklch(0.55 0.01 60);
  --border: oklch(0.22 0.005 60);
  --accent: oklch(0.7 0.18 150);
}
```

### Layout
- Container: `max-w-[1400px] mx-auto px-6 md:px-10`
- Reading width: `max-w-[65ch]`
- Hero pattern: Split-screen, asymmetric

### Component Inventory
- Navbar, ConnectButton, NFTBadge, MintButton
- ProposalCard, VoteButton, ProposalForm

### Bans
- No Inter / Roboto as primary
- No purple-blue gradients
- No `#000` / `#FFF` (use tinted neutrals)
- No emojis (Phosphor icons only)
- No `h-screen` (use `min-h-[100dvh]`)
