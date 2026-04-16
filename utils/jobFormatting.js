/**
 * Job Formatting Utilities
 * Common formatting and calculation functions used across job detail screens
 */
import {
  formatDisplayDate,
  formatTimeString,
  formatDateToAPI as _formatDateToAPI,
  formatTimeToAPI as _formatTimeToAPI,
  parseDate,
} from "./dateFormatting";

const MS_IN_DAY = 24 * 60 * 60 * 1000;

/**
 * Returns the inclusive number of days between two dates.
 * Defaults to 1 if dates are missing or invalid.
 */
const getInclusiveDayCount = (startDate, endDate) => {
  if (!startDate || !endDate) return 1;
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
  const diffMs = end - start;
  if (diffMs < 0) return 1;
  return Math.floor(diffMs / MS_IN_DAY) + 1;
};

/**
 * Formats a date string to "DD Mon YYYY" format (e.g. "27 Feb 2025")
 * Delegates to centralized formatDisplayDate from dateFormatting.js
 * @param {string} dateString - ISO date string or date to format
 * @param {string} separator - DEPRECATED: kept for backward compatibility but ignored
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, separator = "/") => {
  return formatDisplayDate(dateString);
};

/**
 * Formats a time string from HH:MM:SS to 12-hour format (HH:MM AM/PM)
 * Delegates to centralized formatTimeString from dateFormatting.js
 * @param {string} timeString - Time in HH:MM:SS format
 * @returns {string} Formatted time string
 */
export const formatTime = (timeString) => {
  return formatTimeString(timeString);
};

/**
 * Combines date and time into a formatted datetime string
 * @param {string} dateString - ISO date string
 * @param {string} timeString - Time in HH:MM:SS format
 * @param {string} separator - Separator between date and time (default: ' • ')
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (dateString, timeString, separator = " • ") => {
  if (!dateString || !timeString) return "N/A";
  return `${formatDisplayDate(dateString)}${separator}${formatTimeString(timeString)}`;
};

/**
 * Formats a number as currency with USD symbol
 * @param {number} amount - Amount to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, decimals = 2) => {
  if (amount === null || amount === undefined) return "$0";
  return `$${Number(amount).toFixed(decimals)}`;
};

/**
 * Capitalizes the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalizeFirst = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Calculates the total hours of the job
 * @param {string} joiningTime - Start time in HH:MM:SS format
 * @param {string} finishTime - End time in HH:MM:SS format
 * @param {string} scheduleType - Schedule type ('same' or 'different')
 * @param {Array} slots - Array of slots (required when scheduleType is 'different')
 * @param {number} numWorkers - Number of workers (required when scheduleType is 'same')
 * @returns {string} Total hours of the job (sum of all workers' hours)
 */
export const calculateShiftDuration = (
  joiningTime,
  finishTime,
  scheduleType = "same",
  slots = [],
  numWorkers = 1,
  startDate,
  endDate,
) => {
  const calculateHours = (joinTime, finishTime) => {
    if (!joinTime || !finishTime) return 0;
    const [joinHour, joinMin] = joinTime.split(":").map(Number);
    const [finishHour, finishMin] = finishTime.split(":").map(Number);
    if (
      Number.isNaN(joinHour) ||
      Number.isNaN(joinMin) ||
      Number.isNaN(finishHour) ||
      Number.isNaN(finishMin)
    ) {
      return 0;
    }
    const joinMinutes = joinHour * 60 + joinMin;
    const finishMinutes = finishHour * 60 + finishMin;
    const durationMinutes =
      finishMinutes >= joinMinutes
        ? finishMinutes - joinMinutes
        : 1440 - joinMinutes + finishMinutes;
    return durationMinutes / 60;
  };

  const formatHoursResult = (value) => `${Number(value.toFixed(2))}`;

  // For same schedule type, return total hours (hours per worker × number of workers × days)
  if (scheduleType === "same") {
    const hours = calculateHours(joiningTime, finishTime);
    const dayCount = getInclusiveDayCount(startDate, endDate);
    const totalHours = hours * numWorkers * dayCount;
    return totalHours > 0 ? formatHoursResult(totalHours) : "N/A";
  }

  // For different schedule type, calculate total hours (sum of all workers' hours in the job)
  if (scheduleType === "different" && slots && slots.length > 0) {
    let totalHours = 0;
    slots.forEach((slot) => {
      const hours = calculateHours(slot.joining_time, slot.finish_time);
      if (hours <= 0) return;
      const slotDayCount =
        slot.start_date && slot.end_date
          ? getInclusiveDayCount(slot.start_date, slot.end_date)
          : getInclusiveDayCount(startDate, endDate);
      totalHours += hours * slotDayCount;
    });
    return totalHours > 0 ? formatHoursResult(totalHours) : "N/A";
  }

  return "N/A";
};

