import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import colors from "../../theme/worker/colors";
import { useTranslation } from "../../hooks/useTranslation";
import {
  extractDateOnly,
  parseIsoDate,
  toIsoDate,
  toDisplayDateUTC,
  normalizeToIsoDate,
  generateDateRange,
} from "../../utils/dateFormatting";

const buildRowsForSlot = (slot) => {
  // Use the raw ISO strings (start_date, end_date) that we pass from UnifiedJobDetails
  const start = parseIsoDate(slot?.start_date);
  const end = parseIsoDate(slot?.end_date);
  const daysInRange = generateDateRange(start, end);

  const shiftMap = new Map();
  (slot?.worker_shifts || []).forEach((shift) => {
    const shiftDate = normalizeToIsoDate(shift?.raw?.date || shift?.date);
    if (shiftDate) {
      shiftMap.set(shiftDate, shift);
    }
  });

  if (daysInRange.length > 0) {
    return daysInRange.map((day) => {
      const dayIso = toIsoDate(day);
      const shift = shiftMap.get(dayIso);
      return {
        key: `${slot?.id || "slot"}-${dayIso}`,
        date: toDisplayDateUTC(day),
        joiningTime: slot?.joiningTime || "N/A",
        finishTime: slot?.endTime || "N/A",
        checkInTime: shift?.checkInTime || "N/A",
        checkOutTime: shift?.checkOutTime || "N/A",
        breakTime:
          shift?.breakTime && shift.breakTime !== "-"
            ? shift.breakTime
            : slot?.breakTime || "-",
      };
    });
  }

  if ((slot?.worker_shifts || []).length > 0) {
    return slot.worker_shifts.map((shift, idx) => ({
      key: `${slot?.id || "slot"}-${idx}`,
      date: shift?.date || "N/A",
      joiningTime: slot?.joiningTime || "N/A",
      finishTime: slot?.endTime || "N/A",
      checkInTime: shift?.checkInTime || "N/A",
      checkOutTime: shift?.checkOutTime || "N/A",
      breakTime: shift?.breakTime || slot?.breakTime || "-",
    }));
  }

  return [
    {
      key: `${slot?.id || "slot"}-fallback`,
      date: slot?.startDate || "N/A", // Use the formatted date string for display fallback
      joiningTime: slot?.joiningTime || "N/A",
      finishTime: slot?.endTime || "N/A",
      checkInTime: "N/A",
      checkOutTime: "N/A",
      breakTime: slot?.breakTime || "-",
    },
  ];
};

const JobTimeScheduleTable = ({ slots }) => {
  const { translate } = useTranslation();

  return (
    <View style={styles.floatingCard}>
      <Text style={styles.sectionSubtitle}>
        {translate("workerComponents.timeSchedules")}
      </Text>
      {slots && slots.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tableContainer}>
            {slots.map((slot, index) => {
              const slotRows = buildRowsForSlot(slot);
              return (
                <View key={slot?.id || index} style={styles.slotSection}>
                  <View style={styles.tableHeader}>
                    <View style={[styles.tableHeaderCell, { width: 120 }]}>
                      <Text style={styles.tableHeaderText}>
                        {translate("workerComponents.date")}
                      </Text>
                    </View>
                    <View style={[styles.tableHeaderCell, { width: 110 }]}>
                      <Text style={styles.tableHeaderText}>
                        {translate("workerComponents.joiningTime")}
                      </Text>
                    </View>
                    <View style={[styles.tableHeaderCell, { width: 110 }]}>
                      <Text style={styles.tableHeaderText}>
                        {translate("workerComponents.finishTime")}
                      </Text>
                    </View>
                    <View style={[styles.tableHeaderCell, { width: 110 }]}>
                      <Text style={styles.tableHeaderText}>
                        {translate("workerComponents.checkIn")}
                      </Text>
                    </View>
                    <View style={[styles.tableHeaderCell, { width: 110 }]}>
                      <Text style={styles.tableHeaderText}>
                        {translate("workerComponents.checkOut")}
                      </Text>
                    </View>
                    <View style={[styles.tableHeaderCell, { width: 90 }]}>
                      <Text style={styles.tableHeaderText}>
                        {translate("workerComponents.breakTime")}
                      </Text>
                    </View>
                  </View>

                  {slotRows.map((row) => (
                    <View key={row.key} style={styles.tableRow}>
                      <View style={[styles.tableCell, { width: 120 }]}>
                        <Text style={styles.tableCellText}>{row.date}</Text>
                      </View>
                      <View style={[styles.tableCell, { width: 110 }]}>
                        <Text style={styles.tableCellText}>
                          {row.joiningTime}
                        </Text>
                      </View>
                      <View style={[styles.tableCell, { width: 110 }]}>
                        <Text style={styles.tableCellText}>
                          {row.finishTime}
                        </Text>
                      </View>
                      <View style={[styles.tableCell, { width: 110 }]}>
                        <Text style={styles.tableCellText}>
                          {row.checkInTime}
                        </Text>
                      </View>
                      <View style={[styles.tableCell, { width: 110 }]}>
                        <Text style={styles.tableCellText}>
                          {row.checkOutTime}
                        </Text>
                      </View>
                      <View style={[styles.tableCell, { width: 90 }]}>
                        <Text style={styles.tableCellText}>
                          {row.breakTime}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        </ScrollView>
      ) : (
        <Text style={styles.noDataText}>N/A</Text>
      )}
      <View style={styles.scrollIndicator} />
    </View>
  );
};

export default JobTimeScheduleTable;

const styles = StyleSheet.create({
  floatingCard: {
    backgroundColor: colors.white,
    borderRadius: 25,
    marginTop: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    zIndex: 100,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: colors.auth.darkRed,
    marginBottom: 15,
  },
  tableContainer: {
    minWidth: 650,
  },
  slotSection: {
    marginBottom: 14,
  },
  slotTitle: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary.pink,
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.ui.selectedBackground,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  tableHeaderCell: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  tableHeaderText: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: colors.text.primary,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.lighterBorder,
    alignItems: "center",
  },
  tableCellText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    textAlign: "center",
  },
  tableCell: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#C4C4C4",
    borderRadius: 2,
    alignSelf: "flex-end",
    marginTop: 10,
    marginRight: 20,
  },
  noDataText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 10,
  },
});
