import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { colors, fonts, fontSizes } from "../../theme";
import workerColors from "../../theme/worker/colors";
import { CommonHeader, ScreenWrapper } from "../../components/common";
import { MessageCard } from "../../components/chatting";
import {
  useConversations,
  useInitializeFirebaseUser,
} from "../../hooks/useChat";
import { useTranslation } from "../../hooks/useTranslation";
import { formatFirestoreTime } from "../../utils/dateFormatting";

export default function MessagesScreen() {
  const navigation = useNavigation();
  const user = useSelector((state) => state.Auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const { translate } = useTranslation();

  // Detect if user is a worker
  const isWorker = user?.role === "WORKER";

  // Theme colors based on user role
  const themeColors = useMemo(() => {
    if (isWorker) {
      return {
        headerBg: workerColors.primary.pink,
        headerTitle: workerColors.white,
        screenBg: workerColors.white,
        sectionTitle: workerColors.black,
        countBg: workerColors.ui.screenBackground,
        countText: workerColors.primary.pink,
        loaderColor: workerColors.primary.pink,
        refreshColor: workerColors.primary.pink,
        emptyTitleColor: workerColors.black,
        emptySubtitleColor: workerColors.auth.gray,
        // MessageCard colors
        cardBg: workerColors.ui.screenBackground,
        cardNameColor: workerColors.text.primary,
        cardSnippetColor: workerColors.primary.pink,
        cardTimeColor: workerColors.auth.gray,
        cardBadgeColor: workerColors.auth.darkRed,
        cardUnreadNameColor: workerColors.primary.pink,
        // Navigation screen for chat
        chatScreenName: "WorkerChat",
      };
    }
    return {
      headerBg: colors.bg1,
      headerTitle: "#fff",
      screenBg: colors.bg,
      sectionTitle: colors.textdark,
      countBg: colors.bbg6,
      countText: colors.tertiary,
      loaderColor: colors.tertiary,
      refreshColor: colors.tertiary,
      emptyTitleColor: colors.textdark,
      emptySubtitleColor: colors.text4,
      // MessageCard colors
      cardBg: colors.bbg6,
      cardNameColor: colors.textdark,
      cardSnippetColor: colors.text4,
      cardTimeColor: colors.text4,
      cardBadgeColor: colors.primary,
      cardUnreadNameColor: colors.primary,
      // Navigation screen for chat
      chatScreenName: "ChatScreen",
    };
  }, [isWorker]);

  // Initialize Firebase user on mount
  useInitializeFirebaseUser();

  // Get conversations from Firebase
  const { conversations, loading, error } = useConversations();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Firebase listener will automatically refresh
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleMessagePress = useCallback(
    (conversation) => {
      // Ensure user ID is converted to string for comparison
      const currentUserId = user?.id ? String(user.id) : null;

      // Determine the other participant
      const otherParticipant =
        conversation.participant1Id === currentUserId
          ? {
              id: conversation.participant2Id,
              name: conversation.participant2Name,
              profile_picture: conversation.participant2ProfilePicture,
              email: conversation.participant2Email,
            }
          : {
              id: conversation.participant1Id,
              name: conversation.participant1Name,
              profile_picture: conversation.participant1ProfilePicture,
              email: conversation.participant1Email,
            };

      navigation.navigate(themeColors.chatScreenName, {
        conversationId: conversation.id,
        otherUser: otherParticipant,
      });
    },
    [navigation, user?.id, themeColors.chatScreenName],
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💬</Text>
      <Text style={[styles.emptyTitle, { color: themeColors.emptyTitleColor }]}>
        {translate("chat.noChats")}
      </Text>
      <Text
        style={[
          styles.emptySubtitle,
          { color: themeColors.emptySubtitleColor },
        ]}
      >
        {translate("messages.failedStartConversation")}
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={themeColors.loaderColor} />
      <Text
        style={[styles.loadingText, { color: themeColors.emptySubtitleColor }]}
      >
        {translate("common.loading")}
      </Text>
    </View>
  );

  if (loading && conversations.length === 0) {
    return (
      <ScreenWrapper
        containerStyle={[
          styles.container,
          { backgroundColor: themeColors.screenBg },
        ]}
        edges={["top"]}
        statusBarBackground={themeColors.headerBg}
      >
        <CommonHeader
          title={translate("navigation.messages")}
          onBackPress={() => navigation.goBack?.()}
          backgroundColor={themeColors.headerBg}
          titleColor={themeColors.headerTitle}
        />
        {renderLoadingState()}
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      containerStyle={[
        styles.container,
        { backgroundColor: themeColors.screenBg },
      ]}
      edges={["top"]}
      statusBarBackground={themeColors.headerBg}
    >
      <CommonHeader
        title={translate("navigation.messages")}
        onBackPress={() => navigation.goBack?.()}
        backgroundColor={themeColors.headerBg}
        titleColor={themeColors.headerTitle}
      />
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        directionalLockEnabled={true}
        decelerationRate="normal"
        ListHeaderComponent={() => (
          <View style={styles.headerSection}>
            <Text
              style={[styles.sectionTitle, { color: themeColors.sectionTitle }]}
            >
              {translate("chat.title")}
            </Text>
            {conversations.length > 0 && (
              <Text
                style={[
                  styles.countText,
                  {
                    backgroundColor: themeColors.countBg,
                    color: themeColors.countText,
                  },
                ]}
              >
                {conversations.length}
              </Text>
            )}
          </View>
        )}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.refreshColor}
            colors={[themeColors.refreshColor]}
            progressBackgroundColor={themeColors.countBg}
          />
        }
        renderItem={({ item }) => {
          // Ensure user ID is converted to string for comparison
          const currentUserId = user?.id ? String(user.id) : null;
          const isParticipant1 = item.participant1Id === currentUserId;

          return (
            <MessageCard
              avatarSource={{
                uri: isParticipant1
                  ? item.participant2ProfilePicture
                  : item.participant1ProfilePicture,
              }}
              name={
                isParticipant1 ? item.participant2Name : item.participant1Name
              }
              snippet={
                item.lastMessage || translate("chat.startConversationSnippet")
              }
              timeLabel={
                item.lastMessageTime
                  ? formatFirestoreTime(item.lastMessageTime)
                  : ""
              }
              unreadCount={
                isParticipant1 ? item.unreadCount1 : item.unreadCount2
              }
              onPress={() => handleMessagePress(item)}
              cardBackgroundColor={themeColors.cardBg}
              nameColor={themeColors.cardNameColor}
              snippetColor={themeColors.cardSnippetColor}
              timeColor={themeColors.cardTimeColor}
              unreadBadgeColor={themeColors.cardBadgeColor}
              unreadNameColor={themeColors.cardUnreadNameColor}
            />
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
        scrollEnabled
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  listContent: {
    paddingVertical: 12,
    paddingBottom: 120,
  },
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 3,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
  },
  countText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.semiBold,
    color: colors.tertiary,
    backgroundColor: colors.bbg6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    minHeight: 300,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: fontSizes.md,
    color: colors.text4,
    textAlign: "center",
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  loadingText: {
    marginTop: 12,
    fontSize: fontSizes.md,
    color: colors.text4,
    fontFamily: fonts.regular,
  },
});
