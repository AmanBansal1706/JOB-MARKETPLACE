/**
 * Centralized Date Formatting Utilities
 * Ensures consistent date display across the entire app.
 *
 * Display format: "DD Mon YYYY" (e.g. "27 Feb 2025")
 * These functions are UI-only — they do NOT affect API payloads.
 *
 * TIMEZONE NOTE (Mexico):
 * The backend provides all dates/times in the Mexican timezone.
 * Date-only strings like "2025-03-15" are treated as LOCAL (Mexican) midnight,
 * NOT UTC midnight. This prevents the off-by-one-day bug where
 * new Date("2025-03-15") → UTC midnight → March 14 in Mexican timezones.
 */

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Parses various date input formats into a valid Date object (LOCAL time).
 *
 * IMPORTANT: Date-only strings ("YYYY-MM-DD") and datetime strings without a
 * timezone offset ("YYYY-MM-DD HH:MM:SS") are always parsed as LOCAL time.
 * This is critical for Mexico — the backend sends dates in Mexican timezone,
 * and the default JS behaviour of treating "YYYY-MM-DD" as UTC would cause
 * the displayed date to shift back by one day in all Mexican timezones.
 *
 * Handles: ISO strings, Date objects, "DD-MM-YYYY", "DD/MM/YYYY", timestamps (ms),
 *          "YYYY-MM-DD", "YYYY-MM-DD HH:MM:SS", "YYYY-MM-DDTHH:MM:SS".
 * @param {*} input - Date input in any common format
 * @returns {Date|null} Parsed Date or null if invalid
 */
export const parseDate = (input) => {
  if (!input) return null;

  // Already a Date object
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }

  // Numeric timestamp (milliseconds)
  if (typeof input === "number") {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof input !== "string") return null;

  const trimmed = input.trim();

  // Try DD-MM-YYYY or DD/MM/YYYY pattern → local time
  const ddmmyyyy = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    return isNaN(d.getTime()) ? null : d;
  }

  // YYYY-MM-DD (date only) → parse as LOCAL midnight, not UTC
  // Without this, "2025-03-15" becomes UTC midnight which is March 14 in Mexico.
  const isoDateOnly = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateOnly) {
    const [, year, month, day] = isoDateOnly;
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    return isNaN(d.getTime()) ? null : d;
  }

  // YYYY-MM-DD HH:MM:SS or YYYY-MM-DD HH:MM (space-separated, no timezone)
  // → parse as LOCAL time (backend sends Mexican timezone data)
  const isoDateTimeSpace = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/,
  );
  if (isoDateTimeSpace) {
    const [, year, month, day, hours, minutes, seconds] = isoDateTimeSpace;
    const d = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hours),
      Number(minutes),
      Number(seconds || 0),
    );
    return isNaN(d.getTime()) ? null : d;
  }

  // Everything else (strings with timezone offset like "Z", "+05:30", etc.)
  // → let JS Date constructor handle — it will convert to local time correctly.
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Formats a date for UI display as "DD Mon YYYY" (e.g. "27 Feb 2025").
 * Accepts any date format: ISO string, Date object, DD-MM-YYYY, etc.
 * @param {*} input - Date in any format
 * @returns {string} Formatted date string or "N/A"
 */
