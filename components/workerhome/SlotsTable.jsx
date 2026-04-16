import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import colors from "../../theme/worker/colors";

const SlotsTable = ({ slots, translate }) => {
  if (!slots || slots.length === 0) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          {/* <View style={[styles.tableHeaderCell, { width: 18 }]}>
            <Text style={styles.tableHeaderText}>
              {translate("workerHome.status")}
            </Text>
          </View> */}
          <View style={styles.tableHeaderCell}>
            <Text style={styles.tableHeaderText}>
              {translate("workerHome.startDate")}
            </Text>
          </View>
          <View style={styles.tableHeaderCell}>
            <Text style={styles.tableHeaderText}>
              {translate("workerHome.endDate")}
            </Text>
          </View>
          <View style={styles.tableHeaderCell}>
            <Text style={styles.tableHeaderText}>
              {translate("workerHome.joiningTime")}
            </Text>
          </View>
          <View style={styles.tableHeaderCell}>
            <Text style={styles.tableHeaderText}>
              {translate("workerHome.endTime")}
            </Text>
          </View>
          <View style={[styles.tableHeaderCell, { width: 70 }]}>
            <Text style={styles.tableHeaderText}>
              {translate("workerHome.breakTime")}
            </Text>
          </View>
        </View>
        {slots.map((slot, index) => (
          <View
            key={index}
            style={[
              styles.tableRow,
              slot.is_applied_for_proposal && styles.tableRowDisabled,
            ]}
          >
            {/* <View style={[styles.tableCellText, styles.statusCell]}>
              <View
                style={[
                  styles.checkbox,
                  slot.is_applied_for_proposal && styles.checkboxChecked,
                ]}
              >
                {slot.is_applied_for_proposal ? (
                  <FontAwesome name="check" size={12} color={colors.white} />
                ) : null}
              </View>
            </View> */}
            <Text style={styles.tableCellText}>{slot.startDate}</Text>
            <Text style={styles.tableCellText}>{slot.endDate}</Text>
            <Text style={styles.tableCellText}>{slot.joiningTime}</Text>
            <Text style={styles.tableCellText}>{slot.endTime}</Text>
            <Text style={[styles.tableCellText, { width: 70 }]}>
              {slot.breakTime}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tableContainer: {
    marginTop: 10,
    marginBottom: 5,
    minWidth: 386,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.ui.selectedBackground,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  tableHeaderCell: {
    width: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  tableHeaderText: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    color: colors.text.primary,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.lighterBorder,
  },
  tableRowDisabled: {
    opacity: 0.5,
    backgroundColor: "#f5f5f5",
  },
  tableCellText: {
    width: 70,
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    textAlign: "center",
  },
  statusCell: {
    width: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  checkbox: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: colors.text.secondary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  checkboxChecked: {
    backgroundColor: colors.primary.pink,
    borderColor: colors.primary.pink,
  },
});

export default SlotsTable;
