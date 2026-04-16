import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors, fonts } from "../../../theme";
import { CommonHeader, ScreenWrapper } from "../../../components/common";
import { useTranslation } from "../../../hooks/useTranslation";
import DataCard from "../../../components/DataCard";
import {
  useFetchProposedSlots,
  useCompleteSingleWorkerSlot,
} from "../../../services/JobServices";
import { formatDisplayDate } from "../../../utils/dateFormatting";

export default function SelectedWorkersListScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { translate } = useTranslation();

  const { jobId, paymentMode, jobTitle } = route.params || {};

  const {
    data: proposedSlotsData,
    isPending: isLoadingWorkers,
    refetch,
  } = useFetchProposedSlots(jobId);

  // Flatten proposed slots into a single array of renderable items
  const flattenedSlots = useMemo(() => {
    const rawSlots = proposedSlotsData?.data || [];
    if (!Array.isArray(rawSlots)) return [];

    // Filter for selected status as this is the "Selected Workers" list
    return rawSlots
      .filter((ps) => ps.status === "selected" || ps.status === "completed" || ps.status === "disputed")
      .map((ps) => {
        const slot = ps.slot || {};
        return {
          workerId: ps.worker_id,
          name: ps.worker_name,
          profilePicture: ps.worker_avatar || ps.profile_picture,
          proposal_id: ps.proposal_id,
          status: ps.status,
          slot: slot,
          is_disputed: ps.status === "disputed",
          uniqueKey: `slot-${ps.proposal_id}-${ps.worker_id}`,
          // Pass along anything else needed
        };
      });
  }, [proposedSlotsData]);

  const [selectedSlotKey, setSelectedSlotKey] = useState(null);

  const { mutate: completeSingleSlot, isPending: isCompleting } =
    useCompleteSingleWorkerSlot();

  const handleSlotPress = (item) => {
    // If slot is already completed or disputed, do nothing
    if (
      item.status === "completed" ||
      item.isWorkerCompleted ||
      item.is_disputed ||
      item.status === "disputed"
    ) {
      return;
    }

    const slotDate = item.slot?.start_date || item.start_date;

    Alert.alert(
      translate("jobs.completeJob"),
      slotDate
        ? translate("jobs.confirmCompletionForSlot", {
            name: item.name,
            date: slotDate.split("T")[0],
          })
        : translate("jobs.confirmCompletionForWorker", { name: item.name }),
      [
        { text: translate("common.cancel"), style: "cancel" },
        {
          text: translate("common.yes"),
          onPress: () => processSlotCompletion(item),
        },
      ],
    );
  };

  const processSlotCompletion = (item) => {
    setSelectedSlotKey(item.uniqueKey);
    completeSingleSlot(
      { jobId, workerId: item.workerId, proposalId: item.proposal_id },
      {
        onSuccess: () => {
          refetch(); // Refresh data from backend to get updated status
          navigateToReview(item);
        },
        onError: () => {
          Alert.alert(
            translate("common.error"),
            translate("jobs.failedToCompleteWorker"),
          );
          setSelectedSlotKey(null);
        },
      },
    );
  };

  const navigateToReview = (item) => {
    setSelectedSlotKey(null);
    navigation.navigate("SubmitReview", {
      jobId,
      jobTitle,
      assignedWorkers: [
        {
          id: item.workerId,
          name: item.name,
          profile_picture: item.profilePicture,
          ...item, // pass along cost details for the cash payments component
        },
      ],
      reviewMandatory: true,
      paymentMode: paymentMode,
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? translate("common.pm") : translate("common.am");
    const formattedH = h % 12 || 12;
    return `${formattedH}:${minutes} ${ampm}`;
  };

  const renderSlot = ({ item }) => {
    const isCompleted = item.status === "completed" || item.isWorkerCompleted;
    const isProcessing = isCompleting && selectedSlotKey === item.uniqueKey;
    const isDisputed = item.is_disputed || item.status === "disputed";

    let statusText = isCompleted
      ? translate("jobs.completed")
      : isDisputed
        ? translate("jobs.disputed")
        : translate("jobs.active");
    let statusStyle = isCompleted
      ? cardStyles.statusCompleted
      : isDisputed
        ? cardStyles.statusDisputed
        : cardStyles.statusActive;

    return (
      <DataCard
        style={[isCompleted && { opacity: 0.6, backgroundColor: "#F9F9F9" }]}
      >
        <View style={cardStyles.rowTop}>
          <Image
            source={
              item.profilePicture
                ? { uri: item.profilePicture }
                : require("../../../assets/images/worker.png")
            }
            style={cardStyles.avatar}
          />
          <View style={{ flex: 1 }}>
            <View style={cardStyles.nameRow}>
              <Text style={cardStyles.name}>{item.name}</Text>
              <View style={[cardStyles.badge, statusStyle]}>
                <Text style={[cardStyles.badgeText, statusStyle]}>
                  {statusText}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {(item.slot || item.start_date) && (
          <View style={cardStyles.slotModernContainer}>
            <View style={cardStyles.slotHeaderRow}>
              <MaterialIcons name="event-note" size={14} color={colors.text1} />
              <Text style={cardStyles.slotTitle}>
                {translate("jobs.slotDetails")}
              </Text>
            </View>
            <View style={cardStyles.slotDetailsGrid}>
              <View style={cardStyles.slotInfoItem}>
                <View style={cardStyles.slotIconBox}>
                  <MaterialIcons name="date-range" size={12} color={colors.tertiary} />
                </View>
                <View>
                  <Text style={cardStyles.slotInfoLabel}>{translate("jobs.duration")}</Text>
                  <Text style={cardStyles.slotInfoValue}>
                    {formatDisplayDate(item.slot?.start_date || item.start_date)} -{" "}
                    {formatDisplayDate(item.slot?.end_date || item.end_date)}
                  </Text>
                </View>
              </View>

              <View style={cardStyles.slotInfoItem}>
                <View style={cardStyles.slotIconBox}>
                  <MaterialIcons name="access-time" size={12} color={colors.tertiary} />
                </View>
                <View>
                  <Text style={cardStyles.slotInfoLabel}>{translate("jobs.shift")}</Text>
                  <Text style={cardStyles.slotInfoValue}>
                    {formatTime(item.slot?.joining_time || item.joining_time)} -{" "}
                    {formatTime(item.slot?.finish_time || item.finish_time)}
                  </Text>
                </View>
              </View>

              <View style={cardStyles.slotInfoItem}>
                <View style={cardStyles.slotIconBox}>
                  <MaterialIcons name="pause-circle-filled" size={12} color={colors.tertiary} />
                </View>
                <View>
                  <Text style={cardStyles.slotInfoLabel}>{translate("jobs.breakTime")}</Text>
                  <Text style={cardStyles.slotInfoValue}>
                    {item.slot?.break_time || item.break_time || "0"}{" "}
                    {(item.slot?.break_time || item.break_time) === "1" ? "min" : "mins"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={cardStyles.footerRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              cardStyles.cta,
              isCompleted || isProcessing || isDisputed
                ? { backgroundColor: colors.bbg6 }
                : { backgroundColor: colors.tertiary },
            ]}
            onPress={() => handleSlotPress(item)}
            disabled={isCompleted || isProcessing || isDisputed}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text
                style={[
                  cardStyles.ctaText,
                  {
                    color:
                      isCompleted || isProcessing || isDisputed
                        ? colors.textdark
                        : "#FFF",
                  },
                ]}
              >
                {translate("jobs.markAsCompleted")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </DataCard>
    );
  };

  return (
    <ScreenWrapper backgroundColor={colors.bg}>
      <CommonHeader
        title={translate("jobs.selectedWorkersList")}
        onBackPress={() => navigation.goBack()}
        backgroundColor={colors.bg1}
      />
      <View style={styles.container}>
        <Text style={styles.headerSubtitle}>
          {translate("jobs.selectSlotToComplete")}
        </Text>

        {isLoadingWorkers ? (
          <ActivityIndicator
            size="large"
            color={colors.tertiary}
            style={{ marginTop: 50 }}
          />
        ) : (
          <FlatList
            data={flattenedSlots}
            keyExtractor={(item) => item.uniqueKey}
            renderItem={renderSlot}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshing={isLoadingWorkers}
            onRefresh={refetch}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text1,
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 20,
    gap: 12,
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
  name: { color: colors.textdark, fontFamily: fonts.semiBold, fontSize: 16 },
  badge: {
    backgroundColor: colors.bbg5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
  },
  statusActive: { color: "#4CAF50", backgroundColor: "#E8F5E9" },
  statusCompleted: { color: "#9E9E9E", backgroundColor: "#F5F5F5" },
  statusDisputed: { color: "#F44336", backgroundColor: "#FFEBEE" },

  slotModernContainer: {
    marginTop: 14,
    backgroundColor: "#F4F9F7",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E1EBE7",
  },
  slotHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 6,
  },
  slotTitle: {
    color: colors.text1,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  slotDetailsGrid: {
    gap: 10,
  },
  slotInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  slotIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  slotInfoLabel: {
    color: colors.text5,
    fontFamily: fonts.medium,
    fontSize: 10,
    marginBottom: 1,
  },
  slotInfoValue: {
    color: colors.textdark,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  footerRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  cta: {
    flex: 1,
    borderRadius: 10,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { fontFamily: fonts.semiBold },
});
