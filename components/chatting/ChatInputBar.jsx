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
 * ChatInputBar Component
 * Message input field with attachment and send buttons
 * Supports theming via color props for business/worker panels
 */
function ChatInputBar({
  value,
  onChangeText,
  onSendPress,
  onSubmitEditing,
  onAttachPress,
  placeholder,
  editable = true,
  // Theme color props
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

  // Use provided colors or defaults
  const inputBg = inputBackgroundColor || colors.bbg6;
  const textColor = inputTextColor || colors.textdark;
  const placeholderClr = placeholderColor || colors.text5;
  const sendBtnColor = sendButtonColor || colors.primary;
  const sendBtnDisabled = sendButtonDisabledColor || colors.text4;
  const borderColor = inputBorderColor || "transparent";

  return (
    <View style={styles.inputBarWrap}>
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

      <TouchableOpacity
        style={[
          styles.sendBtn,
          { backgroundColor: canSend ? sendBtnColor : sendBtnDisabled },
          !canSend && styles.sendBtnDisabled,
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
    paddingVertical: 6,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  inputContainer: {
    flex: 1,
    backgroundColor: colors.bbg6,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingRight: 56,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    fontSize: fontSizes.md,
    color: colors.textdark,
    fontFamily: fonts.regular,
    padding: 0,
    flex: 1,
  },
  attachBtn: {
    marginLeft: 8,
    padding: 6,
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
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginLeft: -36,
    zIndex: 2,
  },
  sendBtnDisabled: {
    backgroundColor: colors.text4,
    shadowOpacity: 0.1,
  },
  sendIcon: {
    color: "#fff",
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.lg,
  },
});

export default ChatInputBar;
