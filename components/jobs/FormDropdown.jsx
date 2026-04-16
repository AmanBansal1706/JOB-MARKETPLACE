import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Modal, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors, fonts } from "../../theme";
import { useTranslation } from "../../hooks/useTranslation";

/**
 * FormDropdown - A reusable dropdown component for form selections
 * Optimized with modal-based selection for better UX
 */
export default function FormDropdown({
  label,
  value,
  onChange,
  options = [],
  placeholder,
  error,
  required = false,
  showEditIcon = false,
}) {
  const [visible, setVisible] = useState(false);
  const { translate } = useTranslation();
  const defaultPlaceholder = placeholder || translate("common.selectOption");

  const handleSelect = (option) => {
    onChange(option.value);
    setVisible(false);
  };

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption
    ? selectedOption.label
    : defaultPlaceholder;

  return (
    <View style={styles.container}>
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
      <Pressable
        style={({ pressed }) => [
          styles.dropdownButton,
          error && styles.dropdownError,
          { opacity: pressed ? 0.9 : 1 },
        ]}
        onPress={() => setVisible(true)}
      >
        <Text
          style={[
            styles.dropdownText,
            !selectedOption && styles.placeholderText,
          ]}
        >
          {displayText}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color={colors.text1} />
      </Pressable>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modalContent}>
            {options.map((option) => (
              <Pressable
                key={option.value}
                style={({ pressed }) => [
                  styles.optionItem,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => handleSelect(option)}
              >
                {option.icon && (
                  <MaterialIcons
                    name={option.icon}
                    size={24}
                    color={colors.tertiary}
                    style={styles.optionIcon}
                  />
                )}
                <Text style={styles.optionText}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
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
  dropdownButton: {
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
  dropdownError: {
    borderColor: "#F44336",
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textdark,
  },
  placeholderText: {
    color: "#999",
  },
  errorText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#F44336",
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 8,
    width: "60%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textdark,
  },
});
