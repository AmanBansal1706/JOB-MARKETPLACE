import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import colors from "../../theme/worker/colors";
import { useTranslation } from "../../hooks/useTranslation";
import {
  formatDisplayDate,
  formatTimeString,
} from "../../utils/dateFormatting";
import { useFetchPositions } from "../../services/WorkerProfileServices";

// ─── Constants ───────────────────────────────────────────────────────────────

export const EMPTY_FILTERS = {
  position: null,
  experience_level: null,
  min_pay_rate: "",
  start_date: null,
  end_date: null,
  start_time: null,
  end_time: null,
  min_business_rating: 0,
  min_distance: "",
  max_distance: "",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Single-select pill row */
function PillSelect({ options, value, onSelect, isPending }) {
  if (isPending) {
    return (
      <View style={{ paddingVertical: 10 }}>
        <ActivityIndicator size="small" color={colors.primary.pink} />
      </View>
    );
  }
  return (
    <View style={pillStyles.row}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[pillStyles.pill, active && pillStyles.pillActive]}
            onPress={() => onSelect(active ? null : opt.value)}
            activeOpacity={0.7}
          >
            <Text style={[pillStyles.label, active && pillStyles.labelActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const pillStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.ui.inputBorder,
    backgroundColor: colors.ui.inputPinkBackground,
  },
  pillActive: {
    borderColor: colors.primary.pink,
    backgroundColor: colors.primary.pink + "1A", // 10% opacity tint
  },
  label: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    color: colors.text.secondary,
  },
  labelActive: {
    color: colors.primary.pink,
  },
});

/** Filter section label */
function FilterLabel({ text, noMargin }) {
  return (
    <Text style={[filterLabelStyles.text, noMargin && { marginTop: 0 }]}>
      {text}
    </Text>
  );
}
const filterLabelStyles = StyleSheet.create({
  text: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: colors.black,
    marginTop: 16,
    marginBottom: 4,
  },
});

/** Small text input used within the filter modal */
function FilterInput({
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
}) {
  return (
    <TextInput
      style={filterInputStyles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.text.secondary}
      keyboardType={keyboardType}
    />
  );
}
const filterInputStyles = StyleSheet.create({
  input: {
    height: 44,
    borderWidth: 1.5,
    borderColor: colors.ui.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.primary,
    backgroundColor: colors.ui.inputPinkBackground,
  },
});

/** Star-based rating selector */
function RatingSlider({ value, onSelect, translate }) {
  return (
    <View style={ratingStyles.container}>
      <View style={ratingStyles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onSelect(value === star ? 0 : star)}
            activeOpacity={0.7}
            style={ratingStyles.starButton}
          >
            <FontAwesome
              name={star <= value ? "star" : "star-o"}
              size={28}
              color={star <= value ? "#FBC02D" : colors.ui.inputBorder}
            />
          </TouchableOpacity>
        ))}
      </View>
      {/* <Text style={ratingStyles.valueText}>
        {value > 0
          ? translate("workerSearch.starsPlus", { value })
          : translate("workerSearch.anyRating")}
      </Text> */}
    </View>
  );
}

const ratingStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    backgroundColor: colors.ui.inputPinkBackground,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.ui.inputBorder,
  },
  starsRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 8,
  },
  starButton: {
    padding: 2,
  },
  valueText: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    color: colors.text.primary,
    minWidth: 100, // Increased for longer translations
    textAlign: "right",
    flexShrink: 1,
  },
});

