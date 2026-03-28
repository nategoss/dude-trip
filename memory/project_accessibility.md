---
name: Accessibility implementation
description: WCAG 2.1 compliance and color-deficiency profiles added to the app
type: project
---

WCAG 2.1 compliance and color-vision-deficiency profiles were added in March 2026.

**Color profile system:**
- `src/lib/colorProfiles.js` — 5 profiles: default, deuteranopia, protanopia, tritanopia, highContrast
- `src/contexts/ColorProfileContext.jsx` — React context + `useColorProfile()` hook; persists to localStorage
- `src/components/AccessibilityMenu.jsx` — ♿ button in top bar (CalendarView) and DudeSelect; opens a dialog to pick a profile and toggle shape mode

**Key WCAG fixes applied:**
- `focus-visible` ring on all interactive elements (keyboard navigation)
- `prefers-reduced-motion` in `index.css`
- `aria-label`, `role="alert"`, `aria-live`, `aria-busy`, `role="grid"` throughout components
- CalendarMonth uses `<table role="grid">` with `role="gridcell"` and keyboard handlers (Enter/Space to toggle dates)
- Password input has `<label>` and `aria-describedby` for error
- Emoji decorations marked `aria-hidden="true"`
- Score bar uses `role="meter"` with aria values

**Shape mode:** Optional toggle makes calendar dots slightly larger (12px) with distinct CSS shapes (circle, square, diamond, triangle, hexagon, plus) so color isn't the sole differentiator.

**Why:** One dude is color deficient (type unknown). Red-green profiles (deuteranopia, protanopia) are the most impactful.
