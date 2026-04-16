import { colors } from "../theme";

/**
 * Generate an avatar URL from user initials
 * Uses UI Avatars API as fallback when profile picture is not available
 * @param {string} name - User's name
 * @param {string} profilePicture - Optional: URL to profile picture
 * @returns {string} Avatar URL
 */
export const getInitialAvatarUrl = (name, profilePicture = null) => {
  // If profile picture is available, use it
  if (
    profilePicture &&
    typeof profilePicture === "string" &&
    profilePicture.trim().length > 0
  ) {
    return profilePicture;
  }

  const defaultUrl =
    "https://ui-avatars.com/api/?name=U&size=400&background=CCCCCC&color=FFFFFF&rounded=true";

  if (!name || name.trim().length === 0) return defaultUrl;

  const firstChar = name.trim()[0].toUpperCase();
  const initial = encodeURIComponent(firstChar);

  // Try to derive a valid 6-digit hex background color from app theme.
  // ui-avatars expects a hex WITHOUT the leading '#' and without alpha.
  let bg = "";
  try {
    const raw = colors && colors.primary ? String(colors.primary) : "";
    if (raw) {
      // remove leading '#' if present
      let hex = raw.replace(/^#/, "").toUpperCase();
      // If 8-digit (has alpha) keep first 6 (RRGGBB)
      if (hex.length === 8) hex = hex.slice(0, 6);
      // If longer than 6, truncate; if shorter than 6 it's invalid
      if (hex.length >= 6) hex = hex.slice(0, 6);
      // Validate hex
      if (/^[0-9A-F]{6}$/.test(hex)) {
        bg = hex;
      }
    }
  } catch (e) {
    bg = "";
  }

  // Fallback palette if app color not usable
  if (!bg) {
    const palette = [
      "1E88E5",
      "1976D2",
      "1565C0",
      "0D47A1",
      "43A047",
      "2E7D32",
      "F4511E",
      "D84315",
      "8E24AA",
      "6A1B9A",
      "C2185B",
      "AD1457",
      "FFB300",
      "F57F17",
      "6D4C41",
    ];
    const code = firstChar.charCodeAt(0);
    bg = palette[Math.abs(code) % palette.length];
  }

  return `https://ui-avatars.com/api/?name=${initial}&size=400&background=${bg}&color=FFFFFF&rounded=true`;
};

export default {
  getInitialAvatarUrl,
};
