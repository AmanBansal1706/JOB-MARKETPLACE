import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, fontSizes } from "../../../theme";
import { CommonHeader, ScreenWrapper } from "../../../components/common";
import LoadingState from "../../../components/LoadingState";
import CustomAlert from "../../../components/CustomAlert";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { useTranslation } from "../../../hooks/useTranslation";
import {
  useFetchSingleSupportTicket,
  useCancelSupportTicket,
} from "../../../services/SupportServices";
import { formatDisplayDateTime } from "../../../utils/dateFormatting";

export default function TicketDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const scrollViewRef = React.useRef(null);
  const { translate } = useTranslation();

  const { ticketId } = route.params;

  const [refreshing, setRefreshing] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);

  const {
    data: ticketData,
    isPending: ticketLoading,
    error: ticketError,
    refetch,
  } = useFetchSingleSupportTicket(ticketId);

  const { mutate: cancelTicket, isPending: cancelLoading } =
    useCancelSupportTicket();

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (ticketId) {
        refetch();
      }
    }, [ticketId])
  );

  // Handle cancel ticket
  const handleCancelTicket = () => {
    setShowCancelAlert(true);
  };

  const confirmCancelTicket = () => {
    cancelTicket(ticketId, {
      onSuccess: (response) => {
        setShowCancelAlert(false);
        Alert.alert(
          translate("common.success"),
          response.message || "Ticket cancelled successfully",
          [
            {
              text: translate("common.ok"),
              onPress: () => {
                refetch();
                navigation.goBack();
              },
            },
          ]
        );
      },
      onError: (error) => {
        setShowCancelAlert(false);
        Alert.alert(
          translate("common.error"),
          error.message || "Failed to cancel ticket"
        );
      },
    });
  };

  // Handle error state
  if (ticketError) {
    return (
      <ScreenWrapper statusBarBackground={colors.tertiary}>
        <CommonHeader
          title={translate("support.ticketDetails")}
          onBackPress={() => navigation.goBack()}
          backgroundColor={colors.tertiary}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {ticketError.message || "Failed to load ticket details"}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>
              {translate("common.retry")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  // Loading state
  if (ticketLoading) {
    return (
      <LoadingState
        title={translate("support.ticketDetails")}
        message={`${translate("common.loading")} ${translate("support.ticketInfo")}...`}
        backgroundColor={colors.bg}
      />
    );
  }

  if (!ticketData) {
    return (
      <ScreenWrapper statusBarBackground={colors.tertiary}>
        <CommonHeader
          title={translate("support.ticketDetails")}
          onBackPress={() => navigation.goBack()}
          backgroundColor={colors.tertiary}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {translate("support.ticketNotFound")}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>
              {translate("common.retry")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  const formatDate = formatDisplayDateTime;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return colors.bbg3;
      case "pending":
        return colors.bbg5;
      case "cancelled":
        return colors.bbg4;
      case "resolved":
        return colors.primary;
      default:
        return colors.tertiary;
    }
  };

  const getStatusTranslation = (status) => {
    const statusMap = {
      open: translate("support.statusOpen"),
      pending: translate("support.statusPending"),
      cancelled: translate("support.statusCancelled"),
      resolved: translate("support.statusResolved"),
    };
    return statusMap[status?.toLowerCase()] || status;
  };

  const canCancel = ticketData?.status?.toLowerCase() === "pending";

  return (
    <ScreenWrapper statusBarBackground={colors.tertiary}>
      <CommonHeader
        title={translate("support.ticketDetails")}
        onBackPress={() => navigation.goBack()}
        backgroundColor={colors.tertiary}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(32, insets.bottom + 16) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          scrollEnabled={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                try {
                  await refetch();
                } finally {
                  setRefreshing(false);
                }
              }}
              tintColor={colors.tertiary}
              colors={[colors.tertiary]}
            />
          }
        >
          <View style={styles.container}>
            {/* Status Section - Prominent Display */}
            <View style={styles.statusSection}>
              <Text style={styles.statusLabel}>
                {translate("common.status")}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(ticketData.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {getStatusTranslation(ticketData.status)}
                </Text>
              </View>
            </View>

            {/* Ticket ID Section */}
            <View style={styles.section}>
              <Text style={styles.label}>{translate("support.ticketId")}</Text>
              <View style={styles.infoBox}>
                <Text style={styles.infoValue}>#{ticketData.ticket_id}</Text>
              </View>
            </View>

            {/* Subject Section */}
            <View style={styles.section}>
              <Text style={styles.label}>{translate("support.subject")}</Text>
              <View style={styles.infoBox}>
                <Text style={styles.infoValue}>{ticketData.subject}</Text>
              </View>
            </View>

            {/* Description Section */}
            <View style={styles.section}>
              <Text style={styles.label}>
                {translate("support.description")}
              </Text>
              <View style={[styles.infoBox, styles.multilineBox]}>
                <Text style={styles.infoValue}>{ticketData.description}</Text>
              </View>
            </View>

            {/* Media Attachment */}
            {ticketData.media && (
              <View style={styles.section}>
                <Text style={styles.label}>
                  {translate("support.attachment")}
                </Text>
                <Image
                  source={{ uri: ticketData.media }}
                  style={styles.mediaImage}
                />
              </View>
            )}

            {/* Created Date Section */}
            <View style={styles.section}>
              <Text style={styles.label}>
                {translate("support.createdDate")}
              </Text>
              <View style={styles.infoBox}>
                <Text style={styles.infoValue}>
                  {formatDate(ticketData.created_at)}
                </Text>
              </View>
            </View>

            {/* Cancel Button */}
            {canCancel && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    cancelLoading && styles.cancelButtonDisabled,
                  ]}
                  onPress={handleCancelTicket}
                  disabled={cancelLoading}
                >
                  <Text style={styles.cancelButtonText}>
                    {cancelLoading
                      ? translate("support.cancelling")
                      : translate("support.cancelTicket")}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Cancel Confirmation Alert */}
      <CustomAlert
        visible={showCancelAlert}
        title={translate("support.cancelTicket")}
        message={translate("support.cancelConfirmMessage")}
        buttonText={translate("common.yes")}
        secondaryButtonText={translate("common.no")}
        onConfirm={confirmCancelTicket}
        onSecondaryClose={() => setShowCancelAlert(false)}
        onClose={() => setShowCancelAlert(false)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#E8F5F0",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  container: {
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.tertiary,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: colors.tertiary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    minWidth: 120,
  },
  retryButtonText: {
    color: "white",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  statusSection: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.sm,
    color: colors.textdark,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: "white",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.sm,
    color: colors.textdark,
    marginBottom: 8,
  },
  infoBox: {
    backgroundColor: colors.text,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  multilineBox: {
    minHeight: 80,
  },
  infoValue: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textdark,
    lineHeight: 20,
  },
  mediaImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    resizeMode: "cover",
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  cancelButton: {
    backgroundColor: colors.bbg4,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    minHeight: 48,
  },
  cancelButtonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.md,
    color: "white",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
