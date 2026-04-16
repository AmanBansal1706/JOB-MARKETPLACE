import React from "react";
import { View, Text, Modal, StyleSheet, Dimensions, Image } from "react-native";
import CustomButton from "./button";
import { colors, fonts } from "../theme";

const CustomAlert = ({
  visible = false,
  onClose,
  onConfirm,
  onSecondaryClose,
  title = "Alert",
  message = "This is an alert message",
  imageSource = require("../assets/images/timesand.png"),
  showImage = true,
  buttonText = "OK",
  secondaryButtonText,
  buttonTextColor = colors.text,
  secondaryButtonTextColor = colors.text,
  buttonBackgroundColor = colors.bg1,
  secondaryButtonBackgroundColor = "#FFFFFF",
  titleColor = "#000000",
  messageColor = "#666666",
  backgroundColor = "#FFFFFF",
  borderRadius = 40,
  paddingHorizontal = 20,
  paddingVertical = 24,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.alertContainer,
            {
              backgroundColor,
              borderRadius,
              paddingHorizontal,
              paddingVertical,
            },
          ]}
        >
          {/* Title */}
          <Text style={[styles.title, { color: titleColor }]}>{title}</Text>

          {/* Image */}
          {showImage && (
            <View style={styles.imageContainer}>
              <Image
                source={imageSource}
                style={styles.defaultImage}
                resizeMode="center"
                onError={(error) => console.log("Image load error:", error)}
              />
            </View>
          )}

          <Text style={[styles.message, { color: messageColor }]}>
            {message}
          </Text>

          <View style={styles.buttonContainer}>
            {secondaryButtonText && (
              <CustomButton
                title={secondaryButtonText}
                onPress={onSecondaryClose || onClose}
                style={[
                  styles.button2,
                  {
                    backgroundColor: secondaryButtonBackgroundColor,
                    borderRadius: borderRadius,
                    borderWidth: 1,
                    borderColor: buttonBackgroundColor,
                  },
                ]}
                textStyle={[
                  styles.buttonText,
                  { color: buttonBackgroundColor },
                ]}
              />
            )}
            <CustomButton
              title={buttonText}
              onPress={onConfirm || onClose}
              style={[
                styles.button1,
                secondaryButtonText && styles.button1WithSecondary,
                {
                  backgroundColor: buttonBackgroundColor,
                  borderRadius: borderRadius,
                },
              ]}
              textStyle={[styles.buttonText, { color: buttonTextColor }]}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  alertContainer: {
    maxWidth: 340,
    minHeight: 350,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 24,
    lineHeight: 24,
  },
  imageContainer: {
    marginTop: 8,
    marginBottom: 6,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  defaultImage: {
    width: 60,
    height: 60,
  },
  message: {
    fontSize: 18,
    fontWeight: fonts.regular,
    textAlign: "center",
    marginBottom: 50,
    paddingLeft: 10,
    paddingRight: 10,
    lineHeight: 22,
  },

  button1: {
    alignItems: "center",
    justifyContent: "center",
    height: 42,
    backgroundColor: colors.buttonbg1,
    borderRadius: 10,
    flex: 1,
  },
  button1WithSecondary: {
    flex: 1,
  },
  button2: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: 42,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CustomAlert;
