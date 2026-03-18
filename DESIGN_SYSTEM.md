# EZCheck.me Design System & Visual Tokens

This specification defines the baseline exact tokens for matching the legacy React 16 + MUI v4 + Fuse theme in the new React 19 + Tailwind CSS environment.

## 1. Typography

- **Font Family:** `"Muli", "Roboto", "Helvetica", "Arial", sans-serif`
- **Base Size:** 14px (`0.875rem`)
- **Headings:**
  - H1: `34px` (2.125rem), Weight: 400
  - H2: `24px` (1.5rem), Weight: 400
  - H6 (Card Headers): `1.25rem`, Weight: 500

## 2. Colors

To perfectly emulate the legacy MUI palette:

- **Primary (Blue):** `#1976d2`
  - Hover/Active: `#115293`
- **Secondary (Pink/Red):** `#dc004e`
  - Hover/Active: `#9a0036`
- **Success (Green):** `#4caf50`
- **Error (Red):** `#f44336`
- **Warning (Orange):** `#ff9800`
- **Info (Light Blue):** `#2196f3`

**Backgrounds:**

- **Body/Global:** `#fafafa`
- **Surface/Cards:** `#ffffff`
- **Sidebar (Dark Mode/Admin):** `#2d323e` (Fuse typical dark sidebar) or `#ffffff` depending on selected theme route.

**Text:**

- **Primary:** `rgba(0, 0, 0, 0.87)`
- **Secondary:** `rgba(0, 0, 0, 0.54)`
- **Disabled:** `rgba(0, 0, 0, 0.38)`

## 3. Shadows & Borders (MUI Defaults)

- **Card/Paper (Elevation 1):** `0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)`
- **Dialogs (Elevation 24):** `0px 11px 15px -7px rgba(0,0,0,0.2), 0px 24px 38px 3px rgba(0,0,0,0.14), 0px 9px 46px 8px rgba(0,0,0,0.12)`
- **Border Radius:** `4px` default for buttons/cards.

## 4. Layout & Spacing

- **MUI Base Unit:** `8px`
  - xs: 4px
  - sm: 8px
  - md: 16px (Card padding standard)
  - lg: 24px (Page padding standard)
- **App Bar Height:** `64px` default.
- **Sidebar Width:** `240px` (Expanded), `64px` (Collapsed).

## 5. Animation

- **Transitions:** `250ms cubic-bezier(0.4, 0, 0.2, 1)`

## Integration Strategy:

1.  Map these colors into `tailwind.config.ts`.
2.  Override `shadcn/ui` variables (`--radius: 0.25rem`, `--primary: 210 100% 46%`) to match.
3.  Ensure standard text elements use MUI's `tracking-normal` rather than default compact trackers.
