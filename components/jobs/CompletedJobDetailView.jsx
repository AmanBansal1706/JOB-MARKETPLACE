import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { colors, fonts } from "../../theme";
import { useTranslation } from "../../hooks/useTranslation";
import { formatReviewDate } from "../../utils/dateFormatting";
import CompletedAssignedWorkersCard from "./CompletedAssignedWorkersCard";
import TimeScheduleCard from "./TimeScheduleCard";
import CostBreakdownCard from "./CostBreakdownCard";

// Import PNG icons
const positionIcon = require("../../assets/images/position.png");
const shiftTimeIcon = require("../../assets/images/timer.png");
const payRateIcon = require("../../assets/images/payrate.png");
const breaksTimeIcon = require("../../assets/images/break.png");
const totalWorkersIcon = require("../../assets/images/worker.png");
const totalCostIcon = require("../../assets/images/cost.png");
const paymentModeIcon = require("../../assets/images/paymentmode.png");
const locationIcon = require("../../assets/images/location.png");
const calendarIcon = require("../../assets/images/calender.png");
const scoreIcon = require("../../assets/images/score.png");

/**
 * CompletedJobDetailView - Component for displaying completed job details
 * Matches the Figma design exactly for completed job status
 *
 * @param {object} details - Job details object
 * @param {boolean} refreshing - Refresh control state
 * @param {function} onRefresh - Refresh callback
 * @param {function} onDownloadAgreement - Download agreement callback
 * @param {function} onViewWorkerProfile - View worker profile callback
 */
