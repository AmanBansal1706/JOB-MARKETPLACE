import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { colors, fonts } from "../../theme";

export default function FormInput({
  label,
  field,
  placeholder,
  value,
  onChangeText,
  isEditing,
  iconName = "edit",
  multiline = false,
  numberOfLines = 1,
}) {
  const shouldBeEditable = isEditing;

  return (
    <View style={styles.inputGroup}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {isEditing && iconName && (
          <FontAwesome5 name={iconName} size={12} color="#999" />
        )}
      </View>
      <TextInput
        style={[
          styles.input,
          !shouldBeEditable && styles.inputDisabled,
          multiline && styles.textArea,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#B0B0B0"
        editable={shouldBeEditable}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: "#000",
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: "#000",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  inputDisabled: {
    backgroundColor: "#F5F5F5",
    color: "#666",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
});
