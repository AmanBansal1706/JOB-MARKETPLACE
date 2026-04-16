import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors, fonts } from "../../theme";
import { useTranslation } from "../../hooks/useTranslation";

/**
 * ExperienceLevelSelector - Horizontal button selector for experience levels
 * Matches Figma design with icons and labels
 */
export default function ExperienceLevelSelector({
  value,
  onChange,
  disabled = false,
}) {
  const { translate } = useTranslation();

  const experienceLevels = [
    { value: "beginner", label: translate("jobs.beginner"), icon: "speed" },
    {
      value: "intermediate",
      label: translate("jobs.intermediate"),
      icon: "speed",
    },
    { value: "expert", label: translate("jobs.expert"), icon: "speed" },
  ];

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {experienceLevels.map((level) => {
          const isSelected = value === level.value;
          return (
            <Pressable
              key={level.value}
              style={({ pressed }) => [styles.option]}
              onPress={() => !disabled && onChange(level.value)}
              disabled={disabled}
            >
              <MaterialIcons
                name={level.icon}
                size={20}
                color={isSelected ? colors.tertiary : "#999"}
                style={styles.icon}
              />
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {level.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
  },
  container: {
    flexDirection: "column",
    gap: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
  },
  optionText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#999",
  },
  optionTextSelected: {
    fontFamily: fonts.semiBold,
    color: colors.tertiary,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionTextDisabled: {
    color: "#CCC",
  },
});
