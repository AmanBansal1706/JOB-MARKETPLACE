import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, fonts, fontSizes } from "../../theme";
import FileMessageBubble from "./FileMessageBubble";
import { useTranslation } from "../../hooks/useTranslation";

/**
 * ChatBubble Component
 * Displays individual chat messages (sent and received)
 * Supports text messages and media messages (image, video, audio, document)
 * Supports theming via color props for business/worker panels
 */
function ChatBubble({
  message,
  isMe,
  // Theme color props
  bubbleMeColor,
  bubbleOtherColor,
  textColor,
  senderNameColor,
  timeColor,
}) {
  const { translate } = useTranslation();
  const { from, text, time, type } = message;

  // Use provided colors or defaults
  const bubbleMeBg = bubbleMeColor || "#B9F3E0";
  const bubbleOtherBg = bubbleOtherColor || "#A9C1BC";
  const msgTextColor = textColor || colors.textdark;
  const nameColor = senderNameColor || colors.textdark;
  const timeTxtColor = timeColor || colors.text4;

  // Check if this is a media message
  const isMediaMessage =
    type === "image" ||
    type === "video" ||
    type === "audio" ||
    type === "document";

  // If it's a media message, use FileMessageBubble
  if (isMediaMessage) {
    return (
      <FileMessageBubble
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

  // Otherwise render text message
  return (
    <View
      style={[
        styles.messageContainer,
        isMe ? styles.messageContainerMe : styles.messageContainerOther,
      ]}
    >
      {/* Message Bubble */}
      <View
        style={[
          styles.bubble,
          isMe ? styles.bubbleMe : styles.bubbleOther,
          { backgroundColor: isMe ? bubbleMeBg : bubbleOtherBg },
        ]}
      >
        {/* Sender and Time Info - Inside Bubble */}
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

export default ChatBubble;
