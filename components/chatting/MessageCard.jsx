import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { colors, fonts, fontSizes } from "../../theme";

/**
 * MessageCard Component
 * Displays a single message conversation preview
 * Compact and clean design with improved visual hierarchy
 * Supports theming via color props for business/worker panels
 */
function MessageCard({
  avatarSource,
  name,
  snippet,
  timeLabel,
  unreadCount,
  onPress,
  // Theme color props
  cardBackgroundColor,
  nameColor,
  snippetColor,
  timeColor,
  unreadBadgeColor,
  unreadNameColor,
}) {
  const Container = onPress ? TouchableOpacity : View;
  const hasUnread = Number(unreadCount) > 0;

  // Use provided colors or defaults
  const cardBg = cardBackgroundColor || colors.bbg6;
  const textNameColor = nameColor || colors.textdark;
  const textSnippetColor = snippetColor || colors.text4;
  const textTimeColor = timeColor || colors.text4;
  const badgeColor = unreadBadgeColor || colors.primary;
  const unreadNameClr = unreadNameColor || colors.primary;

  return (
    <Container
      style={[styles.messageCard, { backgroundColor: cardBg }]}
      activeOpacity={onPress ? 0.8 : undefined}
      onPress={onPress}
    >
      {/* Avatar Section */}
      <View style={styles.avatarContainer}>
        {avatarSource ? (
          <Image
            source={avatarSource}
            style={styles.messageAvatar}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.messageAvatarPlaceholder} />
        )}
      </View>

      {/* Content Section */}
      <View style={styles.messageMiddle}>
        {/* Header: Name and Time */}
        <View style={styles.messageHeaderRow}>
          <Text
            style={[
              styles.messageName,
              { color: hasUnread ? unreadNameClr : textNameColor },
              hasUnread && styles.messageNameUnread,
            ]}
            numberOfLines={1}
          >
            {name}
          </Text>
          {!!timeLabel && (
            <Text
              style={[styles.messageTime, { color: textTimeColor }]}
              numberOfLines={1}
            >
              {timeLabel}
            </Text>
          )}
        </View>
        {/* Message Snippet */}
        {!!snippet && (
          <Text
            style={[styles.messageSnippet, { color: textSnippetColor }]}
            numberOfLines={1}
          >
            {snippet}
          </Text>
        )}
      </View>

      {/* Badge Section */}
      {hasUnread && (
        <View
          style={[styles.messageUnreadBadge, { backgroundColor: badgeColor }]}
        >
          <Text style={styles.messageUnreadText}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </Text>
        </View>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  messageCard: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
    alignItems: "center",
    backgroundColor: colors.bbg6,
    borderRadius: 16,
    marginHorizontal: 14,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  avatarContainer: {
    position: "relative",
  },
  messageAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.bbg5,
    borderWidth: 2,
    borderColor: "#fff",
  },
  messageAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.tertiary,
    borderWidth: 2,
    borderColor: "#fff",
  },
  messageMiddle: {
    flex: 1,
    justifyContent: "center",
  },
  messageHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 3,
    gap: 8,
  },
  messageName: {
    fontSize: fontSizes.md,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
    flexShrink: 1,
  },
  messageNameUnread: {
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  messageSnippet: {
    fontSize: fontSizes.sm,
    color: colors.text4,
    lineHeight: 18,
    fontFamily: fonts.regular,
  },
  messageTime: {
    fontSize: fontSizes.xs,
    color: colors.text4,
    fontFamily: fonts.regular,
    minWidth: 40,
    textAlign: "right",
  },
  messageUnreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  messageUnreadText: {
    color: "#fff",
    fontSize: fontSizes.xss,
    fontFamily: fonts.bold,
  },
});

export default MessageCard;
