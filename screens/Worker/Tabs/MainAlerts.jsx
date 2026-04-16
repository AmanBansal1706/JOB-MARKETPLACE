import { Feather } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useMemo, useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../../theme/worker/colors";
import VerificationCard from "../../../components/workerModals/cards/VerificationCard";
import CashConfirmationCard from "../../../components/workerModals/cards/CashConfirmationCard";
import JobCompletedCard from "../../../components/workerModals/cards/JobCompletedCard";
import { useFetchWorkerProfile } from "../../../services/WorkerProfileServices";
import { useConfirmCashReceived } from "../../../services/WorkerJobServices";
import { useTranslation } from "../../../hooks/useTranslation";

// Alert types in display order
const ALERT_TYPES = {
  VERIFICATION: "verification",
  CASH_CONFIRMATION: "cash_confirmation",
  JOB_COMPLETED: "job_completed",
};

export default function MainAlerts() {
  const navigation = useNavigation();
  const { translate } = useTranslation();
  const [dismissedIds, setDismissedIds] = useState([]);

  const {
    data: workerProfile,
    isPending: isProfileLoading,
    refetch: refetchProfile,
  } = useFetchWorkerProfile();

  const { mutate: confirmCash, isPending: isConfirmingCash } =
    useConfirmCashReceived();

  // Refetch profile whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetchProfile();
      // Reset dismissals so user sees all alerts again when returning to screen
      setDismissedIds([]);
    }, [refetchProfile]),
  );

  // Build a flat list of all alerts from profile data.
  // Order: verification first, then per job_id: job_completed → cash_confirmation.
  const alertsList = useMemo(() => {
    if (isProfileLoading || !workerProfile) return [];

    const alerts = [];

    // 1. Verification alert (always first)
    const verificationStatus =
      workerProfile?.verification_status || "incomplete";
    if (
      ["incomplete", "rejected", "under_review", "permanent_rejected"].includes(
        verificationStatus,
      )
    ) {
      alerts.push({
        type: ALERT_TYPES.VERIFICATION,
        data: { verificationStatus },
        id: `verification-${verificationStatus}`,
      });
    }

    // 2. Per-job alerts: job_completed then cash_confirmation for each job_id
    const completedMap = new Map(
      (workerProfile?.show_popup?.job_completed?.jobs || [])
        .filter((job) => job.show_pop_up_job_completion)
        .map((job) => [job.job_id, job]),
    );

    const cashMap = new Map(
      (workerProfile?.show_popup?.cash_received_confirmation?.jobs || [])
        .filter((job) => job.show_cash_confirmation_popup)
        .map((job) => [job.job_id, job]),
    );

    const allJobIds = [...new Set([...completedMap.keys(), ...cashMap.keys()])];

    for (const jobId of allJobIds) {
      if (completedMap.has(jobId)) {
        alerts.push({
          type: ALERT_TYPES.JOB_COMPLETED,
          data: completedMap.get(jobId),
          id: `completed-${jobId}`,
        });
      }
      if (cashMap.has(jobId)) {
        alerts.push({
          type: ALERT_TYPES.CASH_CONFIRMATION,
          data: cashMap.get(jobId),
          id: `cash-${jobId}`,
        });
      }
    }

    return alerts;
  }, [isProfileLoading, workerProfile]);

  // Filter out alerts that have been dismissed in the current session
  const visibleAlerts = useMemo(() => {
    return alertsList.filter((alert) => !dismissedIds.includes(alert.id));
  }, [alertsList, dismissedIds]);

  // --- Verification handlers ---
  const handleVerificationAction = useCallback(
    (verificationStatus) => {
      if (verificationStatus === "permanent_rejected") {
        navigation.navigate("WorkerSupport");
      } else if (
        verificationStatus === "incomplete" ||
        verificationStatus === "rejected"
      ) {
        navigation.navigate("WorkerProfileSetup");
      }
      // "under_review" → dismiss the alert when user taps action
      if (verificationStatus === "under_review") {
        setDismissedIds((prev) => [
          ...prev,
          `verification-${verificationStatus}`,
        ]);
      }
    },
    [navigation],
  );

  const handleVerificationSkip = useCallback(() => {
    // Dismiss verification alert
    const id = `verification-${workerProfile?.verification_status || "incomplete"}`;
    setDismissedIds((prev) => [...prev, id]);
  }, [workerProfile?.verification_status]);

  // --- Cash confirmation handlers ---
  const handleCashConfirm = useCallback(
    (jobId) => {
      // Block if a job-completed (rating) alert exists for the same job
      const ratingPending = visibleAlerts.some(
        (a) => a.type === ALERT_TYPES.JOB_COMPLETED && a.data.job_id === jobId,
      );
      if (ratingPending) {
        Alert.alert(
          translate("workerAlerts.ratingRequiredTitle"),
          translate("workerAlerts.ratingRequiredMessage"),
        );
        return;
      }
      confirmCash(
        { jobId, isReceived: true },
        {
          onSuccess: () => {
            console.log("Cash confirmed for job:", jobId);
            // Remove the cash alert locally for immediate UX
            setDismissedIds((prev) => [...prev, `cash-${jobId}`]);
            refetchProfile(); // Refresh profile to update alerts list
          },
          onError: (error) => {
            console.error("Failed to confirm cash:", error);
          },
        },
      );
    },
    [confirmCash, refetchProfile, visibleAlerts, translate],
  );

  const handleCashSkip = useCallback(
    (jobId) => {
      // Block if a job-completed (rating) alert exists for the same job
      const ratingPending = visibleAlerts.some(
        (a) => a.type === ALERT_TYPES.JOB_COMPLETED && a.data.job_id === jobId,
      );
      if (ratingPending) {
        Alert.alert(
          translate("workerAlerts.ratingRequiredTitle"),
          translate("workerAlerts.ratingRequiredMessage"),
        );
        return;
      }
      confirmCash(
        { jobId, isReceived: false },
        {
          onSuccess: () => {
            // Remove the cash alert locally for immediate UX
            setDismissedIds((prev) => [...prev, `cash-${jobId}`]);
            refetchProfile();
          },
          onError: (error) => {
            console.error("Failed to decline cash:", error);
          },
        },
      );
    },
    [confirmCash, refetchProfile, visibleAlerts, translate],
  );

  // --- Job completed handlers ---
  const handleJobRate = useCallback(
    (jobData) => {
      navigation.navigate("WorkerJobCompletion", {
        title: jobData.job_title,
        jobId: jobData.job_id,
      });
    },
    [navigation],
  );

  const handleJobSkip = useCallback((jobId) => {
    // Dismiss job completion alert for this job
    setDismissedIds((prev) => [...prev, `completed-${jobId}`]);
  }, []);

  // --- Render alert cards ---
  const renderAlertCard = (alert) => {
    switch (alert.type) {
      case ALERT_TYPES.VERIFICATION:
        return (
          <View key={alert.id} style={styles.cardContainer}>
            <VerificationCard
              verificationStatus={alert.data.verificationStatus}
              onAction={() =>
                handleVerificationAction(alert.data.verificationStatus)
              }
              onSkip={handleVerificationSkip}
            />
          </View>
        );

      case ALERT_TYPES.CASH_CONFIRMATION:
        return (
          <View key={alert.id} style={styles.cardContainer}>
            <CashConfirmationCard
              jobData={alert.data}
              onConfirm={handleCashConfirm}
              onSkip={() => handleCashSkip(alert.data.job_id)}
            />
          </View>
        );

      case ALERT_TYPES.JOB_COMPLETED:
        return (
          <View key={alert.id} style={styles.cardContainer}>
            <JobCompletedCard
              jobData={alert.data}
              onRate={handleJobRate}
              onSkip={() => handleJobSkip(alert.data.job_id)}
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" backgroundColor={colors.primary.pink} />

      {/* Header */}
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonContainer}
          >
            <Feather name="arrow-left" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {translate("workerAlerts.alerts")}
          </Text>
        </View>
      </SafeAreaView>

      {isProfileLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.pink} />
          <Text style={styles.loadingText}>
            {translate("workerAlerts.loadingAlerts")}
          </Text>
        </View>
      ) : visibleAlerts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather
            name="bell-off"
            size={64}
            color={colors.text.secondary}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>
            {translate("workerAlerts.noAlerts")}
          </Text>
          <Text style={styles.emptySubtitle}>
            {translate("workerAlerts.allCaughtUp")}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          refreshControl={
            <RefreshControl
              refreshing={isProfileLoading}
              onRefresh={refetchProfile}
              tintColor={colors.primary.pink}
            />
          }
        >
          {visibleAlerts.map((alert) => renderAlertCard(alert))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.ui.screenBackground, // Pinkish background
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
  backButtonContainer: {
    padding: 3,
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
    marginLeft: 15,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  cardContainer: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
});
