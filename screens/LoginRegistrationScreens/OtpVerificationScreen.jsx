import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { colors, fonts, fontSizes } from "../../theme";
import { sharedAuthPalette } from "../../theme/sharedTheme";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import BackButton from "../../components/BackButton";
import CustomButton from "../../components/button";
import OTPInput from "../../components/OTPInput";
import { useVerifyOtp, useSendOtp } from "../../services/AuthServices";
import { useSelector, useDispatch } from "react-redux";
import { SetSessionToken, LoginRed } from "../../store/Auth";
import { validateOTPForm } from "../../utils/authValidation";
import { useTranslation } from "../../hooks/useTranslation";

export default function OtpVerificationScreen() {
  const [otp, setOtp] = useState("");
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { translate } = useTranslation();
  const mobile = route.params?.mobile;
  const purpose = route.params?.purpose || "password_reset"; // 'registration' or 'password_reset'
  const sessionToken = useSelector((state) => state.Auth.sessionToken);

  const { mutate: verifyOtpMutate, isPending } = useVerifyOtp();
  const { mutate: resendOtpMutate, isPending: isResending } = useSendOtp();

  const { height, width } = useWindowDimensions();
  const bodyHorizontalPadding = Math.max(20, width * 0.07);
  const rawFormWidth = Math.max(width - bodyHorizontalPadding * 2, 240);
  const formWidth = Math.min(rawFormWidth, 360);
  const imageSize = Math.min(width * 0.5, 209);

  const isOtpComplete = validateOTPForm(otp).isValid;

  const handleResendOtp = () => {
    if (!mobile) {
      Alert.alert(translate("common.error"), translate("auth.mobileNotFound"));
      return;
    }

    resendOtpMutate(
      {
        mobile: mobile,
        purpose: purpose === "registration" ? "registration" : "password_reset",
      },
      {
        onSuccess: (response) => {
          // Update session token if provided
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
            translate("common.success"),
            `${translate("auth.otpResent")}${otpMessage}`,
          );
        },
        onError: (error) => {
          Alert.alert(
            translate("common.error"),
            error.message || translate("auth.failedResendOtp"),
          );
        },
      },
    );
  };

  const palette = sharedAuthPalette;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: palette.cardGradientStart }}
      edges={["top", "left", "right"]}
    >
      <StatusBar style="dark" backgroundColor={palette.cardGradientStart} />
      <LinearGradient
        colors={[palette.cardGradientStart, palette.cardGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "padding"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={[
                styles.container,
                { paddingHorizontal: bodyHorizontalPadding },
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.header}>
                <BackButton
                  onPress={() => navigation.goBack()}
                  size={16}
                  color={palette.icon}
                  backgroundColor="transparent"
                  borderColor={palette.icon}
                  borderWidth={1.5}
                  circleSize={36}
                />
                <Text style={[styles.title, { fontSize: fontSizes.xxl }]}>
                  {purpose === "registration"
                    ? translate("auth.verifyRegistration")
                    : translate("auth.otpVerificationTitle")}
                </Text>
              </View>

              <Image
                source={require("../../assets/images/pin.png")}
                style={[styles.image, { width: imageSize, height: imageSize }]}
                resizeMode="contain"
              />
              <Text
                style={[styles.instructionText, { fontSize: fontSizes.md }]}
              >
                {translate("auth.otpInstruction")}
                {"\n"} {translate("auth.otpOnMobile")}
              </Text>

              <OTPInput
                length={4}
                inputBoxStyle={{
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                  color: palette.headingText,
                  shadowColor: palette.inputShadow,
                }}
                onChangeOTP={(otpValue) => setOtp(otpValue)}
              />

              <CustomButton
                title={
                  isPending
                    ? translate("auth.verifying")
                    : translate("auth.submitButton")
                }
                style={[
                  styles.button,
                  { width: formWidth },
                  (!isOtpComplete || isPending) && styles.registerBtnDisabled,
                ]}
                textStyle={[styles.buttonText, { fontSize: fontSizes.md }]}
                disabled={!isOtpComplete || isPending}
                onPress={() => {
                  const { isValid, errors } = validateOTPForm(otp);

                  if (!isValid) {
                    Alert.alert(translate("auth.validationError"), errors.otp);
                    return;
                  }

                  if (!sessionToken) {
                    Alert.alert(
                      translate("common.error"),
                      translate("auth.sessionTokenError"),
                    );
                    navigation.goBack();
                    return;
                  }

                  verifyOtpMutate(
                    {
                      session_token: sessionToken,
                      code: otp,
                    },
                    {
                      onSuccess: (response) => {
                        if (purpose === "registration") {
                          // Clear session token after successful registration verification
                          dispatch(SetSessionToken(null));
                          Alert.alert(
                            translate("common.success"),
                            translate("auth.registerSuccess"),
                            [
                              {
                                text: translate("common.ok"),
                                onPress: () => {
                                  navigation.reset({
                                    index: 0,
                                    routes: [{ name: "LoginScreen" }],
                                  });
                                },
                              },
                            ],
                          );
                        } else {
                          // Password reset flow - navigate to change password screen
                          Alert.alert(
                            translate("common.success"),
                            translate("auth.loginSuccess"),
                            [
                              {
                                text: translate("common.ok"),
                                onPress: () =>
                                  navigation.navigate("ChangePasswordScreen", {
                                    mobile,
                                  }),
                              },
                            ],
                          );
                        }
                      },
                      onError: (error) => {
                        Alert.alert(
                          translate("common.error"),
                          error.message || translate("auth.validationError"),
                        );
                      },
                    },
                  );
                }}
              />
              <View style={styles.footerContainer}>
                <Text style={[styles.footerText, { fontSize: fontSizes.xss }]}>
                  {translate("auth.dontReceiveCode")}
                </Text>
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={isResending}
                >
                  <Text
                    style={[
                      styles.footerText,
                      {
                        color: sharedAuthPalette.link,
                        fontSize: fontSizes.xss,
                      },
                    ]}
                  >
                    {isResending
                      ? translate("common.loading")
                      : translate("auth.resendLink")}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingVertical: 15,
  },
  header: {
    flexDirection: "row",
    marginLeft: 16,
    marginBottom: 32,
    marginTop: 20,
    gap: 20,
  },
  title: {
    fontFamily: fonts.medium,
    color: sharedAuthPalette.headingText,
    alignSelf: "center",
  },
  image: {
    alignSelf: "center",
  },
  instructionText: {
    fontFamily: fonts.regular,
    color: sharedAuthPalette.bodyText,
    textAlign: "center",
    marginTop: 60,
    marginBottom: 24,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: sharedAuthPalette.primaryButton,
    borderRadius: 24,
    marginBottom: 10,
    shadowColor: sharedAuthPalette.buttonShadow,
    shadowOpacity: sharedAuthPalette.buttonShadowOpacity,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    elevation: 6,
    minHeight: 48,
    paddingVertical: 12,
  },
  registerBtnDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: fonts.bold,
    color: sharedAuthPalette.surface,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  footerText: {
    color: sharedAuthPalette.bodyText,
    fontFamily: fonts.semiBold,
  },
});
