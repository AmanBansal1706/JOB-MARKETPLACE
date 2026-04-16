import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@expo/vector-icons";
import { colors, fonts } from "../../theme";
import {
  formatDisplayDate,
  formatTimeFromDate,
} from "../../utils/dateFormatting";

/**
 * FormDateTimePicker - A reusable date and time picker component
 * Supports both date and time modes with optional minimum time constraint
 */
export default function FormDateTimePicker({
  label,
  value,
  onChange,
  mode = "date",
  placeholder,
  error,
  compact = false,
  required = false,
  showEditIcon = false,
  minimumDate = null,
  maximumDate = null,
  startDate = null, // For time mode: start date to check if same day
  joiningTime = null, // For finish time: joining time to enforce 1hr gap
  endDate = null, // For finish time validation
}) {
  const [show, setShow] = useState(false);

  /**
   * Calculate effective minimum date for time picker
   * If in time mode with same day schedule, enforce 1-hour gap from joining time
   */
  const getEffectiveMinimumDate = () => {
    if (mode !== "time" || !joiningTime || !startDate || !endDate) {
      return minimumDate;
    }

    // Check if start and end dates are the same
    if (startDate.toDateString() !== endDate.toDateString()) {
      return minimumDate;
    }

    // For finish time on same day, enforce 1-hour gap from joining time
    const minTime = new Date(joiningTime);
    minTime.setHours(minTime.getHours() + 1);
    return minTime;
  };

  const onChangeInternal = (event, selectedDate) => {
    setShow(false);
    if (event.type === "set" && selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return formatDisplayDate(date);
  };

  const formatTime = (date) => {
    if (!date) return "";
    return formatTimeFromDate(date);
  };

  const displayValue = mode === "date" ? formatDate(value) : formatTime(value);
  const iconSource =
    mode === "date"
      ? require("../../assets/images/calender.png")
      : require("../../assets/images/clock.png");

  return (
    <View style={styles.container}>
      {!compact && label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label} {required && <Text style={styles.required}>*</Text>}
          </Text>
          {showEditIcon && (
            <MaterialIcons
              name="edit"
              size={14}
              color="#666"
              style={{ marginLeft: 4 }}
            />
          )}
        </View>
      )}
      <Pressable
        style={({ pressed }) => [
          compact ? styles.compactInputContainer : styles.inputContainer,
          error && styles.inputError,
          { opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={() => setShow(true)}
      >
        <Text
          style={[
            compact ? styles.compactInputText : styles.inputText,
            !value && styles.placeholderText,
          ]}
        >
          {displayValue || placeholder}
        </Text>
        {!compact && <Image source={iconSource} style={styles.icon} />}
        {compact && <Image source={iconSource} style={styles.compactIcon} />}
      </Pressable>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode={mode}
          is24Hour={false}
          display="default"
          onChange={onChangeInternal}
          minimumDate={getEffectiveMinimumDate()}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: "#000",
    marginRight: 8,
  },
  required: {
    color: "#F44336",
  },
  editIcon: {
    width: 12,
    height: 12,
    resizeMode: "contain",
    tintColor: "#666",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  compactInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9F9F9",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  inputError: {
    borderColor: "#F44336",
  },
  inputText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textdark,
  },
  compactInputText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textdark,
    flex: 1,
    marginRight: 4,
  },
  placeholderText: {
    color: "#999",
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  compactIcon: {
    width: 16,
    height: 16,
    resizeMode: "contain",
  },
  errorText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#F44336",
    marginTop: 4,
  },
});
