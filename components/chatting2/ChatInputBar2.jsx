import React from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
} from "react-native";
import { colors, fonts, fontSizes } from "../../theme";
import { useTranslation } from "../../hooks/useTranslation";

/**
 * ChatInputBar2 Component
 * Message input field with attachment and send buttons.
 * Supports theming via color props for business/worker panels.
 */
function ChatInputBar2({
  value,
  onChangeText,
  onSendPress,
  onSubmitEditing,
  onAttachPress,
  placeholder,
  editable = true,
  inputBackgroundColor,
  inputTextColor,
  placeholderColor,
  sendButtonColor,
  sendButtonDisabledColor,
  inputBorderColor,
  showBorder = false,
}) {
  const { translate } = useTranslation();
  const placeholderText = placeholder || translate("chat.typeMessage");
  const canSend = value.trim().length > 0;

  const inputBg = inputBackgroundColor || colors.bbg6;
  const textColor = inputTextColor || colors.textdark;
  const placeholderClr = placeholderColor || colors.text5;
  const sendBtnColor = sendButtonColor || colors.primary;
  const sendBtnDisabled = sendButtonDisabledColor || colors.text4;
  const borderColor = inputBorderColor || "transparent";

  return (
    <View style={styles.inputBarWrap}>
      {/* Text input — takes all remaining space */}
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: inputBg },
          showBorder && { borderWidth: 1, borderColor: borderColor },
        ]}
      >
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder={placeholderText}
          placeholderTextColor={placeholderClr}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          returnKeyType="send"
          maxLength={500}
          editable={editable}
          multiline={false}
        />
        <TouchableOpacity
          style={styles.attachBtn}
          activeOpacity={0.7}
          onPress={onAttachPress}
          disabled={!editable}
        >
          <Text
            style={[styles.attachIcon, !editable && styles.attachIconDisabled]}
          >
            📎
          </Text>
        </TouchableOpacity>
      </View>

      {/* Send button */}
      <TouchableOpacity
        style={[
          styles.sendBtn,
          { backgroundColor: canSend ? sendBtnColor : sendBtnDisabled },
        ]}
        onPress={onSendPress}
        disabled={!canSend || !editable}
        activeOpacity={0.7}
      >
        <Text style={styles.sendIcon}>➤</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputBarWrap: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  inputContainer: {
    flex: 1,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: fontSizes.md,
    fontFamily: fonts.regular,
    padding: 0,
    margin: 0,
  },
  attachBtn: {
    width: 30,
    height: 30,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  attachIcon: {
    fontSize: fontSizes.lg,
  },
  attachIconDisabled: {
    opacity: 0.5,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginLeft: 6,
  },
  sendIcon: {
    color: "#fff",
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.lg,
  },
});

export default ChatInputBar2;
