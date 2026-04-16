import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors, fonts } from "../../theme";
import LoadingState from "../../components/LoadingState";
import ErrorState from "../../components/ErrorState";
import {
  useFetchBusinessDashboard,
  useFetchUserProfile,
} from "../../services/ProfileServices";
import { useEffect, useState } from "react";
import { ScreenWrapper } from "../../components/common";
import VerificationStatusCard from "../../components/VerificationStatusCard";
import { useTranslation } from "../../hooks/useTranslation";
import { formatDisplayDate } from "../../utils/dateFormatting";

// Inline Job Metrics Card Component
function JobMetricsCard({ title, totalJobs, activeJobs, iconSource }) {
  const { translate } = useTranslation();
  return (
    <View style={styles.jobMetricsCard}>
      <View style={styles.jobMetricsHeader}>
        <Image
          source={iconSource}
          style={styles.jobMetricsIcon}
          resizeMode="contain"
        />
        <Text style={styles.jobMetricsTitle} maxFontSizeMultiplier={1.2}>
          {title}
        </Text>
      </View>
      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue} maxFontSizeMultiplier={1.2}>
            {totalJobs}
          </Text>
          <Text style={styles.metricLabel} maxFontSizeMultiplier={1.2}>
            {translate("home.totalJobs")}
          </Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricValue} maxFontSizeMultiplier={1.2}>
            {activeJobs}
          </Text>
          <Text style={styles.metricLabel} maxFontSizeMultiplier={1.2}>
            {translate("home.activeJobs")}
          </Text>
        </View>
      </View>
    </View>
  );
}

