import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { colors, fonts, fontSizes } from "../../../theme";
import { CommonHeader, ScreenWrapper } from "../../../components/common";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "../../../hooks/useTranslation";
import {
  useFetchSupportTickets,
  useCreateSupportTicket,
} from "../../../services/SupportServices";
import { useFetchUserProfile } from "../../../services/ProfileServices";

export default function RaiseTicketScreen({ navigation, route }) {
  const { translate } = useTranslation();
  const [subject, setSubject] = useState("");
  const [desc, setDesc] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [mediaUri, setMediaUri] = useState(null);
  const [subjectOpen, setSubjectOpen] = useState(false);

  // Fetch user profile data
  const { data: userProfileData, isPending: profileLoading } =
    useFetchUserProfile();

  // Create support ticket
  const { mutate: submitTicket, isPending: isSubmitting } =
    useCreateSupportTicket();

  // Refetch tickets
  const { refetch: refetchTickets } = useFetchSupportTickets();

  const isLoading = profileLoading || isSubmitting;

  // Update email and mobile when component mounts
  useEffect(() => {
    if (userProfileData?.user?.email) {
      setEmail(userProfileData.user.email);
    }
    if (userProfileData?.user?.mobile) {
      setMobile(userProfileData.user.mobile);
    }
  }, [userProfileData]);

  const SUBJECT_OPTIONS = [
    translate("support.subjectTechnicalIssue"),
    translate("support.subjectPaymentIssue"),
    translate("support.subjectVerification"),
    translate("support.subjectDocumentUpload"),
    translate("support.subjectProfileSetting"),
    translate("support.subjectPrivacy"),
    translate("support.subjectDataConcerns"),
    translate("support.subjectFeatureRequest"),
    translate("support.subjectFeedback"),
    translate("support.subjectOther"),
  ];

  const isFormValid = subject && desc && email && mobile;

  // Pick image from gallery
  const pickImage = useCallback(async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          translate("support.permissionRequired"),
          translate("support.galleryPermissionRequired")
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setMediaUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(
        translate("common.error"),
        translate("support.failedPickImage")
      );
    }
  }, []);

  // Take photo with camera
  const openCamera = useCallback(async () => {
    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          translate("support.permissionRequired"),
          translate("support.cameraPermissionRequired")
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setMediaUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error opening camera:", error);
      Alert.alert(
        translate("common.error"),
        translate("support.failedOpenCamera")
      );
    }
  }, []);

  // Remove selected media
  const removeMedia = useCallback(() => {
    setMediaUri(null);
  }, []);

  // Handle form submission
  const handleSubmit = () => {
    if (!isFormValid) {
      Alert.alert(
        translate("support.validationError"),
        translate("support.fillRequiredFields")
      );
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(
        translate("support.validationError"),
        translate("support.invalidEmailAddress")
      );
      return;
    }

    // Mobile validation (10-15 digits)
    const mobileRegex = /^\d{10,15}$/;
    if (!mobileRegex.test(mobile.replace(/\D/g, ""))) {
      Alert.alert(
        translate("support.validationError"),
        translate("support.invalidMobileNumber")
      );
      return;
    }

    submitTicket(
      {
        subject,
        description: desc,
        email,
        mobile,
        media: mediaUri,
      },
      {
        onSuccess: () => {
          Alert.alert(
            translate("common.success"),
            translate("support.ticketSubmitted"),
            [
              {
                text: "OK",
                onPress: () => {
                  resetForm();
                  refetchTickets();
                  navigation.goBack?.();
                },
              },
            ]
          );
        },
        onError: (error) => {
          Alert.alert(
            translate("common.error"),
            error.message || translate("support.submitError")
          );
        },
      }
    );
  };

  // Reset form
  const resetForm = () => {
    setSubject("");
    setDesc("");
    setEmail(userProfileData?.user?.email || "");
    setMobile(userProfileData?.user?.mobile || "");
    setMediaUri(null);
    setSubjectOpen(false);
  };

  // Handle back press
  const handleBackPress = () => {
    if (isLoading) return;
    navigation.goBack?.();
  };

  if (profileLoading) {
    return (
      <ScreenWrapper statusBarBackground={colors.tertiary}>
        <CommonHeader
          title={translate("support.raiseNewTicket")}
          onBackPress={handleBackPress}
          backgroundColor={colors.tertiary}
        />
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={colors.tertiary} />
          <Text style={styles.loadingText}>{translate("common.loading")}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper statusBarBackground={colors.tertiary}>
      <CommonHeader
        title={translate("support.raiseNewTicket")}
        onBackPress={handleBackPress}
        backgroundColor={colors.tertiary}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!isLoading}
        scrollEventThrottle={16}
        directionalLockEnabled={true}
        decelerationRate="normal"
      >
        <View style={styles.container}>
          {/* Subject Field */}
          <Text style={styles.label}>
            {translate("support.subject")}{" "}
            <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.dropdownWrap}>
            <Pressable
              style={[styles.inputRow, styles.inputBorder]}
              onPress={() => !isLoading && setSubjectOpen((p) => !p)}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.placeholder,
                  subject && { color: colors.textdark },
                ]}
              >
                {subject || translate("support.selectIssueType")}
              </Text>
              <Text style={styles.dropdownIcon}>{subjectOpen ? "▲" : "▾"}</Text>
            </Pressable>

            {subjectOpen && !isLoading && (
              <View style={styles.dropdownPanel}>
                {SUBJECT_OPTIONS.map((opt, idx) => {
                  const isSelected = subject === opt;
                  return (
                    <Pressable
                      key={opt}
                      style={[
                        styles.dropdownItem,
                        isSelected && styles.dropdownItemSelected,
                        idx === SUBJECT_OPTIONS.length - 1 && {
                          borderBottomWidth: 0,
                        },
                      ]}
                      onPress={() => {
                        setSubject(opt);
                        setSubjectOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          isSelected && styles.dropdownItemTextSelected,
                        ]}
                      >
                        {opt}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          {/* Description Field */}
          <Text style={styles.label}>
            {translate("support.description")}{" "}
            <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.inputBox, styles.inputBorder, { height: 88 }]}
            placeholder={translate("support.describeIssueDetail")}
            placeholderTextColor="#9AC7B8"
            multiline
            editable={!isLoading}
            value={desc}
            onChangeText={setDesc}
          />

          {/* Email Field */}
          <Text style={styles.label}>
            {translate("support.emailId")}{" "}
            <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.inputBox,
              styles.inputBorder,
              userProfileData?.user?.email && styles.inputDisabled,
            ]}
            placeholder={translate("support.enterEmailId")}
            placeholderTextColor="#9AC7B8"
            keyboardType="email-address"
            editable={!isLoading && !userProfileData?.user?.email}
            value={email}
            onChangeText={setEmail}
          />

          {/* Mobile Field */}
          <Text style={styles.label}>
            {translate("support.mobileNumber")}{" "}
            <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.inputBox,
              styles.inputBorder,
              userProfileData?.user?.mobile && styles.inputDisabled,
            ]}
            placeholder={translate("support.enterMobileNumber")}
            placeholderTextColor="#9AC7B8"
            keyboardType="phone-pad"
            editable={!isLoading && !userProfileData?.user?.mobile}
            value={mobile}
            onChangeText={setMobile}
            maxLength={15}
          />

          {/* Media Upload Section */}
          <Text style={styles.label}>
            {translate("support.mediaAttachment")}
          </Text>

          {mediaUri ? (
            <View style={styles.mediaPreviewContainer}>
              <Image source={{ uri: mediaUri }} style={styles.mediaPreview} />
              <Pressable
                style={styles.removeMediaBtn}
                onPress={removeMedia}
                disabled={isLoading}
              >
                <Text style={styles.removeMediaBtnText}>✕</Text>
              </Pressable>
              <Text style={styles.mediaFileName}>
                {translate("support.fileSelected")}
              </Text>
            </View>
          ) : (
            <View style={styles.uploadButtonsContainer}>
              <Pressable
                style={[
                  styles.uploadButton,
                  styles.galleryButton,
                  isLoading && { opacity: 0.5 },
                ]}
                onPress={pickImage}
                disabled={isLoading}
              >
                <MaterialCommunityIcons
                  name="image-multiple"
                  size={28}
                  color={colors.tertiary}
                  style={styles.uploadButtonIconStyle}
                />
                <Text style={styles.uploadButtonText}>
                  {translate("support.gallery")}
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.uploadButton,
                  styles.cameraButton,
                  isLoading && { opacity: 0.5 },
                ]}
                onPress={openCamera}
                disabled={isLoading}
              >
                <MaterialCommunityIcons
                  name="camera"
                  size={28}
                  color={colors.tertiary}
                  style={styles.uploadButtonIconStyle}
                />
                <Text style={styles.uploadButtonText}>
                  {translate("support.camera")}
                </Text>
              </Pressable>
            </View>
          )}

          {/* Submit Button */}
          <Pressable
            disabled={!isFormValid || isLoading}
            style={[
              styles.submitBtn,
              (!isFormValid || isLoading) && { opacity: 0.6 },
            ]}
            onPress={handleSubmit}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <Text style={styles.submitText}>
                {translate("support.submitTicket")}
              </Text>
            )}
          </Pressable>

          {/* Cancel Button */}
          <Pressable
            disabled={isLoading}
            style={[styles.cancelBtn, isLoading && { opacity: 0.6 }]}
            onPress={handleBackPress}
          >
            <Text style={styles.cancelText}>{translate("common.cancel")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  container: {
    padding: 16,
    backgroundColor: colors.bg,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textdark,
    marginTop: 12,
  },

  // Label & Input Styles
  label: {
    fontFamily: fonts.semiBold,
    color: colors.textdark,
    marginBottom: 8,
    fontSize: fontSizes.sm,
    includeFontPadding: false,
  },
  required: {
    color: colors.bbg4,
    fontFamily: fonts.bold,
  },
  inputRow: {
    minHeight: 44,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.text,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  inputBox: {
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colors.text,
    color: colors.textdark,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  inputBorder: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  inputDisabled: {
    backgroundColor: "#F5F5F5",
    color: colors.text1,
  },
  placeholder: {
    color: colors.text1,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
  },

  // Dropdown Styles
  dropdownIcon: {
    color: colors.buttonbg1,
    fontSize: 16,
    marginLeft: 8,
  },
  dropdownWrap: {
    position: "relative",
    zIndex: 1000,
    marginBottom: 12,
  },
  dropdownPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 50,
    backgroundColor: colors.text,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 20,
    zIndex: 2000,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    maxHeight: 380,
  },
  dropdownItem: {
    backgroundColor: "transparent",
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dropdownItemSelected: {
    backgroundColor: colors.bbg6,
  },
  dropdownItemText: {
    color: colors.textdark,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
  },
  dropdownItemTextSelected: {
    color: colors.tertiary,
    fontFamily: fonts.semiBold,
  },

  // Media Upload Styles
  uploadButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  galleryButton: {
    borderColor: colors.tertiary,
    backgroundColor: colors.bbg6,
  },
  cameraButton: {
    borderColor: colors.tertiary,
    backgroundColor: colors.bbg6,
  },
  uploadButtonIconStyle: {
    marginBottom: 4,
  },
  uploadButtonText: {
    color: colors.tertiary,
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.sm,
  },
  mediaPreviewContainer: {
    position: "relative",
    marginBottom: 12,
    alignItems: "center",
  },
  mediaPreview: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    backgroundColor: colors.bbg6,
  },
  removeMediaBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.bbg4,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  removeMediaBtnText: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  mediaFileName: {
    marginTop: 8,
    color: colors.tertiary,
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.sm,
  },

  // Button Styles
  submitBtn: {
    alignSelf: "center",
    width: "100%",
    backgroundColor: colors.tertiary,
    borderRadius: 10,
    minHeight: 44,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  submitText: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.md,
  },
  cancelBtn: {
    alignSelf: "center",
    width: "100%",
    backgroundColor: colors.bbg6,
    borderRadius: 10,
    minHeight: 44,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cancelText: {
    color: colors.textdark,
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.md,
  },
});
