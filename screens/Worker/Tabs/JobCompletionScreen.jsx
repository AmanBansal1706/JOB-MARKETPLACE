import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../../theme/worker/colors";
import { useSubmitJobReview } from "../../../services/WorkerJobServices";
import { useTranslation } from "../../../hooks/useTranslation";

export default function JobCompletionScreen() {
  const navigation = useNavigation();
  const { translate } = useTranslation();
  const params = useRoute().params || {};
  const [selectedRating, setSelectedRating] = useState(5);
  const [review, setReview] = useState("");

  const { mutate: submitReview, isPending: isSubmitting } =
    useSubmitJobReview();

  const ratingOptions = [
    { value: 1, label: translate("workerJobCompletion.veryUnsatisfactory") },
    { value: 2, label: translate("workerJobCompletion.unsatisfactory") },
    { value: 3, label: translate("workerJobCompletion.acceptable") },
    { value: 4, label: translate("workerJobCompletion.good") },
    { value: 5, label: translate("workerJobCompletion.excellent") },
  ];

  const handleSubmit = () => {
    if (!params.jobId) {
      Alert.alert(
        translate("workerCommon.error"),
        translate("workerJobCompletion.jobIdNotFound"),
      );
      return;
    }

    if (!review.trim()) {
      Alert.alert(
        translate("workerCommon.validationError"),
        translate("workerJobCompletion.provideReview"),
      );
      return;
    }

    submitReview(
      {
        job_id: params.jobId,
        rating: selectedRating,
        review: review.trim(),
      },
      {
        onSuccess: (data) => {
          Alert.alert(
            translate("workerCommon.success"),
            translate("workerJobCompletion.reviewSubmitted"),
          );
          navigation.reset({
            index: 0,
            routes: [{ name: "WorkerTabs" }],
          });
        },
        onError: (error) => {
          Alert.alert(
            translate("workerCommon.error"),
            error.message ||
              translate("workerJobCompletion.failedSubmitReview"),
          );
        },
      },
    );
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
            {translate("workerJobCompletion.completeJob")}
          </Text>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Job Title Banner */}
          <View style={styles.titleBanner}>
            <Text style={styles.jobTitle}>
              {params.title || "Kitchen Helper"}
            </Text>
          </View>

          {/* Rating Selector */}
          <Text style={styles.sectionTitle}>
            {translate("workerJobCompletion.ratingSelector")}
          </Text>
          <View style={styles.ratingList}>
            {ratingOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.ratingRow}
                onPress={() => setSelectedRating(option.value)}
                activeOpacity={0.7}
              >
                {/* Stars */}
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FontAwesome
                      key={star}
                      name={star <= option.value ? "star" : "star-o"}
                      size={18}
                      color={colors.ui.star}
                      style={{ marginRight: 2 }}
                    />
                  ))}
                </View>

                {/* Label */}
                <Text
                  style={[
                    styles.ratingLabel,
                    selectedRating === option.value && styles.selectedLabel,
                  ]}
                >
                  {option.label}
                </Text>

                {/* Radio Button */}
                <View
                  style={[
                    styles.radioOuter,
                    selectedRating === option.value &&
                      styles.radioOuterSelected,
                  ]}
                >
                  {selectedRating === option.value && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Review Input */}
          <Text style={styles.sectionTitle}>
            {translate("workerJobCompletion.review")}
          </Text>
          <TextInput
            style={styles.reviewInput}
            multiline
            placeholder={translate("workerJobCompletion.typeReview")}
            placeholderTextColor={colors.text.secondary}
            value={review}
            onChangeText={setReview}
            textAlignVertical="top"
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (isSubmitting || !review.trim()) && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={isSubmitting || !review.trim()}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>
                {translate("workerJobCompletion.submitReviews")}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.ui.screenBackground, // Light Pink Background
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
    fontSize: 22,
    fontFamily: "Poppins_600SemiBold",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  titleBanner: {
    backgroundColor: colors.ui.bannerBackground, // Slightly darker pink for banner
    borderRadius: 15,
    paddingVertical: 25,
    alignItems: "center",
    marginBottom: 30,
  },
  jobTitle: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: colors.auth.darkRed,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: colors.black,
    marginBottom: 15,
  },
  ratingList: {
    marginBottom: 25,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  starsContainer: {
    flexDirection: "row",
    width: 100,
  },
  ratingLabel: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: colors.primary.pink, // Pink text for labels
  },
  selectedLabel: {
    color: colors.ui.selectedRatingText, // Gold/Orange for selected? Or stick to pink/red? Design shows pink/red text.
    // Actually design shows "Excellent" in gold/orange when selected in one variant, but pink in others.
    // Let's stick to a distinct color or keep it pink.
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary.pink,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: colors.auth.darkRed,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.auth.darkRed,
  },
  reviewInput: {
    backgroundColor: colors.ui.mintInputBackground, // Minty/Light Gray background
    borderWidth: 1,
    borderColor: colors.ui.lightBorder,
    borderRadius: 15,
    padding: 15,
    height: 150,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.primary,
    marginBottom: 30,
  },
  submitButton: {
    backgroundColor: colors.primary.pink,
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: colors.primary.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: colors.ui.buttonGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: colors.white,
    letterSpacing: 1,
  },
});
