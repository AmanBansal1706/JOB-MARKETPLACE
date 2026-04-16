import React from "react";
import { View, StyleSheet } from "react-native";

const CurveCard = ({
  width = 358,
  height,
  borderRadius = 15,
  shadow = true,
  curveHeight = 20,
  curveOffset = -10,
  curveColor = "#12AA73",
  cardBackground = "#FFF",
  style = {},
  cardStyle = {},
  curveStyle = {},
  children,
}) => {
  const wrapSizeStyle = height != null ? { width, height } : { width };
  const cardSizeStyle = height != null ? { height: "100%" } : null;

  return (
    <View style={[styles.wrap, wrapSizeStyle, style]}>
      <View
        style={[
          styles.curve,
          {
            height: curveHeight,
            top: curveOffset,
            borderTopLeftRadius: borderRadius,
            borderTopRightRadius: borderRadius,
            backgroundColor: curveColor,
          },
          shadow && styles.curveShadow,
          curveStyle,
        ]}
      />
      <View
        style={[
          styles.card,
          {
            borderRadius,
            backgroundColor: cardBackground,
          },
          shadow && styles.cardShadow,
          cardSizeStyle,
          cardStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "center",
    position: "relative",
  },
  curve: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  curveShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  card: {
    justifyContent: "center",
    width: "100%",
    borderTopWidth: 0,
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default CurveCard;
