import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform,
  ScrollView,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import colors from "../../../theme/worker/colors";
import { useFetchWorkerTransactions } from "../../../services/WorkerJobServices";
import { useTranslation } from "../../../hooks/useTranslation";
import {
  formatDisplayDate,
  formatDateForDisplay,
  formatDateToAPI,
} from "../../../utils/dateFormatting";

const TAG_STYLES = {
  completed: { backgroundColor: "#D9F4E9", color: "#198D69" },
  pending: { backgroundColor: "#FFF3CD", color: "#856404" },
  refunded: { backgroundColor: "#F7D9D9", color: "#C95353" },
};

const fonts = {
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semiBold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
};

export default function TransactionHistoryScreen() {
  const navigation = useNavigation();
  const { translate } = useTranslation();

  // Search and filter states
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceTimer = useRef(null);
  const [expandedFilter, setExpandedFilter] = useState(false);

  // Filter states
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState(null); // "from" or "to"
  const [jobTitleFilter, setJobTitleFilter] = useState("");
  const [businessNameFilter, setBusinessNameFilter] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  // Debounce search query
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  // Format dates for API
  const dateFromStr = dateFrom ? formatDateToAPI(dateFrom) : null;
  const dateToStr = dateTo ? formatDateToAPI(dateTo) : null;

  // Fetch transactions with dynamic parameters
  const {
    data,
    isPending,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchWorkerTransactions(
    { limit: 20 },
    dateFromStr,
    dateToStr,
    debouncedQuery || jobTitleFilter || null,
    businessNameFilter || null,
    minAmount || null,
    maxAmount || null,
  );

  const transactions = data?.transactions || [];
  const meta = data?.meta || {};

  const hasDateFilters = dateFrom || dateTo;
  const hasJobTitleFilter = jobTitleFilter.trim() !== "";
  const hasBusinessNameFilter = businessNameFilter.trim() !== "";
  const hasAmountFilter = minAmount.trim() !== "" || maxAmount.trim() !== "";
  const hasAnyFilters =
    hasDateFilters ||
    hasJobTitleFilter ||
    hasBusinessNameFilter ||
    hasAmountFilter;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return formatDisplayDate(dateString);
  };

  const formatDateForDisplayLocal = (date) => {
    return formatDateForDisplay(date);
  };

  const getTagType = (status) => {
    if (!status) return "pending";
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === "completed") return "completed";
    if (lowerStatus === "refunded") return "refunded";
    return "pending";
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      if (datePickerType === "from") {
        if (dateTo && selectedDate > dateTo) {
          setDateTo(null);
        }
        setDateFrom(selectedDate);
      } else if (datePickerType === "to") {
        if (dateFrom && selectedDate < dateFrom) {
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
    setJobTitleFilter("");
    setBusinessNameFilter("");
    setMinAmount("");
    setMaxAmount("");
    setQuery("");
    setExpandedFilter(false);
  };

  const renderHeader = () => (
    <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {translate("settings.transactionHistory")}
        </Text>
      </View>
    </SafeAreaView>
  );

  const renderRow = ({ item }) => {
    const status = item.transaction_status || "pending";
    const tagType = getTagType(status);
    const tagStyle = TAG_STYLES[tagType] || TAG_STYLES.pending;
    const formattedDate = formatDate(item.date);

    return (
      <View>
        <View style={styles.tableRow}>
          <Text style={styles.cellTx} numberOfLines={1}>
            {formattedDate}
          </Text>
          <Text style={styles.cellAmount} numberOfLines={1}>
            ${item.amount || "0"}
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
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.tableSubRow}>
          <View style={styles.subRowContent}>
            <Text style={styles.cellJob} numberOfLines={2} ellipsizeMode="tail">
              {item.job_name || "N/A"}
            </Text>
            <Text
              style={[styles.cellDate, { color: "grey" }]}
              numberOfLines={1}
            >
              #{item.transaction_id || "N/A"}
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
        <ActivityIndicator size="small" color={colors.primary.pink} />
      </View>
    );
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderTopControls = () => (
    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder={translate("settings.searchTransactions")}
          placeholderTextColor="#B91C5080"
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
              tintColor: colors.primary.pink,
            }}
            resizeMode="contain"
          />
          {hasAnyFilters && <View style={styles.filterBadge} />}
        </TouchableOpacity>
      </View>

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
          {hasJobTitleFilter && (
            <View style={styles.compactFilterChip}>
              <View style={styles.chipContent}>
                <Text style={styles.chipText} numberOfLines={1}>
                  {jobTitleFilter}
                </Text>
              </View>
            </View>
          )}
          {hasBusinessNameFilter && (
            <View style={styles.compactFilterChip}>
              <View style={styles.chipContent}>
                <Text style={styles.chipText} numberOfLines={1}>
                  {businessNameFilter}
                </Text>
              </View>
            </View>
          )}
          {hasAmountFilter && (
            <View style={styles.compactFilterChip}>
              <View style={styles.chipContent}>
                <Text style={styles.chipText} numberOfLines={1}>
                  ${minAmount || "0"} – ${maxAmount || "∞"}
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
            <TouchableOpacity onPress={clearAllFilters}>
              <Text style={styles.chipCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {expandedFilter && (
        <View style={styles.expandedFilterContainer}>
          <View style={styles.expandedFilterHeader}>
            <Text style={styles.expandedFilterTitle}>
              {translate("support.filters")}
            </Text>
            <TouchableOpacity onPress={() => setExpandedFilter(false)}>
              <Text style={styles.expandedFilterClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.filterScrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>
                {translate("workerTransactions.jobTitle")}
              </Text>
              <TextInput
                style={styles.amountInput}
                placeholder={translate("workerTransactions.enterJobTitle")}
                placeholderTextColor="#B91C5080"
                value={jobTitleFilter}
                onChangeText={setJobTitleFilter}
              />
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>
                {translate("workerTransactions.businessName")}
              </Text>
              <TextInput
                style={styles.amountInput}
                placeholder={translate("workerTransactions.enterBusinessName")}
                placeholderTextColor="#B91C5080"
                value={businessNameFilter}
                onChangeText={setBusinessNameFilter}
              />
            </View>

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

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>
                {translate("workerTransactions.amountRange")}
              </Text>
              <View style={styles.dateInputRow}>
                <TextInput
                  style={styles.amountInput}
                  placeholder={translate("workerTransactions.min")}
                  placeholderTextColor="#B91C5080"
                  value={minAmount}
                  onChangeText={setMinAmount}
                  keyboardType="numeric"
                />
                <Text style={styles.dateSeparator}>–</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder={translate("workerTransactions.max")}
                  placeholderTextColor="#B91C5080"
                  value={maxAmount}
                  onChangeText={setMaxAmount}
                  keyboardType="numeric"
                />
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
        {meta.total ? `(${meta.total})` : ""}
      </Text>
    </View>
  );

  const renderEmptyContent = () => {
    if (isPending && transactions.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.pink} />
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {hasAnyFilters
            ? translate("workerTransactions.noTransactionsFilter")
            : translate("workerTransactions.transactionHistoryEmpty")}
        </Text>
      </View>
    );
  };

  const tableData = useMemo(() => {
    return transactions.length > 0 ? [{ id: "table" }] : [];
  }, [transactions.length]);

  const tableContent = () => {
    if (transactions.length === 0) return null;

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
          data={transactions}
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
    <View style={styles.mainContainer}>
      <StatusBar style="light" backgroundColor={colors.primary.pink} />
      {renderHeader()}
      {renderTopControls()}
      <FlatList
        data={tableData}
        keyExtractor={(item) => `${item.id}`}
        renderItem={() => tableContent()}
        ListEmptyComponent={renderEmptyContent}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.flatListContent}
        refreshControl={
          <RefreshControl
            refreshing={isPending}
            onRefresh={() => refetch()}
            tintColor={colors.primary.pink}
            colors={[colors.primary.pink]}
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
            <Text style={styles.datePickerIOSButtonText}>
              {translate("workerTransactions.done")}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  backButton: {
    marginRight: 15,
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
    fontFamily: fonts.semiBold,
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
    backgroundColor: colors.ui.searchBarBackground,
    borderRadius: 20,
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.text.primary,
    fontFamily: fonts.medium,
    fontSize: 14,
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
    backgroundColor: colors.primary.pink,
  },
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
    borderColor: colors.primary.pink,
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
    tintColor: colors.primary.pink,
  },
  chipText: {
    color: colors.text.primary,
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
    color: colors.primary.pink,
    fontSize: 14,
    fontWeight: "600",
  },
  chipCloseText: {
    color: colors.primary.pink,
    fontSize: 16,
    fontWeight: "600",
  },
  expandedFilterContainer: {
    backgroundColor: colors.ui.selectedBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.pink,
    maxHeight: 400,
  },
  filterScrollView: {
    maxHeight: 300,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    color: colors.text.primary,
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
    color: colors.primary.pink,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  expandedFilterClose: {
    color: colors.primary.pink,
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
    borderColor: colors.primary.pink,
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 40,
    gap: 4,
  },
  compactDateIcon: {
    width: 14,
    height: 14,
    tintColor: colors.primary.pink,
  },
  compactDateText: {
    color: colors.text.primary,
    fontFamily: fonts.medium,
    fontSize: 12,
    flex: 1,
  },
  compactDatePlaceholder: {
    color: "#B91C5080",
    fontFamily: fonts.regular,
  },
  dateSeparator: {
    color: colors.primary.pink,
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 2,
    opacity: 0.6,
  },
  applyFilterBtn: {
    backgroundColor: colors.primary.pink,
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
    borderColor: colors.primary.pink,
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 40,
    color: colors.text.primary,
    fontFamily: fonts.medium,
    fontSize: 12,
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
    backgroundColor: colors.primary.pink,
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
    color: colors.text.primary,
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
    color: colors.text.primary,
    opacity: 0.6,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  table: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    paddingTop: 0,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginTop: 12,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.searchBarBackground,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: -10,
    minHeight: 44,
  },
  th: { color: colors.text.primary, fontFamily: fonts.semiBold, fontSize: 11 },
  thTx: { flex: 1.5, fontSize: 11 },
  thTag: { flex: 1.8, fontSize: 11, textAlign: "center" },
  thAmount: { flex: 1.5, textAlign: "left", fontSize: 11 },
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
  tableList: { flexGrow: 0 },
  rowSep: { height: 1, backgroundColor: colors.ui.lighterBorder },
  cellDate: {
    color: colors.text.primary,
    fontSize: 11,
    fontFamily: fonts.regular,
  },
  cellTx: {
    flex: 1.5,
    color: colors.text.primary,
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
  cellJob: {
    flex: 1,
    color: colors.text.primary,
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
    flex: 1.8,
  },
  tagText: { fontFamily: fonts.semiBold, fontSize: 10 },
  cellAmount: {
    flex: 1.5,
    color: colors.primary.pink,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
