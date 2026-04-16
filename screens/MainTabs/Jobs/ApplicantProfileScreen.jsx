import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { colors, fonts } from "../../../theme";
import { CommonHeader, ScreenWrapper } from "../../../components/common";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  FontAwesome5,
  MaterialIcons,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import { useTranslation } from "../../../hooks/useTranslation";
import LoadingState from "../../../components/LoadingState";
import ErrorState from "../../../components/ErrorState";
import { useFetchWorkerProfile } from "../../../services/ProfileServices";
import {
  useFetchJobById,
  useFetchProposals,
} from "../../../services/JobServices";
import SelectDeselectButton from "../../../components/SelectDeselectButton";

export default function ApplicantProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { translate } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const workerId = route.params?.workerId;
  const jobId = route.params?.jobId; // Optional: may be undefined

  // Fetch worker profile data
  const {
    isPending,
    error,
    data: workerData,
    isError,
    refetch,
  } = useFetchWorkerProfile(workerId);

  // Conditionally fetch job data and proposals when jobId is present
  const {
    data: jobData,
    isPending: isLoadingJob,
    refetch: refetchJob,
  } = useFetchJobById(jobId || null);

  const {
    data: proposalsData,
    isPending: isLoadingProposals,
    refetch: refetchProposals,
  } = useFetchProposals(
    jobId || null,
    { per_page: 100 }, // Fetch enough to find this worker
    { enabled: !!jobId } // Only fetch if jobId exists
  );

  // Handler for select/deselect confirmation
  const handleSelectDeselect = () => {
    refetch(), refetchJob(), refetchProposals();
  };

  // Provide fallback UI while loading
  if (isPending) {
    return (
      <LoadingState
        title={translate("profile.title")}
        message={translate("common.loading")}
        backgroundColor={colors.bg}
      />
    );
  }

  // Show error state
  if (isError) {
    return (
      <ErrorState
        title={translate("profile.title")}
        errorMessage={
          error?.message || translate("jobs.failedToLoadWorkerProfile")
        }
        onRetry={() => refetch()}
      />
    );
  }

  // Extract job-related data for SelectDeselectButton (only if jobId exists)
  let jobDetails = null;
  let workerProposal = null;
  let workersNeeded = 0;
  let selectedCount = 0;

  if (jobId && jobData?.data) {
    jobDetails = jobData.data;
    workersNeeded = jobDetails.workers_needed || 0;
    selectedCount = jobDetails.workers_selected || 0;

    // Find this worker's proposal
    if (proposalsData?.proposals) {
      workerProposal = proposalsData.proposals.find(
        (p) => p.worker.id === workerId
      );
    }
  }

  const applicantData = {
    id: workerId,
    name: workerData?.name || translate("jobs.notAvailable"),
    gender: workerData?.gender || translate("jobs.notSpecified"),
    age: workerData?.age || translate("jobs.notAvailable"),
    avatar: { uri: workerData.profile_picture },
    email: workerData?.email || translate("jobs.notAvailable"),
    mobile: workerData?.mobile || translate("jobs.notAvailable"),
    rating: workerData?.avg_rating || 0,
    reviews: workerData?.rating_count || 0,
    bio: workerData?.bio || translate("jobs.noBioAvailable"),
    completedJobs: workerData?.completed_jobs_count || 0,
    totalHours: 0, // Not provided in API response
    position: workerData?.position || translate("jobs.notSpecified"),
    city: workerData?.city || translate("jobs.notSpecified"),
    skills: workerData?.skils || [],
    criminalRecordVerified: workerData?.criminal_record === "verified",
    reviewHistory: (workerData?.reviews || []).map((review, index) => ({
      id: index.toString(),
      jobTitle: review.job_title || translate("jobs.job"),
      company: review.review_title || translate("jobs.company"),
      date: review.human_readable_date || translate("jobs.dateUnknown"),
      rating: review.rating || 0,
      amount: review.job_cost || 0,
      review: review.review || translate("jobs.noReviewText"),
    })),
  };

  const renderStars = (rating, size = 12, color = "#FFD700") => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <MaterialIcons
            key={star}
            name="star"
            size={size}
            color={star <= Math.floor(rating) ? color : "#D3D3D3"}
            style={{ marginRight: 2 }}
          />
        ))}
      </View>
    );
  };

  return (
    <ScreenWrapper backgroundColor={colors.bg}>
      <CommonHeader
        title={translate("profile.title")}
        onBackPress={() => navigation.goBack()}
        backgroundColor={colors.tertiary}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              try {
                const refetchPromises = [refetch()];
                if (jobId) {
                  refetchPromises.push(refetchJob(), refetchProposals());
                }
                await Promise.all(refetchPromises);
              } finally {
                setRefreshing(false);
              }
            }}
            tintColor={colors.tertiary}
            colors={[colors.tertiary]}
          />
        }
      >
        <View style={styles.profileHeaderContainer}>
          <View style={styles.imageContainer}>
            <Image source={applicantData.avatar} style={styles.profileImage} />
          </View>
          <View style={styles.profileBanner}>
            <Text style={styles.profileName}>
              {applicantData.name}
              <Text style={styles.profileMeta}>
                {applicantData.gender ? `, ${applicantData.gender}` : ""}
                {`, ${translate("jobs.years", { age: applicantData.age })}`}
              </Text>
            </Text>
            <View style={styles.ratingRow}>
              {renderStars(applicantData.rating, 14)}
              <Text style={styles.ratingText}>
                {applicantData.rating}
                <Text style={styles.reviewCount}>
                  ({applicantData.reviews} {translate("profile.reviews")})
                </Text>
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bodyContainer}>
          {jobId && workerProposal && (
            <View style={styles.section}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginLeft: "auto",
                }}
              >
                <SelectDeselectButton
                  status={workerProposal.status}
                  workersNeeded={workersNeeded}
                  selectedCount={selectedCount}
                  proposalId={workerProposal.id}
                  jobId={jobId}
                  workerId={workerId}
                  workerName={applicantData.name}
                  avatar={applicantData.avatar}
                  onConfirm={handleSelectDeselect}
                  isLoading={false}
                  buttonStyle={{
                    width: 100,
                    height: 35,
                    borderRadius: 12,
                  }}
                />
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bio</Text>
            <Text style={styles.bioText}>{applicantData.bio}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="briefcase-check-outline"
                size={20}
                color={colors.tertiary}
                style={styles.iconWidth}
              />
              <Text style={styles.infoText}>
                Completed Jobs: {applicantData.completedJobs}
                {/* , 
                (Total{" "}
                {applicantData.totalHours} hrs worked) */}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <FontAwesome5
                name="user"
                size={18}
                color={colors.tertiary}
                style={styles.iconWidth}
              />
              <Text style={styles.infoText}>
                Position: {applicantData.position}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons
                name="location-outline"
                size={22}
                color={colors.tertiary}
                style={styles.iconWidth}
              />
              <Text style={styles.infoText}>City: {applicantData.city}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
              {applicantData.skills.length > 0 ? (
                applicantData.skills.map((skill, index) => (
                  <View key={index} style={styles.skillChip}>
                    <MaterialCommunityIcons
                      name="star-four-points"
                      size={12}
                      color={colors.tertiary}
                    />
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.bioText}>No skills listed</Text>
              )}
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Criminal Record Verified</Text>
            <View style={styles.verifiedRow}>
              {applicantData.criminalRecordVerified ? (
                <>
                  <MaterialIcons
                    name="check-circle"
                    size={24}
                    color="#00C853"
                  />
                  <Text style={[styles.verifiedText, { color: "#00C853" }]}>
                    YES Verified
                  </Text>
                </>
              ) : (
                <>
                  <MaterialIcons name="cancel" size={24} color="#FF5252" />
                  <Text style={[styles.verifiedText, { color: "#FF5252" }]}>
                    Not Verified
                  </Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Review History</Text>
            {applicantData.reviewHistory.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <Text style={styles.reviewTitle}>“{review.company}”</Text>
                <Text style={styles.reviewCompany}>{review.jobTitle}</Text>
                <View style={styles.reviewMetaRow}>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                  <Text style={styles.dot}> • </Text>
                  {renderStars(review.rating, 12)}
                  <Text style={styles.reviewRatingNumber}>
                    {review.rating.toFixed(1)}
                  </Text>
                </View>
                <Text style={styles.reviewText}>"{review.review}"</Text>
                <Text style={styles.reviewCost}>${review.amount}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.tertiary,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#E8F5F0",
  },
  scrollContent: {
    paddingBottom: 24,
  },
  profileHeaderContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  imageContainer: {
    zIndex: 1,
    elevation: 5,
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  profileImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    margin: 5,
    borderColor: "#fff",
  },
  profileBanner: {
    backgroundColor: "#135B46", // Dark green
    width: "100%",
    paddingTop: 15,
    paddingBottom: 15,
    alignItems: "center",
  },
  profileName: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: "#FFFFFF",
    marginTop: 5,
  },
  profileMeta: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: "#E0E0E0",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  starsContainer: {
    flexDirection: "row",
    marginRight: 6,
  },
  ratingText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: "#FFD700",
  },
  reviewCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: "#E0E0E0",
  },
  bodyContainer: {
    paddingHorizontal: 16,
  },
  selectionButtonContainer: {
    flexDirection: "row",
    gap: 10,
  },
  selectButtonContainer: {
    alignItems: "flex-end",
    marginTop: 10,
    marginBottom: 10,
  },
  selectButton: {
    backgroundColor: "#27AE60",
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  selectButtonText: {
    color: "#fff",
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: "#000",
    marginBottom: 8,
  },
  bioText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconWidth: {
    width: 30,
    textAlign: "center",
    marginRight: 10,
  },
  infoText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: "#444",
    flex: 1,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1F2EB",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: "#135B46",
    marginLeft: 6,
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  verifiedText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    marginLeft: 8,
  },
  reviewCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  reviewTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: "#27AE60",
    marginBottom: 4,
  },
  reviewCompany: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  reviewMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewDate: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: "#27AE60",
  },
  dot: {
    color: "#999",
    marginHorizontal: 4,
  },
  reviewRatingNumber: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  reviewText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
    fontStyle: "italic",
  },
  reviewCost: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: "#888",
  },
});
