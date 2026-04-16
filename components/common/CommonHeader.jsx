import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, fonts } from "../../theme";
import BackButton from "./BackButton";

export default function CommonHeader({
  title,
  onBackPress,
  backgroundColor,
  titleColor,
  showBackButton = true,
  rightComponent,
  disabled = false,
}) {
  const bgColor = backgroundColor || colors.tertiary;

  return (
    <View style={[styles.header, { backgroundColor: bgColor }]}>
      <View style={styles.headerContent}>
        {showBackButton && (
          <View style={styles.backButtonContainer}>
            <BackButton
              onPress={onBackPress}
              iconColor={titleColor || colors.text}
              disabled={disabled}
            />
          </View>
        )}
        <Text
          style={[styles.headerTitle, titleColor && { color: titleColor }]}
          maxFontSizeMultiplier={1.2}
        >
          {title}
        </Text>
        <View style={styles.placeholder}>{rightComponent}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.tertiary,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 0,
    minHeight: 56,
  },
  backButtonContainer: {
    paddingLeft: 16,
    paddingRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: colors.text,
    flex: 1,
    marginLeft: 8,
  },
  placeholder: {
    width: 32,
    marginRight: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
