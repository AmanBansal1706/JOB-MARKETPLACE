import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { colors, fonts, fontSizes } from "../../theme";
import { useTranslation } from "../../hooks/useTranslation";
import React from "react";

/**
 * ChatHeader Component
 * Displays chat conversation header with user info and action buttons
 * Supports theming via color props for business/worker panels
 */
function ChatHeader({
  name,
  avatar,
  onBackPress,
  backgroundColor,
  textColor,
  subtitleColor,
}) {
  const { translate } = useTranslation();

  // Use provided colors or defaults
  const bgColor = backgroundColor || colors.bg1;
  const titleColor = textColor || "#fff";
  const statusColor = subtitleColor || "#D5F1EA";

  return (
    <View style={[styles.header, { backgroundColor: bgColor }]}>
      {/* Back Button */}
      {onBackPress && (
        <TouchableOpacity
          style={[styles.backBtn, { borderColor: bgColor }]}
          onPress={onBackPress}
          activeOpacity={0.7}
        >
          <Text style={[styles.backIcon, { color: bgColor }]}>‹</Text>
        </TouchableOpacity>
      )}

      {/* Avatar and Name */}
      <View style={styles.userInfo}>
        {avatar ? (
          <Image
            source={avatar}
            style={styles.headerAvatar}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.avatarPlaceholder} />
        )}
        <View style={styles.nameContainer}>
          <Text
            style={[styles.headerTitle, { color: titleColor }]}
            numberOfLines={1}
          >
            {name || translate("chat.defaultName")}
          </Text>
          <Text style={[styles.onlineStatus, { color: statusColor }]}>
            {translate("chat.activeNow")}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.bg1,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
    marginBottom: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: colors.bg1,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    color: colors.bg1,
    fontSize: fontSizes.xl,
    fontFamily: fonts.semiBold,
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginLeft: 8,
  },
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.tertiary,
  },
  nameContainer: {
    flex: 1,
    justifyContent: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: fontSizes.xl,
    fontFamily: fonts.bold,
  },
  onlineStatus: {
    color: "#D5F1EA",
    fontSize: fontSizes.xs,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.tertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  callIcon: {
    width: 18,
    height: 18,
    tintColor: colors.bbg4,
  },
  moreIcon: {
    color: "#fff",
    fontSize: fontSizes.lg,
    fontFamily: fonts.semiBold,
  },
});

export default ChatHeader;
