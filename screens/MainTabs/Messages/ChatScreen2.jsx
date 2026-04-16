import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Keyboard,
  Platform,
  Dimensions,
  Text,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { useTranslation } from "../../../hooks/useTranslation";
import {
  ChatHeader2,
  ChatBubble2,
  ChatInputBar2,
  MediaPickerModal2,
  UploadProgressBar2,
} from "../../../components/chatting2";
import LoadingState from "../../../components/LoadingState";
import {
  useMessages,
  useSendMessage,
  useSendMediaMessage,
} from "../../../hooks/useChat";
import {
  formatDisplayDate,
  resolveFirestoreDate,
  getDateSeparatorLabel,
  getChatTimeDisplay,
} from "../../../utils/dateFormatting";
import { colors, fonts, fontSizes } from "../../../theme";
import workerColors from "../../../theme/worker/colors";

/**
 * ChatScreen2 — Business & Worker unified chat screen.
 *
 * Key architectural decisions that make this work on ALL devices
 * (with or without hardware/software bottom navigation):
 *
 * 1. NO absolute positioning for the input bar.
 * 2. Header lives outside the scrolling body with safe-area top inset applied.
 * 3. Keyboard handling uses overlap-based input lift (measure input vs keyboard
 *    top) so it adapts to both resize and non-resize Android keyboard modes.
 * 4. useSafeAreaInsets() provides the correct top/bottom padding —
 *    including the bottom navigation bar on gesture-less Android phones.
 * 5. Stable body layout with bottom safe-area padding avoids permanent shifts.
 * 6. FlatList auto-scrolls to the latest message via onContentSizeChange.
 */
