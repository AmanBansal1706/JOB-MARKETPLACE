import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  formatDisplayDate,
  formatTimeString,
  formatTimeFromDate,
} from "../../utils/dateFormatting";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import FormDateTimePicker from "./FormDateTimePicker";
import { colors, fonts } from "../../theme";
import { useTranslation } from "../../hooks/useTranslation";
import { useNavigation } from "@react-navigation/native";

const calendarIcon = require("../../assets/images/calender.png");
const clockIcon = require("../../assets/images/clock.png");

// ==================== Constants ====================
const MINIMUM_BREAK_MINUTES = 30;
const MIN_HOURS_FOR_BREAK = 6;

/**
 * Returns today's date at midnight (00:00:00.000).
 * Used for minimumDate props so that today is always selectable,
 * even late at night.
 */
const getStartOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const COL_WIDTHS = {
  DELETE: 30,
  SERIAL: 90,
  WORKER: 140,
  DATE: 110,
  TIME: 90,
  BREAK: 90,
  GAP: 8,
};

// ==================== Helper Functions ====================

/**
 * Format date string/object to DD Mon YYYY format
 */
const formatDate = (dateString, translate) => {
  if (!dateString) return translate("common.notAvailable");
  const formatted = formatDisplayDate(dateString);
  return formatted === "N/A" ? translate("common.notAvailable") : formatted;
};

/**
 * Format time string/object to HH:MM AM/PM format
 */
const formatTime = (timeString, translate) => {
  if (!timeString) return translate("common.notAvailable");
  if (timeString instanceof Date) {
    const result = formatTimeFromDate(timeString);
    return result === "N/A" ? translate("common.notAvailable") : result;
  }
  const result = formatTimeString(timeString);
  return result === "N/A" ? translate("common.notAvailable") : result;
};

/**
 * Find assigned worker for a given slot
 */
const findAssignedWorker = (slot, assignedWorkers = []) => {
  return assignedWorkers.find((w) => {
    const ws = w.slot;
    if (!ws || ws === "N/A") return false;
    if (typeof ws === "object" && ws.id && slot.id) {
      return String(ws.id) === String(slot.id);
    }
    return false;
  });
};

/**
 * Get worker display name
 */
const getWorkerDisplayName = (worker) => {
  if (!worker) return null;
  return worker.name || `${worker.firstName} ${worker.lastName}`;
};

/**
 * Calculate total hours for a slot
 * Returns only the hours between joining and finishing time (per day)
 * Dates are just for reference, not used in calculation
 * Handles overnight shifts correctly using time-component arithmetic.
 */
const calculateSlotHours = (joiningTime, finishTime, startDate, endDate) => {
  if (!joiningTime || !finishTime) return 0;

  const start = new Date(joiningTime);
  const end = new Date(finishTime);

  let durationMins =
    end.getHours() * 60 +
    end.getMinutes() -
    (start.getHours() * 60 + start.getMinutes());
  if (durationMins < 0) durationMins += 24 * 60; // Handle overnight crossing

  return durationMins / 60;
};

/**
 * Get break time warning for a slot
 */
const getSlotBreakWarning = (
  breakTime,
  joiningTime,
  finishTime,
  startDate,
  endDate,
  translate,
) => {
  const breaks = parseInt(breakTime, 10);
  const totalHours = calculateSlotHours(
    joiningTime,
    finishTime,
    startDate,
    endDate,
  );

  if (
    totalHours > MIN_HOURS_FOR_BREAK &&
    (!breakTime || isNaN(breaks) || breaks < MINIMUM_BREAK_MINUTES)
  ) {
    return translate("jobs.minimumBreakTimeWarning");
  }
  return "";
};

// ==================== Main Component ====================

/**
 * SlotManager - Component to manage/display multiple time slots for jobs
 * Used when schedule_type is "different"
 * Automatically creates slots based on number of workers
 *
 * Props:
 * @param {Array} slots - Array of slot objects
 * @param {Array} assignedWorkers - Array of assigned workers with slot info
 * @param {Function} onChange - Callback for slot updates (edit mode only)
 * @param {Number} numWorkers - Number of workers (edit mode only)
 * @param {Boolean} readOnly - If true, displays slots without edit controls
 * @param {String} variant - "card" (default with shadow) or "flat" (minimal styling)
 * @param {String} cardTitle - Custom title for the card
 * @param {Boolean} showTitle - Whether to display title
 * @param {Boolean} showAssignedWorkers - Whether to show assigned workers column
 */
