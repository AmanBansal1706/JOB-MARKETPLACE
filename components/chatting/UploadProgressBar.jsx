import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { colors, fonts, fontSizes } from "../../theme";
import { useTranslation } from "../../hooks/useTranslation";

/**
 * UploadProgressBar Component
 * Shows upload progress for media messages
 * Supports theming via color props for business/worker panels
 */
function UploadProgressBar({
  progress = 0,
  fileName = "",
  // Theme color props
  backgroundColor,
  progressBarColor,
  textColor,
  loaderColor,
}) {
  const { translate } = useTranslation();

  // Use provided colors or defaults
  const bgColor = backgroundColor || colors.bbg6;
  const barColor = progressBarColor || colors.tertiary;
  const txtColor = textColor || colors.textdark;
  const spinnerColor = loaderColor || colors.tertiary;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.content}>
        <ActivityIndicator size="small" color={spinnerColor} />
        <View style={styles.textContainer}>
          <Text
            style={[styles.statusText, { color: txtColor }]}
            numberOfLines={1}
          >
            {translate("chat.uploading")} {fileName || translate("chat.file")}
          </Text>
          <Text style={[styles.progressText, { color: barColor }]}>
            {Math.round(progress)}%
          </Text>
        </View>
      </View>
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${Math.min(progress, 100)}%`, backgroundColor: barColor },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bbg6,
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  textContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 12,
  },
  statusText: {
    flex: 1,
    fontSize: fontSizes.sm,
    fontFamily: fonts.regular,
    color: colors.textdark,
    marginRight: 8,
  },
  progressText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.semiBold,
    color: colors.tertiary,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.tertiary,
    borderRadius: 2,
  },
});

export default UploadProgressBar;
