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
import { useTranslation } from "../../hooks/useTranslation";

export default function MessageBusinessButton({
  businessId,
  businessName,
  businessEmail,
  businessProfile,
  buttonText,
  style,
  textStyle,
}) {
  const navigation = useNavigation();
  const { translate } = useTranslation();
  const currentUser = useSelector((state) => state.Auth.user);
  const [isLoading, setIsLoading] = useState(false);
  const { startConversation } = useOrCreateConversation();

  const displayText = buttonText || translate("chat.message");

  // Build business data
  const businessData = {
    id: businessId,
    name: businessName || translate("chat.defaultSenderName"),
    email: businessEmail || "",
    profile_picture: businessProfile || null,
  };

  const handleMessageBusiness = async () => {
    console.log(
      "💬 Starting conversation with business ID:",
      businessId,
      "Business Data:",
      businessData,
    );

    // Validation - Check if current user is logged in
    if (!currentUser) {
      Alert.alert(translate("common.error"), translate("messages.pleaseLogin"));
      return;
    }

    // Validation - Check if business ID is available
    if (!businessId) {
      Alert.alert(
        translate("common.error"),
        translate("messages.businessIdNotAvailable"),
      );
      return;
    }

    // Validation - Check if business name is available
    if (!businessName) {
      Alert.alert(
        translate("common.error"),
        translate("messages.businessInfoMissing"),
      );
      return;
    }

    setIsLoading(true);
    try {
      // Create or get conversation with business
      const conversationId = await startConversation(businessId, {
        name: businessData.name,
        email: businessData.email,
        profile_picture: businessData.profile_picture || null,
      });

      if (conversationId) {
        // Navigate to chat screen
        navigation.navigate("ChatScreen", {
          conversationId,
          otherUser: {
            id: businessId,
            name: businessData.name,
            profile_picture: businessData.profile_picture || null,
            email: businessData.email,
          },
        });
      } else {
        Alert.alert(
          translate("common.error"),
          translate("messages.failedStartConversation"),
        );
      }
    } catch (err) {
      console.error("❌ Error starting conversation:", err);
      Alert.alert(
        translate("common.error"),
        err.message || translate("messages.failedStartConversation"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, isLoading && styles.buttonDisabled, style]}
      onPress={handleMessageBusiness}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
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
