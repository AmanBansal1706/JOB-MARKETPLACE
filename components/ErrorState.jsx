import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { colors, fonts } from "../theme";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { CommonHeader } from "./common";
import { useNavigation } from "@react-navigation/native";

/**
 * ErrorState - Reusable error state component with header, error icon, title, message, and retry button
 * @param {string} title - Header title to display (e.g., "Job", "Completed Job", "Dispute Details")
 * @param {string} errorMessage - Custom error message to display
 * @param {function} onRetry - Callback function when retry button is pressed
 * @param {boolean} isRetrying - Whether the retry action is in progress (shows loading state on button)
 * @param {string} backgroundColor - Background color for safe area (default: colors.bg)
 */
export default function ErrorState({
  title = "Job",
  errorMessage = "Unable to fetch job details. Please try again.",
  onRetry,
  isRetrying = false,
  backgroundColor = colors.bg,
}) {
  const navigation = useNavigation();

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor }]}
    >
      <CommonHeader
        title={title}
        onBackPress={() => navigation.goBack?.()}
        backgroundColor={colors.bg1}
      />
      <View style={styles.centerContainer}>
        <MaterialIcons name="error-outline" size={64} color={colors.text1} />
        <Text style={styles.errorTitle}>
          Failed to load {title.toLowerCase()}
        </Text>
        <Text style={styles.errorMessage}>{errorMessage}</Text>
        <TouchableOpacity
          style={[styles.retryButton, isRetrying && { opacity: 0.6 }]}
          onPress={onRetry}
          disabled={isRetrying}
          activeOpacity={0.85}
        >
          {isRetrying ? (
            <ActivityIndicator
              color={colors.text}
              size="small"
              style={{ marginRight: 8 }}
            />
          ) : (
            <MaterialIcons
              name="refresh"
              size={20}
              color={colors.text}
              style={{ marginRight: 8 }}
            />
          )}
          <Text style={styles.retryButtonText}>
            {isRetrying ? "Retrying..." : "Retry"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
    textAlign: "center",
  },
  errorMessage: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text1,
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.tertiary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
});
