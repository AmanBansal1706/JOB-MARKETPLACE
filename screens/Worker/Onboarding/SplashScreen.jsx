import { useEffect } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import logoImage from "../../../assets/worker-images/logo.png";
import colors from "../../../theme/worker/colors";
import { useNavigation } from "@react-navigation/native";

/**
 * Splash Screen
 * Figma: 01_Splash.png
 * Shows app logo and loading state on app startup
 */
export default function SplashScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    // Redirect to onboarding after a short delay
    const timer = setTimeout(() => {
      navigation.replace("WorkerOnboarding");
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={logoImage}
        style={styles.logoImage}
        resizeMode="contain"
        accessibilityLabel="instaChamba logo"
      />

      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary.coral} />
      </View>

      <View style={styles.bottomLeftIndicators}>
        <View style={styles.indicatorDot} />
        <View style={styles.indicatorPill} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 220,
    height: 72,
    marginBottom: 18,
  },
  loaderContainer: {
    position: "absolute",
    bottom: 160,
  },
  bottomLeftIndicators: {
    position: "absolute",
    bottom: 26,
    left: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.mint,
    marginRight: 8,
  },
  indicatorPill: {
    width: 24,
    height: 8,
    borderRadius: 6,
    backgroundColor: colors.primary.coral,
  },
});
