import { Linking, Platform, Alert } from "react-native";

/**
 * Opens the maps application with the given address or coordinates
 * @param {Object} locationData - Location data object containing lat, lng, and address
 * @param {number} locationData.lat - Latitude (optional)
 * @param {number} locationData.lng - Longitude (optional)
 * @param {string} locationData.address - Full address string (optional)
 * @returns {Promise<void>}
 */
export const openMapsApp = async (locationData) => {
  if (!locationData) {
    Alert.alert("Error", "Location data is not available");
    return;
  }

  const { lat, lng, address } = locationData;

  // Check if we have valid coordinates
  const hasCoordinates = lat && lng && !isNaN(lat) && !isNaN(lng);

  if (!hasCoordinates && !address) {
    Alert.alert(
      "Error",
      "No location information available. Address and coordinates are missing.",
    );
    return;
  }

  let mapUrl = "";

  if (Platform.OS === "ios") {
    // Apple Maps URL scheme
    if (hasCoordinates) {
      // Using coordinates (more reliable)
      mapUrl = `maps://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(
        address || `${lat},${lng}`,
      )}`;
    } else {
      // Using address only
      mapUrl = `maps://maps.apple.com/?q=${encodeURIComponent(address)}`;
    }
  } else if (Platform.OS === "android") {
    // Google Maps URL scheme
    if (hasCoordinates) {
      // Using coordinates (more reliable)
      mapUrl = `geo:${lat},${lng}?q=${encodeURIComponent(
        address || `${lat},${lng}`,
      )}`;
    } else {
      // Using address only - Google Maps Android Intent
      mapUrl = `geo:0,0?q=${encodeURIComponent(address)}`;
    }
  }

  try {
    // Check if the URL can be opened
    const canOpen = await Linking.canOpenURL(mapUrl);

    if (!canOpen && Platform.OS === "android" && address) {
      // Fallback for Android if geo: scheme doesn't work
      const fallbackUrl = `https://www.google.com/maps/search/${encodeURIComponent(
        address,
      )}`;
      await Linking.openURL(fallbackUrl);
    } else if (canOpen) {
      await Linking.openURL(mapUrl);
    } else {
      Alert.alert(
        "Error",
        "Unable to open maps application. Please check if you have a maps app installed.",
      );
    }
  } catch (error) {
    console.error("Error opening maps:", error);
    Alert.alert("Error", "Failed to open maps application");
  }
};

/**
 * Opens maps with just an address (when coordinates are not available)
 * @param {string} address - The address to open in maps
 * @returns {Promise<void>}
 */
export const openMapsWithAddress = async (address) => {
  if (!address) {
    Alert.alert("Error", "No address provided");
    return;
  }

  await openMapsApp({ address });
};

/**
 * Opens maps with coordinates
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {string} label - Optional label/address for the location
 * @returns {Promise<void>}
 */
export const openMapsWithCoordinates = async (latitude, longitude, label) => {
  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    Alert.alert("Error", "Invalid coordinates provided");
    return;
  }

  await openMapsApp({ lat: latitude, lng: longitude, address: label });
};