export default function ChatScreen2() {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);
  const inputWrapperRef = useRef(null);
  const keyboardTopYRef = useRef(null);
  const keyboardVisibleRef = useRef(false);

  const route = useRoute();
  const navigation = useNavigation();
  const { translate } = useTranslation();
  const currentUser = useSelector((state) => state.Auth.user);
  const { conversationId, otherUser } = route.params || {};

  const isWorker = currentUser?.role === "WORKER";

  // ─── Theme ──────────────────────────────────────────────────────────────────
  const themeColors = useMemo(() => {
    if (isWorker) {
      return {
        screenBg: workerColors.white,
        headerBg: workerColors.primary.pink,
        headerText: workerColors.white,
        headerSubtitle: "rgba(255,255,255,0.8)",
        separatorBadgeBg: workerColors.auth.darkRed,
        separatorText: workerColors.white,
        emptyTextColor: workerColors.text.secondary,
        statusBarStyle: "light",
        bubbleMeColor: workerColors.ui.chatBubbleRight,
        bubbleOtherColor: workerColors.ui.chatBubbleLeft,
        bubbleTextColor: workerColors.text.primary,
        bubbleSenderNameColor: workerColors.black,
        bubbleTimeColor: workerColors.text.secondary,
        inputBackgroundColor: workerColors.white,
        inputTextColor: workerColors.text.primary,
        inputPlaceholderColor: "#999",
        sendButtonColor: workerColors.auth.darkRed,
        sendButtonDisabledColor: workerColors.ui.buttonGray,
        inputBorderColor: workerColors.ui.lightBorder,
        showInputBorder: true,
        uploadBgColor: workerColors.ui.screenBackground,
        uploadProgressColor: workerColors.primary.pink,
        uploadTextColor: workerColors.text.primary,
        modalBackgroundColor: workerColors.white,
        modalHeaderBackgroundColor: workerColors.white,
        modalHeaderBorderColor: workerColors.ui.lightBorder,
        modalTitleColor: workerColors.black,
        modalHandleColor: workerColors.ui.lightBorder,
        modalOptionButtonBg: workerColors.white,
        modalOptionLabelColor: workerColors.text.primary,
        modalOptionSubtitleColor: workerColors.text.secondary,
        modalCancelButtonBg: workerColors.ui.screenBackground,
        modalCancelButtonText: workerColors.text.primary,
        modalOverlayColor: "rgba(0,0,0,0.5)",
        inputBarBorderTopColor: workerColors.ui.lightBorder,
      };
    }
    return {
      screenBg: colors.bg,
      headerBg: colors.bg1,
      headerText: "#fff",
      headerSubtitle: "#D5F1EA",
      separatorBadgeBg: "#005F40",
      separatorText: "#fff",
      emptyTextColor: colors.text4,
      statusBarStyle: "light",
      bubbleMeColor: "#B9F3E0",
      bubbleOtherColor: "#A9C1BC",
      bubbleTextColor: colors.textdark,
      bubbleSenderNameColor: colors.textdark,
      bubbleTimeColor: colors.text4,
      inputBackgroundColor: colors.bbg6,
      inputTextColor: colors.textdark,
      inputPlaceholderColor: colors.text5,
      sendButtonColor: colors.primary,
      sendButtonDisabledColor: colors.text4,
      inputBorderColor: "transparent",
      showInputBorder: false,
      uploadBgColor: colors.bbg6,
      uploadProgressColor: colors.tertiary,
      uploadTextColor: colors.textdark,
      modalBackgroundColor: colors.bg,
      modalHeaderBackgroundColor: colors.bg,
      modalHeaderBorderColor: colors.bbg6,
      modalTitleColor: colors.textdark,
      modalHandleColor: colors.text5,
      modalOptionButtonBg: "#fff",
      modalOptionLabelColor: colors.textdark,
      modalOptionSubtitleColor: colors.text4,
      modalCancelButtonBg: colors.bbg6,
      modalCancelButtonText: colors.textdark,
      modalOverlayColor: "rgba(0,0,0,0.5)",
      inputBarBorderTopColor: colors.bbg6,
    };
  }, [isWorker]);

  // ─── State ───────────────────────────────────────────────────────────────────
  const [messageText, setMessageText] = useState("");
  const [mediaPickerVisible, setMediaPickerVisible] = useState(false);
  // Dynamic lift applied only to input wrapper.
  // This avoids double-shift on devices where Android already resizes the
  // window and avoids under-shift where it does not.
  const [inputLift, setInputLift] = useState(0);

  // ─── Data hooks ──────────────────────────────────────────────────────────────
  const { messages, loading } = useMessages(conversationId);
  const { sendMessage, isSending } = useSendMessage(conversationId);
  const {
    sendMediaMessage,
    isSending: isMediaSending,
    uploadProgress,
    error: mediaError,
    resetError,
  } = useSendMediaMessage(conversationId);

  // ─── Keyboard/input overlap handling ──────────────────────────────────────────
  const updateInputLift = useCallback((keyboardTopY) => {
    if (!inputWrapperRef.current || !keyboardTopY) return;

    requestAnimationFrame(() => {
      inputWrapperRef.current?.measureInWindow((x, y, width, height) => {
        const inputBottomY = y + height;
        const overlap = inputBottomY - keyboardTopY;
        // Move only if overlapping keyboard, with a small breathing space.
        // 24px avoids occasional 1-3px clipping seen on some Android devices.
        setInputLift(overlap > 0 ? overlap + 24 : 0);
      });
    });
  }, []);

  useEffect(() => {
    // Use "Will" events on iOS for smooth animation sync; "Did" on Android.
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      keyboardVisibleRef.current = true;
      const keyboardTopY =
        e?.endCoordinates?.screenY || Dimensions.get("window").height;
      keyboardTopYRef.current = keyboardTopY;
      updateInputLift(keyboardTopY);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardVisibleRef.current = false;
      keyboardTopYRef.current = null;
      setInputLift(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [updateInputLift]);

  // ─── Processed messages with date separators ─────────────────────────────────
  const processedMessages = useMemo(() => {
    if (!messages || messages.length === 0) return [];

    const sorted = [...messages].sort((a, b) => {
      const dateA = resolveFirestoreDate(a.createdAt);
      const dateB = resolveFirestoreDate(b.createdAt);
      return dateA - dateB;
    });

    const result = [];
    let lastDateString = null;

    sorted.forEach((msg) => {
      const date = resolveFirestoreDate(msg.createdAt);

      if (!date || isNaN(date.getTime())) {
        result.push(msg);
        return;
      }

      const dateString = date.toDateString();

      if (dateString !== lastDateString) {
        const label = getDateSeparatorLabel(date, translate);

        result.push({
          id: `sep-${dateString}`,
          type: "separator",
          text: label,
        });
        lastDateString = dateString;
      }

      result.push(msg);
    });

    return result;
  }, [messages, translate]);

  // ─── Auto-scroll to latest message ───────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    if (flatListRef.current && processedMessages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: false });
    }
  }, [processedMessages.length]);

  // ─── Media error alert ────────────────────────────────────────────────────────
  useEffect(() => {
    if (mediaError) {
      Alert.alert(translate("common.error"), mediaError, [
        { text: translate("common.ok"), onPress: resetError },
      ]);
    }
  }, [mediaError, translate, resetError]);

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(async () => {
    const text = messageText.trim();
    if (!text || isSending || isMediaSending) return;
    setMessageText("");
    await sendMessage(text);
  }, [messageText, isSending, isMediaSending, sendMessage]);

  const handleFilePicked = useCallback(
    async (file) => {
      if (!file || !file.uri) {
        Alert.alert(translate("common.error"), translate("chat.invalidFile"));
        return;
      }
      try {
        await sendMediaMessage(file, "");
      } catch (err) {
        console.error("Error sending media:", err);
        Alert.alert(
          translate("common.error"),
          err.message || translate("chat.mediaUploadFailed"),
        );
      }
    },
    [sendMediaMessage, translate],
  );

  const handleAttachPress = useCallback(() => {
    if (isSending || isMediaSending) return;
    setMediaPickerVisible(true);
  }, [isSending, isMediaSending]);

  // ─── Render helpers ───────────────────────────────────────────────────────────
  const renderMessageBubble = useCallback(
    ({ item }) => {
      // Date separator row
      if (item?.type === "separator") {
        return (
          <View style={styles.separatorWrap}>
            <View
              style={[
                styles.separatorBadge,
                { backgroundColor: themeColors.separatorBadgeBg },
              ]}
            >
              <Text
                style={[
                  styles.separatorText,
                  { color: themeColors.separatorText },
                ]}
              >
                {item.text}
              </Text>
            </View>
          </View>
        );
      }

      const currentUserId = currentUser?.id ? String(currentUser.id) : null;
      const isMe = item.senderId === currentUserId;

      // Build time display string
      let timeDisplay = "";
      if (item.createdAt) {
        timeDisplay = getChatTimeDisplay(item.createdAt, translate);
      }

      return (
        <ChatBubble2
          message={{
            id: item.id,
            from: item.senderName || translate("chat.defaultSenderName"),
            text: item.text,
            time: timeDisplay,
            me: isMe,
            type: item.type,
            media: item.media,
            senderName: item.senderName,
            createdAt: item.createdAt,
          }}
          isMe={isMe}
          bubbleMeColor={themeColors.bubbleMeColor}
          bubbleOtherColor={themeColors.bubbleOtherColor}
          textColor={themeColors.bubbleTextColor}
          senderNameColor={themeColors.bubbleSenderNameColor}
          timeColor={themeColors.bubbleTimeColor}
        />
      );
    },
    [currentUser?.id, translate, themeColors],
  );

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { backgroundColor: themeColors.screenBg }]}>
      <StatusBar
        style={themeColors.statusBarStyle}
        backgroundColor={themeColors.headerBg}
      />

      {/* Header — outside the scrollable area, always at the top */}
      <View
        style={[
          styles.headerWrapper,
          {
            paddingTop: insets.top,
            backgroundColor: themeColors.headerBg,
          },
        ]}
      >
        <ChatHeader2
          name={otherUser?.name || translate("chat.title")}
          avatar={{ uri: otherUser?.profile_picture }}
          onBackPress={() => navigation.goBack()}
          backgroundColor={themeColors.headerBg}
          textColor={themeColors.headerText}
          subtitleColor={themeColors.headerSubtitle}
        />
      </View>

      {/*
       * Body — flex:1, fills space below header.
       * Keep a stable safe-area bottom padding; keyboard handling is done via
       * overlap-based translate on the input wrapper (inputLift).
       */}
      <View
        style={[
          styles.body,
          {
            paddingBottom: 0,
          },
        ]}
      >
        {/* ── Messages list ── */}
        {loading && processedMessages.length === 0 ? (
          <LoadingState
            title={otherUser?.name || translate("chat.title")}
            message={translate("common.loading")}
            backgroundColor={themeColors.screenBg}
          />
        ) : (
          <FlatList
            ref={flatListRef}
            style={styles.list}
            data={processedMessages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessageBubble}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToBottom}
            onLayout={scrollToBottom}
            ListEmptyComponent={
              !loading ? (
                <View style={styles.emptyContainer}>
                  <Text
                    style={[
                      styles.emptyText,
                      { color: themeColors.emptyTextColor },
                    ]}
                  >
                    {translate("chat.noMessagesPrompt")}
                  </Text>
                </View>
              ) : null
            }
          />
        )}

        {/* ── Upload progress bar ── */}
        {isMediaSending && (
          <UploadProgressBar2
            progress={uploadProgress}
            fileName={translate("chat.uploadingFile")}
            backgroundColor={themeColors.uploadBgColor}
            progressBarColor={themeColors.uploadProgressColor}
            textColor={themeColors.uploadTextColor}
            loaderColor={themeColors.uploadProgressColor}
          />
        )}

        {/* ── Input bar — naturally sits at the bottom of the body flex column ── */}
        <View
          ref={inputWrapperRef}
          onLayout={() => {
            if (keyboardVisibleRef.current && keyboardTopYRef.current) {
              updateInputLift(keyboardTopYRef.current);
            }
          }}
          style={[
            styles.inputWrapper,
            {
              backgroundColor: themeColors.screenBg,
              borderTopColor: themeColors.inputBarBorderTopColor,
              paddingBottom: Math.max(
                insets.bottom,
                Platform.OS === "android" ? 12 : 8,
              ),
              transform: [{ translateY: -inputLift }],
            },
          ]}
        >
          <ChatInputBar2
            value={messageText}
            onChangeText={setMessageText}
            onSendPress={handleSendMessage}
            onSubmitEditing={handleSendMessage}
            onAttachPress={handleAttachPress}
            placeholder={translate("chat.typeMessage")}
            editable={!isSending && !isMediaSending}
            inputBackgroundColor={themeColors.inputBackgroundColor}
            inputTextColor={themeColors.inputTextColor}
            placeholderColor={themeColors.inputPlaceholderColor}
            sendButtonColor={themeColors.sendButtonColor}
            sendButtonDisabledColor={themeColors.sendButtonDisabledColor}
            inputBorderColor={themeColors.inputBorderColor}
            showBorder={themeColors.showInputBorder}
          />
        </View>
      </View>

      {/* Media picker modal — outside body to avoid layout interference */}
      <MediaPickerModal2
        visible={mediaPickerVisible}
        onClose={() => setMediaPickerVisible(false)}
        onFilePicked={handleFilePicked}
        modalBackgroundColor={themeColors.modalBackgroundColor}
        headerBackgroundColor={themeColors.modalHeaderBackgroundColor}
        headerBorderColor={themeColors.modalHeaderBorderColor}
        titleColor={themeColors.modalTitleColor}
        handleColor={themeColors.modalHandleColor}
        optionButtonBackground={themeColors.modalOptionButtonBg}
        optionLabelColor={themeColors.modalOptionLabelColor}
        optionSubtitleColor={themeColors.modalOptionSubtitleColor}
        cancelButtonBackground={themeColors.modalCancelButtonBg}
        cancelButtonTextColor={themeColors.modalCancelButtonText}
        overlayColor={themeColors.modalOverlayColor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerWrapper: {
    // paddingTop and backgroundColor applied inline
  },
  body: {
    flex: 1,
    // paddingBottom applied inline (keyboardHeight or insets.bottom)
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 16,
    paddingHorizontal: 8,
    paddingBottom: 8,
    flexGrow: 1,
  },
  inputWrapper: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  separatorWrap: {
    alignItems: "center",
    marginVertical: 16,
  },
  separatorBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  separatorText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    textTransform: "uppercase",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  emptyText: {
    fontSize: fontSizes.md,
    textAlign: "center",
    fontFamily: fonts.regular,
  },
});
