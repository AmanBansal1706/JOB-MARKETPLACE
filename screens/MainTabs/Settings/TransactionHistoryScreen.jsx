import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Platform,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors, fonts, fontSizes } from "../../../theme";
import { CommonHeader, ScreenWrapper } from "../../../components/common";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "../../../hooks/useTranslation";
import { useFetchTransactionHistory } from "../../../services/TransactionServices";
import {
  formatDisplayDate,
  formatDateForDisplay,
  formatDateToAPI,
} from "../../../utils/dateFormatting";

const TAG_STYLES = {
  held: { backgroundColor: "#FFF3CD", color: "#856404" },
  released: { backgroundColor: "#D9F4E9", color: "#198D69" },
  "refund-to-business": { backgroundColor: "#F7D9D9", color: "#C95353" },
};

const createPositionOptions = (translate) => [
  { label: translate("jobs.waiter"), value: "Waiter" },
  { label: translate("jobs.bartender"), value: "Bartender" },
  { label: translate("jobs.chef"), value: "Chef" },
  { label: translate("jobs.cleaner"), value: "Cleaner" },
  { label: translate("jobs.other"), value: "Other" },
];

const createStatusOptions = (translate) => [
  { label: translate("common.held"), value: "held" },
  { label: translate("jobs.released"), value: "released" },
  { label: translate("common.refundToBusiness"), value: "refund-to-business" },
];

