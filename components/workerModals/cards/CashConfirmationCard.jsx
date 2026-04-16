import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import colors from "../../../theme/worker/colors";
import { formatDisplayDate } from "../../../utils/dateFormatting";
import { useTranslation } from "../../../hooks/useTranslation";

const moneyLogo = require("../../../assets/images/logomoney.png");

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return formatDisplayDate(dateStr);
};

export default function CashConfirmationCard({ jobData, onConfirm, onSkip }) {
  const { translate } = useTranslation();
  const [noSelected, setNoSelected] = useState(false);

  if (!jobData) return null;

  if (noSelected) {
    return (
      <View style={styles.card}>
        {/* Title */}
        <Text style={styles.title}>
          {translate("workerModals.confirmCashPayment")}
        </Text>

        {/* Job Badge */}
        <View style={styles.jobBadge}>
          <Text style={styles.jobBadgeText}>{jobData.job_title}</Text>
        </View>

        {/* Escrow Info Box */}
        <View style={styles.noInfoContainer}>
          <Text style={styles.noInfoText}>
            {translate("workerModals.cashNotReceivedInfo")}
          </Text>
        </View>

        {/* Single OK Button */}
        <View style={[styles.dualButtonRow, { justifyContent: "center" }]}>
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            activeOpacity={0.8}
            onPress={() => {
              setNoSelected(false);
              onSkip();
            }}
          >
            <Text style={styles.actionButtonText}>
              {translate("common.ok")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Title */}
      <Text style={styles.title}>
        {translate("workerModals.confirmCashPayment")}
      </Text>

      {/* Job Badge */}
      <View style={styles.jobBadge}>
        <Text style={styles.jobBadgeText}>{jobData.job_title}</Text>
      </View>

      {/* Money Icon */}
      <View style={styles.iconContainer}>
        <Image
          source={moneyLogo}
          style={styles.moneyLogo}
          resizeMode="contain"
        />
      </View>

      {/* Amount Display */}
      <Text style={styles.amountText}>
        {translate("workerModals.didYouReceive", { amount: jobData.amount })}
      </Text>

      {/* Auto Settle Info */}
      {jobData.cash_confirmation?.auto_settle_at && (
        <View style={styles.infoContainer}>
          <Ionicons
            name="information-circle"
            size={16}
            color={colors.primary.pink}
          />
          <Text style={styles.infoText}>
            {translate("workerModals.autoSettleOn", {
              date: formatDate(jobData.cash_confirmation.auto_settle_at),
            })}
          </Text>
        </View>
      )}

      {/* Yes / No Button Row */}
      <View style={styles.dualButtonRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.confirmButton]}
          activeOpacity={0.8}
          onPress={() => onConfirm(jobData.job_id)}
        >
          <Text style={styles.actionButtonText}>
            {translate("workerModals.yesButton")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.noButton]}
          activeOpacity={0.8}
          onPress={() => setNoSelected(true)}
        >
          <Text style={styles.actionButtonText}>
            {translate("workerModals.noButton")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: colors.primary.pink,
    marginBottom: 10,
    textAlign: "center",
  },
  jobBadge: {
    backgroundColor: "#FFE5E5",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    width: "100%",
    marginBottom: 10,
    alignItems: "center",
  },
  jobBadgeText: {
    color: colors.primary.pink,
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
  },
  iconContainer: {
    marginBottom: 0,
    marginTop: 0,
  },
  moneyLogo: {
    width: 100,
    height: 100,
  },
  amountText: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: colors.black,
    textAlign: "center",
    marginBottom: 10,
  },
  amountValue: {
    color: colors.primary.pink,
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFE5E5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 15,
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: colors.primary.pink,
  },
  dualButtonRow: {
    flexDirection: "row",
    gap: 15,
    width: "100%",
  },
  actionButton: {
    flex: 1,
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  confirmButton: {
    backgroundColor: colors.primary.pink,
  },
  noButton: {
    backgroundColor: colors.primary.darkRed,
  },
  goBackButton: {
    backgroundColor: colors.text.secondary,
  },
  noInfoContainer: {
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFD0D0",
  },
  noInfoText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: colors.text.primary,
    textAlign: "center",
    lineHeight: 20,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },
});
