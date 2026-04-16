import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import onboardingImage from "../../../assets/worker-images/onboarding.png";
import colors from "../../../theme/worker/colors";
import { useTranslation } from "../../../hooks/useTranslation";

const { height } = Dimensions.get("window");

/**
 * Onboarding Screen
 * Figma: 01(a)_Onboarding.png
 * Guides new users through app features and benefits
 */
export default function OnboardingScreen() {
  const navigation = useNavigation();
  const { translate } = useTranslation();

  const handleGetStarted = () => {
    navigation.navigate("WorkerLogin");
  };

  return (
    <LinearGradient
      colors={[colors.onboarding.gradientStart, colors.onboarding.gradientEnd]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.content}>
          {/* Illustration placeholder */}
          <View style={styles.illustrationContainer}>
            <Image
              source={onboardingImage}
              style={styles.illustrationImage}
              resizeMode="contain"
              accessibilityLabel="Onboarding illustration"
            />
          </View>

          {/* Title */}
          <Text style={styles.title} maxFontSizeMultiplier={1.5}>
            {translate("workerOnboarding.browseServiceList")}
          </Text>

          {/* Description */}
          <Text style={styles.description} maxFontSizeMultiplier={1.5}>
            {translate("workerOnboarding.serviceDescription")}
          </Text>
        </View>

        {/* Bottom section */}
        <View style={styles.bottomSection}>
          <View style={styles.bottomRow}>
            {/* Pagination dots (left) */}
            <View style={styles.pagination}>
              <View style={styles.dot} />
              <View style={[styles.dot, styles.dotActive]} />
            </View>

            {/* Inline Get Started (right) */}
            <TouchableOpacity
              onPress={handleGetStarted}
              activeOpacity={0.8}
              style={styles.buttonContainer}
            >
              <Text style={styles.getStartedText} maxFontSizeMultiplier={1.5}>
                {translate("workerOnboarding.getStarted")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingTop: height * 0.1, // Dynamic padding
  },
  illustrationContainer: {
    width: "100%",
    height: height * 0.4, // Responsive height
    maxHeight: 340,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  illustrationImage: {
    width: "100%",
    height: "100%",
    borderRadius: 200,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.onboarding.textWhite2,
    textAlign: "center",
    marginBottom: 16,
    marginTop: 20,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 15,
    color: colors.onboarding.textTransparent,
    textAlign: "center",
    lineHeight: 22,
    fontFamily: "Poppins_400Regular",
    maxWidth: 320,
    marginTop: 8,
    marginBottom: 20,
  },

  bottomSection: {
    paddingHorizontal: 40,
    paddingBottom: 48,
    alignItems: "center",
    width: "100%",
  },
  bottomRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pagination: {
    flexDirection: "row",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.onboarding.dotInactive,
    marginRight: 8,
  },
  dotActive: {
    backgroundColor: colors.white,
    width: 20,
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    paddingVertical: 10, // Touch area
  },
  getStartedText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.onboarding.textWhite,
    fontFamily: "Poppins_700Bold",
  },
});
