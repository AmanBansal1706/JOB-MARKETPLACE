import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Feather,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import colors from "../../../theme/worker/colors";
import { openMapsApp } from "../../../utils/mapUtils";
import JobTimeScheduleTable from "../../../components/jobs/JobTimeScheduleTable";
import JobDetailRow from "../../../components/jobs/JobDetailRow";
import JobPositionResponsibilitiesCard from "../../../components/jobs/JobPositionResponsibilitiesCard";
import locationIcon from "../../../assets/worker-images/location.png";
import paymentRate from "../../../assets/worker-images/payment-rate.png";
import jobPositionIcon from "../../../assets/worker-images/position (2).png";
import distanceIcon from "../../../assets/worker-images/distance.png";
import { useTranslation } from "../../../hooks/useTranslation";
import { formatReviewDate } from "../../../utils/dateFormatting";

export default function CompletedJobDetailsScreen({
  jobData,
  onRefresh,
  isRefreshing,
}) {
  console.log("jobData", JSON.stringify(jobData.reviews, null, 2));
  const navigation = useNavigation();
  const { translate } = useTranslation();

  if (!jobData) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          {translate("workerJobs.noJobDataAvailable")}
        </Text>
      </View>
    );
  }

  const handleBusinessProfilePress = () => {
    if (jobData?.business_id) {
      navigation.navigate("BusinessProfile", {
        businessId: jobData.business_id,
        businessName: jobData.business_name,
      });
    }
  };

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
            {translate("workerJobs.completedJob")}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing || false}
            onRefresh={onRefresh}
            colors={[colors.primary.pink]}
            tintColor={colors.primary.pink}
          />
        }
      >
        {/* Main Job Info Card */}
        <View style={[styles.card, { paddingBottom: 60 }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.jobTitle}>{jobData.job_title || "N/A"}</Text>
            <Text style={styles.price}>
              Est. ${jobData.job_cost_for_worker_after_worker_commission || 0}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleBusinessProfilePress}
            activeOpacity={0.7}
            style={styles.businessRow}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={{
                  uri:
                    jobData.business_profile_picture ||
                    "https://picsum.photos/60/60?random=1",
                }}
                style={styles.businessProfilePicture}
              />
              <Text style={styles.businessName}>
                {jobData.business_name || "N/A"}
              </Text>
            </View>
            <Text style={styles.pipe}>|</Text>
            <View style={styles.ratingRow}>
              <View style={{ flexDirection: "row", marginRight: 5 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <FontAwesome
                    key={s}
                    name="star"
                    size={13}
                    color={
                      s <= Math.floor(jobData.business_avg_ratings || 0)
                        ? "#FFD700"
                        : "#E0E0E0"
                    }
                    style={{ marginRight: 2 }}
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>
                {jobData.business_avg_ratings || 0}
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.description}>{jobData.description || "N/A"}</Text>

          <View style={styles.divider} />

          <View style={styles.detailsList}>
            <JobDetailRow
              icon={jobPositionIcon}
              label={translate("workerJobs.positionLabel")}
              value={jobData.position || "N/A"}
              isImage
              badge={jobData.experience_level}
            />
            <JobDetailRow
              icon={locationIcon}
              label={translate("workerJobs.locationLabel")}
              value={jobData.location_address || "N/A"}
              isImage
              isClickable
              onPress={() =>
                openMapsApp(
                  jobData.location_details || {
                    address: jobData.location_address,
                  },
                )
              }
            />
            <JobDetailRow
              icon={paymentRate}
              label={translate("workerJobs.payRateLabel")}
              value={jobData.pay_rate ? `$${jobData.pay_rate}/hr` : "N/A"}
              isImage
              secondLabel={translate("workerJobs.paymentMode")}
              secondValue={jobData.payment_method_text || "N/A"}
            />
            <JobDetailRow
              icon={distanceIcon}
              label={translate("workerJobs.distanceLabel")}
              value={jobData.distance_km ? `${jobData.distance_km}km` : "N/A"}
              isImage
            />
          </View>

          {/* Floating Time Schedules Card moved inside */}
          <JobTimeScheduleTable slots={jobData.slots} />
        </View>

        {/* Reviews Card */}
        {jobData.reviews && jobData.reviews.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitleRed}>
              {translate("workerJobs.reviews")}
            </Text>
            <View style={styles.reviewsListContainer}>
              {jobData.reviews.map((review, index) => {
                const isWorkerToBusiness = review.type === "worker_to_business";
                const reviewerName = isWorkerToBusiness
                  ? review.worker_name
                  : review.business_name;
                const reviewerImage = isWorkerToBusiness
                  ? review.worker_profile_picture
                  : review.business_profile_picture;

                return (
                  <View key={review.id || index} style={styles.reviewContainer}>
                    {index > 0 && <View style={styles.reviewDivider} />}
                    <View style={styles.reviewFooter}>
                      <View style={styles.reviewerAvatarSmall}>
                        {reviewerImage ? (
                          <Image
                            source={{ uri: reviewerImage }}
                            style={styles.reviewerAvatarSmall}
                          />
                        ) : (
                          <Text style={styles.reviewerInitialSmall}>
                            {(reviewerName || "N").charAt(0)}
                          </Text>
                        )}
                      </View>
                      <Text style={styles.reviewerName}>
                        {reviewerName || "N/A"}
                      </Text>
                      <Text style={styles.reviewDot}>•</Text>
                      <Text style={styles.reviewTime}>
                        {review.created_at
                          ? formatReviewDate(review.created_at)
                          : "N/A"}
                      </Text>
                    </View>
                    <View style={styles.reviewRatingRow}>
                      <View style={{ flexDirection: "row", marginRight: 5 }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <FontAwesome
                            key={s}
                            name="star"
                            size={13}
                            color={
                              s <= Math.floor(review.rating || 0)
                                ? colors.ui.star
                                : "#E0E0E0"
                            }
                            style={{ marginRight: 2 }}
                          />
                        ))}
                      </View>
                      <Text style={styles.reviewRatingText}>
                        {review.rating || 0}
                      </Text>
                    </View>
                    <Text style={styles.reviewComment}>
                      {review.review || "N/A"}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Required Position and Responsibilities Card */}
        <JobPositionResponsibilitiesCard
          position={jobData.position}
          responsibilities={jobData.responsibilities}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFF5F7", // Very light pink background
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
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: colors.primary.pink,
    flex: 1,
    marginRight: 10,
  },
  price: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: colors.primary.pink,
  },
  businessRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 12,
  },
  businessProfilePicture: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 8,
  },
  businessName: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: colors.auth.darkRed,
  },
  pipe: {
    fontSize: 14,
    color: colors.text.secondary,
    marginHorizontal: 8,
    fontFamily: "Poppins_400Regular",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: "#FFD700", // Gold
  },
  description: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 15,
  },
  detailsList: {
    gap: 15,
  },
  sectionTitleRed: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: colors.auth.darkRed,
    // marginBottom: 15,
  },
  reviewsListContainer: {
    // marginTop: 10,
  },
  reviewContainer: {
    marginTop: 15,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 15,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  reviewTitle: {
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
    color: colors.black,
    flex: 1,
  },
  reviewRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  reviewRatingText: {
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
    color: "#FFD700",
    marginLeft: 4,
  },
  reviewComment: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  reviewFooter: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    paddingBottom: 5,
  },
  reviewerAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  reviewerInitialSmall: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: colors.white,
  },
  reviewerName: {
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
    color: colors.black,
    marginRight: 5,
  },
  reviewDot: {
    fontSize: 12,
    color: colors.text.secondary,
    marginHorizontal: 5,
  },
  reviewTime: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 10,
  },
});
