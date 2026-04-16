import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { colors, fonts } from "../../theme";
import { useTranslation } from "../../hooks/useTranslation";
import { useEffect, useState } from "react";
import TimeScheduleCard from "./TimeScheduleCard";
import CostBreakdownCard from "./CostBreakdownCard";
import ActiveAssignedWorkersCard from "./ActiveAssignedWorkersCard";
import CustomAlert from "../CustomAlert";
import { setCashPaymentPopupTime } from "../../store/Auth";
import { parseDate } from "../../utils/dateFormatting";

// Import PNG icons
const positionIcon = require("../../assets/images/position.png");
const shiftTimeIcon = require("../../assets/images/timer.png");
const payRateIcon = require("../../assets/images/payrate.png");
const breaksTimeIcon = require("../../assets/images/break.png");
const totalWorkersIcon = require("../../assets/images/worker.png");
const totalCostIcon = require("../../assets/images/cost.png");
const paymentModeIcon = require("../../assets/images/paymentmode.png");
const assignedWorkersIcon = require("../../assets/images/worker.png");
const locationIcon = require("../../assets/images/location.png");
const calendarIcon = require("../../assets/images/calender.png");
const scoreIcon = require("../../assets/images/score.png");

/**
 * ActiveJobDetailView - Component for displaying active job details
 * Matches the Figma design exactly for active job status
 *
 * @param {object} details - Job details object
 * @param {boolean} hasAssigned - Whether workers are assigned
 * @param {boolean} refreshing - Refresh control state
 * @param {function} onRefresh - Refresh callback
 * @param {function} onEditJob - Edit job callback
 * @param {function} onDeleteJob - Delete job callback
 * @param {function} onMarkAsCompleted - Mark as completed callback
 * @param {function} onViewAnalytics - View analytics callback
 * @param {function} onRaiseDispute - Raise dispute callback
 * @param {boolean} isDeleting - Delete loading state
 * @param {boolean} isCompleting - Complete loading state
 * @param {object} jobData - Raw job data for editing
 */
