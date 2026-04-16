import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, fonts } from "../../theme";
import DataCard from "../DataCard";
import { useTranslation } from "../../hooks/useTranslation";

/**
 * CostBreakdownCard - Displays cost breakdown for a completed job
 * @param {object} details - Object containing cost information
 * @param {string} details.totalCost - Total cost to pay
 * @param {string} details.jobCost - Labor cost
 * @param {string} details.convenienceFee - Platform fees
 * @param {string} details.taxes - Taxes amount
 */
export default function CostBreakdownCard({
  details,
  variant = "card",
  cardTitle,
  showTitle = true,
  totalLabel,
}) {
  const { translate } = useTranslation();
  const title = showTitle ? cardTitle || translate("jobs.costBreakdown") : null;

  return (
    <DataCard title={title} variant={variant}>
      <View style={styles.costRow}>
        <Text style={styles.costLabel}>
          {totalLabel || translate("jobs.totalCostToPay")}:
        </Text>
        <Text style={[styles.costValue, { color: colors.tertiary }]}>
          {details.totalCost}
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.costRow}>
        <Text style={styles.costDim}>{translate("jobs.laborCost")}:</Text>
        <Text style={styles.costDim}>{details.jobCost}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.costRow}>
        <Text style={styles.costDim}>{translate("jobs.instaChambaFees")}:</Text>
        <Text style={styles.costDim}>{details.convenienceFee}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.costRow}>
        <Text style={styles.costDim}>{translate("jobs.taxes")}:</Text>
        <Text style={styles.costDim}>{details.taxes}</Text>
      </View>
      <View style={styles.divider} />
      {/* <View style={styles.costRow}>
        <Text style={styles.costDim}>{translate("jobs.additionalFees")}:</Text>
        <Text style={styles.costDim}>{details.additionalFees || "$0"}</Text>
      </View> */}
    </DataCard>
  );
}

const styles = StyleSheet.create({
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 8,
  },
  costLabel: {
    fontFamily: fonts.semiBold,
    color: colors.textdark,
    fontSize: 14,
  },
  costValue: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  costDim: {
    fontFamily: fonts.regular,
    color: colors.text1,
    fontSize: 13,
  },
});
