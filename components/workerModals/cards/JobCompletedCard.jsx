import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "../../../theme/worker/colors";
import { formatDisplayDate } from "../../../utils/dateFormatting";
import { useTranslation } from "../../../hooks/useTranslation";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const result = formatDisplayDate(dateString);
  return result === "N/A" ? dateString : result;
};

export default function JobCompletedCard({ jobData, onRate, onSkip }) {
  const { translate } = useTranslation();
  if (!jobData) return null;

  return (
    <View style={styles.card}>
      {/* Title */}
      <Text style={styles.title}>{translate("workerModals.jobCompleted")}</Text>

      {/* Success Icon */}
      <View style={styles.iconContainer}>
        <View style={styles.successBadge}>
          <Ionicons name="checkmark" size={36} color={colors.white} />
        </View>
      </View>

      {/* Job Title */}
      <Text style={styles.jobTitle}>{jobData.job_title}</Text>

      {/* Completion Date */}
      <View style={styles.dateContainer}>
        <Ionicons
          name="calendar"
          size={16}
          color={colors.primary.pink}
          style={styles.dateIcon}
        />
        <Text style={styles.completedDate}>
          {translate("workerModals.completedOn", {
            date: formatDate(jobData.completed_at),
          })}
        </Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Mandatory rating info */}
      <Text style={styles.infoText}>
        {translate("workerModals.cashPaymentRatingRequired")}
      </Text>

      {/* Rating Button */}
      <TouchableOpacity
        style={styles.ratingButton}
        onPress={() => onRate(jobData)}
        activeOpacity={0.8}
      >
        <Ionicons
          name="star"
          size={20}
          color={colors.white}
          style={styles.ratingIcon}
        />
        <Text style={styles.ratingButtonText}>
          {translate("workerModals.rateThisJob")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: colors.primary.pink,
    marginBottom: 20,
    textAlign: "center",
  },
  iconContainer: {
    marginBottom: 25,
    marginTop: 10,
  },
  successBadge: {
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: colors.primary.pink,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: colors.primary.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 15,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#FFF5F7",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
  },
  dateIcon: {
    marginRight: 8,
  },
  completedDate: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: colors.text.primary,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 20,
  },
  infoText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 18,
  },
  ratingButton: {
    backgroundColor: colors.primary.pink,
    width: "100%",
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: colors.primary.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  ratingIcon: {
    marginRight: 8,
  },
  ratingButtonText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },
});
