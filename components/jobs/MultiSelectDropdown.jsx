import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors, fonts } from "../../theme";
import { useTranslation } from "../../hooks/useTranslation";
/**
 * MultiSelectDropdown - A dropdown component with multi-select capability
 * Selected items are displayed as chips above the dropdown
 */
export default function MultiSelectDropdown({
  items = [],
  selectedIds = [],
  onSelectionChange,
  label,
  placeholder = "Select options",
  loading = false,
  error = null,
  disabled = false,
  required = false,
  showEditIcon = false,
}) {
  const { translate } = useTranslation();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const toggleSelection = (itemId) => {
    if (disabled) return;
    if (selectedIds.includes(itemId)) {
      onSelectionChange(selectedIds.filter((id) => id !== itemId));
    } else {
      onSelectionChange([...selectedIds, itemId]);
    }
  };
  const removeChip = (itemId) => {
    if (disabled) return;
    onSelectionChange(selectedIds.filter((id) => id !== itemId));
  };
  const getSelectedItems = () => {
    return items.filter((item) => selectedIds.includes(item.id));
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
  const selectedItems = getSelectedItems();
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
      {/* Selected chips displayed above dropdown */}
      {selectedItems.length > 0 && (
        <View style={styles.chipsContainer}>
          {selectedItems.map((item) => (
            <View key={item.id} style={styles.chip}>
              <Text style={styles.chipText}>{item.name}</Text>
              {!disabled && (
                <Pressable
                  onPress={() => removeChip(item.id)}
                  hitSlop={8}
                  style={styles.chipRemove}
                >
                  <MaterialIcons name="close" size={16} color="#FFF" />
                </Pressable>
              )}
            </View>
          ))}
        </View>
      )}
      {/* Dropdown trigger */}
      <Pressable
        style={[styles.dropdown, disabled && styles.dropdownDisabled]}
        onPress={() => !disabled && setDropdownVisible(true)}
        disabled={disabled}
      >
        <Text
          style={[
            styles.dropdownText,
            selectedItems.length === 0 && styles.placeholderText,
          ]}
        >
          {selectedItems.length > 0
            ? `${selectedItems.length} selected`
            : placeholder}
        </Text>
        <MaterialIcons
          name={dropdownVisible ? "arrow-drop-up" : "arrow-drop-down"}
          size={24}
          color={disabled ? "#999" : colors.textdark}
        />
      </Pressable>
      {/* Dropdown modal */}
      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <Pressable onPress={() => setDropdownVisible(false)} hitSlop={8}>
                <MaterialIcons name="close" size={24} color={colors.textdark} />
              </Pressable>
            </View>
            <FlatList
              data={items}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <Pressable
                    style={({ pressed }) => [
                      styles.dropdownItem,
                      pressed && styles.dropdownItemPressed,
                    ]}
                    onPress={() => toggleSelection(item.id)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        isSelected && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {isSelected && (
                      <MaterialIcons
                        name="check"
                        size={20}
                        color={colors.tertiary}
                      />
                    )}
                  </Pressable>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              showsVerticalScrollIndicator={true}
              style={styles.dropdownList}
            />
            <Pressable
              style={styles.doneButton}
              onPress={() => setDropdownVisible(false)}
            >
              <Text style={styles.doneButtonText}>{"Done"}</Text>
            </Pressable>
          </View>
        </TouchableOpacity>
      </Modal>
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
  },
  label: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.textdark,
  },
  required: {
    color: "#F44336",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    backgroundColor: colors.tertiary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: "#FFF",
  },
  chipRemove: {
    padding: 2,
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownDisabled: {
    opacity: 0.5,
    backgroundColor: "#FAFAFA",
  },
  dropdownText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.textdark,
    flex: 1,
  },
  placeholderText: {
    color: "#999",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    width: "85%",
    maxHeight: "70%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
  },
  dropdownList: {
    maxHeight: 400,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  dropdownItemPressed: {
    backgroundColor: "#F5F5F5",
  },
  dropdownItemText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.textdark,
    flex: 1,
  },
  dropdownItemTextSelected: {
    fontFamily: fonts.medium,
    color: colors.tertiary,
  },
  separator: {
    height: 1,
    backgroundColor: "#F0F0F0",
  },
  doneButton: {
    backgroundColor: colors.tertiary,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  doneButtonText: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: "#FFF",
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
    marginTop: 8,
  },
});
