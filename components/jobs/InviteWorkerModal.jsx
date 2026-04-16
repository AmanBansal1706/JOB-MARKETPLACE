import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { colors, fonts } from "../../theme";
import {
  useFetchJobsByStatus,
  useInviteWorkerToJob,
} from "../../services/JobServices";
import { useTranslation } from "../../hooks/useTranslation";
import {
  formatDate,
  formatTime,
  calculateShiftDuration,
} from "../../utils/jobFormatting";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function InviteWorkerModal({
  visible,
  onClose,
  workerId,
  workerName,
}) {
  const { translate } = useTranslation();

  const {
    data: jobsData,
    isPending: loadingJobs,
    refetch,
  } = useFetchJobsByStatus("active");
  const { mutate: inviteWorker, isPending: inviting } = useInviteWorkerToJob();

  const activeJobs = jobsData?.data?.jobs || [];

  const handleInvite = (job) => {
    Alert.alert(
      translate("jobs.inviteConfirmTitle"),
      translate("jobs.inviteConfirmMessage", {
        worker: workerName,
        job: job.title,
      }),
      [
        {
          text: translate("common.cancel"),
          style: "cancel",
        },
        {
          text: translate("common.confirm"),
          onPress: () => executeInvite(job.id),
        },
      ],
    );
  };

  const executeInvite = (jobId) => {
    inviteWorker(
      {
        jobId,
        workerId,
        message: "Please share your bid for this job.",
      },
      {
        onSuccess: () => {
          Alert.alert(
            translate("common.success"),
            translate("jobs.inviteSuccess"),
          );
          onClose();
        },
        onError: (error) => {
          Alert.alert(
            translate("common.error"),
            error.message || translate("jobs.failedToUpdateJob"),
          );
        },
      },
    );
  };

  /**
   * Helper to transform job data for UI, mirroring JobsScreen.jsx
   */
  const getJobUIProps = (apiJob) => {
    const position = apiJob.position || translate("jobs.defaultPosition");

    let startDate = "";
    let startTime = "";
    let rawStartDate = null;
    let rawEndDate = null;

    if (apiJob.schedule_type === "same") {
      rawStartDate = apiJob.start_date;
      rawEndDate = apiJob.end_date;
      startDate = formatDate(apiJob.start_date, "-");
      startTime = formatTime(apiJob.joining_time);
    } else if (apiJob.slots && apiJob.slots.length > 0) {
      const firstSlot = apiJob.slots[0];
      rawStartDate = firstSlot?.start_date;
      rawEndDate = apiJob.slots[apiJob.slots.length - 1]?.end_date;
      startDate = formatDate(firstSlot.start_date, "-");
      startTime = formatTime(firstSlot.joining_time);
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
    const rateText = apiJob.pay_rate
      ? `$${apiJob.pay_rate}${translate("common.perHour")}`
      : apiJob.total_cost
        ? `$${apiJob.total_cost}`
        : "";

    const workersNeeded = `${apiJob.workers_needed} ${translate("jobs.workersNeeded")}`;

    return {
      title: apiJob.title,
      meta,
      rateText,
      workersNeeded,
      startDate,
      startTime,
      accentColor: colors.text3, // Constant for Active jobs in this modal
    };
  };

  const renderJobItem = ({ item }) => {
    const props = getJobUIProps(item);

    return (
      <View style={styles.jobCardWrapper}>
        <View
          style={[
            styles.jobCard,
            { borderLeftWidth: 7, borderLeftColor: props.accentColor },
          ]}
        >
          <View style={styles.jobCardContent}>
            <View style={styles.jobHeaderRow}>
              <Text style={styles.jobTitle} numberOfLines={1}>
                {props.title}
              </Text>
            </View>
            <View style={styles.jobMetaRow}>
              <Text style={styles.jobMeta}>{props.meta}</Text>
              <Text style={[styles.jobRate, { color: props.accentColor }]}>
                {props.rateText}
              </Text>
            </View>
            <View style={styles.workersRow}>
              <Text style={styles.jobMeta}>{props.workersNeeded}</Text>
            </View>
            <Text style={styles.jobMeta}>
              <Text style={styles.jobLabel}>
                {translate("jobs.startDate")}:{" "}
              </Text>
              {props.startDate} • {props.startTime}
            </Text>

            <TouchableOpacity
              onPress={() => handleInvite(item)}
              style={[styles.jobButton, { backgroundColor: props.accentColor }]}
              disabled={inviting}
            >
              <Text style={styles.jobButtonText}>
                {translate("common.invite")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalSafeArea}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>
                  {translate("jobs.inviteToJob")}
                </Text>
                <Text style={styles.headerSubtitle}>
                  {translate("jobs.inviteToJoin", { name: workerName })}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* List Section */}
            {loadingJobs ? (
              <View style={styles.centerSection}>
                <ActivityIndicator size="large" color={colors.tertiary} />
                <Text style={styles.loadingText}>
                  {translate("jobs.fetchingActive")}
                </Text>
              </View>
            ) : activeJobs.length === 0 ? (
              <View style={styles.centerSection}>
                <View style={styles.emptyIconContainer}>
                  <MaterialIcons name="work-off" size={60} color="#DDD" />
                </View>
                <Text style={styles.emptyText}>
                  {translate("jobs.noMatchingJobs")}
                </Text>
                <Text style={styles.emptySubText}>
                  {translate("jobs.checkActivePostings")}
                </Text>
                <TouchableOpacity style={styles.retryButton} onPress={refetch}>
                  <Text style={styles.retryText}>{translate("common.retry")}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={activeJobs}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderJobItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            )}

            {inviting && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.tertiary} />
                <Text style={styles.invitingText}>
                  {translate("jobs.sendingInvitation")}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalSafeArea: {
    backgroundColor: "#F8F9FA",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    maxHeight: SCREEN_HEIGHT * 0.95,
    width: "100%",
  },
  modalContent: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingTop: 25,
    paddingBottom: 15,
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: "#1A1A1A",
  },
  headerSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  // Job Card Styles from JobsScreen.jsx
  jobCardWrapper: {
    width: "100%",
    alignSelf: "center",
    marginBottom: 16,
  },
  jobCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 22,
    position: "relative",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
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
  },
  jobTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textdark || "#000",
  },
  jobMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  jobRate: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  jobMeta: {
    fontFamily: fonts.regular,
    color: colors.text1,
    marginBottom: 3,
    fontSize: 13,
  },
  jobLabel: {
    fontFamily: fonts.semiBold,
  },
  workersRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
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

  centerSection: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: "#666",
    marginTop: 10,
  },
  emptyIconContainer: {
    marginBottom: 15,
  },
  emptyText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: "#333",
  },
  emptySubText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: "#999",
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 30,
  },
  retryButton: {
    marginTop: 15,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.tertiary,
  },
  retryText: {
    fontFamily: fonts.semiBold,
    color: colors.tertiary,
    fontSize: 13,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.85)",
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    zIndex: 100,
  },
  invitingText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.tertiary,
    marginTop: 10,
  },
});
