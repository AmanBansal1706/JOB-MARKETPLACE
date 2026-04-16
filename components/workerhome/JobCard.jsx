import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import SlotsTable from "./SlotsTable";
import colors from "../../theme/worker/colors";

const JobCard = ({
  job,
  activeTab,
  translate,
  handleBusinessProfilePress,
  handleCheckInOut,
  handleViewDetails,
}) => {
  return (
    <View
      key={job.id}
      style={[
        styles.jobCard,
        activeTab === "Disputed" && styles.jobCardDisputed,
      ]}
    >
      <View style={styles.jobCardContent}>
        <View style={styles.jobHeader}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          {job.price !== "-" && (
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.jobPrice}>
                {activeTab === "Suggested"
                  ? translate("workerHome.estimated", { price: job.price })
                  : job.price}
              </Text>
              <Text style={styles.postCommText}>
                {translate("workerHome.afterFees")}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.businessInfoSection}>
          <TouchableOpacity
            onPress={() =>
              handleBusinessProfilePress(job.businessId, job.company)
            }
            style={styles.businessNameRow}
          >
            <Image
              source={{
                uri:
                  job.businessProfilePicture ||
                  "https://picsum.photos/32/32?random=1",
              }}
              style={styles.businessProfilePictureSmall}
              resizeMode="cover"
            />
            <Text style={styles.jobCompany}>{job.company}</Text>
          </TouchableOpacity>

          <Text style={styles.businessDivider}>|</Text>
          <View style={styles.ratingContainerInline}>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <FontAwesome
                  key={s}
                  name="star"
                  size={12}
                  color={
                    s <= Math.floor(job.rating || 0) ? "#FBC02D" : "#E0E0E0"
                  }
                  style={{ marginRight: 2 }}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.payRateRow}>
          <Text style={styles.payRateLabel}>
            {translate("workerHome.payRate")}
          </Text>
          <Text style={styles.payRateValue}>{job.payRate}</Text>
        </View>

        <View style={styles.payRateRow}>
          <Text style={styles.positionLabel}>
            {translate("workerHome.position")}
          </Text>
          <View style={styles.positionInline}>
            <Text style={styles.positionValue}>
              {job.position}
              {","} {job.experienceLevel}
            </Text>
          </View>
        </View>

        {activeTab === "Suggested" && job.distance && (
          <View style={styles.payRateRow}>
            <Text style={styles.payRateLabel}>
              {translate("workerHome.distance")}
            </Text>
            <Text style={styles.payRateValue}>{job.distance}</Text>
          </View>
        )}

        <SlotsTable slots={job.slots} translate={translate} />

        {activeTab === "Assigned" && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: job.showCheckInButton
                    ? colors.ui.actionButtonActive
                    : colors.ui.actionButtonDisabled,
                },
              ]}
              onPress={() => handleCheckInOut(job.id, true)}
              disabled={!job.showCheckInButton}
            >
              <Text style={styles.actionButtonText}>
                {translate("workerHome.checkIn")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: job.showCheckOutButton
                    ? colors.ui.actionButtonActive
                    : colors.ui.actionButtonDisabled,
                },
              ]}
              onPress={() => handleCheckInOut(job.id, false)}
              disabled={!job.showCheckOutButton}
            >
              <Text style={styles.actionButtonText}>
                {translate("workerHome.checkOut")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.viewDetailsButton,
            activeTab === "Disputed" && styles.viewDetailsButtonDisputed,
          ]}
          onPress={() => handleViewDetails(job.id, activeTab)}
        >
          <Text style={styles.viewDetailsText}>
            {translate("workerHome.viewDetails")}
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.leftBorder,
          activeTab === "Disputed" && styles.leftBorderDisputed,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  jobCard: {
    backgroundColor: colors.white,
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: "row",
  },
  leftBorder: {
    width: 6,
    backgroundColor: colors.primary.pink,
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
  },
  leftBorderDisputed: {
    backgroundColor: colors.primary.darkRed,
  },
  jobCardDisputed: {
    // Disputed card styles
  },
  jobCardContent: {
    flex: 1,
    padding: 15,
    paddingLeft: 20,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: colors.black,
    flex: 1,
  },
  jobPrice: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: colors.primary.pink,
  },
  postCommText: {
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    marginTop: -4,
  },
  businessInfoSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  businessNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  businessProfilePictureSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  jobCompany: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#950F00",
  },
  businessDivider: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
  },
  ratingContainerInline: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
  },
  starsRow: {
    flexDirection: "row",
    marginRight: 5,
  },
  positionLabel: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: "#434545",
  },
  positionInline: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  positionValue: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    marginRight: 6,
  },
  payRateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  payRateLabel: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: "#434545",
  },
  payRateValue: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
  },
  viewDetailsButton: {
    backgroundColor: colors.primary.pink,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 12,
  },
  viewDetailsButtonDisputed: {
    backgroundColor: colors.primary.darkRed,
  },
  viewDetailsText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 0.5,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
  },
});

export default JobCard;
