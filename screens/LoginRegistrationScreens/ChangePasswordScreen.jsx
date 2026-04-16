import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
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
import { useNavigation, useRoute } from "@react-navigation/native";
import BackButton from "../../components/BackButton";
import CustomButton from "../../components/button";
import { Ionicons } from "@expo/vector-icons";
import { useChangePassword } from "../../services/AuthServices";
import { useSelector, useDispatch } from "react-redux";
import { SetSessionToken } from "../../store/Auth";
import { validateChangePasswordForm } from "../../utils/authValidation";
import { useTranslation } from "../../hooks/useTranslation";

export default function ChangePasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { translate } = useTranslation();
  const mobile = route.params?.mobile;
  const sessionToken = useSelector((state) => state.Auth.sessionToken);

  const { mutate: changePasswordMutate, isPending } = useChangePassword();

  const { height, width } = useWindowDimensions();
  const bodyHorizontalPadding = Math.max(20, width * 0.07);
  const rawFormWidth = Math.max(width - bodyHorizontalPadding * 2, 240);
  const formWidth = Math.min(rawFormWidth, 360);
  const imageSize = Math.min(width * 0.5, 209);

  const handleClick = () => {
    if (isPending) return;

    if (!mobile) {
      Alert.alert(translate("common.error"), translate("auth.mobileNotFound"));
      navigation.navigate("ForgotScreen");
      return;
    }

    if (!sessionToken) {
      Alert.alert(translate("common.error"), translate("auth.sessionExpired"));
      navigation.navigate("ForgotScreen");
      return;
    }

    const { isValid, errors } = validateChangePasswordForm(
      password,
      confirmPassword,
    );

    if (!isValid) {
      const errorMessage = Object.values(errors).join("\n");
      Alert.alert(translate("auth.validationError"), errorMessage);
      return;
    }

    changePasswordMutate(
      {
        mobile,
        new_password: password,
        new_password_confirmation: confirmPassword,
        session_token: sessionToken,
      },
      {
        onSuccess: () => {
          dispatch(SetSessionToken(null));
          Alert.alert(
            translate("common.success"),
            translate("auth.passwordChangedSuccess"),
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
        },
        onError: (error) => {
          Alert.alert(
            translate("common.error"),
            error?.message || translate("auth.passwordChangeFailed"),
          );
        },
      },
    );
  };

  const isFormValid = validateChangePasswordForm(
    password,
    confirmPassword,
  ).isValid;

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
                  size={18}
                  color={palette.icon}
                  backgroundColor="transparent"
                  borderColor="transparent"
                />
                <Text style={[styles.title, { fontSize: fontSizes.xxl }]}>
                  {translate("auth.changePasswordTitle")}
                </Text>
              </View>

              <Image
                source={require("../../assets/images/reset-password.png")}
                style={[styles.image, { width: imageSize, height: imageSize }]}
                resizeMode="contain"
              />

              <Text
                style={[styles.instructionText, { fontSize: fontSizes.md }]}
              >
                {translate("auth.changePasswordInstruction").replace(
                  "{newline}",
                  "\n",
                )}
              </Text>

              {/* New Password Field */}
              <View style={[styles.inputContainer, { width: formWidth }]}>
                <TextInput
                  style={[
                    styles.input,
                    { fontSize: fontSizes.sm, paddingRight: 40 },
                  ]}
                  placeholder={translate("auth.newPasswordPlaceholder")}
                  placeholderTextColor={palette.placeholder}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
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

              {/* Confirm Password Field */}
              <View style={[styles.inputContainer, { width: formWidth }]}>
                <TextInput
                  style={[
                    styles.input,
                    { fontSize: fontSizes.sm, paddingRight: 40 },
                  ]}
                  placeholder={translate("auth.confirmPasswordPlaceholder")}
                  placeholderTextColor={palette.placeholder}
                  secureTextEntry={!showConfirm}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirm(!showConfirm)}
                >
                  <Ionicons
                    name={showConfirm ? "eye" : "eye-off"}
                    size={20}
                    color={palette.placeholder}
                  />
                </TouchableOpacity>
              </View>

              <View style={[styles.validationContainer, { width: formWidth }]}>
                {password.length < 6 && (
                  <Text
                    style={[
                      styles.validationText,
                      {
                        color: sharedAuthPalette.errorText || "#E57373",
                        fontSize: fontSizes.xss,
                      },
                    ]}
                  >
                    • {translate("auth.passwordMinimum")}
                  </Text>
                )}
                {password.length > 0 && password !== confirmPassword && (
                  <Text
                    style={[
                      styles.validationText,
                      {
                        color: sharedAuthPalette.errorText || "#E57373",
                        fontSize: fontSizes.xss,
                      },
                    ]}
                  >
                    • {translate("auth.passwordsDoNotMatch")}
                  </Text>
                )}
              </View>

              <CustomButton
                title={
                  isPending
                    ? translate("auth.saving")
                    : translate("auth.saveButton")
                }
                style={[
                  styles.button,
                  { width: formWidth },
                  (!isFormValid || isPending) && styles.registerBtnDisabled,
                ]}
                textStyle={[styles.buttonText, { fontSize: fontSizes.md }]}
                disabled={!isFormValid || isPending}
                onPress={handleClick}
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
    gap: 40,
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
    marginTop: 40,
    marginBottom: 36,
  },
  inputContainer: {
    alignSelf: "center",
    marginBottom: 14,
    position: "relative",
  },
  input: {
    fontFamily: fonts.semiBold,
    height: 48,
    color: sharedAuthPalette.headingText,
    backgroundColor: sharedAuthPalette.surface,
    borderRadius: 24,
    paddingHorizontal: 18,
    shadowColor: sharedAuthPalette.inputShadow,
    shadowOpacity: sharedAuthPalette.inputShadowOpacity,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 14,
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 14,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: sharedAuthPalette.primaryButton,
    borderRadius: 24,
    marginTop: 20,
    marginBottom: 50,
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
    color: sharedAuthPalette.surface,
    fontFamily: fonts.bold,
  },
  helperText: {
    fontSize: fontSizes.xss,
    color: sharedAuthPalette.bodyText,
    alignSelf: "center",
    marginTop: -8,
    marginBottom: 14,
  },
  validationContainer: {
    alignSelf: "center",
    paddingHorizontal: 12,
  },
  validationText: {
    fontFamily: fonts.regular,
    color: sharedAuthPalette.bodyText,
    marginBottom: 6,
    lineHeight: 18,
  },
});
