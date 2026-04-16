import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, fonts } from "../../theme";
import DataCard from "../DataCard";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "../../hooks/useTranslation";
import React from "react";

const experienceLevels = [
  { value: "beginner", label: "jobs.beginner", icon: "speed" },
  { value: "intermediate", label: "jobs.intermediate", icon: "speed" },
  { value: "expert", label: "jobs.expert", icon: "speed" },
];

export default function SkillsResponsibilitiesCard({
  details,

  cardTitle,
  variant = "card",
  showTitle = true,
}) {
  const navigation = useNavigation();
  const { translate } = useTranslation();
  const title = showTitle
    ? cardTitle || translate("jobs.skillsResponsibilities")
    : null;

  const handleViewApplicants = (details) => {
    navigation.navigate("ActiveApplicants", {
      jobId: details.id,
      type: details.status.toLowerCase() === "active" ? "active" : "completed",
    });
  };
  const experienceKeyMap = {
    beginner: "experience.beginner",
    intermediate: "experience.intermediate",
    expert: "experience.expert",
  };

  const Chip = ({ label }) => (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );

  const getExperienceLevelLabel = (value) => {
    const level = experienceLevels.find((l) => l.value === value);
    return level ? translate(level.label) : translate("jobs.notSpecified");
  };

  return (
    <DataCard title={title} variant={variant}>
      <Text style={styles.blockSubHeader}>
        {translate("jobs.selectedSkills")}
      </Text>
      <View style={styles.chipsRow}>
        {details.skills && details.skills.length > 0 ? (
          details.skills.map((s, idx) => (
            <Chip key={`skill-${idx}`} label={s} />
          ))
        ) : (
          <Text style={styles.noDataText}>
            {translate("jobs.noSkillsSpecified")}
          </Text>
        )}
      </View>
      <View style={styles.hr} />
      <Text style={styles.blockSubHeader}>
        {translate("jobs.selectedResponsibilities")}
      </Text>
      <View style={styles.chipsRow}>
        {details.responsibilities && details.responsibilities.length > 0 ? (
          details.responsibilities.map((s, idx) => (
            <Chip key={`resp-${idx}`} label={s} />
          ))
        ) : (
          <Text style={styles.noDataText}>
            {translate("jobs.noResponsibilitiesSpecified")}
          </Text>
        )}
      </View>
      <View style={styles.hr} />
      <Text style={styles.blockSubHeader}>
        {translate("jobs.experienceLevelRequired")}
      </Text>
      <View style={styles.chipsRow}>
        {(() => {
          const selectedLevel = experienceLevels.find(
            (l) => l.value === details.experienceLevel,
          );
          return selectedLevel ? (
            <Chip label={translate(selectedLevel.label)} />
          ) : (
            <Text style={styles.noDataText}>
              {translate("jobs.notSpecified")}
            </Text>
          );
        })()}
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.viewApplicantsBtn}
        onPress={() => handleViewApplicants(details)}
      >
        <Text style={styles.viewApplicantsText}>
          {translate("jobs.viewAllApplicants", {
            count: details.applicantsCount,
          })}
        </Text>
      </TouchableOpacity>
    </DataCard>
  );
}

const styles = StyleSheet.create({
  blockSubHeader: {
    color: colors.textdark,
    fontFamily: fonts.semiBold,
    marginBottom: 8,
    fontSize: 14,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: colors.bbg6,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    color: colors.textdark,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  noDataText: {
    color: colors.text1,
    fontFamily: fonts.regular,
    fontSize: 12,
    fontStyle: "italic",
  },
  hr: {
    height: 1,
    backgroundColor: colors.bg,
    marginVertical: 10,
  },
  viewApplicantsBtn: {
    marginTop: 14,
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  viewApplicantsText: {
    color: colors.textdark,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
});
