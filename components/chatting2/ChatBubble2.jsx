import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, fonts, fontSizes } from "../../theme";
import FileMessageBubble2 from "./FileMessageBubble2";
import { useTranslation } from "../../hooks/useTranslation";

/**
 * ChatBubble2 Component
 * Displays individual chat messages (sent and received).
 * Supports text messages and media messages via FileMessageBubble2.
 * Supports theming via color props for business/worker panels.
 */
function ChatBubble2({
  message,
  isMe,
  bubbleMeColor,
  bubbleOtherColor,
  textColor,
  senderNameColor,
  timeColor,
}) {
  const { translate } = useTranslation();
  const { from, text, time, type } = message;

  const bubbleMeBg = bubbleMeColor || "#B9F3E0";
  const bubbleOtherBg = bubbleOtherColor || "#A9C1BC";
  const msgTextColor = textColor || colors.textdark;
  const nameColor = senderNameColor || colors.textdark;
  const timeTxtColor = timeColor || colors.text4;

  const isMediaMessage =
    type === "image" ||
    type === "video" ||
    type === "audio" ||
    type === "document";

  if (isMediaMessage) {
    return (
      <FileMessageBubble2
        message={message}
        isMe={isMe}
        bubbleMeColor={bubbleMeBg}
        bubbleOtherColor={bubbleOtherBg}
        textColor={msgTextColor}
        senderNameColor={nameColor}
        timeColor={timeTxtColor}
      />
    );
  }

  return (
    <View
      style={[
        styles.messageContainer,
        isMe ? styles.messageContainerMe : styles.messageContainerOther,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isMe ? styles.bubbleMe : styles.bubbleOther,
          { backgroundColor: isMe ? bubbleMeBg : bubbleOtherBg },
        ]}
      >
        <View style={styles.infoRow}>
          <Text style={[styles.senderName, { color: nameColor }]}>
            {isMe ? translate("chat.you") : from}
          </Text>
          <Text style={[styles.timeText, { color: timeTxtColor }]}>{time}</Text>
        </View>
        <Text style={[styles.msgText, { color: msgTextColor }]}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: "column",
    marginVertical: 8,
  },
  messageContainerMe: {
    alignItems: "flex-end",
  },
  messageContainerOther: {
    alignItems: "flex-start",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  senderName: {
    color: colors.textdark,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  timeText: {
    color: colors.text4,
    fontSize: 10,
    fontFamily: fonts.regular,
    marginLeft: 8,
  },
  bubble: {
    maxWidth: "80%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleOther: {
    backgroundColor: "#A9C1BC",
    borderTopLeftRadius: 0,
  },
  bubbleMe: {
    backgroundColor: "#B9F3E0",
    borderTopRightRadius: 0,
  },
  msgText: {
    color: colors.textdark,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.regular,
  },
});

export default ChatBubble2;