/** Clickable date/time display that opens the picker */
function DateTimeInput({ value, placeholder, mode, onSelect }) {
  const [showPicker, setShowPicker] = useState(false);

  const displayValue = value
    ? mode === "date"
      ? formatDisplayDate(value)
      : formatTimeString(
          value.toLocaleTimeString([], {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          }),
        )
    : placeholder;

  const handleChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) {
      onSelect(selectedDate);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={dateTimeInputStyles.container}
        onPress={() => setShowPicker(true)}
      >
        <Text
          style={[
            dateTimeInputStyles.text,
            !value && dateTimeInputStyles.placeholder,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {displayValue}
        </Text>
        <Ionicons
          name={mode === "date" ? "calendar-outline" : "time-outline"}
          size={16}
          color={colors.text.secondary}
          style={{ marginLeft: 4 }}
        />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode={mode}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const dateTimeInputStyles = StyleSheet.create({
  container: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: colors.ui.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.ui.inputPinkBackground,
  },
  text: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: colors.text.primary,
    flex: 1,
    marginRight: 4,
  },
  placeholder: {
    color: colors.text.secondary,
  },
});

// ─── Main Component ──────────────────────────────────────────────────────────

const JobFilterModal = ({ visible, onClose, appliedFilters, onApply }) => {
  const { translate } = useTranslation();
  const [draftFilters, setDraftFilters] = useState({ ...EMPTY_FILTERS });

  const { data: apiPositions, isPending: positionsLoading } = useFetchPositions();

  // Translated Options
  const positionOptions = useMemo(() => {
    if (!apiPositions) return [];
    return apiPositions.map((p) => ({
      label: p.name,
      value: p.name, // Using name as value to match existing filter logic
    }));
  }, [apiPositions]);

  const experienceOptions = useMemo(
    () => [
      { label: translate("workerSearch.beginner"), value: "beginner" },
      { label: translate("workerSearch.intermediate"), value: "intermediate" },
      { label: translate("workerSearch.expert"), value: "expert" },
    ],
    [translate],
  );

  // Sync draft filters with applied filters when modal opens
  useEffect(() => {
    if (visible) {
      setDraftFilters({ ...appliedFilters });
    }
  }, [visible, appliedFilters]);

  const updateDraft = useCallback((key, value) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleApply = () => {
    onApply(draftFilters);
  };

  const clearFilters = () => {
    onApply({ ...EMPTY_FILTERS });
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView edges={["top"]} style={styles.modalSafeArea}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={onClose}
                style={styles.modalBackButton}
              >
                <Ionicons name="arrow-back" size={18} color={colors.black} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {translate("workerSearch.filterJob")}
              </Text>
              <TouchableOpacity onPress={clearFilters}>
                <Text style={styles.clearText}>
                  {translate("workerCommon.clear")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Scrollable filter body */}
            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalBodyContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Position */}
              <FilterLabel text={translate("workerSearch.position")} />
              <PillSelect
                options={positionOptions}
                value={draftFilters.position}
                onSelect={(v) => updateDraft("position", v)}
                isPending={positionsLoading}
              />

              {/* Experience Level */}
              <FilterLabel text={translate("workerSearch.experienceLevel")} />
              <PillSelect
                options={experienceOptions}
                value={draftFilters.experience_level}
                onSelect={(v) => updateDraft("experience_level", v)}
              />

              {/* Pay Rate */}
              <FilterLabel text={translate("workerSearch.payRate")} />
              <FilterInput
                value={draftFilters.min_pay_rate}
                onChangeText={(v) => updateDraft("min_pay_rate", v)}
                placeholder={translate("workerSearch.payRatePlaceholder")}
                keyboardType="numeric"
              />

              {/* Date Filters */}
              <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
                  <FilterLabel
                    text={translate("workerHome.startDate")}
                    noMargin
                  />
                  <DateTimeInput
                    mode="date"
                    value={draftFilters.start_date}
                    onSelect={(date) => updateDraft("start_date", date)}
                    placeholder={translate("workerSearch.selectDate")}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <FilterLabel
                    text={translate("workerHome.endDate")}
                    noMargin
                  />
                  <DateTimeInput
                    mode="date"
                    value={draftFilters.end_date}
                    onSelect={(date) => updateDraft("end_date", date)}
                    placeholder={translate("workerSearch.selectDate")}
                  />
                </View>
              </View>

              {/* Time Filters */}
              <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
                  <FilterLabel
                    text={translate("workerSearch.startTime")}
                    noMargin
                  />
                  <DateTimeInput
                    mode="time"
                    value={draftFilters.start_time}
                    onSelect={(time) => updateDraft("start_time", time)}
                    placeholder={translate("workerSearch.selectTime")}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <FilterLabel
                    text={translate("workerSearch.endTime")}
                    noMargin
                  />
                  <DateTimeInput
                    mode="time"
                    value={draftFilters.end_time}
                    onSelect={(time) => updateDraft("end_time", time)}
                    placeholder={translate("workerSearch.selectTime")}
                  />
                </View>
              </View>

              {/* Business Rating */}
              <FilterLabel text={translate("workerSearch.businessRating")} />
              <RatingSlider
                value={draftFilters.min_business_rating}
                translate={translate}
                onSelect={(v) => updateDraft("min_business_rating", v)}
              />

              {/* Distance Range */}
              <FilterLabel text={translate("workerSearch.distanceRange")} />
              <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
                  <FilterInput
                    value={draftFilters.min_distance}
                    onChangeText={(v) => updateDraft("min_distance", v)}
                    placeholder={translate("workerTransactions.min")}
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.toLabel}>–</Text>
                <View style={{ flex: 1 }}>
                  <FilterInput
                    value={draftFilters.max_distance}
                    onChangeText={(v) => updateDraft("max_distance", v)}
                    placeholder={translate("workerTransactions.max")}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>

            {/* Apply button */}
            <View style={styles.applyRow}>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApply}
                activeOpacity={0.85}
              >
                <Text style={styles.applyButtonText}>
                  {translate("workerSearch.applyFilters")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
        <TouchableOpacity style={styles.modalCloseOverlay} onPress={onClose} />
      </View>
    </Modal>
  );
};

export default JobFilterModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalSafeArea: {
    backgroundColor: colors.auth.background,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    maxHeight: "85%",
  },
  modalContent: {
    backgroundColor: colors.auth.background,
    paddingBottom: 10,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  modalCloseOverlay: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    paddingVertical: 10,
  },
  modalBackButton: {
    width: 30,
    height: 30,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.text.tertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: colors.black,
  },
  clearText: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary.pink,
  },
  modalBody: {
    maxHeight: 480,
  },
  modalBodyContent: {
    paddingHorizontal: 25,
    paddingBottom: 10,
  },
  rowInputs: {
    flexDirection: "row",
    alignItems: "flex-end", // Align to bottom so labels don't push inputs differently
    gap: 10,
    marginTop: 8,
  },
  toLabel: {
    fontSize: 18,
    color: colors.text.secondary,
    fontFamily: "Poppins_400Regular",
  },
  applyRow: {
    paddingHorizontal: 25,
    paddingTop: 16,
    paddingBottom: 6,
  },
  applyButton: {
    backgroundColor: colors.primary.pink,
    borderRadius: 30,
    paddingVertical: 10,
    alignItems: "center",
  },
  applyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
});
