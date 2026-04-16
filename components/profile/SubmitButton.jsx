import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { colors, fonts } from "../../theme";

export default function SubmitButton({
  isEditMode,
  isEditing,
  isPending,
  onPress,
}) {
  if (!isEditing) return null;

  return (
    <TouchableOpacity
      style={[styles.submitButton, isPending && styles.submitButtonDisabled]}
      onPress={onPress}
      disabled={isPending}
    >
      {isPending ? (
        <ActivityIndicator color="#FFF" size="small" />
      ) : (
        <Text style={styles.submitButtonText}>
          {isEditMode ? "UPDATE PROFILE" : "SUBMIT"}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  submitButton: {
    backgroundColor: "#00D68F",
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitButtonText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: "#FFF",
    letterSpacing: 1,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
});
