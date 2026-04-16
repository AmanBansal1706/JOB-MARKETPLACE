/**
 * Firebase Timestamp Converter
 * Converts Firestore Timestamp objects to milliseconds for Redux storage
 */
import {
  formatDisplayDate,
  formatFirestoreTime,
  getRelativeTime as _getRelativeTime,
} from "./dateFormatting";

/**
 * Recursively converts all Firestore Timestamp objects to milliseconds
 * @param {*} data - Data to convert (can be any type)
 * @returns {*} Converted data with timestamps as numbers (milliseconds)
 */
export const convertFirestoreTimestamps = (data) => {
  // Handle null/undefined
  if (!data) return data;

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(convertFirestoreTimestamps);
  }

  // Handle Firestore Timestamp objects
  if (data?.toMillis && typeof data.toMillis === "function") {
    return data.toMillis(); // Returns milliseconds since epoch
  }

  // Handle objects
  if (data && typeof data === "object") {
    const converted = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        converted[key] = convertFirestoreTimestamps(data[key]);
      }
    }
    return converted;
  }

  // Return primitives as-is
  return data;
};

/**
 * Convert milliseconds back to Date object (for display)
 * @param {number} milliseconds - Timestamp in milliseconds
 * @returns {Date} JavaScript Date object
 */
export const millisToDate = (milliseconds) => {
  if (!milliseconds) return null;
  return new Date(milliseconds);
};

/**
 * Format timestamp for display
 * Delegates to centralized formatFirestoreTime from dateFormatting.js
 * @param {number} milliseconds - Timestamp in milliseconds
 * @returns {string} Formatted time string
 */
export const formatTimestamp = (milliseconds) => {
  return formatFirestoreTime(milliseconds);
};

/**
 * Format timestamp as date (e.g., "27 Feb 2025")
 * @param {number} milliseconds - Timestamp in milliseconds
 * @returns {string} Formatted date string
 */
export const formatDate = (milliseconds) => {
  if (!milliseconds) return "";
  const result = formatDisplayDate(milliseconds);
  return result === "N/A" ? "" : result;
};

/**
 * Get relative time (e.g., "2 hours ago")
 * Delegates to centralized getRelativeTime from dateFormatting.js
 * @param {number} milliseconds - Timestamp in milliseconds
 * @returns {string} Relative time string
 */
export const getRelativeTime = (milliseconds) => {
  return _getRelativeTime(milliseconds);
};

/**
 * Check if two timestamps are on the same day
 * @param {number} timestamp1 - First timestamp in milliseconds
 * @param {number} timestamp2 - Second timestamp in milliseconds
 * @returns {boolean} True if on same day
 */
export const isSameDay = (timestamp1, timestamp2) => {
  if (!timestamp1 || !timestamp2) return false;

  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};
