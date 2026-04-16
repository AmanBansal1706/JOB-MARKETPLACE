import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import colors from "../../theme/worker/colors";

const AlertReminderCard = ({ alertCount, translate, navigation }) => {
  if (alertCount === 0) return null;

  return (
    <TouchableOpacity
      style={styles.alertReminderCard}
      onPress={() => navigation.navigate("WorkerMainAlerts")}
      activeOpacity={0.85}
    >
      <View style={styles.alertReminderContent}>
        <View style={styles.alertIconContainer}>
          <Ionicons name="notifications-sharp" size={24} color={colors.white} />
          <View style={styles.alertBadge}>
            <Text style={styles.alertBadgeText}>{alertCount}</Text>
          </View>
        </View>
        <View style={styles.alertTextContainer}>
          <Text style={styles.alertTitle}>
            {alertCount === 1
              ? translate("workerHome.alertPending", { count: alertCount })
              : translate("workerHome.alertsPending", { count: alertCount })}
          </Text>
          <Text style={styles.alertSubtitle}>
            {translate("workerHome.tapToReview")}
          </Text>
        </View>
        <Feather
          name="chevron-right"
          size={20}
          color={colors.white}
          style={styles.alertChevron}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  alertReminderCard: {
    backgroundColor: colors.primary.pink,
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
    shadowColor: colors.primary.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  alertReminderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  alertIconContainer: {
    position: "relative",
    marginRight: 12,
  },
  alertBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: colors.primary.darkRed,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  alertBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontFamily: "Poppins_700Bold",
  },
  alertTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  alertTitle: {
    color: colors.white,
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 4,
  },
  alertSubtitle: {
    color: colors.white,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    opacity: 0.9,
  },
  alertChevron: {
    marginLeft: 8,
  },
});

export default AlertReminderCard;