export default function CompletedJobDetailView({
  details,
  refreshing,
  onRefresh,
  onDownloadAgreement,
  onViewWorkerProfile,
}) {
  const navigation = useNavigation();
  const { translate } = useTranslation();

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
      type: "completed",
    });
  };
  const experienceKeyMap = {
    beginner: "experience.beginner",
    intermediate: "experience.intermediate",
    expert: "experience.expert",
  };

  return (
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

        {/* Info Grid */}
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
            left={translate("jobs.workers") + ":"}
            right={String(details.totalWorkers)}
            iconSource={totalWorkersIcon}
          />
          <InfoRow
            left={translate("jobs.totalCost") + ":"}
            right={details.totalCost}
            iconSource={totalCostIcon}
          />
          <InfoRow
            left={translate("jobs.totalShifts") + ":"}
            right={String(
              details.totalShiftsCount || details.slots?.length || 0,
            )}
            iconSource={shiftTimeIcon}
          />
          <InfoRow
            left={translate("jobs.paymentMode") + ":"}
            right={details.paymentMode}
            iconSource={paymentModeIcon}
          />
        </View>

        {/* Posted Date Badge */}
        <View style={styles.postedDateBadge}>
          <Image
            source={calendarIcon}
            style={styles.postedDateIcon}
            resizeMode="contain"
          />
          <Text style={styles.postedDateLabel}>
            {translate("jobs.postedDate")}:{" "}
          </Text>
          <Text style={styles.postedDateValue}>{details.postedDate}</Text>
        </View>

        {/* Time Schedules Section - Inside Main Card */}

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

        {/* Cost Breakdown - Inside Main Card */}
        <View style={styles.divider} />
        <View style={styles.divider} />
        <CostBreakdownCard
          details={details}
          variant="flat"
          cardTitle={translate("jobs.costBreakdown")}
          showTitle={false}
          totalLabel={translate("jobs.totalAmountPaid")}
        />

        {/* View All Applicants Button - Inside Main Card */}
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

      {/* Assigned Workers Card */}
      <CompletedAssignedWorkersCard
        workers={details.assignedWorkers}
        onDownloadAgreement={onDownloadAgreement}
      />

      {/* Reviews Card */}
      {details.reviews && details.reviews.length > 0 && (
        <View style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.tertiary }]}>
            {translate("jobs.reviews") || "Reviews"}
          </Text>
          <View style={styles.reviewsListContainer}>
            {details.reviews.map((review, index) => (
              <View key={review.id || index} style={styles.reviewContainer}>
                {index > 0 && <View style={styles.reviewDivider} />}
                <View style={styles.reviewFooter}>
                  {review.worker_profile_picture ? (
                    <Image
                      source={{ uri: review.worker_profile_picture }}
                      style={styles.reviewerAvatarSmall}
                    />
                  ) : (
                    <View style={styles.reviewerAvatarSmall}>
                      <Text style={styles.reviewerInitialSmall}>
                        {(review.worker_name || "N").charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.reviewerName}>
                    {review.worker_name || "N/A"}
                  </Text>
                  <Text style={styles.reviewDot}>•</Text>
                  <Text style={styles.reviewTime}>
                    {review.created_at
                      ? formatReviewDate(review.created_at)
                      : "N/A"}
                  </Text>
                </View>
                <View style={styles.reviewRatingRow}>
                  <View style={{ flexDirection: "row", marginRight: 5 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <FontAwesome
                        key={s}
                        name="star"
                        size={13}
                        color={
                          s <= Math.floor(review.rating || 0)
                            ? "#FFD700"
                            : "#E0E0E0"
                        }
                        style={{ marginRight: 2 }}
                      />
                    ))}
                  </View>
                  <Text style={styles.reviewRatingText}>
                    {review.rating || 0}
                  </Text>
                </View>
                <Text style={styles.reviewComment}>
                  {review.review || "N/A"}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Skills & Responsibilities Card */}
      <View style={styles.card}>
        {/* <Text style={styles.subSectionTitle}>
          {translate("jobs.selectedSkills")}
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
          {translate("common.position")}
        </Text>
        <View style={styles.chipsRow}>
          <Chip label={details.position} variant="position" />
        </View>

        {/* Experience Level Chip */}
        <Text style={styles.subSectionTitle}>
          {translate("jobs.experienceLevelRequired")}
        </Text>
        <View style={styles.chipsRow}>
          <Chip
            label={translate(experienceKeyMap[details.experienceLevel])}
            variant="position"
          />
        </View>

        <Text style={styles.subSectionTitle}>
          {translate("jobs.selectedResponsibilities")}
        </Text>
        <View style={styles.chipsRow}>
          {details.responsibilities && details.responsibilities.length > 0 ? (
            details.responsibilities.map((resp, idx) => (
              <Chip key={`resp-${idx}`} label={resp} variant="responsibility" />
            ))
          ) : (
            <Text style={styles.noDataText}>
              {translate("jobs.noResponsibilitiesSpecified")}
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
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

  // Posted Date Badge
  postedDateBadge: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    backgroundColor: "#FEF4C3",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: "center",
    marginTop: 8,
    borderColor: "#E3A63D",
    borderWidth: 1,
  },
  postedDateIcon: {
    width: 14,
    height: 14,
    marginRight: 6,
  },
  postedDateLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: "#434545",
  },
  postedDateValue: {
    fontFamily: fonts.medium,
    fontSize: 12,
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

  // Divider
  divider: {
    marginVertical: 8,
  },

  // View Applicants Button
  viewApplicantsBtn: {
    backgroundColor: colors.tertiary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  viewApplicantsText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.text,
  },

  // Worker Profile
  workerProfileRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  workerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    overflow: "hidden",
  },
  workerAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  workerAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.bbg6,
    alignItems: "center",
    justifyContent: "center",
  },
  workerAvatarText: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.tertiary,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textdark,
    marginBottom: 4,
  },
  workerRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  starRow: {
    flexDirection: "row",
    marginRight: 6,
  },
  workerRatingText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.tertiary,
  },
  workerReviewCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.text1,
  },
  workerPosition: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.text1,
  },
  workerBio: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.text1,
    lineHeight: 20,
    marginBottom: 16,
  },

  // Reviews Section
  reviewsListContainer: {},
  reviewContainer: {
    marginTop: 15,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 15,
  },
  reviewRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  reviewRatingText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: "#FFD700",
    marginLeft: 4,
  },
  reviewComment: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.text1,
    lineHeight: 18,
    marginBottom: 12,
  },
  reviewFooter: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    paddingBottom: 5,
  },
  reviewerAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.tertiary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  reviewerInitialSmall: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#FFFFFF",
  },
  reviewerName: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
    marginRight: 5,
  },
  reviewDot: {
    fontSize: 12,
    color: colors.text1,
    marginHorizontal: 5,
  },
  reviewTime: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.text1,
  },

  // Download Agreement Button
  downloadAgreementBtn: {
    backgroundColor: colors.tertiary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  downloadAgreementText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.text,
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
});
