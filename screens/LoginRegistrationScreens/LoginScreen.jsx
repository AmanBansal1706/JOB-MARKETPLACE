import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import CurveHeader from "../../components/CurveHeader";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts, fontSizes } from "../../theme";
import { sharedAuthPalette } from "../../theme/sharedTheme";
import CustomButton from "../../components/button";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useLogin } from "../../services/AuthServices";
import { useDispatch } from "react-redux";
import { LoginRed } from "../../store/Auth";
import { validateLoginForm } from "../../utils/authValidation";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "../../hooks/useTranslation";

export default function LoginScreen() {
  const { height, width } = useWindowDimensions();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { mutate: loginMutate, isPending } = useLogin();
  const { translate } = useTranslation();

  const [mobile, setMobile] = useState("7440871946");
  const [password, setPassword] = useState("1234567");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(1);
  const validation = validateLoginForm(mobile, password);

  const accounts = [
    { id: 1, mobile: "7440871946", password: "1234567" },
    { id: 2, mobile: "910000002", password: "password" },
  ];

  const handleAccountSelect = (account) => {
    setSelectedAccount(account.id);
    setMobile(account.mobile);
    setPassword(account.password);
  };

  const handleLogin = () => {
    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors).join("\n");
      Alert.alert(translate("common.error"), errorMessage);
      return;
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mobile.trim());
    const payload = {
      password,
      ...(isEmail ? { email: mobile } : { mobile: mobile }),
    };

    loginMutate(payload, {
      onSuccess: (response) => {
        console.log("Login successful:", response);
        dispatch(
          LoginRed({
            token: response.token || response.data?.token,
            user: response.user || response.data?.user,
          }),
        );
        if (response.user.role === "BUSINESS") {
          navigation.reset({
            index: 0,
            routes: [{ name: "MainTabs" }],
          });
        } else {
          navigation.replace("WorkerStack", {
            screen: "WorkerTabs",
          });
        }
      },
      onError: (error) => {
        Alert.alert(
          translate("auth.loginFailed"),
          error.message || translate("auth.loginFailed"),
        );
      },
    });
  };

  const palette = sharedAuthPalette;
  const headerHeight = Math.min(height * 0.25, 250);
  const bodyHorizontalPadding = Math.max(20, width * 0.07);
  const rawFormWidth = Math.max(width - bodyHorizontalPadding * 2, 240);
  const formWidth = Math.min(rawFormWidth, 360);
  const headerLogoPadding = Math.max(12, headerHeight * 0.1);
  const scrollContentStyle = {
    paddingHorizontal: bodyHorizontalPadding,
    paddingTop: 8,
    paddingBottom: 40,
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar style="dark" backgroundColor={palette.screenBg} />
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "padding"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            style={{ flex: 1 }}
          >
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={scrollContentStyle}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              alwaysBounceVertical={true}
            >
              <View style={styles.body}>
                <Text style={styles.title}>
                  {translate("auth.letsGetStarted")}
                </Text>
                <Text style={styles.sub}>
                  {translate("auth.signInYourAccount")}
                </Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{translate("auth.mobile")}</Text>
                  <TextInput
                    style={[styles.input, { width: formWidth }]}
                    keyboardType="email-address"
                    placeholder={translate("auth.mobilePlaceholder")}
                    placeholderTextColor={palette.placeholder}
                    value={mobile}
                    onChangeText={setMobile}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{translate("auth.password")}</Text>
                  <View style={{ position: "relative" }}>
                    <TextInput
                      style={[
                        styles.input,
                        { width: formWidth, paddingRight: 40 },
                      ]}
                      placeholder={translate("auth.passwordPlaceholder")}
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
                </View>

                <Text
                  style={styles.forgot}
                  onPress={() => navigation.navigate("ForgotScreen")}
                >
                  {translate("auth.forgotPassword")}
                </Text>

                <CustomButton
                  title={
                    isPending
                      ? translate("common.loading")
                      : translate("auth.loginButton")
                  }
                  style={[
                    styles.button,
                    { width: formWidth },
                    (isPending || !validation.isValid) && { opacity: 0.5 },
                  ]}
                  textStyle={styles.buttonText}
                  onPress={handleLogin}
                  disabled={isPending || !validation.isValid}
                />

                <View style={styles.footerContainer}>
                  <Text style={styles.footerText}>
                    {translate("auth.dontHaveAccount")}
                  </Text>
                </View>

                <View style={styles.registerLinksContainer}>
                  <TouchableOpacity
                    style={styles.registerLinkButton}
                    onPress={() =>
                      navigation.navigate("CreateAccountScreen", {
                        role: "business",
                      })
                    }
                  >
                    <Text style={styles.registerLinkText}>
                      {translate("auth.registerAsBusiness")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.registerLinkButton}
                    onPress={() =>
                      navigation.navigate("CreateAccountScreen", {
                        role: "worker",
                      })
                    }
                  >
                    <Text style={styles.registerLinkText}>
                      {translate("auth.registerAsWorker")}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* <View style={styles.switchContainer}>
                <Text style={styles.switchText}>
                  {translate("auth.areYouWorker")}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [
                          {
                            name: "WorkerStack",
                            state: { routes: [{ name: "WorkerLogin" }] },
                          },
                        ],
                      }),
                    )
                  }
                >
                  <Text style={styles.switchLink}>
                    {translate("auth.loginAsWorker")}
                  </Text>
                </TouchableOpacity>
              </View> */}

                <View style={styles.accountSelectionContainer}>
                  {accounts.map((account) => (
                    <TouchableOpacity
                      key={account.id}
                      style={[
                        styles.accountBox,
                        selectedAccount === account.id &&
                          styles.accountBoxSelected,
                      ]}
                      onPress={() => handleAccountSelect(account)}
                    >
                      <Text style={styles.accountBoxMobile}>
                        {account.mobile}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: sharedAuthPalette.screenBg,
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
    fontFamily: fonts.bold,
    fontSize: fontSizes.xxxl,
    letterSpacing: 2,
  },
  body: {
    minHeight: 1,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.xxl,
    color: sharedAuthPalette.headingText,
    marginBottom: 6,
    alignSelf: "center",
    marginTop: 20,
    letterSpacing: 0.6,
    textAlign: "center",
  },
  sub: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: sharedAuthPalette.bodyText,
    marginBottom: 40,
    alignSelf: "center",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  input: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
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
    right: 12,
    top: 14,
  },
  inputContainer: {
    marginBottom: -2,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.xs,
    color: sharedAuthPalette.labelText,
    marginLeft: 15,
    marginBottom: 6,
  },
  forgot: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.xss,
    color: sharedAuthPalette.link,
    alignSelf: "flex-end",
    marginRight: 34,
    marginTop: 3,
  },
  button: {
    marginTop: 10,
    alignSelf: "center",
    backgroundColor: sharedAuthPalette.primaryButton,
    minHeight: 48,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    shadowColor: sharedAuthPalette.buttonShadow,
    shadowOpacity: sharedAuthPalette.buttonShadowOpacity,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    elevation: 6,
  },
  buttonText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.md,
    color: sharedAuthPalette.surface,
    letterSpacing: 1,
  },
  footerText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
    color: sharedAuthPalette.footerText,
    textAlign: "center",
    flexShrink: 1,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    rowGap: 4,
    marginTop: 15,
    marginBottom: 12,
  },
  registerLinksContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  registerLinkButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: sharedAuthPalette.link,
    backgroundColor: sharedAuthPalette.surface,
  },
  registerLinkText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.xs,
    color: sharedAuthPalette.link,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  switchText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
    color: sharedAuthPalette.footerText,
  },
  switchLink: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.sm,
    color: sharedAuthPalette.link,
    marginLeft: 4,
  },
  accountSelectionContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 2,
    marginTop: 2,
    flexWrap: "wrap",
  },
  accountBox: {
    backgroundColor: sharedAuthPalette.surface,
    borderRadius: 8,
    padding: 6,
    minWidth: 80,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: sharedAuthPalette.surface,
    elevation: 1,
    shadowColor: sharedAuthPalette.inputShadow,
    shadowOpacity: sharedAuthPalette.inputShadowOpacity,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  accountBoxSelected: {
    backgroundColor: "#FFF",
    borderColor: sharedAuthPalette.link,
    elevation: 2,
    shadowOpacity: 0.3,
  },
  accountBoxLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    color: sharedAuthPalette.labelText,
    marginBottom: 2,
  },
  accountBoxMobile: {
    fontFamily: fonts.medium,
    fontSize: 9,
    color: sharedAuthPalette.headingText,
  },
  accountBoxPassword: {
    fontFamily: fonts.regular,
    fontSize: 8,
    color: sharedAuthPalette.bodyText,
  },
});
