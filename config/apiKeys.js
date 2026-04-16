/**
 * API Configuration
 * Store sensitive API keys in environment variables
 */

export const GOOGLE_PLACES_API_KEY =
  process.env.REACT_APP_GOOGLE_PLACES_API_KEY;

/**
 * For React Native Expo:
 * Add to app.json or .env:
 * REACT_APP_GOOGLE_PLACES_API_KEY=your_api_key_here
 *
 * Steps to get Google Places API key:
 * 1. Go to Google Cloud Console (https://console.cloud.google.com/)
 * 2. Create a new project
 * 3. Enable these APIs:
 *    - Places API
 *    - Maps JavaScript API
 *    - Geocoding API
 * 4. Create an API key credential
 * 5. Restrict the key to your app's bundle ID (for security)
 * 6. Add the key to your environment variables
 */

// Default export for easier imports
export default {
  GOOGLE_PLACES_API_KEY,
};