export default function TransactionHistoryScreen() {
  const navigation = useNavigation();
  const { translate } = useTranslation();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceTimer = useRef(null);
  const [expandedFilter, setExpandedFilter] = useState(false);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState(null); // "from" or "to"
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);

  const positionOptions = useMemo(
    () => createPositionOptions(translate),
    [translate],
  );
  const statusOptions = useMemo(
    () => createStatusOptions(translate),
    [translate],
  );

  // Debounce search query
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500); // 500ms debounce

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  // Format dates for API
  const dateFromStr = dateFrom ? formatDateToAPI(dateFrom) : "";
  const dateToStr = dateTo ? formatDateToAPI(dateTo) : "";

  // Fetch transactions with dynamic parameters
  const {
    data,
    isPending,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchTransactionHistory(
    { per_page: 100 },
    dateFromStr,
    dateToStr,
    debouncedQuery,
    minAmount,
    maxAmount,
    selectedStatus,
    selectedPosition,
  );

  const transactions = data?.transactions || [];
  const pagination = data?.pagination || {};

  // Local filtering based on filterBy selection
  const filtered = useMemo(() => {
    let rows = transactions;
    return rows;
  }, [transactions]);

  // Memoize the table data array so FlatList doesn't get a new reference every render
  const tableData = useMemo(() => {
    return filtered.length > 0 ? [{ id: "table" }] : [];
  }, [filtered.length]);

  const renderHeader = () => (
    <CommonHeader
      title={translate("settings.transactionHistory")}
      onBackPress={() => navigation.goBack?.()}
      backgroundColor={colors.bg1}
    />
  );

  const hasDateFilters = dateFrom || dateTo;
  const hasAmountFilters = minAmount || maxAmount;
  const hasStatusFilter = selectedStatus;
  const hasPositionFilter = selectedPosition;
  const hasAnyFilters =
    hasDateFilters || hasAmountFilters || hasStatusFilter || hasPositionFilter;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return formatDisplayDate(dateString);
  };

  const formatDateForDisplayLocal = (date) => {
    return formatDateForDisplay(date);
  };

  const getTagType = (status) => {
    if (!status) return "held";
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === "released") return "released";
    if (lowerStatus === "refund-to-business") return "refund-to-business";
    return "held";
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      if (datePickerType === "from") {
        // If "to" is already set and is earlier than the new "from", clear it
        if (dateTo && selectedDate > dateTo) {
          setDateTo(null);
        }
        setDateFrom(selectedDate);
      } else if (datePickerType === "to") {
        // Prevent setting "to" date if it's earlier than "from" date
        if (dateFrom && selectedDate < dateFrom) {
          // Don't set the date if it's before the "from" date
          return;
        }
        setDateTo(selectedDate);
      }
    }

    if (Platform.OS === "android") {
      setDatePickerType(null);
    }
  };

  const openDatePicker = (type) => {
    setDatePickerType(type);
    setShowDatePicker(true);
  };

  const clearAllFilters = () => {
    setDateFrom(null);
    setDateTo(null);
    setMinAmount("");
    setMaxAmount("");
    setSelectedStatus(null);
    setSelectedPosition(null);
    setExpandedFilter(false);
  };

  const renderRow = ({ item }) => {
    const tagType = getTagType(item.status);
    const tagStyle = TAG_STYLES[tagType] || TAG_STYLES.held;
    const formattedDate = formatDate(item.created_at);

    // Map status value to display text (frontend-only mapping)
    const getStatusDisplayText = (status) => {
      const statusMap = {
        held: translate("common.held"),
        released: translate("jobs.released"),
        "refund-to-business": translate("common.refundToBusiness"),
      };
      return statusMap[status] || status;
    };

    return (
      <View>
        {/* Main Row: Date, Amount, Tag */}
        <View style={styles.tableRow}>
          <Text style={styles.cellTx} numberOfLines={1}>
            {formattedDate}
          </Text>
          <Text style={styles.cellAmount} numberOfLines={1}>
            ${item.amount}
          </Text>
          <View
            style={[
              styles.cellTag,
              { backgroundColor: tagStyle.backgroundColor },
            ]}
          >
            <Text
              style={[styles.tagText, { color: tagStyle.color }]}
              numberOfLines={1}
            >
              {getStatusDisplayText(item.status)}
            </Text>
          </View>
        </View>

        {/* Sub Row: Job Name and Transaction ID (Full Width, Not Aligned to Columns) */}
        <View style={styles.tableSubRow}>
          <View style={styles.subRowContent}>
            <Text style={styles.cellJob} numberOfLines={2} ellipsizeMode="tail">
              {item.position}
            </Text>
            <Text
              style={[
                styles.cellDate,
                {
                  color: "grey",
                },
              ]}
              numberOfLines={1}
            >
              #{item.id}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Render the search, filter and section title outside the FlatList so
  // the TextInput doesn't get unmounted/re-mounted by FlatList updates.
  const renderTopControls = () => (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 16,
      }}
    >
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder={translate("settings.searchTransactions")}
          placeholderTextColor="#9AC7B8"
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setExpandedFilter(true)}
          activeOpacity={0.8}
        >
          <Image
            source={require("../../../assets/images/filter.png")}
            style={{
              width: 18,
              height: 18,
              tintColor: hasAnyFilters ? colors.primary : colors.primary,
            }}
            resizeMode="contain"
          />
          {hasAnyFilters && <View style={styles.filterBadge} />}
        </TouchableOpacity>
      </View>

      {/* Compact Filter Chip Display */}
      {hasAnyFilters && !expandedFilter && (
        <View style={styles.compactFilterChipsContainer}>
          {hasDateFilters && (
            <View style={styles.compactFilterChip}>
              <View style={styles.chipContent}>
                <Image
                  source={require("../../../assets/images/calender.png")}
                  style={styles.chipIcon}
                  resizeMode="contain"
                />
                <Text style={styles.chipText} numberOfLines={1}>
                  {formatDateForDisplayLocal(dateFrom) || "From"}
                  {" – "}
                  {formatDateForDisplayLocal(dateTo) || "To"}
                </Text>
              </View>
            </View>
          )}
          {hasAmountFilters && (
            <View style={styles.compactFilterChip}>
              <View style={styles.chipContent}>
                <Text style={styles.chipText} numberOfLines={1}>
                  ${minAmount || "0"} - ${maxAmount || "∞"}
                </Text>
              </View>
            </View>
          )}
          {hasStatusFilter && (
            <View style={styles.compactFilterChip}>
              <View style={styles.chipContent}>
                <Text style={styles.chipText} numberOfLines={1}>
                  {statusOptions.find((s) => s.value === selectedStatus)
                    ?.label || selectedStatus}
                </Text>
              </View>
            </View>
          )}
          {hasPositionFilter && (
            <View style={styles.compactFilterChip}>
              <View style={styles.chipContent}>
                <Text style={styles.chipText} numberOfLines={1}>
                  {positionOptions.find((p) => p.value === selectedPosition)
                    ?.label || selectedPosition}
                </Text>
              </View>
            </View>
          )}
          <View style={styles.chipActions}>
            <TouchableOpacity
              onPress={() => setExpandedFilter(true)}
              style={styles.chipEditBtn}
            >
              <Text style={styles.chipEditText}>✎</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={clearAllFilters}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.chipCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Expanded Filter UI */}
      {expandedFilter && (
        <View style={styles.expandedFilterContainer}>
          <View style={styles.expandedFilterHeader}>
            <Text style={styles.expandedFilterTitle}>
              {translate("support.filters")}
            </Text>
            <TouchableOpacity
              onPress={clearAllFilters}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.expandedFilterClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.filterScrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Date Range Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>
                {translate("support.dateRange")}
              </Text>
              <View style={styles.dateInputRow}>
                <TouchableOpacity
                  style={styles.compactDateField}
                  onPress={() => openDatePicker("from")}
                  activeOpacity={0.7}
                >
                  <Image
                    source={require("../../../assets/images/calender.png")}
                    style={styles.compactDateIcon}
                    resizeMode="contain"
                  />
                  <Text
                    style={[
                      styles.compactDateText,
                      !dateFrom && styles.compactDatePlaceholder,
                    ]}
                  >
                    {dateFrom
                      ? formatDateForDisplayLocal(dateFrom)
                      : translate("common.from")}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.dateSeparator}>–</Text>

                <TouchableOpacity
                  style={styles.compactDateField}
                  onPress={() => openDatePicker("to")}
                  activeOpacity={0.7}
                >
                  <Image
                    source={require("../../../assets/images/calender.png")}
                    style={styles.compactDateIcon}
                    resizeMode="contain"
                  />
                  <Text
                    style={[
                      styles.compactDateText,
                      !dateTo && styles.compactDatePlaceholder,
                    ]}
                  >
                    {dateTo
                      ? formatDateForDisplayLocal(dateTo)
                      : translate("common.to")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Amount Range Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>
                {translate("support.amountRange")}
              </Text>
              <View style={styles.dateInputRow}>
                <TextInput
                  style={styles.amountInput}
                  placeholder={translate("support.minAmount")}
                  placeholderTextColor="#9AC7B8"
                  value={minAmount}
                  onChangeText={setMinAmount}
                  keyboardType="numeric"
                />
                <Text style={styles.dateSeparator}>–</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder={translate("support.maxAmount")}
                  placeholderTextColor="#9AC7B8"
                  value={maxAmount}
                  onChangeText={setMaxAmount}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Status Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>
                {translate("common.status")}
              </Text>
              <View style={styles.optionsGrid}>
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionChip,
                      selectedStatus === option.value &&
                        styles.optionChipSelected,
                    ]}
                    onPress={() =>
                      setSelectedStatus(
                        selectedStatus === option.value ? null : option.value,
                      )
                    }
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        selectedStatus === option.value &&
                          styles.optionChipTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Position Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>
                {translate("jobs.position")}
              </Text>
              <View style={styles.optionsGrid}>
                {positionOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionChip,
                      selectedPosition === option.value &&
                        styles.optionChipSelected,
                    ]}
                    onPress={() =>
                      setSelectedPosition(
                        selectedPosition === option.value ? null : option.value,
                      )
                    }
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        selectedPosition === option.value &&
                          styles.optionChipTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.applyFilterBtn}
            onPress={() => setExpandedFilter(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.applyFilterBtnText}>
              {translate("common.apply")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>
        {translate("settings.transactionHistory")}{" "}
        {pagination.total ? `(${pagination.total})` : ""}
      </Text>
    </View>
  );

  const renderEmptyContent = () => {
    if (isPending && transactions.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (filtered.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {translate("support.noTransactionsFound")}
          </Text>
        </View>
      );
    }

    return null;
  };

  const tableContent = () => {
    if (filtered.length === 0) return null;

    return (
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.th, styles.thTx]}>
            {translate("support.date")}
          </Text>
          <Text style={[styles.th, styles.thAmount]}>
            {translate("support.amount")}
          </Text>
          <Text style={[styles.th, styles.thTag]}>
            {translate("common.status")}
          </Text>
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(it) => `${it.id}`}
          renderItem={renderRow}
          ItemSeparatorComponent={() => <View style={styles.rowSep} />}
          scrollEnabled={false}
          style={styles.tableList}
          nestedScrollEnabled={false}
        />
      </View>
    );
  };

  return (
    <ScreenWrapper backgroundColor={colors.bg}>
      {renderHeader()}

      {renderTopControls()}

      <FlatList
        data={tableData}
        keyExtractor={(item) => `${item.id}`}
        ListHeaderComponent={null}
        renderItem={() => tableContent()}
        ListEmptyComponent={renderEmptyContent}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.flatListContent}
        scrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        scrollEventThrottle={16}
        directionalLockEnabled={true}
        decelerationRate="normal"
        refreshControl={
          <RefreshControl
            refreshing={isPending}
            onRefresh={() => refetch()}
            tintColor={colors.tertiary}
            colors={[colors.tertiary]}
          />
        }
      />

      {showDatePicker && (
        <DateTimePicker
          value={
            datePickerType === "from"
              ? dateFrom || new Date()
              : dateTo || new Date()
          }
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={
            datePickerType === "to" && dateFrom ? dateFrom : undefined
          }
        />
      )}

      {Platform.OS === "ios" && showDatePicker && (
        <View style={styles.datePickerIOSButtonContainer}>
          <TouchableOpacity
            style={styles.datePickerIOSButton}
            onPress={() => setShowDatePicker(false)}
          >
            <Text style={styles.datePickerIOSButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  flatListContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  searchWrap: {
    position: "relative",
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: "#E1F2EC",
    borderRadius: 20,
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.textdark,
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
  },
  filterBtn: {
    position: "absolute",
    right: 12,
    top: 10,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  dropdown: {
    position: "absolute",
    top: 50,
    right: 8,
    minWidth: 160,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 9999,
  },
  dropdownRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    tintColor: colors.primary,
  },
  dropdownText: { fontFamily: fonts.medium, color: colors.textdark },

  // Compact Filter Chips
  compactFilterChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  compactFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipIcon: {
    width: 14,
    height: 14,
    tintColor: colors.primary,
  },
  chipText: {
    color: colors.textdark,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  chipEditBtn: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  chipEditText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  chipCloseText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },

  // Expanded Filter
  expandedFilterContainer: {
    backgroundColor: "#F0FAF7",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    maxHeight: 400,
  },
  filterScrollView: {
    maxHeight: 300,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    color: colors.textdark,
    fontFamily: fonts.semiBold,
    fontSize: 11,
    marginBottom: 8,
    opacity: 0.7,
  },
  expandedFilterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  expandedFilterTitle: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  expandedFilterClose: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "600",
  },
  dateInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  compactDateField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 40,
    gap: 4,
  },
  compactDateIcon: {
    width: 14,
    height: 14,
    tintColor: colors.primary,
  },
  compactDateText: {
    color: colors.textdark,
    fontFamily: fonts.medium,
    fontSize: fontSizes.xs,
    flex: 1,
  },
  compactDatePlaceholder: {
    color: "#9AC7B8",
    fontFamily: fonts.regular,
  },
  dateSeparator: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 2,
    opacity: 0.6,
  },
  applyFilterBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  applyFilterBtnText: {
    color: "#fff",
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  amountInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 40,
    color: colors.textdark,
    fontFamily: fonts.medium,
    fontSize: fontSizes.xs,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  optionChipSelected: {
    backgroundColor: colors.primary,
  },
  optionChipText: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  optionChipTextSelected: {
    color: "#fff",
  },

  datePickerIOSButtonContainer: {
    backgroundColor: "#fff",
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  datePickerIOSButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  datePickerIOSButtonText: {
    color: "#fff",
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },

  sectionTitle: {
    marginTop: 12,
    marginBottom: 8,
    color: colors.textdark,
    fontFamily: fonts.semiBold,
    fontSize: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },

  emptyText: {
    color: colors.textdark,
    opacity: 0.6,
    fontFamily: fonts.medium,
    fontSize: 14,
  },

  table: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginTop: 12,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F7F6",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: -10,
    minHeight: 44,
  },
  th: { color: colors.textdark, fontFamily: fonts.semiBold, fontSize: 11 },
  thTx: { flex: 1, fontSize: 11 },
  thTag: { flex: 1, fontSize: 11, textAlign: "center" },
  thJobWrap: { flex: 1.2, alignItems: "flex-start" },
  thJobLine1: { lineHeight: 14, fontSize: 11 },
  thJobLine2: { lineHeight: 14, marginTop: -2, fontSize: 11 },
  thDate: { flex: 1, fontSize: 11 },
  thAmount: { flex: 1, textAlign: "left", fontSize: 11 },

  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginHorizontal: -10,
    gap: 12,
  },
  tableSubRow: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    marginHorizontal: -10,
    paddingBottom: 10,
  },
  subRowContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cellDateSpacer: {
    flex: 1,
  },
  tableList: { flexGrow: 0 },
  rowSep: { height: 1, backgroundColor: "#EDF3F1" },
  cellDate: {
    color: colors.textdark,
    fontSize: 11,
    fontFamily: fonts.regular,
  },
  cellTx: {
    flex: 1,
    color: colors.textdark,
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
  cellJob: {
    flex: 1,
    color: colors.textdark,
    fontSize: 11,
    fontFamily: fonts.regular,
  },
  cellTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 90,
    maxWidth: 110,
  },
  tagText: { fontFamily: fonts.semiBold, fontSize: 10 },
  cellAmount: {
    flex: 1,
    color: colors.primary,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
