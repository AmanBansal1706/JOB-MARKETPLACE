import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { colors, fonts } from "../theme";

export default function NotifFeedCard({
  iconSource,
  title,
  message,
  time,
  unread = false,
  expanded = false,
  height,
  backgroundColor = "#FFFFFF",
  accentColor = colors.primary,
  style = {},
  titleStyle = {},
  messageStyle = {},
  onPress,
  rightBadgeLabel,
  rightBadgeBg = colors.bbg5,
  rightBadgeColor = colors.textdark,
}) {
  return (
    <View style={[styles.wrap, style]}>
      <Pressable
        onPress={onPress}
        style={[
          styles.card,
          {
            backgroundColor,
            borderLeftColor: accentColor,
            borderLeftWidth: 8,
          },
        ]}
      >
        <View style={styles.row}>
          {!!iconSource && (
            <View style={styles.iconWrap}>
              <Image
                source={iconSource}
                style={styles.icon}
                resizeMode="contain"
              />
            </View>
          )}
          <View style={{ flex: 1, paddingVertical: 6 }}>
            <Text style={[styles.title, titleStyle]}>{title}</Text>
            {!!message && (
              <Text
                style={[styles.message, messageStyle]}
                numberOfLines={expanded ? undefined : 1}
                ellipsizeMode="tail"
              >
                {message}
              </Text>
            )}
            {!!time && <Text style={styles.time}>{time}</Text>}
          </View>
          {!!rightBadgeLabel && (
            <View style={[styles.badge, { backgroundColor: rightBadgeBg }]}>
              <Text style={[styles.badgeText, { color: rightBadgeColor }]}>
                {rightBadgeLabel}
              </Text>
            </View>
          )}
          {unread && <View style={styles.dot} />}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    marginBottom: 14,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    overflow: "hidden",
  },
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    flexWrap: "wrap",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E1F2EC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  icon: { width: 28, height: 28 },
  title: { color: colors.textdark, fontFamily: fonts.semiBold, fontSize: 16 },
  message: {
    marginTop: 6,
    color: colors.text1,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  time: {
    marginTop: 6,
    color: "#9CB5AC",
    fontSize: 11,
    fontFamily: fonts.regular,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E84848",
    marginLeft: 12,
    alignSelf: "flex-start",
    marginTop: 16,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 12,
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
  },
});
