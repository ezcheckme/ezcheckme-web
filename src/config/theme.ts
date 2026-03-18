/**
 * Central theme — Single source of truth for all colors, spacing, and typography.
 *
 * Every component should import from here instead of hardcoding hex values.
 * CSS variable equivalents exist in index.css for Tailwind/class-based usage.
 */

export const theme = {
  colors: {
    // ── Core palette ──
    primary: "#1976d2",
    primaryHover: "#115293",
    secondary: "#dc004e",
    secondaryHover: "#9a0036",
    accent: "#0277bd",

    // ── Semantic ──
    success: "#58B947",
    successDark: "#44a033",
    error: "#f44336",
    errorDark: "#b71c1c",
    warning: "#ff9800",
    warningDark: "#da8806",
    info: "#2196f3",

    // ── Text ──
    text: {
      primary: "rgba(0, 0, 0, 0.87)",
      secondary: "rgba(0, 0, 0, 0.54)",
      disabled: "rgba(0, 0, 0, 0.38)",
      hint: "#888",
      white: "#fff",
    },

    // ── Backgrounds ──
    bg: {
      page: "#fafafa",
      surface: "#fff",
      sidebar: "#2d323e",
      hover: "#f5f5f5",
      selected: "#e3f2fd",
      today: "#e9e9e9",
      header: "#f5f5f5",
    },

    // ── Borders ──
    border: {
      light: "rgba(0, 0, 0, 0.12)",
      medium: "#e0e0e0",
      dark: "#bdbdbd",
      input: "#949494",
    },

    // ── Domain: Field course / shifts ──
    field: {
      ok: "#58B947",
      okHover: "#448f37",
      openShift: "#94c18c",
      pending: "#da8806",
      pendingHover: "#a86701",
      denied: "#9f0b0b",
      deniedHover: "#640606",
    },

    // ── Domain: Location ──
    location: {
      onSite: "#44a033",
      offSite: "#04768a",
      undetected: "#e16f08",
    },

    // ── Domain: Slider ──
    slider: {
      track: "#1976d2",
      inactive: "#bdbdbd",
      bubble: "#333",
    },

    // ── Domain: Buttons ──
    button: {
      danger: "#b71c1c",
      dangerAlt: "#9d0009",
      teal: "#00897b",
    },
  },

  font: {
    family: "Muli, Roboto, Helvetica, Arial, sans-serif",
    size: {
      xs: 9,
      sm: 12,
      base: 14,
      md: 15,
      lg: 18,
      xl: 24,
    },
    weight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  radius: {
    sm: 4,
    md: 8,
    lg: 16,
    round: "50%",
  },

  shadow: {
    sm: "0 1px 3px rgba(0,0,0,0.3)",
    md: "0 2px 6px rgba(0,0,0,0.3)",
    mui1: "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)",
  },
} as const;

// Type for the full theme
export type Theme = typeof theme;
