import React, { useRef, useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";

const OTPInput = ({ length = 4, onChangeOTP, inputBoxStyle = {} }) => {
  const [otp, setOTP] = useState(Array(length).fill(""));
  const inputs = useRef([]);

  const handleChange = (text, idx) => {
    if (/^\d?$/.test(text)) {
      const newOTP = [...otp];
      newOTP[idx] = text;
      setOTP(newOTP);
      if (onChangeOTP) onChangeOTP(newOTP.join(""));
      if (text && idx < length - 1) inputs.current[idx + 1].focus();
    }
  };

  const handleBackspace = (e, idx) => {
    if (e.nativeEvent.key === "Backspace" && !otp[idx] && idx > 0) {
      inputs.current[idx - 1].focus();
    }
  };

  return (
    <View style={styles.container}>
      {otp.map((digit, idx) => (
        <TextInput
          key={idx}
          ref={(ref) => (inputs.current[idx] = ref)}
          style={[styles.inputBox, inputBoxStyle]}
          value={digit}
          maxLength={1}
          keyboardType="number-pad"
          returnKeyType="done"
          onChangeText={(text) => handleChange(text, idx)}
          onKeyPress={(e) => handleBackspace(e, idx)}
          selectTextOnFocus
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginVertical: 16,
  },
  inputBox: {
    width: 58,
    height: 55,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderColor: "#E3E3E3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 2,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#155246",
  },
});

export default OTPInput;
