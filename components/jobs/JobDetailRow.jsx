import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import colors from "../../theme/worker/colors";

const paymentMethodAsset = require("../../assets/worker-images/payment-method.png");

const JobDetailRow = ({
  icon,
  label,
  value,
  badge,
  isImage = false,
  roundIcon = false,
  secondLabel,
  secondValue,
  secondIcon,
  isClickable = false,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.detailRow}
    onPress={onPress}
    disabled={!isClickable}
    activeOpacity={isClickable ? 0.7 : 1}
  >
    <View style={styles.detailItemContainer}>
      <View style={styles.detailLeft}>
        {isImage ? (
          <Image
            source={icon}
            style={roundIcon ? styles.roundIcon : styles.detailIcon}
            resizeMode={roundIcon ? "cover" : "contain"}
          />
        ) : (
          <MaterialCommunityIcons
            name={icon}
            size={18}
            color={colors.primary.pink}
          />
        )}
        <Text style={styles.detailLabel}>{label}:</Text>
        {isClickable && (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.primary.pink}
            style={{ marginLeft: 4 }}
          />
        )}
      </View>
      <View style={[styles.detailValueRow, roundIcon && styles.roundIconValue]}>
        <Text style={styles.detailValue}>{value}</Text>
        {badge ? <Text style={styles.detailValue}> {badge}</Text> : null}
      </View>
    </View>

    {secondLabel && (
      <View style={styles.detailItemContainer}>
        <View style={styles.detailLeft}>
          <Image
            source={secondIcon || paymentMethodAsset}
            style={styles.detailIcon}
            resizeMode="contain"
          />
          <Text style={styles.detailLabel}>{secondLabel}:</Text>
        </View>
        <View style={styles.detailValueRow}>
          <Text style={styles.detailValue}>{secondValue}</Text>
        </View>
      </View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 0,
  },
  detailItemContainer: {
    flex: 1,
  },
  detailLeft: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  detailIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  roundIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
    color: colors.black,
  },
  detailValueRow: {
    paddingLeft: 30,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  roundIconValue: {
    paddingLeft: 54,
    marginTop: -10,
  },
  detailValue: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
  },
});

export default JobDetailRow;
