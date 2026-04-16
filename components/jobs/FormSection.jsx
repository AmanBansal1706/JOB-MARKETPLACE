import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, fonts } from "../../theme";

const FormSection = ({ title, children }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
    marginBottom: 12,
  },
});

export default FormSection;
