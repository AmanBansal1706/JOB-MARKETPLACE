import React, { useRef, useEffect } from "react";
import {
  Text,
  StyleSheet,
  Image,
  View,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts, fontSizes } from "../../theme";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { setFirstTimeVisitor } from "../../store/Auth";
import { useTranslation } from "../../hooks/useTranslation";

function InlineLoader() {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });

  return (
    <View style={styles.inlineLoaderContainer}>
      <View style={styles.inlineDot} />
      <Animated.View
        style={[styles.inlinePill, { transform: [{ translateX }] }]}
      />
    </View>
  );
}

export default function OnBoardScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const firstTimeVisitor = useSelector((state) => state.Auth.firstTimeVisitor);
  const { translate } = useTranslation();
  const { width } = useWindowDimensions();

  // If user is NOT a first-time visitor, skip onboarding
  useEffect(() => {
    if (firstTimeVisitor === false) {
      // Replace so user can't go back to onboarding
      navigation.replace("LoginScreen");
    }
  }, [firstTimeVisitor]); // Only depend on firstTimeVisitor state

  // Make image scale with screen width but don't exceed original size
  const imageWidth = Math.min(324, Math.round(width * 0.8));
  const imageAspectRatio = 324 / 304; // width / height
  const imageStyle = {
    width: imageWidth,
    height: Math.round(imageWidth / imageAspectRatio),
  };

  const handlePress = () => {
    dispatch(setFirstTimeVisitor(false));
    navigation.replace("LoginScreen");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          source={require("../../assets/images/onboarding 2.png")}
          style={[styles.image, imageStyle]}
          resizeMode="contain"
        />

        <View style={styles.content}>
          <Text style={styles.title}>
            {translate("auth.browseServiceList")}
          </Text>

          <Text style={styles.description}>
            {translate("auth.serviceListDescription")}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.loaderWrap}>
            <InlineLoader />
          </View>
          <TouchableOpacity
            onPress={handlePress}
            style={styles.button}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>
              {translate("auth.getStarted")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.secondary },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: colors.secondary,
  },
  image: {
    marginTop: 8,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 12,
  },
  title: {
    marginTop: 6,
    fontFamily: fonts.bold,
    fontSize: fontSizes.xxl,
    color: colors.text,
    letterSpacing: 1,
    textAlign: "center",
  },
  description: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: fontSizes.xs,
    color: colors.text,
    letterSpacing: 1.3,
    textAlign: "center",
    maxWidth: 520,
  },
  footer: {
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  button: {
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: colors.authPalette.buttonShadow,
    elevation: 3,
  },
  buttonText: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: fontSizes.lg,
  },
  loaderWrap: {
    marginBottom: 6,
  },
  inlineLoaderContainer: {
    width: 24,
    height: 10,
    justifyContent: "center",
    alignItems: "flex-start",
    position: "relative",
  },
  inlineDot: {
    position: "absolute",
    width: 8,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.tertiary,
    top: 2,
    left: 0,
  },
  inlinePill: {
    position: "absolute",
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.text,
    top: 2,
    left: 0,
  },
});
