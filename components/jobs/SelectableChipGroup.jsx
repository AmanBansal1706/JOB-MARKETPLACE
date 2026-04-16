import React from "react";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors, fonts } from "../../theme";
import { useTranslation } from "../../hooks/useTranslation";

/**
 * SelectableChipGroup - A reusable component for displaying and selecting multiple items
 * Used for skills and responsibilities selection
 */
export default function SelectableChipGroup({
  items = [],
  selectedIds = [],
  onSelectionChange,
  label,
  loading = false,
  error = null,
  type = "skill", // 'skill' or 'responsibility'
  disabled = false,
  required = false,
  showEditIcon = false,
}) {
  const { translate } = useTranslation();
  const toggleSelection = (itemId) => {
    if (disabled) return;
    if (selectedIds.includes(itemId)) {
      onSelectionChange(selectedIds.filter((id) => id !== itemId));
    } else {
      onSelectionChange([...selectedIds, itemId]);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.loadingText}>{translate("common.loading")}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
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
      <View style={styles.chipsColumn}>
        {items.map((item) => {
          const isSelected = selectedIds.includes(item.id);

          return (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.chip,
                isSelected && styles.skillChipSelected,
                !isSelected && styles.chipUnselected,
              ]}
              onPress={() => toggleSelection(item.id)}
              disabled={disabled}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected && styles.chipTextSelected,
                  !isSelected && styles.chipTextUnselected,
                ]}
              >
                {item.name}
              </Text>
              {isSelected && !disabled && (
                <MaterialIcons
                  name={"close"}
                  size={16}
                  color={"#FFF"}
                  style={styles.checkIcon}
                />
              )}
            </Pressable>
          );
        })}
      </View>
      {items.length === 0 && (
        <Text style={styles.emptyText}>
          {translate("jobs.noItemsAvailable")}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.textdark,
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
  chipsColumn: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  chipUnselected: {
    backgroundColor: "#F5F5F5",
    borderColor: "#E0E0E0",
  },
  skillChipSelected: {
    backgroundColor: colors.tertiary,
    borderColor: colors.tertiary,
  },
  respChipSelected: {
    backgroundColor: "#E8F5E9",
    borderColor: colors.tertiary,
  },
  chipText: {
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  chipTextSelected: {
    color: "#FFF",
    fontFamily: fonts.medium,
  },
  chipTextUnselected: {
    color: "#333",
  },
  checkIcon: {
    marginLeft: 6,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text1,
  },
  errorText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#F44336",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text1,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipTextDisabled: {
    color: "#999",
  },
});
