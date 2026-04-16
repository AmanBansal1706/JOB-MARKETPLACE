import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { colors, fonts } from "../../../theme";
import { CommonHeader, ScreenWrapper } from "../../../components/common";
import { useTranslation } from "../../../hooks/useTranslation";
import LoadingState from "../../../components/LoadingState";
import ErrorState from "../../../components/ErrorState";
import DataCard from "../../../components/DataCard";
import { MaterialIcons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  useFetchWorkerAnalytics,
  useFetchJobById,
} from "../../../services/JobServices";
import { SafeAreaView } from "react-native-safe-area-context";
import MessageWorkerButton from "../../../components/chatting/MessageWorkerButton";
import {
  formatDisplayDate,
  formatDisplayDateTime,
  formatTimeFromDate,
} from "../../../utils/dateFormatting";

export default function WorkerAnalyticsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { translate } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  const workerId = route.params?.workerId;
  const jobId = route.params?.jobId;
  const workerName = route.params?.workerName || translate("profile.title");

  // Fetch analytics data
  const {
    data: analyticsData,
    isPending: isLoadingAnalytics,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useFetchWorkerAnalytics(workerId, jobId);

  // Fetch job data for context
  const {
    data: jobData,
    isPending: isLoadingJob,
    error: jobError,
    refetch: refetchJob,
  } = useFetchJobById(jobId);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchAnalytics(), refetchJob()]);
    } finally {
      setRefreshing(false);
    }
  };

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return translate("jobs.notAvailable");
    const result = formatDisplayDate(dateString);
    return result === "N/A" ? translate("jobs.notAvailable") : result;
  };

  const formatTime = (timeString) => {
    if (!timeString) return translate("jobs.notAvailable");
    const result = formatTimeFromDate(timeString);
    return result === "N/A" ? translate("jobs.notAvailable") : result;
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return translate("jobs.notAvailable");
    const result = formatDisplayDateTime(dateTimeString);
    return result === "N/A" ? translate("jobs.notAvailable") : result;
  };

  const getStatusColor = (status) => {
    if (status === "completed")
      return { color: colors.tertiary, bgColor: colors.bbg3 };
    if (status === "incompleted")
      return { color: colors.textdark, bgColor: colors.bbg5 };
    return { color: colors.text1, bgColor: colors.bbg6 };
  };

  const getStatusIcon = (status) => {
    if (status === "completed") return "check-circle";
    if (status === "incompleted") return "cancel";
    return "help";
  };

  // Transform data
  const analyticsDetails = useMemo(() => {
    if (!analyticsData?.data) return null;

    const analytics = analyticsData.data;
    const dailyLogs = analytics.daily_logs || [];

    return {
      totalDays: analytics.total_days || 0,
      totalCompleted: analytics.total_days_completed || 0,
      totalIncompleted: analytics.total_days_incompleted || 0,
      lastCheckIn: formatDateTime(analytics.last_day_check_in),
      lastCheckOut: formatDateTime(analytics.last_day_check_out),
      todayCheckIn: formatDateTime(analytics.today_check_in),
      todayCheckOut: formatDateTime(analytics.today_check_out),
      dailyLogs: dailyLogs.map((log) => ({
        date: formatDate(log.date),
        hoursWorked: log.hours_worked ? log.hours_worked.toFixed(2) : "0.00",
        status: log.status,
      })),
      completionPercentage:
        analytics.total_days > 0
          ? Math.round(
              (analytics.total_days_completed / analytics.total_days) * 100,
            )
          : 0,
    };
  }, [analyticsData]);

  const isLoading = isLoadingAnalytics || isLoadingJob;
  const hasError = analyticsError || jobError;

  // Loading state
  if (isLoading) {
    return (
      <LoadingState
        title={translate("common.loading")}
        message={translate("common.loading")}
        backgroundColor={colors.bg}
      />
    );
  }

  // Error state
  if (hasError || !analyticsDetails) {
    return (
      <ErrorState
        title={translate("common.error")}
        errorMessage={
          hasError?.message || translate("jobs.fetchAnalyticsError")
        }
        onRetry={() => refetchAnalytics()}
      />
    );
  }

  return (
    <ScreenWrapper backgroundColor={colors.bg}>
      <CommonHeader
        title={translate("jobs.workerAnalyticsTitle", { name: workerName })}
        onBackPress={() => navigation.goBack?.()}
        backgroundColor={colors.bg1}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        alwaysBounceVertical={false}
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
        {/* Summary Metrics Card */}
        <DataCard>
          <Text style={styles.titleText}>
            {translate("jobs.performanceSummary")}
          </Text>
          <View style={styles.metricsGrid}>
            {/* Total Days */}
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>
                {analyticsDetails.totalDays}
              </Text>
              <Text style={styles.metricLabel}>
                {translate("jobs.totalDays")}
              </Text>
            </View>

            {/* Completed Days */}
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>
                {analyticsDetails.totalCompleted}
              </Text>
              <Text style={styles.metricLabel}>
                {translate("jobs.completed")}
              </Text>
            </View>

            {/* Incompleted Days */}
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>
                {analyticsDetails.totalIncompleted}
              </Text>
              <Text style={styles.metricLabel}>
                {translate("jobs.incompleted")}
              </Text>
            </View>
          </View>

          {/* Completion Percentage Bar */}
          <View style={styles.completionContainer}>
            <View style={styles.completionHeader}>
              <Text style={styles.completionLabel}>
                {translate("jobs.completionRate")}
              </Text>
              <Text style={styles.completionPercentage}>
                {analyticsDetails.completionPercentage}%
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${analyticsDetails.completionPercentage}%` },
                ]}
              />
            </View>
          </View>
        </DataCard>

        {/* Check-In/Check-Out Information */}
        <DataCard title={translate("jobs.checkInCheckOutTimes")}>
          {/* Today's Timing */}
          <View style={styles.timingSection}>
            <Text style={styles.timingSectionTitle}>
              {translate("jobs.today")}
            </Text>
            <View style={styles.timingRow}>
              <View style={styles.timingItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.timingLabel}>
                    {translate("jobs.checkIn")}
                  </Text>
                  <Text style={styles.timingValue}>
                    {analyticsDetails.todayCheckIn}
                  </Text>
                </View>
              </View>
              <View style={styles.timingItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.timingLabel}>
                    {translate("jobs.checkOut")}
                  </Text>
                  <Text style={styles.timingValue}>
                    {analyticsDetails.todayCheckOut}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Last Day Timing */}
          <View
            style={[
              styles.timingSection,
              {
                marginTop: 16,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: colors.bg,
              },
            ]}
          >
            <Text style={styles.timingSectionTitle}>
              {translate("jobs.lastDay")}
            </Text>
            <View style={styles.timingRow}>
              <View style={styles.timingItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.timingLabel}>
                    {translate("jobs.checkIn")}
                  </Text>
                  <Text style={styles.timingValue}>
                    {analyticsDetails.lastCheckIn}
                  </Text>
                </View>
              </View>
              <View style={styles.timingItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.timingLabel}>
                    {translate("jobs.checkOut")}
                  </Text>
                  <Text style={styles.timingValue}>
                    {analyticsDetails.lastCheckOut}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </DataCard>

        {/* Daily Logs */}
        <DataCard title={translate("jobs.dailyWorkLogs")}>
          {analyticsDetails.dailyLogs.length > 0 ? (
            <View>
              {/* Header Row */}
              <View style={styles.logsHeaderRow}>
                <Text style={[styles.logsHeaderCol, { flex: 1.2 }]}>
                  {translate("jobs.date")}
                </Text>
                <Text style={[styles.logsHeaderCol, { flex: 1.0 }]}>
                  {translate("jobs.hours")}
                </Text>
                <Text
                  style={[
                    styles.logsHeaderCol,
                    { flex: 1.2, textAlign: "center" },
                  ]}
                >
                  {translate("jobs.status")}
                </Text>
              </View>
              <View style={styles.sep} />

              {/* Log Rows */}
              {analyticsDetails.dailyLogs.map((log, idx) => {
                const statusColor = getStatusColor(log.status);
                const statusIcon = getStatusIcon(log.status);

                return (
                  <View key={`${log.date}-${idx}`}>
                    <View style={styles.logRow}>
                      <View style={{ flex: 1.2, justifyContent: "center" }}>
                        <Text style={styles.logDate}>{log.date}</Text>
                      </View>
                      <View style={{ flex: 1.0, justifyContent: "center" }}>
                        <Text style={styles.logHours}>{log.hoursWorked}h</Text>
                      </View>
                      <View
                        style={{
                          flex: 1.2,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: statusColor.bgColor },
                          ]}
                        >
                          <MaterialIcons
                            name={statusIcon}
                            size={14}
                            color={statusColor.color}
                            style={{ marginRight: 4 }}
                          />
                          <Text
                            style={[
                              styles.statusBadgeText,
                              { color: statusColor.color },
                            ]}
                          >
                            {log.status.charAt(0).toUpperCase() +
                              log.status.slice(1)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {idx !== analyticsDetails.dailyLogs.length - 1 && (
                      <View style={styles.sep} />
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <MaterialIcons name="event-note" size={48} color={colors.text1} />
              <Text style={styles.emptyStateText}>
                {translate("jobs.noData")}
              </Text>
            </View>
          )}
        </DataCard>

        {/* Job Information Reference */}
        {jobData?.data && (
          <DataCard title={translate("jobs.jobDetails")}>
            <View style={styles.jobRefRow}>
              <Text style={styles.jobRefLabel}>
                {translate("jobs.jobTitle")}:
              </Text>
              <Text style={styles.jobRefValue}>
                {jobData.data.title || translate("jobs.notAvailable")}
              </Text>
            </View>
            <View style={[styles.jobRefRow, { marginTop: 8 }]}>
              <Text style={styles.jobRefLabel}>
                {translate("jobs.position")}:
              </Text>
              <Text style={styles.jobRefValue}>
                {jobData.data.position || translate("jobs.notAvailable")}
              </Text>
            </View>
            <View style={[styles.jobRefRow, { marginTop: 8 }]}>
              <Text style={styles.jobRefLabel}>
                {translate("jobs.payRate")}:
              </Text>
              <Text style={styles.jobRefValue}>
                ${Number(jobData.data.pay_rate || 0).toFixed(2)}/hr
              </Text>
            </View>
          </DataCard>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.tertiary }]}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate("ApplicantProfile", {
                workerId: workerId,
              })
            }
          >
            <MaterialIcons
              name="person"
              size={20}
              color={colors.text}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              {translate("jobs.viewProfile")}
            </Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <MessageWorkerButton
              workerId={workerId}
              style={[styles.actionButton, { backgroundColor: colors.bbg6 }]}
              textStyle={[styles.actionButtonText, { color: colors.textdark }]}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexGrow: 1,
    paddingBottom: 120,
  },

  // Title
  titleText: {
    fontFamily: fonts.semiBold,
    color: colors.tertiary,
    fontSize: 16,
    marginBottom: 14,
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  metricBox: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.bbg6,
    borderRadius: 12,
    padding: 14,
  },
  metricValue: {
    fontSize: 24,
    fontFamily: fonts.semiBold,
    color: colors.tertiary,
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.text1,
    textAlign: "center",
  },

  // Completion Rate
  completionContainer: {
    backgroundColor: colors.bbg6,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  completionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  completionLabel: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
  },
  completionPercentage: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.tertiary,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: colors.bg,
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.tertiary,
    borderRadius: 5,
  },

  // Timing Section
  timingSection: {},
  timingSectionTitle: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  timingRow: {
    flexDirection: "row",
    gap: 12,
  },
  timingItem: {
    flex: 1,
    backgroundColor: colors.bbg6,
    borderRadius: 12,
    padding: 14,
    justifyContent: "center",
  },
  timingIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  timingLabel: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.text1,
    marginBottom: 4,
  },
  timingValue: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
  },

  // Daily Logs
  sep: { height: 1, backgroundColor: colors.bg, marginHorizontal: 0 },
  logsHeaderRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 6,
  },
  logsHeaderCol: {
    color: colors.textdark,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  logRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  logDate: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.text1,
  },
  logHours: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    fontFamily: fonts.semiBold,
    marginLeft: 4,
  },

  // Empty State
  emptyStateContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text1,
    marginTop: 12,
  },

  // Job Reference
  jobRefRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  jobRefLabel: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
    marginRight: 8,
    minWidth: 80,
  },
  jobRefValue: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.text1,
    flex: 1,
  },

  // Action Buttons
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
});
