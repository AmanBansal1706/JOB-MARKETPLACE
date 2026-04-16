import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../../theme/worker/colors";
import {
  useFetchWorkerBankDetails,
  useUpdateWorkerBankDetails,
} from "../../../services/WorkerProfileServices";
import { useTranslation } from "../../../hooks/useTranslation";

// Custom Input Component - Outside to prevent recreation on every render
const CustomInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  optional = false,
  optionalLabel = "(Optional)",
  keyboardType = "default",
  filledStyle = false,
}) => (
  <View style={styles.inputWrapper}>
    <View
      style={[styles.inputInnerContainer, filledStyle && styles.inputFilled]}
    >
      <Text style={styles.inputLabel}>
        {label}{" "}
        {optional && <Text style={styles.optionalText}>{optionalLabel}</Text>}
      </Text>
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        placeholderTextColor={colors.auth.gray}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </View>
  </View>
);

export default function AccountDetailsScreen() {
  const navigation = useNavigation();
  const { translate } = useTranslation();

  // Fetch bank details
  const {
    data: bankDetails,
    isPending: isLoadingBankDetails,
    refetch,
  } = useFetchWorkerBankDetails();
  const { mutate: updateBankDetails, isPending: isUpdating } =
    useUpdateWorkerBankDetails();

  // Form State
  const [clabe, setClabe] = useState("");
  const [bankName, setBankName] = useState("");
  const [holderName, setHolderName] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [rfc, setRfc] = useState("");

  // Prefill form from bank details
  useEffect(() => {
    if (bankDetails) {
      setClabe(bankDetails.clabe_no || "");
      setBankName(bankDetails.bank_name || "");
      setHolderName(bankDetails.account_holder_name || "");
      setBillingAddress(bankDetails.billing_address || "");
      setRfc(bankDetails.business_rfc || "");
    }
  }, [bankDetails]);

  // Determine if the form is "valid" - CLABE is required
  const isFormValid = clabe.trim().length > 0;

  const handleSave = () => {
    // Validation: CLABE number is required
    if (!clabe.trim().length > 0) {
      Alert.alert(
        translate("workerCommon.validationError"),
        translate("workerAccountDetails.clabeRequired"),
      );
      return;
    }

    // Validation: CLABE must be exactly 18 digits
    if (clabe.trim().length !== 18) {
      Alert.alert(
        translate("workerCommon.validationError"),
        translate("workerAccountDetails.clabeExactly18"),
      );
      return;
    }

    // Validation: CLABE must contain only digits
    if (!/^\d{18}$/.test(clabe.trim())) {
      Alert.alert(
        translate("workerCommon.validationError"),
        translate("workerAccountDetails.clabeOnlyDigits"),
      );
      return;
    }

    // Validation: Bank name is required
    if (!bankName.trim().length > 0) {
      Alert.alert(
        translate("workerCommon.validationError"),
        translate("workerAccountDetails.bankNameRequired"),
      );
      return;
    }

    // Validation: Billing address is required
    if (!billingAddress.trim().length > 0) {
      Alert.alert(
        translate("workerCommon.validationError"),
        translate("workerAccountDetails.billingAddressRequired"),
      );
      return;
    }

    // Validation: RFC must be exactly 13 characters (if provided)
    if (rfc.trim().length > 0 && rfc.trim().length !== 13) {
      Alert.alert(
        translate("workerCommon.validationError"),
        translate("workerAccountDetails.rfcExactly13"),
      );
      return;
    }

    // Prepare data for API
    const bankData = {
      clabe_no: clabe.trim(),
      bank_name: bankName.trim(),
      account_holder_name: holderName.trim(),
      billing_address: billingAddress.trim(),
      business_rfc: rfc.trim(),
    };

    updateBankDetails(bankData, {
      onSuccess: () => {
        Alert.alert(
          translate("workerCommon.success"),
          translate("workerAccountDetails.bankDetailsUpdated"),
          [
            {
              text: "OK",
              onPress: () => {
                refetch();
                navigation.goBack();
              },
            },
          ],
        );
      },
      onError: (error) => {
        Alert.alert(
          translate("workerCommon.error"),
          error.message ||
            translate("workerAccountDetails.failedUpdateBankDetails"),
        );
      },
    });
  };

  // Show loading state
  if (isLoadingBankDetails) {
    return (
      <View style={styles.mainContainer}>
        <StatusBar style="light" backgroundColor={colors.primary.pink} />
        <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Feather name="arrow-left" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {translate("workerAccountDetails.accountDetails")}
            </Text>
          </View>
        </SafeAreaView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.pink} />
          <Text style={styles.loadingText}>
            {translate("workerAccountDetails.loadingBankDetails")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" backgroundColor={colors.primary.pink} />

      {/* Header */}
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {translate("workerAccountDetails.accountDetails")}
          </Text>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              {translate("workerAccountDetails.bankingInfo")}
            </Text>

            <CustomInput
              label={translate("workerAccountDetails.clabeNumber")}
              placeholder={translate("workerAccountDetails.enterClabe")}
              value={clabe}
              onChangeText={setClabe}
              keyboardType="number-pad"
              filledStyle={clabe.length > 0}
            />

            <CustomInput
              label={translate("workerAccountDetails.bankName")}
              placeholder={translate("workerAccountDetails.enterBankName")}
              value={bankName}
              onChangeText={setBankName}
            />

            <CustomInput
              label={translate("workerAccountDetails.accountHolderName")}
              placeholder={translate("workerAccountDetails.enterHolderName")}
              value={holderName}
              onChangeText={setHolderName}
              optional
              optionalLabel={translate("workerAccountDetails.optional")}
            />

            <CustomInput
              label={translate("workerAccountDetails.billingAddress")}
              placeholder={translate(
                "workerAccountDetails.enterBillingAddress",
              )}
              value={billingAddress}
              onChangeText={setBillingAddress}
            />

            <CustomInput
              label={translate("workerAccountDetails.rfc")}
              placeholder={translate("workerAccountDetails.enterRfc")}
              value={rfc}
              onChangeText={setRfc}
              optional
              optionalLabel={translate("workerAccountDetails.optional")}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              isFormValid && !isUpdating
                ? styles.saveButtonActive
                : styles.saveButtonInactive,
            ]}
            onPress={handleSave}
            disabled={!isFormValid || isUpdating}
            activeOpacity={0.8}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>
                {translate("workerAccountDetails.save")}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.auth.background, // Pinkish background
  },
  headerSafeArea: {
    backgroundColor: colors.primary.pink,
    zIndex: 10,
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: colors.primary.pink,
  },
  backButton: {
    padding: 5,
    marginRight: 15,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: colors.text.primary,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: "center",
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    width: "100%",
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 40,
    minHeight: 500, // Ensure card has height
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary.pink,
    marginBottom: 20,
    textAlign: "left", // Adjusted to left alignment
  },
  inputWrapper: {
    backgroundColor: colors.primary.pink,
    borderRadius: 20,
    paddingHorizontal: 5,
    marginBottom: 20,
    height: 75,
    justifyContent: "center",
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputInnerContainer: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 17,
    paddingHorizontal: 15,
    justifyContent: "center",
  },
  inputFilled: {
    backgroundColor: colors.ui.screenBackground, // Light pink background
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: colors.auth.darkRed,
    marginBottom: 2,
  },
  optionalText: {
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    color: colors.auth.gray,
  },
  textInput: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: colors.text.inputContent,
    padding: 0,
  },
  saveButton: {
    width: "100%",
    height: 55,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  saveButtonActive: {
    backgroundColor: colors.primary.pink,
    shadowColor: colors.primary.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonInactive: {
    backgroundColor: colors.auth.gray, // Dark gray
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
  },
});
