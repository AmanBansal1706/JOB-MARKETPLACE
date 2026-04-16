import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../../theme/worker/colors";
import { useTranslation } from "../../hooks/useTranslation";

const JobPositionResponsibilitiesCard = ({
  position,
  responsibilities,
  title = "Position",
  responsibilityLabel = "Responsibilities",
  useNeutralStyle = false,
  showPosition = false,
}) => {
  const { translate } = useTranslation();

  return (
    <View style={styles.card}>
      {showPosition && (
        <>
          {/* Position section kept behind this flag per request to remove it from job detail bottom area without deleting the code path. */}
          <Text
            style={[
              styles.sectionTitleRed,
              useNeutralStyle && styles.miniLabel,
            ]}
          >
            {title}
          </Text>
          <View style={styles.pillsRow}>
            <View style={styles.pill}>
              <MaterialCommunityIcons
                name="account-group-outline"
                size={14}
                color={colors.primary.pink}
              />
              <Text style={styles.pillText}>{position || "N/A"}</Text>
            </View>
          </View>

          <View style={{ height: 25 }} />
        </>
      )}

      <Text
        style={[styles.sectionTitleRed, useNeutralStyle && styles.miniLabel]}
      >
        {responsibilityLabel}
      </Text>
      {responsibilities && responsibilities.length > 0 ? (
        <View style={styles.responsibilitiesList}>
          {responsibilities.map((resp, index) => (
            <Text key={resp.id || index} style={styles.responsibilityItem}>
              {index + 1}. {resp.name}
            </Text>
          ))}
        </View>
      ) : (
        <Text style={styles.noDataText}>
          {translate("workerComponents.noResponsibilitiesSpecified")}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 25,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  sectionTitleRed: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: colors.auth.darkRed,
    marginBottom: 15,
  },
  miniLabel: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: colors.black,
    marginBottom: 10,
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.selectedBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillText: {
    marginLeft: 5,
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: colors.primary.pink,
  },
  responsibilitiesList: {
    gap: 10,
  },
  responsibilityItem: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
  },
  noDataText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 10,
  },
});

export default JobPositionResponsibilitiesCard;
