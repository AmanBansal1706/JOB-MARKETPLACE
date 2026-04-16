import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Image,
  Alert,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, fonts } from "../theme";
import {
  useSelectWorker,
  useFetchJobById,
  useFetchAssignedWorkers,
  useFetchProposals,
} from "../services/JobServices";
import { useTranslation } from "../hooks/useTranslation";
import { useQueryClient } from "@tanstack/react-query";
import {
  formatDisplayDate,
  formatTimeString,
  parseDate,
} from "../utils/dateFormatting";

// ==================== Constants ====================
const YES_COLOR = colors.tertiary || "#18C67A"; // green
const NO_COLOR = "#E74C3C"; // red

// ==================== Helper Functions ====================

/**
 * Format time to HH:MM with AM/PM
 */
const formatTimeWithAMPM = (timeString) => {
  if (!timeString) return "";

  // Check if already has AM/PM
  if (
    timeString.toLowerCase().includes("am") ||
    timeString.toLowerCase().includes("pm")
  ) {
    return timeString;
  }

  return formatTimeString(timeString);
};

/**
 * Format slot time display
 */
const formatSlotTime = (slot) => {
  if (!slot) return "";

  const formattedStartDate = formatDisplayDate(slot.start_date);
  const formattedEndDate = formatDisplayDate(slot.end_date);

  const slotDate = `${formattedStartDate} - ${formattedEndDate}`;

  const joiningTime = formatTimeWithAMPM(slot.joining_time);
  const finishTime = formatTimeWithAMPM(slot.finish_time);

  return `${slotDate} • ${joiningTime} - ${finishTime}`;
};

/**
 * Get assigned slot IDs from workers
 */
const getAssignedSlotIds = (assignedWorkers) => {
  const assignedSlotIds = new Set();
  assignedWorkers.forEach((worker) => {
    if (worker.slot?.id) {
      assignedSlotIds.add(worker.slot.id);
    }
  });
  return assignedSlotIds;
};

/**
 * Check if the current date and time have passed the slot's start date and joining time
 */
const isSlotTimePassed = (slot) => {
  if (!slot || !slot.start_date || !slot.joining_time) {
    return false;
  }

  const slotDateTime = parseDate(slot.start_date);
  const [hours, minutes, seconds] = slot.joining_time.split(":").map(Number);
  slotDateTime.setHours(hours, minutes, seconds || 0);

  const currentDateTime = new Date();
  return currentDateTime > slotDateTime;
};

/**
 * Invalidate relevant job queries
 */
const invalidateJobQueries = (queryClient) => {
  try {
    queryClient.invalidateQueries({ queryKey: ["jobsbystatus"] });
    queryClient.invalidateQueries({ queryKey: ["jobbyid"] });
    queryClient.invalidateQueries({ queryKey: ["assignedworkers"] });
    queryClient.invalidateQueries({ queryKey: ["disputes"] });
  } catch (e) {
    console.warn("Failed to invalidate queries", e);
  }
};

