import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors, fonts } from "../theme";
import { useTranslation } from "../hooks/useTranslation";

/**
 * VerificationStatusCard Component
 *
 * Displays account verification status on the home screen with relevant actions.
 * Handles multiple verification statuses: approved, incomplete, under_review, rejected, permanent_rejected
 *
 * @param {string} verificationStatus - Current verification status of the user
 * @param {boolean} isLoading - Loading state indicator
 * @returns {JSX.Element|null} - Returns the status card or null if approved
 */
export default function VerificationStatusCard({
  verificationStatus,
  isLoading,
}) {
  const navigation = useNavigation();
  const { translate } = useTranslation();

  // Don't show card for approved/verified users
  // if (verificationStatus === "approved" || verificationStatus === "verified") {
  //   return null;
  // }
  if (verificationStatus !== "incomplete") {
    return null;
  }

  const handleCompleteProfile = () => {
    navigation.navigate("Settings", { screen: "BusinessDocuments" });
  };

  const handleContactSupport = () => {
    navigation.navigate("Settings", { screen: "SupportHelp" });
  };

  return (
    <View style={styles.cardWrapper}>
      {isLoading ? (
        <View style={[styles.card, styles.loadingCard]}>
          <ActivityIndicator size="large" color={colors.tertiary} />
          <Text style={styles.loadingText} maxFontSizeMultiplier={1.2}>
            {translate("profile.loadingProfile")}
          </Text>
        </View>
      ) : (
        <>
          {/* INCOMPLETE - Documents yet to upload */}
          {verificationStatus === "incomplete" && (
            <View style={[styles.card, styles.incompleteCard]}>
              <View style={styles.cardHeader}>
                <Image
                  source={require("../assets/images/timesand.png")}
                  style={styles.cardIcon}
                  resizeMode="contain"
                />
                <View style={styles.headerContent}>
                  <Text style={[styles.cardTitle]} maxFontSizeMultiplier={1.2}>
                    {translate("profile.incompleteProfile")}
                  </Text>
                  <Text style={styles.cardSubtitle} maxFontSizeMultiplier={1.2}>
                    {translate("profile.completeDocumentsToPostJobs")}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleCompleteProfile}
                activeOpacity={0.85}
              >
                <Text
                  style={styles.actionButtonText}
                  maxFontSizeMultiplier={1.2}
                >
                  {translate("profile.completeProfile")}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* UNDER REVIEW - Documents submitted, awaiting verification */}
          {verificationStatus === "under_review" && (
            <View style={[styles.card, styles.reviewCard]}>
              <View style={styles.cardHeader}>
                <Image
                  source={require("../assets/images/timesand.png")}
                  style={styles.cardIcon}
                  resizeMode="contain"
                />
                <View style={styles.headerContent}>
                  <Text
                    style={[styles.cardTitle, { color: "#18A974" }]}
                    maxFontSizeMultiplier={1.2}
                  >
                    {translate("profile.verificationInProgress")}
                  </Text>
                  <Text style={styles.cardSubtitle} maxFontSizeMultiplier={1.2}>
                    {translate("profile.reviewingDocuments")}
                  </Text>
                </View>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoText} maxFontSizeMultiplier={1.2}>
                  {translate("profile.accessGrantedUponApproval")}
                </Text>
              </View>
            </View>
          )}

          {/* REJECTED - Documents rejected, can re-upload */}
          {verificationStatus === "rejected" && (
            <View style={[styles.card, styles.rejectedCard]}>
              <View style={styles.cardHeader}>
                <Image
                  source={require("../assets/images/timesand.png")}
                  style={styles.cardIcon}
                  resizeMode="contain"
                />
                <View style={styles.headerContent}>
                  <Text
                    style={[styles.cardTitle, { color: "#E74C3C" }]}
                    maxFontSizeMultiplier={1.2}
                  >
                    {translate("profile.documentsRejected")}
                  </Text>
                  <Text style={styles.cardSubtitle} maxFontSizeMultiplier={1.2}>
                    {translate("profile.actionRequired")}
                  </Text>
                </View>
              </View>
              <Text style={styles.rejectionMessage} maxFontSizeMultiplier={1.2}>
                {translate("profile.documentsRejectedMessageShort")}
              </Text>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleCompleteProfile}
                activeOpacity={0.85}
              >
                <Text
                  style={styles.actionButtonText}
                  maxFontSizeMultiplier={1.2}
                >
                  {translate("profile.reuploadDocuments")}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* PERMANENT REJECTED - Fraud/Malicious, cannot re-upload */}
          {verificationStatus === "permanent_rejected" && (
            <View style={[styles.card, styles.permanentRejectCard]}>
              <View style={styles.cardHeader}>
                <Image
                  source={require("../assets/images/timesand.png")}
                  style={styles.cardIcon}
                  resizeMode="contain"
                />
                <View style={styles.headerContent}>
                  <Text
                    style={[styles.cardTitle, { color: "#8B0000" }]}
                    maxFontSizeMultiplier={1.2}
                  >
                    {translate("profile.accountRejected")}
                  </Text>
                  <Text style={styles.cardSubtitle} maxFontSizeMultiplier={1.2}>
                    {translate("profile.policyViolation")}
                  </Text>
                </View>
              </View>
              <Text style={styles.rejectionMessage} maxFontSizeMultiplier={1.2}>
                {translate("profile.accountRejectedMessageShort")}
              </Text>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleContactSupport}
                activeOpacity={0.85}
              >
                <Text
                  style={styles.actionButtonText}
                  maxFontSizeMultiplier={1.2}
                >
                  {translate("settings.contactSupport")}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* UNKNOWN/DEFAULT - Unknown status */}
          {![
            "approved",
            "verified",
            "incomplete",
            "under_review",
            "rejected",
            "permanent_rejected",
          ].includes(verificationStatus) && (
            <View style={[styles.card, styles.unknownCard]}>
              <View style={styles.cardHeader}>
                <View style={styles.headerContent}>
                  <Text
                    style={[styles.cardTitle, { color: colors.text1 }]}
                    maxFontSizeMultiplier={1.2}
                  >
                    {translate("profile.statusUnavailable")}
                  </Text>
                  <Text style={styles.cardSubtitle} maxFontSizeMultiplier={1.2}>
                    {translate("profile.unableToDetermineStatus")}
                  </Text>
                </View>
              </View>
              <Text style={styles.rejectionMessage} maxFontSizeMultiplier={1.2}>
                {translate("profile.unableToDetermineStatusMessage")}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 5,
  },
  loadingCard: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
    borderLeftColor: colors.tertiary,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.text1,
    fontFamily: fonts.medium,
  },
  incompleteCard: {
    borderLeftColor: "#18A974",
  },
  reviewCard: {
    borderLeftColor: "#18A974",
  },
  rejectedCard: {
    borderLeftColor: "#E74C3C",
  },
  permanentRejectCard: {
    borderLeftColor: "#8B0000",
  },
  unknownCard: {
    borderLeftColor: colors.text1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
    marginTop: 2,
  },
  headerContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.text4,
    fontFamily: fonts.regular,
  },
  infoBox: {
    backgroundColor: colors.bg,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: colors.text1,
    fontFamily: fonts.regular,
    lineHeight: 18,
  },
  rejectionMessage: {
    fontSize: 13,
    color: colors.text1,
    fontFamily: fonts.regular,
    marginBottom: 12,
    lineHeight: 18,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#FFF",
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
});
