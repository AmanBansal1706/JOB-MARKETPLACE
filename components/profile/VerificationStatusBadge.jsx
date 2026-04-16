import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { colors, fonts } from "../../theme";
import { getVerificationStatusInfo } from "../../utils/profileValidation";
import { useTranslation } from "../../hooks/useTranslation";

export default function VerificationStatusBadge({
  verificationStatus,
  rejectionReason,
  userRole,
}) {
  const { translate } = useTranslation();
  if (!verificationStatus) return null;

  const statusInfo = getVerificationStatusInfo(verificationStatus, translate);

  return (
    <View style={[styles.badge, { borderLeftColor: statusInfo.color }]}>
      <View style={styles.header}>
        <FontAwesome5
          name={statusInfo.icon}
          size={16}
          color={statusInfo.color}
          solid
        />
        <Text style={[styles.label, { color: statusInfo.color }]}>
          {statusInfo.label}
        </Text>
        {userRole && <Text style={styles.role}>({userRole})</Text>}
      </View>

      {rejectionReason && (
        <Text style={styles.rejectionText}>{rejectionReason}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  role: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: "#999",
    marginLeft: "auto",
  },
  rejectionText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: "#F44336",
    marginTop: 8,
    fontStyle: "italic",
  },
});
