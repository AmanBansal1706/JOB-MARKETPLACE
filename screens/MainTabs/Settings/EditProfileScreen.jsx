import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { colors, fonts } from "../../../theme";
import { CommonHeader, ScreenWrapper } from "../../../components/common";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "../../../hooks/useTranslation";
import LoadingState from "../../../components/LoadingState";
import {
  useFetchUserProfile,
  useCompleteProfile,
} from "../../../services/ProfileServices";
import {
  FormInput,
  LocationSelector,
  VerificationStatusBadge,
  ProfilePictureUpload,
} from "../../../components/profile";
import * as ImagePicker from "expo-image-picker";

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { translate } = useTranslation();
  const { mutate: submitProfile, isPending } = useCompleteProfile();
  const {
    data: userProfileData,
    isPending: profileLoading,
    refetch,
  } = useFetchUserProfile();
  const [refreshing, setRefreshing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    workLocation: "",
    location: null,
  });

  const [uploads, setUploads] = useState({
    profilePicture: null,
  });

  const [originalFormData, setOriginalFormData] = useState(null);
  const [originalUploads, setOriginalUploads] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [rejectionReason, setRejectionReason] = useState(null);

  // Load user profile data
  useEffect(() => {
    if (userProfileData) {
      const { user, business_profile } = userProfileData;

      setUserRole(user.role);
      setVerificationStatus(user.verification_status);
      setRejectionReason(user.rejection_reason);

      const loadedFormData = {
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        mobile: user.mobile || "",
        workLocation: business_profile?.address || "",
        location: business_profile
          ? {
              lat: parseFloat(business_profile.lat),
              lng: parseFloat(business_profile.lng),
              address: business_profile.address,
            }
          : null,
      };

      setFormData(loadedFormData);
      setOriginalFormData(loadedFormData);

      // Load profile picture
      const profilePictureUri = user.profile_picture;

      const loadedUploads = {
        profilePicture: profilePictureUri,
      };

      setUploads(loadedUploads);
      setOriginalUploads(loadedUploads);
      setIsEditing(false);
    }
  }, [userProfileData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (location) => {
    setFormData((prev) => ({
      ...prev,
      workLocation: location.address,
      location: {
        lat: location.lat,
        lng: location.lng,
        address: location.address,
      },
    }));
  };

  const validateForm = () => {
    if (!formData.firstName?.trim()) {
      Alert.alert(
        translate("settings.validation"),
        `${translate("common.firstName")} ${translate("settings.required")}`
      );
      return false;
    }
    if (!formData.lastName?.trim()) {
      Alert.alert(
        translate("settings.validation"),
        `${translate("common.lastName")} ${translate("settings.required")}`
      );
      return false;
    }
    if (!formData.email?.trim()) {
      Alert.alert(
        translate("settings.validation"),
        `${translate("common.email")} ${translate("settings.required")}`
      );
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert(
        translate("settings.validation"),
        translate("common.validEmail")
      );
      return false;
    }
    if (!formData.mobile?.trim()) {
      Alert.alert(
        translate("settings.validation"),
        `${translate("common.mobile")} ${translate("settings.required")}`
      );
      return false;
    }
    if (!formData.workLocation?.trim()) {
      Alert.alert(
        translate("settings.validation"),
        `${translate("common.workLocation")} ${translate("settings.required")}`
      );
      return false;
    }
    return true;
  };

  const handleEditToggle = () => {
    if (isEditing) {
      if (originalFormData) setFormData(originalFormData);
      if (originalUploads) setUploads(originalUploads);
    }
    setIsEditing(!isEditing);
  };

  const pickProfilePicture = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        translate("settings.permission"),
        translate("common.permissionGallery")
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setUploads((prev) => ({ ...prev, profilePicture: result.assets[0].uri }));
    }
  };

  const openProfileCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        translate("settings.permission"),
        translate("common.permissionCamera")
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setUploads((prev) => ({ ...prev, profilePicture: result.assets[0].uri }));
    }
  };

  const getUpdatedFields = () => {
    const updatedFields = {};
    const isLocalUri = (uri) => uri && !uri.startsWith("http");

    // Compare each field and only include if changed
    if (formData.firstName !== originalFormData?.firstName) {
      updatedFields.firstName = formData.firstName;
    }
    if (formData.lastName !== originalFormData?.lastName) {
      updatedFields.lastName = formData.lastName;
    }
    if (formData.email !== originalFormData?.email) {
      updatedFields.email = formData.email;
    }
    if (formData.mobile !== originalFormData?.mobile) {
      updatedFields.mobile = formData.mobile;
    }
    if (formData.workLocation !== originalFormData?.workLocation) {
      updatedFields.workLocation = formData.workLocation;
    }
    if (
      JSON.stringify(formData.location) !==
      JSON.stringify(originalFormData?.location)
    ) {
      updatedFields.location = formData.location;
    }

    // Check if profile picture was changed
    if (isLocalUri(uploads.profilePicture)) {
      updatedFields.profilePicture = uploads.profilePicture;
    }

    return updatedFields;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const updatedFields = getUpdatedFields();

    // Check if there are any updates
    if (Object.keys(updatedFields).length === 0) {
      Alert.alert(
        translate("settings.noChanges"),
        translate("settings.noChangesMade")
      );
      return;
    }

    submitProfile(updatedFields, {
      onSuccess: () => {
        setOriginalFormData(formData);
        setOriginalUploads(uploads);
        setIsEditing(false);
        refetch();
        Alert.alert(
          translate("common.success"),
          `${translate("common.profile")} ${translate("settings.updated")}`
        );
      },
      onError: (error) => {
        Alert.alert(
          translate("common.error"),
          error.message ||
            `${translate("settings.failed")} ${translate("common.profile")}`
        );
      },
    });
  };

  if (profileLoading) {
    return (
      <LoadingState
        title={translate("profile.editProfile")}
        message={`${translate("common.loading")} ${translate(
          "common.profile"
        )}...`}
        backgroundColor={colors.bg}
      />
    );
  }

  const isDirty =
    JSON.stringify(formData) !== JSON.stringify(originalFormData) ||
    JSON.stringify(uploads) !== JSON.stringify(originalUploads);

  return (
    <ScreenWrapper statusBarBackground={colors.tertiary}>
      <CommonHeader
        title={translate("profile.editProfile")}
        onBackPress={() => navigation.goBack()}
        backgroundColor={colors.tertiary}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        directionalLockEnabled={true}
        decelerationRate="normal"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              try {
                await refetch();
              } finally {
                setRefreshing(false);
              }
            }}
            tintColor={colors.tertiary}
            colors={[colors.tertiary]}
          />
        }
      >
        <View style={styles.container}>
          <VerificationStatusBadge
            verificationStatus={verificationStatus}
            rejectionReason={rejectionReason}
            userRole={userRole}
          />

          <Text style={styles.subtitle}>
            {isEditing
              ? translate("common.updateProfileInfo")
              : translate("common.viewProfileInfo")}
          </Text>

          <ProfilePictureUpload
            imageUri={uploads.profilePicture}
            onPickImage={pickProfilePicture}
            onOpenCamera={openProfileCamera}
            isEditing={isEditing}
            isLoading={isPending}
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {translate("common.personalInformation")}
            </Text>

            <FormInput
              label={translate("common.firstName")}
              field="firstName"
              placeholder={translate("common.enterFirstName")}
              value={formData.firstName}
              onChangeText={(value) => handleInputChange("firstName", value)}
              isEditing={isEditing && !originalFormData?.firstName}
              disabled={!!originalFormData?.firstName}
            />

            <FormInput
              label={translate("common.lastName")}
              field="lastName"
              placeholder={translate("common.enterLastName")}
              value={formData.lastName}
              onChangeText={(value) => handleInputChange("lastName", value)}
              isEditing={isEditing && !originalFormData?.lastName}
              disabled={!!originalFormData?.lastName}
            />

            <FormInput
              label={translate("common.email")}
              field="email"
              placeholder={translate("common.enterEmail")}
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              isEditing={isEditing && !originalFormData?.email}
              disabled={!!originalFormData?.email}
            />

            <FormInput
              label={translate("common.mobile")}
              field="mobile"
              placeholder={translate("common.enterMobileNumber")}
              value={formData.mobile}
              onChangeText={(value) => handleInputChange("mobile", value)}
              isEditing={isEditing && !originalFormData?.mobile}
              disabled={!!originalFormData?.mobile}
              iconName={null}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {translate("common.locationInformation")}
            </Text>

            <LocationSelector
              label={translate("common.workLocation")}
              placeholder={translate("common.selectLocation")}
              currentLocation={formData.location}
              onLocationChange={handleLocationChange}
              isEditing={isEditing}
              required={true}
            />
          </View>

          <View style={styles.buttonContainer}>
            {!isEditing ? (
              <View style={styles.buttonRow}>
                <View style={styles.buttonWrapper}>
                  <Text
                    onPress={handleEditToggle}
                    style={[styles.button, styles.editButton]}
                  >
                    {translate("settings.edit").toUpperCase()}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.buttonRow}>
                <View style={styles.buttonWrapper}>
                  <Text
                    onPress={handleEditToggle}
                    style={[styles.button, styles.cancelButton]}
                  >
                    {translate("settings.cancel").toUpperCase()}
                  </Text>
                </View>
                <View style={styles.buttonWrapper}>
                  <Text
                    style={[
                      styles.button,
                      styles.saveButton,
                      !isDirty && styles.saveButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={!isDirty || isPending}
                  >
                    {isPending
                      ? translate("settings.saving").toUpperCase()
                      : translate("settings.save").toUpperCase()}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#E8F5F0",
  },
  scrollContent: {
    paddingBottom: 32,
  },
  container: {
    padding: 16,
  },
  subtitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.tertiary,
    marginBottom: 24,
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: "#000",
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  buttonWrapper: {
    flex: 1,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 10,
    textAlign: "center",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  editButton: {
    backgroundColor: colors.tertiary,
    color: "#fff",
  },
  cancelButton: {
    backgroundColor: "#E0E0E0",
    color: colors.textdark,
  },
  saveButton: {
    backgroundColor: colors.tertiary,
    color: "#fff",
  },
  saveButtonDisabled: {
    backgroundColor: "#C9D9D2",
    opacity: 0.6,
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: "#666",
    marginTop: 12,
  },
});
