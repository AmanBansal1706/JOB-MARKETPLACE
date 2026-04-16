import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../../theme/worker/colors";
import { useFetchBusinessProfile } from "../../../services/WorkerProfileServices";
import { useTranslation } from "../../../hooks/useTranslation";

export default function BusinessProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { translate } = useTranslation();
  const { businessId, businessName } = route.params || {};

  // Fetch business profile using the hook
  const {
    isPending: isLoading,
    error,
    data: apiData,
  } = useFetchBusinessProfile(businessId);

  // Transform API data
  const business = apiData?.business || {};
  const avgRating = apiData?.avg_rating || 0;
  const ratingCount = apiData?.rating_count || 0;
  const reviews = apiData?.reviews || [];

  // Build business data from API response
  const businessData = {
    id: business.id || businessId,
    name: business.business_name || businessName || "Business Name",
    fullName: `${business.first_name || ""} ${business.last_name || ""}`.trim(),
    rating: avgRating,
    totalReviews: ratingCount,
    profileImage:
      business.profile_picture || "https://picsum.photos/200/200?random=1",
  };

  // Transform reviews from API format
  const transformedReviews = reviews.map((review, index) => ({
    id: index + 1,
    jobName: review.job_name || "Job",
    rating: review.stars || 0,
    comment: review.review || "No comment provided.",
    date: review.review_date || "Unknown date",
    cost: review.job_cost,
  }));

  const renderStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FontAwesome
            key={star}
            name={star <= Math.floor(rating) ? "star" : "star-o"}
            size={16}
            color={colors.ui.star}
            style={{ marginRight: 4 }}
          />
        ))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary.pink} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          {translate("workerBusinessProfile.failedLoadProfile")}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            // Refetch would need to be added to the hook
          }}
        >
          <Text style={styles.retryButtonText}>
            {translate("workerCommon.retry")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" backgroundColor={colors.primary.pink} />

      {/* Header */}
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {translate("workerBusinessProfile.businessProfile")}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: businessData.profileImage }}
              style={styles.profileImage}
              resizeMode="cover"
            />
          </View>

          <Text style={styles.businessName}>{businessData.name}</Text>

          {businessData.fullName && (
            <Text style={styles.ownerName}>
              {translate("workerBusinessProfile.owner")}
              {businessData.fullName}
            </Text>
          )}

          {/* Rating */}
          <View style={styles.ratingContainer}>
            {renderStars(businessData.rating)}
            <Text style={styles.ratingText}>
              {businessData.rating} ({businessData.totalReviews} reviews)
            </Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{ratingCount}</Text>
            <Text style={styles.statLabel}>
              {translate("workerBusinessProfile.totalReviews")}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{avgRating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>
              {translate("workerBusinessProfile.avgRating")}
            </Text>
          </View>
        </View>

        {/* Reviews Section */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>
            {translate("workerBusinessProfile.recentReviews")}
          </Text>

          {transformedReviews.length > 0 ? (
            transformedReviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewerName}>{review.jobName}</Text>
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                  <View style={styles.reviewRating}>
                    {renderStars(review.rating)}
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
                {review.cost && (
                  <Text style={styles.jobCost}>
                    {translate("workerBusinessProfile.jobValue", {
                      amount: review.cost,
                    })}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noReviewsText}>
              {translate("workerBusinessProfile.noReviewsYet")}
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.ui.screenBackground,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.ui.screenBackground,
  },
  headerSafeArea: {
    backgroundColor: colors.primary.pink,
    zIndex: 10,
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: colors.primary.pink,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileSection: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: "center",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.white,
  },
  businessName: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: colors.black,
    marginBottom: 8,
    textAlign: "center",
  },
  ownerName: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  starsContainer: {
    flexDirection: "row",
    marginRight: 10,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: colors.text.secondary,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: colors.primary.pink,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: colors.text.secondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: colors.black,
    marginBottom: 15,
  },
  reviewsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  reviewCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  reviewerName: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: colors.black,
  },
  reviewDate: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    marginTop: 2,
  },
  reviewRating: {
    marginLeft: 10,
  },
  reviewComment: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  jobCost: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary.pink,
  },
  noReviewsText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    textAlign: "center",
    paddingVertical: 30,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary.pink,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  retryButtonText: {
    color: colors.white,
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
  },
  viewJobsButton: {
    backgroundColor: colors.primary.pink,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  viewJobsButtonText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 0.5,
  },
});
