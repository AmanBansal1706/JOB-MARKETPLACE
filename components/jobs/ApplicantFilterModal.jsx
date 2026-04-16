import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { colors, fonts } from "../../theme";
import { useTranslation } from "../../hooks/useTranslation";
import { useFetchAllPositions } from "../../services/JobServices";

// ─── Constants ───────────────────────────────────────────────────────────────

const EXPERIENCE_LEVELS = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "expert", label: "Expert" },
];

const RADIUS_OPTIONS = [
  { id: 10, label: "10km" },
  { id: 25, label: "25km" },
  { id: 50, label: "50km" },
  { id: 100, label: "100km" },
  { id: 250, label: "250km" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

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
    fontFamily: fonts.semiBold,
    color: "#000",
    marginTop: 18,
    marginBottom: 8,
  },
});

function PillSelect({ options, value, onSelect, isPending }) {
  if (isPending) {
    return (
      <View style={pillStyles.loaderContainer}>
        <ActivityIndicator size="small" color={colors.tertiary} />
      </View>
    );
  }

  return (
    <View style={pillStyles.row}>
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <TouchableOpacity
            key={opt.id}
            style={[pillStyles.pill, active && pillStyles.pillActive]}
            onPress={() => onSelect(active ? null : opt.id)}
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
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.authPalette.border || "#C4D4CC",
    backgroundColor: colors.home.cardLight || "#E8F7F2",
  },
  pillActive: {
    borderColor: colors.tertiary,
    backgroundColor: colors.tertiary,
  },
  label: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: "#444",
  },
  labelActive: {
    color: "#FFF",
  },
  loaderContainer: {
    paddingVertical: 10,
    alignItems: "flex-start",
  },
});

function RatingSelector({ value, onSelect }) {
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
              size={30}
              color={
                star <= value
                  ? "#FFB300"
                  : colors.authPalette.border || "#C4D4CC"
              }
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const ratingStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.home.cardLight || "#E8F7F2",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: colors.authPalette.border || "#C4D4CC",
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  starButton: {
    padding: 2,
  },
});

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ApplicantFilterModal({
  visible,
  onClose,
  filters,
  onApplyFilters,
}) {
  const { translate } = useTranslation();
  const { data: positionsData, isPending: loadingPositions } =
    useFetchAllPositions();

  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    if (visible) {
      setLocalFilters(filters);
    }
  }, [visible, filters]);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      position_id: null,
      experience_level: null,
      min_rating: null,
      radius_km: null,
    };
    setLocalFilters(resetFilters);
    onApplyFilters(resetFilters);
    onClose();
  };

  const updateFilter = useCallback((key, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const positionOptions = useMemo(() => {
    const raw = positionsData?.data?.positions || positionsData?.data || [];
    return raw.map((p) => ({ id: p.id, label: p.name }));
  }, [positionsData]);

  const experienceOptions = useMemo(() => {
    return EXPERIENCE_LEVELS.map((level) => ({
      ...level,
      label: translate(`experience.${level.id}`) || level.label,
    }));
  }, [translate]);

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
                <Ionicons name="arrow-back" size={18} color="#000" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {translate("jobs.filterTitle")}{" "}
                <Text style={styles.modalTitleThin}>
                  {translate("jobs.applicants")}
                </Text>
              </Text>
              <TouchableOpacity onPress={handleReset}>
                <Text style={styles.clearText}>
                  {translate("common.clear")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalBodyContent}
            >
              <FilterLabel text={translate("jobs.position")} noMargin />
              <PillSelect
                options={positionOptions}
                value={localFilters.position_id}
                onSelect={(v) => updateFilter("position_id", v)}
                isPending={loadingPositions}
              />

              <FilterLabel text={translate("jobs.experienceLevel")} />
              <PillSelect
                options={experienceOptions}
                value={localFilters.experience_level}
                onSelect={(v) => updateFilter("experience_level", v)}
              />

              <FilterLabel text={translate("jobs.minRating")} />
              <RatingSelector
                value={localFilters.min_rating}
                onSelect={(v) => updateFilter("min_rating", v)}
              />

              <FilterLabel text={translate("jobs.radiusKm")} />
              <PillSelect
                options={RADIUS_OPTIONS}
                value={localFilters.radius_km}
                onSelect={(v) => updateFilter("radius_km", v)}
              />

              <View style={{ height: 20 }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.applyRow}>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApply}
              >
                <Text style={styles.applyButtonText}>
                  {translate("common.applyFilters")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
        <TouchableOpacity
          style={styles.modalCloseOverlay}
          onPress={onClose}
          activeOpacity={1}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalSafeArea: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    maxHeight: "85%",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 15,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  modalCloseOverlay: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    paddingVertical: 15,
  },
  modalBackButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#EEE",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: "#000",
  },
  modalTitleThin: {
    fontFamily: fonts.regular,
    color: "#666",
  },
  clearText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.error || "#D32F2F",
  },
  modalBody: {
    maxHeight: 450,
  },
  modalBodyContent: {
    paddingHorizontal: 25,
    paddingBottom: 10,
  },
  applyRow: {
    paddingHorizontal: 25,
    paddingTop: 10,
    paddingBottom: 10,
  },
  applyButton: {
    backgroundColor: colors.tertiary,
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
    elevation: 4,
    shadowColor: colors.tertiary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: fonts.bold,
  },
});
