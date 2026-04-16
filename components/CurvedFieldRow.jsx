import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { colors, fonts } from "../theme";

export default function CurvedFieldRow({
  label,
  optional,
  value,
  onChangeText,
  editable,
  inputRef,
  style,
  containerRadius = 16,
  height = 68,
  sideMargin = 10,
}) {
  return (
    <View style={[styles.fieldRow, style, { height }]}>
      <View
        style={[
          styles.fieldWrap,
          {
            borderRadius: containerRadius,
            height,
            marginLeft: sideMargin,
            marginRight: sideMargin,
          },
        ]}
      >
        <View style={[styles.greenBase, { borderRadius: containerRadius }]} />
        <View style={[styles.inner, { borderRadius: containerRadius }]}>
          <View style={styles.inlineLabelWrap}>
            <Text style={styles.fieldLabel}>{label}</Text>
            {optional && <Text style={styles.optional}>(Optional)</Text>}
          </View>

          <TextInput
            ref={inputRef}
            style={[styles.input, !editable && { color: colors.text1 }]}
            value={value}
            onChangeText={onChangeText}
            editable={editable}
            placeholderTextColor="#999"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldRow: {
    marginBottom: 6,
  },
  fieldWrap: {
    position: "relative",
    justifyContent: "center",
    alignSelf: "stretch",
  },
  greenBase: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.tertiary,
  },
  inner: {
    position: "absolute",
    left: 5,
    right: 5,
    top: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  inlineLabelWrap: {
    position: "absolute",
    left: 18,
    top: 8,
    flexDirection: "row",
    alignItems: "baseline",
    zIndex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.buttonbg1,
    marginRight: 6,
  },
  optional: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.text1,
  },
  input: {
    flex: 1,
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.text1,
    paddingTop: 28,
  },
});
