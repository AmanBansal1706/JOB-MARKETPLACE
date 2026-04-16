import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import { colors, fonts, fontSizes } from "../../../theme";
import { CommonHeader, ScreenWrapper } from "../../../components/common";
import { useTranslation } from "../../../hooks/useTranslation";
import { useFetchSupportTickets } from "../../../services/SupportServices";
import { useFetchUserProfile } from "../../../services/ProfileServices";
import {
  formatDisplayDate,
  formatTimeFromDate,
} from "../../../utils/dateFormatting";

export default function SupportHelpScreen({ navigation }) {
  const { translate } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);

  // Fetch support tickets with pagination
  const {
    data: ticketsData,
    isPending: ticketsLoading,
    isError: ticketsError,
    refetch: refetchTickets,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchSupportTickets({ per_page: 20 }, searchQuery, statusFilter);

  const { data: userProfileData, isPending: profileLoading } =
    useFetchUserProfile();

  const isPending = ticketsLoading || profileLoading;

  const tickets = ticketsData?.tickets || [];
  const meta = ticketsData?.meta || {};

  // Create ticket array for FlatList
  const tableData = useMemo(() => {
    return tickets.length > 0
      ? Array.from({ length: tickets.length }, (_, i) => i)
      : [];
  }, [tickets.length]);

  // FAQ items
  const faqs = [
    {
      id: 1,
      title: translate("support.faq1Title"),
      description: translate("support.faq1Desc"),
    },
    {
      id: 2,
      title: translate("support.faq2Title"),
      description: translate("support.faq2Desc"),
    },
    {
      id: 3,
      title: translate("support.faq3Title"),
      description: translate("support.faq3Desc"),
    },
    {
      id: 4,
      title: translate("support.faq4Title"),
      description: translate("support.faq4Desc"),
    },
  ];

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchTickets();
    } finally {
      setRefreshing(false);
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  // Extract ticket status color
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower.includes("pending") || statusLower.includes("open"))
      return colors.buttonbg2;
    if (statusLower.includes("progress")) return colors.buttonbg2;
    if (statusLower.includes("resolved") || statusLower.includes("closed"))
      return colors.bbg5;
    return colors.buttonbg2;
  };

  // Extract ticket status text color
  const getStatusTextColor = () => colors.textdark;

  if (isPending) {
    return (
      <ScreenWrapper statusBarBackground={colors.tertiary}>
        <CommonHeader
          title={translate("support.supportHelpCenter")}
          onBackPress={() => navigation.goBack?.()}
          backgroundColor={colors.tertiary}
        />
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={colors.tertiary} />
          <Text style={styles.loadingText}>
            {translate("support.loadingTickets")}
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Render ticket row
  const renderTicketRow = ({ item: index }) => {
    const ticket = tickets[index];
    if (!ticket) return null;
    const statusLabel =
      ticket.status == "Cancelled"
        ? translate("support.statusCancelled")
        : ticket.status === "Resolved"
          ? translate("support.statusResolved")
          : translate("support.statusPending");

    return (
      <View key={ticket.ticket_id || ticket.id || index}>
        <Pressable
          style={styles.ticketCard}
          onPress={() =>
            navigation.navigate("TicketDetail", { ticketId: ticket.ticket_id })
          }
        >
          {/* Ticket Header */}
          <View style={styles.ticketHeader}>
            <View style={styles.ticketHeaderContent}>
              <Text style={styles.ticketId}>
                {translate("support.ticketId")} #{ticket.ticket_id || ticket.id}
              </Text>
              <Text style={styles.ticketSubject} numberOfLines={2}>
                {ticket.subject || translate("support.supportTicket")}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(ticket.status) },
              ]}
            >
              <Text style={styles.statusBadgeText}>{statusLabel}</Text>
            </View>
          </View>

          {/* Ticket Description */}
          <Text style={styles.ticketDescription} numberOfLines={3}>
            {ticket.description || translate("support.noDescriptionProvided")}
          </Text>

          {/* Ticket Footer */}
          <View style={styles.ticketFooter}>
            <Text style={styles.ticketDate}>
              {ticket.created_at
                ? formatDisplayDate(ticket.created_at)
                : translate("support.notAvailable")}
            </Text>
            <Text style={styles.ticketTime}>
              {ticket.created_at ? formatTimeFromDate(ticket.created_at) : ""}
            </Text>
          </View>
        </Pressable>
      </View>
    );
  };

  // Render footer with loader for pagination
  const renderTicketsFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.tertiary} />
      </View>
    );
  };

  return (
    <ScreenWrapper statusBarBackground={colors.tertiary}>
      <CommonHeader
        title={translate("support.supportHelpCenter")}
        onBackPress={() => navigation.goBack?.()}
        backgroundColor={colors.tertiary}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        directionalLockEnabled={true}
        decelerationRate="normal"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.tertiary}
            colors={[colors.tertiary]}
          />
        }
      >
        <View style={styles.container}>
          {/* FAQ Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>
              {translate("settings.faqTitle")}
            </Text>
            <View style={styles.faqContainer}>
              {faqs.map((faq) => {
                const isOpen = expandedFaq === faq.id;
                return (
                  <Pressable
                    key={faq.id}
                    style={[styles.faqCard, isOpen && styles.faqCardOpen]}
                    onPress={() =>
                      setExpandedFaq((p) => (p === faq.id ? null : faq.id))
                    }
                  >
                    <View style={styles.faqContent}>
                      <Text style={styles.faqTitle}>{faq.title}</Text>
                      <Text
                        style={styles.faqPreview}
                        numberOfLines={isOpen ? undefined : 1}
                      >
                        {faq.description}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.faqChevron,
                        isOpen && styles.faqChevronOpen,
                      ]}
                    >
                      {isOpen ? "−" : "›"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Support Tickets Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>
              {translate("support.yourSupportTickets")}
            </Text>

            {tickets && tickets.length > 0 ? (
              <View style={styles.ticketsContainer}>
                <FlatList
                  data={tableData}
                  renderItem={renderTicketRow}
                  keyExtractor={(index) => `ticket-${index}`}
                  scrollEnabled={false}
                  ListFooterComponent={renderTicketsFooter}
                  onEndReached={handleLoadMore}
                  onEndReachedThreshold={0.3}
                />
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📭</Text>
                <Text style={styles.emptyStateText}>
                  {translate("support.noTicketsYet")}
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  {translate("support.raiseFirstTicket")}
                </Text>
              </View>
            )}

            {ticketsError && (
              <View style={styles.errorState}>
                <Text style={styles.errorText}>
                  {translate("support.failedLoadTickets")}
                </Text>
                <Pressable
                  style={styles.retryBtn}
                  onPress={() => refetchTickets()}
                >
                  <Text style={styles.retryBtnText}>
                    {translate("support.retry")}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Raise New Ticket Button */}
      <View style={styles.bottomBar} pointerEvents="box-none">
        <TouchableOpacity
          style={[styles.cta, isPending && { opacity: 0.6 }]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("RaiseTicket")}
          disabled={isPending}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          {isPending ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <Text style={styles.ctaText}>
              {translate("support.raiseNewTicket")}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  container: {
    padding: 16,
    backgroundColor: colors.bg,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textdark,
    marginTop: 12,
  },

  // Section Styles
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.lg,
    color: colors.textdark,
    marginBottom: 12,
  },

  // FAQ Styles
  faqContainer: {
    borderRadius: 16,
    overflow: "hidden",
  },
  faqCard: {
    backgroundColor: colors.text,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderLeftWidth: 4,
    borderLeftColor: colors.tertiary,
  },
  faqContent: {
    flex: 1,
    marginRight: 8,
  },
  faqTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.sm,
    color: colors.textdark,
    marginBottom: 4,
  },
  faqPreview: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.xs,
    color: colors.text1,
    lineHeight: 16,
  },
  faqChevron: {
    fontSize: 20,
    color: colors.tertiary,
    marginTop: 2,
  },
  faqCardOpen: {
    backgroundColor: colors.bbg6,
  },
  faqChevronOpen: {
    color: colors.bbg4,
  },

  // Tickets Container
  ticketsContainer: {
    borderRadius: 16,
  },

  // Ticket Card Styles
  ticketCard: {
    backgroundColor: colors.text,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: colors.tertiary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    marginBottom: 10,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  ticketHeaderContent: {
    flex: 1,
    marginRight: 10,
  },
  ticketId: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.xs,
    color: colors.text1,
    marginBottom: 4,
  },
  ticketSubject: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.sm,
    color: colors.textdark,
    lineHeight: 18,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 70,
  },
  statusBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.xs,
    color: colors.text,
    textAlign: "center",
  },
  ticketDescription: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.text1,
    lineHeight: 18,
    marginBottom: 10,
  },
  ticketFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.bg,
  },
  ticketDate: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.xs,
    color: colors.text1,
  },
  ticketTime: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.xs,
    color: colors.text1,
  },

  // Empty State
  emptyState: {
    backgroundColor: colors.text,
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.tertiary,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.md,
    color: colors.textdark,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.text1,
    textAlign: "center",
  },

  // Error State
  errorState: {
    backgroundColor: colors.text,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.bbg4,
    marginTop: 12,
  },
  errorText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.md,
    color: colors.bbg4,
    marginBottom: 12,
  },
  retryBtn: {
    backgroundColor: colors.tertiary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  retryBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.sm,
    color: colors.text,
  },

  // Pagination
  rowSep: {
    height: 1,
    backgroundColor: "#EDF3F1",
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },

  // Bottom Bar & CTA
  bottomBar: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    zIndex: 20,
    elevation: 6,
  },
  cta: {
    backgroundColor: colors.tertiary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  ctaText: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.md,
  },
});
