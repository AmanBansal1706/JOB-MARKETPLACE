import React from "react";
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { colors, fonts, fontSizes } from "../../theme";
import { sharedAuthPalette } from "../../theme/sharedTheme";
import { LinearGradient } from "expo-linear-gradient";
import CustomButton from "../../components/button";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import CustomCheckbox from "../../components/CustomCheckbox";
import { useRegister } from "../../services/AuthServices";
import { useDispatch } from "react-redux";
import { SetSessionToken } from "../../store/Auth";
import { Ionicons } from "@expo/vector-icons";
import { validateRegistrationForm } from "../../utils/authValidation";
import { useTranslation } from "../../hooks/useTranslation";

export default function CreateAccountScreen({ route }) {
  const { height, width } = useWindowDimensions();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { role: routeRole = "business" } = route?.params || {};
  const { mutate: registerMutate, isPending } = useRegister(routeRole);
  const { translate } = useTranslation();

  const [isChecked, setIsChecked] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);

  const handleTermsPress = () => {
    navigation.navigate("TermsAndConditions");
  };

  const handleRegister = () => {
    // Validation
    const { isValid, errors } = validateRegistrationForm({
      firstName,
      lastName,
      email,
      mobile,
      password,
      confirmPassword,
      isTermsAccepted: isChecked,
      businessName: routeRole === "business" ? businessName : undefined,
    });

    if (!isValid) {
      const errorMessage = Object.values(errors).join("\n");
      Alert.alert(translate("common.error"), errorMessage);
      return;
    }

    let registrationData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      mobile: mobile,
      password: password,
      password_confirmation: confirmPassword,
      role: routeRole,
    };

    if (routeRole === "business" && businessName.trim() !== "") {
      registrationData.business_name = businessName.trim();
    }

    registerMutate(registrationData, {
      onSuccess: (response) => {
        // Store session token for OTP verification
        if (response.session_token || response.data?.session_token) {
          dispatch(
            SetSessionToken(
              response.session_token || response.data.session_token,
            ),
          );
        }

        // Show OTP in alert for development/testing
        const otp = response.otp || response.data?.otp;
        const otpMessage = otp ? `\n\nOTP: ${otp}` : "";

        Alert.alert(
          translate("auth.registerSuccess"),
          `${
            response.message || translate("messages.selectLanguageMessage")
          }${otpMessage}`,
          [
            {
              text: translate("auth.verifyOtp"),
              onPress: () => {
                navigation.navigate("OtpVerificationScreen", {
                  mobile: mobile,
                  purpose: "registration",
                });
              },
            },
          ],
        );
      },
      onError: (error) => {
        Alert.alert(
          translate("auth.registerFailed"),
          error.message || translate("auth.registerFailed"),
        );
      },
    });
  };

  const isFormValid = validateRegistrationForm({
    firstName,
    lastName,
    email,
    mobile,
    password,
    confirmPassword,
    isTermsAccepted: isChecked,
    businessName: routeRole === "business" ? businessName : undefined,
  }).isValid;

  const palette = sharedAuthPalette;
  const headerHeight = Math.min(height * 0.25, 250);
  const bodyHorizontalPadding = Math.max(20, width * 0.07);
  const rawFormWidth = Math.max(width - bodyHorizontalPadding * 2, 240);
  const formWidth = Math.min(rawFormWidth, 360);
  const headerLogoPadding = Math.max(12, headerHeight * 0.1);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "white" }}
      edges={["top", "left", "right"]}
    >
      <StatusBar style="dark" backgroundColor={palette.screenBg} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* White header with logo + circle curve transition */}
        <View
          style={[
            styles.headerContainer,
            { height: headerHeight, overflow: "hidden" },
          ]}
        >
          <View
            style={[
              styles.headerContent,
              { paddingTop: headerLogoPadding, backgroundColor: "white" },
            ]}
          >
            <View
              style={{
                position: "absolute",
                backgroundColor: palette.cardGradientStart,
                width: 600,
                height: 600,
                bottom: -560,
                borderRadius: 300,
              }}
            />
            <Image
              style={{ width: 250, height: 80, resizeMode: "contain" }}
              source={require("../../assets/logo.png")}
            />
          </View>
        </View>

        <LinearGradient
          colors={[palette.cardGradientStart, palette.cardGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 50 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.body}>
              <Text style={styles.text}>{translate("auth.createAccount")}</Text>
              <Text style={styles.text1}>
                {translate("auth.letsCreateAccount")}
              </Text>
            </View>

            {routeRole === "business" && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  {translate("auth.businessNameOptional")}
                </Text>
                <TextInput
                  style={[styles.input, { width: formWidth }]}
                  value={businessName}
                  onChangeText={setBusinessName}
                  placeholder=""
                  placeholderTextColor={palette.placeholder}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {routeRole === "business"
                  ? translate("auth.firstNameRepresentative")
                  : translate("auth.worker.firstName")}
              </Text>
              <TextInput
                style={[styles.input, { width: formWidth }]}
                value={firstName}
                onChangeText={setFirstName}
                placeholder=""
                placeholderTextColor={palette.placeholder}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {routeRole === "business"
                  ? translate("auth.lastNameRepresentative")
                  : translate("auth.worker.lastName")}
              </Text>
              <TextInput
                style={[styles.input, { width: formWidth }]}
                value={lastName}
                onChangeText={setLastName}
                placeholder=""
                placeholderTextColor={palette.placeholder}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {translate("auth.emailRequired")}
              </Text>
              <TextInput
                style={[styles.input, { width: formWidth }]}
                value={email}
                onChangeText={setEmail}
                placeholder=""
                placeholderTextColor={palette.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {translate("auth.mobileRequired")}
              </Text>
              <TextInput
                style={[styles.input, { width: formWidth }]}
                value={mobile}
                onChangeText={setMobile}
                placeholder=""
                placeholderTextColor={palette.placeholder}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {translate("auth.passwordRequired")}
              </Text>
              <View style={{ position: "relative" }}>
                <TextInput
                  style={[styles.input, { width: formWidth, paddingRight: 40 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder=""
                  placeholderTextColor={palette.placeholder}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color={palette.placeholder}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {translate("auth.confirmPasswordRequired")}
              </Text>
              <View style={{ position: "relative" }}>
                <TextInput
                  style={[styles.input, { width: formWidth, paddingRight: 40 }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder=""
                  placeholderTextColor={palette.placeholder}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye" : "eye-off"}
                    size={20}
                    color={palette.placeholder}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.termsRow}>
              <CustomCheckbox value={isChecked} onValueChange={setIsChecked} />
              <Text style={styles.termsText}>
                {translate("auth.termsText").replace("{newline}", "\n")}{" "}
                <Text style={styles.termsLink} onPress={handleTermsPress}>
                  {translate("auth.termsLink")}
                </Text>
                .
              </Text>
            </View>

            <CustomButton
              title={
                isPending
                  ? translate("common.loading")
                  : translate("auth.registerButton")
              }
              textStyle={styles.buttonText}
              disabled={!isFormValid || isPending}
              style={[
                styles.button,
                { width: formWidth },
                (!isFormValid || isPending) && styles.registerBtnDisabled,
              ]}
              onPress={handleRegister}
            />

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>
                {translate("auth.alreadyHaveAccount")}{" "}
                <Text
                  style={styles.loginLink}
                  onPress={() => navigation.navigate("LoginScreen")}
                >
                  {translate("auth.loginLink")}
                </Text>
              </Text>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: sharedAuthPalette.cardGradientStart,
  },
  headerContainer: {
    position: "relative",
    zIndex: 1,
  },
  headerContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  appTitle: {
    fontSize: fontSizes.xxxl,
    fontFamily: fonts.semiBold,
    letterSpacing: 2,
  },
  body: {
    // top: -12,
    marginBottom: 40,
  },
  text: {
    fontSize: fontSizes.xxl,
    letterSpacing: 1,
    fontFamily: fonts.semiBold,
    color: sharedAuthPalette.headingText,
    alignSelf: "center",
  },
  text1: {
    fontSize: fontSizes.md,
    alignSelf: "center",
    color: sharedAuthPalette.bodyText,
    marginTop: 4,
  },

  input: {
    color: sharedAuthPalette.headingText,
    backgroundColor: sharedAuthPalette.surface,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    minHeight: 48,
    marginBottom: 16,
    alignSelf: "center",
    elevation: 4,
    shadowColor: sharedAuthPalette.inputShadow,
    shadowOpacity: sharedAuthPalette.inputShadowOpacity,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 14,
  },
  eyeIcon: {
    position: "absolute",
    right: 42,
    top: 14,
  },
  inputContainer: {
    marginBottom: -2,
  },
  label: {
    marginLeft: 45,
    marginBottom: 6,
    fontSize: fontSizes.xs,
    color: sharedAuthPalette.labelText,
    fontFamily: fonts.semiBold,
  },

  termsRow: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    marginHorizontal: 50,
    marginBottom: 12,
  },

  termsText: {
    fontSize: fontSizes.xss,
    color: sharedAuthPalette.bodyText,
    lineHeight: 16,
    fontFamily: fonts.regular,
  },

  termsLink: {
    color: sharedAuthPalette.link,
    fontFamily: fonts.bold,
  },
  button: {
    alignSelf: "center",
    backgroundColor: sharedAuthPalette.primaryButton,
    minHeight: 48,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: sharedAuthPalette.buttonShadow,
    shadowOpacity: sharedAuthPalette.buttonShadowOpacity,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    elevation: 6,
  },
  buttonText: {
    color: sharedAuthPalette.surface,
    fontFamily: fonts.bold,
    fontSize: fontSizes.md,
    letterSpacing: 1,
  },
  registerBtnDisabled: {
    opacity: 0.5,
  },
  loginRow: {
    alignItems: "center",
    marginTop: 16,
  },
  loginText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xs,
    color: sharedAuthPalette.footerText,
  },
  loginLink: {
    color: sharedAuthPalette.link,
    fontFamily: fonts.semiBold,
  },
  uploadButton: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 15,
    marginTop: 5,
  },
  uploadText: {
    fontSize: fontSizes.xs,
    color: sharedAuthPalette.link,
    fontFamily: fonts.semiBold,
    textDecorationLine: "underline",
  },
  imageSelectedText: {
    fontSize: fontSizes.xs,
    color: sharedAuthPalette.link,
    fontFamily: fonts.semiBold,
    textAlign: "center",
    marginTop: 5,
  },
  // Role Selection Styles
  roleContainer: {
    marginTop: 15,
    marginBottom: 20,
    alignItems: "center",
  },
  roleLabel: {
    fontSize: fontSizes.xs,
    color: sharedAuthPalette.bodyText,
    fontFamily: fonts.semiBold,
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: "row",
    gap: 15,
  },
  roleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    backgroundColor: sharedAuthPalette.surface,
    borderWidth: 2,
    borderColor: sharedAuthPalette.surface,
    minWidth: 120,
    gap: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  roleButtonActive: {
    backgroundColor: sharedAuthPalette.primaryButton,
    borderColor: sharedAuthPalette.primaryButton,
  },
  roleButtonText: {
    fontSize: fontSizes.sm,
    color: sharedAuthPalette.bodyText,
    fontFamily: fonts.semiBold,
  },
  roleButtonTextActive: {
    color: sharedAuthPalette.surface,
    fontFamily: fonts.bold,
  },
  // Profile Picture Styles
  profilePictureContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  profileLabel: {
    fontSize: fontSizes.xs,
    color: sharedAuthPalette.bodyText,
    fontFamily: fonts.semiBold,
    marginBottom: 12,
  },
  profilePictureBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    backgroundColor: sharedAuthPalette.surface,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  profilePicturePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
  },
  uploadPlaceholderText: {
    fontSize: fontSizes.xss,
    color: sharedAuthPalette.bodyText,
    fontFamily: fonts.medium,
    marginTop: 8,
  },
  profilePicturePreview: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  changePhotoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  changePhotoText: {
    color: sharedAuthPalette.surface,
    fontSize: fontSizes.xss,
    fontFamily: fonts.semiBold,
    marginTop: 4,
  },
});
