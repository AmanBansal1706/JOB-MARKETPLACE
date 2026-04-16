import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from "../theme";
import { FontAwesome5 } from "@expo/vector-icons";
import FormDropdown from "./jobs/FormDropdown";

export default function FilterSheet({
  visible,
  title = "Filter Applicants",
  onClose,
  sections = [],
  selected = {},
  onChange,
  onClear,
  translate,
}) {
  const hasFilters = Object.keys(selected).some(
    (key) => selected[key] !== undefined && selected[key] !== "",
  );

  const clearText = translate
    ? translate("support.clearFilters")
    : "Clear Filters";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.overlay} edges={["top"]}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn}>
              <FontAwesome5
                name="arrow-left"
                size={16}
                color={colors.textdark}
              />
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
          </View>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          >
            {sections.map((section) => (
              <View key={section.key} style={{ marginTop: 12 }}>
                {section.inputType === "dropdown-single" ? (
                  <FormDropdown
                    label={section.title}
                    value={selected?.[section.key]}
                    options={section.options}
                    onChange={(value) => onChange?.(section.key, value)}
                  />
                ) : (
                  <>
                    {!!section.title && (
                      <>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <View style={styles.divider} />
                      </>
                    )}
                    {section.options?.map((opt) => {
                      const isSelected = selected?.[section.key] === opt.value;
                      return (
                        <TouchableOpacity
                          key={String(opt.value)}
                          style={styles.optionRow}
                          onPress={() => onChange?.(section.key, opt.value)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.optionLabel}>{opt.label}</Text>
                          <View
                            style={[
                              styles.radio,
                              isSelected && styles.radioSelected,
                            ]}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </>
                )}
              </View>
            ))}
          </ScrollView>

          {hasFilters && onClear && (
            <TouchableOpacity style={styles.clearBtn} onPress={onClear}>
              <Text style={styles.clearBtnText}>{clearText}</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#00000070",
    justifyContent: "flex-start",
    alignItems: "stretch",
    zIndex: 9999,
  },
  sheet: {
    marginTop: 0,
    width: "100%",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: colors.bbg6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.text,
  },
  title: {
    marginLeft: 12,
    color: colors.textdark,
    fontFamily: fonts.semiBold,
    fontSize: 16,
  },
  sectionTitle: { color: colors.textdark, fontFamily: fonts.semiBold },
  divider: { height: 1, backgroundColor: colors.bg, marginTop: 1 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 1,
  },
  optionLabel: { color: colors.textdark, fontFamily: fonts.regular },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textdark,
  },
  radioSelected: {
    borderColor: colors.tertiary,
    backgroundColor: colors.tertiary,
  },
  clearBtn: {
    backgroundColor: colors.bbg4,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  clearBtnText: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
});
