// -----------------------------------------------------------------
// Shared Auth Palette — derived from client rawcode.md
// Card body: gradient #FFEDF1 → #D7E8E2  (pink → mint)
// Header section: solid white (#FFFFFF)
// Primary CTA: deep forest green #2D6A4F
// Accent / links: deep pink #D11A46
// -----------------------------------------------------------------

export const sharedAuthPalette = {
  // Screen & header areas
  screenBg: "#FFFFFF", // header zone is pure white (rawcode body bg)
  surface: "#FFFFFF", // card / input surfaces

  // Gradient for the main card body (pink → mint, top to bottom)
  cardGradientStart: "#FFEDF1",
  cardGradientEnd: "#D7E8E2",

  // Primary action button — deep forest green
  primaryButton: "#2D6A4F",
  primaryButtonPressed: "#1B4332",

  // Brand + accent
  brandPink: "#D11A46", // "insta" in logo
  brandGreen: "#2D6A4F", // "Chamba" in logo
  link: "#D11A46", // accent-link (terms, forgot pwd, register)
  secondaryAccent: "#D7E8E2", // mint — input focus border tint

  // Text — Tailwind gray scale from rawcode
  headingText: "#1F2937", // gray-800
  bodyText: "#6B7280", // gray-500
  labelText: "#4B5563", // gray-600  (semibold labels)
  placeholder: "#D1D5DB", // gray-300
  footerText: "#4B5563", // gray-600
  mutedText: "#9CA3AF", // gray-400

  // Borders & icons
  border: "#D7E8E2", // mint — matches input focus from rawcode
  icon: "#4B5563", // gray-600 icons

  // Validation error
  errorText: "#E57373",

  // Shadows — rawcode uses rgba(0,0,0,0.04) for inputs
  inputShadow: "#000000",
  inputShadowOpacity: 0.04,
  buttonShadow: "#2D6A4F",
  buttonShadowOpacity: 0.28,
};
