import React, { useState } from "react";
import {
  Feather,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import {
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../../theme/worker/colors";
import { openMapsApp } from "../../../utils/mapUtils";
import {
  useJobCheckInOut,
  useCancelAssignment,
} from "../../../services/WorkerJobServices";
import { parseDate } from "../../../utils/dateFormatting";
import MessageBusinessButton from "../../../components/chatting/MessageBusinessButton";
import JobTimeScheduleTable from "../../../components/jobs/JobTimeScheduleTable";
import JobDetailRow from "../../../components/jobs/JobDetailRow";
import JobPositionResponsibilitiesCard from "../../../components/jobs/JobPositionResponsibilitiesCard";
import { useTranslation } from "../../../hooks/useTranslation";

// Icons
import locationIcon from "../../../assets/worker-images/location.png";
import paymentRate from "../../../assets/worker-images/payment-rate.png";
import jobPositionIcon from "../../../assets/worker-images/position (2).png";
import distanceIcon from "../../../assets/worker-images/distance.png";

export default function AssignedJobDetailsScreen({
  jobData,
  onRefresh,
  isRefreshing,
}) {
  const navigation = useNavigation();
  const route = useRoute();
  const { translate } = useTranslation();
  const params = route.params || {};
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  // Check In/Out mutation
  const { mutate: performCheckInOut } = useJobCheckInOut();
  // Cancel assignment mutation
  const { mutate: performCancelAssignment, isPending: isCancelling } =
    useCancelAssignment();

  // Use jobData prop if available, otherwise use params
  const job = jobData || params;

  /**
   * Returns true if the earliest slot has already started (start_date + joining_time <= now).
   * Uses parseDate for timezone-safe parsing (Mexico local time).
   */
  const hasJobStarted = () => {
    const slots = job?.slots;
    if (!slots || slots.length === 0) return false;

    let earliest = null;
    for (const slot of slots) {
      const rawDate = slot.start_date;
      // Support both snake_case (API) and camelCase (transformed) joining time
      const rawTime = slot.joining_time || slot.joiningTime;
      if (!rawDate) continue;

      const slotDate = parseDate(rawDate);
      if (!slotDate) continue;

      if (rawTime) {
        const parts = rawTime.split(":").map(Number);
        slotDate.setHours(parts[0] || 0, parts[1] || 0, parts[2] || 0, 0);
      }

      if (!earliest || slotDate < earliest) {
        earliest = slotDate;
      }
    }

    if (!earliest) return false;
    return new Date() >= earliest;
  };

  const canCancelAssignment = !hasJobStarted();

  const handleCheckInOut = (isCheckIn) => {
    const action = isCheckIn
      ? translate("workerHome.checkInAction")
      : translate("workerHome.checkOutAction");
    Alert.alert(
      translate("workerHome.confirmation"),
      translate("workerHome.confirmCheckInOut", { action }),
      [
        { text: translate("workerHome.cancel"), style: "cancel" },
        {
          text: translate("workerHome.confirm"),
          onPress: () => {
            performCheckInOut(job.id, {
              onSuccess: (response) => {
                Alert.alert(
                  translate("workerCommon.success"),
                  response.message ||
                    translate("workerHome.successful", { action }),
                );
                if (onRefresh) onRefresh();
              },
              onError: (err) => {
                Alert.alert(
                  translate("workerCommon.error"),
                  err.message ||
                    translate("workerHome.failedAction", { action }),
                );
              },
            });
          },
        },
      ],
    );
  };

  const handleBusinessProfilePress = () => {
    if (job?.business_id) {
      navigation.navigate("BusinessProfile", {
        businessId: job.business_id,
        businessName: job.business_name,
      });
    }
  };

  const handleCancelJob = () => {
    Alert.alert(
      translate("workerJobs.cancelJobConfirm"),
      translate("workerJobs.cancelJobMessage"),
      [
        { text: translate("workerCommon.cancel"), style: "cancel" },
        {
          text: translate("workerJobs.cancelJob"),
          style: "destructive",
          onPress: () => {
            performCancelAssignment(job.id, {
              onSuccess: () => {
                Alert.alert(
                  translate("workerCommon.success"),
                  translate("workerJobs.cancelJobSuccess"),
                );
                if (onRefresh) onRefresh();
                navigation.goBack();
              },
              onError: (err) => {
                Alert.alert(
                  translate("workerCommon.error"),
                  err.message || translate("workerJobs.cancelJobFailed"),
                );
              },
            });
          },
        },
      ],
    );
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" backgroundColor={colors.primary.pink} />

      {/* Header */}
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {translate("workerJobs.assignedJob")}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing || false}
            onRefresh={onRefresh}
            colors={[colors.primary.pink]}
            tintColor={colors.primary.pink}
          />
        }
      >
        {/* Main Job Info Card */}
        <View style={[styles.card]}>
          {/* Earned amount badge at top */}
          {/* <View style={styles.earnedBox}>
            <Text style={styles.earnedBoxText}>
              {translate("workerJobs.estEarnedAmount", {
                amount: job.earned_amount_after_worker_commission || 0,
              })}
            </Text>
          </View> */}
          <View style={styles.cardHeader}>
            <Text style={styles.jobTitle}>{job.job_title || "N/A"}</Text>
          </View>

          <TouchableOpacity
            onPress={handleBusinessProfilePress}
            activeOpacity={0.7}
            style={styles.businessRow}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={{
                  uri:
                    job.business_profile_picture ||
                    "https://picsum.photos/60/60?random=1",
                }}
                style={styles.businessProfilePicture}
              />
              <Text style={styles.businessName}>
                {job.business_name || "N/A"}
              </Text>
            </View>
            <Text style={styles.pipe}>|</Text>
            <View style={styles.ratingRow}>
              <View style={{ flexDirection: "row", marginRight: 5 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <FontAwesome
                    key={s}
                    name="star"
                    size={13}
                    color={
                      s <= Math.floor(job.business_avg_ratings || 0)
                        ? "#FFD700"
                        : "#E0E0E0"
                    }
                    style={{ marginRight: 2 }}
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>
                {job.business_avg_ratings || 0}
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.description}>{job.description || "N/A"}</Text>

          <View style={styles.divider} />

          <View style={styles.detailsList}>
            <JobDetailRow
              icon={jobPositionIcon}
              label={translate("workerJobs.positionLabel")}
              value={job.position || "N/A"}
              isImage
              badge={job.experience_level}
            />
            <JobDetailRow
              icon={locationIcon}
              label={translate("workerJobs.locationLabel")}
              value={job.location_address || "N/A"}
              isImage
              isClickable
              onPress={() =>
                openMapsApp(
                  job.location_details || { address: job.location_address },
                )
              }
            />
            <JobDetailRow
              icon={paymentRate}
              label={translate("workerJobs.payRateLabel")}
              value={job.pay_rate ? `$${job.pay_rate}/hr` : "N/A"}
              isImage
              secondLabel={translate("workerJobs.paymentMode")}
              secondValue={job.payment_method_text || "N/A"}
            />
            <JobDetailRow
              icon={distanceIcon}
              label={translate("workerJobs.distanceLabel")}
              value={job.distance_km ? `${job.distance_km}km` : "N/A"}
              isImage
            />
          </View>

          {/* Check In / Out Buttons */}
          <View style={styles.checkInOutRow}>
            <TouchableOpacity
              style={[
                styles.checkButton,
                {
                  backgroundColor: job.showCheckInButton
                    ? colors.primary.darkRed
                    : colors.ui.actionButtonDisabled,
                },
              ]}
              onPress={() => handleCheckInOut(true)}
              disabled={!job.showCheckInButton}
            >
              <Text style={[styles.checkButtonText]}>
                {translate("workerHome.checkIn")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.checkButton,
                {
                  backgroundColor: job.showCheckOutButton
                    ? colors.primary.darkRed
                    : colors.ui.actionButtonDisabled,
                },
              ]}
              onPress={() => handleCheckInOut(false)}
              disabled={!job.showCheckOutButton}
            >
              <Text style={styles.checkButtonText}>
                {translate("workerHome.checkOut")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Floating Time Schedules Card moved inside */}
          <JobTimeScheduleTable slots={job.slots} />

          {/* Buttons Section Moved Here */}
          <View style={styles.buttonsSection}>
            <MessageBusinessButton
              businessId={job.business_id}
              businessName={job.business_name}
              businessEmail={job.business_email}
              businessProfile={job.business_profile_picture}
              buttonText={translate("workerJobs.message")}
              style={styles.messageButton}
              textStyle={styles.messageButtonText}
            />

            {job.slots && job.slots.length > 0 && (
              <TouchableOpacity
                style={styles.disputeButton}
                onPress={() => setShowDisputeModal(true)}
              >
                <Text style={styles.disputeButtonText}>
                  {translate("workerJobs.raiseDispute")}
                </Text>
              </TouchableOpacity>
            )}

            {canCancelAssignment && (
              <TouchableOpacity
                style={[
                  styles.cancelAssignmentButton,
                  isCancelling && { opacity: 0.6 },
                ]}
                onPress={handleCancelJob}
                disabled={isCancelling}
              >
                <Text style={styles.cancelAssignmentButtonText}>
                  {translate("workerJobs.cancelJob")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={[{ marginBottom: 60 }]}>
          <JobPositionResponsibilitiesCard
            position={job.position}
            responsibilities={job.responsibilities || []}
            responsibilityLabel={translate("workerJobs.responsibilities")}
            useNeutralStyle
          />
        </View>
      </ScrollView>

      {/* Raise Dispute Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDisputeModal}
        onRequestClose={() => setShowDisputeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDisputeModal(false)}
            >
              <Ionicons name="close" size={28} color={colors.text.primary} />
            </TouchableOpacity>

            {/* Icon */}
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={80}
                color={colors.primary.darkRed}
              />
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>
              {translate("workerJobs.raiseDispute")}
            </Text>

            {/* Description */}
            <Text style={styles.modalDescription}>
              {translate("workerJobs.disputeWarning")}
            </Text>

            {/* Buttons */}
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                setShowDisputeModal(false);
                const allDisputed =
                  job.slots &&
                  job.slots.length > 0 &&
                  job.slots.every((s) => s.isDisputed === true);

                if (allDisputed) {
                  Alert.alert(
                    translate("workerRaiseDispute.raiseDispute"),
                    translate("workerRaiseDispute.allSlotsDisputedAlready"),
                  );
                  return;
                }

                navigation.navigate("WorkerRaiseDispute", {
                  jobId: job.id,
                  slots: job.slots,
                });
              }}
            >
              <Text style={styles.confirmButtonText}>
                {translate("workerJobs.continue")}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={colors.white}
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowDisputeModal(false)}
            >
              <Text style={styles.cancelButtonText}>
                {translate("workerCommon.cancel")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFF5F7", // Very light pink background
  },
  headerSafeArea: {
    backgroundColor: colors.primary.pink,
    zIndex: 10,
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: colors.primary.pink,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 25,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: colors.primary.pink,
    flex: 1,
    marginRight: 10,
  },
  price: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: colors.auth.darkRed,
  },
  earnedBox: {
    alignSelf: "stretch",
    backgroundColor: "#fff4f6",
    borderWidth: 1,
    borderColor: colors.primary.pink,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 14,
    justifyContent: "center",
    marginHorizontal: 0,
  },
  earnedBoxText: {
    color: colors.auth.darkRed,
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
  },
  businessRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 12,
  },
  businessProfilePicture: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 8,
  },
  businessName: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: colors.auth.darkRed,
  },
  pipe: {
    fontSize: 14,
    color: colors.text.secondary,
    marginHorizontal: 8,
    fontFamily: "Poppins_400Regular",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: "#FFD700", // Gold
  },
  description: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 15,
  },
  detailsList: {
    gap: 15,
  },
  // Check In/Out Buttons
  checkInOutRow: {
    flexDirection: "row",
    gap: 15,
    marginTop: 25,
  },
  checkButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  checkButtonText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    letterSpacing: 1,
  },
  // Buttons
  buttonsSection: {
    marginTop: 30, // Spacing from time schedule
  },
  messageButton: {
    flex: 1,
    backgroundColor: "#05CD4842",
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  messageButtonText: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: colors.black,
  },
  disputeButton: {
    backgroundColor: colors.auth.darkRed,
    borderRadius: 15,
    paddingVertical: 8,
    marginTop: 8,
    alignItems: "center",
    shadowColor: colors.auth.darkRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  disputeButtonText: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: colors.white,
  },
  cancelAssignmentButton: {
    borderWidth: 1.5,
    borderColor: colors.auth.darkRed,
    borderRadius: 15,
    paddingVertical: 8,
    marginTop: 8,
    alignItems: "center",
  },
  cancelAssignmentButtonText: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: colors.auth.darkRed,
  },
  // Modal Styles
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
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 25,
    alignItems: "center",
    width: "100%",
    maxWidth: 350,
    shadowColor: colors.ui.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 15,
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.ui.selectedBackground,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  iconContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: colors.black,
    marginBottom: 12,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 20,
  },
  confirmButton: {
    width: "100%",
    backgroundColor: colors.primary.darkRed,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 12,
    shadowColor: colors.primary.darkRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 0.5,
  },
  cancelButton: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: colors.primary.darkRed,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: colors.primary.darkRed,
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
  },
});
