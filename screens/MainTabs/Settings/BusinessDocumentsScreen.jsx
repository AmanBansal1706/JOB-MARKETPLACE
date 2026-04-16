import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
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
  DocumentUpload,
  VerificationStatusBadge,
} from "../../../components/profile";

export default function BusinessDocumentsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  const { translate } = useTranslation();
  const { mutate: submitProfile, isPending } = useCompleteProfile();
  const {
    data: userProfileData,
    isPending: profileLoading,
    refetch,
  } = useFetchUserProfile();
  const [refreshing, setRefreshing] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "",
    businessDescription: "",
    curp: "",
    businessRFC: "",
  });

  const [uploads, setUploads] = useState({
    idFront: null,
    idBack: null,
    selfie: null,
  });

  const [documentStatuses, setDocumentStatuses] = useState({
    idFront: null,
    idBack: null,
    selfie: null,
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
      const { business_profile, kyc_documents, user } = userProfileData;

      setUserRole(user.role);
      setVerificationStatus(user.verification_status);
      setRejectionReason(user.rejection_reason);

      const loadedFormData = {
        businessName: business_profile?.business_name || "",
        businessDescription: business_profile?.business_description || "",
        curp: business_profile?.curp || "",
        businessRFC: business_profile?.rfc || "",
      };

      setFormData(loadedFormData);
      setOriginalFormData(loadedFormData);

      if (kyc_documents && kyc_documents.length > 0) {
        const govIdDocs = kyc_documents.filter((doc) => doc.type === "gov_id");
        const selfieDocs = kyc_documents.filter((doc) => doc.type === "selfie");

        const loadedUploads = {
          idFront: govIdDocs[0]?.file_path,
          idBack: govIdDocs[1]?.file_path,
          selfie: selfieDocs[0]?.file_path,
        };

        setUploads(loadedUploads);
        setOriginalUploads(loadedUploads);

        setDocumentStatuses({
          idFront: govIdDocs[0] || null,
          idBack: govIdDocs[1] || null,
          selfie: selfieDocs[0] || null,
        });
      }

      // Check verification status - allow editing if incomplete or rejected
      const isIncompleteOrRejected =
        user.verification_status === "incomplete" ||
        user.verification_status === "rejected";

      // Check if any required data is missing - if so, open edit mode by default
      // const hasAllData =
      //   loadedFormData.businessName &&
      //   loadedFormData.businessDescription &&
      //   loadedFormData.curp &&
      //   loadedFormData.businessRFC;

      // Set editing to true if incomplete/rejected OR if data is missing
      // const shouldEdit = isIncompleteOrRejected || !hasAllData;
      const shouldEdit = isIncompleteOrRejected;
      setIsEditing(shouldEdit);
    }
  }, [userProfileData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditToggle = () => {
    // Prevent toggling out of edit mode if status is incomplete or rejected
    const isIncompleteOrRejected =
      verificationStatus === "incomplete" || verificationStatus === "rejected";

    if (isEditing && isIncompleteOrRejected) {
      Alert.alert(
        translate("settings.validation"),
        `${translate("settings.businessDocuments")} ${translate(
          "settings.required",
        )}`,
      );
      return;
    }

    if (isEditing) {
      if (originalFormData) setFormData(originalFormData);
      if (originalUploads) setUploads(originalUploads);
    }
    setIsEditing(!isEditing);
  };

  const pickImage = async (type) => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        translate("settings.permission"),
        translate("settings.permissionGallery"),
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
      setUploads((prev) => ({ ...prev, [type]: result.assets[0].uri }));
    }
  };

  const openCamera = async (type) => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        translate("settings.permission"),
        translate("settings.permissionCamera"),
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setUploads((prev) => ({ ...prev, [type]: result.assets[0].uri }));
    }
  };

  const validateForm = () => {
    if (!formData.businessName?.trim()) {
      Alert.alert(
        translate("settings.validation"),
        `${translate("settings.businessName")} ${translate(
          "settings.required",
        )}`,
      );
      return false;
    }
    if (!formData.businessDescription?.trim()) {
      Alert.alert(
        translate("settings.validation"),
        `${translate("settings.businessDescription")} ${translate(
          "settings.required",
        )}`,
      );
      return false;
    }
    if (formData.businessDescription.trim().length < 10) {
      Alert.alert(
        translate("settings.validation"),
        `${translate(
          "settings.businessDescription",
        )} must be at least 10 characters`,
      );
      return false;
    }
    if (!formData.curp?.trim()) {
      Alert.alert(
        translate("settings.validation"),
        `${translate("settings.curp")} ${translate("settings.required")}`,
      );
      return false;
    }
    if (formData.curp.length !== 18) {
      Alert.alert(
        translate("settings.validation"),
        `${translate("settings.curp")} must be exactly 18 characters`,
      );
      return false;
    }
    if (!formData.businessRFC?.trim()) {
      Alert.alert(
        translate("settings.validation"),
        `${translate("settings.businessRFC")} ${translate("settings.required")}`,
      );
      return false;
    }
    if (
      formData.businessRFC.length !== 12 &&
      formData.businessRFC.length !== 13
    ) {
      Alert.alert(
        translate("settings.validation"),
        `${translate("settings.businessRFC")} must be 12-13 characters`,
      );
      return false;
    }
    if (!uploads.idFront) {
      Alert.alert(
        translate("settings.validation"),
        `${translate("settings.govIdFront")} ${translate("settings.required")}`,
      );
      return false;
    }
    if (!uploads.idBack) {
      Alert.alert(
        translate("settings.validation"),
        `${translate("settings.govIdBack")} ${translate("settings.required")}`,
      );
      return false;
    }
    if (!uploads.selfie) {
      Alert.alert(
        translate("settings.validation"),
        `${translate("settings.selfie")} ${translate("settings.required")}`,
      );
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const isLocalUri = (uri) => uri && !uri.startsWith("http");

    const getUpdatedFields = () => {
      const updatedFields = {};

      // Check form fields
      if (formData.businessName !== originalFormData?.businessName) {
        updatedFields.businessName = formData.businessName;
      }
      if (
        formData.businessDescription !== originalFormData?.businessDescription
      ) {
        updatedFields.businessDescription = formData.businessDescription;
      }
      if (formData.curp !== originalFormData?.curp) {
        updatedFields.curp = formData.curp;
      }
      if (formData.businessRFC !== originalFormData?.businessRFC) {
        updatedFields.businessRFC = formData.businessRFC;
      }

      // Check documents (only local URIs are new uploads)
      if (isLocalUri(uploads.idFront)) {
        updatedFields.idFront = uploads.idFront;
      }
      if (isLocalUri(uploads.idBack)) {
        updatedFields.idBack = uploads.idBack;
      }
      if (isLocalUri(uploads.selfie)) {
        updatedFields.selfie = uploads.selfie;
      }

      return updatedFields;
    };

    const updatedFields = getUpdatedFields();

    // Check if there are any updates
    if (Object.keys(updatedFields).length === 0) {
      Alert.alert(
        translate("settings.noChanges"),
        translate("settings.noChangesMade"),
      );
      return;
    }

    submitProfile(updatedFields, {
      onSuccess: () => {
        setOriginalFormData(formData);
        setOriginalUploads(uploads);
        setIsEditing(false);
        Alert.alert(
          translate("settings.success"),
          `${translate("settings.businessDocuments")} ${translate(
            "settings.updated",
          )}`,
        );
      },
      onError: (error) => {
        Alert.alert(
          translate("settings.error"),
          error.message ||
            `${translate("settings.failed")} ${translate(
              "settings.businessDocuments",
            )}`,
        );
      },
    });
  };

  if (profileLoading) {
    return (
      <LoadingState
        title={translate("settings.businessDocuments")}
        message={`${translate("common.loading")} ${translate(
          "settings.businessInfo",
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
        title={translate("settings.businessDocuments")}
        onBackPress={() => navigation.goBack()}
        backgroundColor={colors.tertiary}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(32, insets.bottom + 16) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          scrollEnabled={true}
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
                ? translate("settings.updateBusiness")
                : translate("settings.viewBusiness")}
            </Text>

            <View style={styles.section}>
              {/* <Text style={styles.sectionTitle}>
              {translate("settings.businessInfo")}
            </Text> */}

              <FormInput
                label={translate("settings.businessName")}
                field="businessName"
                placeholder={`Enter ${translate(
                  "settings.businessName",
                ).toLowerCase()}`}
                value={formData.businessName}
                onChangeText={(value) =>
                  handleInputChange("businessName", value)
                }
                isEditing={isEditing}
                iconName={null}
              />

              <FormInput
                label={translate("settings.businessDescription")}
                field="businessDescription"
                placeholder={`Describe your ${translate(
                  "settings.businessName",
                ).toLowerCase()}...`}
                value={formData.businessDescription}
                onChangeText={(value) =>
                  handleInputChange("businessDescription", value)
                }
                isEditing={isEditing}
                iconName={null}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.section}>
              {/* <Text style={styles.sectionTitle}>
              {translate("settings.taxInfo")}
            </Text> */}

              <FormInput
                label={translate("settings.curp")}
                field="curp"
                placeholder={`Enter ${translate(
                  "settings.curp",
                ).toLowerCase()}`}
                value={formData.curp}
                onChangeText={(value) => handleInputChange("curp", value)}
                isEditing={isEditing}
                iconName={null}
              />

              <FormInput
                label={translate("settings.businessRFC")}
                field="businessRFC"
                placeholder={`Enter ${translate(
                  "settings.businessRFC",
                ).toLowerCase()}`}
                value={formData.businessRFC}
                onChangeText={(value) =>
                  handleInputChange("businessRFC", value)
                }
                isEditing={isEditing}
                iconName={null}
              />
            </View>

            <View style={styles.uploadSection}>
              {/* <Text style={styles.sectionTitle}>
              {translate("settings.kycDocuments")}
            </Text> */}

              <DocumentUpload
                label={translate("settings.govIdFront")}
                imageUri={uploads.idFront}
                docStatus={documentStatuses.idFront}
                isEditing={isEditing}
                onPickImage={() => pickImage("idFront")}
                onOpenCamera={() => openCamera("idFront")}
              />

              <DocumentUpload
                label={translate("settings.govIdBack")}
                imageUri={uploads.idBack}
                docStatus={documentStatuses.idBack}
                isEditing={isEditing}
                onPickImage={() => pickImage("idBack")}
                onOpenCamera={() => openCamera("idBack")}
              />

              <DocumentUpload
                label={translate("settings.selfie")}
                imageUri={uploads.selfie}
                docStatus={documentStatuses.selfie}
                isEditing={isEditing}
                onPickImage={() => pickImage("selfie")}
                onOpenCamera={() => openCamera("selfie")}
              />
            </View>

            <View style={styles.buttonContainer}>
              {!isEditing ? (
                <View style={styles.buttonRow}>
                  {/* <View style={styles.buttonWrapper}>
                    <Text
                      onPress={handleEditToggle}
                      style={[styles.button, styles.editButton]}
                    >
                      {translate("settings.edit").toUpperCase()}
                    </Text>
                  </View> */}
                </View>
              ) : (
                <View style={styles.buttonRow}>
                  <View style={styles.buttonWrapper}>
                    <Text
                      onPress={
                        !(
                          verificationStatus === "incomplete" ||
                          verificationStatus === "rejected"
                        )
                          ? handleEditToggle
                          : null
                      }
                      style={[
                        styles.button,
                        styles.cancelButton,
                        (verificationStatus === "incomplete" ||
                          verificationStatus === "rejected") && {
                          opacity: 0.5,
                        },
                      ]}
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
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#E8F5F0",
  },
  scrollContent: {
    flexGrow: 1,
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
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: "#000",
    marginBottom: 16,
  },
  uploadSection: {
    // marginTop: 8,
    marginBottom: 12,
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
});