/**
 * Formats a job status to a human-readable string
 * @param {string} status - Job status from API
 * @returns {string} Formatted status string
 */
export const formatStatus = (status) => {
  const statusMap = {
    pending: "Pending",
    active: "Active",
    completed: "Completed",
    cancelled: "Cancelled",
    disputed: "Disputed",
    in_review: "In Review",
    disputed_completed: "Disputed",
  };
  return statusMap[status] || capitalizeFirst(status);
};

/**
 * Parses a time string (HH:MM:SS) to a Date object
 * Useful for time pickers and SlotManager components
 * @param {string} timeString - Time in HH:MM:SS format
 * @returns {Date|null} Date object with time set, or null if invalid
 */
export const parseTimeToDate = (timeString) => {
  if (!timeString) return null;
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
};

/**
 * Converts time string to ISO time format (HH:MM)
 * @param {string} timeString - Time in HH:MM:SS format
 * @returns {string} ISO time format HH:MM
 */
export const timeStringToISO = (timeString) => {
  if (!timeString) return null;
  const [hours, minutes] = timeString.split(":").slice(0, 2);
  return `${hours}:${minutes}`;
};

/**
 * Parses API slots to form-compatible slots for SlotManager
 * @param {Array} apiSlots - Array of slots from API
 * @returns {Array} Transformed slots for SlotManager
 */
export const parseApiSlots = (apiSlots) => {
  if (!apiSlots || !Array.isArray(apiSlots)) return [];
  return apiSlots.map((slot) => ({
    id: slot.id,
    start_date: slot.start_date ? parseDate(slot.start_date) : null,
    end_date: slot.end_date ? parseDate(slot.end_date) : null,
    joining_time: parseTimeToDate(slot.joining_time),
    finish_time: parseTimeToDate(slot.finish_time),
    break_time: slot.break_time || "",
  }));
};

/**
 * Validates if a date string is valid
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid date
 */
export const isValidDate = (dateString) => {
  return parseDate(dateString) !== null;
};

/**
 * Converts hours to minutes
 * @param {number} hours - Number of hours
 * @returns {number} Number of minutes
 */
export const hoursToMinutes = (hours) => {
  return hours * 60;
};

/**
 * Converts minutes to hours (returns decimal)
 * @param {number} minutes - Number of minutes
 * @returns {number} Number of hours
 */
export const minutesToHours = (minutes) => {
  return minutes / 60;
};

/**
 * Gets difference between two times in minutes
 * @param {string} startTime - Start time in HH:MM:SS format
 * @param {string} endTime - End time in HH:MM:SS format
 * @returns {number} Difference in minutes
 */
export const getTimeDifferenceInMinutes = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);
  const startTotalMin = startHour * 60 + startMin;
  const endTotalMin = endHour * 60 + endMin;
  return endTotalMin >= startTotalMin
    ? endTotalMin - startTotalMin
    : 1440 - startTotalMin + endTotalMin;
};

/**
 * Formats a number with comma separators (e.g., 1,000.00)
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumberWithCommas = (num) => {
  if (!num && num !== 0) return "0";
  return Number(num).toLocaleString("en-US");
};

/**
 * Safely accesses nested object properties
 * @param {object} obj - Object to access
 * @param {string} path - Path to property (e.g., "location.address")
 * @param {*} defaultValue - Default value if path doesn't exist
 * @returns {*} Value at path or default value
 */
export const getNestedValue = (obj, path, defaultValue = "N/A") => {
  const value = path.split(".").reduce((current, prop) => current?.[prop], obj);
  return value !== undefined && value !== null ? value : defaultValue;
};

/**
 * Truncates a string and adds ellipsis if it exceeds max length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
export const truncateString = (str, maxLength = 50) => {
  if (!str) return "";
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + "...";
};

/**
 * Gets the number of days between two dates
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {number} Number of days
 */
export const getDaysBetween = (startDate, endDate) => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Checks if a position is a custom position (not in predefined list)
 * @param {string} position - Position name to check
 * @returns {boolean} True if position is custom
 */
export const isCustomPosition = (position) => {
  if (!position) return false;
  const predefinedPositions = ["Waiter", "Bartender", "Chef", "Cleaner"];
  return !predefinedPositions.includes(position);
};

/**
 * Formats a date to API format (YYYY-MM-DD)
 * Delegates to centralized formatDateToAPI from dateFormatting.js
 */
export const formatDateToAPI = _formatDateToAPI;

/**
 * Formats a date/time object to API time format (HH:MM)
 * Delegates to centralized formatTimeToAPI from dateFormatting.js
 */
export const formatTimeToAPI = _formatTimeToAPI;

/**
 * Formats a date/time object to API time format WITH SECONDS (HH:MM:SS)
 */
export const formatTimeToAPIWithSeconds = (date) => {
  if (!date) return null;
  const d = parseDate(date);
  if (!d) return null;
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};
