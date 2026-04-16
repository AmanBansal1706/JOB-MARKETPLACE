import {
  Feather,
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../../theme/worker/colors";
import { openMapsApp } from "../../../utils/mapUtils";
import JobTimeScheduleTable from "../../../components/jobs/JobTimeScheduleTable";
import JobDetailRow from "../../../components/jobs/JobDetailRow";

// Icons
import locationIcon from "../../../assets/worker-images/location.png";
import paymentRate from "../../../assets/worker-images/payment-rate.png";
import jobPositionIcon from "../../../assets/worker-images/position (2).png";
import distanceIcon from "../../../assets/worker-images/distance.png";
import { useTranslation } from "../../../hooks/useTranslation";

const DisputedJobDetailsScreen = ({ jobData, onRefresh, isRefreshing }) => {
  const navigation = useNavigation();
  const { translate } = useTranslation();
  const [showJobDetails, setShowJobDetails] = useState(false);

  // Use transformed dispute info from jobData
  const info = jobData?.dispute_info;

  const disputeInfo = {
    title: jobData?.job_title || jobData?.position || "N/A",
    raisedDate:
      info?.raised_date && jobData?.formatDate
        ? jobData.formatDate(info.raised_date)
        : info?.raised_date || "N/A",
    status: info?.status || "pending",
    disputeRaisedBy: info?.dispute_raised_by || "N/A",
    disputeTitle: info?.title || "Dispute",
    description: info?.description || "No description provided.",
    reason: info?.reason || "N/A",
    adminResponse:
      info?.admin_response && info?.admin_response !== ""
        ? info.admin_response
        : "We are currently in the process of reviewing the evidence that has been submitted. You have been formally notified of the situation and have been given a 48-hour window to provide a response. We will take any response received into consideration as part of our ongoing review.",
    evidenceUrls: info?.evidence_urls || [],
  };

  // Format status for display (e.g., "in_review" -> "In Review")
  const formattedStatus = (disputeInfo.status || "pending")
    .toString()
    .replace(/_/g, " ")
    .split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ");

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
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {translate("workerJobs.disputeDetails")}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing || false}
            onRefresh={onRefresh}
            colors={[colors.primary.pink]}
            tintColor={colors.primary.pink}
          />
        }
      >
        <View style={styles.summaryCard}>
          <View style={styles.titleRow}>
            <Text
              style={styles.jobTitle}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {disputeInfo.title}
            </Text>
            <View style={styles.disputedBadge}>
              <Text style={styles.disputedText}>
                {translate("workerHome.disputed")}
              </Text>
            </View>
          </View>

          <View style={styles.dateRow}>
            <FontAwesome5
              name="calendar-alt"
              size={16}
              color={colors.primary.pink}
            />
            <Text style={styles.dateLabel}>
              {translate("workerJobs.disputeRaised")}
            </Text>
            <Text style={styles.dateValue}>{disputeInfo.raisedDate}</Text>
          </View>

          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>
              {translate("workerJobs.status")}{" "}
              <Text
                style={{ fontFamily: "Poppins_700Bold", fontWeight: "700" }}
              >
                {formattedStatus}
              </Text>
            </Text>
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
              ? translate("workerJobs.hideJobDetails")
              : translate("workerJobs.viewJobDetails")}
          </Text>
          <MaterialCommunityIcons
            name={showJobDetails ? "chevron-up" : "chevron-down"}
            size={24}
            color={colors.primary.pink}
          />
        </TouchableOpacity>

        {/* Job Details Section (Conditional) */}
        {showJobDetails && (
          <View style={styles.jobDetailsContainer}>
            {/* Main Job Info Card */}
            <View style={styles.jobDetailsCard}>
              <View style={styles.jobCardHeader}>
                <Text style={styles.jobCardTitle}>
                  {jobData?.job_title || "N/A"}
                </Text>
              </View>

              {/* Business Info Row */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.businessRowDetail}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={{
                      uri:
                        jobData?.business_profile_picture ||
                        "https://picsum.photos/60/60?random=1",
                    }}
                    style={styles.businessProfilePictureDetail}
                  />
                  <Text style={styles.businessNameDetail}>
                    {jobData?.business_name || "N/A"}
                  </Text>
                </View>
                <Text style={styles.pipeDetail}>|</Text>
                <View style={styles.ratingRowDetail}>
                  <View style={{ flexDirection: "row", marginRight: 5 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <FontAwesome
                        key={s}
                        name="star"
                        size={13}
                        color={
                          s <= Math.floor(jobData?.business_avg_ratings || 0)
                            ? "#FFD700"
                            : "#E0E0E0"
                        }
                        style={{ marginRight: 2 }}
                      />
                    ))}
                  </View>
                  <Text style={styles.ratingTextDetail}>
                    {jobData?.business_avg_ratings || 0}
                  </Text>
                </View>
              </TouchableOpacity>

              <Text style={styles.descriptionDetail}>
                {jobData?.description || "N/A"}
              </Text>

              <View style={styles.dividerDetail} />

              {/* Detailed Information List */}
              <View style={styles.detailsListDetail}>
                <JobDetailRow
                  icon={jobPositionIcon}
                  label={translate("workerJobs.positionLabel")}
                  value={jobData?.position || "N/A"}
                  isImage
                  badge={jobData?.experience_level}
                />
                <JobDetailRow
                  icon={locationIcon}
                  label={translate("workerJobs.locationLabel")}
                  value={jobData?.location_address || "N/A"}
                  isImage
                  isClickable
                  onPress={() =>
                    openMapsApp(
                      jobData?.location_details || {
                        address: jobData?.location_address,
                      },
                    )
                  }
                />
                <JobDetailRow
                  icon={paymentRate}
                  label={translate("workerJobs.payRateLabel")}
                  value={jobData?.pay_rate ? `$${jobData?.pay_rate}/hr` : "N/A"}
                  isImage
                  secondLabel={translate("workerJobs.paymentMode")}
                  secondValue={jobData?.payment_method_text || "N/A"}
                />
                <JobDetailRow
                  icon={distanceIcon}
                  label={translate("workerJobs.distanceLabel")}
                  value={
                    jobData?.distance_km ? `${jobData?.distance_km}km` : "N/A"
                  }
                  isImage
                />
              </View>

              {/* Disputed Shifts Section - ABOVE Time Schedules */}
              {((info?.slots && info.slots.length > 0) || info?.slot || (jobData?.slots && jobData.slots.length > 0)) && (
                <View style={{ marginBottom: 20 }}>
                  <View style={styles.labelRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={colors.primary.pink}
                      style={{ marginRight: 10 }}
                    />
                    <Text style={[styles.label, { color: colors.primary.pink }]}>
                      {translate("workerJobs.disputedShifts")}
                    </Text>
                  </View>
                  <View style={{ marginTop: 10 }}>
                    {(() => {
                      // Priority 1: slots array in info
                      if (info?.slots && info.slots.length > 0) return info.slots;
                      // Priority 2: single slot object in info
                      if (info?.slot) return [info.slot];
                      // Priority 3: assigned slots from top-level jobData
                      if (jobData?.slots && jobData.slots.length > 0) {
                        return jobData.slots.filter(s => s.is_applied_for_proposal);
                      }
                      return [];
                    })()
                      .filter(Boolean)
                      .map((slot, idx) => (
                        <View key={idx} style={styles.slotCardDetail}>
                          <View style={styles.slotHeaderRow}>
                            <Text style={styles.slotHeaderText}>
                              {translate("workerJobs.slotDetails")} {idx + 1}
                            </Text>
                          </View>
                          <View style={styles.slotDetailGrid}>
                            <View style={styles.slotDetailRow}>
                              <View style={styles.slotDetailItem}>
                                <Text style={styles.slotDetailLabel}>
                                  {translate("workerHome.startDate")}
                                </Text>
                                <Text style={styles.slotDetailValue}>
                                  {slot.startDate || slot.start_date || "N/A"}
                                </Text>
                              </View>
                              <View style={styles.slotDetailItem}>
                                <Text style={styles.slotDetailLabel}>
                                  {translate("workerHome.endDate")}
                                </Text>
                                <Text style={styles.slotDetailValue}>
                                  {slot.endDate || slot.end_date || "N/A"}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.slotDetailRow}>
                              <View style={styles.slotDetailItem}>
                                <Text style={styles.slotDetailLabel}>
                                  {translate("workerHome.joiningTime")} /{" "}
                                  {translate("workerJobs.finishTime")}
                                </Text>
                                <Text style={styles.slotDetailValue}>
                                  {slot.joiningTime || slot.joining_time || "N/A"} -{" "}
                                  {slot.endTime || slot.finish_time || slot.end_time || "N/A"}
                                </Text>
                              </View>
                              <View style={styles.slotDetailItem}>
                                <Text style={styles.slotDetailLabel}>
                                  {translate("workerHome.breakTime")}
                                </Text>
                                <Text style={styles.slotDetailValue}>
                                  {slot.breakTime || slot.break_time || "0"} 
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      ))}
                  </View>
                </View>
              )}

              {/* Time Schedule Table */}
              <JobTimeScheduleTable slots={jobData?.slots} />
            </View>
          </View>
        )}
        {/* Top Summary Card */}

        {/* Dispute Details Card */}

        {disputeInfo?.disputeRaisedBy === "worker" && (
          <View style={styles.cardWrapper}>
            <View style={styles.cardContainer}>
              {/* Dispute Title */}
              <View style={styles.detailItem}>
                <View style={styles.labelRow}>
                  <Image
                    source={require("../../../assets/worker-images/medal.png")}
                    style={styles.labelIcon}
                  />
                  <Text style={styles.label}>
                    {translate("workerJobs.disputeTitle")}
                  </Text>
                </View>
                <Text style={styles.redValue}>{disputeInfo.disputeTitle}</Text>
              </View>

              {/* Dispute Description */}
              <View style={styles.detailItem}>
                <View style={styles.labelRow}>
                  <Image
                    source={require("../../../assets/worker-images/reporting(1).png")}
                    style={styles.labelIcon}
                  />
                  <Text style={styles.label}>
                    {translate("workerJobs.disputeDescription")}
                  </Text>
                </View>
                <View style={styles.descriptionBox}>
                  <Text style={styles.descriptionText}>
                    {disputeInfo.description}
                  </Text>
                </View>
              </View>

              {/* Dispute Raised By */}
              <View style={styles.detailItem}>
                <View style={styles.labelRow}>
                  <Image
                    source={require("../../../assets/worker-images/reporting(1).png")}
                    style={styles.labelIcon}
                  />
                  <Text style={styles.label}>
                    {translate("workerJobs.disputeRaisedBy")}
                  </Text>
                </View>
                <View style={styles.descriptionBox}>
                  <Text style={styles.descriptionText}>
                    {disputeInfo.disputeRaisedBy
                      ? disputeInfo.disputeRaisedBy.charAt(0).toUpperCase() +
                      disputeInfo.disputeRaisedBy.slice(1)
                      : "N/A"}
                  </Text>
                </View>
              </View>

              {/* Reason */}
              <View style={styles.detailItem}>
                <View style={styles.labelRow}>
                  <Image
                    source={require("../../../assets/worker-images/reasoning.png")}
                    style={styles.labelIcon}
                  />
                  <Text style={styles.label}>
                    {translate("workerJobs.reason")}
                  </Text>
                </View>
                <View style={styles.dropdownDisplay}>
                  <Text style={styles.dropdownValue}>{disputeInfo.reason}</Text>
                  <Feather
                    name="chevron-down"
                    size={20}
                    color={colors.text.secondary}
                  />
                </View>
              </View>

              {/* Evidence */}
              <View style={styles.detailItem}>
                <View style={styles.labelRow}>
                  <Image
                    source={require("../../../assets/worker-images/drugs.png")}
                    style={styles.labelIcon}
                  />
                  <Text style={styles.label}>
                    {translate("workerJobs.evidence")}
                  </Text>
                </View>
                {disputeInfo.evidenceUrls &&
                  disputeInfo.evidenceUrls.length > 0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginLeft: 34 }}
                  >
                    {disputeInfo.evidenceUrls.map((url, index) => (
                      <View key={index} style={styles.evidenceImageContainer}>
                        <Image
                          source={{ uri: url }}
                          style={styles.evidenceImage}
                          resizeMode="cover"
                        />
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.noneDisplay}>
                    <FontAwesome5
                      name="file-alt"
                      size={18}
                      color={colors.text.secondary}
                      style={styles.noneIcon}
                    />
                    <View style={styles.noneTextWrap}>
                      <Text style={styles.noneLabel}>
                        {translate("workerJobs.evidence")}
                      </Text>
                      <Text style={styles.noneText}>
                        {translate("workerJobs.none")}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Admin Response Card */}
        {disputeInfo?.adminResponse && (
          <View style={styles.cardWrapper}>
            <View style={styles.cardContainer}>
              <Text style={styles.adminTitle}>
                {translate("workerJobs.adminResponse")}
              </Text>
              <Text style={styles.adminText}>{disputeInfo.adminResponse}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default DisputedJobDetailsScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.auth.background,
  },
  headerSafeArea: {
    backgroundColor: colors.primary.pink,
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
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
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: colors.ui.bannerBackground, // #FFD1DB
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  jobTitle: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: colors.primary.pink,
    flex: 1,
    minWidth: 0,
  },
  disputedBadge: {
    backgroundColor: "#FF8787", // colors.primary.coral
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: "flex-start",
    marginLeft: 10,
    marginTop: 6,
  },
  disputedText: {
    color: colors.primary.darkRed,
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary.darkRed,
    marginLeft: 10,
  },
  dateValue: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: colors.primary.pink,
  },
  statusPill: {
    backgroundColor: colors.ui.postedDateBackground, // #FFF9C4
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  statusPillText: {
    color: "#E59838", // colors.ui.selectedRatingText
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
  },
  cardWrapper: {
    backgroundColor: colors.primary.darkRed,
    borderRadius: 25,
    paddingLeft: 10,
    marginBottom: 20,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContainer: {
    backgroundColor: colors.white,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    padding: 20,
  },
  detailItem: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  labelIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  label: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: colors.black,
  },
  redValue: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary.pink,
    marginLeft: 34,
  },
  descriptionBox: {
    backgroundColor: colors.ui.inputPinkBackground,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.ui.inputBorder,
    marginLeft: 34,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    lineHeight: 20,
  },
  dropdownDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.ui.inputPinkBackground,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: colors.ui.inputBorder,
    marginLeft: 34,
  },
  dropdownValue: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
  },
  uploadDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.ui.inputPinkBackground,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: colors.ui.inputBorder,
    marginLeft: 34,
  },
  uploadPlaceholder: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
  },
  evidenceImageContainer: {
    backgroundColor: colors.ui.inputPinkBackground,
    borderRadius: 12,
    marginTop: 10,
    marginRight: 15,
    width: 280,
    height: 180,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.ui.inputBorder,
  },
  evidenceImage: {
    width: "100%",
    height: "100%",
  },
  adminTitle: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: colors.black,
    textAlign: "center",
    marginBottom: 15,
  },
  adminText: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: colors.primary.pink,
    textAlign: "center",
    lineHeight: 20,
  },
  toggleButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: colors.primary.pink,
  },
  toggleButtonText: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary.pink,
  },
  jobDetailsContainer: {
    marginBottom: 40,
  },
  jobDetailsCard: {
    backgroundColor: colors.white,
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  jobCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  jobCardTitle: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: colors.primary.pink,
    flex: 1,
  },
  businessRowDetail: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 12,
  },
  businessProfilePictureDetail: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 8,
  },
  businessNameDetail: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: colors.auth.darkRed,
  },
  pipeDetail: {
    fontSize: 14,
    color: colors.text.secondary,
    marginHorizontal: 8,
    fontFamily: "Poppins_400Regular",
  },
  ratingRowDetail: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingTextDetail: {
    marginLeft: 5,
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: "#FFD700",
  },
  descriptionDetail: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: 15,
  },
  dividerDetail: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 15,
  },
  detailsListDetail: {
    gap: 15,
    marginBottom: 15,
  },
  noneDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.inputPinkBackground,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 56,
    borderWidth: 1,
    borderColor: colors.ui.inputBorder,
    marginLeft: 34,
  },
  noneIcon: {
    marginRight: 12,
  },
  noneTextWrap: {
    flexDirection: "column",
  },
  noneLabel: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary.darkRed,
  },
  noneText: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: colors.text.secondary,
  },
  slotCardDetail: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  slotHeaderRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
    paddingBottom: 6,
    marginBottom: 8,
  },
  slotHeaderText: {
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
    color: colors.primary.darkRed,
  },
  slotDetailGrid: {
    gap: 8,
  },
  slotDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  slotDetailItem: {
    flex: 1,
  },
  slotDetailLabel: {
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    color: "#7C7C7C",
  },
  slotDetailValue: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: colors.text.primary,
  },
});
