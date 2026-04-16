import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../../theme/worker/colors";
import {
  useFetchWorkerJobs,
  useJobCheckInOut,
} from "../../../services/WorkerJobServices";
import { formatExperienceLevel } from "../../../utils/experienceLevel";
import {
  formatDisplayDate,
  formatTimeString,
} from "../../../utils/dateFormatting";
import {
  formatDateToAPI,
  formatTimeToAPIWithSeconds,
} from "../../../utils/jobFormatting";
import { useTranslation } from "../../../hooks/useTranslation";
import JobCard from "../../../components/workerhome/JobCard";
import JobFilterModal, {
  EMPTY_FILTERS,
} from "../../../components/workerhome/JobFilterModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Count how many filter fields are active */
const countActiveFilters = (filters) =>
  Object.entries(filters).filter(([, v]) => v !== null && v !== "").length;

/** Build the filters object to send to the API (omit empty/null values) */
const buildApiFilters = (search, filters) => {
  const result = {};
  if (search) result.search = search;
  if (filters.position) result.position = filters.position;
  if (filters.experience_level)
    result.experience_level = filters.experience_level;
  if (filters.min_pay_rate !== "")
    result.min_pay_rate = parseFloat(filters.min_pay_rate);

  if (filters.start_date)
    result.start_date = formatDateToAPI(filters.start_date);
  if (filters.end_date) result.end_date = formatDateToAPI(filters.end_date);
  if (filters.start_time)
    result.start_time = formatTimeToAPIWithSeconds(filters.start_time);
  if (filters.end_time)
    result.end_time = formatTimeToAPIWithSeconds(filters.end_time);

  if (filters.min_business_rating > 0)
    result.min_business_rating = filters.min_business_rating;
  if (filters.min_distance !== "")
    result.min_distance = parseFloat(filters.min_distance);
  if (filters.max_distance !== "")
    result.max_distance = parseFloat(filters.max_distance);

  return result;
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SearchJobScreen() {
  const navigation = useNavigation();
  const { translate } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Applied filters (sent to the API)
  const [appliedFilters, setAppliedFilters] = useState({ ...EMPTY_FILTERS });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const apiFilters = useMemo(
    () => buildApiFilters(debouncedSearch, appliedFilters),
    [debouncedSearch, appliedFilters],
  );

  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchWorkerJobs({
    jobStatus: "Suggested",
    limit: 40,
    filters: apiFilters,
  });

  const { mutate: performCheckInOut } = useJobCheckInOut();

  const apiJobs = data?.jobs || [];

  const formatDate = (dateStr) => (dateStr ? formatDisplayDate(dateStr) : "-");
  const formatTime = (timeStr) => (timeStr ? formatTimeString(timeStr) : "-");
  const formatBreakTime = (minutes) => (minutes ? `${minutes}min` : "-");

  const transformJob = (job) => {
    const slots = job.slots || [];
    return {
      id: job.id,
      title: job.job_title || "Job",
      company: job.business_name || "Business",
      businessId: job.business_id,
      businessProfilePicture: job.business_profile_picture,
      price: `$${Math.round(job.job_cost_for_worker_after_worker_commission)}`,
      position: job.position || "-",
      experienceLevel: formatExperienceLevel(job.experience_level, "-"),
      payRate: job.hourly_pay_rate ? `$${job.hourly_pay_rate}/hr` : "-/hr",
      distance: job.distance_km
        ? `${Math.round(Number(job.distance_km))}km`
        : null,
      rating: job.business_rating || 0,
      slots: slots.map((slot) => ({
        startDate: slot.start_date ? formatDate(slot.start_date) : "-",
        endDate: slot.end_date ? formatDate(slot.end_date) : "-",
        joiningTime: slot.joining_time ? formatTime(slot.joining_time) : "-",
        endTime: slot.end_time ? formatTime(slot.end_time) : "-",
        breakTime: formatBreakTime(slot.break_time),
        is_applied_for_proposal: slot.is_applied_for_proposal || false,
      })),
      showCheckInButton: job.showCheckInButton || false,
      showCheckOutButton: job.showCheckOutButton || false,
    };
  };

  const currentJobs = useMemo(() => apiJobs.map(transformJob), [apiJobs]);

  const handleViewDetails = (jobId) => {
    navigation.navigate("WorkerUnifiedJobDetails", { jobId });
  };

  const handleBusinessProfilePress = (businessId, businessName) => {
    navigation.navigate("BusinessProfile", { businessId, businessName });
  };

  const handleCheckInOut = (jobId, isCheckIn) => {
    const action = isCheckIn
      ? translate("workerHome.checkInAction")
      : translate("workerHome.checkOutAction");
    Alert.alert(
      translate("workerHome.confirmation"),
      translate("workerHome.confirmCheckInOut", { action }),
      [
        { text: translate("workerHome.cancel"), style: "cancel" },
        {
          text: translate("workerHome.confirm"),
          onPress: () => {
            performCheckInOut(jobId, {
              onSuccess: (response) => {
                Alert.alert(
                  translate("workerCommon.success"),
                  response.message ||
                    translate("workerHome.successful", { action }),
                );
                refetch();
              },
              onError: (err) => {
                Alert.alert(
                  translate("workerCommon.error"),
                  err.message ||
                    translate("workerHome.failedAction", { action }),
                );
              },
            });
          },
        },
      ],
    );
  };

  // ── Filter modal handlers ──────────────────────────────────────────────────

  const handleApplyFilters = useCallback((filters) => {
    setAppliedFilters(filters);
    setFilterModalVisible(false);
  }, []);

  const activeFilterCount = countActiveFilters(appliedFilters);

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" backgroundColor={colors.primary.pink} />
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonContainer}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {translate("workerSearch.availableJobs")}
          </Text>
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={translate("workerSearch.searchJobs")}
            placeholderTextColor={colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons
              name="funnel-outline"
              size={20}
              color={
                activeFilterCount > 0
                  ? colors.primary.pink
                  : colors.text.secondary
              }
            />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <FlatList
          data={currentJobs}
          keyExtractor={(job) => String(job.id)}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl refreshing={isPending} onRefresh={refetch} />
          }
          ListEmptyComponent={
            isPending ? (
              <ActivityIndicator
                size="large"
                color={colors.primary.pink}
                style={{ marginTop: 40 }}
              />
            ) : isError ? (
              <Text style={styles.errorText}>
                {translate("workerHome.failedToLoadJobs")}
              </Text>
            ) : (
              <Text style={styles.emptyText}>
                {translate("workerHome.noJobsFound")}
              </Text>
            )
          }
          renderItem={({ item: job }) => (
            <JobCard
              job={job}
              activeTab="Suggested"
              translate={translate}
              handleBusinessProfilePress={handleBusinessProfilePress}
              handleCheckInOut={handleCheckInOut}
              handleViewDetails={handleViewDetails}
            />
          )}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator
                size="small"
                color={colors.primary.pink}
                style={{ marginVertical: 16 }}
              />
            ) : null
          }
        />
      </View>

      {/* ── Filter Modal ── */}
      <JobFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        appliedFilters={appliedFilters}
        onApply={handleApplyFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
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
  backButtonContainer: {
    padding: 3,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    marginLeft: 15,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.inputPinkBackground,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: colors.ui.inputBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.primary,
    paddingVertical: 0,
  },
  filterButton: {
    marginLeft: 10,
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: colors.primary.pink,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  filterBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontFamily: "Poppins_700Bold",
  },
  scrollContent: {
    paddingBottom: 40,
    gap: 15,
  },
  errorText: {
    textAlign: "center",
    color: "red",
    marginTop: 20,
    fontFamily: "Poppins_400Regular",
  },
  emptyText: {
    textAlign: "center",
    color: colors.text.secondary,
    marginTop: 20,
    fontFamily: "Poppins_400Regular",
  },
});
