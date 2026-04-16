import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { colors, fonts } from "../../theme";
import { useTranslation } from "../../hooks/useTranslation";
import DataCard from "../DataCard";
import React from "react";

/**
 * CompletedAssignedWorkersCard - Displays assigned workers with detailed info and reviews for completed jobs
 * Shows: Worker avatar, name, position, experience, rating, bio, and up to 2 reviews
 * @param {array} workers - Array of assigned worker objects with review data
 * @param {function} onDownloadAgreement - Callback for download agreement button
 */
export default function CompletedAssignedWorkersCard({
  workers,
  onDownloadAgreement,
}) {
  // [{"id":19,"name":"Seed Worker1","firstName":"Seed","lastName":"Worker1",
  // "profilePicture":"https://ui-avatars.com/api/?name=S&size=400&background=005943&color=FFFFFF&rounded=true",
  // "hired":"12/11/2025","paymentMode":"Cash","position":"Worker","experience":"N/A","rating":4.5556,
  // "noOfReviews":1,"bio":"",
  // "reviews":[{"reviewer_name":"Ravi kumar gupta","rating":5,"job_cost":1837.5,"review_title":"Good","review_description":"Good"}]},

  // {"id":21,"name":"Seed Worker3","firstName":"Seed","lastName":"Worker3",
  // "profilePicture":"https://ui-avatars.com/api/?name=S&size=400&background=005943&color=FFFFFF&rounded=true",
  // "hired":"12/11/2025","paymentMode":"Cash","position":"Worker","experience":"N/A","rating":4.5455,"noOfReviews":1,
  // "bio":"",
  // "reviews":[{"reviewer_name":"Ravi kumar gupta","rating":5,"job_cost":1837.5,"review_title":"Good","review_description":"Good"}]}]

  const { translate } = useTranslation();

  if (!workers || workers.length === 0) {
    return null;
  }

  return (
    <DataCard title={translate("jobs.selectedWorker")}>
      {workers.map((worker) => (
        <View key={worker.id}>
          <View style={styles.workerRow}>
            <Image
              source={{
                uri: worker.profilePicture,
              }}
              style={styles.workerAvatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.workerName}>{worker.name}</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.stars}>
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (i < Math.floor(worker.rating) ? "★" : "☆"))
                    .join("")}
                </Text>
                <Text style={styles.ratingText}>
                  {" "}
                  {worker.rating.toFixed(1)}({worker.noOfReviews}{" "}
                  {translate("profile.reviews")})
                </Text>
              </View>
              <Text style={styles.workerMeta}>
                {worker.position} • {worker.experience}
              </Text>
              {worker.bio && <Text style={styles.workerBio}>{worker.bio}</Text>}
            </View>
          </View>

          {/* Worker Reviews - Max 2 */}
          {worker.reviews && worker.reviews.length > 0 ? (
            worker.reviews.slice(0, 2).map((review, idx) => (
              <View
                key={idx}
                style={[styles.reviewBlock, idx === 0 && { marginTop: 20 }]}
              >
                <View style={styles.reviewHeaderRow}>
                  <Text style={styles.reviewBy}>
                    {translate("jobs.reviewFrom", {
                      name: review.reviewer_name,
                    })}
                  </Text>
                  {review.job_cost > 0 && (
                    <Text style={styles.reviewAmount}>${review.job_cost}</Text>
                  )}
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 4,
                    marginBottom: 8,
                  }}
                >
                  <Text style={styles.stars}>
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (i < review.rating ? "★" : "☆"))
                      .join("")}
                  </Text>
                  <Text style={styles.starScore}>
                    {" "}
                    {review.rating.toFixed(1)}
                  </Text>
                </View>
                {/* {review.review_title && (
                  <Text style={styles.reviewTitle}>{review.review_title}</Text>
                )} */}
                {review.review_description && (
                  <Text style={styles.reviewText}>
                    {review.review_description}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <Text
              style={[
                styles.reviewText,
                { marginTop: 12, fontStyle: "italic" },
              ]}
            >
              {translate("jobs.noReviewsYet")}
            </Text>
          )}

          <View
            style={{
              height: 1,
              backgroundColor: colors.bg,
              marginVertical: 16,
            }}
          />
        </View>
      ))}

      {/* Download Agreement Button */}
      {onDownloadAgreement && (
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.downloadAgreementBtn}
          onPress={onDownloadAgreement}
        >
          <Text style={styles.downloadAgreementText}>
            {translate("jobs.downloadAgreement")}
          </Text>
        </TouchableOpacity>
      )}
    </DataCard>
  );
}

const styles = StyleSheet.create({
  workerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    alignItems: "flex-start",
    marginBottom: 12,
    marginTop: 8,
  },
  workerAvatar: { width: 60, height: 60, borderRadius: 30 },
  workerName: {
    color: colors.textdark,
    fontFamily: fonts.bold,
    fontSize: 16,
    marginBottom: 2,
    flexBasis: "100%",
  },
  ratingRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 4,
  },
  workerMeta: {
    color: colors.text1,
    fontFamily: fonts.regular,
    fontSize: 13,
    marginBottom: 4,
    flexWrap: "wrap",
  },
  workerBio: {
    color: colors.text1,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  stars: { color: "#E0A125", fontSize: 14 },
  ratingText: {
    color: "#E0A125",
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  reviewBlock: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  reviewHeaderRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  reviewBy: {
    color: colors.textdark,
    fontFamily: fonts.bold,
    fontSize: 14,
    flexShrink: 1,
  },
  reviewAmount: {
    color: colors.tertiary,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  starScore: { color: "#E0A125", fontFamily: fonts.medium, fontSize: 13 },
  reviewTitle: {
    color: colors.textdark,
    fontFamily: fonts.semiBold,
    marginTop: 4,
    fontSize: 14,
  },
  reviewText: {
    color: colors.text1,
    fontFamily: fonts.regular,
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  downloadAgreementBtn: {
    backgroundColor: colors.tertiary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  downloadAgreementText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: "#FFF",
  },
});