export default function ActiveJobDetailView({
  details,
  hasAssigned,
  refreshing,
  onRefresh,
  onEditJob,
  onDeleteJob,
  onMarkAsCompleted,
  onViewAnalytics,
  onRaiseDispute,
  isDeleting,
  isCompleting,
}) {
  const navigation = useNavigation();
  const { translate } = useTranslation();
  const dispatch = useDispatch();
  const lastCashPaymentPopupTimes = useSelector(
    (state) => state.Auth.lastCashPaymentPopupTimes,
  );
  const [showCashAlert, setShowCashAlert] = useState(false);
  const [showDisputeConfirm, setShowDisputeConfirm] = useState(false);

  // Check if cash alert should be shown
  useEffect(() => {
    // Early return if details is not available
    if (!details || typeof details !== "object") {
      setShowCashAlert(false);
      return;
    }

    // Check payment mode
    if (!details.paymentMode || details.paymentMode.toLowerCase() !== "cash") {
      setShowCashAlert(false);
      return;
    }

    // For cash payment jobs, check if job end time has passed
    let endDateTime = null;

    if (
      details.scheduledType === "same" ||
      details.scheduledType === "different"
    ) {
      // For both same and different schedules, use rawEndDate and rawEndTime from details
      if (details.rawEndDate && details.rawEndTime) {
        try {
          const endDate = parseDate(details.rawEndDate);
          // Validate that the date is valid
          if (isNaN(endDate.getTime())) {
            setShowCashAlert(false);
            return;
          }
          const timeParts = details.rawEndTime.split(":");
          if (timeParts.length >= 2) {
            const hours = parseInt(timeParts[0], 10);
            const minutes = parseInt(timeParts[1], 10);
            if (!isNaN(hours) && !isNaN(minutes)) {
              endDate.setHours(hours, minutes, 0);
              endDateTime = endDate;
            }
          }
        } catch (error) {
          console.warn("Error parsing end date/time:", error);
          setShowCashAlert(false);
          return;
        }
      }
    }

    // Check if current time exceeds end date time
    if (endDateTime && new Date() > endDateTime) {
      const currentTime = new Date().getTime();
      const lastPopupTimeForJob =
        lastCashPaymentPopupTimes && details.id
          ? lastCashPaymentPopupTimes[details.id]
          : undefined;
      const timeSinceLastPopup = lastPopupTimeForJob
        ? currentTime - lastPopupTimeForJob
        : null;

      // 24 hours in milliseconds = 24 * 60 * 60 * 1000 = 86400000
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

      // Show popup if:
      // 1. It was never shown before for this job (lastPopupTimeForJob is undefined)
      // 2. OR more than 24 hours have passed since the last time it was shown for this job
      if (!lastPopupTimeForJob || timeSinceLastPopup >= TWENTY_FOUR_HOURS) {
        setShowCashAlert(true);
        // Update Redux with current timestamp for this specific job
        if (details.id) {
          dispatch(
            setCashPaymentPopupTime({
              jobId: details.id,
              timestamp: currentTime,
            }),
          );
        }
      } else {
        setShowCashAlert(false);
      }
    } else {
      setShowCashAlert(false);
    }
  }, [details, lastCashPaymentPopupTimes, dispatch]);

  // Helper component for info rows with icons
  const InfoRow = ({ left, right, iconSource }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLabelRow}>
        {iconSource && (
          <Image
            source={iconSource}
            style={styles.infoIcon}
            resizeMode="contain"
          />
        )}
        <Text style={styles.infoLabel}>{left}</Text>
      </View>
      <Text style={styles.infoValue}>{right}</Text>
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

  const handleViewApplicants = () => {
    navigation.navigate("ActiveApplicants", {
      jobId: details.id,
      type: "active",
    });
  };

  const experienceKeyMap = {
    beginner: "experience.beginner",
    intermediate: "experience.intermediate",
    expert: "experience.expert",
  };

  const handleViewWorkerProfile = (workerId) => {
    navigation.navigate("ApplicantProfile", {
      workerId: workerId,
      jobId: details.id,
    });
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        alwaysBounceVertical={false}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        directionalLockEnabled={true}
        decelerationRate="normal"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tertiary}
            colors={[colors.tertiary]}
          />
        }
      >
        {/* Main Job Card */}
        {!hasAssigned && (
          <View style={styles.card}>
            {/* Job Title & Description */}
            <Text style={styles.jobTitle}>{details.title}</Text>
            <Text style={styles.jobDesc}>{details.description}</Text>

            {/* Location Row */}
            <View style={styles.locationRow}>
              <Image
                source={locationIcon}
                style={styles.locationIcon}
                resizeMode="contain"
              />
              <Text style={styles.locationLabel}>
                {translate("common.location")}:{" "}
              </Text>
              <Text style={styles.locationValue}>
                {details.location?.address ||
                  translate("jobs.locationNotSpecified")}
              </Text>
            </View>

            {/* Status Badge - Only show when no workers assigned */}
            {!hasAssigned && (
              <View style={styles.statusBadge}>
                <Text style={styles.statusLabel}>
                  {translate("common.status")}:{" "}
                </Text>
                <Text style={styles.statusValue}>
                  {translate("jobs.openNoWorkersAssigned")}
                </Text>
              </View>
            )}

            {/* View All Applicants Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.viewApplicantsBtn}
              onPress={handleViewApplicants}
            >
              <Text style={styles.viewApplicantsText}>
                {translate("jobs.viewAllApplicants", {
                  count: details.applicantsCount || 0,
                })}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Job Information Card */}
        <View style={styles.card}>
          {hasAssigned ? (
            <>
              <Text style={styles.jobTitle}>{details.title}</Text>
              <Text style={styles.jobDesc}>{details.description}</Text>

              {/* Location Row */}
              <View style={styles.locationRow}>
                <Image
                  source={locationIcon}
                  style={styles.locationIcon}
                  resizeMode="contain"
                />
                <Text style={styles.locationLabel}>
                  {translate("common.location")}:{" "}
                </Text>
                <Text style={styles.locationValue}>
                  {details.location?.address ||
                    translate("jobs.locationNotSpecified")}
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.sectionTitle}>
              {translate("jobs.jobInformation")}
            </Text>
          )}

          <View style={styles.infoGrid}>
            <InfoRow
              left={translate("common.position") + ":"}
              right={details.position}
              iconSource={positionIcon}
            />
            <InfoRow
              left={translate("jobs.totalHours") + ":"}
              right={details.shiftTime}
              iconSource={shiftTimeIcon}
            />

            <InfoRow
              left={translate("common.payRate") + ":"}
              right={details.payRate}
              iconSource={payRateIcon}
            />
            {details?.scheduledType === "same" && (
              <InfoRow
                left={translate("jobs.breaksTime") + ":"}
                right={details.breaksTime}
                iconSource={breaksTimeIcon}
              />
            )}

            <InfoRow
              left={translate("jobs.workersRequired") + ":"}
              right={String(details.totalWorkers)}
              iconSource={totalWorkersIcon}
            />
            <InfoRow
              left={translate("jobs.totalCost") + ":"}
              right={details.totalCost}
              iconSource={totalCostIcon}
            />
            <InfoRow
              left={translate("jobs.paymentMode") + ":"}
              right={details.paymentMode}
              iconSource={paymentModeIcon}
            />
            {hasAssigned && (
              <InfoRow
                left={translate("jobs.noOfWorkersAssigned") + ":"}
                right={String(details.assignedWorkers?.length || 0)}
                iconSource={assignedWorkersIcon}
              />
            )}
          </View>

          {/* Date Posted */}
          <View style={styles.datePostedRow}>
            <Image
              source={calendarIcon}
              style={styles.datePostedIcon}
              resizeMode="contain"
            />
            <Text style={styles.datePostedLabel}>
              {translate("jobs.datePosted")}:{" "}
            </Text>
            <Text style={styles.datePostedValue}>{details.postedDate}</Text>
          </View>

          {/* Time Schedules Section */}
          <View style={styles.divider} />
          <TimeScheduleCard
            scheduledType={details.scheduledType}
            assignedWorkers={details.assignedWorkers}
            showAssignedWorkers={true}
            startDate={details.startDate}
            endDate={details.endDate}
            slots={details.slots}
            variant="flat"
            cardTitle={translate("jobs.timeSchedules")}
            showTitle={details.scheduledType === "same" ? false : true}
          />

          {/* Skills Required Section */}
          <View style={styles.divider} />
          {/* <Text style={styles.subSectionTitle}>
          {translate("jobs.skillsRequired")}:
        </Text>
        <View style={styles.chipsRow}>
          {details.skills && details.skills.length > 0 ? (
            details.skills.map((skill, idx) => (
              <Chip key={`skill-${idx}`} label={skill} variant="skill" />
            ))
          ) : (
            <Text style={styles.noDataText}>
              {translate("jobs.noSkillsSpecified")}
            </Text>
          )}
        </View> */}

          {/* Position Chip */}
          <Text style={styles.subSectionTitle}>
            {translate("common.position")}:
          </Text>
          <View style={styles.chipsRow}>
            <Chip label={details.position} variant="position" />
          </View>

          {/* Experience Level Chip */}
          <Text style={styles.subSectionTitle}>
            {translate("jobs.experienceLevelRequired")}:
          </Text>
          <View style={styles.chipsRow}>
            <Chip
              label={translate(experienceKeyMap[details.experienceLevel])}
              variant="position"
            />
          </View>

          {/* Responsibilities Section */}
          <Text style={styles.subSectionTitle}>
            {translate("jobs.responsibilitiesSelected")}:
          </Text>
          <View style={styles.chipsRow}>
            {details.responsibilities && details.responsibilities.length > 0 ? (
              details.responsibilities.map((resp, idx) => (
                <Chip
                  key={`resp-${idx}`}
                  label={resp}
                  variant="responsibility"
                />
              ))
            ) : (
              <Text style={styles.noDataText}>
                {translate("jobs.noResponsibilitiesSpecified")}
              </Text>
            )}
          </View>

          {/* View All Applicants Button (inside info card when workers assigned) */}
          {hasAssigned && (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.viewApplicantsBtnAlt}
              onPress={handleViewApplicants}
            >
              <Text style={styles.viewApplicantsTextAlt}>
                {translate("jobs.viewAllApplicants", {
                  count: details.applicantsCount || 0,
                })}
              </Text>
            </TouchableOpacity>
          )}

          {/* Cost Breakdown - Only when workers assigned */}
          {hasAssigned && (
            <>
              <View style={styles.divider} />
              <View style={styles.divider} />
              <CostBreakdownCard
                details={details}
                variant="flat"
                cardTitle={translate("jobs.costBreakdown")}
                showTitle={false}
              />
            </>
          )}
        </View>

        {/* Assigned Workers Card - Only when workers are assigned */}
        {hasAssigned && details.assignedWorkers?.length > 0 && (
          <ActiveAssignedWorkersCard
            workers={details.assignedWorkers}
            onViewProfile={handleViewWorkerProfile}
          />
        )}

        {/* Shifts Operated - Only when workers assigned */}
        {/* {hasAssigned && (
        <View style={styles.shiftsOperatedRow}>
          <Text style={styles.shiftsOperatedLabel}>
            {translate("jobs.shiftsOperated")}{" "}
            <Text style={styles.shiftsOperatedOptional}>
              ({translate("common.optional")}):
            </Text>
          </Text>
          <Text style={styles.shiftsOperatedValue}>
            {details.shiftsOperated || 0} {translate("common.of")}{" "}
            {details.totalShiftsCount || details.slots?.length || 0}
          </Text>
        </View>
      )} */}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {/* Edit & Delete Row - When no workers assigned */}
          {!hasAssigned && (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.editButton}
                onPress={onEditJob}
              >
                <Text style={styles.editButtonText}>
                  {translate("common.edit")} {translate("jobs.job")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.deleteButton,
                  { marginTop: 0, flex: 1 },
                  isDeleting && styles.buttonDisabled,
                ]}
                onPress={onDeleteJob}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#D32F2F" size="small" />
                ) : (
                  <Text style={styles.deleteButtonText}>
                    {translate("common.delete")} {translate("jobs.job")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Edit & Mark Completed Row - When workers assigned */}
          {hasAssigned && (
            <>
              <View style={styles.buttonRow}>
              </View>

              {/* View Analytics Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.analyticsButton}
                onPress={onViewAnalytics}
              >
                <Text style={styles.analyticsButtonText}>
                  {translate("jobs.viewAnalytics")}
                </Text>
              </TouchableOpacity>

              {/* Raise Dispute Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.raiseDisputeButton}
                onPress={() => setShowDisputeConfirm(true)}
              >
                <Text style={styles.raiseDisputeButtonText}>
                  {translate("jobs.raiseDispute")}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      <CustomAlert
        visible={showCashAlert}
        title={translate("notifications.cashPaymentReminder")}
        titleColor={colors.tertiary}
        message={
          <Text>
            Kindly pay the worker in due time to avoid{" "}
            <Text style={{ color: "#FF0000", fontWeight: "bold" }}>
              escrow-based automatic payout with no reversal.
            </Text>
          </Text>
        }
        imageSource={require("../../assets/images/errorsign.png")}
        showImage={true}
        buttonText="OK"
        buttonBackgroundColor={colors.tertiary}
        onClose={() => setShowCashAlert(false)}
      />

      <CustomAlert
        visible={showDisputeConfirm}
        title={translate("jobs.confirmRaiseDispute")}
        titleColor={colors.tertiary}
        message={translate("jobs.raiseDisputeConfirm")}
        imageSource={require("../../assets/images/errorsign.png")}
        showImage={true}
        buttonText={translate("common.yes")}
        secondaryButtonText={translate("common.cancel")}
        buttonBackgroundColor={colors.tertiary}
        onClose={() => setShowDisputeConfirm(false)}
        onSecondaryClose={() => setShowDisputeConfirm(false)}
        onConfirm={() => {
          setShowDisputeConfirm(false);
          onRaiseDispute();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 120,
  },

  // Card Styles
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
    overflow: "visible",
  },

  // Job Title & Description
  jobTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.tertiary,
    marginBottom: 8,
  },
  jobDesc: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text1,
    lineHeight: 20,
    marginBottom: 12,
  },

  // Location
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  locationIcon: {
    width: 14,
    height: 14,
    marginRight: 4,
    marginTop: 2,
  },
  locationLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.textdark,
  },
  locationValue: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.text1,
    flex: 1,
  },

  // Status Badge
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    backgroundColor: "#FFF9C4",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  statusLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: "#827717",
  },
  statusValue: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: "#827717",
  },

  // View Applicants Button
  viewApplicantsBtn: {
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  viewApplicantsText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textdark,
  },
  viewApplicantsBtnAlt: {
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  viewApplicantsTextAlt: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textdark,
  },

  // Section Title
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textdark,
    marginBottom: 16,
  },
  subSectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textdark,
    marginBottom: 10,
    marginTop: 4,
  },

  // Info Grid
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  infoRow: {
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
  infoIcon: {
    width: 14,
    height: 14,
    marginRight: 6,
  },
  infoLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.textdark,
    flex: 1,
  },
  infoValue: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.text1,
    marginLeft: 20,
  },

  // Date Posted
  datePostedRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 8,
    marginBottom: 16,
  },
  datePostedIcon: {
    width: 14,
    height: 14,
    marginRight: 6,
  },
  datePostedLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.textdark,
  },
  datePostedValue: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.tertiary,
  },

  // Date Boxes
  dateBoxesRow: {
    flexDirection: "row",
    gap: 12,
  },
  dateBox: {
    flex: 1,
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  dateBoxLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.tertiary,
    marginBottom: 4,
  },
  dateBoxValue: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textdark,
  },

  // Divider
  divider: {
    marginVertical: 8,
  },

  // Chips
  chipsRow: {
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
  noDataText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.text1,
    fontStyle: "italic",
  },

  // Shifts Operated
  shiftsOperatedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  shiftsOperatedLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textdark,
  },
  shiftsOperatedOptional: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text1,
  },
  shiftsOperatedValue: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.tertiary,
  },

  // Action Buttons Container
  actionButtonsContainer: {
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: "column",
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  editButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textdark,
  },
  markCompletedButton: {
    flex: 1,
    backgroundColor: colors.tertiary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  markCompletedButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.text,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  analyticsButton: {
    backgroundColor: colors.tertiary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  analyticsButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.text,
  },
  raiseDisputeButton: {
    backgroundColor: colors.bbg4,
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  raiseDisputeButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.text,
  },
  deleteButton: {
    backgroundColor: "#FFEBEE",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  deleteButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: "#D32F2F",
  },
});
