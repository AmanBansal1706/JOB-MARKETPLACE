import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../../theme/worker/colors";
import { useTranslation } from "../../hooks/useTranslation";

const OverlappingInfoModal = ({ visible, onClose, overlapData }) => {
  const { translate } = useTranslation();

  if (!overlapData) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.warningIconContainer}>
                <Ionicons name="warning" size={24} color="#EF6C00" />
              </View>
              <Text style={styles.title}>{translate("workerJobs.overlappingInfo") || "Overlap Information"}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={styles.description}>
              {translate("workerJobs.overlappingDesc") || "This slot overlaps with another shift already in your schedule:"}
            </Text>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="briefcase-outline" size={20} color={colors.primary.pink} />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.label}>{translate("workerJobs.jobName") || "Job Name"}</Text>
                  <Text style={styles.value}>{overlapData.job_name || "N/A"}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Feather name="calendar" size={20} color={colors.primary.pink} />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.label}>{translate("workerJobs.dateRange") || "Date Range"}</Text>
                  <Text style={styles.value}>
                    {overlapData.start_date} - {overlapData.end_date}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Feather name="clock" size={20} color={colors.primary.pink} />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.label}>{translate("workerHome.joiningTime") + " - " + translate("workerJobs.finishTime")}</Text>
                  <Text style={styles.value}>
                    {overlapData.joining_time} - {overlapData.finish_time}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.warningBox}>
              <Ionicons name="information-circle-outline" size={20} color="#E65100" />
              <Text style={styles.warningText}>
                {translate("workerJobs.overlappingWarning") || "You cannot apply for this slot while it conflicts with your existing schedule."}
              </Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.okButton} onPress={onClose}>
              <Text style={styles.okButtonText}>{translate("workerCommon.ok")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  warningIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF3E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: colors.text.primary,
  },
  closeButton: {
    padding: 5,
  },
  body: {
    padding: 20,
  },
  description: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EEF0F2",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: colors.text.lightGray,
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEF0F2",
    marginVertical: 12,
  },
  warningBox: {
    flexDirection: "row",
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
    alignItems: "flex-start",
    gap: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    color: "#E65100",
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  okButton: {
    backgroundColor: colors.primary.pink,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  okButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
});

export default OverlappingInfoModal;
