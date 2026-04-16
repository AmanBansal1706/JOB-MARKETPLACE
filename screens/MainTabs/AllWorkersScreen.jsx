import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  Linking,
  Platform,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CommonHeader, ScreenWrapper } from "../../components/common";
import { colors, fonts } from "../../theme";
import { useTranslation } from "../../hooks/useTranslation";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import ApplicantFilterModal from "../../components/jobs/ApplicantFilterModal";
import InviteWorkerModal from "../../components/jobs/InviteWorkerModal";
import { useSearchWorkers } from "../../services/JobServices";
import useDebounce from "../../hooks/useDebounce";

export default function AllWorkersScreen() {
  const navigation = useNavigation();
  const { translate } = useTranslation();
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    position_id: null,
    experience_level: null,
    min_rating: null,
    radius_km: null,
  });
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 500);

  const [isInviteVisible, setIsInviteVisible] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState({ id: null, name: "" });

  const handleOpenMap = (address) => {
    if (!address) return;

    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });
    const url = Platform.select({
      ios: `${scheme}${address}`,
      android: `${scheme}${address}`,
    });

    Linking.openURL(url).catch((err) => {
      console.error("An error occurred", err);
      Alert.alert(
        translate("common.error") || "Error",
        translate("common.couldNotOpenMap") || "Could not open map app",
      );
    });
  };

  const queryParams = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch,
    }),
    [filters, debouncedSearch],
  );

  const {
    data,
    isPending,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useSearchWorkers(queryParams);

  const workers = data?.workers || [];
  const totalResults = data?.pagination?.total || 0;

  const renderWorkerCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image
          source={{
            uri:
              item.profile_picture ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=005943&color=FFFFFF&size=128`,
          }}
          style={styles.workerImage}
        />
        <View style={styles.headerText}>
          <Text style={styles.workerName}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons
                  key={s}
                  name="star"
                  size={16}
                  color={
                    s <= Math.round(item.avg_rating || 0)
                      ? "#FFB300"
                      : "#E0E0E0"
                  }
                />
              ))}
            </View>
            <Text style={styles.reviewsText}>
              {Number(item.avg_rating || 0).toFixed(1)}(
              {item.reviews_count || 0} reviews)
            </Text>
          </View>
          <View style={styles.badgesRow}>
            {item.position && (
              <View style={styles.positionBadge}>
                <Text style={styles.positionBadgeText}>
                  {translate("jobs.position") || "Position"} - {item.position}
                </Text>
              </View>
            )}
            {item.experience && (
              <View style={styles.expBadge}>
                <Image
                  source={require("../../assets/images/score.png")}
                  style={styles.scoreIcon}
                />
                <Text style={styles.expBadgeText}>
                  {translate(`experience.${item.experience}`) ||
                    item.experience}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <Text style={styles.bioText} numberOfLines={3}>
        {item.bio ? `“${item.bio}”` : "No bio available"}
      </Text>

      <TouchableOpacity
        style={styles.areaRow}
        onPress={() => item.address && handleOpenMap(item.address)}
        activeOpacity={0.7}
      >
        <Ionicons
          name="location"
          size={16}
          color="#D32F2F"
          style={{ marginTop: 2 }}
        />
        <Text style={styles.areaLabel}>Area :</Text>
        <Text style={styles.areaText}>{item.address || "N/A"}</Text>
      </TouchableOpacity>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.viewProfileButton}
          onPress={() =>
            navigation.navigate("ApplicantProfile", { workerId: item.id })
          }
        >
          <Text style={styles.viewProfileButtonText}>View Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.inviteButton}
          onPress={() => {
            setSelectedWorker({
              id: item.id,
              name: item.name || "Worker",
            });
            setIsInviteVisible(true);
          }}
        >
          <Text style={styles.inviteButtonText}>Invite</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.tertiary} />
      </View>
    );
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <ScreenWrapper backgroundColor={colors.bg}>
      <CommonHeader
        title={translate("home.allWorkers") || "All Workers"}
        onBackPress={() => navigation.goBack()}
        backgroundColor={colors.bg1}
      />
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
            />
            {!searchText && (
              <View style={styles.placeholderContainer} pointerEvents="none">
                <Text style={styles.searchPlaceholder}>
                  Search{" "}
                  <Text style={styles.boldSearchText}>applicants...</Text>
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={() => setIsFilterVisible(true)}>
            <Ionicons name="funnel-outline" size={20} color={colors.text5} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.resultsCount}>
        {isPending && workers.length === 0
          ? "Loading..."
          : `Showing all ${totalResults} applications`}
      </Text>

      {isError ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            {error?.message || "An error occurred"}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={workers}
          renderItem={renderWorkerCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            !isPending && (
              <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>No workers found</Text>
              </View>
            )
          }
          refreshing={isPending && workers.length === 0}
          onRefresh={refetch}
        />
      )}

      <ApplicantFilterModal
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        filters={filters}
        onApplyFilters={(newFilters) => {
          setFilters(newFilters);
        }}
      />

      <InviteWorkerModal
        visible={isInviteVisible}
        onClose={() => setIsInviteVisible(false)}
        workerId={selectedWorker.id}
        workerName={selectedWorker.name}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  searchSection: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.home.cardLight,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.applicants.searchBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text1,
    paddingVertical: 0,
    height: "100%",
  },
  searchPlaceholder: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text1,
  },
  boldSearchText: {
    fontFamily: fonts.bold,
    color: colors.tertiary,
  },
  placeholderContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  resultsCount: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text1,
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 10,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: colors.applicants.cardBg,
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: 15,
  },
  workerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  workerName: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: "#000",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  stars: {
    flexDirection: "row",
    marginRight: 5,
  },
  reviewsText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.applicants.ratingText,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  positionBadge: {
    backgroundColor: colors.applicants.badgePositionBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    marginRight: 8,
    marginBottom: 5,
  },
  positionBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.applicants.badgePositionText,
  },
  expBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.applicants.badgeExpBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    marginBottom: 5,
  },
  expBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.applicants.badgeExpText,
    marginLeft: 3,
  },
  scoreIcon: {
    width: 14,
    height: 14,
    resizeMode: "contain",
  },
  bioText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text1,
    fontStyle: "italic",
    marginBottom: 15,
    lineHeight: 20,
  },
  areaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  areaLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: "#000",
    marginLeft: 5,
    marginRight: 5,
  },
  areaText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text5,
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  viewProfileButton: {
    backgroundColor: colors.tertiary,
    flex: 0.48,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  viewProfileButtonText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: "#FFF",
  },
  inviteButton: {
    backgroundColor: colors.tertiary,
    flex: 0.48,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  inviteButtonText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: "#FFF",
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  errorText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.error || "#D32F2F",
    marginBottom: 20,
  },
  emptyText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.text5,
  },
  retryButton: {
    backgroundColor: colors.tertiary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: "#FFF",
  },
});
