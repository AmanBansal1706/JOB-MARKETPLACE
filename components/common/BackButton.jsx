import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { colors } from "../../theme";

export default function BackButton({
  onPress,
  style,
  iconColor,
  iconSize = 18,
  disabled = false,
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={[
        styles.backButton,
        style,
        {
          opacity: disabled ? 0.7 : 1,
        },
      ]}
    >
      <FontAwesome5
        name="arrow-left"
        size={iconSize}
        color={iconColor || colors.text}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 16,
    width: 32,
    height: 32,
    borderColor: colors.text,
    borderWidth: 3,
  },
});
