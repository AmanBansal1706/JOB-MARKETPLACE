import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import successApplied from "../../../assets/worker-images/jobapplied.png";
import colors from "../../../theme/worker/colors";
import { useSubmitJobProposal } from "../../../services/WorkerJobServices";
import { useTranslation } from "../../../hooks/useTranslation";

export default function ApplyJobScreen() {
  const navigation = useNavigation();
  const { translate } = useTranslation();
  const { jobId, title, selectedSlots = [] } = useRoute().params || {};
  const [coverMessage, setCoverMessage] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResults, setSubmissionResults] = useState([]);
  const [submissionProgress, setSubmissionProgress] = useState({
    current: 0,
    total: 0,
  });

  const { mutate: submitProposal } = useSubmitJobProposal();

  const handleApply = async () => {
    if (!coverMessage.trim()) {
      alert(translate("workerApply.enterCoverMessageAlert"));
      return;
    }

    if (selectedSlots.length === 0) {
      alert(translate("workerApply.noSlotsSelected"));
      return;
    }

    setIsSubmitting(true);
    setSubmissionProgress({ current: 0, total: selectedSlots.length });

    const results = [];

    // Submit proposals for each slot sequentially
    for (let i = 0; i < selectedSlots.length; i++) {
      const slot = selectedSlots[i];
      const slotId = slot.id;
      setSubmissionProgress({ current: i + 1, total: selectedSlots.length });

      try {
        await new Promise((resolve, reject) => {
          submitProposal(
            {
              jobId: jobId,
              proposalData: {
                slot_id: slotId,
                cover_letter: coverMessage,
              },
            },
            {
              onSuccess: () => {
                results.push({
                  slot,
                  status: "success",
                  message: translate("workerApply.successfullyApplied"),
                });
                resolve();
              },
              onError: (error) => {
                console.error(
                  `Failed to submit proposal for slot ${slotId}:`,
                  error,
                );
                results.push({
                  slot,
                  status: "error",
                  message: error.message || translate("workerApply.failedSubmitProposals"),
                });
                // We reject but catch it to continue the loop
                reject(error);
              },
            },
          );
        });
      } catch (error) {
        // Continue with next slot even if one fails
      }
    }

    setSubmissionResults(results);
    setIsSubmitting(false);
    setShowSuccessPopup(true);
  };

  const handleOk = () => {
    setShowSuccessPopup(false);
    navigation.navigate("WorkerTabs");
  };

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
            <Feather name="arrow-left" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {translate("workerApply.jobs")}
          </Text>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Text style={styles.instructionText}>
            {translate("workerApply.pleaseFillForm")}
          </Text>

          <Text style={styles.jobTitle}>{title || "Villa Caretaker"}</Text>

          {selectedSlots.length > 0 && (
            <View style={styles.selectedSlotsInfo}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.primary.pink}
              />
              <Text style={styles.selectedSlotsText}>
                {selectedSlots.length > 1
                  ? translate("workerApply.slotsSelected", {
                      count: selectedSlots.length,
                    })
                  : translate("workerApply.slotSelected", {
                      count: selectedSlots.length,
                    })}
              </Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {translate("workerApply.coverMessage")}
            </Text>
            <TextInput
              style={styles.textArea}
              placeholder={translate("workerApply.enterCoverMessage")}
              placeholderTextColor={colors.auth.gray}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={coverMessage}
              onChangeText={setCoverMessage}
            />
          </View>

          <View style={styles.checkboxRow}>
            <TouchableOpacity
              onPress={() => setTermsAccepted(!termsAccepted)}
              style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}
              activeOpacity={0.8}
            >
              {termsAccepted && (
                <Feather name="check" size={12} color={colors.white} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("WorkerTermsConditions")}
              activeOpacity={0.7}
            >
              <Text style={[styles.checkboxLabel, styles.termsLink]}>
                {translate("workerApply.termsAndConditions")}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, minHeight: 100 }} />

          <TouchableOpacity
            style={[
              styles.applyButton,
              (!termsAccepted || isSubmitting) && styles.applyButtonDisabled,
            ]}
            onPress={handleApply}
            disabled={!termsAccepted || isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.white} />
                <Text style={styles.applyButtonText}>
                  {translate("workerApply.submitting", {
                    current: submissionProgress.current,
                    total: submissionProgress.total,
                  })}
                </Text>
              </View>
            ) : (
              <Text style={styles.applyButtonText}>
                {translate("workerApply.applyButton")}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Results Summary Modal */}
      <Modal visible={showSuccessPopup} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowSuccessPopup(false)}
            >
              <Ionicons name="close" size={24} color={colors.black} />
            </TouchableOpacity>

            <Text style={styles.successTitle}>
              {submissionResults.some((r) => r.status === "success")
                ? translate("workerApply.successfullyApplied")
                : translate("workerApply.submissionFailed")}
            </Text>

            <ScrollView
              style={styles.resultsList}
              showsVerticalScrollIndicator={false}
            >
              {submissionResults.map((result, idx) => (
                <View
                  key={`result-${idx}`}
                  style={[
                    styles.resultItem,
                    result.status === "error" && styles.resultItemError,
                  ]}
                >
                  <View style={styles.resultHeader}>
                    <Ionicons
                      name={
                        result.status === "success"
                          ? "checkmark-circle"
                          : "alert-circle"
                      }
                      size={20}
                      color={
                        result.status === "success"
                          ? colors.ui.success
                          : colors.ui.error
                      }
                    />
                    <Text
                      style={[
                        styles.resultSlotTitle,
                        result.status === "error" && styles.resultSlotTitleError,
                      ]}
                    >
                      {result.slot.startDate} ({result.slot.joiningTime})
                    </Text>
                  </View>
                  <Text style={styles.resultMessage}>{result.message}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Text style={styles.successDescription}>
                {submissionResults.some((r) => r.status === "success")
                  ? translate("workerApply.thanksForApplying")
                  : translate("workerApply.pleaseCheckIssues")}
              </Text>

              <TouchableOpacity style={styles.okButton} onPress={handleOk}>
                <Text style={styles.okButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.auth.background,
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
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 40,
    flexGrow: 1,
  },
  instructionText: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: colors.auth.darkRed,
    marginBottom: 40,
  },
  jobTitle: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: colors.auth.darkRed,
    marginBottom: 30,
  },
  selectedSlotsInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.selectedBackground,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 25,
    gap: 8,
  },
  selectedSlotsText: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary.pink,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: colors.black,
    marginBottom: 10,
  },
  textArea: {
    backgroundColor: colors.white,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.ui.inputBorderGray,
    padding: 15,
    minHeight: 150,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.primary,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: colors.auth.gray,
    borderRadius: 4,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  checkboxChecked: {
    backgroundColor: colors.primary.pink,
    borderColor: colors.primary.pink,
  },
  checkboxLabel: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: colors.text.secondary,
  },
  termsLink: {
    color: colors.primary.pink,
    textDecorationLine: "underline",
    marginLeft: 4,
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
  },
  applyButton: {
    backgroundColor: colors.auth.darkRed,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  applyButtonDisabled: {
    backgroundColor: colors.ui.disabled,
  },
  applyButtonText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 1,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.auth.overlay,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  modalContent: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 30,
    padding: 30,
    alignItems: "center",
    position: "relative",
  },
  closeModalButton: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  successTitle: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: colors.auth.darkRed,
    marginTop: 10,
    marginBottom: 20,
    textAlign: "center",
  },
  successIconContainer: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  successImage: {
    width: "100%",
    height: "100%",
  },
  successSubtitle: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: colors.black,
    marginBottom: 5,
  },
  successDescription: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.black,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 20,
  },
  okButton: {
    backgroundColor: colors.primary.pink,
    width: "100%",
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  okButtonText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
  },
  resultsList: {
    width: "100%",
    maxHeight: 300,
    marginBottom: 20,
  },
  resultItem: {
    backgroundColor: "#F1FBF7",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0F7EF",
  },
  resultItemError: {
    backgroundColor: "#FFF5F5",
    borderColor: "#FFE0E0",
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  resultSlotTitle: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#12AA73",
  },
  resultSlotTitleError: {
    color: "#D32F2F",
  },
  resultMessage: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    marginLeft: 28,
  },
  modalFooter: {
    width: "100%",
    alignItems: "center",
  },
});
