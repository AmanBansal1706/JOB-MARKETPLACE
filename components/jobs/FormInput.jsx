import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors, fonts } from "../../theme";

/**
 * FormInput - A reusable form input component with label, icon, and validation
 */
export default function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
  numberOfLines,
  error,
  editable = true,
  maxLength,
  onPress,
  required = false,
  infoIcon = false,
  onInfoPress,
  showEditIcon = false,
}) {
  const inputStyle = multiline ? styles.textArea : styles.input;

  const renderInput = () => (
    <TextInput
      style={[inputStyle, !editable && styles.inputDisabled]}
      placeholder={placeholder}
      placeholderTextColor="#999"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical={multiline ? "top" : "center"}
      editable={editable}
      maxLength={maxLength}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
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
        {infoIcon && (
          <Pressable onPress={onInfoPress} style={{ marginLeft: 8 }}>
            <MaterialIcons
              name="info-outline"
              size={16}
              color={colors.tertiary}
            />
          </Pressable>
        )}
      </View>
      <Pressable
        style={[styles.inputContainer, error && styles.inputError]}
        onPress={onPress}
      >
        {onPress ? (
          <View style={styles.pressableInput}>
            <Text style={value ? styles.input : styles.placeholder}>
              {value || placeholder}
            </Text>
          </View>
        ) : (
          renderInput()
        )}
      </Pressable>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
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
    backgroundColor: "#F0F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  inputError: {
    borderColor: "#F44336",
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textdark,
    paddingVertical: 10,
  },
  pressableInput: {
    flex: 1,
    paddingVertical: 10,
  },
  placeholder: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#999",
  },
  textArea: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textdark,
    minHeight: 100,
    paddingVertical: 10,
  },
  inputDisabled: {
    color: colors.text1,
  },
  errorText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#F44336",
    marginTop: 4,
  },
});
