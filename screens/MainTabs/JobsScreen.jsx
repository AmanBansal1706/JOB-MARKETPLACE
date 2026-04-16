import { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { colors, fonts } from "../../theme";
import { useNavigation } from "@react-navigation/native";
import { CommonHeader, ScreenWrapper } from "../../components/common";
import { useFetchJobsByStatus } from "../../services/JobServices";
import PostJobModalButton from "../../components/PostJobModalButton";
import { useTranslation } from "../../hooks/useTranslation";
import {
  formatDate,
  formatTime,
  calculateShiftDuration,
} from "../../utils/jobFormatting";

// ==================== Constants ====================

const TABS = [
  { key: "Active", label: "jobs.active" },
  { key: "Completed", label: "jobs.completed" },
  { key: "Disputed", label: "jobs.disputed" },
];

const STATUS_ACCENT_COLORS = {
  Active: () => colors.text3,
  Completed: () => colors.secondary,
  Disputed: () => colors.primary,
};

const NAVIGATION_ROUTES = {
  active: "ActiveJobDetail",
  disputed: "DisputedJobDetail",
  disputed_completed: "DisputedJobDetail",
  completed: "CompletedJobDetail",
};

// ==================== Helper Functions ====================

/**
 * Get navigation route based on job status
 */
const getNavigationRoute = (status) => {
  const route = NAVIGATION_ROUTES[status?.toLowerCase()];
  return route || "CompletedJobDetail";
};

/**
 * Get accent color based on job status
 */
const getAccentColor = (status) => {
  const colorGetter = STATUS_ACCENT_COLORS[status];
  return colorGetter ? colorGetter() : colors.text3;
};

/**
 * Transform API job response to UI format
 */
const transformJobData = (apiJob, status, translate) => {
  const position = apiJob.position || translate("jobs.defaultPosition");
  const experienceLevel = apiJob.experience_level
    ? ` (${apiJob.experience_level})`
    : "";
  const responsibilities = apiJob.responsibilities
    ?.map((r) => r.name)
    .join(", ");

  let startDate = "";
  let endDate = "";
  let startTime = "";
  let endTime = "";
  let rawStartDate = null;
  let rawEndDate = null;

  if (apiJob.schedule_type === "same") {
    rawStartDate = apiJob.start_date;
    rawEndDate = apiJob.end_date;
    startDate = formatDate(apiJob.start_date, "-");
    endDate = formatDate(apiJob.end_date, "-");
    startTime = formatTime(apiJob.joining_time);
    endTime = formatTime(apiJob.finish_time);
  } else if (apiJob.slots && apiJob.slots.length > 0) {
    const firstSlot = apiJob.slots[0];
    const lastSlot = apiJob.slots[apiJob.slots.length - 1];
    rawStartDate = firstSlot?.start_date;
    rawEndDate = lastSlot?.end_date;
    startDate = formatDate(firstSlot.start_date, "-");
    endDate = formatDate(lastSlot.end_date, "-");
    startTime = formatTime(firstSlot.joining_time);
    endTime = formatTime(lastSlot.finish_time);
  }

  const hoursPerDay =
    apiJob.schedule_type === "same"
      ? calculateShiftDuration(
          apiJob.joining_time,
          apiJob.finish_time,
          "same",
          [],
          apiJob.workers_needed,
          rawStartDate,
          rawEndDate,
        )
      : calculateShiftDuration(
          null,
          null,
          "different",
          apiJob.slots || [],
          1,
          rawStartDate,
          rawEndDate,
        );

  const meta = `${position} • ${hoursPerDay} ${translate("jobs.totalHours")}`;
  const startValue = `${startDate}  •  ${startTime}`;
  const endValue = `${endDate}  •  ${endTime}`;

  const payRate = apiJob.pay_rate
    ? `$${apiJob.pay_rate}${translate("common.perHour")}`
    : "";
  const totalCost = apiJob.total_cost ? `$${apiJob.total_cost}` : "";
  const rateText = payRate || totalCost;

  const workersNeeded = `${apiJob.workers_needed} ${translate(
    "jobs.workersNeeded",
  )}`;
  const totalPayRate = apiJob.total_cost ? `$${apiJob.total_cost}` : "";

  let disputeDate = "";
  if (
    (status?.toLowerCase() === "disputed" ||
      status?.toLowerCase() === "disputed_completed") &&
    apiJob.dispute_raised_at
  ) {
    disputeDate = formatDate(apiJob.dispute_raised_at, "-");
  }

  return {
    id: apiJob.id,
    title: apiJob.title,
    position,
    experienceLevel,
    meta,
    workersNeeded,
    totalPayRate,
    responsibilities,
    startValue,
    endValue,
    startDate,
    endDate,
    startTime,
    endTime,
    rateText,
    disputeDate,
    navigationRoute: getNavigationRoute(status),
  };
};

// ==================== Components ====================

/**
 * Tabs component for job status filtering
 */
function JobsTopTabs({ active, onChange, translate }) {
  return (
    <View style={styles.tabsWrapper}>
      {TABS.map((tab) => {
        const selected = active === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange && onChange(tab.key)}
            style={[styles.tab, selected && styles.tabActive]}
          >
            <Text
              style={[styles.tabText, selected && styles.tabTextActive]}
              maxFontSizeMultiplier={1.2}
            >
              {translate(tab.label)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * Individual job card display component
 */
function JobCard({
  title,
  meta,
  workersNeeded,
  totalPayRate,
  rateText,
  responsibilities,
  startValue,
  endValue,
  startDate,
  endDate,
  startTime,
  endTime,
  disputeDate,
  accentColor,
  onPress,
  translate,
  status,
}) {
  return (
    <View style={styles.jobCardWrapper}>
      <View
        style={[
          styles.jobCard,
          { borderLeftWidth: 7, borderLeftColor: accentColor },
        ]}
      >
        <View style={styles.jobCardContent}>
          <View style={styles.jobHeaderRow}>
            <Text style={styles.jobTitle} maxFontSizeMultiplier={1.2}>
              {title}
            </Text>
          </View>
          <View style={styles.jobMetaRow}>
            <Text style={styles.jobMeta} maxFontSizeMultiplier={1.2}>
              {meta}
            </Text>
            <Text
              style={[styles.jobRate, { color: accentColor }]}
              maxFontSizeMultiplier={1.2}
            >
              {rateText}
            </Text>
          </View>
          <View style={styles.workersRow}>
            <Text style={styles.jobMeta} maxFontSizeMultiplier={1.2}>
              {workersNeeded}
            </Text>
            {!!totalPayRate &&
              (status === "Active" || status === "Completed") && (
                <Text style={styles.jobMeta} maxFontSizeMultiplier={1.2}>
                  {" "}
                  • {totalPayRate}
                </Text>
              )}
          </View>
          {!!disputeDate && (
            <Text style={styles.jobMeta} maxFontSizeMultiplier={1.2}>
              <Text
                style={[styles.jobLabel, { color: accentColor }]}
                maxFontSizeMultiplier={1.2}
              >
                {translate("jobs.raised")}:{" "}
              </Text>
              {disputeDate}
            </Text>
          )}
          {/* {!!responsibilities && (
            <Text style={styles.jobMeta} maxFontSizeMultiplier={1.2}>
              <Text
                style={[styles.jobLabel, { color: accentColor }]}
                maxFontSizeMultiplier={1.2}
              >
                {translate("jobs.responsibilities")}{" "}
              </Text>
              {responsibilities}
            </Text>
          )} */}
          {status === "Disputed" ? (
            <>
              {!!startValue && (
                <Text style={styles.jobMeta} maxFontSizeMultiplier={1.2}>
                  <Text style={styles.jobLabel} maxFontSizeMultiplier={1.2}>
                    {translate("jobs.startDate") || "Start Date"}:{" "}
                  </Text>
                  {startValue}
                </Text>
              )}
              {!!endValue && (
                <Text style={styles.jobMeta} maxFontSizeMultiplier={1.2}>
                  <Text style={styles.jobLabel} maxFontSizeMultiplier={1.2}>
                    {translate("jobs.endDate") || "End Date"}:{" "}
                  </Text>
                  {endValue}
                </Text>
              )}
            </>
          ) : (
            <>
              {!!startDate && (
                <Text style={styles.jobMeta} maxFontSizeMultiplier={1.2}>
                  <Text style={styles.jobLabel} maxFontSizeMultiplier={1.2}>
                    {translate("jobs.startDate") || "Start Date"}:{" "}
                  </Text>
                  {startDate} • {startTime}
                </Text>
              )}
              {!!endDate && (
                <Text style={styles.jobMeta} maxFontSizeMultiplier={1.2}>
                  <Text style={styles.jobLabel} maxFontSizeMultiplier={1.2}>
                    {translate("jobs.endDate") || "End Date"}:{" "}
                  </Text>
                  {endDate} • {endTime}
                </Text>
              )}
            </>
          )}
          <Pressable
            onPress={onPress}
            style={[styles.jobButton, { backgroundColor: accentColor }]}
          >
            <Text style={styles.jobButtonText} maxFontSizeMultiplier={1.2}>
              {translate("common.viewDetails")}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/**
 * Jobs list component with API integration
 */
function JobsList({
  status,
  refreshing,
  onRefresh,
  registerRefetch,
  translate,
}) {
  const navigation = useNavigation();
  const statusLower = status.toLowerCase();

  const {
    isPending,
    data: apiData,
    isError,
    error,
    refetch,
  } = useFetchJobsByStatus(statusLower);

  // Register refetch function for pull-to-refresh
  if (registerRefetch && typeof registerRefetch === "function") {
    try {
      registerRefetch(refetch);
    } catch (e) {
      // ignore
    }
  }

  const transformedJobs = useMemo(() => {
    if (apiData?.data?.jobs && apiData.data.jobs.length > 0) {
      return apiData.data.jobs.map((job) =>
        transformJobData(job, status, translate),
      );
    }
    return [];
  }, [apiData, status, translate]);

  const accentColor = getAccentColor(status);

  if (isPending) {
    return (
      <View style={[styles.jobsContainer, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.tertiary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.jobsContainer, styles.centerContent]}>
        <Text style={styles.errorText} maxFontSizeMultiplier={1.2}>
          {translate("common.error")}:{" "}
          {error?.message || translate("common.error")}
        </Text>
      </View>
    );
  }

  if (transformedJobs.length === 0) {
    return (
      <View style={[styles.jobsContainer, styles.centerContent]}>
        <Text style={styles.noJobsTitle} maxFontSizeMultiplier={1.2}>
          {translate("jobs.noJobs")}
        </Text>
        <Text style={styles.noJobsMessage} maxFontSizeMultiplier={1.2}>
          {translate("jobs.noJobs")}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.jobsContainer}>
      {transformedJobs.map((job) => (
        <JobCard
          key={job.id}
          title={job.title}
          meta={job.meta}
          workersNeeded={job.workersNeeded}
          totalPayRate={job.totalPayRate}
          responsibilities={job.responsibilities}
          startValue={job.startValue}
          endValue={job.endValue}
          startDate={job.startDate}
          endDate={job.endDate}
          startTime={job.startTime}
          endTime={job.endTime}
          rateText={job.rateText}
          disputeDate={job.disputeDate}
          accentColor={accentColor}
          status={status}
          translate={translate}
          onPress={() =>
            navigation.navigate("UnifiedJobDetail", {
              jobId: job.id,
              tab: status,
            })
          }
        />
      ))}
    </View>
  );
}

// ==================== Main Component ====================

export default function JobsScreen({ navigation, route }) {
  const initialActive = route?.params?.active ?? "Active";
  const [active, setActive] = useState(initialActive);
  const { translate } = useTranslation();

  useEffect(() => {
    const target = route?.params?.active;
    if (target && target !== active) {
      setActive(target);
    }
  }, [route?.params?.active]);

  const [refreshing, setRefreshing] = useState(false);
  const refetchRef = useRef(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (refetchRef.current) {
        await refetchRef.current();
      }
    } catch (err) {
      console.warn("Jobs refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScreenWrapper backgroundColor={colors.bg} edges={["top"]}>
      <CommonHeader
        title={translate("jobs.title")}
        onBackPress={() => navigation?.goBack()}
        backgroundColor={colors.tertiary}
      />
      <JobsTopTabs active={active} onChange={setActive} translate={translate} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        directionalLockEnabled={true}
        decelerationRate="normal"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.tertiary}
            colors={[colors.tertiary]}
          />
        }
      >
        <JobsList
          status={active}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          translate={translate}
          registerRefetch={(fn) => (refetchRef.current = fn)}
        />
      </ScrollView>
      <PostJobModalButton accentColor={getAccentColor(active)} />
    </ScreenWrapper>
  );
}

// ==================== Styles ====================

const styles = StyleSheet.create({
  // Tabs Styles
  tabsWrapper: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 16,
    minHeight: 46,
    width: "90%",
    overflow: "hidden",
    alignSelf: "center",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 14,
  },
  tabActive: {
    backgroundColor: colors.tertiary,
  },
  tabText: {
    fontFamily: fonts.medium,
    color: colors.text2,
    fontSize: 14,
  },
  tabTextActive: {
    color: "#FFFFFF",
    fontFamily: fonts.semiBold,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },

  // Jobs Container
  jobsContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 0,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },

  // Error & Empty States
  errorText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.primary,
    textAlign: "center",
  },
  noJobsTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textdark,
    marginBottom: 8,
    textAlign: "center",
  },
  noJobsMessage: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text1,
    textAlign: "center",
    paddingHorizontal: 24,
    lineHeight: 20,
  },

  // Job Card Styles
  jobCardWrapper: {
    width: "90%",
    alignSelf: "center",
    marginBottom: 16,
  },
  jobCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 22,
    position: "relative",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    overflow: "hidden",
  },
  jobCardContent: {
    flex: 1,
    padding: 12,
    paddingLeft: 16,
    paddingBottom: 10,
  },
  jobHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    flexWrap: "wrap",
    gap: 4,
  },
  jobTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textdark,
    flexShrink: 1,
  },
  jobMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
    flexWrap: "wrap",
    gap: 4,
  },
  jobRate: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    flexShrink: 1,
  },
  jobMeta: {
    fontFamily: fonts.regular,
    color: colors.text1,
    marginBottom: 3,
    fontSize: 13,
    flexShrink: 1,
  },
  jobLabel: {
    fontFamily: fonts.semiBold,
  },
  workersRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
    flexWrap: "wrap",
    gap: 4,
  },
  jobButton: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginTop: 8,
  },
  jobButtonText: {
    fontFamily: fonts.semiBold,
    color: "#fff",
    fontSize: 12,
  },
});
