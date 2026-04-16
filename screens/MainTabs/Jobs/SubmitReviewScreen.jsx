import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts, fontSizes } from "../../../theme";
import { CommonHeader, ScreenWrapper } from "../../../components/common";
import ConfirmCashPaymentModal from "../../../components/ConfirmCashPaymentModal";
import { useTranslation } from "../../../hooks/useTranslation";
import { useSubmitWorkerReview } from "../../../services/JobServices";

const { width } = Dimensions.get("window");

// --- Inline Components ---

function JobInfoCard({ jobTitle, assignedCount, completedCount, totalCount }) {
  const { translate } = useTranslation();
  return (
    <View style={styles.jobInfoCard}>
      <Text style={styles.jobInfoTitle} maxFontSizeMultiplier={1.2}>
        {jobTitle}
      </Text>
      <Text style={styles.jobInfoSub} maxFontSizeMultiplier={1.2}>
        {translate("jobs.workersAssignedCount", { count: assignedCount })}
      </Text>
      <Text style={styles.jobInfoProgress} maxFontSizeMultiplier={1.2}>
        {translate("jobs.progress", {
          completed: completedCount,
          total: totalCount,
        })}
      </Text>
    </View>
  );
}

function ReviewCard({
  workerName,
  rating,
  review,
  onEdit,
  onDelete,
  translate,
}) {
  const starElems = useMemo(() => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i < rating ? "star" : "star-outline"}
          size={14}
          color={i < rating ? "#F7B500" : "#D6D6D6"}
          style={{ marginRight: 2 }}
        />,
      );
    }
    return stars;
  }, [rating]);

  const ratingLabels = {
    1: translate("jobs.rating.veryUnsatisfactory"),
    2: translate("jobs.rating.unsatisfactory"),
    3: translate("jobs.rating.acceptable"),
    4: translate("jobs.rating.good"),
    5: translate("jobs.rating.excellent"),
  };

  return (
    <View style={styles.reviewCardContainer}>
      <View style={styles.reviewCardHeader}>
        <Text style={styles.reviewCardName} maxFontSizeMultiplier={1.2}>
          {workerName}
        </Text>
        <View style={styles.reviewCardActions}>
          <TouchableOpacity
            style={styles.reviewCardButton}
            onPress={onEdit}
            hitSlop={8}
          >
            <Ionicons name="pencil" size={20} color={colors.tertiary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.reviewCardButton, styles.reviewCardButtonDelete]}
            onPress={onDelete}
            hitSlop={8}
          >
            <Ionicons name="close" size={20} color="#FF4D4D" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.reviewCardRating}>
        <View style={styles.reviewCardStars}>{starElems}</View>
        <Text style={styles.reviewCardRatingText} maxFontSizeMultiplier={1.2}>
          {ratingLabels[rating]}
        </Text>
      </View>

      {review && (
        <Text style={styles.reviewCardText} maxFontSizeMultiplier={1.2}>
          {review}
        </Text>
      )}
    </View>
  );
}

function RatingRow({ stars, text, selected, onPress }) {
  const starElems = useMemo(() => {
    const starsArr = [];
    for (let i = 0; i < 5; i++) {
      starsArr.push(
        <Ionicons
          key={i}
          name={i < stars ? "star" : "star-outline"}
          size={18}
          color={i < stars ? "#F7B500" : "#D6D6D6"}
          style={{ marginRight: 2 }}
        />,
      );
    }
    return starsArr;
  }, [stars]);

  return (
    <TouchableOpacity
      style={styles.ratingRow}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.starsRow}>{starElems}</View>
      <Text style={styles.ratingText} maxFontSizeMultiplier={1.2}>
        {text}
      </Text>
      <View style={[styles.radioOuter, selected ? styles.radioSelected : null]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
    </TouchableOpacity>
  );
}

// --- Main Screen ---

