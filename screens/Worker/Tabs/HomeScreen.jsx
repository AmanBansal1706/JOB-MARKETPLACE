import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useState, useMemo, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import walletImage from "../../../assets/worker-images/3d-wallet.png";
import femaleAvatar from "../../../assets/worker-images/female.png";
import notificationBell from "../../../assets/worker-images/notification-bell.png";
import colors from "../../../theme/worker/colors";
import {
  useFetchWorkerJobs,
  useJobCheckInOut,
} from "../../../services/WorkerJobServices";
import CashConfirmationCard from "../../../components/workerModals/cards/CashConfirmationCard";
import JobCompletedCard from "../../../components/workerModals/cards/JobCompletedCard";
import { formatExperienceLevel } from "../../../utils/experienceLevel";
import {
  formatDisplayDate,
  formatTimeString,
} from "../../../utils/dateFormatting";
import { useTranslation } from "../../../hooks/useTranslation";
import JobCard from "../../../components/workerhome/JobCard";
import AlertReminderCard from "../../../components/workerhome/AlertReminderCard";
import { useWorkerPopupQueue } from "../../../hooks/useWorkerPopupQueue";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { translate } = useTranslation();
  const [activeTab, setActiveTab] = useState("Suggested");
  const [searchQuery, setSearchQuery] = useState("");

  // Check In/Out mutation
  const { mutate: performCheckInOut } = useJobCheckInOut();

  // Popup queue management
  const {
    popupVisible,
    currentItem,
    totalCount,
    dismissedCount,
    isConfirmingCash,
    closeModal,
    workerProfile,
    isProfileLoading,
    refetchProfile,
    handleJobRate: _handleJobRate,
    handleJobSkip,
    handleCashConfirm,
    handleCashSkip,
  } = useWorkerPopupQueue();

  // Bind navigation into handleJobRate
  const handleJobRate = useCallback(
    (jobData) => _handleJobRate(jobData, navigation),
    [_handleJobRate, navigation],
  );

  const jobStatusMap = {
    Suggested: "Suggested",
    Assigned: "Assigned",
    Completed: "Completed",
    Disputed: "Disputed",
  };

  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchWorkerJobs({
    jobStatus: jobStatusMap[activeTab],
    limit: 10,
  });

  const apiJobs = data?.jobs || [];

  const earnings = workerProfile?.earnings || {
    total_earnings: 0,
    last_30_days_earnings: 0,
    upcoming_earnings: 0,
  };

  // Calculate alert count
  const alertCount = useMemo(() => {
    if (isProfileLoading || !workerProfile) return 0;

    let count = 0;

    // 1. Verification alert
    const verificationStatus =
      workerProfile?.verification_status || "incomplete";
    if (
      ["incomplete", "rejected", "permanent_rejected"].includes(
        verificationStatus,
      )
    ) {
      count += 1;
    }

    // 2. Cash confirmation alerts
    const cashJobs =
      workerProfile?.show_popup?.cash_received_confirmation?.jobs || [];
    count += cashJobs.filter((job) => job.show_cash_confirmation_popup).length;

    // 3. Job completed alerts
    const completedJobs = workerProfile?.show_popup?.job_completed?.jobs || [];
    count += completedJobs.filter(
      (job) => job.show_pop_up_job_completion,
    ).length;

    return count;
  }, [isProfileLoading, workerProfile]);

  const formatEarnings = (amount) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${amount}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return formatDisplayDate(dateStr);
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    return formatTimeString(timeStr);
  };

  const formatBreakTime = (minutes) => (minutes ? `${minutes}min` : "-");

  const transformJob = useCallback(
    (job) => {
      // Logic to determine which slots to show based on the active tab
      let rawSlots = [];
      if (["Assigned", "Completed", "Disputed"].includes(activeTab)) {
        // For these tabs, specifically use assigned_slot (can be an array or object)
        if (Array.isArray(job.assigned_slot)) {
          rawSlots = job.assigned_slot;
        } else if (job.assigned_slot) {
          rawSlots = [job.assigned_slot];
        } else if (job.slots) {
          rawSlots = job.slots; // Fallback to slots if assigned_slot is missing
        }
      } else {
        // For Suggested tab
        rawSlots = job.slots || [];
      }

      return {
        id: job.id,
        title: job.job_title || "Job",
        company: job.business_name || "Business",
        businessId: job.business_id,
        businessProfilePicture: job.business_profile_picture,
        price: `$${Math.round(job.job_cost_for_worker_after_worker_commission || job.job_cost_for_worker || 0)}`,
        position: job.position || "-",
        experienceLevel: formatExperienceLevel(job.experience_level, "-"),
        payRate: job.hourly_pay_rate ? `$${job.hourly_pay_rate}/hr` : "-/hr",
        distance: job.distance_km
          ? `${Math.round(Number(job.distance_km))}km`
          : null,
        rating: job.business_rating || 0,
        slots: rawSlots.map((slot) => ({
          startDate: (slot.start_date || slot.startDate) ? formatDate(slot.start_date || slot.startDate) : "-",
          endDate: (slot.end_date || slot.endDate) ? formatDate(slot.end_date || slot.endDate) : "-",
          joiningTime: (slot.joining_time || slot.joiningTime) ? formatTime(slot.joining_time || slot.joiningTime) : "-",
          endTime: (slot.finish_time || slot.end_time || slot.endTime) ? formatTime(slot.finish_time || slot.end_time || slot.endTime) : "-",
          breakTime: formatBreakTime(slot.break_time || slot.breakTime),
          is_applied_for_proposal: slot.is_applied_for_proposal || false,
        })),
        showCheckInButton: job?.flags?.enable_check_in_button || false,
        showCheckOutButton: job?.flags?.enable_check_out_button || false,
      };
    },
    [activeTab, formatDate, formatTime, formatBreakTime],
  );

  const currentJobs = useMemo(() => {
    return apiJobs.map(transformJob);
  }, [apiJobs, transformJob]);

  const handleViewDetails = (jobId, activeTab) => {
    navigation.navigate("WorkerUnifiedJobDetails", {
      jobId,
      initialStatus: activeTab,
    });
  };

  const handleBusinessProfilePress = (businessId, businessName) => {
    navigation.navigate("BusinessProfile", { businessId, businessName });
  };

  const handleCheckInOut = (jobId, isCheckIn) => {
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
            performCheckInOut(jobId, {
              onSuccess: (response) => {
                Alert.alert(
                  translate("workerCommon.success"),
                  response.message ||
                    translate("workerHome.successful", { action }),
                );
                refetch();
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

  return (
    <View style={styles.mainContainer}>
      {/* Unified Popup Modal: Job Completed first, then Cash Confirmation */}
      <Modal
        visible={popupVisible}
        transparent
        animationType="none"
        // onRequestClose={handleJobSkip}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              {totalCount > 1 ? (
                <Text style={styles.modalProgress}>
                  {dismissedCount + 1} of {totalCount}
                </Text>
              ) : (
                <View />
              )}
              <TouchableOpacity
                onPress={closeModal}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>
            </View>
            {currentItem?.type === "job_completed" ? (
              <JobCompletedCard
                jobData={currentItem.data}
                onRate={handleJobRate}
                onSkip={handleJobSkip}
              />
            ) : currentItem?.type === "cash_confirmation" ? (
              <CashConfirmationCard
                jobData={currentItem.data}
                onConfirm={handleCashConfirm}
                onSkip={handleCashSkip}
              />
            ) : null}
            {isConfirmingCash && (
              <View style={styles.modalLoadingOverlay}>
                <ActivityIndicator size="large" color={colors.primary.pink} />
              </View>
            )}
          </View>
        </View>
      </Modal>
      <StatusBar style="light" backgroundColor={colors.primary.pink} />

      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {workerProfile?.user?.profile_picture ? (
              <Image
                source={{ uri: workerProfile.user.profile_picture }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={femaleAvatar}
                style={styles.avatar}
                resizeMode="cover"
              />
            )}
            <Text style={styles.welcomeText}>
              {workerProfile?.user?.first_name
                ? translate("workerHome.welcomeName", {
                    name: workerProfile.user.first_name,
                  })
                : translate("workerHome.welcome")}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate("WorkerNotifications")}
          >
            <Image
              source={notificationBell}
              style={styles.notificationIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <FlatList
        data={currentJobs}
        keyExtractor={(job) => String(job.id)}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl refreshing={isPending} onRefresh={refetch} />
        }
        ListHeaderComponent={
          <>
            <TouchableOpacity
              style={styles.searchContainer}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("WorkerSearchJob")}
            >
              <TextInput
                style={styles.searchInput}
                placeholder={translate("workerSearch.searchJobs")}
                placeholderTextColor={colors.text.secondary}
                value={searchQuery}
                editable={false}
                pointerEvents="none"
              />
              <View style={styles.filterButton}>
                <Ionicons
                  name="funnel-outline"
                  size={20}
                  color={colors.text.secondary}
                />
              </View>
            </TouchableOpacity>

            <AlertReminderCard
              alertCount={alertCount}
              translate={translate}
              navigation={navigation}
            />

            <View style={styles.earningsCard}>
              <View style={styles.earningsHeader}>
                <Image
                  source={walletImage}
                  style={styles.walletIcon}
                  resizeMode="contain"
                />
                <Text style={styles.earningsTitle}>
                  {translate("workerHome.earnings")}
                </Text>
              </View>

              <View style={styles.earningsRow}>
                <View style={styles.earningItem}>
                  <Text style={styles.earningAmount}>
                    {isProfileLoading
                      ? "-"
                      : formatEarnings(earnings.total_earnings)}
                  </Text>
                  <Text style={styles.earningLabel}>
                    {translate("workerHome.totalEarnings")}
                  </Text>
                </View>
                <View style={styles.verticalDivider} />
                <View style={styles.earningItem}>
                  <Text style={styles.earningAmount}>
                    {isProfileLoading
                      ? "-"
                      : formatEarnings(earnings.last_30_days_earnings)}
                  </Text>
                  <Text style={styles.earningLabel}>
                    {translate("workerHome.last30DaysEarnings")}
                  </Text>
                </View>
                <View style={styles.verticalDivider} />
                <View style={styles.earningItem}>
                  <Text style={styles.earningAmount}>
                    {isProfileLoading
                      ? "-"
                      : formatEarnings(earnings.upcoming_earnings)}
                  </Text>
                  <Text style={styles.earningLabel}>
                    {translate("workerHome.upcomingEarnings")}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.tabsContainer}>
              {["Suggested", "Assigned", "Completed", "Disputed"].map((tab) => {
                const tabLabels = {
                  Suggested: translate("workerHome.suggested"),
                  Assigned: translate("workerHome.assigned"),
                  Completed: translate("workerHome.completed"),
                  Disputed: translate("workerHome.disputed"),
                };
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.tab, activeTab === tab && styles.activeTab]}
                    onPress={() => setActiveTab(tab)}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === tab && styles.activeTabText,
                      ]}
                    >
                      {tabLabels[tab]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {isPending && currentJobs.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary.pink} />
              </View>
            ) : isError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  {translate("workerHome.failedToLoadJobs")}
                </Text>
                <TouchableOpacity style={styles.retryButton} onPress={refetch}>
                  <Text style={styles.retryText}>
                    {translate("workerHome.retry")}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : currentJobs.length === 0 ? (
              <Text style={styles.emptyText}>
                {translate("workerHome.noJobsFound")}
              </Text>
            ) : null}
          </>
        }
        renderItem={({ item: job }) => (
          <View style={{ marginBottom: 15 }}>
            <JobCard
              job={job}
              activeTab={activeTab}
              translate={translate}
              handleBusinessProfilePress={handleBusinessProfilePress}
              handleCheckInOut={handleCheckInOut}
              handleViewDetails={handleViewDetails}
            />
          </View>
        )}
        ListFooterComponent={
          <>
            {isFetchingNextPage && (
              <ActivityIndicator
                size="small"
                color={colors.primary.pink}
                style={{ marginVertical: 16 }}
              />
            )}
            <TouchableOpacity
              style={styles.viewTransactionsButton}
              onPress={() => navigation.navigate("WorkerTransactionHistory")}
            >
              <Text style={styles.viewTransactionsText}>
                {translate("workerHome.viewTransactions")}
              </Text>
            </TouchableOpacity>
          </>
        }
      />

      {/* Handle Worker Modals */}
      {/* <HandleWorkerModals /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.ui.screenBackground,
  },
  headerSafeArea: {
    backgroundColor: colors.primary.pink,
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.primary.pink,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  welcomeText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.ui.notificationBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationIcon: {
    width: 20,
    height: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  earningsCard: {
    backgroundColor: colors.ui.earningsBackground,
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
  },
  earningsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  walletIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  earningsTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: colors.black,
  },
  earningsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  earningItem: {
    flex: 1,
    alignItems: "center",
  },
  earningAmount: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: colors.auth.darkRed,
    marginBottom: 4,
  },
  earningLabel: {
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    color: colors.text.earningsLabel,
    textAlign: "center",
    lineHeight: 14,
  },
  verticalDivider: {
    width: 1,
    height: "80%",
    backgroundColor: colors.ui.divider,
    alignSelf: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: colors.black,
    marginBottom: 15,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 0,
    paddingVertical: 0,
    marginBottom: 20,
    justifyContent: "space-between",
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: {
    flex: 1.2,
    backgroundColor: colors.primary.pink,
  },
  tabText: {
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
    color: colors.text.secondary,
  },
  activeTabText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
  },
  jobsContainer: {
    gap: 15,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  errorContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  errorText: {
    fontFamily: "Poppins_500Medium",
    color: "red",
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: colors.primary.pink,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  retryText: {
    color: colors.white,
    fontFamily: "Poppins_600SemiBold",
  },
  viewTransactionsButton: {
    backgroundColor: colors.primary.pink,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
    marginHorizontal: 10,
    shadowColor: colors.primary.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  viewTransactionsText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 1,
  },
  emptyText: {
    textAlign: "center",
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    width: "100%",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  modalProgress: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: colors.text.secondary,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.inputPinkBackground,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: colors.ui.inputBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.primary,
    paddingVertical: 0, // Remove default padding for Android
  },
  filterButton: {
    marginLeft: 10,
  },
});
