import {
  Feather,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import calendarIcon from "../../../assets/worker-images/calendar1.png";
import jobPositionIcon from "../../../assets/worker-images/position (2).png";
import locationIcon from "../../../assets/worker-images/location.png";
import paymentMethod from "../../../assets/worker-images/payment-method.png";
import paymentRate from "../../../assets/worker-images/payment-rate.png";
import colors from "../../../theme/worker/colors";
import distanceIcon from "../../../assets/worker-images/distance.png";
import {
  useFetchWorkerJobById,
  useFetchPayoutPreview,
} from "../../../services/WorkerJobServices";
import { useFetchWorkerProfile } from "../../../services/WorkerProfileServices";
import { openMapsApp } from "../../../utils/mapUtils";
import JobPositionResponsibilitiesCard from "../../../components/jobs/JobPositionResponsibilitiesCard";
import JobDetailRow from "../../../components/jobs/JobDetailRow";
import PayoutConfirmationModal from "../../../components/workerModals/PayoutConfirmationModal";
import VerificationRequiredModal from "../../../components/workerModals/VerificationRequiredModal";
import OverlappingInfoModal from "../../../components/workerModals/OverlappingInfoModal";
import { useTranslation } from "../../../hooks/useTranslation";

export default function JobDetailsScreen({
  jobData: propsJobData,
  onRefresh,
  isRefreshing,
}) {
  const navigation = useNavigation();
  const route = useRoute();
  const { translate } = useTranslation();
  const { jobId } = route.params || {};

  // Fetch job details using the hook only if data is not provided via props
  const {
    isPending,
    error,
    data: fetchedJobData,
    isError,
    refetch,
  } = useFetchWorkerJobById(!propsJobData ? jobId : null);

  // Use props data if available, otherwise use fetched data
  const jobData = propsJobData || fetchedJobData;

  // State for slot selection and modal
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [payoutPreview, setPayoutPreview] = useState(null);
  const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
  const [showOverlapModal, setShowOverlapModal] = useState(false);
  const [selectedOverlapData, setSelectedOverlapData] = useState(null);

  // Fetch worker profile for verification check
  const { data: workerProfile, isPending: isPending2 } =
    useFetchWorkerProfile();

  // Hook for fetching payout preview
  const { mutate: fetchPayoutPreview, isPending: isPayoutPending } =
    useFetchPayoutPreview();

  // Reset selection when job data changes
  useEffect(() => {
    setSelectedSlots([]);
    setCurrentSlotIndex(0);
  }, [jobData?.id]);

  // Reset slot index when modal opens
  useEffect(() => {
    if (showConfirmModal) {
      setCurrentSlotIndex(0);
    }
  }, [showConfirmModal]);

  // Toggle slot selection
  const toggleSlotSelection = (slotId) => {
    setSelectedSlots((prev) => {
      if (prev.includes(slotId)) {
        return prev.filter((id) => id !== slotId);
      } else {
        return [...prev, slotId];
      }
    });
  };

  // Handle apply button click
  const handleApplyClick = () => {
    // Check verification status first

    if (isPending2) {
      return;
    }

    const verificationStatus = workerProfile?.verification_status;
    const isApproved = verificationStatus === "approved";
    // const isApproved = 1;

    if (!isApproved) {
      setShowVerificationModal(true);
      return;
    }

    if (selectedSlots.length === 0) {
      alert(translate("workerJobs.selectAtLeastOneSlot"));
      return;
    }

    // Fetch payout preview
    fetchPayoutPreview(selectedSlots, {
      onSuccess: (data) => {
        setPayoutPreview(data);
        setShowConfirmModal(true);
      },
      onError: (error) => {
        alert(error.message || translate("workerJobs.failedLoadPayoutPreview"));
      },
    });
  };

  // Confirm and navigate to apply screen
  const handleConfirmApply = () => {
    // Get full slot data for the selected IDs
    const selectedSlotsData = jobData.slots.filter((s) =>
      selectedSlots.includes(s.id),
    );

    setShowConfirmModal(false);
    navigation.navigate("WorkerApplyJob", {
      jobId: jobData.id,
      title: jobData.job_title,
      selectedSlots: selectedSlotsData,
    });
  };

  // Handle slot navigation
  const handlePrevSlot = () => {
    setCurrentSlotIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextSlot = () => {
    if (payoutPreview?.items) {
      setCurrentSlotIndex((prev) =>
        Math.min(payoutPreview.items.length - 1, prev + 1),
      );
    }
  };

  // Handle business profile navigation
  const handleBusinessProfilePress = () => {
    if (jobData?.business_id) {
      navigation.navigate("BusinessProfile", {
        businessId: jobData.business_id,
        businessName: jobData.business_name,
      });
    }
  };

  // Handle overlapping badge press
  const handleOverlapPress = (overlapData) => {
    setSelectedOverlapData(overlapData);
    setShowOverlapModal(true);
  };

  // Loading state (only when fetching, not when using props)
  if (!propsJobData && isPending) {
    return (
      <View style={styles.mainContainer}>
        <StatusBar style="light" backgroundColor={colors.primary.pink} />
        <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Feather name="arrow-left" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {translate("workerJobs.jobDetails")}
            </Text>
          </View>
        </SafeAreaView>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary.pink} />
          <Text style={styles.loadingText}>
            {translate("workerJobs.loadingJobDetails")}
          </Text>
        </View>
      </View>
    );
  }

  // Error state (only when fetching, not when using props)
  if (!propsJobData && isError) {
    return (
      <View style={styles.mainContainer}>
        <StatusBar style="light" backgroundColor={colors.primary.pink} />
        <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Feather name="arrow-left" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {translate("workerJobs.jobDetails")}
            </Text>
          </View>
        </SafeAreaView>
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={60}
            color={colors.text.secondary}
          />
          <Text style={styles.errorText}>
            {error?.message || translate("workerJobs.failedLoadJobDetails")}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>
              {translate("workerCommon.retry")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Compute whether there are any slots still open for application
  const hasSelectableSlots = (jobData?.slots || []).some(
    (slot) =>
      slot.is_available !== false && slot.is_applied_for_proposal !== true,
  );

  // No data state (check both scenarios)
  if (!jobData) {
    return (
      <View style={styles.mainContainer}>
        <StatusBar style="light" backgroundColor={colors.primary.pink} />
        <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Feather name="arrow-left" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {translate("workerJobs.jobDetails")}
            </Text>
          </View>
        </SafeAreaView>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            {translate("workerJobs.jobNotFound")}
          </Text>
        </View>
      </View>
    );
  }

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
            {translate("workerJobs.jobDetails")}
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
        {/* Main Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.jobTitle}>{jobData.job_title || "N/A"}</Text>
            <View style={styles.priceWrap}>
              <Text style={styles.priceApprox}>Est.&nbsp;</Text>
              <Text style={styles.price}>
                ${jobData.job_cost_for_worker_after_worker_commission || 0}
              </Text>
            </View>
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
                    jobData.business_profile_picture ||
                    "https://picsum.photos/60/60?random=1",
                }}
                style={styles.businessProfilePicture}
              />
              <Text style={styles.businessName}>
                {jobData.business_name || "N/A"}
              </Text>
            </View>
            <Text style={styles.pipe}>|</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <FontAwesome
                  key={s}
                  name="star"
                  size={14}
                  color={
                    s <= Math.floor(jobData.business_avg_ratings || 0)
                      ? colors.ui.star
                      : "#E0E0E0"
                  }
                  style={{ marginRight: 2 }}
                />
              ))}
              <Text style={styles.ratingText}>
                {jobData.business_avg_ratings || 0}
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.description}>{jobData.description || "N/A"}</Text>

          <View style={styles.detailsList}>
            <JobDetailRow
              icon={jobPositionIcon}
              label={translate("workerJobs.positionLabel")}
              value={jobData.position || "N/A"}
              isImage
              badge={jobData.experience_level}
            />
            <JobDetailRow
              icon={locationIcon}
              label={translate("workerJobs.locationLabel")}
              value={jobData.location_address || "N/A"}
              isImage
              isClickable
              onPress={() =>
                openMapsApp(
                  jobData.location_details || {
                    address: jobData.location_address,
                  },
                )
              }
            />
            <JobDetailRow
              icon={paymentRate}
              label={translate("workerJobs.payRateLabel")}
              value={jobData.pay_rate ? `$${jobData.pay_rate}/hr` : "N/A"}
              isImage
              secondLabel={translate("workerJobs.paymentMode")}
              secondValue={jobData.payment_method_text || "N/A"}
              secondIcon={paymentMethod}
            />
            <JobDetailRow
              icon={distanceIcon}
              label={translate("workerJobs.distanceLabel")}
              value={jobData.distance_km ? `${jobData.distance_km}km` : "N/A"}
              isImage
            />
          </View>

          <View style={styles.postedDateBox}>
            <View style={styles.postedDateInner}>
              <Image
                source={calendarIcon}
                style={styles.boxIcon}
                resizeMode="contain"
              />
              <Text style={styles.postedDateText}>
                {translate("workerJobs.posted")}{" "}
                <Text style={styles.dateValue}>
                  {jobData.posted_at_human || "N/A"}
                </Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Time Schedules Card */}
        <View style={styles.card}>
          <Text style={styles.sectionSubtitle}>
            {translate("workerJobs.timeSchedules")}
          </Text>
          {jobData.slots && jobData.slots.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                  <View style={[styles.tableHeaderCell, { width: 100 }]}>
                    <Text style={styles.tableHeaderText}>
                      {translate("workerJobs.slots")}
                    </Text>
                  </View>
                  <View style={[styles.tableHeaderCell, { width: 110 }]}>
                    <Text style={styles.tableHeaderText}>
                      {translate("workerHome.startDate")}
                    </Text>
                  </View>
                  <View style={[styles.tableHeaderCell, { width: 110 }]}>
                    <Text style={styles.tableHeaderText}>
                      {translate("workerHome.endDate")}
                    </Text>
                  </View>
                  <View style={[styles.tableHeaderCell, { width: 100 }]}>
                    <Text style={styles.tableHeaderText}>
                      {translate("workerHome.joiningTime")}
                    </Text>
                  </View>
                  <View style={[styles.tableHeaderCell, { width: 100 }]}>
                    <Text style={styles.tableHeaderText}>
                      {translate("workerJobs.finishTime")}
                    </Text>
                  </View>
                  <View style={[styles.tableHeaderCell, { width: 90 }]}>
                    <Text style={styles.tableHeaderText}>
                      {translate("workerHome.breakTime")}
                    </Text>
                  </View>
                </View>
                {jobData.slots.map((slot, index) => {
                  const isSelected = selectedSlots.includes(slot.id);
                  const isAlreadyApplied =
                    slot.is_applied_for_proposal === true;
                  const isAvailable =
                    slot.is_available !== false && !isAlreadyApplied;
                  return (
                    <View
                      key={slot.id ?? index}
                      style={[
                        styles.tableRow,
                        isAlreadyApplied && styles.tableRowDisabled,
                        !isAvailable &&
                          !isAlreadyApplied &&
                          styles.tableRowDisabled,
                      ]}
                    >
                      <TouchableOpacity
                        style={[
                          styles.tableCell,
                          {
                            width: 100,
                            flexDirection: "column",
                            justifyContent: "center",
                          },
                        ]}
                        onPress={() =>
                          isAvailable && toggleSlotSelection(slot.id)
                        }
                        activeOpacity={isAvailable ? 0.7 : 1}
                        disabled={!isAvailable}
                      >
                        {slot.is_filled && (
                          <View
                            style={[
                              styles.overlappingBadge,
                              {
                                backgroundColor: "#ECEFF1",
                                borderColor: "#B0BEC5",
                                marginLeft: 0,
                              },
                            ]}
                          >
                            <MaterialCommunityIcons
                              name="account-check-outline"
                              size={10}
                              color="#455A64"
                              style={{ marginRight: 2 }}
                            />
                            <Text
                              style={[
                                styles.overlappingBadgeText,
                                { color: "#455A64" },
                              ]}
                            >
                              {translate("workerJobs.filled")}
                            </Text>
                          </View>
                        )}
                        {slot.isOverlapping && !slot.is_filled && (
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => handleOverlapPress(slot.matchingWith)}
                            style={[styles.overlappingBadge, { marginLeft: 0 }]}
                          >
                            <Ionicons
                              name="warning-outline"
                              size={10}
                              color="#EF6C00"
                              style={{ marginRight: 2 }}
                            />
                            <Text style={styles.overlappingBadgeText}>
                              {translate("workerJobs.overlapping")}
                            </Text>
                          </TouchableOpacity>
                        )}
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginTop:
                              (slot.isOverlapping && !slot.is_filled) ||
                              slot.is_filled
                                ? 4
                                : 0,
                          }}
                        >
                          {isAvailable ? (
                            <>
                              <MaterialCommunityIcons
                                name={
                                  isSelected
                                    ? "checkbox-marked"
                                    : "checkbox-blank-outline"
                                }
                                size={16}
                                color={colors.primary.pink}
                                style={{ marginRight: 4 }}
                              />
                              <Text style={styles.tableCellText}>
                                Worker {index + 1}
                              </Text>
                            </>
                          ) : isAlreadyApplied ? (
                            <View style={styles.appliedBadge}>
                              <Text style={styles.appliedBadgeText}>
                                {translate("workerJobs.applied")}
                              </Text>
                            </View>
                          ) : (
                            <Text
                              style={[
                                styles.tableCellText,
                                styles.tableCellDisabledText,
                              ]}
                            >
                              {slot.assigned_worker?.name ||
                                `Worker ${index + 1}`}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                      <View style={[styles.tableCell, { width: 110 }]}>
                        <Text style={styles.tableCellText}>
                          {slot.startDate || "N/A"}
                        </Text>
                      </View>
                      <View style={[styles.tableCell, { width: 110 }]}>
                        <Text style={styles.tableCellText}>
                          {slot.endDate || "N/A"}
                        </Text>
                      </View>
                      <View style={[styles.tableCell, { width: 100 }]}>
                        <Text style={styles.tableCellText}>
                          {slot.joiningTime || "N/A"}
                        </Text>
                      </View>
                      <View style={[styles.tableCell, { width: 100 }]}>
                        <Text style={styles.tableCellText}>
                          {slot.endTime || "N/A"}
                        </Text>
                      </View>
                      <View style={[styles.tableCell, { width: 90 }]}>
                        <Text style={styles.tableCellText}>
                          {slot.breakTime || "-"}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          ) : (
            <Text style={styles.noDataText}>
              {translate("workerJobs.noScheduleAvailable")}
            </Text>
          )}
        </View>

        {/* Worker Status Card - Only show if proposal exists */}
        {/* {jobData.proposal_id && (
          <View style={styles.card}>
            <Text style={styles.sectionSubtitle}>Your Application Status</Text>
            <View style={styles.workerInfoContainer}>
              <View style={styles.workerInfoRow}>
                <Text style={styles.workerInfoLabel}>Application ID:</Text>
                <Text style={styles.workerInfoValue}>
                  #{jobData.proposal_id}
                </Text>
              </View>
              <View style={styles.workerInfoRow}>
                <Text style={styles.workerInfoLabel}>Status:</Text>
                <View
                  style={[
                    styles.proposalStatusBadge,
                    jobData.proposal_status === "selected" &&
                      styles.proposalStatusBadgeSelected,
                    jobData.proposal_status === "rejected" &&
                      styles.proposalStatusBadgeRejected,
                  ]}
                >
                  <Text
                    style={[
                      styles.proposalStatusText,
                      jobData.proposal_status === "selected" &&
                        styles.proposalStatusTextSelected,
                      jobData.proposal_status === "rejected" &&
                        styles.proposalStatusTextRejected,
                    ]}
                  >
                    {jobData.proposal_status
                      ? jobData.proposal_status.charAt(0).toUpperCase() +
                        jobData.proposal_status.slice(1)
                      : "N/A"}
                  </Text>
                </View>
              </View>
              {jobData.assigned_slot_id && (
                <View style={styles.workerInfoRow}>
                  <Text style={styles.workerInfoLabel}>Assigned Slot:</Text>
                  <Text style={styles.workerInfoValue}>
                    Slot #{jobData.assigned_slot_id}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )} */}

        {/* Position & Responsibilities */}
        <JobPositionResponsibilitiesCard
          position={jobData.position}
          responsibilities={jobData.responsibilities}
          responsibilityLabel={translate("workerJobs.responsibilities")}
          useNeutralStyle={true}
        />

        {/* Apply Button - Show if there are still selectable slots */}
        {hasSelectableSlots && (
          <TouchableOpacity
            style={[
              styles.applyButton,
              selectedSlots.length === 0 && styles.applyButtonDisabled,
            ]}
            onPress={handleApplyClick}
            disabled={selectedSlots.length === 0 || isPayoutPending}
          >
            <Text style={styles.applyButtonText}>
              {isPayoutPending
                ? translate("workerCommon.loading")
                : `${translate("workerJobs.apply")}${selectedSlots.length > 0 ? ` (${selectedSlots.length})` : ""}`}
            </Text>
          </TouchableOpacity>
        )}

        {/* Show reason why cannot apply if no slots are selectable */}
        {/* {!hasSelectableSlots &&
          !jobData.can_apply &&
          jobData.can_apply_reason && (
            <View style={styles.infoCard}>
              <MaterialCommunityIcons
                name="information-outline"
                size={20}
                color={colors.text.secondary}
              />
              <Text style={styles.infoText}>{jobData.can_apply_reason}</Text>
            </View>
          )} */}
      </ScrollView>

      {/* Payout Confirmation Modal */}
      <PayoutConfirmationModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmApply}
        payoutPreview={payoutPreview}
        currentSlotIndex={currentSlotIndex}
        onPrevSlot={handlePrevSlot}
        onNextSlot={handleNextSlot}
        slots={jobData?.slots}
      />

      {/* Verification Required Modal */}
      <VerificationRequiredModal
        visible={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        verificationStatus={workerProfile?.verification_status}
      />

      {/* Overlapping Info Modal */}
      <OverlappingInfoModal
        visible={showOverlapModal}
        onClose={() => setShowOverlapModal(false)}
        overlapData={selectedOverlapData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.auth.background,
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
    marginRight: 15,
    padding: 5,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
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
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  jobTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: colors.primary.pink,
    flex: 1,
    marginRight: 10,
  },
  price: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: colors.primary.pink,
  },
  priceWrap: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
  },
  priceApprox: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: colors.text.secondary,
    marginRight: 6,
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
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: colors.text.secondary,
  },
  description: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  detailsList: {
    gap: 15,
  },
  postedDateBox: {
    marginTop: 25,
    backgroundColor: colors.ui.postedDateBackground,
    borderWidth: 1,
    borderColor: colors.ui.postedDateBorder,
    borderRadius: 8,
    padding: 12,
    alignSelf: "center",
  },
  postedDateInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  boxIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  postedDateText: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: colors.text.primary,
  },
  dateValue: {
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: colors.auth.darkRed,
    marginBottom: 15,
  },
  tableContainer: {
    minWidth: 600,
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
  tableCellDisabledText: {
    color: colors.text.lightGray,
    fontFamily: "Poppins_500Medium",
  },
  tableRowDisabled: {
    opacity: 0.5,
    backgroundColor: "#f5f5f5",
  },
  tableCell: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.ui.selectedBackground,
    borderWidth: 1,
    borderColor: colors.primary.pink,
  },
  statusBadgeFilled: {
    backgroundColor: "#e8f5e9",
    borderColor: "#4caf50",
  },
  statusBadgeText: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary.pink,
  },
  statusBadgeTextFilled: {
    color: "#4caf50",
  },
  workerInfoContainer: {
    gap: 15,
  },
  workerInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  workerInfoLabel: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: colors.text.primary,
  },
  workerInfoValue: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: colors.text.secondary,
  },
  proposalStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.ui.selectedBackground,
  },
  proposalStatusBadgeSelected: {
    backgroundColor: "#e8f5e9",
  },
  proposalStatusBadgeRejected: {
    backgroundColor: "#ffebee",
  },
  proposalStatusText: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary.pink,
  },
  proposalStatusTextSelected: {
    color: "#4caf50",
  },
  proposalStatusTextRejected: {
    color: "#f44336",
  },
  applyButton: {
    backgroundColor: colors.primary.pink,
    height: 55,
    borderRadius: 27.5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: colors.primary.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  applyButtonText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: colors.text.primary,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: colors.text.secondary,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: colors.primary.pink,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  noDataText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 10,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.selectedBackground,
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: colors.text.secondary,
    lineHeight: 20,
  },
  applyButtonDisabled: {
    backgroundColor: "#CCC",
    opacity: 0.6,
  },
  tableRowApplied: {
    backgroundColor: "#f0faf0",
  },
  appliedBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  appliedBadgeText: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: colors.text.secondary,
  },
  overlappingBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FFB74D",
    marginLeft: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  overlappingBadgeText: {
    fontSize: 8,
    fontFamily: "Poppins_700Bold",
    color: "#E65100",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
});
