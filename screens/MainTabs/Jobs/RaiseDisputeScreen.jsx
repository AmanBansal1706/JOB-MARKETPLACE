import { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { colors, fonts, fontSizes } from "../../../theme";
import { CommonHeader, ScreenWrapper } from "../../../components/common";
import { useTranslation } from "../../../hooks/useTranslation";
import ElevatedFormCard from "../../../components/ElevatedFormCard";
import Dropdown from "../../../components/Dropdown";
import UploadDropZone from "../../../components/UploadDropZone";
import CustomButton from "../../../components/button";
import {
  useRaiseDispute,
  useFetchProposedSlots,
} from "../../../services/JobServices";
import { useQueryClient } from "@tanstack/react-query";
import { formatDisplayDate } from "../../../utils/dateFormatting";

export default function RaiseDisputeScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { translate } = useTranslation();
  const { mutateAsync: submitDisputeAsync } = useRaiseDispute();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [selectedProposalId, setSelectedProposalId] = useState(null);
  const [workerDetails, setWorkerDetails] = useState({});
  const [submittedWorkerIds, setSubmittedWorkerIds] = useState([]);

  const jobId = route.params?.jobId;
  const { data: proposedSlotsData, isPending: isLoadingSlots } =
    useFetchProposedSlots(jobId);

  const proposedSlots = useMemo(
    () => proposedSlotsData?.data || [],
    [proposedSlotsData],
  );

  const assignedWorkers = useMemo(() => {
    if (proposedSlots.length > 0) {
      // Use worker list from proposed slots
      const workersMap = new Map();
      proposedSlots.forEach((ps) => {
        if (!workersMap.has(ps.worker_id)) {
          workersMap.set(ps.worker_id, ps.worker_name);
        }
      });
      return Array.from(workersMap.entries()).map(([id, name]) => ({
        label: name,
        value: id,
      }));
    }

    const arr = route.params?.workers ?? [];
    return arr.map((w) => ({
      label: w.name ?? String(w),
      value: w.id ?? w.name ?? String(w),
    }));
  }, [route.params, proposedSlots]);

  const availableSlotsForSelectedWorker = useMemo(() => {
    if (!selectedWorkerId) return [];
    return proposedSlots
      .filter((ps) => ps.worker_id === selectedWorkerId)
      .map((ps) => {
        const slot = ps.slot || {};
        const dateStr = slot.start_date ? formatDisplayDate(slot.start_date) : "N/A";
        const endDateStr = slot.end_date ? formatDisplayDate(slot.end_date) : "N/A";
        const timeStr = slot.joining_time && slot.finish_time 
          ? `${slot.joining_time} - ${slot.finish_time}`
          : "";
        
        const breakStr = slot.break_time ? `| Break: ${slot.break_time}m` : "";
        
        return {
          label: `${dateStr} to ${endDateStr} ${timeStr ? `| ${timeStr}` : ""} ${breakStr} (${ps.status})`,
          value: ps.proposal_id,
          status: ps.status,
          slot: ps.slot,
        };
      });
  }, [proposedSlots, selectedWorkerId]);

  // Combined available workers list for dropdown
  const filteredAvailableWorkers = useMemo(
    () =>
      assignedWorkers.filter(
        (worker) => !submittedWorkerIds.includes(worker.value),
      ),
    [assignedWorkers, submittedWorkerIds],
  );

  const getInitialWorkerDetail = () => ({
    title: "",
    reason: null,
    otherReason: "",
    desc: "",
    evidence: [],
  });

  const reasons = [
    { label: translate("jobs.poorPerformance"), value: "poor_performance" },
    { label: translate("jobs.noShow"), value: "no_show" },
    { label: translate("jobs.leftEarly"), value: "left_early" },
    { label: translate("jobs.other"), value: "other" },
  ];

  const updateWorkerDetail = (workerId, field, value) => {
    if (!workerId) return;
    setWorkerDetails((prev) => ({
      ...prev,
      [workerId]: {
        ...(prev[workerId] || getInitialWorkerDetail()),
        [field]: value,
      },
    }));
  };

  const validateForm = () => {
    if (!jobId) {
      Alert.alert(translate("common.error"), translate("jobs.jobIdMissing"));
      return false;
    }
    if (!selectedWorkerId) {
      Alert.alert(
        translate("jobs.selectWorkers"),
        translate("jobs.pleaseSelectWorker"),
      );
      return false;
    }

    if (availableSlotsForSelectedWorker.length > 0 && !selectedProposalId) {
      Alert.alert(
        translate("jobs.selectSlots") || "Select Slot",
        translate("jobs.pleaseSelectSlot") || "Please select a slot",
      );
      return false;
    }

    const details = workerDetails[selectedWorkerId] || {};
    const workerName =
      assignedWorkers.find((w) => w.value === selectedWorkerId)?.label ||
      "Worker";

    if (!details.title?.trim()) {
      Alert.alert(
        translate("jobs.enterTitle"),
        translate("jobs.pleaseEnterDisputeTitle"),
      );
      return false;
    }

    if (!details.reason) {
      Alert.alert(
        translate("jobs.selectReason"),
        `${translate("jobs.selectReason")} for ${workerName}`,
      );
      return false;
    }
    if (details.reason === "other" && !details.otherReason?.trim()) {
      Alert.alert(
        translate("jobs.selectReason"),
        `Please specify the reason for dispute for ${workerName}.`,
      );
      return false;
    }
    if (!details.desc?.trim()) {
      Alert.alert(
        translate("jobs.addDescription"),
        `${translate("jobs.pleaseWriteDescription")} for ${workerName}`,
      );
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validateForm()) return;

    if (!selectedWorkerId) return;

    setIsSubmitting(true);
    try {
      const details = workerDetails[selectedWorkerId];
      if (!details) {
        throw new Error("Missing details for selected worker.");
      }

      const formData = new FormData();
      formData.append("job_id", jobId);
      formData.append("worker_ids[]", selectedWorkerId);
      if (selectedProposalId) {
        formData.append("proposal_ids[]", selectedProposalId);
      }
      formData.append("title", details.title);
      formData.append(
        "reason",
        details.reason === "other" ? details.otherReason : details.reason,
      );
      formData.append("description", details.desc);

      if (details.evidence && details.evidence.length > 0) {
        details.evidence.forEach((file, index) => {
          const fileName =
            file.fileName || file.name || `evidence_${Date.now()}_${index}.jpg`;
          formData.append("evidence_files[]", {
            uri: file.uri,
            name: fileName,
            type: "image/jpeg",
          });
        });
      }

      await submitDisputeAsync(formData);

      const workerLabel =
        assignedWorkers.find((w) => w.value === selectedWorkerId)?.label ||
        "Worker";

      // Add the submitted worker to the list
      setSubmittedWorkerIds((prev) => [...prev, selectedWorkerId]);

      // Check if there are more workers available after adding this one
      const remainingWorkers = assignedWorkers.filter(
        (w) => ![...submittedWorkerIds, selectedWorkerId].includes(w.value),
      );

      const alertButtons =
        remainingWorkers.length > 0
          ? [
              {
                text:
                  translate("jobs.disputeAnotherWorker") ||
                  "Dispute Another Worker?",
                onPress: () => {
                  // Clear selection so user can pick another worker
                  setSelectedWorkerId(null);
                  setSelectedProposalId(null);
                  setWorkerDetails({});
                },
              },
              {
                text: translate("jobs.finish") || "Finish",
                onPress: () => {
                  queryClient.invalidateQueries({ queryKey: ["jobsbystatus"] });
                  navigation.reset({
                    index: 0,
                    routes: [
                      {
                        name: "MainTabs",
                        params: {
                          screen: "Jobs",
                          params: { active: "Disputed" },
                        },
                      },
                    ],
                  });
                },
              },
            ]
          : [
              {
                text: translate("jobs.finish") || "Finish",
                onPress: () => {
                  queryClient.invalidateQueries({ queryKey: ["jobsbystatus"] });
                  navigation.reset({
                    index: 0,
                    routes: [
                      {
                        name: "MainTabs",
                        params: {
                          screen: "Jobs",
                          params: { active: "Disputed" },
                        },
                      },
                    ],
                  });
                },
              },
            ];

      Alert.alert(
        translate("common.success"),
        `${translate("jobs.disputeSubmittedSuccess")} ${workerLabel}`,
        alertButtons,
      );
    } catch (err) {
      console.error("Submit dispute error:", err);
      Alert.alert(
        translate("common.error"),
        err?.message || translate("jobs.failedToSubmitDispute"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const section = (icon, label) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionIcon}>{icon}</Text>
      <Text style={styles.sectionTitle}>{label}</Text>
    </View>
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setRefreshing(false);
    }
  };

  const currentWorkerId = selectedWorkerId;
  const currentWorker = assignedWorkers.find(
    (w) => w.value === currentWorkerId,
  );
  const currentWorkerDetails = currentWorkerId
    ? workerDetails[currentWorkerId] || getInitialWorkerDetail()
    : getInitialWorkerDetail();
  const currentWorkerName = currentWorker?.label || currentWorkerId || "";
  const submitButtonLabel = translate("jobs.submitDispute");

  return (
    <ScreenWrapper backgroundColor="#E8F5F0">
      <CommonHeader
        title={translate("jobs.raiseDispute")}
        onBackPress={() => navigation.goBack?.()}
        backgroundColor={colors.bg1}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
        <View style={styles.container}>
          <ElevatedFormCard
            width={Dimensions.get("window").width - 32}
            radius={16}
            leftAccentWidth={4}
            leftAccentColor={colors.primary}
            contentStyle={{ padding: 20 }}
          >
            {/* Select Workers */}
            {section("👤", translate("jobs.selectWorkers"))}

            <Dropdown
              value={selectedWorkerId}
              onChange={(val) => {
                setSelectedWorkerId(val);
                setSelectedProposalId(null);
              }}
              options={filteredAvailableWorkers}
              placeholder={translate("jobs.selectWorker")}
              style={styles.input}
              colorsOverride={{
                bg: "#F0F7F4",
                border: "#D4E8E0",
                caret: colors.tertiary,
              }}
              disabled={isSubmitting}
            />

            {/* Select Slot */}
            {selectedWorkerId && availableSlotsForSelectedWorker.length > 0 && (
              <>
                {section("🕒", translate("jobs.selectSlots") || "Select Slot")}
                <Dropdown
                  value={selectedProposalId}
                  onChange={(val) => setSelectedProposalId(val)}
                  options={availableSlotsForSelectedWorker}
                  placeholder={
                    translate("jobs.selectSlot") || "Select a specific slot"
                  }
                  style={styles.input}
                  colorsOverride={{
                    bg: "#F0F7F4",
                    border: "#D4E8E0",
                    caret: colors.tertiary,
                  }}
                  disabled={isSubmitting}
                />
              </>
            )}

            {/* Dispute Title - Per Worker */}
            {section("✍️", translate("jobs.disputeTitle"))}
            <TextInput
              value={currentWorkerDetails?.title || ""}
              onChangeText={(val) =>
                updateWorkerDetail(selectedWorkerId, "title", val)
              }
              placeholder={translate("jobs.enterDisputeTitle")}
              placeholderTextColor={colors.text5}
              editable={!isSubmitting && !!selectedWorkerId}
              style={[styles.input, styles.textInput]}
            />

            {/* Reasons Section */}
            {section("⚖️", translate("jobs.reasonForDispute"))}
            <View style={styles.workerInputGroup}>
              <Dropdown
                value={currentWorkerDetails?.reason}
                onChange={(val) =>
                  updateWorkerDetail(selectedWorkerId, "reason", val)
                }
                options={reasons}
                placeholder={translate("jobs.selectReason")}
                style={styles.input}
                colorsOverride={{
                  bg: "#F0F7F4",
                  border: "#D4E8E0",
                  caret: colors.tertiary,
                }}
                disabled={!selectedWorkerId || isSubmitting}
              />
              {currentWorkerDetails?.reason === "other" && (
                <TextInput
                  value={currentWorkerDetails?.otherReason}
                  onChangeText={(val) =>
                    updateWorkerDetail(selectedWorkerId, "otherReason", val)
                  }
                  placeholder="Specify other reason..."
                  placeholderTextColor={colors.text5}
                  editable={!isSubmitting && !!selectedWorkerId}
                  style={[styles.input, styles.textInput, { marginTop: -8 }]}
                />
              )}
            </View>

            {/* Descriptions Section */}
            {section("📝", translate("jobs.disputeDescription"))}
            <View style={styles.workerInputGroup}>
              <TextInput
                value={currentWorkerDetails?.desc || ""}
                onChangeText={(val) =>
                  updateWorkerDetail(selectedWorkerId, "desc", val)
                }
                placeholder={translate("jobs.writeDetailedDescription")}
                placeholderTextColor={colors.text5}
                editable={!isSubmitting && !!selectedWorkerId}
                multiline
                maxLength={500}
                style={[styles.input, styles.textArea]}
              />
              <Text style={styles.charCount}>
                {(currentWorkerDetails?.desc || "").length}/500
              </Text>
            </View>

            {/* Evidences Section */}
            {section("📎", translate("jobs.uploadEvidence"))}
            <View style={styles.workerInputGroup}>
              <UploadDropZone
                value={currentWorkerDetails?.evidence || []}
                onChange={(val) =>
                  updateWorkerDetail(selectedWorkerId, "evidence", val)
                }
                disabled={!selectedWorkerId || isSubmitting}
                maxFiles={3}
              />
            </View>
          </ElevatedFormCard>

          {/* Submit Button */}
          <CustomButton
            title={
              isSubmitting ? translate("jobs.submitting") : submitButtonLabel
            }
            onPress={submit}
            disabled={isSubmitting || !currentWorkerId}
            style={[
              styles.submitBtn,
              (isSubmitting || !currentWorkerId) && styles.submitBtnDisabled,
            ]}
            textStyle={styles.submitText}
          />

          {isSubmitting && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.tertiary} />
              <Text style={styles.loadingText}>
                {translate("jobs.submittingDispute")}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 16,
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 16,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    marginRight: 10,
    fontSize: 24,
    lineHeight: 28,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.md,
    color: colors.textdark,
    letterSpacing: 0.3,
  },
  workerInputGroup: {
    marginBottom: 12,
  },
  workerInputLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.xs,
    color: colors.text5,
    marginBottom: 6,
    marginLeft: 4,
  },
  workerNameHighlight: {
    color: colors.tertiary,
    fontFamily: fonts.semiBold,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#D4E8E0",
    backgroundColor: "#F0F7F4",
    paddingHorizontal: 16,
    marginBottom: 16,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
  },
  textInput: {
    color: colors.textdark,
    textAlignVertical: "center",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  charCount: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.xs,
    color: colors.text5,
    marginTop: -12,
    marginBottom: 12,
    alignSelf: "flex-end",
    paddingRight: 4,
  },
  submitBtn: {
    marginTop: 24,
    alignSelf: "center",
    width: Dimensions.get("window").width - 32,
    maxWidth: 360,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginBottom: 50,
  },
  submitBtnDisabled: {
    backgroundColor: "#7D9B91",
    opacity: 0.7,
  },
  submitText: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.md,
    letterSpacing: 0.5,
    fontWeight: "600",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 12,
    zIndex: 10,
  },
  loadingText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.sm,
    color: colors.tertiary,
    marginTop: 12,
  },
  workerCheckboxRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  workerLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textdark,
    marginLeft: 12,
    flex: 1,
  },
  selectedSummary: {
    backgroundColor: "#E8F5F0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.tertiary,
  },
  selectedLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.sm,
    color: colors.tertiary,
  },
  workerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  workerProgressText: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.xs,
    color: colors.text5,
  },
  noWorkerText: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.text5,
    marginTop: 8,
    textAlign: "center",
  },
});