// ==================== Component ====================
export default function SelectDeselectButton({
  status,
  workersNeeded,
  selectedCount,
  proposalId,
  jobId,
  workerId,
  workerName,
  avatar,
  onConfirm,
  isLoading = false,
  buttonStyle = {},
}) {
  const { translate } = useTranslation();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [finishReason, setFinishReason] = useState("");
  const { mutate: selectWorkerMutate, isPending: isSelectingWorker } =
    useSelectWorker();
  const isSelected = status === "selected";
  const isAtCapacity = workersNeeded === selectedCount;

  // Fetch job details to check schedule type and slots
  const { data: jobData, isPending: isLoadingJob } = useFetchJobById(jobId);
  const { data: assignedWorkersData, isPending: isLoadingWorkers } =
    useFetchAssignedWorkers(jobId);
  const { data: proposalsData, isPending: isLoadingProposals } =
    useFetchProposals(jobId);

  const job = jobData?.data;
  const scheduleType = job?.schedule_type;
  const slots = job?.slots || [];
  const assignedWorkers = assignedWorkersData?.data?.assigned_workers || [];
  const assignedSlotIds = getAssignedSlotIds(assignedWorkers);

  // Find the worker's proposal to get their applied slot IDs
  const workerProposal = proposalsData?.proposals?.find(
    (p) => p.worker?.id === workerId,
  );
  const appliedSlotIds = new Set(
    workerProposal?.items?.map((item) => item.slot?.id).filter(Boolean) || [],
  );

  // ==================== Handlers ====================

  const handlePress = () => {
    setSelectedSlot(null); // Reset slot selection when opening modal
    setFinishReason("");
    setModalVisible(true);
  };

  /**
   * Handle selection confirmation
   */
  const handleSelectConfirm = async () => {
    // Validate slot selection for different schedule type
    if (!isAtCapacity && scheduleType === "different" && !selectedSlot) {
      Alert.alert(
        translate("common.error"),
        translate("jobs.pleaseSelectSlot"),
      );
      return;
    }

    setModalVisible(false);

    try {
      selectWorkerMutate(
        { jobId, workerId, slotId: selectedSlot },
        {
          onSuccess: (response) => {
            invalidateJobQueries(queryClient);
            if (onConfirm) {
              onConfirm(proposalId, true);
            }
          },
          onError: (error) => {
            Alert.alert(
              translate("common.error"),
              error.message || translate("jobs.failedToSelectWorker"),
            );
          },
        },
      );
    } catch (error) {
      Alert.alert(
        translate("common.error"),
        translate("errors.unexpectedError"),
      );
    }
  };

  /**
   * Handle deselection confirmation
   */
  const handleDeselectConfirm = async () => {
    // Validate slot selection for different schedule type

    // auto select assigned slot for deselection if schedule type is different

    const assignedWorker = assignedWorkers.find((w) => w.id === workerId);
    const selectedSlotId = assignedWorker?.slot?.id || null;

    if (scheduleType === "different" && !selectedSlotId) {
      Alert.alert(
        translate("common.error"),
        translate("jobs.pleaseSelectSlot"),
      );
      return;
    }

    const isFinish =
      assignedWorker?.slot && isSlotTimePassed(assignedWorker.slot);
    if (isFinish && !finishReason.trim()) {
      Alert.alert(
        translate("common.error"),
        translate("jobs.pleaseProvideFinishReason"),
      );
      return;
    }
    setModalVisible(false);

    try {
      selectWorkerMutate(
        {
          jobId,
          workerId,
          slotId: selectedSlotId,
          finishReason: isFinish ? finishReason.trim() : undefined,
        },
        {
          onSuccess: (response) => {
            invalidateJobQueries(queryClient);
            if (onConfirm) {
              onConfirm(proposalId, true);
            }
          },
          onError: (error) => {
            Alert.alert(
              translate("common.error"),
              error.message || translate("jobs.failedToDeselectWorker"),
            );
          },
        },
      );
    } catch (error) {
      Alert.alert(
        translate("common.error"),
        translate("errors.unexpectedError"),
      );
    }
  };

  // ==================== Render Methods ====================

  /**
   * Render slot selection UI
   */
  const renderSlotSelection = () => {
    if (scheduleType !== "different" || slots.length === 0) {
      return null;
    }

    return (
      <View style={styles.slotContainer}>
        <Text style={styles.slotLabel}>{translate("jobs.selectSlot")}</Text>
        {slots
          .filter((slot) => appliedSlotIds.has(slot.id))
          .map((slot) => {
            const isSlotAssigned = assignedSlotIds.has(slot.id);
            const isSlotSelected = selectedSlot === slot.id;
            const hasStarted = isSlotTimePassed(slot);
            const isSlotDisabled = isSlotAssigned || hasStarted;

            return (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.slotItem,
                  isSlotSelected && styles.slotItemSelected,
                  isSlotDisabled && styles.slotItemDisabled,
                ]}
                onPress={() => !isSlotDisabled && setSelectedSlot(slot.id)}
                disabled={isSlotDisabled}
                activeOpacity={0.7}
              >
                {/* {appliedSlotIds.has(slot.id) && (
                  <View style={styles.appliedCornerBadge}>
                    <MaterialCommunityIcons
                      name="star"
                      size={16}
                      color={colors.tertiary}
                    />
                  </View>
                )} */}
                <View style={styles.slotInfo}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        isSlotDisabled && styles.slotTextDisabled,
                        { flex: 1 },
                      ]}
                    >
                      {formatSlotTime(slot)}
                    </Text>
                  </View>
                </View>
                {isSlotSelected && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
                {isSlotAssigned && (
                  <View style={styles.fullBadge}>
                    <Text style={styles.fullBadgeText}>
                      {translate("jobs.assigned")}
                    </Text>
                  </View>
                )}
                {hasStarted && !isSlotAssigned && (
                  <View
                    style={[styles.fullBadge, { backgroundColor: "#F39C12" }]}
                  >
                    <Text style={styles.fullBadgeText}>
                      {translate("jobs.started") || "Started"}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
      </View>
    );
  };

  /**
   * Render selection confirmation modal content
   */
  const renderSelectionContent = () => {
    return (
      <>
        <Text style={[styles.modalTitle, { color: YES_COLOR }]}>
          {translate("jobs.confirmSelection")}
        </Text>
        <Text style={styles.modalMessage}>
          {translate("jobs.confirmSelectionMessage", { name: workerName })}
        </Text>

        {renderSlotSelection()}

        <View style={styles.modalButtonRowCentered}>
          <TouchableOpacity
            style={styles.yesButton}
            onPress={handleSelectConfirm}
            disabled={isLoading || isSelectingWorker}
            activeOpacity={0.85}
          >
            {isLoading || isSelectingWorker ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.yesText}>{translate("common.yes")}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.noButton}
            onPress={() => setModalVisible(false)}
            activeOpacity={0.85}
          >
            <Text style={styles.noText}>{translate("common.no")}</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  /**
   * Render deselection confirmation modal content
   */
  const renderDeselectionContent = () => {
    const assignedWorker = assignedWorkers.find((w) => w.id === workerId);
    const assignedSlot = assignedWorker?.slot;
    const isFinish = assignedSlot && isSlotTimePassed(assignedSlot);
    const isFinishReasonMissing = isFinish && !finishReason.trim();

    return (
      <>
        <Text style={[styles.modalTitle, { color: NO_COLOR }]}>
          {isFinish
            ? translate("jobs.confirmFinish")
            : translate("jobs.confirmDeselection")}
        </Text>
        <Text style={styles.modalMessage}>
          {isFinish
            ? translate("jobs.confirmFinishMessage", { name: workerName })
            : translate("jobs.confirmDeselectionMessage", { name: workerName })}
        </Text>

        {isFinish && (
          <View style={styles.finishReasonContainer}>
            <Text style={styles.finishReasonLabel}>
              {translate("jobs.finishReasonLabel")}
            </Text>
            <TextInput
              value={finishReason}
              onChangeText={setFinishReason}
              placeholder={translate("jobs.finishReasonPlaceholder")}
              style={styles.finishReasonInput}
              multiline
              textAlignVertical="top"
            />
            {isFinishReasonMissing && (
              <Text style={styles.finishReasonError}>
                {translate("jobs.finishReasonRequired")}
              </Text>
            )}
          </View>
        )}
        <View style={styles.modalButtonRowCentered}>
          <TouchableOpacity
            style={styles.yesButton}
            onPress={handleDeselectConfirm}
            disabled={isLoading || isSelectingWorker || isFinishReasonMissing}
            activeOpacity={0.85}
          >
            {isLoading || isSelectingWorker ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.yesText}>{translate("common.yes")}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.noButton}
            onPress={() => setModalVisible(false)}
            activeOpacity={0.85}
          >
            <Text style={styles.noText}>{translate("common.no")}</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  /**
   * Render at capacity modal content
   */
  const renderAtCapacityContent = () => {
    return (
      <>
        <Text style={[styles.modalTitle, { color: YES_COLOR }]}>
          {translate("jobs.workersLimitReached")}
        </Text>
        <Text style={styles.modalMessage}>
          {translate("jobs.workersLimitReachedMessage", {
            name: workerName,
            selectedCount,
            workersNeeded,
          })}
        </Text>
        <View style={styles.modalButtonRowCentered}>
          <TouchableOpacity
            style={styles.okButton}
            onPress={() => setModalVisible(false)}
            activeOpacity={0.85}
          >
            <Text style={styles.okText}>{translate("common.ok")}</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  /**
   * Get modal content based on state
   */
  const getModalContent = () => {
    if (isSelected) {
      return renderDeselectionContent();
    }

    if (!isSelected && isAtCapacity) {
      return renderAtCapacityContent();
    }

    return renderSelectionContent();
  };

  // ==================== Main Render ====================

  const combinedLoading =
    isLoading || isSelectingWorker || isLoadingJob || isLoadingWorkers;
  const buttonDisabled = combinedLoading;
  const buttonColor = isSelected ? NO_COLOR : YES_COLOR;

  // Merge button styles properly - remove flex when custom width is provided
  const finalButtonStyle = {
    ...styles.button,
    ...(buttonStyle?.width && { flex: 0 }), // Remove flex if custom width provided
    backgroundColor: buttonColor,
    ...buttonStyle,
  };

  const assignedWorker = assignedWorkers.find((w) => w.id === workerId);
  const assignedSlot = assignedWorker?.slot;

  // Determine if we should show "Finish" instead of "Deselect"
  const isFinishMode =
    isSelected && assignedSlot && isSlotTimePassed(assignedSlot);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          finalButtonStyle,
          {
            opacity: buttonDisabled || status == "completed" ? 0.6 : 1,
          },
        ]}
        onPress={handlePress}
        disabled={buttonDisabled || status == "completed"}
      >
        {combinedLoading ? (
          <ActivityIndicator size="small" color={colors.text} />
        ) : (
          <Text style={[styles.buttonText, { color: colors.text }]}>
            {!isSelected
              ? translate("jobs.select")
              : isFinishMode
                ? translate("jobs.finish")
                : translate("jobs.deselect")}
          </Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Close button top-right */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.closeX}>✖</Text>
            </TouchableOpacity>

            {/* Avatar */}
            {avatar && <Image source={avatar} style={styles.avatar} />}

            {/* Worker Name */}
            {workerName && <Text style={styles.avatarName}>{workerName}</Text>}

            {/* Modal Body */}
            <View style={styles.modalBody}>{getModalContent()}</View>
          </View>
        </View>
      </Modal>
    </>
  );
}

// ==================== Styles ====================
const styles = StyleSheet.create({
  button: {
    flex: 1,
    borderRadius: 10,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: colors.text,
    borderRadius: 20,
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#E74C3C",
    alignItems: "center",
    justifyContent: "center",
  },
  closeX: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginTop: -40,
    borderWidth: 4,
    borderColor: colors.text,
  },
  avatarName: {
    marginTop: 8,
    color: colors.textdark,
    fontFamily: fonts.semiBold,
    fontSize: 16,
  },
  modalBody: {
    width: "100%",
    marginTop: 8,
    alignItems: "center",
  },
  modalTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    textAlign: "center",
    marginBottom: 12,
  },
  modalMessage: {
    color: colors.text1,
    fontFamily: fonts.regular,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 18,
  },
  finishReasonContainer: {
    width: "100%",
    marginBottom: 16,
  },
  finishReasonLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textdark,
    marginBottom: 8,
  },
  finishReasonInput: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.bg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textdark,
    backgroundColor: colors.bbg6,
  },
  finishReasonError: {
    marginTop: 6,
    color: "#E74C3C",
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  modalButtonRowCentered: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    width: "100%",
  },
  yesButton: {
    flex: 1,
    backgroundColor: colors.tertiary || "#18C67A",
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  noButton: {
    flex: 1,
    backgroundColor: "#E74C3C",
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  okButton: {
    flex: 1,
    backgroundColor: colors.tertiary || "#18C67A",
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  yesText: { color: colors.text, fontFamily: fonts.semiBold },
  noText: { color: colors.text, fontFamily: fonts.semiBold },
  okText: { color: colors.text, fontFamily: fonts.semiBold },
  slotContainer: {
    width: "100%",
    marginBottom: 16,
  },
  slotLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textdark,
    marginBottom: 12,
  },
  slotItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.bbg6,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  slotItemSelected: {
    borderColor: colors.tertiary || "#18C67A",
    backgroundColor: "#E8F9F0",
  },
  slotItemDisabled: {
    opacity: 0.5,
    backgroundColor: "#F5F5F5",
  },
  slotInfo: {
    flex: 1,
  },
  slotText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textdark,
  },
  slotTextDisabled: {
    color: colors.text1,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.tertiary || "#18C67A",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  checkmarkText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "bold",
  },
  fullBadge: {
    backgroundColor: "#E74C3C",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  fullBadgeText: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 10,
  },
  appliedCornerBadge: {
    position: "absolute",
    top: -2,
    left: -2,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 2,
    zIndex: 10,
    // elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
});
