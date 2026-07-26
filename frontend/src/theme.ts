// FinanceOS design tokens — single source of truth for colors, spacing, fonts.
// Values taken from the FinanceOS design system (the winning/rendered scheme).

export const colors = {
  bg: "#f2f2f3",        // light grey background
  surface: "#e9e9ea",   // card / surface
  text: "#1d1f20",      // primary text
  divider: "rgba(29, 31, 32, 0.16)",

  accent: "#5980a6",    // blue-grey — buttons, links, active states, bars
  accent100: "#eef6ff",
  accent200: "#d6ebff",
  accent700: "#416180",
  accent800: "#2c455d",

  neutral100: "#f5f5f8",
  neutral200: "#e7e7ea",
  neutral300: "#d4d4d7",
  neutral400: "#b7b7ba",
  neutral500: "#98989b",
  neutral600: "#7a7a7d",
  neutral700: "#5d5d60",

  muted: "rgba(29, 31, 32, 0.55)",  // primary text at 55%
  white: "#ffffff",
};

export const spacing = { s1: 4, s2: 9, s3: 13, s4: 18, s6: 26, s8: 35 };

export const radius = { sm: 8, md: 16, lg: 28 };

export const fonts = {
  heading: "SpaceGrotesk_700Bold",
  body: "SpaceGrotesk_400Regular",
  bodyMedium: "SpaceGrotesk_500Medium",
  bodySemibold: "SpaceGrotesk_600SemiBold",
  bodyBold: "SpaceGrotesk_700Bold",
};

export const shadow = {
  card: {
    // Web uses boxShadow; native (iOS/Android) uses the elevation/shadow props below
    boxShadow: "0px 3px 10px rgba(29, 31, 32, 0.16)",
    elevation: 3, // Android
  },
};