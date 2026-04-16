import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { colors, fonts } from "../../../theme";
import { CommonHeader, ScreenWrapper } from "../../../components/common";
import { useTranslation } from "../../../hooks/useTranslation";
import LoadingState from "../../../components/LoadingState";
import ErrorState from "../../../components/ErrorState";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import FilterSheet from "../../../components/FilterSheet";
import DataCard from "../../../components/DataCard";
import { useFetchProposals, useSelectWorker } from "../../../services/JobServices";
import { useQueryClient } from "@tanstack/react-query";
import {
  formatDisplayDate,
  formatTimeString,
  parseDate,
} from "../../../utils/dateFormatting";

// Filter options
const createPositionOptions = (translate) => [
  { label: translate("jobs.waiter"), value: "Waiter" },
  { label: translate("jobs.bartender"), value: "Bartender" },
  { label: translate("jobs.chef"), value: "Chef" },
  { label: translate("jobs.cleaner"), value: "Cleaner" },
];

// Helper function to format 24-hour time to 12-hour AM/PM format
const formatTo12Hour = (time24) => {
  if (!time24) return "";
  const result = formatTimeString(time24);
  return result === "N/A" ? "" : result;
};

// Helper function to format date from ISO format to readable format
const formatAppliedDate = (isoDate) => {
  if (!isoDate) return "";
  const result = formatDisplayDate(isoDate);
  return result === "N/A" ? "" : result;
};

// Helper function to check if a slot's time has passed
const isSlotTimePassed = (slot) => {
  if (!slot || !slot.startDate || !slot.joiningTime) {
    return false;
  }

  const slotDateTime = parseDate(slot.startDate);
  if (!slotDateTime) return false;

  const [hours, minutes] = slot.joiningTime.split(":").map(Number);
  slotDateTime.setHours(hours, minutes, 0);

  const currentDateTime = new Date();
  return currentDateTime > slotDateTime;
};

// Star Rating Component - supports half ratings (e.g., 4.5)
function RenderStars({
  rating,
  size = 14,
  color = "#E0A125",
  outlineColor = "#D6D6D6",
}) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const stars = [];

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <MaterialIcons
        key={`full-${i}`}
        name="star"
        size={size}
        color={color}
        style={{ marginRight: 2 }}
      />,
    );
  }

  // Add half star if needed
  if (hasHalfStar) {
    stars.push(
      <MaterialIcons
        key="half"
        name="star-half"
        size={size}
        color={color}
        style={{ marginRight: 2 }}
      />,
    );
  }

  // Add empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <MaterialIcons
        key={`empty-${i}`}
        name="star-outline"
        size={size}
        color={outlineColor}
        style={{ marginRight: 2 }}
      />,
    );
  }

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>{stars}</View>
  );
}

const ExpandableText = ({ text, style, translate }) => {
  const [expanded, setExpanded] = useState(false);
  const maxLength = 120; // safe character limit for 2-3 lines

  if (!text) return null;

  if (text.length <= maxLength) {
    return <Text style={style}>{text}</Text>;
  }

  return (
    <View>
      <Text style={style}>
        {expanded ? text : `${text.substring(0, maxLength).trim()}...`}
        <Text
          style={{ color: colors.tertiary, fontFamily: fonts.semiBold }}
          onPress={() => setExpanded(!expanded)}
        >
          {expanded
            ? `  ${translate("common.readLess", "Read less")}`
            : `  ${translate("common.readMore", "Read more")}`}
        </Text>
      </Text>
    </View>
  );
};

