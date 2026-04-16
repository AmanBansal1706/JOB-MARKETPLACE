import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "../../../theme/worker/colors";
import { useTranslation } from "../../../hooks/useTranslation";

const getCardContent = (status, translate) => {
  const contentMap = {
    incomplete: {
      title: translate("workerModals.completeYourProfile"),
      description: translate("workerModals.unlockFeatures"),
      icon: "account-circle",
      primaryButtonText: translate("workerModals.completeProfileButton"),
      showSecondaryButton: true,
      secondaryButtonText: translate("workerModals.maybeLater"),
    },
    under_review: {
      title: translate("workerModals.profileUnderReview"),
      description: translate("workerModals.profileUnderReviewDesc"),
      icon: "clock-outline",
      primaryButtonText: translate("workerCommon.ok"),
      showSecondaryButton: false,
    },
    rejected: {
      title: translate("workerModals.profileReviewFailed"),
      description: translate("workerModals.profileReviewFailedDesc"),
      icon: "alert-circle",
      primaryButtonText: translate("workerModals.updateProfile"),
      showSecondaryButton: true,
      secondaryButtonText: translate("workerCommon.cancel"),
    },
    permanent_rejected: {
      title: translate("workerModals.profileRejected"),
      description: translate("workerModals.profileRejectedDesc"),
      icon: "close-circle",
      primaryButtonText: translate("workerModals.contactSupport"),
      showSecondaryButton: false,
    },
  };

  return contentMap[status] || null;
};

export default function VerificationCard({
  verificationStatus,
  onAction,
  onSkip,
}) {
  const { translate } = useTranslation();
  const content = getCardContent(verificationStatus, translate);

  if (!content) return null;

  return (
    <View style={styles.card}>
      {/* Icon */}
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={content.icon}
          size={80}
          color={colors.primary.pink}
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>{content.title}</Text>

      {/* Description */}
      <Text style={styles.description}>{content.description}</Text>

      {/* Primary Button */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={onAction}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>
          {content.primaryButtonText}
        </Text>
        <Ionicons
          name="arrow-forward"
          size={20}
          color={colors.white}
          style={{ marginLeft: 8 }}
        />
      </TouchableOpacity>

      {/* Secondary Button */}
      {content.showSecondaryButton && (
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onSkip}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>
            {content.secondaryButtonText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    width: "100%",
  },
  iconContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: colors.black,
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
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
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
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
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },
});
