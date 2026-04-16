import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts } from "../../../theme";
import { CommonHeader, ScreenWrapper } from "../../../components/common";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "../../../hooks/useTranslation";
import LoadingState from "../../../components/LoadingState";
import {
  useFetchBankDetails,
  useUpdateBankDetails,
} from "../../../services/ProfileServices";
import { FormInput } from "../../../components/profile";

export default function AccountDetailsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const { translate } = useTranslation();

  // Fetch bank details
  const {
    data: bankDetailsData,
    isPending: isLoadingBankDetails,
    refetch: refetchBankDetails,
  } = useFetchBankDetails();
  const { mutate: updateBankDetails, isPending: isUpdatingBankDetails } =
    useUpdateBankDetails();

  // Form state
  const [formData, setFormData] = useState({
    clabeNo: "",
    bankName: "",
    accountHolderName: "",
    billingAddress: "",
    businessRfc: "",
  });

  const [originalFormData, setOriginalFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load bank details on mount
  useEffect(() => {
    if (bankDetailsData) {
      const loadedData = {
        clabeNo: bankDetailsData.clabe_no || "",
        bankName: bankDetailsData.bank_name || "",
        accountHolderName: bankDetailsData.account_holder_name || "",
        billingAddress: bankDetailsData.billing_address || "",
        businessRfc: bankDetailsData.business_rfc || "",
      };
      setFormData(loadedData);
      setOriginalFormData(loadedData);
      setIsEditing(false);
    }
  }, [bankDetailsData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.clabeNo?.trim()) {
      Alert.alert(
        translate("settings.validation"),
        `CLABE ${translate("settings.required")}`,
      );
      return false;
    }
    if (formData.clabeNo.trim().length !== 18) {
      Alert.alert(
        translate("settings.validation"),
        "The clabe no must be 18 characters.",
      );
      return false;
    }
    if (!formData.bankName?.trim()) {
      Alert.alert(
        translate("settings.validation"),
        `${translate("settings.bankName")} ${translate("settings.required")}`,
      );
      return false;
    }
    if (!formData.accountHolderName?.trim()) {
      Alert.alert(
        translate("settings.validation"),
        `${translate("settings.accountHolder")} ${translate(
          "settings.required",
        )}`,
      );
      return false;
    }
    if (
      formData.businessRfc?.trim() &&
      formData.businessRfc.trim().length !== 13
    ) {
      Alert.alert(
        translate("settings.validation"),
        "The business rfc must be 13 characters.",
      );
      return false;
    }
    return true;
  };

  const handleEditToggle = () => {
    if (isEditing) {
      if (originalFormData) {
        setFormData(originalFormData);
      }
    }
    setIsEditing(!isEditing);
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const payload = {
      clabe_no: formData.clabeNo,
      bank_name: formData.bankName,
      account_holder_name: formData.accountHolderName,
      billing_address: formData.billingAddress,
      business_rfc: formData.businessRfc,
    };

    updateBankDetails(payload, {
      onSuccess: () => {
        setOriginalFormData(formData);
        setIsEditing(false);
        Alert.alert(
          translate("settings.success"),
          `${translate("settings.banking")} ${translate("settings.updated")}`,
        );
        refetchBankDetails();
      },
      onError: (error) => {
        console.error("Update bank details error:", error);
        const errorMessage =
          error?.message ||
          `${translate("settings.failed")} ${translate("settings.banking")}`;
        Alert.alert(translate("settings.error"), errorMessage);
      },
    });
  };

  if (isLoadingBankDetails) {
    return (
      <LoadingState
        title={translate("settings.accountDetails")}
        message={`${translate("common.loading")} ${translate(
          "settings.banking",
        )}...`}
        backgroundColor={colors.bg}
      />
    );
  }

  const isDirty = JSON.stringify(formData) !== JSON.stringify(originalFormData);

  return (
    <ScreenWrapper statusBarBackground={colors.tertiary}>
      <CommonHeader
        title={translate("settings.accountDetails")}
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
                  await refetchBankDetails();
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
            <Text style={styles.subtitle}>
              {isEditing
                ? translate("settings.updateBanking")
                : translate("settings.viewBanking")}
            </Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {translate("settings.banking")}
              </Text>

              <FormInput
                label={translate("settings.clabeNumber")}
                field="clabeNo"
                placeholder={`Enter CLABE number`}
                value={formData.clabeNo}
                onChangeText={(value) => handleInputChange("clabeNo", value)}
                isEditing={isEditing}
                iconName={null}
              />

              <FormInput
                label={translate("settings.bankName")}
                field="bankName"
                placeholder={`Enter bank name`}
                value={formData.bankName}
                onChangeText={(value) => handleInputChange("bankName", value)}
                isEditing={isEditing}
                iconName={null}
              />

              <FormInput
                label={translate("settings.accountHolder")}
                field="accountHolderName"
                placeholder={`Enter account holder name`}
                value={formData.accountHolderName}
                onChangeText={(value) =>
                  handleInputChange("accountHolderName", value)
                }
                isEditing={isEditing}
                iconName={null}
              />

              <FormInput
                label={translate("settings.billingAddress")}
                field="billingAddress"
                placeholder={`Enter billing address`}
                value={formData.billingAddress}
                onChangeText={(value) =>
                  handleInputChange("billingAddress", value)
                }
                isEditing={isEditing}
                iconName={null}
              />

              <FormInput
                label={translate("settings.rfc")}
                field="businessRfc"
                placeholder={`Enter RFC`}
                value={formData.businessRfc}
                onChangeText={(value) =>
                  handleInputChange("businessRfc", value)
                }
                isEditing={isEditing}
                iconName={null}
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
                      disabled={!isDirty || isUpdatingBankDetails}
                    >
                      {isUpdatingBankDetails
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
    backgroundColor: colors.buttonbg2,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  container: {
    padding: 16,
    backgroundColor: colors.bg,
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
});
