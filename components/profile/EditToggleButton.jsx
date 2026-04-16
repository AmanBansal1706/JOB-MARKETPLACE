import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { colors, fonts } from "../../theme";

export default function EditToggleButton({
  isEditMode,
  isEditing,
  onToggle,
  isPending,
  disabled,
}) {
  if (!isEditMode) return null;

  return (
    <TouchableOpacity
      style={[
        styles.editToggleButton,
        disabled && styles.editToggleButtonDisabled,
      ]}
      onPress={onToggle}
      disabled={isPending || disabled}
    >
      <FontAwesome5
        name={isEditing ? "times" : "edit"}
        size={16}
        color={disabled ? "#CCC" : colors.tertiary}
      />
      <Text
        style={[
          styles.editToggleButtonText,
          disabled && styles.editToggleButtonTextDisabled,
        ]}
      >
        {isEditing ? "Cancel Editing" : "Edit Profile"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  editToggleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.tertiary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  editToggleButtonDisabled: {
    borderColor: "#CCC",
    opacity: 0.6,
  },
  editToggleButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.tertiary,
    marginLeft: 6,
  },
  editToggleButtonTextDisabled: {
    color: "#CCC",
  },
});
