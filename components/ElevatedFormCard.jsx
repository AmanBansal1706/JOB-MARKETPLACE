import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "../theme";

export default function ElevatedFormCard({
  width,
  height,
  radius = 16,
  shadow = true,
  innerPadding = 16,
  accentWidth = 8,
  accentColor = colors.primary,
  style = {},
  contentStyle = {},
  children,
}) {
  const sizeStyle =
    width != null ? (height != null ? { width, height } : { width }) : {};
  return (
    <View style={[styles.wrap, sizeStyle, shadow && styles.wrapShadow, style]}>
      <View
        style={[
          styles.card,
          {
            borderRadius: radius,
            padding: innerPadding,
            backgroundColor: "#FFFFFF",
            borderLeftWidth: accentWidth,
            borderLeftColor: accentColor,
          },
          shadow && styles.cardShadow,
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    marginBottom: 16,
  },
  wrapShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  card: {
    width: "100%",
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
});
