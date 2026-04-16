import { useState } from "react";
import {
  TouchableOpacity,
  ActivityIndicator,
  Text,
  Alert,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { colors, fonts } from "../../theme";
import { useOrCreateConversation } from "../../hooks/useChat";
import { useFetchWorkerProfile } from "../../services/ProfileServices";
import { useTranslation } from "../../hooks/useTranslation";

export default function MessageWorkerButton({
  workerId,
  buttonText,
  style,
  textStyle,
}) {
  const navigation = useNavigation();
  const { translate } = useTranslation();
  const currentUser = useSelector((state) => state.Auth.user);
  const {
    isPending: isPendingWorkerData,
    data: workerData,
    error: workerError,
  } = useFetchWorkerProfile(workerId);
  const [isLoading, setIsLoading] = useState(false);
  const { startConversation } = useOrCreateConversation();

  const displayText = buttonText || translate("chat.message");

  // Check for loading states
  const isLoadingData = isPendingWorkerData || isLoading;

  // Build applicant data from fetched worker profile
  const applicantData = {
    id: workerId,
    name: workerData?.name || translate("chat.defaultSenderName"),
    email: workerData?.email || "",
    mobile: workerData?.mobile || null,
    profile_picture: workerData?.profile_picture,
  };

  const handleMessageWorker = async () => {
    console.log(
      "💬 Starting conversation with worker ID:",
      workerId,
      "Worker Data:",
      workerData
    );

    // Validation - Check if worker data is loaded
    if (isPendingWorkerData) {
      Alert.alert(
        translate("messages.loadingWorker"),
        translate("messages.pleaseWait")
      );
      return;
    }

    // Validation - Check for worker data fetch error
    if (workerError) {
      Alert.alert(
        translate("common.error"),
        translate("messages.failedLoadWorker")
      );
      console.error("Worker data fetch error:", workerError);
      return;
    }

    // Validation - Check if current user is logged in
    if (!currentUser) {
      Alert.alert(translate("common.error"), translate("messages.pleaseLogin"));
      return;
    }

    // Validation - Check if worker ID is available
    if (!workerId) {
      Alert.alert(
        translate("common.error"),
        translate("messages.workerIdNotAvailable")
      );
      return;
    }

    // Validation - Check if worker data is available
    if (!workerData) {
      Alert.alert(
        translate("common.error"),
        translate("messages.workerInfoMissing")
      );
      return;
    }

    setIsLoading(true);
    try {
      // Create or get conversation with fetched worker data
      const conversationId = await startConversation(workerId, {
        name: applicantData.name,
        email: applicantData.email,
        mobile: applicantData.mobile,
        profile_picture: workerData.profile_picture || null,
      });

      if (conversationId) {
        // Navigate to chat screen
        navigation.navigate("ChatScreen", {
          conversationId,
          otherUser: {
            id: workerId,
            name: applicantData.name,
            profile_picture: workerData.profile_picture || null,
            email: applicantData.email,
          },
        });
      } else {
        Alert.alert(
          translate("common.error"),
          translate("messages.failedStartConversation")
        );
      }
    } catch (err) {
      console.error("❌ Error starting conversation:", err);
      Alert.alert(
        translate("common.error"),
        err.message || translate("messages.failedStartConversation")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, isLoadingData && styles.buttonDisabled, style]}
      onPress={handleMessageWorker}
      disabled={isLoadingData}
      activeOpacity={0.7}
    >
      {isLoadingData ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text style={[styles.buttonText, textStyle]}>{displayText}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.tertiary,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 80,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: "#FFFFFF",
  },
});
