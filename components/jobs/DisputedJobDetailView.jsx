import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors, fonts, fontSizes } from "../../theme";
import { useTranslation } from "../../hooks/useTranslation";
import TimeScheduleCard from "./TimeScheduleCard";
import CostBreakdownCard from "./CostBreakdownCard";
import ActiveAssignedWorkersCard from "./ActiveAssignedWorkersCard";

// Import PNG icons

const WorkersIcon = require("../../assets/images/worker.png");
const calendarIcon = require("../../assets/images/calender.png");
const evidenceIcon = require("../../assets/images/evidence.png");
const reasoningIcon = require("../../assets/images/reasoning.png");
const medalIcon = require("../../assets/images/medal.png");
const reportIcon = require("../../assets/images/report.png");
const positionIcon = require("../../assets/images/position.png");
const shiftTimeIcon = require("../../assets/images/timer.png");
const payRateIcon = require("../../assets/images/payrate.png");
const breaksTimeIcon = require("../../assets/images/break.png");
const totalWorkersIcon = require("../../assets/images/worker.png");
const totalCostIcon = require("../../assets/images/cost.png");
const paymentModeIcon = require("../../assets/images/paymentmode.png");
const locationIcon = require("../../assets/images/location.png");
const scoreIcon = require("../../assets/images/score.png");

/**
 * DisputedJobDetailView - Component for displaying disputed job details
 * Matches the Figma design exactly for disputed job status
 *
 * @param {object} details - Job details object
 * @param {array} disputes - Array of dispute objects
 * @param {boolean} refreshing - Refresh control state
 * @param {function} onRefresh - Refresh callback
 * @param {function} onReasonSelect - Reason selection callback
 * @param {function} onUploadEvidence - Upload evidence callback
 * @param {array} reasonOptions - Available reason options for dropdown
 * @param {string} selectedReason - Currently selected reason
 * @param {array} uploadedFiles - List of uploaded evidence files
 */
