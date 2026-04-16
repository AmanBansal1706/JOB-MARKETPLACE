import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { colors, fonts } from "../theme";

export default function DataCard({
  title,
  subtitle,
  iconSource,
  headerRight,
  style = {},
  contentStyle = {},
  children,
  variant = "card", // 'card' | 'flat'
}) {
  const isFlat = variant === "flat";
  return (
    <View style={[styles.cardWrap, style, isFlat && styles.flatWrap]}>
      <View style={[styles.card, isFlat && styles.flatCard]}>
        {(title || subtitle || iconSource || headerRight) && (
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              {!!iconSource && (
                <Image
                  source={iconSource}
                  style={styles.headerIcon}
                  resizeMode="contain"
                />
              )}
              <View>
                {!!title && <Text style={styles.title}>{title}</Text>}
                {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
              </View>
            </View>
            {!!headerRight && (
              <View style={styles.headerRight}>{headerRight}</View>
            )}
          </View>
        )}
        <View style={[styles.content, contentStyle]}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    marginBottom: 16,
    position: "relative",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerIcon: { width: 22, height: 22, marginRight: 8 },
  headerRight: {},
  title: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.textdark },
  subtitle: { fontFamily: fonts.regular, fontSize: 12, color: colors.text1 },
  content: {},
  flatWrap: {
    marginBottom: 0,
  },
  flatCard: {
    backgroundColor: "transparent",
    borderRadius: 0,
    padding: 0,
    shadowColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
  },
});