export default function ActiveApplicantsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { translate } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);
  const [selected, setSelected] = useState({ sort: "rating" });
  const [refreshing, setRefreshing] = useState(false);
  const [loadingWorkerId, setLoadingWorkerId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const debounceTimer = useRef(null);

  // Filter options with translations
  const positionOptions = useMemo(
    () => createPositionOptions(translate),
    [translate],
  );
  const experienceOptions = useMemo(
    () => [
      { label: translate("jobs.beginner"), value: "beginner" },
      { label: translate("jobs.intermediate"), value: "intermediate" },
      { label: translate("jobs.expert"), value: "expert" },
    ],
    [translate],
  );

  // Get jobId from route params
  const jobId = route.params?.jobId;
  const type = route.params?.type || "active"; // "active" or "completed"

  // Debounce search query
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms debounce

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);

  // Refetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useFetchProposals(jobId, {
    ...selected,
    search: debouncedSearchQuery,
    per_page: 10,
  });

  const { mutate: selectWorkerMutate } = useSelectWorker();
  const queryClient = useQueryClient();

  const handleDeselectSlot = useCallback(
    (slotItem, workerName, workerId) => {
      Alert.alert(
        translate("jobs.confirmDeselection"),
        translate("jobs.confirmDeselectionMessage", { name: workerName }),
        [
          { text: translate("common.no"), style: "cancel" },
          {
            text: translate("common.yes"),
            onPress: async () => {
              try {
                setLoadingWorkerId(workerId);
                selectWorkerMutate(
                  { jobId, workerId, slotId: slotItem.slot.id },
                  {
                    onSuccess: () => {
                      queryClient.invalidateQueries({ queryKey: ["proposals", jobId] });
                      queryClient.invalidateQueries({ queryKey: ["jobbyid", jobId] });
                      queryClient.invalidateQueries({ queryKey: ["assignedworkers", jobId] });
                      refetch();
                    },
                    onError: (error) => {
                      Alert.alert(
                        translate("common.error"),
                        error.message || translate("jobs.failedToDeselectWorker"),
                      );
                    },
                  },
                );
              } catch (error) {
                console.error("Error deselecting slot:", error);
              } finally {
                setLoadingWorkerId(null);
              }
            },
          },
        ],
      );
    },
    [jobId, translate, selectWorkerMutate, queryClient, refetch],
  );

  const handleSelectSlot = useCallback(
    (slotItem, workerName, workerId) => {
      const currentSelectedCount = data?.job?.workers_selected || 0;
      const currentWorkersNeeded = data?.job?.workers_needed || 0;

      if (currentSelectedCount >= currentWorkersNeeded) {
        Alert.alert(
          translate("jobs.workersLimitReached"),
          translate("jobs.workersLimitReachedMessage", {
            name: workerName,
            selectedCount: currentSelectedCount,
            workersNeeded: currentWorkersNeeded,
          }),
        );
        return;
      }

      Alert.alert(
        translate("jobs.confirmSelection"),
        translate("jobs.confirmSelectionMessage", { name: workerName }),
        [
          { text: translate("common.no"), style: "cancel" },
          {
            text: translate("common.yes"),
            onPress: async () => {
              try {
                setLoadingWorkerId(workerId);
                selectWorkerMutate(
                  { jobId, workerId, slotId: slotItem.slot.id },
                  {
                    onSuccess: () => {
                      queryClient.invalidateQueries({
                        queryKey: ["proposals", jobId],
                      });
                      queryClient.invalidateQueries({
                        queryKey: ["jobbyid", jobId],
                      });
                      queryClient.invalidateQueries({
                        queryKey: ["assignedworkers", jobId],
                      });
                      refetch();
                    },
                    onError: (error) => {
                      Alert.alert(
                        translate("common.error"),
                        error.message || translate("jobs.failedToSelectWorker"),
                      );
                    },
                  },
                );
              } catch (error) {
                console.error("Error selecting slot:", error);
              } finally {
                setLoadingWorkerId(null);
              }
            },
          },
        ],
      );
    },
    [jobId, translate, selectWorkerMutate, queryClient, refetch, data],
  );

  const handleFinishSlot = useCallback(
    (slotItem, workerName, workerId) => {
      Alert.alert(
        translate("jobs.confirmFinish"),
        translate("jobs.confirmFinishMessage", { name: workerName }),
        [
          { text: translate("common.no"), style: "cancel" },
          {
            text: translate("common.yes"),
            onPress: async () => {
              try {
                setLoadingWorkerId(workerId);
                selectWorkerMutate(
                  { jobId, workerId, slotId: slotItem.slot.id },
                  {
                    onSuccess: () => {
                      queryClient.invalidateQueries({
                        queryKey: ["proposals", jobId],
                      });
                      queryClient.invalidateQueries({
                        queryKey: ["jobbyid", jobId],
                      });
                      queryClient.invalidateQueries({
                        queryKey: ["assignedworkers", jobId],
                      });
                      refetch();
                    },
                    onError: (error) => {
                      Alert.alert(
                        translate("common.error"),
                        error.message || translate("jobs.failedToCompleteJob"),
                      );
                    },
                  },
                );
              } catch (error) {
                console.error("Error finishing slot:", error);
              } finally {
                setLoadingWorkerId(null);
              }
            },
          },
        ],
      );
    },
    [jobId, translate, selectWorkerMutate, queryClient, refetch],
  );

  // Transform API proposals to applicant card format (grouped by worker)
  const applicants = useMemo(() => {
    if (!data?.proposals) return [];
    return data.proposals.map((proposal) => {
      const items = proposal.items || [];
      const firstItem = items[0] || {};
      const hasSelectedItem = items.some((i) => i.status === "selected");
      return {
        id: proposal.worker.id,
        workerId: proposal.worker.id,
        name: `${proposal.worker.first_name} ${proposal.worker.last_name}`,
        avatar: {
          uri: proposal.worker.profile_picture,
        },
        experience: proposal.worker.experience_level || 0,
        position: proposal.worker.position || "",
        rating: proposal.worker.avg_rating || 0,
        reviews: proposal.worker.ratings_count || 0,
        badge: hasSelectedItem ? translate("jobs.selectedBadge") : null,
        status: hasSelectedItem ? "selected" : firstItem.status,
        // Cover letter is same for all slots, show from first item
        snippet: firstItem.cover_letter || translate("jobs.noMessageProvided"),
        appliedOn: formatAppliedDate(firstItem.created_at),
        distance: firstItem.distance_km,
        amount: firstItem.amount,
        skills: data.job?.skills?.map((skill) => skill.name) || [],
        // All slot items for this worker
        items: items.map((item) => ({
          proposalId: item.id,
          status: item.status,
          badge:
            item.status === "selected"
              ? translate("jobs.selectedBadge")
              : item.status === "completed"
                ? translate("jobs.finishedBadge")
                : null,
          slot: item.worker_slot
            ? {
                id: item.slot.id,
                startDate: item.slot.start_date,
                endDate: item.slot.end_date,
                joiningTime: item.slot.joining_time,
                finishTime: item.slot.finish_time,
                breakTime: item.slot.break_time,
              }
            : null,
        })),
        // Keep first proposalId for backward compatibility
        proposalId: firstItem.id,
      };
    });
  }, [data, translate]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSortChange = useCallback(
    (key, value) => {
      setSelected((s) => ({ ...s, [key]: value }));
      refetch();
      setFilterOpen(false);
    },
    [refetch],
  );

  const handleClearFilters = useCallback(() => {
    setSelected({ sort: "rating" });
    refetch();
    setFilterOpen(false);
  }, [refetch]);

  const handleSelectDeselect = useCallback(
    async (proposalId, shouldSelect, workerId) => {
      try {
        setLoadingWorkerId(workerId);
        await refetch();
      } catch (error) {
        console.error("Error updating proposal status:", error);
      } finally {
        setLoadingWorkerId(null);
      }
    },
    [refetch],
  );

  // Calculate workers needed based on job data
  const jobData = data?.job;
  const workersNeeded = jobData?.workers_needed || 0;
  const selectedCount = jobData?.workers_selected || 0;
  // Compute a clearer status banner text
  const remainingSlots = Math.max(workersNeeded - selectedCount, 0);
  let bannerText = "";
  if (workersNeeded === 0) {
    bannerText = translate("jobs.noWorkersRequired");
  } else if (selectedCount >= workersNeeded) {
    bannerText = translate("jobs.allWorkersAssigned", { count: workersNeeded });
  } else {
    bannerText = translate("jobs.slotsRemaining", {
      remaining: remainingSlots,
      total: workersNeeded,
    });
  }

  // Determine header title based on type
  const headerTitle =
    type === "completed"
      ? translate("jobs.allApplicants")
      : translate("jobs.applicants");

  // Render loading state
  if (isLoading) {
    return (
      <LoadingState
        title={headerTitle}
        message={translate("common.loading")}
        backgroundColor={colors.bg}
      />
    );
  }

  // Render error state
  if (isError) {
    return (
      <ErrorState
        title={headerTitle}
        errorMessage={
          error?.message || translate("jobs.failedToLoadApplicants")
        }
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <ScreenWrapper backgroundColor={colors.bg}>
      <CommonHeader
        title={headerTitle}
        onBackPress={() => navigation.goBack?.()}
        backgroundColor={colors.bg1}
      />
      <View style={styles.outerContainer}>
        <View style={styles.searchRow}>
          <MaterialIcons
            name="search"
            size={14}
            color={colors.text5}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={translate("jobs.searchApplicants")}
            placeholderTextColor={colors.text5}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.filterIconBtn}
            onPress={() => setFilterOpen(true)}
          >
            <FontAwesome5 name="sliders-h" size={14} color={colors.textdark} />
          </TouchableOpacity>
        </View>

        {type === "active" && (
          <View style={styles.statusBanner}>
            <Text style={styles.statusBannerText}>
              {translate("jobs.statusPrefix")}
              {bannerText}
            </Text>
          </View>
        )}

        <Text style={styles.metaText}>
          {translate("jobs.showingApplications", {
            count: applicants.length,
            total: data?.meta?.total || 0,
          })}
        </Text>

        <FlatList
          data={applicants}
          keyExtractor={(item) => `worker-${item.workerId}`}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.tertiary} />
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.tertiary}
              colors={[colors.tertiary]}
            />
          }
          renderItem={({ item }) => (
            <DataCard style={{ marginHorizontal: 0 }}>
              <View style={cardStyles.rowTop}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() =>
                    navigation.navigate("ApplicantProfile", {
                      workerId: item.workerId,
                      jobId: type === "active" ? jobId : null,
                    })
                  }
                >
                  <Image source={item.avatar} style={cardStyles.avatar} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <View style={cardStyles.nameRow}>
                    <Text style={cardStyles.name}>{item.name}</Text>
                    {!!item.badge && (
                      <View style={cardStyles.badge}>
                        <Text style={cardStyles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </View>
                  <View style={cardStyles.ratingRow}>
                    <RenderStars rating={item.rating.toFixed(1)} size={14} />
                    <Text style={cardStyles.ratingText}>
                      {" "}
                      {item.rating.toFixed(1)} ({item.reviews} reviews)
                    </Text>
                  </View>
                </View>
              </View>

              {!!item.snippet && (
                <ExpandableText
                  text={item.snippet}
                  style={cardStyles.snippet}
                  translate={translate}
                />
              )}
              {item.position && (
                <Text style={cardStyles.snippet}>
                  {translate("jobs.positionLabel", { position: item.position })}{" "}
                  - {item.experience}
                </Text>
              )}
              {!!item.appliedOn && (
                <Text style={cardStyles.applied}>
                  {translate("jobs.appliedOn", { date: item.appliedOn })}
                </Text>
              )}

              {/* Show all slots from items */}
              {item.items?.length > 0 && (
                <View style={cardStyles.slotContainer}>
                  <Text style={cardStyles.slotTitle}>
                    {translate("jobs.slotDetails")}
                    {item.items.length > 1 ? ` (${item.items.length})` : ""}
                  </Text>
                  {item.items.map((slotItem, index) => (
                    <View key={slotItem.proposalId}>
                      {slotItem.slot && (
                        <View
                          style={[
                            cardStyles.slotDetails,
                            index > 0 && cardStyles.slotDivider,
                          ]}
                        >
                          <View style={cardStyles.slotRow}>
                            <Text style={cardStyles.slotLabel}>
                              {translate("jobs.duration")}
                            </Text>
                            <Text style={cardStyles.slotValue}>
                              {formatDisplayDate(slotItem.slot.startDate)} -{" "}
                              {formatDisplayDate(slotItem.slot.endDate)}
                            </Text>
                          </View>
                          <View style={cardStyles.slotRow}>
                            <Text style={cardStyles.slotLabel}>
                              {translate("jobs.shift")}
                            </Text>
                            <Text style={cardStyles.slotValue}>
                              {formatTo12Hour(slotItem.slot.joiningTime)} -{" "}
                              {formatTo12Hour(slotItem.slot.finishTime)}
                            </Text>
                          </View>
                            {(!!slotItem.badge ||
                              slotItem.status === "pending" ||
                              slotItem.status === "selected") && (
                              <View style={cardStyles.slotRow}>
                                <Text style={cardStyles.slotLabel}>
                                  {translate("jobs.statusLabel") || "Status"}
                                </Text>
                                <View style={cardStyles.slotActionContainer}>
                                  {!!slotItem.badge && (
                                    <View style={cardStyles.slotBadge}>
                                      <Text style={cardStyles.slotBadgeText}>
                                        {slotItem.badge}
                                      </Text>
                                    </View>
                                  )}
                                  {slotItem.status === "pending" && (
                                    <TouchableOpacity
                                      activeOpacity={0.7}
                                      style={[
                                        cardStyles.slotSelectBtn,
                                        type === "completed" && {
                                          opacity: 0.5,
                                        },
                                      ]}
                                      disabled={type === "completed"}
                                      onPress={() =>
                                        handleSelectSlot(
                                          slotItem,
                                          item.name,
                                          item.workerId,
                                        )
                                      }
                                    >
                                      <MaterialIcons
                                        name="check"
                                        size={12}
                                        color="#18C67A"
                                      />
                                      <Text style={cardStyles.slotSelectText}>
                                        {translate("jobs.select")}
                                      </Text>
                                    </TouchableOpacity>
                                  )}
                                  {slotItem.status === "selected" && (
                                    <TouchableOpacity
                                      activeOpacity={0.7}
                                      style={[
                                        isSlotTimePassed(slotItem.slot)
                                          ? cardStyles.slotFinishBtn
                                          : cardStyles.slotDeselectBtn,
                                        type === "completed" && {
                                          opacity: 0.5,
                                        },
                                      ]}
                                      disabled={type === "completed"}
                                      onPress={() =>
                                        isSlotTimePassed(slotItem.slot)
                                          ? handleFinishSlot(
                                              slotItem,
                                              item.name,
                                              item.workerId,
                                            )
                                          : handleDeselectSlot(
                                              slotItem,
                                              item.name,
                                              item.workerId,
                                            )
                                      }
                                    >
                                      <MaterialIcons
                                        name={
                                          isSlotTimePassed(slotItem.slot)
                                            ? "flag"
                                            : "close"
                                        }
                                        size={12}
                                        color={
                                          isSlotTimePassed(slotItem.slot)
                                            ? "#18C67A"
                                            : "#E74C3C"
                                        }
                                      />
                                      <Text
                                        style={
                                          isSlotTimePassed(slotItem.slot)
                                            ? cardStyles.slotFinishText
                                            : cardStyles.slotDeselectText
                                        }
                                      >
                                        {isSlotTimePassed(slotItem.slot)
                                          ? translate("jobs.finish")
                                          : translate("jobs.deselect")}
                                      </Text>
                                    </TouchableOpacity>
                                  )}
                                </View>
                              </View>
                            )}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {!!item.skills?.length && (
                <View style={{ marginTop: 10 }}>
                  <Text style={cardStyles.skillsLabel}>
                    {translate("jobs.skillsLabel")}
                  </Text>
                  <View style={cardStyles.chipsRow}>
                    {item.skills.map((s) => (
                      <View key={String(s)} style={cardStyles.chip}>
                        <Text style={cardStyles.chipText}>{String(s)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <TouchableOpacity
                activeOpacity={0.85}
                style={cardStyles.viewProfileBtn}
                onPress={() =>
                  navigation.navigate("ApplicantProfile", {
                    workerId: item.workerId,
                    jobId: type === "active" ? jobId : null,
                  })
                }
              >
                <Text style={cardStyles.viewProfileText}>
                  {translate("jobs.viewProfile")}
                </Text>
              </TouchableOpacity>
            </DataCard>
          )}
        />
      </View>
      <FilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        selected={selected}
        onChange={handleSortChange}
        onClear={handleClearFilters}
        translate={translate}
        sections={[
          {
            key: "sort",
            title: "Sort by",
            options: [
              { label: "Location (Near to furthest)", value: "distance" },
              { label: "Highest Rated", value: "rating" },
            ],
          },
          {
            key: "position",
            title: "Position",
            inputType: "dropdown-single",
            options: positionOptions,
          },
          {
            key: "experience_level",
            title: "Experience Level",
            options: experienceOptions,
          },
        ]}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, zIndex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.text,
    paddingHorizontal: 12,
    zIndex: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: colors.textdark,
    fontFamily: fonts.regular,
    paddingVertical: 0,
  },
  filterIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bbg6,
  },
  statusBanner: {
    marginHorizontal: 16,
    marginBottom: 10,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFF9C4",
    alignItems: "center",
    justifyContent: "center",
  },
  statusBannerText: { color: "#B28400", fontFamily: fonts.semiBold },
  metaText: {
    color: colors.text1,
    fontFamily: fonts.regular,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
  },
});

const cardStyles = StyleSheet.create({
  rowTop: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: { color: colors.textdark, fontFamily: fonts.semiBold },
  badge: {
    backgroundColor: colors.bbg5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: colors.textdark,
    fontFamily: fonts.semiBold,
    fontSize: 10,
  },
  rating: { color: "#E0A125", fontFamily: fonts.semiBold, marginTop: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  ratingText: { color: colors.text1, fontFamily: fonts.regular },
  ratingDim: { color: colors.text1, fontFamily: fonts.regular },
  snippet: { color: colors.text1, fontFamily: fonts.regular, marginTop: 8 },
  applied: { color: colors.text1, fontFamily: fonts.regular, marginTop: 8 },
  skillsLabel: {
    color: colors.textdark,
    fontFamily: fonts.semiBold,
    marginBottom: 4,
  },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: colors.bbg6,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: { color: colors.textdark, fontFamily: fonts.medium, fontSize: 11 },
  slotContainer: {
    marginTop: 10,
    backgroundColor: colors.bbg6,
    borderRadius: 8,
    padding: 10,
  },
  slotTitle: {
    color: colors.textdark,
    fontFamily: fonts.semiBold,
    marginBottom: 8,
    fontSize: 12,
  },
  slotDetails: {
    gap: 6,
  },
  slotDivider: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.bg,
  },
  slotBadge: {
    backgroundColor: colors.bbg5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  slotBadgeText: {
    color: colors.textdark,
    fontFamily: fonts.semiBold,
    fontSize: 10,
  },
  slotRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  slotLabel: {
    color: colors.text1,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  slotValue: {
    color: colors.textdark,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  slotActionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  slotDeselectBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDEDEC",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#F5B7B1",
  },
  slotDeselectText: {
    color: "#E74C3C",
    fontFamily: fonts.semiBold,
    fontSize: 10,
    marginLeft: 2,
  },
  slotSelectBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F9F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#A3E4D7",
  },
  slotSelectText: {
    color: "#18C67A",
    fontFamily: fonts.semiBold,
    fontSize: 10,
    marginLeft: 2,
  },
  slotFinishBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F0FE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#A9C8F4",
  },
  slotFinishText: {
    color: "#1877F2",
    fontFamily: fonts.semiBold,
    fontSize: 10,
    marginLeft: 2,
  },
  viewProfileBtn: {
    backgroundColor: colors.tertiary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  viewProfileText: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  footerRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  cta: {
    flex: 1,
    borderRadius: 10,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { fontFamily: fonts.semiBold },
});
