import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, fonts } from "../../theme";
import DataCard from "../DataCard";
import MessageWorkerButton from "../chatting/MessageWorkerButton";
import { useTranslation } from "../../hooks/useTranslation";

/**
 * ActiveAssignedWorkersCard - Displays assigned workers in a table format for active jobs
 * Shows: Worker name, Hired date, Payment mode badge, and View profile action button
 * @param {array} workers - Array of assigned worker objects
 * @param {function} onViewProfile - Callback function when View button is pressed
 */

export default function ActiveAssignedWorkersCard({ workers, onViewProfile }) {
  console.log("Rendering ActiveAssignedWorkersCard with workers:", workers[0]);
  const { translate } = useTranslation();
  return (
    <DataCard title={translate("jobs.assignedWorkers")}>
      <View style={styles.assignedHeaderRow}>
        <Text style={[styles.assignedHeaderCol, { flex: 1 }]}>
          {translate("jobs.worker")}
        </Text>
        <Text style={[styles.assignedHeaderCol, { flex: 1 }]}>
          {translate("jobs.hired")}
        </Text>
        <Text
          style={[styles.assignedHeaderCol, { flex: 1, textAlign: "center" }]}
        >
          {translate("jobs.payment")}
        </Text>
        <Text
          style={[styles.assignedHeaderCol, { flex: 1, textAlign: "center" }]}
        >
          {translate("jobs.action")}
        </Text>
      </View>
      <View style={styles.sep} />
      {workers.map((w, idx) => (
        <View key={w.id}>
          <View style={styles.assignedRow}>
            <Text style={[styles.assignedCell, { flex: 1 }]}>{w.name}</Text>
            <Text style={[styles.assignedCellHired, { flex: 1 }]}>
              {w.hired}
            </Text>
            <View style={[styles.assignedCellPayment, { flex: 1 }]}>
              <View
                style={[
                  styles.badge,
                  w.paymentMode === "Cash"
                    ? styles.badgeCash
                    : styles.badgeCard,
                ]}
              >
                <Text style={styles.badgeText}>{w.paymentMode}</Text>
              </View>
            </View>
            <View
              style={[
                styles.assignedCell,
                {
                  flex: 1,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 4,
                },
              ]}
            >
              <MessageWorkerButton
                workerId={w.id}
                style={[styles.smallBtn, { backgroundColor: "#E8F5E9" }]}
                textStyle={[styles.smallBtnText, { color: colors.textdark }]}
                buttonText={translate("chat.message")}
              />
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.smallBtn, styles.smallBtnPrimary]}
                onPress={() => onViewProfile(w.id)}
              >
                <Text style={[styles.smallBtnText, { color: colors.text }]}>
                  {translate("jobs.viewProfile")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {idx !== workers.length - 1 && <View style={styles.sep} />}
        </View>
      ))}
    </DataCard>
  );
}

const styles = StyleSheet.create({
  assignedHeaderRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: 10,
    paddingHorizontal: 2,
    gap: 4,
  },
  assignedHeaderCol: {
    color: colors.textdark,
    fontFamily: fonts.semiBold,
    fontSize: 10,
  },
  assignedRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    paddingVertical: 6,
    paddingHorizontal: 2,
    gap: 4,
  },
  assignedCell: {
    color: colors.text1,
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  assignedCellHired: {
    color: colors.text1,
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  assignedCellPayment: {
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "center",
  },
  badgeCash: { backgroundColor: colors.bbg5 },
  badgeCard: { backgroundColor: colors.bbg6 },
  badgeText: {
    color: colors.textdark,
    fontFamily: fonts.semiBold,
    fontSize: 8,
  },
  sep: { marginHorizontal: 10, marginVertical: 4 },
  smallBtn: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 42,
    alignItems: "center",
    marginLeft: 2,
  },
  smallBtnText: { fontSize: 8, fontFamily: fonts.semiBold },
  smallBtnPrimary: { backgroundColor: colors.tertiary },
});