// Inline Recently Posted Job Card Component
function RecentlyPostedJobCard({ title, jobData, iconSource }) {
  const navigation = useNavigation();
  const { translate } = useTranslation();

  const getStatusTranslation = (status) => {
    const statusMap = {
      pending: translate("jobs.pending"),
      active: translate("jobs.active"),
      completed: translate("jobs.completed"),
      cancelled: translate("jobs.cancelled"),
      disputed: translate("jobs.disputed"),
      in_review: translate("jobs.inReview"),
      disputed_completed: translate("jobs.disputed"),
    };
    return statusMap[status] || status;
  };

  const status = getStatusTranslation(jobData.status);

  const handleViewDetails = () => {
    // navigation.navigate("UnifiedJobDetail", { jobId: jobData.jobId });
    navigation.navigate("Jobs", { active: "Active" });
  };

  return (
    <View style={styles.recentJobCardWrap}>
      <View style={styles.recentJobCurve} />
      <View style={styles.recentJobCard}>
        <View style={styles.recentJobHeader}>
          <View style={styles.recentJobHeaderLeft}>
            <Image
              source={iconSource}
              style={styles.recentJobIcon}
              resizeMode="contain"
            />
            <Text style={styles.recentJobTitle} maxFontSizeMultiplier={1.2}>
              {title}
            </Text>
          </View>
          <View style={styles.recentJobBadgeContainer}>
            <Text
              style={styles.recentJobActiveBadge}
              maxFontSizeMultiplier={1.2}
            >
              {status}
            </Text>
          </View>
        </View>

        <View style={styles.recentJobContent}>
          <Text style={styles.recentJobName} maxFontSizeMultiplier={1.2}>
            {jobData.title}
          </Text>
          <View style={styles.recentJobRow}>
            <Text style={styles.recentJobSubtext} maxFontSizeMultiplier={1.2}>
              {jobData.postedAgo}
            </Text>
            <Text style={styles.recentJobStatus} maxFontSizeMultiplier={1.2}>
              {jobData.hireStatus === "hired"
                ? translate("home.hired")
                : translate("home.notHired")}
            </Text>
          </View>
          <View style={styles.recentJobRow}>
            <Text style={styles.recentJobSubtext} maxFontSizeMultiplier={1.2}>
              {jobData.applicants} {translate("home.applicants")}
            </Text>
            <Text style={styles.recentJobRate} maxFontSizeMultiplier={1.2}>
              {jobData.rate}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.recentJobButton}
          onPress={handleViewDetails}
        >
          <Text style={styles.recentJobButtonText} maxFontSizeMultiplier={1.2}>
            {translate("common.viewDetails").toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Inline Active Finance Summary Card Component
function ActiveFinanceSummaryCard({
  title,
  amountInEscrow,
  pendingPayments,
  iconSource,
}) {
  const { translate } = useTranslation();
  return (
    <View style={styles.financeCard}>
      <View style={styles.financeHeader}>
        <Image
          source={iconSource}
          style={styles.financeIcon}
          resizeMode="contain"
        />
        <Text style={styles.financeTitle} maxFontSizeMultiplier={1.2}>
          {title}
        </Text>
      </View>
      <View style={styles.financeContainer}>
        <View style={styles.financeItem}>
          <Text style={styles.financeValue} maxFontSizeMultiplier={1.2}>
            {pendingPayments}
          </Text>
          <Text style={styles.financeLabel} maxFontSizeMultiplier={1.2}>
            {translate("home.totalPending")}
          </Text>
        </View>
        <View style={styles.financeItem}>
          <Text style={styles.financeValue} maxFontSizeMultiplier={1.2}>
            {amountInEscrow}
          </Text>
          <Text style={styles.financeLabel} maxFontSizeMultiplier={1.2}>
            {translate("home.pendingCashPayments")}
          </Text>
        </View>
      </View>
    </View>
  );
}

// Inline Recent Notification Card Component
function RecentNotificationCard({ title, message, iconSource }) {
  return (
    <View style={styles.notificationCard}>
      <View style={styles.notificationHeader}>
        <Image
          source={iconSource}
          style={styles.notificationIcon}
          resizeMode="contain"
        />
        <Text style={styles.notificationTitle} maxFontSizeMultiplier={1.2}>
          {title}
        </Text>
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationText} maxFontSizeMultiplier={1.2}>
          {message}
        </Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const { translate, language } = useTranslation();
  const {
    data: dashboardData,
    isPending: dashboardLoading,
    error,
    refetch,
  } = useFetchBusinessDashboard();
  const { data: userProfileData, isPending: profileLoading } =
    useFetchUserProfile();

  const isPending = profileLoading || dashboardLoading;

  useEffect(() => {
    refetch?.();
  }, [language, refetch]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  if (isPending) {
    return (
      <LoadingState
        title={translate("home.dashboard")}
        message={translate("home.loadingDashboard")}
        backgroundColor={colors.bg}
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title={translate("home.dashboard")}
        errorMessage={translate("home.failedLoadDashboard")}
        onRetry={() => refetch?.()}
      />
    );
  }

  const firstName = dashboardData?.first_name || translate("common.user");
  const totalJobsCompleted = dashboardData?.total_jobs_completed || 0;
  const activeJobsCount = dashboardData?.active_jobs_count || 0;
  const recentJob = dashboardData?.recent_job;
  const pendingPayments = dashboardData?.pending_payments;
  const recentNotifications = dashboardData?.recent_notifications || [];
  const verificationStatus =
    userProfileData?.user?.verification_status ?? "unknown";

  return (
    <ScreenWrapper containerStyle={styles.screenContent} edges={["top"]}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Settings")}
          >
            <Image
              source={{
                uri:
                  userProfileData?.user?.profile_picture ||
                  `https://ui-avatars.com/api/?name=${firstName}&background=random`,
              }}
              style={styles.profilePic}
            />
          </TouchableOpacity>
          <Text
            style={[styles.greeting, { marginLeft: 12, marginRight: 0 }]}
            numberOfLines={1}
            ellipsizeMode="tail"
            maxFontSizeMultiplier={1.2}
          >
            {translate("home.hello")} {firstName}!
          </Text>
        </View>
        <View style={styles.headerButtonsContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.bellWrap}
            onPress={() =>
              navigation.navigate("Settings", {
                screen: "NotificationSettings",
              })
            }
          >
            <Image
              source={require("../../assets/images/notificationbell1.png")}
              style={styles.bell}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={styles.searchContainer}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("AllWorkers")}
      >
        <TextInput
          style={styles.searchInput}
          placeholder={
            translate("home.searchApplicants") || "Search applicants..."
          }
          placeholderTextColor={colors.text5}
          editable={false}
          pointerEvents="none"
        />
        <View style={styles.filterButton}>
          <Ionicons name="funnel-outline" size={20} color={colors.tertiary} />
        </View>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tertiary}
            colors={[colors.tertiary]}
          />
        }
      >
        <VerificationStatusCard
          verificationStatus={verificationStatus}
          isLoading={isPending}
        />

        <JobMetricsCard
          title={translate("home.jobMetrics")}
          totalJobs={totalJobsCompleted}
          activeJobs={activeJobsCount}
          iconSource={require("../../assets/images/job-metrics.png")}
        />

        {recentJob && (
          <RecentlyPostedJobCard
            title={translate("home.recentlyPostedJob")}
            jobData={{
              title: recentJob.title,
              postedAgo: `${translate("home.posted")} ${formatDisplayDate(
                recentJob.created_at,
              )}`,
              applicants: recentJob.proposals_count || 0,
              rate: `$${recentJob.pay_rate}${translate("common.perHour")}`,
              hireStatus: recentJob.hire_status,
              status: recentJob.status,
              jobId: recentJob.id,
            }}
            iconSource={require("../../assets/images/job.png")}
          />
        )}

        <ActiveFinanceSummaryCard
          title={translate("home.activeFinanceSummary")}
          amountInEscrow={`$${pendingPayments?.amount_pending_cash || 0}`}
          pendingPayments={`$${pendingPayments?.amount_pending_total || 0}`}
          iconSource={require("../../assets/images/moneybag.png")}
        />

        {recentNotifications.length > 0 &&
          recentNotifications.map((notif, idx) => (
            <RecentNotificationCard
              key={notif.id ?? idx}
              title={notif.title ?? translate("home.recentNotification")}
              message={notif.message ?? ""}
              iconSource={require("../../assets/images/notificationBell.png")}
            />
          ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.showTransactionsButton}
        onPress={() =>
          navigation.navigate("Settings", {
            screen: "TransactionHistory",
          })
        }
      >
        <Text
          style={styles.showTransactionsButtonText}
          maxFontSizeMultiplier={1.2}
        >
          {translate("home.viewTransactions").toUpperCase()}
        </Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  screenContent: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingBottom: 6,
    backgroundColor: colors.bg1,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greeting: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: fonts.semiBold,
    flexShrink: 1,
    marginRight: 12,
  },
  bell: {
    width: 22,
    height: 22,
  },
  bellWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF30",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  headerButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  profilePic: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#FFFFFF50",
    backgroundColor: "#FFFFFF20",
  },
  logoutWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF30",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 120,
  },
  // Job Metrics Card Styles
  jobMetricsCard: {
    backgroundColor: colors.home.cardLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobMetricsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  jobMetricsIcon: {
    width: 25,
    height: 25,
  },
  jobMetricsTitle: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: "#000",
    flexShrink: 1,
  },
  metricsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
    minWidth: 100, // Ensure items don't get too narrow
  },
  metricValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
  },
  metricLabel: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
  },
  metricDivider: {
    marginTop: 8,
    width: 1,
    height: 50,
    backgroundColor: colors.home.innerDivider,
  },
  // Recently Posted Job Card Styles
  recentJobCardWrap: {
    width: "100%",
    alignSelf: "center",
    position: "relative",
    marginBottom: 16,
  },
  recentJobCurve: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    top: -7,
    backgroundColor: colors.home.header,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  recentJobCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentJobHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    flexWrap: "wrap",
    gap: 8,
  },
  recentJobHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 150,
  },
  recentJobIcon: {
    width: 22,
    height: 22,
    marginRight: 8,
  },
  recentJobTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
    flexShrink: 1,
  },
  recentJobBadgeContainer: {
    alignSelf: "flex-start",
  },
  recentJobContent: {},
  recentJobName: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
    marginBottom: 8,
  },
  recentJobStatusContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  recentJobActiveBadge: {
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: colors.home.badgeBg,
    color: colors.tertiary,
    fontFamily: fonts.semiBold,
    overflow: "hidden",
    textAlign: "center",
  },
  recentJobStatusBadge: {
    fontSize: 12,
    color: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 16,
    backgroundColor: colors.bg,
    overflow: "hidden",
  },
  recentJobRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
    gap: 4,
  },
  recentJobSubtext: {
    fontSize: 12,
    color: colors.text4,
    flexShrink: 1,
  },
  recentJobStatus: {
    fontSize: 12,
    color: colors.tertiary,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 16,
    backgroundColor: colors.home.badgeBg,
    overflow: "hidden",
    fontFamily: fonts.semiBold,
  },
  recentJobRate: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
  },
  recentJobButton: {
    backgroundColor: colors.home.buttonPrimary,
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
  },
  recentJobButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
  // Active Finance Summary Card Styles
  financeCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 150,
  },
  financeHeader: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "center",
    gap: 8,
  },
  financeIcon: {
    width: 24,
    height: 24,
  },
  financeTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
    flexShrink: 1,
  },
  financeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  financeItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: colors.home.cardLight,
    borderRadius: 8,
    minWidth: 140, // Ensure items don't get too narrow when wrapping
  },
  financeValue: {
    fontSize: 22,
    fontFamily: fonts.semiBold,
    color: colors.tertiary,
  },
  financeLabel: {
    fontSize: 14,
    color: colors.text4,
    textAlign: "center",
    marginTop: -4,
  },
  notificationCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 10,
    borderLeftColor: colors.home.notificationAccent,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  notificationIcon: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
    flexShrink: 1,
  },
  notificationContent: {
    flexGrow: 1,
  },
  notificationText: {
    fontSize: 14,
    color: colors.textdark,
    marginBottom: 12,
  },
  notificationButton: {
    backgroundColor: colors.home.buttonPrimary,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    alignSelf: "flex-end",
    marginTop: 8,
    elevation: 2,
  },
  notificationButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
  showTransactionsButton: {
    backgroundColor: colors.tertiary,
    marginHorizontal: 16,
    marginVertical: 4,
    paddingVertical: 12,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  showTransactionsButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.home.cardLight, // Light mint/green for input
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: -5,
    borderWidth: 0.5,
    borderColor: colors.tertiary, // Green border
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textdark, // Using theme dark text color
    paddingVertical: 0,
  },
  filterButton: {
    marginLeft: 10,
  },
});
