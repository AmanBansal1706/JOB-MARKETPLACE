import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { colors, fonts } from "../theme";
import CustomButton from "./button";
import { useFetchJobCostBreakdown } from "../services/JobServices";
import { useTranslation } from "../hooks/useTranslation";

const ConfirmCashPaymentModal = ({
  visible,
  jobTitle,
  onConfirm,
  onCancel,
  onClose,
  jobId,
  selectedWorkerId, // new prop for single worker breakdown
}) => {
  const { translate } = useTranslation();
  const [showWarningModal, setShowWarningModal] = useState(false);

  const { data: jobCostBreakdown, isPending } = useFetchJobCostBreakdown(
    visible ? jobId : null,
  );

  const workers = jobCostBreakdown?.data?.workers || [];

  // Find the selected worker or default to the first one safely
  const workerData = selectedWorkerId
    ? workers.find((w) => w.worker_id === selectedWorkerId)
    : workers[0];

  const handleNotYetPaid = () => {
    setShowWarningModal(true);
  };

  const handleWarningCloseAndCancel = () => {
    setShowWarningModal(false);
    if (onCancel) onCancel();
  };

  return (
    <>
      <Modal
        visible={visible && !showWarningModal}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose || onCancel}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            <Text style={styles.title}>{translate("jobs.confirmCashPayment")}</Text>

            <ScrollView
              style={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.jobInfoRow}>
                <Text style={styles.jobTitle} numberOfLines={1}>
                  {jobTitle}
                </Text>
              </View>

              <Image
                source={require("../assets/images/cashinhand.png")}
                style={styles.image}
                resizeMode="contain"
              />

              <Text style={styles.message}>
                {translate("jobs.cashPaymentConfirmationMessage")}
              </Text>

              {isPending ? (
                <ActivityIndicator
                  size="small"
                  color={colors.buttonbg1 || "#006346"}
                  style={styles.loader}
                />
              ) : workerData ? (
                <View style={styles.breakdownSection}>
                  <Text style={styles.tableSectionTitle}>
                    {translate("jobs.costBreakdown")}
                  </Text>

                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>{translate("jobs.totalAmountLabel")}</Text>
                    <Text style={styles.breakdownValue}>
                      ${workerData.worker_actual_amount || 0}
                    </Text>
                  </View>

                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>{translate("jobs.instaChambaFees")}</Text>
                    <Text style={styles.breakdownValue}>
                      ${workerData.commission_amount || 0}
                    </Text>
                  </View>

                  <View style={[styles.breakdownRow, styles.totalRow]}>
                    <Text style={styles.breakdownTotalLabel}>
                      {translate("jobs.totalAmountToPayToWorker")}
                    </Text>
                    <Text style={styles.breakdownTotalValue}>
                      ${workerData.worker_actual_amount_after_commision || 0}
                    </Text>
                  </View>
                </View>
              ) : null}
            </ScrollView>

            <View style={styles.buttonContainer}>
              <CustomButton
                title={translate("jobs.yesPaid")}
                onPress={onConfirm}
                style={[styles.button, styles.confirmButton]}
                textStyle={styles.buttonText}
              />
              <CustomButton
                title={translate("jobs.notYetPaid")}
                onPress={handleNotYetPaid}
                style={[styles.button, styles.cancelButton]}
                textStyle={styles.buttonText}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Secondary Warning Modal */}
      <Modal
        visible={showWarningModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleWarningCloseAndCancel}
      >
        <View style={styles.overlay}>
          <View style={[styles.container, styles.warningContainer]}>
            <Image
              source={require("../assets/images/errorsign.png")}
              style={styles.warningImage}
              resizeMode="contain"
            />
            <Text style={[styles.title, styles.warningTitle]}>{translate("jobs.warning")}</Text>
            <Text style={styles.warningMessage}>
              {translate("jobs.cashPaymentWarningMessage")}
            </Text>
            <View style={styles.buttonContainer}>
              <CustomButton
                title={translate("jobs.okUnderstood")}
                onPress={handleWarningCloseAndCancel}
                style={[styles.button, styles.warningButton]}
                textStyle={styles.buttonText}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  container: {
    width: "100%",
    maxWidth: 400,
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  warningContainer: {
    maxHeight: "70%",
    alignItems: "center",
  },
  scrollContainer: {
    width: "100%",
    marginBottom: 20,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.bg1,
    marginBottom: 16,
    textAlign: "center",
  },
  warningTitle: {
    color: "#D32F2F",
    marginTop: 10,
  },
  jobInfoRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.home?.badgeBg || "#DFF5EA",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "100%",
    marginBottom: 20,
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.home?.badgeText || "#005943",
    flex: 1,
    textAlign: "center",
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  warningImage: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    fontWeight: "400",
    color: "#000000",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
    paddingHorizontal: 5,
  },
  warningMessage: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  loader: {
    marginVertical: 20,
  },
  breakdownSection: {
    width: "100%",
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  tableSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.bg1 || "#000",
    marginBottom: 16,
    textAlign: "center",
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0",
  },
  totalRow: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#DDDDDD",
  },
  breakdownLabel: {
    fontSize: 14,
    color: "#555",
    fontFamily: fonts?.regular,
  },
  breakdownValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    fontFamily: fonts?.semiBold,
  },
  breakdownTotalLabel: {
    fontSize: 15,
    color: "#000",
    fontWeight: "700",
    fontFamily: fonts?.bold,
    flex: 1,
  },
  breakdownTotalValue: {
    fontSize: 16,
    color: colors.tertiary || "#006346",
    fontWeight: "700",
    fontFamily: fonts?.bold,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: colors.bbg5 || "#83E1C0",
  },
  cancelButton: {
    backgroundColor: colors.buttonbg1 || "#006346",
  },
  warningButton: {
    backgroundColor: "#D32F2F",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ConfirmCashPaymentModal;
