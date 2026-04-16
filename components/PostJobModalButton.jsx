import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors, fonts } from "../theme";
import { useFetchUserProfile } from "../services/ProfileServices";
import { useTranslation } from "../hooks/useTranslation";

export default function PostJobModalButton({ accentColor }) {
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);
  const { translate } = useTranslation();

  const { data: userProfileData, isPending: profileLoading } =
    useFetchUserProfile();

  const verificationStatus =
    userProfileData?.user?.verification_status ?? "unknown";

  const open = () => setVisible(true);
  const close = () => setVisible(false);

  const handleProceed = () => {
    close();
    navigation.navigate("JobPostForm");
  };

  const handleGoToCompleteProfile = () => {
    close();
    navigation.navigate("Settings", { screen: "BusinessDocuments" });
  };

  const handlePress = () => {
    // If profile is still loading show the modal so user sees the loader.
    if (profileLoading) {
      open();
      return;
    }
    // If approved/verified navigate directly to JobPostForm without showing modal.
    if (
      verificationStatus === "approved" ||
      verificationStatus === "verified"
    ) {
      handleProceed();
      return;
    }
    // Otherwise show the modal
    open();
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: accentColor || colors.primary },
        ]}
        activeOpacity={0.85}
        onPress={handlePress}
        disabled={profileLoading}
      >
        <Text style={styles.buttonText} maxFontSizeMultiplier={1.2}>
          {profileLoading
            ? translate("common.loading")
            : translate("jobs.postNewJob")}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={close}
      >
        <View style={styles.backdrop}>
          <View style={styles.modal}>
            {/* Close Icon - Top Right */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={close}
              activeOpacity={0.7}
            >
              <Text style={styles.closeIcon} maxFontSizeMultiplier={1.2}>
                ✕
              </Text>
            </TouchableOpacity>

            {profileLoading ? (
              <>
                <Text style={styles.title} maxFontSizeMultiplier={1.2}>
                  {translate("profile.loadingProfile")}
                </Text>
                <ActivityIndicator size="large" color={colors.tertiary} />
              </>
            ) : (
              <View style={styles.cardContent}>
                {/* APPROVED - Account is verified and approved */}
                {(verificationStatus === "approved" ||
                  verificationStatus === "verified") && (
                  <>
                    <Text style={styles.titleModal} maxFontSizeMultiplier={1.2}>
                      {translate("jobs.postNewJobTitle")}
                    </Text>
                    <Text
                      style={styles.infoTextCenter}
                      maxFontSizeMultiplier={1.2}
                    >
                      {translate("jobs.verifiedMessage")}
                    </Text>

                    <TouchableOpacity
                      style={[
                        styles.primaryButton,
                        { backgroundColor: colors.primary },
                      ]}
                      onPress={handleProceed}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={styles.primaryButtonText}
                        maxFontSizeMultiplier={1.2}
                      >
                        {translate("jobs.proceedToPostJob")}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                {/* INCOMPLETE - Documents yet to upload */}
                {verificationStatus === "incomplete" && (
                  <View style={styles.statusCard}>
                    <Image
                      source={require("../assets/images/timesand.png")}
                      style={styles.statusImage}
                      resizeMode="contain"
                    />

                    <Text
                      style={[styles.statusTitle, { color: "#FF9500" }]}
                      maxFontSizeMultiplier={1.2}
                    >
                      {translate("profile.incompleteProfile")}
                    </Text>

                    <Text style={styles.statusText} maxFontSizeMultiplier={1.2}>
                      {translate("profile.incompleteProfileMessage")}
                    </Text>

                    <TouchableOpacity
                      style={[
                        styles.primaryButton,
                        { backgroundColor: colors.primary },
                      ]}
                      onPress={handleGoToCompleteProfile}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={styles.primaryButtonText}
                        maxFontSizeMultiplier={1.2}
                      >
                        {translate("profile.completeProfile")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* UNDER REVIEW - Documents submitted, awaiting verification */}
                {verificationStatus === "under_review" && (
                  <View style={styles.statusCard}>
                    <Image
                      source={require("../assets/images/timesand.png")}
                      style={styles.statusImage}
                      resizeMode="contain"
                    />

                    <Text
                      style={[styles.statusTitle, { color: "#18A974" }]}
                      maxFontSizeMultiplier={1.2}
                    >
                      {translate("profile.verificationInProgress")}
                    </Text>

                    <Text style={styles.statusText} maxFontSizeMultiplier={1.2}>
                      {translate("profile.verificationInProgressMessage")}
                    </Text>

                    <TouchableOpacity
                      style={[
                        styles.okButton,
                        { backgroundColor: colors.primary },
                      ]}
                      onPress={close}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.okText} maxFontSizeMultiplier={1.2}>
                        {translate("common.ok")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* REJECTED - Documents rejected, can re-upload */}
                {verificationStatus === "rejected" && (
                  <View style={styles.statusCard}>
                    <Image
                      source={require("../assets/images/timesand.png")}
                      style={styles.statusImage}
                      resizeMode="contain"
                    />

                    <Text
                      style={[styles.statusTitle, { color: "#E74C3C" }]}
                      maxFontSizeMultiplier={1.2}
                    >
                      {translate("profile.documentsRejected")}
                    </Text>

                    <Text style={styles.statusText} maxFontSizeMultiplier={1.2}>
                      {translate("profile.documentsRejectedMessage")}
                    </Text>

                    <TouchableOpacity
                      style={[
                        styles.primaryButton,
                        { backgroundColor: colors.primary },
                      ]}
                      onPress={handleGoToCompleteProfile}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={styles.primaryButtonText}
                        maxFontSizeMultiplier={1.2}
                      >
                        {translate("profile.reuploadDocuments")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* PERMANENT REJECTED - Fraud/Malicious, cannot re-upload */}
                {verificationStatus === "permanent_rejected" && (
                  <View style={styles.statusCard}>
                    <Image
                      source={require("../assets/images/timesand.png")}
                      style={styles.statusImage}
                      resizeMode="contain"
                    />

                    <Text
                      style={[styles.statusTitle, { color: "#8B0000" }]}
                      maxFontSizeMultiplier={1.2}
                    >
                      {translate("profile.accountRejected")}
                    </Text>

                    <Text style={styles.statusText} maxFontSizeMultiplier={1.2}>
                      {translate("profile.accountRejectedMessage")}
                    </Text>

                    <TouchableOpacity
                      style={[
                        styles.supportButton,
                        { backgroundColor: colors.primary },
                      ]}
                      onPress={() => {
                        close();
                        navigation.navigate("Settings", {
                          screen: "SupportHelp",
                        });
                      }}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={styles.supportButtonText}
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
                  <View style={styles.statusCard}>
                    <Text
                      style={styles.statusTitle}
                      maxFontSizeMultiplier={1.2}
                    >
                      {translate("profile.unableToVerifyStatus")}
                    </Text>

                    <Text style={styles.statusText} maxFontSizeMultiplier={1.2}>
                      {translate("profile.unableToVerifyStatusMessage")}
                    </Text>

                    <TouchableOpacity
                      style={[
                        styles.okButton,
                        { backgroundColor: colors.primary },
                      ]}
                      onPress={close}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.okText} maxFontSizeMultiplier={1.2}>
                        {translate("common.ok")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    marginHorizontal: 16,
    marginVertical: 5,
    paddingVertical: 10,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modal: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.lightGray || "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  closeIcon: {
    fontSize: 22,
    color: colors.text1 || "#333",
    fontWeight: "bold",
  },
  title: {
    fontSize: 22,
    fontFamily: fonts.semiBold,
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 12,
    color: colors.text1,
  },
  statusValue: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    marginTop: 6,
  },
  infoText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.text1,
    textAlign: "center",
  },
  proceedBtn: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  proceedText: {
    color: "#fff",
    fontFamily: fonts.semiBold,
  },
  cancelBtn: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelText: {
    color: colors.text1,
    fontFamily: fonts.semiBold,
  },
  /* new styles for modal variants */
  cardContent: {
    width: "100%",
    alignItems: "center",
  },
  titleModal: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    marginBottom: 8,
  },
  infoTextCenter: {
    fontSize: 14,
    color: colors.text1,
    textAlign: "center",
    marginBottom: 12,
  },
  primaryButton: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  primaryButtonText: {
    color: "#fff",
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  /* Status Card Styles (for all statuses) */
  statusCard: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  statusImage: {
    width: 110,
    height: 110,
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    marginBottom: 10,
  },
  statusText: {
    textAlign: "center",
    color: colors.text1,
    fontSize: 14,
    marginBottom: 18,
    lineHeight: 20,
  },
  okButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  okText: {
    color: "#fff",
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  supportButton: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  supportButtonText: {
    color: "#fff",
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  /* Deprecated styles - keeping for backward compatibility */
  validationCard: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  validationTitle: {
    color: "#18A974",
    fontSize: 18,
    fontFamily: fonts.semiBold,
    marginBottom: 10,
  },
  validationImage: {
    width: 110,
    height: 110,
    marginBottom: 16,
  },
  validationText: {
    textAlign: "center",
    color: colors.text1,
    fontSize: 14,
    marginBottom: 18,
    lineHeight: 20,
  },
});