export default function SlotManager({
  slots = [],
  assignedWorkers = [],
  showAssignedWorkers = true,
  onChange = () => {},
  numWorkers = 1,
  readOnly = false,
  variant = "card",
  cardTitle,
  showTitle = true,
  editJobMode = false,
  jobId = null,
}) {
  const { translate } = useTranslation();
  const navigation = useNavigation();
  const isFlat = variant === "flat";
  const title = cardTitle || translate("jobs.timeSchedules");

  // ==================== State - Break Time Modal ====================
  const [breakTimeModal, setBreakTimeModal] = useState({
    visible: false,
    slotId: null,
    currentValue: "",
    customInput: "",
  });

  // ==================== Layout (explicit widths) ====================
  // Avoid relying on percentage widths inside a horizontal ScrollView.
  // Explicit table widths are much more reliable across nested scroll views
  // and different parent layouts.
  const tableWidth = useMemo(() => {
    let colCount = 0;
    let width = 0;

    if (!readOnly) {
      width += COL_WIDTHS.DELETE;
      colCount++;
    }

    width += COL_WIDTHS.SERIAL;
    colCount++;

    if (showAssignedWorkers) {
      width += COL_WIDTHS.WORKER;
      colCount++;
    }

    width += COL_WIDTHS.DATE * 2;
    colCount += 2;

    width += COL_WIDTHS.TIME * 2;
    colCount += 2;

    // Add break time column (always shown)
    width += COL_WIDTHS.BREAK;
    colCount++;

    // Total width = sum of columns + gaps + padding + extra buffer for safety
    return width + (colCount - 1) * COL_WIDTHS.GAP + 16 + 24;
  }, [showAssignedWorkers, readOnly]);

  // ==================== Derived Data ====================

  const numWorkersInt = useMemo(
    () => parseInt(numWorkers, 10) || 1,
    [numWorkers],
  );
  const canAddMore = useMemo(
    () => slots.length < numWorkersInt,
    [slots.length, numWorkersInt],
  );

  // ==================== Effects ====================

  /**
   * Initialize slots based on numWorkers (edit mode only)
   */
  useEffect(() => {
    if (readOnly) return; // Skip initialization in read-only mode
    if (slots.length === 0 && numWorkersInt > 0) {
      const newSlots = Array.from({ length: numWorkersInt }, (_, i) => ({
        id: `${i + 1}`,
        start_date: null,
        end_date: null,
        joining_time: null,
        finish_time: null,
        break_time: "",
      }));
      onChange(newSlots);
    }
  }, [numWorkers, readOnly, slots.length, onChange]);

  // ==================== Handlers ====================

  /**
   * Add a new slot to the list
   */
  const handleAddSlot = () => {
    const newSlot = {
      id: `${slots.length + 1}`,
      start_date: null,
      end_date: null,
      joining_time: null,
      finish_time: null,
      break_time: "",
    };
    onChange([...slots, newSlot]);
  };

  /**
   * Remove a slot from the list
   */
  const handleRemoveSlot = (slotId) => {
    onChange(slots.filter((slot) => slot.id !== slotId));
  };

  /**
   * Update a specific field in a slot
   * Validates finish time against joining time (minimum 1 hour gap on same day)
   * Auto-sets break time to 30 mins if shift > 6 hours and break < 30
   */
  const handleUpdateSlot = (slotId, field, value) => {
    // Validate finish time against joining time (minimum 1 hour gap on same day)
    if (field === "finish_time" && value) {
      const slot = slots.find((s) => s.id === slotId);
      if (!slot) return;

      const isSameDay =
        slot.start_date &&
        slot.end_date &&
        new Date(slot.start_date).toDateString() ===
          new Date(slot.end_date).toDateString();

      if (isSameDay && slot.joining_time) {
        const joiningMins =
          new Date(slot.joining_time).getHours() * 60 +
          new Date(slot.joining_time).getMinutes();
        const finishMins = value.getHours() * 60 + value.getMinutes();

        if (finishMins >= joiningMins) {
          // Same-day (non-overnight) — enforce minimum 1-hour gap
          const minFinishTime = new Date(slot.joining_time);
          minFinishTime.setHours(minFinishTime.getHours() + 1);
          if (value < minFinishTime) {
            Alert.alert(
              translate("common.error"),
              translate("jobs.finishTimeError"),
            );
            onChange(
              slots.map((s) =>
                s.id === slotId ? { ...s, [field]: minFinishTime } : s,
              ),
            );
            return;
          }
        }
        // finishMins < joiningMins → overnight shift, allow as-is
      }
    }

    // Auto-set break time to 30 mins if shift > 6 hours and break < 30
    let updatedSlots = slots.map((slot) =>
      slot.id === slotId ? { ...slot, [field]: value } : slot,
    );

    // Check if we need to auto-set break time
    const updatedSlot = updatedSlots.find((s) => s.id === slotId);
    if (updatedSlot && (field === "finish_time" || field === "joining_time")) {
      const slotHours = calculateSlotHours(
        updatedSlot.joining_time,
        updatedSlot.finish_time,
        updatedSlot.start_date,
        updatedSlot.end_date,
      );
      const currentBreak = parseInt(updatedSlot.break_time, 10) || 0;

      // If shift > 6 hours and break < 30, auto-set to 30
      if (slotHours > 6 && currentBreak < 30) {
        updatedSlots = updatedSlots.map((s) =>
          s.id === slotId ? { ...s, break_time: "30" } : s,
        );
      }
    }

    onChange(updatedSlots);
  };

  const handleViewApplicants = () => {
    navigation.navigate("ActiveApplicants", {
      jobId: jobId,
      type: "active",
    });
  };

  /**
   * Open break time modal for a specific slot
   */
  const openBreakTimeModal = (slotId, currentBreakTime) => {
    setBreakTimeModal({
      visible: true,
      slotId,
      currentValue: currentBreakTime || "",
      customInput: currentBreakTime || "",
    });
  };

  /**
   * Close break time modal
   */
  const closeBreakTimeModal = () => {
    setBreakTimeModal({
      visible: false,
      slotId: null,
      currentValue: "",
      customInput: "",
    });
  };

  /**
   * Apply custom break time from modal
   */
  const applyCustomBreakTime = (breakTime) => {
    const breakValueParsed = parseInt(breakTime, 10);
    if (isNaN(breakValueParsed)) {
      Alert.alert(
        translate("common.error"),
        translate("jobs.enterValidBreakTime"),
      );
      return;
    }

    // Find current slot to determine total hours
    const slot = slots.find((s) => s.id === breakTimeModal.slotId);
    const totalHours = slot
      ? calculateSlotHours(
          slot.joining_time,
          slot.finish_time,
          slot.start_date,
          slot.end_date,
        )
      : 0;
    const isExceeding = totalHours > MIN_HOURS_FOR_BREAK;

    // Allow 0 only when total hours <= MIN_HOURS_FOR_BREAK
    if (!isExceeding || breakValueParsed >= MINIMUM_BREAK_MINUTES) {
      if (breakTimeModal.slotId) {
        handleUpdateSlot(
          breakTimeModal.slotId,
          "break_time",
          String(breakValueParsed),
        );
      }
      closeBreakTimeModal();
    } else {
      Alert.alert(
        translate("common.error"),
        translate("jobs.enterValidBreakTime"),
      );
    }
  };

  /**
   * Apply selected break time
   */
  const applyBreakTime = (breakTime) => {
    if (breakTimeModal.slotId) {
      handleUpdateSlot(breakTimeModal.slotId, "break_time", breakTime);
    }
    closeBreakTimeModal();
  };

  // ==================== Render Methods ====================

  /**
   * Render a table row for read-only mode
   */
  const renderReadOnlyRow = (slot, index) => {
    const assignedWorker = showAssignedWorkers
      ? findAssignedWorker(slot, assignedWorkers)
      : null;
    const workerName = getWorkerDisplayName(assignedWorker);

    return (
      <View
        key={slot.id || index}
        style={[styles.tableRow, { width: tableWidth, gap: COL_WIDTHS.GAP }]}
      >
        {/* Slot Number */}
        <Text style={[styles.serialCell, { width: COL_WIDTHS.SERIAL }]}>
          {translate("jobs.worker")} {index + 1}
        </Text>

        {/* Assigned Worker Column */}
        {showAssignedWorkers && (
          <View style={[styles.workerCell, { width: COL_WIDTHS.WORKER }]}>
            {assignedWorker ? (
              <Text style={styles.workerNameText} numberOfLines={2}>
                {workerName}
              </Text>
            ) : (
              <Text style={styles.noWorkerText}>
                {translate("common.notAvailable")}
              </Text>
            )}
          </View>
        )}

        {/* Date/Time Fields */}
        <View style={[styles.readOnlyDateCell, { width: COL_WIDTHS.DATE }]}>
          <Text style={styles.readOnlyCellText}>
            {formatDate(slot.start_date, translate)}
          </Text>
          <Image source={calendarIcon} style={styles.icon} />
        </View>

        <View style={[styles.readOnlyDateCell, { width: COL_WIDTHS.DATE }]}>
          <Text style={styles.readOnlyCellText}>
            {formatDate(slot.end_date, translate)}
          </Text>
          <Image source={calendarIcon} style={styles.icon} />
        </View>

        <View style={[styles.readOnlyTimeCell, { width: COL_WIDTHS.TIME }]}>
          <Text style={styles.readOnlyCellText}>
            {formatTime(slot.joining_time, translate)}
          </Text>
          <Image source={clockIcon} style={styles.icon} />
        </View>

        <View style={[styles.readOnlyTimeCell, { width: COL_WIDTHS.TIME }]}>
          <Text style={styles.readOnlyCellText}>
            {formatTime(slot.finish_time, translate)}
          </Text>
          <Image source={clockIcon} style={styles.icon} />
        </View>

        {/* Break Time */}
        <View style={[styles.readOnlyBreakCell, { width: COL_WIDTHS.BREAK }]}>
          <Text
            style={[
              styles.readOnlyCellText,
              {
                textAlign: "center",
                marginTop: 6,
              },
            ]}
          >
            {slot.break_time
              ? `${slot.break_time} min`
              : translate("common.notAvailable")}
          </Text>
        </View>
      </View>
    );
  };

  /**
   * Render a table row for edit mode
   */
  const renderEditableRow = (slot, index) => {
    const assignedWorker = showAssignedWorkers
      ? findAssignedWorker(slot, assignedWorkers)
      : null;
    const workerName = getWorkerDisplayName(assignedWorker);
    const breakWarning = getSlotBreakWarning(
      slot.break_time,
      slot.joining_time,
      slot.finish_time,
      slot.start_date,
      slot.end_date,
      translate,
    );

    return (
      <View key={slot.id || index}>
        <View
          style={[styles.tableRow, { width: tableWidth, gap: COL_WIDTHS.GAP }]}
        >
          {/* Delete Button - Only show if slots > numWorkers */}
          <View style={[styles.deleteButtonCell, { width: COL_WIDTHS.DELETE }]}>
            {slots.length > numWorkersInt && (
              <Pressable
                style={styles.removeButton}
                onPress={() => handleRemoveSlot(slot.id)}
              >
                <MaterialIcons name="delete" size={18} color="#F44336" />
              </Pressable>
            )}
          </View>

          {/* Slot Number */}
          <Text style={[styles.serialCell, { width: COL_WIDTHS.SERIAL }]}>
            {translate("jobs.worker")} {index + 1}
          </Text>

          {/* Assigned Worker Column */}
          {showAssignedWorkers && (
            <View style={[styles.workerCell, { width: COL_WIDTHS.WORKER }]}>
              {editJobMode && jobId && (
                <Pressable
                  onPress={handleViewApplicants}
                  style={{ marginRight: 4 }}
                >
                  <MaterialIcons name="edit" size={18} color={colors.primary} />
                </Pressable>
              )}
              {assignedWorker ? (
                <Text style={styles.workerNameText} numberOfLines={2}>
                  {workerName}
                </Text>
              ) : (
                <Text style={styles.noWorkerText}>
                  {translate("common.notAvailable")}
                </Text>
              )}
            </View>
          )}

          {/* Start Date Picker */}
          <View style={[styles.datePickerCell, { width: COL_WIDTHS.DATE }]}>
            <FormDateTimePicker
              value={slot.start_date}
              onChange={(date) => handleUpdateSlot(slot.id, "start_date", date)}
              mode="date"
              compact
              minimumDate={getStartOfToday()}
            />
          </View>

          {/* End Date Picker */}
          <View style={[styles.datePickerCell, { width: COL_WIDTHS.DATE }]}>
            <FormDateTimePicker
              value={slot.end_date}
              onChange={(date) => handleUpdateSlot(slot.id, "end_date", date)}
              mode="date"
              compact
              minimumDate={slot.start_date || getStartOfToday()}
            />
          </View>

          {/* Joining Time Picker */}
          <View style={[styles.timePickerCell, { width: COL_WIDTHS.TIME }]}>
            <FormDateTimePicker
              value={slot.joining_time}
              onChange={(time) =>
                handleUpdateSlot(slot.id, "joining_time", time)
              }
              mode="time"
              compact
            />
          </View>

          {/* Finish Time Picker */}
          <View style={[styles.timePickerCell, { width: COL_WIDTHS.TIME }]}>
            <FormDateTimePicker
              value={slot.finish_time}
              onChange={(time) =>
                handleUpdateSlot(slot.id, "finish_time", time)
              }
              mode="time"
              compact
            />
          </View>

          {/* Break Time Input */}
          <View style={[styles.breakInputCell, { width: COL_WIDTHS.BREAK }]}>
            <Pressable
              style={({ pressed }) => [
                styles.breakTimeButton,
                pressed && styles.breakTimeButtonPressed,
                breakWarning && styles.breakTimeButtonWarning,
              ]}
              onPress={() => openBreakTimeModal(slot.id, slot.break_time)}
            >
              <Text style={styles.breakTimeButtonText}>
                {slot.break_time ? `${slot.break_time}` : "--"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Break Time Warning - Display below the row */}
        {breakWarning && (
          <Text style={styles.breakTimeWarning}>{breakWarning}</Text>
        )}
      </View>
    );
  };

  /**
   * Render break time selection modal
   */
  const renderBreakTimeModal = () => {
    const rawInput = breakTimeModal.customInput;
    const customValueParsed = parseInt(rawInput, 10);
    const isNumeric = !isNaN(customValueParsed);
    const customValue = isNumeric ? customValueParsed : 0;

    // Find the slot to get join/finish times
    const currentSlot = slots.find((s) => s.id === breakTimeModal.slotId);
    if (!currentSlot) return null;

    // Check if join and finish times are set
    const hasJoinTime = !!currentSlot.joining_time;
    const hasFinishTime = !!currentSlot.finish_time;
    const timesNotSet = !hasJoinTime || !hasFinishTime;

    // Calculate total hours and check if exceeding 6 hours
    const totalHours = calculateSlotHours(
      currentSlot.joining_time,
      currentSlot.finish_time,
      currentSlot.start_date,
      currentSlot.end_date,
    );
    const isExceeding = totalHours > MIN_HOURS_FOR_BREAK;

    // Check if break time passes validation
    // Valid if: hours <= 6 OR (hours > 6 AND break >= 30)
    const isBreakTimeValid =
      !isExceeding ||
      (isExceeding && isNumeric && customValue >= MINIMUM_BREAK_MINUTES);

    return (
      <Modal
        visible={breakTimeModal.visible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeBreakTimeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalOverlay}>
            <SafeAreaView style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {translate("jobs.breakTimeMin")}
                </Text>
                <Pressable
                  onPress={closeBreakTimeModal}
                  style={({ pressed }) => [
                    styles.modalCloseButton,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <MaterialIcons name="close" size={24} color="#434545" />
                </Pressable>
              </View>

              {/* Custom Input Section */}
              <View style={styles.customSection}>
                {/* Show message if times not set */}
                {timesNotSet && (
                  <Text style={styles.setTimesFirstText}>
                    {translate("jobs.setTimesFirstMessage")}
                  </Text>
                )}

                <View style={styles.customInputContainer}>
                  <TextInput
                    style={styles.customInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={breakTimeModal.customInput}
                    onChangeText={(text) =>
                      setBreakTimeModal({
                        ...breakTimeModal,
                        customInput: text,
                      })
                    }
                    placeholderTextColor="#999"
                    editable={!timesNotSet}
                  />
                  <Text style={styles.customInputUnit}>min</Text>
                </View>

                {/* Validation Message */}
                {!timesNotSet &&
                  isExceeding &&
                  isNumeric &&
                  !isBreakTimeValid && (
                    <Text style={styles.validationErrorText}>
                      {translate("jobs.minimumBreakTimeWarning")}
                    </Text>
                  )}
                {!timesNotSet &&
                  isExceeding &&
                  isNumeric &&
                  isBreakTimeValid && (
                    <Text style={styles.validationSuccessText}>
                      ✓ {translate("jobs.breakTimeValid")}
                    </Text>
                  )}
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonGroup}>
                <Pressable
                  style={({ pressed }) => [
                    styles.cancelButton,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={closeBreakTimeModal}
                >
                  <Text style={styles.cancelButtonText}>
                    {translate("common.cancel")}
                  </Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.applyButton,
                    (timesNotSet || !isNumeric || !isBreakTimeValid) &&
                      styles.applyButtonDisabled,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => {
                    if (timesNotSet) {
                      Alert.alert(
                        translate("common.error"),
                        translate("jobs.setTimesFirstMessage"),
                      );
                    } else if (
                      isNumeric &&
                      isBreakTimeValid &&
                      customValue >= 0
                    ) {
                      applyCustomBreakTime(customValue.toString());
                    } else {
                      Alert.alert(
                        translate("common.error"),
                        translate("jobs.enterValidBreakTime"),
                      );
                    }
                  }}
                  disabled={timesNotSet || !isNumeric || !isBreakTimeValid}
                >
                  <Text style={styles.applyButtonText}>
                    {translate("common.apply")}
                  </Text>
                </Pressable>
              </View>
            </SafeAreaView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  /**
   * Render the table header
   */
  const renderTableHeader = () => {
    return (
      <View
        style={[
          styles.tableHeaderRow,
          { width: tableWidth, gap: COL_WIDTHS.GAP },
        ]}
      >
        {!readOnly && <View style={{ width: COL_WIDTHS.DELETE }} />}
        <Text style={[styles.tableHeader, { width: COL_WIDTHS.SERIAL }]}>
          {translate("jobs.serialNo")}
        </Text>
        {showAssignedWorkers && (
          <Text style={[styles.tableHeader, { width: COL_WIDTHS.WORKER }]}>
            {translate("jobs.selectedWorker")}
          </Text>
        )}
        <Text style={[styles.tableHeader, { width: COL_WIDTHS.DATE }]}>
          {translate("jobs.startDate")}
        </Text>
        <Text style={[styles.tableHeader, { width: COL_WIDTHS.DATE }]}>
          {translate("jobs.endDate")}
        </Text>
        <Text style={[styles.tableHeader, { width: COL_WIDTHS.TIME }]}>
          {translate("jobs.join")}
        </Text>
        <Text style={[styles.tableHeader, { width: COL_WIDTHS.TIME }]}>
          {translate("jobs.finish")}
        </Text>
        <Text style={[styles.tableHeader, { width: COL_WIDTHS.BREAK }]}>
          {translate("jobs.breakTimeMin")}
        </Text>
      </View>
    );
  };

  // ==================== Main Render ====================

  return (
    <View style={[styles.container, isFlat && styles.flatContainer]}>
      {showTitle && <Text style={styles.title}>{title}</Text>}

      {/* Table Container - Fixed horizontal scroll issue */}
      <View style={styles.tableContainer}>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={true}
          persistentScrollbar={true}
          nestedScrollEnabled={true}
          scrollEventThrottle={16}
          contentContainerStyle={[styles.scrollContent, { width: tableWidth }]}
          bounces={false}
          overScrollMode="never"
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.tableWrapper, { width: tableWidth }]}>
            {/* Header Row */}
            {renderTableHeader()}

            {/* Data Rows */}
            {slots.map((slot, index) =>
              readOnly
                ? renderReadOnlyRow(slot, index)
                : renderEditableRow(slot, index),
            )}
          </View>
        </ScrollView>
      </View>

      {/* Add Slot Button (Edit Mode Only) - hidden when max slots reached */}
      {!readOnly && canAddMore && (
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={handleAddSlot}
        >
          <MaterialIcons name="add" size={18} color={colors.tertiary} />
          <Text style={styles.addButtonText}>{translate("jobs.addSlot")}</Text>
        </Pressable>
      )}

      {/* Break Time Selection Modal */}
      {!readOnly && renderBreakTimeModal()}
    </View>
  );
}

// ==================== Styles ====================

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    overflow: "visible",
  },
  flatContainer: {
    marginBottom: 0,
    backgroundColor: "transparent",
    borderRadius: 0,
    padding: 0,
    shadowColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
    overflow: "visible",
  },
  title: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: "#005943",
    marginBottom: 16,
  },
  tableContainer: {
    marginBottom: 0,
    width: "100%",
    overflow: "visible",
  },
  scrollContent: {
    paddingRight: 24,
    flexGrow: 0,
  },
  tableWrapper: {
    flexDirection: "column",
  },
  tableHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#E8F7F2",
    borderRadius: 8,
    marginBottom: 12,
    minHeight: 48,
  },
  tableHeader: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: "#434545",
    textAlign: "center",
    flexShrink: 0,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    // paddingVertical: 12,
    paddingHorizontal: 8,
    // gap: 4,
    marginBottom: 4,
    // backgroundColor: "#FAFAFA",
    borderRadius: 4,
    // minHeight: 56,
    borderBottomColor: "#EEE",
    borderBottomWidth: 1,
  },
  serialCell: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: "#7C7C7C",
    textAlign: "center",
    flexShrink: 0,
    justifyContent: "center",
    // minHeight: 32,
  },
  deleteButtonCell: {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 32,
  },
  datePickerCell: {
    flexShrink: 0,
    minHeight: 40,
  },
  timePickerCell: {
    flexShrink: 0,
    minHeight: 40,
  },
  readOnlyDateCell: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minHeight: 32,
  },
  readOnlyTimeCell: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minHeight: 32,
  },
  readOnlyBreakCell: {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 32,
  },
  breakInputCell: {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
  },
  breakInput: {
    width: "100%",
    height: 36,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 6,
    paddingHorizontal: 8,
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#434545",
    textAlign: "center",
    backgroundColor: "#FFF",
  },
  breakInputWarning: {
    borderColor: "#F44336",
    backgroundColor: "#FFEBEE",
  },
  breakTimeButton: {
    width: "100%",
    height: 33,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    marginBottom: 6.5,
  },
  breakTimeButtonPressed: {
    backgroundColor: "#F0F8F5",
    opacity: 0.8,
  },
  breakTimeButtonWarning: {
    borderColor: "#F44336",
    backgroundColor: "#FFEBEE",
  },
  breakTimeButtonText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textdark,
  },
  breakTimeWarning: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#F44336",
    marginTop: 4,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  readOnlyCellText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#7C7C7C",
    textAlign: "center",
    flex: 1,
  },
  icon: {
    width: 14,
    height: 14,
    resizeMode: "contain",
  },
  workerCell: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 6,
    minHeight: 40,
  },
  workerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    flexShrink: 0,
  },
  workerAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E8F7F2",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  workerInitial: {
    fontSize: 12,
    color: "#005943",
    fontFamily: fonts.semiBold,
  },
  workerNameText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: "#434545",
    flex: 1,
    flexWrap: "wrap",
  },
  noWorkerText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#7C7C7C",
  },
  actionHeader: {
    width: 50,
    flexShrink: 0,
    minHeight: 48,
  },
  removeButton: {
    // width: 50,
    // height: 40,
    // padding: 6,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.tertiary,
    borderStyle: "dashed",
    marginTop: 12,
  },
  addButtonDisabled: {
    borderColor: "#CCC",
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.tertiary,
    marginLeft: 6,
  },
  addButtonTextDisabled: {
    color: "#CCC",
  },
  // ==================== Modal Styles ====================
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 32,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
  },
  modalCloseButton: {
    padding: 4,
  },

  customSection: {
    marginBottom: 24,
  },
  customInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#DDD",
    borderRadius: 10,
    paddingRight: 12,
    backgroundColor: "#FFF",
  },
  customInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#434545",
  },
  customInputUnit: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: "#7C7C7C",
  },
  validationErrorText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#F44336",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  validationSuccessText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: "#4CAF50",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  setTimesFirstText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#FF9800",
    marginBottom: 12,
    paddingHorizontal: 4,
    fontStyle: "italic",
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 20,
    paddingTop: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: colors.tertiary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.tertiary,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.tertiary,
  },
  applyButtonDisabled: {
    backgroundColor: "#CCC",
  },
  applyButtonText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#FFF",
  },
});
