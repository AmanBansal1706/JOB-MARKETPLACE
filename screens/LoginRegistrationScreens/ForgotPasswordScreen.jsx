import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { colors, fonts, fontSizes } from "../../theme";
import { sharedAuthPalette } from "../../theme/sharedTheme";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import BackButton from "../../components/BackButton";
import CustomButton from "../../components/button";
import { useSendOtp } from "../../services/AuthServices";
import { useDispatch } from "react-redux";
import { SetSessionToken } from "../../store/Auth";
import { validateForgotPasswordForm } from "../../utils/authValidation";
import { useTranslation } from "../../hooks/useTranslation";

export default function ForgotPasswordScreen() {
  const [mobileOrEmail, setMobileOrEmail] = useState("");
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { mutate: sendOtpMutate, isPending } = useSendOtp();
  const { translate } = useTranslation();

  const { height, width } = useWindowDimensions();
  const bodyHorizontalPadding = Math.max(20, width * 0.07);
  const rawFormWidth = Math.max(width - bodyHorizontalPadding * 2, 240);
  const formWidth = Math.min(rawFormWidth, 360);
  const imageSize = Math.min(width * 0.5, 209);

  const handleSendOtp = () => {
    if (isPending) return;

    // Trim input to handle spaces
    const trimmedInput = mobileOrEmail.trim();
    const { isValid, errors } = validateForgotPasswordForm(trimmedInput);

    if (!isValid) {
      Alert.alert(translate("common.error"), errors.mobileOrEmail);
      return;
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedInput);
    const payload = {
      purpose: "password_reset",
      ...(isEmail ? { email: trimmedInput } : { mobile: trimmedInput }),
    };

    sendOtpMutate(payload, {
      onSuccess: (response) => {
        // Store session token for next screen
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
          `${
            response.message || translate("messages.selectLanguageMessage")
          }${otpMessage}`,
          [
            {
              text: translate("common.ok"),
              onPress: () =>
                navigation.navigate("OtpVerificationScreen", {
                  mobile: trimmedInput,
                }),
            },
          ],
        );
      },
      onError: (error) => {
        Alert.alert(
          translate("common.error"),
          error.message || translate("common.error"),
        );
      },
    });
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
                  {translate("auth.forgotPasswordTitle")}
                </Text>
              </View>

              <Image
                source={require("../../assets/images/forgotpassword1.png")}
                style={[styles.image, { width: imageSize, height: imageSize }]}
                resizeMode="contain"
              />
              <Text
                style={[styles.instructionText, { fontSize: fontSizes.md }]}
              >
                {translate("auth.forgotPasswordInstruction").replace(
                  "{newline}",
                  "\n",
                )}
              </Text>

              <TextInput
                style={[
                  styles.input,
                  { width: formWidth, fontSize: fontSizes.sm },
                ]}
                placeholder={translate("auth.mobilePlaceholder")}
                placeholderTextColor={palette.placeholder}
                keyboardType="email-address"
                onChangeText={setMobileOrEmail}
              />

              <CustomButton
                title={
                  isPending
                    ? translate("common.loading")
                    : translate("auth.sendOtpButton")
                }
                style={[
                  styles.button,
                  { width: formWidth },
                  (!validateForgotPasswordForm(mobileOrEmail.trim()).isValid ||
                    isPending) &&
                    styles.registerBtnDisabled,
                ]}
                textStyle={[styles.buttonText, { fontSize: fontSizes.md }]}
                disabled={
                  !validateForgotPasswordForm(mobileOrEmail.trim()).isValid ||
                  isPending
                }
                onPress={handleSendOtp}
              />

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
    alignItems: "center",
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
    marginBottom: 40,
  },
  input: {
    fontFamily: fonts.semiBold,
    color: sharedAuthPalette.headingText,
    backgroundColor: sharedAuthPalette.surface,
    alignSelf: "center",
    borderRadius: 24,
    paddingHorizontal: 18,
    minHeight: 48,
    marginBottom: 24,
    shadowColor: sharedAuthPalette.inputShadow,
    shadowOpacity: sharedAuthPalette.inputShadowOpacity,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 14,
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
});