export default function DisputedJobDetailView({
  details,
  disputes = [],
  refreshing,
  onRefresh,
  onReasonSelect,
  onUploadEvidence,
  reasonOptions = [],
  selectedReason = "",
  uploadedFiles = [],
  onMarkAsCompleted,
  isCompleting,
}) {
  const navigation = useNavigation();
  const { translate } = useTranslation();
  // const [showReasonDropdown, setShowReasonDropdown] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false);

  // Helper component for info rows with icons
  const InfoRow = ({ left, right, iconSource }) => (
    <View style={styles.infoRowDetail}>
      <View style={styles.infoLabelRow}>
        {iconSource && (
          <Image
            source={iconSource}
            style={styles.infoIconDetail}
            resizeMode="contain"
          />
        )}
        <Text style={styles.infoLabelDetail}>{left}</Text>
      </View>
      <Text style={styles.infoValueDetail}>{right}</Text>
    </View>
  );

  // Chip component for skills/responsibilities
  const Chip = ({ label, variant = "skill" }) => (
    <View style={styles.chip}>
      {variant === "skill" && (
        <Image
          source={scoreIcon}
          style={styles.chipIcon}
          resizeMode="contain"
        />
      )}
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );

  const handleViewWorkerProfile = (workerId) => {
    navigation.navigate("ApplicantProfile", {
      workerId: workerId,
    });
  };

  let alldisputesData = disputes.map((dispute) => ({
    id: dispute.id,
    title: dispute.title || dispute.reason,
    description: dispute.description,
    dispute_raised_by: dispute?.dispute_raised_by, // "worker" or "business owner"
    workerName: dispute.workers?.[0]?.name || "",
    workerId: dispute.workers?.[0]?.id || "",
    workers: dispute.workers || [],
    slot: dispute.slot || dispute.workers?.[0]?.slot || null,
    raisedDate: dispute.raised_date,
    status: dispute.status,
    reason: dispute.reason,
    adminResponse: dispute.admin_response,
    evidenceUrls:
      dispute.evidence_urls ||
      (dispute.evidence_url ? [dispute.evidence_url] : []),
  }));

  const adminResponse = disputes.length > 0 ? disputes[0].admin_response : null;

  // filter out disputes by dispute_raised_by

  const isMultipleDisputes = alldisputesData.length > 1;
  const disputeData = alldisputesData[0]; // Use the first dispute for header info

  // Get dispute status display
  const getDisputeStatusDisplay = (status = disputeData?.status) => {
    const currentStatus = status || "pending";
    const capitalizedStatus =
      currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1);
    return (
      <Text
        style={[
          styles.statusText,
          {
            color: "#827717",
            fontFamily: fonts.bold,
          },
        ]}
      >
        {capitalizedStatus}
      </Text>
    );
  };

  // Render worker label for sections
  const renderWorkerLabel = (workerName) => (
    <View style={styles.workerLabelSmall}>
      <Text style={styles.workerLabelSmallText}>
        <Text style={styles.workerNameSmall}>{workerName}</Text>
      </Text>
    </View>
  );

  const experienceKeyMap = {
    beginner: "experience.beginner",
    intermediate: "experience.intermediate",
    expert: "experience.expert",
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      scrollEventThrottle={16}
      directionalLockEnabled={true}
      decelerationRate="normal"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#12AA73"]}
          tintColor="#12AA73"
        />
      }
    >
      {/* Job Info Card with Disputed Badge */}
      <View style={styles.topCard}>
        <View style={styles.jobHeaderRow}>
          <Text style={styles.jobTitle}>{details?.title || "-"}</Text>
          <View style={styles.disputedBadge}>
            <Text style={styles.disputedBadgeText}>
              {translate("jobs.disputed")}
            </Text>
          </View>
        </View>

        {/* Worker Involved */}
        <View style={styles.infoRow}>
          <Image
            source={WorkersIcon}
            style={styles.infoIcon2}
            resizeMode="contain"
          />

          <Text style={styles.infoLabel}>
            {translate("jobs.workerInvolved")}:{" "}
          </Text>
          <Text style={styles.infoValue}>
            {alldisputesData
              .map((d) => d.workerName)
              .filter(Boolean)
              .join(", ") ||
              details?.assignedWorkers?.[0]?.name ||
              "-"}
          </Text>
        </View>

        {/* Dispute Raised Date */}
        <View style={styles.infoRow}>
          <Image
            source={calendarIcon}
            style={styles.infoIcon2}
            resizeMode="contain"
          />
          <Text style={styles.infoLabel}>
            {translate("jobs.disputeRaised")}:{" "}
          </Text>
          <Text style={styles.infoValueGreen}>
            {disputeData?.raisedDate || translate("jobs.notAvailable")}
          </Text>
        </View>

        {/* Status Pills */}
        <View style={styles.statusBadge}>
          <Text style={styles.statusLabel}>{translate("jobs.status")}: </Text>
          <View style={styles.statusRow}>
            {getDisputeStatusDisplay(disputeData?.status)}
          </View>
        </View>
      </View>

      {/* Toggle Job Details Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.toggleButton}
        onPress={() => setShowJobDetails(!showJobDetails)}
      >
        <Text style={styles.toggleButtonText}>
          {showJobDetails
            ? translate("jobs.hideJobDetails")
            : translate("jobs.viewJobDetails")}
        </Text>
        <MaterialIcons
          name={showJobDetails ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={24}
          color={colors.tertiary}
        />
      </TouchableOpacity>

      {/* Job Details Section (Conditional) */}
      {showJobDetails && (
        <View style={styles.jobDetailsContainer}>
          {/* Main Job Card Content (Title, Desc, Location) */}
          <View style={styles.card}>
            <Text style={styles.jobTitleDetail}>{details?.title}</Text>
            <Text style={styles.jobDescDetail}>{details?.description}</Text>

            <View style={styles.locationRowDetail}>
              <Image
                source={locationIcon}
                style={styles.locationIconDetail}
                resizeMode="contain"
              />
              <Text style={styles.locationLabelDetail}>
                {translate("common.location")}:{" "}
              </Text>
              <Text style={styles.locationValueDetail}>
                {details?.location?.address ||
                  translate("jobs.locationNotSpecified")}
              </Text>
            </View>
          </View>

          {/* Job Information Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitleDetail}>
              {translate("jobs.jobInformation")}
            </Text>

            <View style={styles.infoGridDetail}>
              <InfoRow
                left={translate("common.position") + ":"}
                right={details?.position}
                iconSource={positionIcon}
              />
              <InfoRow
                left={translate("jobs.totalHours") + ":"}
                right={details?.shiftTime}
                iconSource={shiftTimeIcon}
              />
              <InfoRow
                left={translate("common.payRate") + ":"}
                right={details?.payRate}
                iconSource={payRateIcon}
              />
              {details?.scheduledType === "same" && (
                <InfoRow
                  left={translate("jobs.breaksTime") + ":"}
                  right={details?.breaksTime}
                  iconSource={breaksTimeIcon}
                />
              )}
              <InfoRow
                left={translate("jobs.workersRequired") + ":"}
                right={String(details?.totalWorkers || 0)}
                iconSource={WorkersIcon}
              />
              <InfoRow
                left={translate("jobs.totalCost") + ":"}
                right={details?.totalCost}
                iconSource={totalCostIcon}
              />
              <InfoRow
                left={translate("jobs.paymentMode") + ":"}
                right={details?.paymentMode}
                iconSource={paymentModeIcon}
              />
              <InfoRow
                left={translate("jobs.noOfWorkersAssigned") + ":"}
                right={String(details?.assignedWorkers?.length || 0)}
                iconSource={WorkersIcon}
              />
            </View>

            <View style={styles.datePostedRowDetail}>
              <Image
                source={calendarIcon}
                style={styles.datePostedIconDetail}
                resizeMode="contain"
              />
              <Text style={styles.datePostedLabelDetail}>
                {translate("jobs.datePosted")}:{" "}
              </Text>
              <Text style={styles.datePostedValueDetail}>
                {details?.postedDate}
              </Text>
            </View>

            <View style={styles.dividerDetail} />
            <TimeScheduleCard
              scheduledType={details?.scheduledType}
              assignedWorkers={details?.assignedWorkers}
              showAssignedWorkers={true}
              startDate={details?.startDate}
              endDate={details?.endDate}
              slots={details?.slots}
              variant="flat"
              cardTitle={translate("jobs.timeSchedules")}
              showTitle={details?.scheduledType === "same" ? false : true}
            />

            <View style={styles.dividerDetail} />
            <Text style={styles.subSectionTitleDetail}>
              {translate("common.position")}:
            </Text>
            <View style={styles.chipsRowDetail}>
              <Chip label={details?.position} variant="position" />
            </View>

            <Text style={styles.subSectionTitleDetail}>
              {translate("jobs.experienceLevelRequired")}:
            </Text>
            <View style={styles.chipsRowDetail}>
              <Chip
                label={translate(experienceKeyMap[details.experienceLevel])}
                variant="position"
              />
            </View>

            <Text style={styles.subSectionTitleDetail}>
              {translate("jobs.responsibilitiesSelected")}:
            </Text>
            <View style={styles.chipsRowDetail}>
              {details?.responsibilities &&
              details.responsibilities.length > 0 ? (
                details.responsibilities.map((resp, idx) => (
                  <Chip
                    key={`resp-${idx}`}
                    label={resp}
                    variant="responsibility"
                  />
                ))
              ) : (
                <Text style={styles.noDataTextDetail}>
                  {translate("jobs.noResponsibilitiesSpecified")}
                </Text>
              )}
            </View>
            <View style={styles.dividerDetail} />
            <CostBreakdownCard
              details={details}
              variant="flat"
              cardTitle={translate("jobs.costBreakdown")}
              showTitle={false}
            />
          </View>

          {/* Assigned Workers Card */}
          {details?.assignedWorkers?.length > 0 && (
            <ActiveAssignedWorkersCard
              workers={details.assignedWorkers}
              onViewProfile={handleViewWorkerProfile}
            />
          )}

          {/* Assigned Workers Card */}
          {details?.assignedWorkers?.length > 0 && (
            <ActiveAssignedWorkersCard
              workers={details.assignedWorkers}
              onViewProfile={handleViewWorkerProfile}
            />
          )}
        </View>
      )}

      {/* Dispute Details Card - All Disputes grouped per worker */}
      {alldisputesData.length > 0 && (
        <View style={styles.cardContainer}>
          <View style={styles.cardShadow} />
          <View style={styles.mainCard}>
            {alldisputesData.map((dispute, index) => (
              <View
                key={`dispute-${dispute.id}-${index}`}
                style={[
                  styles.workerInputGroup,
                  index !== 0 && { marginTop: 16 },
                ]}
              >
                {dispute.dispute_raised_by !== "worker" && (
                  <>
                    <View style={styles.sectionRow}>
                      <Image
                        source={medalIcon}
                        style={styles.infoIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.sectionLabel}>
                        {translate("jobs.disputeTitle")}
                        {isMultipleDisputes ? ` (${index + 1})` : ""}
                      </Text>
                    </View>
                    <Text style={styles.disputeTitleValue}>
                      {dispute.title || translate("jobs.workerNotShow")}
                    </Text>
                  </>
                )}

                {/* Disputed Slot Data for each worker */}
                {dispute.workers &&
                  dispute.workers.map((w, wIdx) =>
                    w.slot ? (
                      <View key={`slot-${w.id}-${wIdx}`} style={styles.slotCard}>
                        <View style={styles.slotHeader}>
                          <Image
                            source={calendarIcon}
                            style={styles.slotHeaderIcon}
                            resizeMode="contain"
                          />
                          <Text style={styles.slotHeaderTitle}>
                            {translate("jobs.slotDetails")}
                            {dispute.workers.length > 1 ? ` - ${w.name}` : ""}
                          </Text>
                        </View>
                        <View style={styles.slotGrid}>
                          <View style={styles.slotRow}>
                            <View style={styles.slotItem}>
                              <Text style={styles.slotLabel}>
                                {translate("jobs.startDate")}
                              </Text>
                              <Text style={styles.slotValue}>
                                {w.slot.start_date}
                              </Text>
                            </View>
                            <View style={styles.slotItem}>
                              <Text style={styles.slotLabel}>
                                {translate("jobs.endDate")}
                              </Text>
                              <Text style={styles.slotValue}>
                                {w.slot.end_date}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.slotRow}>
                            <View style={styles.slotItem}>
                              <Text style={styles.slotLabel}>
                                {translate("jobs.joiningTime")} /{" "}
                                {translate("jobs.finishTime")}
                              </Text>
                              <Text style={styles.slotValue}>
                                {w.slot.joining_time} - {w.slot.finish_time}
                              </Text>
                            </View>
                            <View style={styles.slotItem}>
                              <Text style={styles.slotLabel}>
                                {translate("jobs.breakTime")}
                              </Text>
                              <Text style={styles.slotValue}>
                                {w.slot.break_time} min
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    ) : null,
                  )}

                {dispute.dispute_raised_by !== "worker" && (
                  <>
                    <View style={[styles.sectionRow, { marginTop: 20 }]}>
                      <Image
                        source={reasoningIcon}
                        style={styles.infoIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.sectionLabel}>
                        {translate("jobs.reason")}
                      </Text>
                    </View>
                    <View style={styles.descriptionBox}>
                      <Text style={styles.descriptionText}>
                        {dispute.reason || translate("jobs.notAvailable")}
                      </Text>
                    </View>

                    <View style={[styles.sectionRow, { marginTop: 20 }]}>
                      <Image
                        source={reportIcon}
                        style={styles.infoIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.sectionLabel}>
                        {translate("jobs.disputeDescription")}
                      </Text>
                    </View>
                    <View style={styles.descriptionBox}>
                      <Text style={styles.descriptionText}>
                        {dispute.description ||
                          translate("jobs.disputeDescriptionPlaceholder")}
                      </Text>
                    </View>

                    <View style={[styles.sectionRow, { marginTop: 20 }]}>
                      <Image
                        source={reportIcon}
                        style={styles.infoIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.sectionLabel}>
                        {translate("jobs.disputeRaisedBy")}
                      </Text>
                    </View>
                    <View style={styles.descriptionBox}>
                      <Text style={styles.descriptionText}>
                        {dispute.dispute_raised_by
                          ? dispute.dispute_raised_by.charAt(0).toUpperCase() +
                            dispute.dispute_raised_by.slice(1)
                          : translate("jobs.notAvailable")}
                      </Text>
                    </View>

                    <View style={[styles.sectionRow, { marginTop: 20 }]}>
                      <Image
                        source={evidenceIcon}
                        style={styles.infoIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.sectionLabel}>
                        {translate("jobs.evidence")}
                      </Text>
                    </View>
                    {dispute.evidenceUrls && dispute.evidenceUrls.length > 0 ? (
                      <View style={styles.evidenceImagesContainer}>
                        {dispute.evidenceUrls.map((evidenceUrl, idx) => (
                          <View
                            key={`evidence-${dispute.id}-${idx}`}
                            style={styles.evidenceImageWrapper}
                          >
                            <Image
                              source={{ uri: evidenceUrl }}
                              style={styles.evidenceImage}
                              resizeMode="cover"
                            />
                          </View>
                        ))}
                      </View>
                    ) : (
                      <View style={styles.descriptionBox}>
                        <Text style={styles.descriptionText}>
                          {translate("jobs.notAvailable")}
                        </Text>
                      </View>
                    )}
                  </>
                )}

                {isMultipleDisputes && renderWorkerLabel(dispute.workerName)}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Admin Response Card */}

      {adminResponse && (
        <View style={styles.cardContainer}>
          <View style={styles.cardShadow} />
          <View style={styles.adminCard}>
            <Text style={styles.adminResponseTitle}>
              {translate("jobs.adminResponse")}
            </Text>
            <Text style={styles.adminResponseText}>
              {adminResponse || translate("jobs.adminResponsePlaceholder")}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#E8FFF7",
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 120,
  },
  // Card styles
  topCard: {
    backgroundColor: "#12AA732E",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardContainer: {
    marginBottom: 24,
    position: "relative",
  },
  cardShadow: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#004D40",
    borderRadius: 16,
  },
  mainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  adminCard: {
    backgroundColor: "#C9F3E6",
    borderRadius: 16,
    padding: 20,
    marginLeft: 6,
    // marginBottom: 4,
  },
  // Job Header with Disputed Badge
  jobHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  jobTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: "#12AA73",
    flex: 1,
  },
  disputedBadge: {
    backgroundColor: "#FFCDD2",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  disputedBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: "#C62828",
  },
  // Info Row styles
  infoIcon2: {
    width: 14,
    height: 14,
    marginRight: 6,
  },
  infoIcon: {
    width: 24,
    height: 24,
    marginRight: 6,
  },
  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 10,
    gap: 4,
  },
  infoLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: "#434545",
  },
  infoValue: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: "#7C7C7C",
    flexShrink: 1,
  },
  infoValueGreen: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: "#12AA73",
    flexShrink: 1,
  },
  // Status Badge
  statusBadge: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF9C4",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 12,
    alignSelf: "center",
    gap: 4,
  },
  statusLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: "#827717",
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  statusText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: "#827717",
  },
  // Button Styles
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  markCompletedButton: {
    flex: 1,
    backgroundColor: colors.tertiary,
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  markCompletedButtonText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: "#FFFFFF",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  // Disputes Count Badge
  disputesCountBadge: {
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 12,
    alignSelf: "center",
    borderLeftWidth: 4,
    borderLeftColor: colors.tertiary,
  },
  disputesCountText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: "#0277BD",
  },
  // Section Row with emoji icon
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: "#434545",
  },
  // Worker Label Container (for multiple disputes)
  workerLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F7F4",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.tertiary,
  },
  workerLabelIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    tintColor: colors.tertiary,
  },
  workerLabelText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: "#7C7C7C",
  },
  workerNameHighlight: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.tertiary,
  },
  // Worker Input Group
  workerInputGroup: {
    marginBottom: 16,
  },
  // Small Worker Label (below field, right-aligned)
  workerLabelSmall: {
    alignSelf: "flex-end",
    marginTop: 6,
  },
  workerLabelSmallText: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: "#A0A0A0",
  },
  workerNameSmall: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    color: colors.tertiary,
  },
  // Dispute Title Value
  disputeTitleValue: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: "#434545",
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  // Slot Card Styles
  slotCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  slotHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 6,
  },
  slotHeaderIcon: {
    width: 16,
    height: 16,
    tintColor: "#166534",
  },
  slotHeaderTitle: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: "#166534",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  slotGrid: {
    gap: 10,
  },
  slotRow: {
    flexDirection: "row",
    gap: 10,
  },
  slotItem: {
    flex: 1,
  },
  slotLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: "#666666",
    marginBottom: 2,
  },
  slotValue: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: "#333333",
  },
  // Description Box
  descriptionBox: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
  },
  descriptionText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: "#7C7C7C",
    lineHeight: 20,
  },
  // Evidence Container
  evidenceImagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  evidenceImageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
  },
  evidenceImage: {
    width: "100%",
    height: "100%",
  },
  // Admin Response Card
  adminResponseTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: "#000000",
    textAlign: "center",
    marginBottom: 12,
  },
  adminResponseText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: "#00695C",
    lineHeight: 22,
    textAlign: "center",
  },
  // Toggle Button Styles
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.tertiary,
    gap: 8,
  },
  toggleButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.tertiary,
  },
  jobDetailsContainer: {
    marginBottom: 8,
  },
  // Detail Card Styles (similar to ActiveJobDetailView)
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  jobTitleDetail: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.tertiary,
    marginBottom: 8,
  },
  jobDescDetail: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: "#7C7C7C",
    lineHeight: 20,
    marginBottom: 12,
  },
  locationRowDetail: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  locationIconDetail: {
    width: 14,
    height: 14,
    marginRight: 4,
    marginTop: 2,
  },
  locationLabelDetail: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: "#434545",
  },
  locationValueDetail: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: "#7C7C7C",
    flex: 1,
  },
  sectionTitleDetail: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: "#434545",
    marginBottom: 16,
  },
  infoGridDetail: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  infoRowDetail: {
    width: "48%",
    minWidth: 140,
    flexGrow: 1,
    marginBottom: 14,
    paddingRight: 4,
  },
  infoLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  infoIconDetail: {
    width: 14,
    height: 14,
    marginRight: 6,
  },
  infoLabelDetail: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: "#434545",
    flex: 1,
  },
  infoValueDetail: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: "#7C7C7C",
    marginLeft: 20,
  },
  datePostedRowDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  datePostedIconDetail: {
    width: 14,
    height: 14,
    marginRight: 6,
  },
  datePostedLabelDetail: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: "#434545",
  },
  datePostedValueDetail: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.tertiary,
  },
  dividerDetail: {
    marginVertical: 8,
  },
  subSectionTitleDetail: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: "#434545",
    marginBottom: 10,
    marginTop: 4,
  },
  chipsRowDetail: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  chipIcon: {
    width: 12,
    height: 12,
    marginRight: 6,
    tintColor: colors.tertiary,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.tertiary,
  },
  noDataTextDetail: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: "#7C7C7C",
    fontStyle: "italic",
  },
});
