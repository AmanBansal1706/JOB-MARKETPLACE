import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useCallback } from "react";
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import JobDetailsScreen from "./JobDetailsScreen"; // for suggested jobs
import AssignedJobDetailsScreen from "./AssignedJobDetailsScreen"; // for assigned jobs
import CompletedJobDetailsScreen from "./CompletedJobDetailsScreen"; // for completed jobs
import DisputedJobDetailsScreen from "./DisputedJobDetailsScreen"; // for disputed jobs
import { useFetchWorkerJobById } from "../../../services/WorkerJobServices";
import { useFetchWorkerProfile } from "../../../services/WorkerProfileServices";
import colors from "../../../theme/worker/colors";
import { useSelector } from "react-redux";
import { formatExperienceLevel } from "../../../utils/experienceLevel";
import {
  formatDisplayDate,
  formatTimeString,
  formatTimeFromDate,
} from "../../../utils/dateFormatting";
import { useTranslation } from "../../../hooks/useTranslation";

const UnifiedJobDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { translate } = useTranslation();
  const user = useSelector((state) => state.Auth.user);
  const myUserId = user?.id;

  const { jobId } = route.params || {};

  // Fetch job details using the hook
  const {
    isPending: isJobPending,
    error: jobError,
    data: apiResponse,
    isError: isJobError,
    refetch,
    isFetching,
  } = useFetchWorkerJobById(jobId, route.params?.initialStatus);

  // Refetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  // Fetch worker profile to check verification status
  const {
    data: workerProfile,
    isPending: isProfilePending,
    isError: isProfileError,
  } = useFetchWorkerProfile();

  const isPending = isJobPending || isProfilePending;
  const isError = isJobError || isProfileError;

  // Helper function to format time from 24h to 12h format
  const formatTime = (timeString) => {
    return formatTimeString(timeString);
  };

  // Helper function to format date
  const formatDate = formatDisplayDate;

  // Helper function to format ISO date-time to 12h time
  const formatTimeFromISO = (isoString) => {
    return formatTimeFromDate(isoString);
  };

  // Calculate total hours per day
  const calculateHours = (joiningTime, finishTime, breakTime) => {
    if (!joiningTime || !finishTime) return "N/A";

    const [startHour, startMin] = joiningTime.split(":").map(Number);
    const [endHour, endMin] = finishTime.split(":").map(Number);

    let totalMinutes = endHour * 60 + endMin - (startHour * 60 + startMin);

    // Handle overnight shifts
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60;
    }

    // Subtract break time
    if (breakTime) {
      totalMinutes -= parseInt(breakTime);
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return minutes > 0 ? `${hours}.${minutes}hrs` : `${hours}hrs`;
  };

  // Comprehensive transformer function to handle all job statuses
  const transformJobData = (rawData) => {
    if (!rawData) return null;

    // Extract data from API response structure
    const jobData = rawData.data || rawData;

    // ============================================
    // DESTRUCTURE ALL API FIELDS EXPLICITLY
    // ============================================

    // Core job identifiers
    const {
      id = null,
      position = null,
      experience_level = null,
      job_title = null,
      job_status = "Suggested",
      tab_job_status = "Suggested",
      description = null,
      business_name = null,
      business_id = null,
      business_profile_picture = `https://ui-avatars.com/api/?name=${business_name ? business_name.charAt(0) : "B"}&background=random`,
      business_avg_ratings = 0,
      job_cost_for_worker = 0,
      job_cost_for_worker_after_worker_commission = 0,
      earned_amount = 0,
      earned_amount_after_worker_commission = 0,
      pay_rate = 0,
      payment_mode = null,
      start_date = null,
      end_date = null,
      posted_at_human = null,
      break_time = null,
      status_code = null,
      status = null,
      // Location object
      location = {},
      // Responsibilities array
      responsibilities = [],
      // Slots array
      slots = [],
      // Flags object
      flags = {},
      // Worker object
      worker = {},
      // Optional fields that may come from API later
      distance_km = null,
      selected_worker: apiSelectedWorker = null,
      reviews: apiReviews = null,
    } = jobData;

    // Destructure nested location object
    const {
      lat = null,
      lng = null,
      address: locationAddressRaw = null,
      street = null,
      interior_number = null,
      colonia = null,
      postal_code = null,
      city = null,
      state = null,
    } = location || {};

    // Destructure nested flags object
    const {
      can_apply = false,
      can_apply_reason = null,
      show_raise_dispute_button = false,
      show_raise_dispute_button_reason = null,
      show_rating_button = false,
      show_rating_button_reason = null,
      show_cash_received_confirmation_popup = false,
      show_cash_received_confirmation_popup_reason = null,
      enable_check_in_button = false,
      enable_check_in_button_reason = null,
      enable_check_out_button = false,
      enable_check_out_button_reason = null,
    } = flags || {};

    // Destructure nested worker object
    const {
      proposal_id = null,
      proposal_status = null,
      assigned_slot_id = null,
    } = worker || {};

    // ============================================
    // TRANSFORM DATA
    // ============================================

    // Transform location to address string
    const location_address = locationAddressRaw || "N/A";

    // Transform location details object
    const location_details = {
      lat,
      lng,
      address: locationAddressRaw,
      street,
      interior_number,
      colonia,
      postal_code,
      city,
      state,
    };

    // Transform responsibilities array to comma-separated string
    const responsibilities_text =
      responsibilities && responsibilities.length > 0
        ? responsibilities.map((r) => r.name).join(", ")
        : "N/A";

    // Transform slots with formatted dates and times
    const transformedSlots = (slots || []).map((slot) => {
      const {
        id: slotId = null,
        start_date: slotStartDate = null,
        end_date: slotEndDate = null,
        joining_time = null,
        finish_time = null,
        break_time: slotBreakTime = null,
        filled_count = 0,
        is_filled = false,
        is_applied_for_proposal = false,
        is_matching = false,
        assigned_worker = null,
        labour_cost = 0,
        labour_cost_after_commission = 0,
        is_overlapping = false,
        is_disputed = false,
        proposal_id: slotProposalId = null,
        matching_with = null,
        worker_shifts = [],
      } = slot || {};

      // "assigned_worker": {
      //               "worker_id": 21,
      //               "worker_name": "Seed Worker3"
      //           },
      // object or array like above
      // if object take the assigned worker directly
      // if array then first see if any of the one matches with me (myUserId) take that else take first one if exists else null

      // we need to only take first if array else object

      // Normalize assigned_worker: can be object or array. If array, prefer the entry
      // that matches myUserId (if any), otherwise take the first one.
      const resolveAssignedWorker = (aw) => {
        if (!aw) return null;
        if (Array.isArray(aw)) {
          if (aw.length === 0) return null;
          const match = aw.find((w) => (w.worker_id ?? w.id) === myUserId);
          const chosen = match || aw[0];
          return {
            id: chosen.worker_id ?? null,
            name: chosen.worker_name ?? null,
            isme: (chosen.worker_id ?? null) === myUserId,
          };
        }

        // aw is object
        return {
          id: aw.worker_id ?? null,
          name: aw.worker_name ?? null,
          isme: (aw.worker_id ?? null) === myUserId,
        };
      };

      const assignedWorker = resolveAssignedWorker(assigned_worker);

      // Transform worker_shifts if present
      const transformedWorkerShifts = (worker_shifts || []).map((shift) => ({
        date: formatDate(shift.date),
        checkInTime: formatTimeFromISO(shift.check_in_time),
        checkOutTime: formatTimeFromISO(shift.check_out_time),
        breakTime: shift.break_time ? `${shift.break_time}min` : "-",
        raw: shift, // Keep raw for any specific needs
      }));

      return {
        // Raw values
        id: slotId,
        start_date: slotStartDate,
        end_date: slotEndDate,
        joining_time,
        finish_time,
        break_time: slotBreakTime,
        filled_count,
        is_filled,
        is_matching,
        is_applied_for_proposal,
        assigned_worker: assignedWorker,
        is_available: is_filled === false && is_matching === false,
        labour_cost,
        labour_cost_after_commission,
        worker_shifts: transformedWorkerShifts,
        // Formatted versions for UI
        startDate: formatDate(slotStartDate),
        endDate: formatDate(slotEndDate),
        joiningTime: formatTime(joining_time),
        endTime: formatTime(finish_time),
        breakTime: slotBreakTime ? `${slotBreakTime}min` : "-",
        isOverlapping: is_overlapping,
        isDisputed: is_disputed,
        proposalId: slotProposalId,
        matchingWith: matching_with,
        totalHours: calculateHours(joining_time, finish_time, slotBreakTime),
      };
    });

    // Determine payment method display text
    const payment_method_text =
      payment_mode === "CARD"
        ? "Card"
        : payment_mode === "CASH"
          ? "Cash"
          : payment_mode || "N/A";

    // First slot convenience fields
    const first_slot = transformedSlots[0] || null;

    // ============================================
    // DUMMY DATA FOR FIELDS NOT IN API
    // ============================================

    // Selected worker (for Completed jobs - dummy data until API provides)
    // const selected_worker = apiSelectedWorker || {
    //   id: 1,
    //   name: "Carlos Rodriguez",
    //   profile_picture: null,
    //   rating: 4.9,
    //   total_reviews: 14,
    //   role: "Server",
    //   years_experience: 3,
    //   experience_description:
    //     "3 years experience in customer service and corporate events...",
    // };

    // Reviews (for Completed jobs - dummy data until API provides)
    const reviews = apiReviews || [];

    // Dispute Info (for Disputed jobs)
    const dispute_info = jobData.dispute || null;

    console.log("dispute_info", dispute_info);

    // ============================================
    // RETURN TRANSFORMED DATA OBJECT
    // ============================================

    // Helper to ensure distance_km has no decimal portion
    const formatDistanceKm = (d) => {
      const n = Number(d);
      if (!Number.isFinite(n)) return "0";
      return String(Math.trunc(n));
    };

    return {
      // Core job identifiers
      id,
      job_title,
      job_status,
      tab_job_status,
      position,
      experience_level: formatExperienceLevel(experience_level),
      description,

      // Business info
      business_name,
      business_id,
      business_avg_ratings: Math.round(business_avg_ratings || 0),
      business_profile_picture,

      // Pricing and payment
      job_cost_for_worker,
      job_cost_for_worker_after_worker_commission,
      earned_amount,
      earned_amount_after_worker_commission,
      pay_rate,
      payment_mode,
      payment_method_text,

      // Location
      location_address,
      location_details,

      // Dates
      start_date,
      end_date,
      start_date_formatted: formatDate(start_date),
      end_date_formatted: formatDate(end_date),
      posted_at_human,

      // Time info
      break_time,

      // Status
      status_code,
      status,

      // Distance (dummy if not in API) - ensure no decimals
      distance_km: formatDistanceKm(distance_km),

      // Responsibilities
      responsibilities,
      responsibilities_text,

      // Slots (transformed with formatted values)
      slots: transformedSlots,
      slots_transformed: transformedSlots,
      first_slot,

      // Flags for UI control
      can_apply,
      can_apply_reason,
      show_raise_dispute_button,
      show_raise_dispute_button_reason,
      show_rating_button,
      show_rating_button_reason,
      show_cash_received_popup: show_cash_received_confirmation_popup,
      show_cash_received_popup_reason:
        show_cash_received_confirmation_popup_reason,
      enable_check_in_button,
      enable_check_in_button_reason,
      enable_check_out_button,
      enable_check_out_button_reason,

      // Check in/out button states (aliased for AssignedJobDetailsScreen)
      showCheckInButton: enable_check_in_button,
      showCheckOutButton: enable_check_out_button,

      // Worker proposal info
      proposal_id,
      proposal_status,
      assigned_slot_id,

      // Keep worker object for fallback access patterns
      worker: {
        proposal_id,
        proposal_status,
        assigned_slot_id,
      },

      // Keep flags object for fallback access patterns
      flags: {
        can_apply,
        can_apply_reason,
        show_raise_dispute_button,
        show_raise_dispute_button_reason,
        show_rating_button,
        show_rating_button_reason,
        show_cash_received_confirmation_popup,
        show_cash_received_confirmation_popup_reason,
        enable_check_in_button,
        enable_check_in_button_reason,
        enable_check_out_button,
        enable_check_out_button_reason,
      },

      // Selected worker (Completed jobs)
      // selected_worker,

      // Reviews (Completed jobs)
      reviews,

      // Dispute Info (Disputed jobs)
      dispute_info,

      // Helper functions for any additional formatting needs
      formatTime,
      formatTimeFromISO,
      formatDate,
      calculateHours,
    };
  };

  // Loading state
  if (isPending && !apiResponse) {
    return (
      <ScrollView
        contentContainerStyle={styles.centerContainer}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            colors={[colors.primary.pink]}
            tintColor={colors.primary.pink}
          />
        }
      >
        <ActivityIndicator size="large" color={colors.primary.pink} />
        <Text style={styles.loadingText}>
          {translate("workerJobs.loadingJobDetails")}
        </Text>
      </ScrollView>
    );
  }

  // Error state
  if (isError && !apiResponse) {
    return (
      <ScrollView
        contentContainerStyle={styles.centerContainer}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            colors={[colors.primary.pink]}
            tintColor={colors.primary.pink}
          />
        }
      >
        <Text style={styles.errorText}>
          {translate("workerJobs.failedLoadJobDetailsRetry")}
        </Text>
      </ScrollView>
    );
  }

  // No data state
  if (!apiResponse) {
    return (
      <ScrollView
        contentContainerStyle={styles.centerContainer}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            colors={[colors.primary.pink]}
            tintColor={colors.primary.pink}
          />
        }
      >
        <Text style={styles.errorText}>
          {translate("workerJobs.noJobDataFound")}
        </Text>
      </ScrollView>
    );
  }

  // Transform the data
  const transformedData = transformJobData(apiResponse);

  if (!transformedData) {
    return (
      <ScrollView
        contentContainerStyle={styles.centerContainer}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            colors={[colors.primary.pink]}
            tintColor={colors.primary.pink}
          />
        }
      >
        <Text style={styles.errorText}>
          {translate("workerJobs.invalidJobData")}
        </Text>
      </ScrollView>
    );
  }

  // Render appropriate screen based primarily on the source tab (initialStatus)
  // to ensure consistency with the user's current context. Fallback to API data if not present.
  const jobStatus =
    route.params?.initialStatus ||
    transformedData.tab_job_status ||
    "Suggested";

  // Render appropriate screen based on job_status from API
  switch (jobStatus) {
    case "Assigned":
      return (
        <AssignedJobDetailsScreen
          jobData={transformedData}
          onRefresh={refetch}
          isRefreshing={isFetching}
        />
      );
    case "Completed":
      return (
        <CompletedJobDetailsScreen
          jobData={transformedData}
          onRefresh={refetch}
          isRefreshing={isFetching}
        />
      );
    case "Disputed":
      return (
        <DisputedJobDetailsScreen
          jobData={transformedData}
          onRefresh={refetch}
          isRefreshing={isFetching}
        />
      );
    case "Suggested":
    default:
      return (
        <JobDetailsScreen
          jobData={transformedData}
          onRefresh={refetch}
          isRefreshing={isFetching}
        />
      );
  }
};

export default UnifiedJobDetailsScreen;

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.auth.background,
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: colors.text.primary,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: colors.text.secondary,
    textAlign: "center",
  },
});
