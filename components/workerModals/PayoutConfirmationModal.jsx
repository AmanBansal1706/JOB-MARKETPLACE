import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "../../theme/worker/colors";
import { useTranslation } from "../../hooks/useTranslation";

export default function PayoutConfirmationModal({
  visible,
  onClose,
  onConfirm,
  payoutPreview,
  currentSlotIndex,
  onPrevSlot,
  onNextSlot,
  slots,
}) {
  const [agreed, setAgreed] = useState(false);
  const { translate } = useTranslation();

  // Reset agreement when modal opens/closes
  useEffect(() => {
    if (visible) {
      setAgreed(false);
    }
  }, [visible]);

  if (!payoutPreview) return null;

  const currentSlot = payoutPreview.items?.[currentSlotIndex];

  // Lookup breakTime from original slots data using slot_id
  const getBreakTime = () => {
    if (!slots || !currentSlot?.slot_id) return null;
    const originalSlot = slots.find((s) => s.id === currentSlot.slot_id);
    return originalSlot?.breakTime;
  };

  const breakTime = getBreakTime();

  const hasMultipleSlots = payoutPreview.items?.length > 1;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={22} color={colors.text.primary} />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons
              name="checkmark-circle"
              size={50}
              color={colors.primary.pink}
            />
          </View>

          {/* Title */}
          <Text style={styles.modalTitle}>
            {translate("workerModals.confirmApplication")}
          </Text>

          {/* Description */}
          <Text style={styles.modalDescription}>
            {translate("workerModals.reviewApplicationDetails")}
          </Text>

          {/* Payout Preview */}
          {currentSlot && (
            <ScrollView
              style={styles.payoutContainer}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.payoutSectionTitle}>
                {translate("workerModals.payoutBreakdown")}
              </Text>

              {/* Navigation buttons for multiple slots */}
              {hasMultipleSlots && (
                <View style={styles.navButtonsRow}>
                  <TouchableOpacity
                    style={[
                      styles.navButton,
                      currentSlotIndex === 0 && styles.navButtonDisabled,
                    ]}
                    onPress={onPrevSlot}
                    disabled={currentSlotIndex === 0}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={18}
                      color={
                        currentSlotIndex === 0
                          ? colors.text.lightGray
                          : colors.primary.pink
                      }
                    />
                  </TouchableOpacity>

                  <Text style={styles.slotCounter}>
                    {translate("workerModals.slotOf", {
                      current: currentSlotIndex + 1,
                      total: payoutPreview.items.length,
                    })}
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.navButton,
                      currentSlotIndex === payoutPreview.items.length - 1 &&
                        styles.navButtonDisabled,
                    ]}
                    onPress={onNextSlot}
                    disabled={
                      currentSlotIndex === payoutPreview.items.length - 1
                    }
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={
                        currentSlotIndex === payoutPreview.items.length - 1
                          ? colors.text.lightGray
                          : colors.primary.pink
                      }
                    />
                  </TouchableOpacity>
                </View>
              )}

              {/* Slot Details */}
              <View style={styles.slotItem}>
                <Text style={styles.slotItemTitle}>
                  {translate("workerModals.slotDetails")}
                </Text>

                <View style={styles.slotDetailRow}>
                  <Text style={styles.slotDetailLabel}>
                    {translate("workerModals.startDate")}
                  </Text>
                  <Text style={styles.slotDetailValue}>
                    {currentSlot.start_date}
                  </Text>
                </View>
                <View style={styles.slotDetailRow}>
                  <Text style={styles.slotDetailLabel}>
                    {translate("workerModals.endDate")}
                  </Text>
                  <Text style={styles.slotDetailValue}>
                    {currentSlot.end_date}
                  </Text>
                </View>
                <View style={styles.slotDetailRow}>
                  <Text style={styles.slotDetailLabel}>
                    {translate("workerModals.joiningTime")}
                  </Text>
                  <Text style={styles.slotDetailValue}>
                    {currentSlot.joining_time}
                  </Text>
                </View>
                <View style={styles.slotDetailRow}>
                  <Text style={styles.slotDetailLabel}>
                    {translate("workerModals.finishTime")}
                  </Text>
                  <Text style={styles.slotDetailValue}>
                    {currentSlot.finish_time}
                  </Text>
                </View>
                <View style={styles.slotDetailRow}>
                  <Text style={styles.slotDetailLabel}>
                    {translate("workerModals.breakTime")}
                  </Text>
                  <Text style={styles.slotDetailValue}>
                    {breakTime == null
                      ? translate("workerModals.zeroMin")
                      : `${breakTime}`}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.slotDetailRow}>
                  <Text style={styles.slotDetailLabelBold}>
                    {translate("workerModals.labourCost")}
                  </Text>
                  <Text style={styles.slotDetailValueBold}>
                    $ {currentSlot.gross_amount}
                  </Text>
                </View>
                <View style={styles.slotDetailRow}>
                  <Text style={styles.slotDetailLabelSuccess}>
                    {translate("workerModals.afterCommission")}
                  </Text>
                  <Text style={styles.slotDetailValueSuccess}>
                    $ {currentSlot.final_payable_amount}
                  </Text>
                </View>
              </View>

              {/* Total Summary */}
              <View style={styles.totalSection}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>
                    {translate("workerModals.totalSelectedSlots", {
                      count: payoutPreview.items.length,
                    })}
                  </Text>
                  <Text style={styles.totalValue}>
                    $ {payoutPreview.totals?.gross_amount}
                  </Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>
                    {translate("workerModals.platformFee")}
                  </Text>
                  <Text style={styles.totalValue}>
                    - $ {payoutPreview.totals?.worker_commission_amount}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabelFinal}>
                    {translate("workerModals.youllReceive")}
                  </Text>
                  <Text style={styles.totalValueFinal}>
                    $ {payoutPreview.totals?.final_payable_amount}
                  </Text>
                </View>
              </View>
            </ScrollView>
          )}

          {/* Agreement Checkbox */}
          <TouchableOpacity
            style={styles.agreementRow}
            onPress={() => setAgreed((prev) => !prev)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={agreed ? "checkbox" : "square-outline"}
              size={22}
              color={agreed ? colors.primary.pink : colors.text.lightGray}
            />
            <Text style={styles.agreementText}>
              {translate("workerModals.agreeSlotDetails")}
            </Text>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                !agreed && styles.confirmButtonDisabled,
              ]}
              onPress={onConfirm}
              activeOpacity={0.8}
              disabled={!agreed}
            >
              <Text style={styles.confirmButtonText}>
                {translate("workerModals.continueButton")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>
                {translate("workerModals.cancelButton")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 16,
    alignItems: "center",
    width: "100%",
    maxWidth: 450,
    maxHeight: "92%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 15,
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.ui.selectedBackground,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  iconContainer: {
    marginBottom: 5,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: colors.black,
    marginBottom: 2,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 16,
  },
  payoutContainer: {
    width: "100%",
    marginBottom: 8,
    flexShrink: 1,
  },
  payoutSectionTitle: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: colors.auth.darkRed,
    marginBottom: 4,
  },
  navButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 5,
    marginBottom: 10,
  },
  navButton: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: colors.ui.selectedBackground,
    borderWidth: 1,
    borderColor: colors.primary.pink,
  },
  navButtonDisabled: {
    opacity: 0.4,
    borderColor: colors.text.lightGray,
  },
  slotCounter: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: colors.text.secondary,
  },
  slotItem: {
    backgroundColor: colors.ui.selectedBackground,
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
  },
  slotItemTitle: {
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
    color: colors.primary.pink,
    marginBottom: 4,
  },
  slotDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  slotDetailLabel: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
  },
  slotDetailValue: {
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
    color: colors.text.primary,
  },
  slotDetailLabelBold: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    color: colors.text.primary,
  },
  slotDetailValueBold: {
    fontSize: 11,
    fontFamily: "Poppins_700Bold",
    color: colors.text.primary,
  },
  slotDetailLabelSuccess: {
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
    color: "#4caf50",
  },
  slotDetailValueSuccess: {
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
    color: "#4caf50",
  },
  divider: {
    height: 1,
    backgroundColor: colors.ui.lighterBorder,
    marginVertical: 5,
  },
  totalSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 9,
    borderWidth: 1.5,
    borderColor: colors.primary.pink,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: colors.text.secondary,
  },
  totalValue: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: colors.text.primary,
  },
  totalLabelFinal: {
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
    color: colors.primary.pink,
  },
  totalValueFinal: {
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
    color: colors.primary.pink,
  },
  agreementRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical: 8,
    marginTop: 4,
    marginBottom: 2,
  },
  agreementText: {
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
    color: colors.text.secondary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  buttonRow: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary.pink,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 0.5,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.primary.pink,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: colors.primary.pink,
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },
});
