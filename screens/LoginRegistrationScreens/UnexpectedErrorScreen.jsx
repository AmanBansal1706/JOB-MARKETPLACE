import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts, fontSizes } from "../../theme";
import CustomButton from "../../components/button";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "../../hooks/useTranslation";

export default function UnexpectedErrorScreen() {
  const navigation = useNavigation();
  const { translate } = useTranslation();

  const { height, width } = useWindowDimensions();
  const imageSize = Math.min(width * 0.4, 147);
  const buttonWidth = Math.min(width * 0.4, 156);

  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary, colors.tertiary]}
      style={styles.container}
      start={{ x: 0.1, y: 0.9 }}
      end={{ x: 0, y: 0 }}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { fontSize: fontSizes.xxxl }]}>
          {translate("errors.unexpectedError")} {"\n"}{" "}
          {translate("errors.occurred")}
        </Text>
        <Image
          source={require("../../assets/images/error.png")}
          style={[styles.image, { width: imageSize, height: imageSize }]}
          resizeMode="contain"
        />
        <Text style={[styles.instructionText, { fontSize: fontSizes.md }]}>
          {translate("errors.brokenLink")} {"\n"}
        </Text>
        <Text style={[styles.instructionText1, { fontSize: fontSizes.md }]}>
          {translate("errors.checkUrl")}
        </Text>

        <CustomButton
          title={translate("errors.goBack")}
          style={[styles.button, { width: buttonWidth }]}
          textStyle={[styles.buttonText, { fontSize: fontSizes.sm }]}
          onPress={() => navigation.goBack()}
        />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    alignSelf: "center",
    top: -60,
  },
  title: {
    fontFamily: fonts.medium,
    color: "#FFFFFF",
    alignSelf: "center",
    textAlign: "center",
    top: -140,
  },
  instructionText: {
    fontFamily: fonts.regular,
    color: "#FFFFFF",
    textAlign: "center",
    top: 60,
  },
  instructionText1: {
    fontFamily: fonts.regular,
    letterSpacing: 0.61,
    color: "#FFFFFF",
    textAlign: "center",
    top: 35,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: colors.buttonbg2,
    borderRadius: 25,
    top: 150,
    minHeight: 42,
    paddingVertical: 10,
  },
  buttonText: {
    color: colors.buttonbg1,
    fontFamily: fonts.bold,
  },
});