export default function SubmitReviewScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { translate } = useTranslation();

  const jobId = route.params?.jobId;
  const jobTitle = route.params?.jobTitle || translate("jobs.postJob");
  const assignedWorkers = route.params?.assignedWorkers || [];
  const isReviewMandatoryFlow = route.params?.reviewMandatory ?? true;
  const paymentMode = route.params?.paymentMode || ""; // Received from UnifiedJobDetailScreen

  // State Management
  const [reviews, setReviews] = useState({}); // { workerId: { rating, review, completed } }
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState(
    assignedWorkers.length > 0 ? assignedWorkers[0].id : null,
  );
  const [currentRating, setCurrentRating] = useState(null); // Form rating (null when no selection)
  const [currentReview, setCurrentReview] = useState(""); // Form review text
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canNavigateAway, setCanNavigateAway] = useState(false);
  const [showCashPaymentConfirm, setShowCashPaymentConfirm] = useState(false); // Shown after reviews submitted if payment is cash

  // Review submission mutation
  const { mutate: submitReviewMutate } = useSubmitWorkerReview();

  // Get worker list
  const workers = useMemo(() => {
    return assignedWorkers.map((w) => ({ id: w.id, name: w.name }));
  }, [assignedWorkers]);

  // Get current selected worker
  const selectedWorker = useMemo(() => {
    return workers.find((w) => w.id === selectedWorkerId);
  }, [selectedWorkerId, workers]);

  // Initialize reviews object on mount
  useEffect(() => {
    const initialReviews = {};
    workers.forEach((w) => {
      initialReviews[w.id] = {
        rating: null,
        review: "",
        completed: false,
      };
    });
    setReviews(initialReviews);
  }, [workers.length]);

  // Load current worker's form data when selected worker changes
  useEffect(() => {
    if (selectedWorkerId && reviews[selectedWorkerId]) {
      const workerReview = reviews[selectedWorkerId];
      setCurrentRating(workerReview.rating);
      setCurrentReview(workerReview.review);
    }
  }, [selectedWorkerId]);

  // Back button handler
  const handleBackPress = useCallback(() => {
    if (isReviewMandatoryFlow && !canNavigateAway) {
      Alert.alert(
        translate("jobs.postReview"),
        translate("jobs.reviewsMandatoryMessage"),
        [{ text: translate("common.ok") }],
      );
      return;
    }
    navigation.goBack();
  }, [navigation, isReviewMandatoryFlow, canNavigateAway, translate]);

  // Prevent back navigation in mandatory flow
  useEffect(() => {
    if (!isReviewMandatoryFlow || canNavigateAway) return;

    const unsubscribe = navigation.addListener("beforeRemove", (event) => {
      if (event.data?.action?.type === "RESET") return;
      event.preventDefault();
      Alert.alert(
        translate("jobs.postReview"),
        translate("jobs.reviewsMandatoryMessage"),
        [{ text: translate("common.ok") }],
      );
    });

    return unsubscribe;
  }, [isReviewMandatoryFlow, canNavigateAway, navigation, translate]);

  // Handle worker selection
  const handleWorkerSelect = useCallback((worker) => {
    setSelectedWorkerId(worker.id);
    setDropdownOpen(false);
    // Reset form when switching worker
    setCurrentRating(null);
    setCurrentReview("");
  }, []);

  // Save current review
  const handleSaveReview = useCallback(() => {
    if (!selectedWorkerId) {
      Alert.alert(
        translate("common.error"),
        translate("jobs.selectWorkerError"),
      );
      return;
    }

    // Rating is compulsory
    if (currentRating === null) {
      Alert.alert(
        translate("common.error"),
        "Please select a rating before saving.",
      );
      return;
    }

    // Update reviews state
    setReviews((prev) => ({
      ...prev,
      [selectedWorkerId]: {
        rating: currentRating,
        review: currentReview.trim(),
        completed: true,
      },
    }));

    // Clear form
    setCurrentRating(null);
    setCurrentReview("");

    // Auto-select next incomplete worker if exists
    const nextWorker = workers.find(
      (w) =>
        w.id !== selectedWorkerId &&
        (!reviews[w.id] || !reviews[w.id].completed),
    );

    if (nextWorker) {
      setSelectedWorkerId(nextWorker.id);
    } else {
      Alert.alert(
        translate("jobs.allReviewsCompleted"),
        translate("jobs.canSubmitNow"),
      );
    }
  }, [
    selectedWorkerId,
    currentRating,
    currentReview,
    reviews,
    workers,
    translate,
  ]);

  // Edit a completed review
  const handleEditCard = useCallback((workerId) => {
    setSelectedWorkerId(workerId);
    setCurrentRating(null);
    setCurrentReview("");
  }, []);

  // Delete a completed review
  const handleDeleteCard = useCallback(
    (workerId) => {
      const worker = workers.find((w) => w.id === workerId);
      Alert.alert(
        translate("jobs.deleteReview"),
        translate("jobs.deleteReviewConfirm", { name: worker.name }),
        [
          {
            text: translate("common.delete"),
            onPress: () => {
              setReviews((prev) => ({
                ...prev,
                [workerId]: {
                  rating: null,
                  review: "",
                  completed: false,
                },
              }));
            },
            style: "destructive",
          },
          {
            text: translate("common.cancel"),
            onPress: () => {},
          },
        ],
      );
    },
    [workers, translate],
  );

  // Submit all reviews to API
  const submitAllReviews = useCallback(
    async (finalReviews) => {
      setIsSubmitting(true);

      try {
        for (const worker of workers) {
          const reviewData = finalReviews[worker.id];
          if (!reviewData?.completed) continue;

          await new Promise((resolve, reject) => {
            submitReviewMutate(
              {
                jobId: jobId,
                reviewData: {
                  worker_id: worker.id,
                  review_title: reviewData.review
                    ? reviewData.review.split("\n")[0].substring(0, 50)
                    : "Review",
                  review_description: reviewData.review,
                  rating: reviewData.rating,
                },
              },
              {
                onSuccess: () => resolve(),
                onError: (error) => {
                  console.error(
                    `Failed to submit review for ${worker.name}:`,
                    error,
                  );
                  resolve(); // Continue with next worker
                },
              },
            );
          });
        }

        setIsSubmitting(false);
        setCanNavigateAway(true);

        // If payment mode is cash, show the cash payment confirmation modal before navigating away
        if (paymentMode?.toLowerCase() === "cash") {
          setShowCashPaymentConfirm(true);
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: "MainTabs" }],
          });
        }
      } catch (error) {
        setIsSubmitting(false);
        Alert.alert(
          translate("common.error"),
          error.message || translate("jobs.failedToSubmitReviews"),
        );
      }
    },
    [workers, jobId, submitReviewMutate, navigation, paymentMode, translate],
  );

  // Handle submit all reviews
  const handleSubmitReviews = useCallback(() => {
    // First, check if all workers have ratings
    const allCompleted = workers.every((w) => reviews[w.id]?.completed);

    if (!allCompleted) {
      Alert.alert(
        translate("common.error"),
        translate("jobs.completeAllReviewsError"),
        [{ text: translate("common.ok") }],
      );
      return;
    }

    const completedCount = workers.filter(
      (w) => reviews[w.id]?.completed,
    ).length;

    const confirmMessage = translate("jobs.submitReviewsConfirm", {
      count: completedCount,
    });

    Alert.alert(translate("jobs.postReview"), confirmMessage, [
      {
        text: translate("common.cancel"),
        onPress: () => {},
      },
      {
        text: translate("jobs.postReview"),
        onPress: () => submitAllReviews(reviews),
      },
    ]);
  }, [workers, reviews, translate, submitAllReviews]);

  const completedCount = useMemo(() => {
    return Object.values(reviews).filter((r) => r.completed).length;
  }, [reviews]);

  return (
    <ScreenWrapper backgroundColor={colors.bbg6}>
      <CommonHeader
        title={translate("profile.reviews")}
        onBackPress={handleBackPress}
        backgroundColor={colors.tertiary}
        disabled={true}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Job Info Card */}
          <JobInfoCard
            jobTitle={jobTitle}
            assignedCount={workers.length}
            completedCount={completedCount}
            totalCount={workers.length}
          />

          {/* Completed Reviews Section */}
          {completedCount > 0 && (
            <View style={styles.section}>
              <Text style={styles.label} maxFontSizeMultiplier={1.2}>
                {translate("jobs.submittedReviews")}
              </Text>
              {workers.map(
                (worker) =>
                  reviews[worker.id]?.completed && (
                    <ReviewCard
                      key={worker.id}
                      workerName={worker.name}
                      rating={reviews[worker.id].rating}
                      review={reviews[worker.id].review}
                      onEdit={() => handleEditCard(worker.id)}
                      onDelete={() => handleDeleteCard(worker.id)}
                      translate={translate}
                    />
                  ),
              )}
            </View>
          )}

          {/* Worker Selection Section */}
          <View style={styles.section}>
            <Text style={styles.label} maxFontSizeMultiplier={1.2}>
              {translate("jobs.selectWorkerToReview")}
            </Text>

            <View style={styles.dropdownWrapper}>
              <Pressable
                style={styles.dropdown}
                onPress={() => setDropdownOpen((v) => !v)}
                hitSlop={8}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !selectedWorker && { color: colors.text5 },
                  ]}
                  maxFontSizeMultiplier={1.2}
                >
                  {selectedWorker?.name ||
                    translate("jobs.selectWorkerPlaceholder")}
                </Text>
                <Ionicons
                  name={dropdownOpen ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#666"
                />
              </Pressable>

              {dropdownOpen && (
                <View style={styles.dropdownList}>
                  {workers.map((worker) => (
                    <TouchableOpacity
                      key={worker.id}
                      style={styles.dropdownItem}
                      onPress={() => handleWorkerSelect(worker)}
                    >
                      <View style={styles.dropdownItemContent}>
                        <Text
                          style={[
                            styles.dropdownItemText,
                            worker.id === selectedWorkerId &&
                              styles.dropdownItemTextSelected,
                          ]}
                          maxFontSizeMultiplier={1.2}
                        >
                          {worker.name}
                        </Text>
                        {reviews[worker.id]?.completed && (
                          <Text style={styles.completedBadge}>✓</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Rating & Review Section */}
          {selectedWorker && (
            <View style={styles.section}>
              <Text style={styles.label} maxFontSizeMultiplier={1.2}>
                {translate("jobs.ratingSelector")}
              </Text>

              <View style={styles.ratingList}>
                {[1, 2, 3, 4, 5].map((val) => {
                  const labels = [
                    "",
                    translate("jobs.rating.veryUnsatisfactory"),
                    translate("jobs.rating.unsatisfactory"),
                    translate("jobs.rating.acceptable"),
                    translate("jobs.rating.good"),
                    translate("jobs.rating.excellent"),
                  ];
                  return (
                    <RatingRow
                      key={val}
                      stars={val}
                      text={labels[val]}
                      selected={currentRating === val}
                      onPress={() => setCurrentRating(val)}
                    />
                  );
                })}
              </View>

              <Text
                style={[styles.label, { marginTop: 18 }]}
                maxFontSizeMultiplier={1.2}
              >
                {translate("jobs.reviewLabel")}
              </Text>

              <TextInput
                style={styles.reviewBox}
                multiline
                value={currentReview}
                onChangeText={setCurrentReview}
                placeholder={translate("jobs.enterReviewPlaceholder")}
                placeholderTextColor={colors.text5}
                maxFontSizeMultiplier={1.2}
              />

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  currentRating === null && styles.saveButtonDisabled,
                ]}
                activeOpacity={0.85}
                onPress={handleSaveReview}
                disabled={currentRating === null}
              >
                <Text style={styles.saveButtonText} maxFontSizeMultiplier={1.2}>
                  {translate("jobs.saveReview")}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (completedCount === 0 || isSubmitting) &&
                styles.submitButtonDisabled,
            ]}
            activeOpacity={0.85}
            onPress={handleSubmitReviews}
            disabled={isSubmitting || completedCount === 0}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitText} maxFontSizeMultiplier={1.2}>
                {translate("jobs.postReview")} ({completedCount}/
                {workers.length})
              </Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      <ConfirmCashPaymentModal
        visible={showCashPaymentConfirm}
        jobTitle={jobTitle}
        onConfirm={() => {
          setShowCashPaymentConfirm(false);
          navigation.reset({
            index: 0,
            routes: [{ name: "MainTabs" }],
          });
        }}
        onCancel={() => {
          setShowCashPaymentConfirm(false);
          navigation.reset({
            index: 0,
            routes: [{ name: "MainTabs" }],
          });
        }}
        onClose={() => {
          setShowCashPaymentConfirm(false);
          navigation.reset({
            index: 0,
            routes: [{ name: "MainTabs" }],
          });
        }}
        jobId={jobId}
        selectedWorkerId={assignedWorkers[0]?.id}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  // Job Info Card
  jobInfoCard: {
    backgroundColor: colors.bbg5,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 22,
    width: width - 40,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  jobInfoTitle: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.bold,
    color: colors.primary,
    marginBottom: 6,
    textAlign: "center",
  },
  jobInfoSub: {
    fontSize: fontSizes.xs,
    color: colors.primary,
    fontFamily: fonts.regular,
    marginBottom: 4,
  },
  jobInfoProgress: {
    fontSize: fontSizes.xs,
    color: colors.tertiary,
    fontFamily: fonts.bold,
  },
  label: {
    fontSize: fontSizes.md,
    fontFamily: fonts.bold,
    color: colors.textdark,
    marginBottom: 10,
  },
  // Dropdown
  dropdownWrapper: {
    zIndex: 10,
  },
  dropdown: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    color: colors.textdark,
    fontSize: fontSizes.sm,
    fontFamily: fonts.regular,
    flex: 1,
  },
  dropdownList: {
    position: "absolute",
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    maxHeight: 250,
    zIndex: 100,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownItemText: {
    color: colors.text1,
    fontSize: fontSizes.sm,
    fontFamily: fonts.regular,
    flex: 1,
  },
  dropdownItemTextSelected: {
    color: colors.tertiary,
    fontFamily: fonts.bold,
  },
  completedBadge: {
    color: "#4CAF50",
    fontSize: fontSizes.md,
    fontFamily: fonts.bold,
  },
  // Rating
  ratingList: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderColor: "#F0F0F0",
  },
  starsRow: {
    width: 110,
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    flex: 1,
    color: colors.textdark,
    fontSize: fontSizes.sm,
    fontFamily: fonts.regular,
    marginLeft: 6,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.tertiary,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    backgroundColor: colors.tertiary,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  // Review Box
  reviewBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 14,
    minHeight: 120,
    textAlignVertical: "top",
    color: colors.textdark,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
  },
  saveButton: {
    backgroundColor: colors.tertiary,
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: colors.tertiary,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: "#CCCCCC",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: "#fff",
    fontFamily: fonts.bold,
    fontSize: fontSizes.sm,
    letterSpacing: 0.5,
  },
  // Submit Button
  submitButton: {
    backgroundColor: colors.tertiary,
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: colors.tertiary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: "#CCCCCC",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitText: {
    color: "#fff",
    fontFamily: fonts.bold,
    fontSize: fontSizes.md,
    letterSpacing: 0.5,
  },
  // Review Card
  reviewCardContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: colors.tertiary,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  reviewCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewCardName: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.bold,
    color: colors.textdark,
    flex: 1,
  },
  reviewCardActions: {
    flexDirection: "row",
    gap: 0,
  },
  reviewCardButton: {
    width: 35,
    height: 35,
    borderRadius: 50,
    backgroundColor: colors.bbg6,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewCardButtonDelete: {
    backgroundColor: "#FFF0F0",
    marginLeft: 6,
    borderColor: "#FFDADA",
  },
  reviewCardRating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  reviewCardStars: {
    flexDirection: "row",
  },
  reviewCardRatingText: {
    fontSize: fontSizes.xs,
    color: colors.tertiary,
    fontFamily: fonts.bold,
  },
  reviewCardText: {
    fontSize: fontSizes.sm,
    color: colors.text1,
    fontFamily: fonts.regular,
    lineHeight: 20,
  },
});
