// BackButton.jsx
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

export default function BackButton({
  size = 18, // arrow icon size
  color = "#000", // arrow icon color
  circleSize = 32, // button circle size
  backgroundColor = "transparent", // circle background
  borderColor = "black",
  borderWidth = 3,
  onPress = () => {},
  style = {},
}) {
  return (
    <Pressable
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor,
          borderRadius: circleSize / 2,
          width: circleSize,
          height: circleSize,
          borderColor,
          borderWidth,
        },
        style,
      ]}
    >
      <FontAwesome5 name="arrow-left" size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});
