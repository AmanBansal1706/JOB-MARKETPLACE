import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { colors, fonts } from "../theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { CommonHeader } from "./common";
import { useNavigation } from "@react-navigation/native";

/**
 * LoadingState - Reusable loading state component with header and centered spinner
 * @param {string} title - Header title to display (e.g., "Job", "Completed Job", "Dispute Details")
 * @param {string} message - Loading message to display (default: "Loading job details...")
 * @param {boolean} backgroundColor - Background color for safe area (default: colors.bg)
 */
export default function LoadingState({
  title = "Job",
  message = "Loading job details...",
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
        <ActivityIndicator size="large" color={colors.tertiary} />
        <Text style={styles.loadingText}>{message}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.text1,
  },
});
