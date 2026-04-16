import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { colors, fonts } from "../theme";

export default function CustomCheckbox({ value, onValueChange, size = 16 }) {
  const customSize = {
    width: size,
    height: size,
    borderRadius: size * 0.25,
  };

  const tickSize = size * 0.75;

  return (
    <Pressable onPress={() => onValueChange(!value)}>
      <View style={[styles.box, customSize, value && styles.boxChecked]}>
        {value && <Text style={[styles.tick, { fontSize: tickSize }]}>✔</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1.5,
    borderColor: colors.authPalette.border,
    backgroundColor: colors.authPalette.surface,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.authPalette.inputShadow,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  boxChecked: {
    borderColor: colors.authPalette.primaryButton,
  },
  tick: {
    color: colors.authPalette.primaryButton,
    fontFamily: fonts.semiBold,
    lineHeight: 12,
  },
});
