import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useState, useRef } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  FlatList,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import colors from "../../../theme/worker/colors";
import { useRaiseDispute } from "../../../services/WorkerJobServices";
import { useTranslation } from "../../../hooks/useTranslation";

export default function RaiseDisputeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { translate } = useTranslation();
  const { jobId, slots = [] } = route.params || {};
  const availableSlots = slots.filter((s) => s.isDisputed === false);
  const { mutate: raiseDispute, isPending: isSubmitting } = useRaiseDispute();

  const reasonsData = [
    {
      id: 1,
      label: translate("workerRaiseDispute.unprofessionalBehavior"),
      value: "unprofessional_behavior",
    },
    {
      id: 2,
      label: translate("workerRaiseDispute.paymentIssue"),
      value: "payment_issue",
    },
    {
      id: 3,
      label: translate("workerRaiseDispute.businessClosed"),
      value: "no_show",
    },
    {
      id: 4,
      label: translate("workerRaiseDispute.responsibilitiesDifferent"),
      value: "job_mismatch",
    },
    { id: 5, label: translate("workerRaiseDispute.other"), value: "other" },
  ];

  const [title, setTitle] = useState("");
  const [reason, setReason] = useState(reasonsData[0]);
  const [description, setDescription] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);
  const reasonRef = useRef(null);
  const [anchor, setAnchor] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showSlotDropdown, setShowSlotDropdown] = useState(false);
  const slotRef = useRef(null);
  const [slotAnchor, setSlotAnchor] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const pickEvidence = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          translate("workerRaiseDispute.permissionNeeded"),
          translate("workerRaiseDispute.grantCameraPermission"),
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setEvidenceFiles([...evidenceFiles, result.assets[0]]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(
        translate("workerCommon.error"),
        translate("workerRaiseDispute.failedPickImage"),
      );
    }
  };

  const removeEvidence = (index) => {
    setEvidenceFiles(evidenceFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // Validation: Job ID is required
    if (!jobId) {
      Alert.alert(
        translate("workerCommon.error"),
        translate("workerRaiseDispute.jobIdMissing"),
      );
      return;
    }

    if (!title.trim()) {
      Alert.alert(
        translate("workerCommon.validationError"),
        translate("workerRaiseDispute.titleRequired"),
      );
      return;
    }

    if (!reason) {
      Alert.alert(
        translate("workerCommon.validationError"),
        translate("workerRaiseDispute.selectReason"),
      );
      return;
    }

    // Validation: Slot selection is required if undisputed slots are available
    if (availableSlots.length > 0 && !selectedSlot) {
      Alert.alert(
        translate("workerCommon.validationError"),
        translate("workerRaiseDispute.enterSelectSlot"),
      );
      return;
    }

    if (!description.trim()) {
      Alert.alert(
        translate("workerCommon.validationError"),
        translate("workerRaiseDispute.descriptionRequired"),
      );
      return;
    }

    // Prepare data for API
    const disputeData = {
      job_id: jobId.toString(),
      title: title.trim(),
      reason: reason.value,
      description: description.trim(),
      evidence_files: evidenceFiles,
      proposal_id: selectedSlot?.proposalId?.toString() || null,
    };

    raiseDispute(disputeData, {
      onSuccess: () => {
        Alert.alert(
          translate("workerCommon.success"),
          translate("workerRaiseDispute.disputeRaisedSuccess"),
          [
            {
              text: translate("workerCommon.ok"),
              onPress: () => navigation.goBack(),
            },
          ],
        );
      },
      onError: (error) => {
        Alert.alert(
          translate("workerCommon.error"),
          error.message || translate("workerRaiseDispute.failedRaiseDispute"),
        );
      },
    });
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
            {translate("workerRaiseDispute.raiseDispute")}
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
          <View style={styles.cardWrapper}>
            {/* Left Accent Bar */}
            <View style={styles.cardContainer}>
              {/* Dispute Title */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Image
                    source={require("../../../assets/worker-images/medal.png")} // Star/Award icon
                    style={styles.labelIcon}
                  />
                  <Text style={styles.label}>
                    {translate("workerRaiseDispute.disputeTitle")}
                  </Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder={translate("workerRaiseDispute.enterTitle")}
                  placeholderTextColor={colors.auth.gray}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              {/* Reason Dropdown */}
              <View style={styles.reasonInputGroup}>
                <View style={styles.labelRow}>
                  <Image
                    source={require("../../../assets/worker-images/reasoning.png")} // Idea/Lightbulb icon
                    style={styles.labelIcon}
                  />
                  <Text style={styles.label}>
                    {translate("workerRaiseDispute.reason")}
                  </Text>
                </View>
                <TouchableOpacity
                  ref={reasonRef}
                  style={styles.dropdownButton}
                  onPress={() => {
                    // measure and open modal dropdown
                    reasonRef.current?.measureInWindow((x, y, w, h) => {
                      setAnchor({ x, y, w, h });
                      setShowReasonDropdown(true);
                    });
                  }}
                >
                  <Text style={styles.dropdownText} numberOfLines={2}>
                    {reason.label}
                  </Text>
                  <Feather
                    name="chevron-down"
                    size={24}
                    color={colors.black}
                    style={styles.dropdownIcon}
                  />
                </TouchableOpacity>

                <Modal
                  visible={showReasonDropdown}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setShowReasonDropdown(false)}
                >
                  <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={() => setShowReasonDropdown(false)}
                  />

                  <View
                    style={[
                      styles.modalMenu,
                      {
                        left: anchor.x,
                        width: Math.max(200, anchor.w),
                        top: (() => {
                          const screenH = Dimensions.get("window").height;
                          const belowSpace = screenH - (anchor.y + anchor.h);
                          const maxMenuHeight = 220;
                          const openBelow =
                            belowSpace >= Math.min(maxMenuHeight, 180) ||
                            belowSpace >= anchor.y;
                          return openBelow
                            ? anchor.y + anchor.h + 4
                            : Math.max(8, anchor.y - maxMenuHeight - 4);
                        })(),
                      },
                    ]}
                  >
                    <FlatList
                      data={reasonsData}
                      keyExtractor={(i) => String(i.id)}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => {
                            setReason(item);
                            setShowReasonDropdown(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              reason.id === item.id &&
                                styles.dropdownItemTextSelected,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      )}
                      ItemSeparatorComponent={() => (
                        <View
                          style={{
                            height: 1,
                            backgroundColor: colors.ui.divider,
                          }}
                        />
                      )}
                      bounces={false}
                      style={{ maxHeight: 220 }}
                    />
                  </View>
                </Modal>
              </View>

              {/* Slot Selection Dropdown - ONLY SHOW IF UNDISPUTED SLOTS ARE AVAILABLE */}
              {availableSlots && availableSlots.length > 0 && (
                <View style={styles.reasonInputGroup}>
                  <View style={styles.labelRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={colors.black}
                      style={{ marginRight: 10 }}
                    />
                    <Text style={styles.label}>
                      {translate("workerRaiseDispute.selectSlot")}
                    </Text>
                  </View>
                  <TouchableOpacity
                    ref={slotRef}
                    style={styles.dropdownButton}
                    onPress={() => {
                      slotRef.current?.measureInWindow((x, y, w, h) => {
                        setSlotAnchor({ x, y, w, h });
                        setShowSlotDropdown(true);
                      });
                    }}
                  >
                    <Text style={styles.dropdownText} numberOfLines={1}>
                      {selectedSlot
                        ? `${selectedSlot.startDate} (${selectedSlot.joiningTime} - ${selectedSlot.endTime})`
                        : translate("workerRaiseDispute.enterSelectSlot")}
                    </Text>
                    <Feather
                      name="chevron-down"
                      size={24}
                      color={colors.black}
                      style={styles.dropdownIcon}
                    />
                  </TouchableOpacity>

                  <Modal
                    visible={showSlotDropdown}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowSlotDropdown(false)}
                  >
                    <Pressable
                      style={StyleSheet.absoluteFill}
                      onPress={() => setShowSlotDropdown(false)}
                    />

                    <View
                      style={[
                        styles.modalMenu,
                        {
                          left: slotAnchor.x,
                          width: Math.max(250, slotAnchor.w),
                          top: (() => {
                            const screenH = Dimensions.get("window").height;
                            const belowSpace =
                              screenH - (slotAnchor.y + slotAnchor.h);
                            const maxMenuHeight = 220;
                            const openBelow =
                              belowSpace >= Math.min(maxMenuHeight, 180) ||
                              belowSpace >= slotAnchor.y;
                            return openBelow
                              ? slotAnchor.y + slotAnchor.h + 4
                              : Math.max(8, slotAnchor.y - maxMenuHeight - 4);
                          })(),
                        },
                      ]}
                    >
                      <FlatList
                        data={availableSlots}
                        keyExtractor={(i, idx) => String(i.id || idx)}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={() => {
                              setSelectedSlot(item);
                              setShowSlotDropdown(false);
                            }}
                          >
                            <Text
                              style={[
                                styles.dropdownItemText,
                                selectedSlot?.id === item.id &&
                                  styles.dropdownItemTextSelected,
                              ]}
                            >
                              {`${item.startDate} (${item.joiningTime} - ${item.endTime})`}
                            </Text>
                          </TouchableOpacity>
                        )}
                        ItemSeparatorComponent={() => (
                          <View
                            style={{
                              height: 1,
                              backgroundColor: colors.ui.divider,
                            }}
                          />
                        )}
                        bounces={false}
                        style={{ maxHeight: 220 }}
                      />
                    </View>
                  </Modal>
                </View>
              )}

              {/* Dispute Description */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Image
                    source={require("../../../assets/worker-images/reporting(1).png")} // Clipboard icon
                    style={styles.labelIcon}
                  />
                  <Text style={styles.label}>
                    {translate("workerRaiseDispute.disputeDescription")}
                  </Text>
                </View>
                <TextInput
                  style={styles.textArea}
                  placeholder={translate("workerRaiseDispute.writeDescription")}
                  placeholderTextColor={colors.auth.gray}
                  multiline
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              {/* Evidence Upload */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Image
                    source={require("../../../assets/worker-images/drugs.png")}
                    style={styles.labelIcon}
                  />
                  <Text style={styles.label}>
                    {translate("workerRaiseDispute.evidenceOptional")}
                  </Text>
                </View>

                {/* Display uploaded evidence */}
                {evidenceFiles.length > 0 && (
                  <View style={styles.evidenceContainer}>
                    {evidenceFiles.map((file, index) => (
                      <View key={index} style={styles.evidenceItem}>
                        <Image
                          source={{ uri: file.uri }}
                          style={styles.evidenceThumbnail}
                        />
                        <TouchableOpacity
                          style={styles.removeEvidenceButton}
                          onPress={() => removeEvidence(index)}
                        >
                          <Feather name="x" size={16} color={colors.white} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* Upload button */}
                <TouchableOpacity
                  style={styles.uploadBox}
                  onPress={pickEvidence}
                  activeOpacity={0.7}
                >
                  <Image
                    source={require("../../../assets/worker-images/upload.png")}
                    style={styles.uploadIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.uploadText}>
                    {translate("workerRaiseDispute.addEvidence")}
                  </Text>
                  <Text style={styles.uploadSubText}>
                    {translate("workerRaiseDispute.filesAdded", {
                      count: evidenceFiles.length,
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>
                {translate("workerRaiseDispute.submitDispute")}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  cardWrapper: {
    backgroundColor: colors.auth.darkRed,
    borderRadius: 25,
    paddingLeft: 10, // Left accent bar effect
    marginBottom: 30,
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardContainer: {
    backgroundColor: colors.white,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 25,
  },
  reasonInputGroup: {
    marginBottom: 25,
    zIndex: Platform.OS === "ios" ? 1000 : 1,
    elevation: Platform.OS === "android" ? 6 : 0,
    // allow dropdown to overflow parent card (avoid clipping on Android/iOS)
    overflow: "visible",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  labelIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: colors.black,
  },
  input: {
    backgroundColor: colors.ui.inputPinkBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.ui.inputBorderGray,
    paddingHorizontal: 15,
    height: 50,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.inputContent,
  },
  textArea: {
    backgroundColor: colors.ui.inputPinkBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.ui.inputBorderGray,
    padding: 15,
    minHeight: 100,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.inputContent,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.ui.inputPinkBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.ui.inputBorderGray,
    paddingHorizontal: 15,
    minHeight: 50,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.inputContent,
    flex: 1,
    marginRight: 10,
    // allow long labels to wrap instead of overflowing
    flexShrink: 1,
    flexWrap: "wrap",
  },
  dropdownIcon: {
    marginLeft: 8,
  },
  dropdownList: {
    // position absolutely so it overlays other content and doesn't get clipped
    position: "absolute",
    left: 0,
    right: 0,
    top: 60,
    marginTop: 8,
    backgroundColor: colors.white,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.ui.lightBorder,
    maxHeight: 220,
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    zIndex: 1000,
    paddingVertical: 5,
  },
  modalMenu: {
    position: "absolute",
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.ui.lightBorder,
    elevation: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    paddingVertical: 6,
    maxHeight: 220,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    // borderBottomWidth: 1,
    // borderBottomColor: colors.ui.divider,
  },
  dropdownItemText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    // ensure long labels wrap within dropdown width
    flexWrap: "wrap",
    flexShrink: 1,
  },
  dropdownItemTextSelected: {
    color: colors.primary.pink,
    fontFamily: "Poppins_600SemiBold",
  },
  uploadBox: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.primary.pink,
    borderStyle: "dashed",
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  uploadIcon: {
    width: 50,
    height: 50,
    marginBottom: 15,
  },
  uploadText: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: colors.primary.pink,
    textAlign: "center",
    lineHeight: 16,
  },
  uploadSubText: {
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    color: colors.auth.gray,
    textAlign: "center",
    marginTop: 5,
  },
  evidenceContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 15,
  },
  evidenceItem: {
    position: "relative",
    width: "48%",
  },
  evidenceThumbnail: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    backgroundColor: colors.ui.lightBorder,
  },
  removeEvidenceButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.primary.pink,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  submitButton: {
    backgroundColor: colors.auth.darkRed,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.auth.darkRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: colors.auth.gray,
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 1,
  },
});
