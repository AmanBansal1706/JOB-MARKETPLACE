import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "../../theme/worker/colors";
import { useTranslation } from "../../hooks/useTranslation";

const getStatusContent = (status, translate) => {
  const map = {
    incomplete: {
      title: translate("workerModals.completeYourProfile"),
      icon: "account-circle",
      description: translate("workerModals.completeProfileDesc"),
      primaryButtonText: translate("workerModals.completeProfileButton"),
      showSecondaryButton: true,
    },
    under_review: {
      title: translate("workerModals.profileUnderReview"),
      icon: "clock-outline",
      description: translate("workerModals.profileUnderReviewDesc"),
      primaryButtonText: translate("workerCommon.ok"),
      showSecondaryButton: false,
    },
    rejected: {
      title: translate("workerModals.profileReviewFailed"),
      icon: "alert-circle",
      description: translate("workerModals.profileReviewFailedDesc"),
      primaryButtonText: translate("workerModals.updateProfile"),
      showSecondaryButton: true,
    },
    permanent_rejected: {
      title: translate("workerModals.profileRejected"),
      icon: "close-circle",
      description: translate("workerModals.profileRejectedDesc"),
      primaryButtonText: translate("workerModals.contactSupport"),
      showSecondaryButton: false,
    },
  };
  return map[status] || map.incomplete;
};

export default function VerificationRequiredModal({
  visible,
  onClose,
  verificationStatus = "incomplete",
}) {
  const navigation = useNavigation();
  const { translate } = useTranslation();
  const content = getStatusContent(verificationStatus, translate);

  const handleAction = () => {
    onClose();
    if (verificationStatus === "permanent_rejected") {
      navigation.navigate("WorkerSupport");
    } else if (
      verificationStatus === "incomplete" ||
      verificationStatus === "rejected"
    ) {
      navigation.navigate("WorkerProfileSetup");
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={28} color={colors.text.primary} />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={content.icon}
              size={80}
              color={colors.primary.pink}
            />
          </View>

          {/* Title */}
          <Text style={styles.modalTitle}>{content.title}</Text>

          {/* Description */}
          <Text style={styles.modalDescription}>{content.description}</Text>

          {/* Primary Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleAction}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              {content.primaryButtonText}
            </Text>
            {verificationStatus !== "under_review" && (
              <Ionicons
                name="arrow-forward"
                size={20}
                color={colors.white}
                style={{ marginLeft: 8 }}
              />
            )}
          </TouchableOpacity>

          {/* Secondary Button */}
          {content.showSecondaryButton && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>
                {translate("workerModals.maybeLater")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 25,
    paddingHorizontal: 25,
    paddingTop: 35,
    paddingBottom: 25,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 15,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.ui.selectedBackground,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  iconContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: colors.black,
    marginBottom: 12,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 20,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: colors.primary.pink,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 12,
    shadowColor: colors.primary.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 0.5,
  },
  secondaryButton: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: colors.primary.pink,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: colors.primary.pink,
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
  },
});
