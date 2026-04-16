import { View, Text, StyleSheet } from "react-native";
import { colors, fonts } from "../../theme";
import DataCard from "../DataCard";
import { useTranslation } from "../../hooks/useTranslation";
import SlotManager from "./SlotManager";
import React from "react";

export default function TimeScheduleCard({
  scheduledType,
  assignedWorkers,
  startDate,
  endDate,
  slots,
  variant = "card",
  cardTitle,
  showTitle = true,
  showAssignedWorkers = true,
}) {
  const { translate } = useTranslation();

  if (scheduledType === "same") {
    const title = showTitle ? cardTitle || translate("jobs.schedule") : null;
    return (
      <DataCard title={title} variant={variant}>
        <View style={styles.dateBoxesRow}>
          <View style={styles.dateBox}>
            <Text style={styles.dateBoxLabel}>
              {translate("jobs.startDate")}:
            </Text>
            <Text style={styles.dateBoxValue}>{startDate}</Text>
          </View>
          <View style={styles.dateBox}>
            <Text style={styles.dateBoxLabel}>
              {translate("jobs.endDate")}:
            </Text>
            <Text style={styles.dateBoxValue}>{endDate}</Text>
          </View>
        </View>
      </DataCard>
    );
  }

  // For "different" schedule type, use SlotManager
  return (
    <SlotManager
      slots={slots}
      assignedWorkers={assignedWorkers}
      readOnly={true}
      variant={variant}
      cardTitle={cardTitle}
      showTitle={showTitle}
      showAssignedWorkers={showAssignedWorkers}
    />
  );
}

const styles = StyleSheet.create({
  dateBoxesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 10,
  },
  dateBox: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.bbg6,
    borderRadius: 8,
    padding: 10,
  },
  dateBoxLabel: {
    color: colors.tertiary,
    fontFamily: fonts.semiBold,
    marginBottom: 4,
    fontSize: 12,
  },
  dateBoxValue: {
    color: colors.text1,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
});
