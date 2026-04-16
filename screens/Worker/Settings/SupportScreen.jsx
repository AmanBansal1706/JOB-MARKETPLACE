import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import colors from "../../../theme/worker/colors";
import {
  useFetchWorkerProfile,
  useFetchWorkerSupportTickets,
  useCreateWorkerSupportTicket,
} from "../../../services/WorkerProfileServices";
import {
  workerSupportFAQs,
  ticketSubjects,
} from "../../../utils/worker/supportFAQs";
import { formatDisplayDate } from "../../../utils/dateFormatting";
import { useTranslation } from "../../../hooks/useTranslation";

export default function SupportScreen() {
  const navigation = useNavigation();
  const { translate } = useTranslation();
  const [raiseModalVisible, setRaiseModalVisible] = useState(false);
  const [ticketDetailModalVisible, setTicketDetailModalVisible] =
    useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);

  // Fetch worker profile for email and mobile
  const { data: workerProfile, isPending: isLoadingProfile } =
    useFetchWorkerProfile();

  // Fetch support tickets
  const {
    data: ticketsData,
    isPending: isLoadingTickets,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchTickets,
  } = useFetchWorkerSupportTickets({}, statusFilter, null);

  // Create support ticket mutation
  const {
    mutate: createTicket,
    isPending: isCreatingTicket,
    isSuccess: isTicketCreated,
    reset: resetCreateTicket,
  } = useCreateWorkerSupportTicket();

  // New Ticket State
  const [subject, setSubject] = useState("");
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [mediaUri, setMediaUri] = useState(null);

  // Prefill email and mobile from worker profile
  useEffect(() => {
    if (workerProfile?.user) {
      setEmail(workerProfile.user.email || "");
      setMobile(workerProfile.user.mobile || "");
    }
  }, [workerProfile]);

  // Reset form and close modal on successful ticket creation
  useEffect(() => {
    if (isTicketCreated) {
      Alert.alert(
        translate("workerCommon.success"),
        translate("workerSupport.ticketCreated"),
        [
          {
            text: "OK",
            onPress: () => {
              setRaiseModalVisible(false);
              resetForm();
              resetCreateTicket();
              refetchTickets();
            },
          },
        ],
      );
    }
  }, [isTicketCreated]);

  const resetForm = () => {
    setSubject("");
    setDescription("");
    setMediaUri(null);
    // Keep email and mobile as they come from profile
  };

  const pickMedia = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          translate("workerCommon.permissionRequired"),
          translate("workerSupport.galleryPermissionRequired"),
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setMediaUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking media:", error);
      Alert.alert(
        translate("workerCommon.error"),
        translate("workerSupport.failedPickMedia"),
      );
    }
  };

  const removeMedia = () => {
    setMediaUri(null);
  };

  const handleSubmitTicket = () => {
    // Validation
    if (!subject.trim()) {
      Alert.alert(
        translate("workerCommon.validationError"),
        translate("workerSupport.selectSubject"),
      );
      return;
    }
    if (!description.trim()) {
      Alert.alert(
        translate("workerCommon.validationError"),
        translate("workerSupport.enterDescription"),
      );
      return;
    }
    if (!email.trim() || !mobile.trim()) {
      Alert.alert(
        translate("workerCommon.validationError"),
        translate("workerSupport.emailMobileRequired"),
      );
      return;
    }

    // Create ticket
    const ticketData = {
      subject,
      description,
      email,
      mobile,
      media: mediaUri,
    };

    createTicket(ticketData);
  };

  const handleTicketPress = (ticket) => {
    setSelectedTicket(ticket);
    setTicketDetailModalVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return { bg: "#FFF9C4", text: "#FBC02D" };
      case "Resolved":
        return { bg: "#C8E6C9", text: "#2E7D32" };
      case "Cancelled":
        return { bg: "#FFCDD2", text: "#C62828" };
      default:
        return { bg: "#E0E0E0", text: "#757575" };
    }
  };

  const formatDate = formatDisplayDate;

  const renderFaqItem = (faq, index) => {
    const isExpanded = expandedFaqIndex === index;
    return (
      <View key={index} style={styles.faqContainer}>
        <TouchableOpacity
          style={styles.faqItem}
          onPress={() => setExpandedFaqIndex(isExpanded ? null : index)}
          activeOpacity={0.7}
        >
          <Text style={styles.faqText}>{faq.question}</Text>
          <Feather
            name={isExpanded ? "chevron-down" : "chevron-right"}
            size={20}
            color={colors.text.secondary}
          />
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.faqAnswerContainer}>
            <Text style={styles.faqAnswerText}>{faq.answer}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderTicketCard = (ticket) => {
    const statusColors = getStatusColor(ticket.status);
    return (
      <TouchableOpacity
        key={ticket.ticket_id}
        style={styles.ticketCard}
        onPress={() => handleTicketPress(ticket)}
        activeOpacity={0.7}
      >
        <View style={styles.ticketLeftBorder} />
        <View style={styles.ticketContent}>
          <View style={styles.ticketHeaderTop}>
            <Text style={styles.ticketTitle}>{ticket.subject}</Text>
            <View
              style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}
            >
              <Text style={[styles.statusText, { color: statusColors.text }]}>
                {ticket.status}
              </Text>
            </View>
          </View>

          <Text style={styles.ticketDate}>{formatDate(ticket.created_at)}</Text>

          <Text style={styles.ticketDescription} numberOfLines={2}>
            {ticket.description}
          </Text>

          <View style={styles.ticketFooter}>
            {ticket.media && (
              <Image
                source={{ uri: ticket.media }}
                style={styles.mediaThumb}
                resizeMode="cover"
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTicketListFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={colors.primary.pink} />
        <Text style={styles.loadingMoreText}>
          {translate("workerSupport.loadingMore")}
        </Text>
      </View>
    );
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
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
            {translate("workerSupport.supportHelpCenter")}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* FAQ Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitleFaq}>
            {translate("workerSupport.faq")}
          </Text>
          <View style={styles.faqList}>
            {workerSupportFAQs.map(renderFaqItem)}
          </View>
        </View>

        {/* Support Tickets Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitleTickets}>
            {translate("workerSupport.supportTickets")}
          </Text>

          {isLoadingTickets ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary.pink} />
              <Text style={styles.loadingText}>
                {translate("workerSupport.loadingTickets")}
              </Text>
            </View>
          ) : ticketsData &&
            ticketsData.tickets &&
            ticketsData.tickets.length > 0 ? (
            <>
              {ticketsData.tickets.map(renderTicketCard)}
              {renderTicketListFooter()}
              {hasNextPage && (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={handleLoadMore}
                  disabled={isFetchingNextPage}
                >
                  <Text style={styles.loadMoreButtonText}>
                    {isFetchingNextPage
                      ? translate("workerSupport.loadingEllipsis")
                      : translate("workerSupport.loadMore")}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="ticket-outline"
                size={60}
                color={colors.text.tertiary}
              />
              <Text style={styles.emptyStateText}>
                {translate("workerSupport.noTicketsYet")}
              </Text>
              <Text style={styles.emptyStateSubText}>
                {translate("workerSupport.raiseTicketSubtitle")}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.raiseButton}
          onPress={() => setRaiseModalVisible(true)}
        >
          <Text style={styles.raiseButtonText}>
            {translate("workerSupport.raiseNewTicket")}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Raise New Ticket Modal */}
      <Modal
        visible={raiseModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRaiseModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ width: 30 }} />
              <Text style={styles.modalTitle}>
                {translate("workerSupport.raiseNewTicket")}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setRaiseModalVisible(false);
                  resetForm();
                }}
                style={styles.closeButton}
              >
                <Feather name="x" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.modalForm}
            >
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {translate("workerSupport.subject")}
                </Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowSubjectDropdown(!showSubjectDropdown)}
                >
                  <Text
                    style={[styles.dropdownText, !subject && { color: "#999" }]}
                  >
                    {subject || translate("workerSupport.selectIssueType")}
                  </Text>
                  <Feather name="chevron-down" size={20} color="#2E7D32" />
                </TouchableOpacity>

                {showSubjectDropdown && (
                  <View style={styles.dropdownList}>
                    <ScrollView nestedScrollEnabled={true}>
                      {ticketSubjects.map((item) => (
                        <TouchableOpacity
                          key={item}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setSubject(item);
                            setShowSubjectDropdown(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              subject === item && {
                                color: colors.primary.pink,
                                fontFamily: "Poppins_700Bold",
                              },
                            ]}
                          >
                            {item}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {translate("workerSupport.description")}
                </Text>
                <TextInput
                  style={[styles.formInput, styles.descriptionInput]}
                  placeholder={translate("workerSupport.describeIssue")}
                  multiline
                  value={description}
                  onChangeText={setDescription}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {translate("workerSupport.emailId")}
                </Text>
                <TextInput
                  style={[styles.formInput, styles.disabledInput]}
                  value={email}
                  editable={false}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {translate("workerSupport.mobileNumber")}
                </Text>
                <TextInput
                  style={[styles.formInput, styles.disabledInput]}
                  value={mobile}
                  editable={false}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {translate("workerSupport.uploadMediaOptional")}
                </Text>
                {mediaUri ? (
                  <View style={styles.uploadedMediaContainer}>
                    <Image
                      source={{ uri: mediaUri }}
                      style={styles.uploadedMediaImage}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.removeMediaButton}
                      onPress={removeMedia}
                    >
                      <Feather name="x" size={18} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadDashedBox}
                    onPress={pickMedia}
                  >
                    <View style={styles.uploadIconRow}>
                      <MaterialCommunityIcons
                        name="image-multiple-outline"
                        size={20}
                        color={colors.primary.pink}
                      />
                      <Text style={styles.uploadMainText}>
                        {translate("workerSupport.chooseFromGallery")}
                      </Text>
                    </View>
                    <Text style={styles.uploadSubText}>
                      {translate("workerSupport.uploadHint")}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isCreatingTicket && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmitTicket}
                disabled={isCreatingTicket}
              >
                {isCreatingTicket ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {translate("workerSupport.submitButton")}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Ticket Detail Modal */}
      <Modal
        visible={ticketDetailModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setTicketDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ width: 30 }} />
              <Text style={styles.modalTitle}>
                {translate("workerSupport.ticketDetails")}
              </Text>
              <TouchableOpacity
                onPress={() => setTicketDetailModalVisible(false)}
                style={styles.closeButton}
              >
                <Feather name="x" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.modalForm}
            >
              {selectedTicket && (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                      {translate("workerSupport.ticketId")}
                    </Text>
                    <Text style={styles.detailValue}>
                      #{selectedTicket.ticket_id}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                      {translate("workerSupport.subject")}:
                    </Text>
                    <Text style={styles.detailValue}>
                      {selectedTicket.subject}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                      {translate("workerSupport.created")}
                    </Text>
                    <Text style={styles.detailValue}>
                      {formatDate(selectedTicket.created_at)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                      {translate("workerSupport.statusLabel")}
                    </Text>
                    <View
                      style={[
                        styles.statusBadgeInline,
                        {
                          backgroundColor: getStatusColor(selectedTicket.status)
                            .bg,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusTextInline,
                          { color: getStatusColor(selectedTicket.status).text },
                        ]}
                      >
                        {selectedTicket.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailColumn}>
                    <Text style={styles.detailLabel}>
                      {translate("workerSupport.description")}:
                    </Text>
                    <Text style={styles.detailValueMultiline}>
                      {selectedTicket.description}
                    </Text>
                  </View>

                  {selectedTicket.media && (
                    <View style={styles.detailColumn}>
                      <Text style={styles.detailLabel}>
                        {translate("workerSupport.attachedMedia")}
                      </Text>
                      <Image
                        source={{ uri: selectedTicket.media }}
                        style={styles.detailMediaImage}
                        resizeMode="contain"
                      />
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                      {translate("workerSupport.lastUpdated")}
                    </Text>
                    <Text style={styles.detailValue}>
                      {formatDate(selectedTicket.updated_at)}
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: colors.primary.pink,
  },
  backButtonContainer: {
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
    marginLeft: 15,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    shadowColor: colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitleFaq: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: colors.primary.pink,
    marginBottom: 20,
    textAlign: "center",
  },
  sectionTitleTickets: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: colors.auth.darkRed,
    marginBottom: 20,
  },
  faqList: {
    gap: 15,
  },
  faqContainer: {
    marginBottom: 5,
  },
  faqItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFE5EC",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  faqText: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: colors.auth.darkRed,
    flex: 1,
  },
  faqAnswerContainer: {
    backgroundColor: colors.white,
    padding: 15,
    marginTop: -5,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1,
    borderColor: "#FFE5EC",
  },
  faqAnswerText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    lineHeight: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: colors.text.secondary,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: colors.text.primary,
    marginTop: 16,
  },
  emptyStateSubText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    marginTop: 4,
  },
  ticketCard: {
    backgroundColor: colors.white,
    borderRadius: 15,
    marginBottom: 20,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  ticketLeftBorder: {
    width: 6,
    backgroundColor: colors.auth.darkRed,
  },
  ticketContent: {
    flex: 1,
    padding: 15,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  ticketHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  ticketTitle: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: colors.auth.darkRed,
    flex: 1,
  },
  ticketDate: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#999",
    marginBottom: 10,
  },
  ticketDescription: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    marginBottom: 10,
  },
  ticketFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  mediaThumb: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  statusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
  },
  statusBadgeInline: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusTextInline: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  loadingMoreText: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    color: colors.text.secondary,
  },
  loadMoreButton: {
    backgroundColor: colors.primary.pink,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  loadMoreButtonText: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: colors.white,
  },
  raiseButton: {
    backgroundColor: colors.primary.pink,
    borderRadius: 15,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: colors.primary.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  raiseButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 1,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    maxHeight: "90%",
    overflow: "hidden",
    paddingBottom: 10,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFEAEA",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: colors.primary.pink,
  },
  closeButton: {
    backgroundColor: "#F8456C",
    width: 30,
    height: 30,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  modalForm: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: colors.text.primary,
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFEDF1",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0C0C0",
    paddingHorizontal: 15,
    height: 50,
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.primary,
  },
  dropdownList: {
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0C0C0",
    marginTop: 5,
    elevation: 3,
    maxHeight: 200,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  dropdownItemText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
  },
  formInput: {
    backgroundColor: "#FFEDF1",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0C0C0",
    paddingHorizontal: 15,
    height: 50,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.primary,
  },
  disabledInput: {
    backgroundColor: "#F5F5F5",
    color: "#999",
  },
  descriptionInput: {
    height: 100,
    paddingTop: 15,
  },
  uploadDashedBox: {
    borderWidth: 1.5,
    borderColor: colors.primary.pink,
    borderStyle: "dashed",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  uploadIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 5,
  },
  uploadMainText: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary.pink,
  },
  uploadSubText: {
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
  },
  uploadedMediaContainer: {
    position: "relative",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0C0C0",
  },
  uploadedMediaImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  removeMediaButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: colors.primary.pink,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButton: {
    backgroundColor: colors.auth.darkRed,
    borderRadius: 15,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: "#CCC",
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
  // Ticket Detail Modal Styles
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    flexWrap: "wrap",
  },
  detailColumn: {
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: colors.auth.darkRed,
    marginRight: 8,
    minWidth: 100,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.primary,
    flex: 1,
  },
  detailValueMultiline: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.primary,
    lineHeight: 22,
    marginTop: 8,
  },
  detailMediaImage: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
});