export const formatDisplayDate = (input) => {
  const date = parseDate(input);
  if (!date) return "N/A";

  const day = String(date.getDate()).padStart(2, "0");
  const month = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

/**
 * Formats a date+time for UI display as "DD Mon YYYY, HH:MM AM/PM".
 * @param {*} input - Date/datetime in any format
 * @returns {string} Formatted datetime string or "N/A"
 */
export const formatDisplayDateTime = (input) => {
  const date = parseDate(input);
  if (!date) return "N/A";

  const day = String(date.getDate()).padStart(2, "0");
  const month = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();

  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return `${day} ${month} ${year}, ${displayHour}:${minutes} ${period}`;
};

/**
 * Formats a Date object for display (useful for date picker display values).
 * Returns null instead of "N/A" when input is null/undefined.
 * @param {Date|null} date - Date object from date picker
 * @returns {string|null} Formatted date or null
 */
export const formatDateForDisplay = (date) => {
  if (!date) return null;
  return formatDisplayDate(date);
};

// ==================== Time Formatting ====================

/**
 * Formats a time string (HH:MM:SS or HH:MM) to 12-hour format "HH:MM AM/PM".
 * @param {string} timeString - Time in "HH:MM:SS" or "HH:MM" format
 * @returns {string} Formatted time string or "N/A"
 */
export const formatTimeString = (timeString) => {
  if (!timeString) return "N/A";
  const [hours, minutes] = timeString.split(":").slice(0, 2);
  const hour = parseInt(hours, 10);
  if (isNaN(hour)) return "N/A";
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${String(displayHour).padStart(2, "0")}:${minutes} ${period}`;
};

/**
 * Formats a Date object's time portion to 12-hour "HH:MM AM/PM".
 * @param {Date|string|number} input - Date object, ISO string, or timestamp
 * @returns {string} Formatted time string or "N/A"
 */
export const formatTimeFromDate = (input) => {
  const date = parseDate(input);
  if (!date) return "N/A";
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${String(displayHour).padStart(2, "0")}:${minutes} ${period}`;
};

/**
 * Formats a Firestore timestamp (or millis or Date) to "HH:MM AM/PM" time string.
 * Handles Firestore Timestamp objects with .toDate(), millisecond numbers, and Date objects.
 * @param {*} createdAt - Firestore Timestamp, Date, or milliseconds
 * @returns {string} Formatted time string or ""
 */
export const formatFirestoreTime = (createdAt) => {
  if (!createdAt) return "";
  const date = new Date(
    typeof createdAt?.toDate === "function" ? createdAt.toDate() : createdAt,
  );
  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ==================== API Formatting ====================

/**
 * Formats a date to API format "YYYY-MM-DD".
 * @param {Date|string} date - Date to format
 * @returns {string|null} Date string in YYYY-MM-DD format or null
 */
export const formatDateToAPI = (date) => {
  if (!date) return null;
  const d = parseDate(date);
  if (!d) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Formats a Date/time object to API time format "HH:MM".
 * @param {Date|string} date - Date/time object to format
 * @returns {string|null} Time string in HH:MM format or null
 */
export const formatTimeToAPI = (date) => {
  if (!date) return null;
  const d = parseDate(date);
  if (!d) return null;
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

// ==================== DOB Formatting ====================

/**
 * Formats a date as "DD/MM/YYYY" for DOB display.
 * @param {Date} date - Date object
 * @returns {string} Formatted DOB string or ""
 */
export const formatDobDisplay = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return "";
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

/**
 * Formats a date as "YYYY-MM-DD" for DOB API payload.
 * @param {Date} date - Date object
 * @returns {string} Formatted DOB string for API or ""
 */
export const formatDobForApi = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// ==================== Relative Time ====================

/**
 * Returns a relative time string like "Just now", "5m ago", "2h ago", "3d ago".
 * Falls back to formatted date for older dates (7+ days).
 * @param {number|Date|string} input - Timestamp in milliseconds, Date, or date string
 * @returns {string} Relative time string or ""
 */
export const getRelativeTime = (input) => {
  const date = parseDate(input);
  if (!date) return "";

  const now = new Date();
  const diff = now - date;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return formatDisplayDate(date);
};

/**
 * Returns a translated relative time string.
 * Used for notifications where labels must be localized.
 * @param {string|Date|number} input - Date input
 * @param {Function} translate - Translation function
 * @param {string} prefix - Translation key prefix (e.g. "workerNotifications")
 * @returns {string} Translated relative time string
 */
export const getTranslatedRelativeTime = (input, translate, prefix) => {
  const date = parseDate(input);
  if (!date) return "";

  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1)
    return (
      interval +
      (interval === 1
        ? translate(`${prefix}.yearAgo`)
        : translate(`${prefix}.yearsAgo`))
    );
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1)
    return (
      interval +
      (interval === 1
        ? translate(`${prefix}.monthAgo`)
        : translate(`${prefix}.monthsAgo`))
    );
  interval = Math.floor(seconds / 86400);
  if (interval >= 1)
    return (
      interval +
      (interval === 1
        ? translate(`${prefix}.dayAgo`)
        : translate(`${prefix}.daysAgo`))
    );
  interval = Math.floor(seconds / 3600);
  if (interval >= 1)
    return (
      interval +
      (interval === 1
        ? translate(`${prefix}.hourAgo`)
        : translate(`${prefix}.hoursAgo`))
    );
  interval = Math.floor(seconds / 60);
  if (interval >= 1)
    return (
      interval +
      (interval === 1
        ? translate(`${prefix}.minuteAgo`)
        : translate(`${prefix}.minutesAgo`))
    );
  return translate(`${prefix}.justNow`);
};

// ==================== Chat Date Helpers ====================

/**
 * Returns a date separator label: "Today", "Yesterday", or formatted date.
 * @param {Date} date - Date to check
 * @param {Function} translate - Translation function for "Today"/"Yesterday" labels
 * @returns {string} Label string
 */
export const getDateSeparatorLabel = (date, translate) => {
  if (!date || isNaN(date.getTime())) return "";

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) return translate("chat.today");
  if (isYesterday) return translate("chat.yesterday");
  return formatDisplayDate(date);
};

/**
 * Returns a time display for chat messages: time if today, "Yesterday" if yesterday, or date.
 * @param {*} createdAt - Firestore Timestamp, Date, or milliseconds
 * @param {Function} translate - Translation function
 * @returns {string} Display string
 */
export const getChatTimeDisplay = (createdAt, translate) => {
  if (!createdAt) return "";
  const date = new Date(
    typeof createdAt?.toDate === "function" ? createdAt.toDate() : createdAt,
  );
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return translate("chat.yesterday");
  return formatDisplayDate(date);
};

/**
 * Resolves a Firestore timestamp (with .toDate()) or raw value to a Date object.
 * @param {*} createdAt - Firestore Timestamp, Date, number, or string
 * @returns {Date} Resolved Date
 */
export const resolveFirestoreDate = (createdAt) => {
  if (!createdAt) return new Date(0);
  if (typeof createdAt?.toDate === "function") return createdAt.toDate();
  return new Date(createdAt);
};

// ==================== UTC Date Helpers (for schedule tables) ====================

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DISPLAY_DATE_REGEX = /^\d{2}-\d{2}-\d{4}$/;

/**
 * Extracts the first 10 characters (date portion) from a datetime string.
 * @param {string} dateStr - Date or datetime string
 * @returns {string} Date-only portion
 */
export const extractDateOnly = (dateStr) => {
  if (typeof dateStr === "string" && dateStr.length >= 10) {
    return dateStr.substring(0, 10);
  }
  return dateStr;
};

/**
 * Parses an ISO date string (YYYY-MM-DD) into a UTC Date object.
 * @param {string} dateString - ISO date string
 * @returns {Date|null} UTC Date or null if invalid
 */
export const parseIsoDate = (dateString) => {
  const cleanDate = extractDateOnly(dateString);
  if (!cleanDate || !ISO_DATE_REGEX.test(cleanDate)) return null;
  const [year, month, day] = cleanDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

/**
 * Formats a Date object to ISO date string "YYYY-MM-DD" using UTC.
 * @param {Date} dateObj - Date object
 * @returns {string|null} ISO date string or null
 */
export const toIsoDate = (dateObj) => {
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return null;
  const year = dateObj.getUTCFullYear();
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Formats a UTC Date object as "DD Mon YYYY" using UTC methods.
 * @param {Date} dateObj - Date object (treated as UTC)
 * @returns {string} Formatted date string or "N/A"
 */
export const toDisplayDateUTC = (dateObj) => {
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return "N/A";
  const day = String(dateObj.getUTCDate()).padStart(2, "0");
  const month = MONTH_NAMES[dateObj.getUTCMonth()];
  const year = dateObj.getUTCFullYear();
  return `${day} ${month} ${year}`;
};

/**
 * Normalizes a date value to ISO format "YYYY-MM-DD".
 * Handles both ISO (YYYY-MM-DD) and display (DD-MM-YYYY) formats.
 * @param {string} dateValue - Date string in various formats
 * @returns {string|null} ISO date string or null
 */
export const normalizeToIsoDate = (dateValue) => {
  const cleanDate = extractDateOnly(dateValue);
  if (!cleanDate || typeof cleanDate !== "string") return null;
  if (ISO_DATE_REGEX.test(cleanDate)) return cleanDate;
  if (DISPLAY_DATE_REGEX.test(dateValue)) {
    const [day, month, year] = dateValue.split("-");
    return `${year}-${month}-${day}`;
  }
  return null;
};

/**
 * Generates an array of UTC Date objects for each day in a date range (inclusive).
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Date[]} Array of Date objects
 */
export const generateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return [];
  const start = new Date(
    Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate(),
    ),
  );
  const end = new Date(
    Date.UTC(
      endDate.getUTCFullYear(),
      endDate.getUTCMonth(),
      endDate.getUTCDate(),
    ),
  );
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return [];

  const days = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
};

// ==================== Review Date Formatting ====================

/**
 * Extracts and formats a date from a review's created_at field.
 * Handles formats like "2025-02-27 10:30:00" or "2025-02-27T10:30:00".
 * @param {string} createdAt - created_at string from the API
 * @returns {string} Formatted date or "N/A"
 */
export const formatReviewDate = (createdAt) => {
  if (!createdAt) return "N/A";
  return formatDisplayDate(createdAt);
};
