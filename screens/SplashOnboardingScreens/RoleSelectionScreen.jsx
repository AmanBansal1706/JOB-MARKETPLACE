import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { colors, fonts, fontSizes } from "../../theme";

export default function RoleSelectionScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Choose your role</Text>
        <Text style={styles.subtitle}>
          Continue as a business or as a worker.
        </Text>

        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.optionButton, styles.businessButton]}
            activeOpacity={0.85}
            onPress={() => navigation.replace("LoginScreen")}
          >
            <Text style={styles.optionText}>Business</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, styles.workerButton]}
            activeOpacity={0.85}
            onPress={() => navigation.replace("WorkerStack")}
          >
            <Text style={styles.optionText}>Worker</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.authPalette.screenBg,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logo: {
    width: 220,
    height: 70,
    marginBottom: 30,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xxl,
    color: colors.authPalette.headingText,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.authPalette.bodyText,
    marginBottom: 30,
    textAlign: "center",
  },
  card: {
    width: "100%",
    backgroundColor: colors.authPalette.surface,
    borderRadius: 24,
    padding: 20,
    shadowColor: colors.authPalette.inputShadow,
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  optionButton: {
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
  },
  businessButton: {
    backgroundColor: colors.authPalette.primaryButton,
    marginBottom: 12,
  },
  workerButton: {
    backgroundColor: colors.authPalette.brandPink,
  },
  optionText: {
    color: colors.authPalette.surface,
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.lg,
    letterSpacing: 0.5,
  },
});
