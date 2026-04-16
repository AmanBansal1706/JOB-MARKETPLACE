// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import {
//   View,
//   StyleSheet,
//   FlatList,
//   KeyboardAvoidingView,
//   Platform,
//   Keyboard,
//   Text,
//   Dimensions,
//   Alert,
// } from "react-native";

// import { colors, fonts, fontSizes } from "../../../theme";
// import workerColors from "../../../theme/worker/colors";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import { useSelector } from "react-redux";
// import { useTranslation } from "../../../hooks/useTranslation";
// import {
//   ChatHeader,
//   ChatBubble,
//   ChatInputBar,
//   MediaPickerModal,
//   UploadProgressBar,
// } from "../../../components/chatting";
// import { ScreenWrapper } from "../../../components/common";
// import LoadingState from "../../../components/LoadingState";
// import {
//   useMessages,
//   useSendMessage,
//   useSendMediaMessage,
// } from "../../../hooks/useChat";
// import { formatDisplayDate } from "../../../utils/dateFormatting";

// export default function ChatScreen() {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { translate } = useTranslation();
//   const currentUser = useSelector((state) => state.Auth.user);
//   const { conversationId, otherUser } = route.params || {};

//   // Detect if user is a worker
//   const isWorker = currentUser?.role === "WORKER";

//   // Theme colors based on user role
//   const themeColors = useMemo(() => {
//     if (isWorker) {
//       return {
//         screenBg: workerColors.white,
//         headerBg: workerColors.primary.pink,
//         headerText: workerColors.white,
//         headerSubtitle: "rgba(255,255,255,0.8)",
//         separatorBadgeBg: workerColors.auth.darkRed,
//         separatorText: workerColors.white,
//         emptyTextColor: workerColors.text.secondary,
//         statusBarStyle: "light",
//         // ChatBubble colors
//         bubbleMeColor: workerColors.ui.chatBubbleRight,
//         bubbleOtherColor: workerColors.ui.chatBubbleLeft,
//         bubbleTextColor: workerColors.text.primary,
//         bubbleSenderNameColor: workerColors.black,
//         bubbleTimeColor: workerColors.text.secondary,
//         // ChatInputBar colors
//         inputBackgroundColor: workerColors.white,
//         inputTextColor: workerColors.text.primary,
//         inputPlaceholderColor: "#999",
//         sendButtonColor: workerColors.auth.darkRed,
//         sendButtonDisabledColor: workerColors.ui.buttonGray,
//         inputBorderColor: workerColors.ui.lightBorder,
//         showInputBorder: true,
//         // UploadProgressBar colors
//         uploadBgColor: workerColors.ui.screenBackground,
//         uploadProgressColor: workerColors.primary.pink,
//         uploadTextColor: workerColors.text.primary,
//         // MediaPickerModal colors
//         modalBackgroundColor: workerColors.white,
//         modalHeaderBackgroundColor: workerColors.white,
//         modalHeaderBorderColor: workerColors.ui.lightBorder,
//         modalTitleColor: workerColors.black,
//         modalHandleColor: workerColors.ui.lightBorder,
//         modalOptionButtonBg: workerColors.white,
//         modalOptionLabelColor: workerColors.text.primary,
//         modalOptionSubtitleColor: workerColors.text.secondary,
//         modalCancelButtonBg: workerColors.ui.screenBackground,
//         modalCancelButtonText: workerColors.text.primary,
//         modalOverlayColor: "rgba(0, 0, 0, 0.5)",
//       };
//     }
//     return {
//       screenBg: colors.bg,
//       headerBg: colors.bg1,
//       headerText: "#fff",
//       headerSubtitle: "#D5F1EA",
//       separatorBadgeBg: "#005F40",
//       separatorText: "#fff",
//       emptyTextColor: colors.text4,
//       statusBarStyle: "light",
//       // ChatBubble colors
//       bubbleMeColor: "#B9F3E0",
//       bubbleOtherColor: "#A9C1BC",
//       bubbleTextColor: colors.textdark,
//       bubbleSenderNameColor: colors.textdark,
//       bubbleTimeColor: colors.text4,
//       // ChatInputBar colors
//       inputBackgroundColor: colors.bbg6,
//       inputTextColor: colors.textdark,
//       inputPlaceholderColor: colors.text5,
//       sendButtonColor: colors.primary,
//       sendButtonDisabledColor: colors.text4,
//       inputBorderColor: "transparent",
//       showInputBorder: false,
//       // UploadProgressBar colors
//       uploadBgColor: colors.bbg6,
//       uploadProgressColor: colors.tertiary,
//       uploadTextColor: colors.textdark,
//       // MediaPickerModal colors
//       modalBackgroundColor: colors.bg,
//       modalHeaderBackgroundColor: colors.bg,
//       modalHeaderBorderColor: colors.bbg6,
//       modalTitleColor: colors.textdark,
//       modalHandleColor: colors.text5,
//       modalOptionButtonBg: "#fff",
//       modalOptionLabelColor: colors.textdark,
//       modalOptionSubtitleColor: colors.text4,
//       modalCancelButtonBg: colors.bbg6,
//       modalCancelButtonText: colors.textdark,
//       modalOverlayColor: "rgba(0, 0, 0, 0.5)",
//     };
//   }, [isWorker]);

//   const [keyboardHeight, setKeyboardHeight] = useState(0);
//   const [messageText, setMessageText] = useState("");

//   // Get messages from Firebase
//   const { messages, loading, error } = useMessages(conversationId);

//   // Process messages to add date separators
//   const processedMessages = React.useMemo(() => {
//     if (!messages || messages.length === 0) return [];

//     const result = [];
//     let lastDate = null;

//     // Messages come in reverse order (newest first) usually, but let's assume
//     // we want to display them chronologically or handle the list inversion.
//     // If FlatList is inverted, we process from end to start or vice versa.
//     // Assuming standard FlatList (not inverted) for now based on existing code,
//     // but usually chat lists are inverted.
//     // Let's check the order. If messages are [oldest, ..., newest], we iterate normally.
//     // If messages are [newest, ..., oldest], we might need to reverse or handle differently.
//     // Based on typical chat apps, let's assume we want separators between days.

//     // Let's sort messages by createdAt just to be safe
//     const sortedMessages = [...messages].sort((a, b) => {
//       const dateA = a.createdAt?.toDate
//         ? a.createdAt.toDate()
//         : new Date(a.createdAt);
//       const dateB = b.createdAt?.toDate
//         ? b.createdAt.toDate()
//         : new Date(b.createdAt);
//       return dateA - dateB;
//     });

//     sortedMessages.forEach((msg, index) => {
//       const date = msg.createdAt?.toDate
//         ? msg.createdAt.toDate()
//         : new Date(msg.createdAt);

//       if (!date || isNaN(date.getTime())) {
//         result.push(msg);
//         return;
//       }

//       const dateString = date.toDateString();

//       if (dateString !== lastDate) {
//         // Calculate label (Today, Yesterday, or Date)
//         const now = new Date();
//         const isToday =
//           date.getDate() === now.getDate() &&
//           date.getMonth() === now.getMonth() &&
//           date.getFullYear() === now.getFullYear();

//         const yesterday = new Date();
//         yesterday.setDate(yesterday.getDate() - 1);
//         const isYesterday =
//           date.getDate() === yesterday.getDate() &&
//           date.getMonth() === yesterday.getMonth() &&
//           date.getFullYear() === yesterday.getFullYear();

//         let label = "";
//         if (isToday) {
//           label = translate("chat.today");
//         } else if (isYesterday) {
//           label = translate("chat.yesterday");
//         } else {
//           label = formatDisplayDate(date);
//         }

//         result.push({
//           id: `sep-${dateString}`,
//           type: "separator",
//           text: label,
//         });
//         lastDate = dateString;
//       }

//       result.push(msg);
//     });

//     return result;
//   }, [messages, translate]);

//   // Send message hook
//   const { sendMessage, isSending } = useSendMessage(conversationId);

//   // Send media message hook
//   const {
//     sendMediaMessage,
//     isSending: isMediaSending,
//     uploadProgress,
//     error: mediaError,
//     resetError,
//   } = useSendMediaMessage(conversationId);

//   // Media picker state
//   const [mediaPickerVisible, setMediaPickerVisible] = useState(false);

//   useEffect(() => {
//     const showSubscription = Keyboard.addListener("keyboardDidShow", (e) => {
//       setKeyboardHeight(e.endCoordinates.height);
//     });
//     const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
//       setKeyboardHeight(0);
//     });

//     return () => {
//       showSubscription?.remove();
//       hideSubscription?.remove();
//     };
//   }, []);

//   const handleSendMessage = useCallback(async () => {
//     const text = messageText.trim();
//     if (!text || isSending || isMediaSending) return;

//     setMessageText("");
//     await sendMessage(text);
//   }, [messageText, isSending, isMediaSending, sendMessage]);

//   // Handle media file picked from MediaPickerModal
//   const handleFilePicked = useCallback(
//     async (file) => {
//       if (!file || !file.uri) {
//         Alert.alert(translate("common.error"), translate("chat.invalidFile"));
//         return;
//       }

//       try {
//         await sendMediaMessage(file, "");
//       } catch (err) {
//         console.error("Error sending media:", err);
//         Alert.alert(
//           translate("common.error"),
//           err.message || translate("chat.mediaUploadFailed"),
//         );
//       }
//     },
//     [sendMediaMessage, translate],
//   );

//   // Handle attachment button press
//   const handleAttachPress = useCallback(() => {
//     if (isSending || isMediaSending) return;
//     setMediaPickerVisible(true);
//   }, [isSending, isMediaSending]);

//   // Show error alert if media upload fails
//   useEffect(() => {
//     if (mediaError) {
//       Alert.alert(translate("common.error"), mediaError, [
//         {
//           text: translate("common.ok"),
//           onPress: resetError,
//         },
//       ]);
//     }
//   }, [mediaError, translate, resetError]);

//   const renderMessageBubble = useCallback(
//     ({ item }) => {
//       if (item && item.type === "separator") {
//         return (
//           <View style={styles.separatorWrap}>
//             <View
//               style={[
//                 styles.separatorBadge,
//                 { backgroundColor: themeColors.separatorBadgeBg },
//               ]}
//             >
//               <Text
//                 style={[
//                   styles.separatorText,
//                   { color: themeColors.separatorText },
//                 ]}
//               >
//                 {item.text}
//               </Text>
//             </View>
//           </View>
//         );
//       }

//       // Ensure user ID is converted to string for comparison
//       const currentUserId = currentUser?.id ? String(currentUser.id) : null;
//       const isMe = item.senderId === currentUserId;

//       // Format time logic
//       let timeDisplay = "";
//       if (item.createdAt) {
//         const date = new Date(item.createdAt.toDate?.() || item.createdAt);
//         const now = new Date();
//         const isToday =
//           date.getDate() === now.getDate() &&
//           date.getMonth() === now.getMonth() &&
//           date.getFullYear() === now.getFullYear();

//         const yesterday = new Date();
//         yesterday.setDate(yesterday.getDate() - 1);
//         const isYesterday =
//           date.getDate() === yesterday.getDate() &&
//           date.getMonth() === yesterday.getMonth() &&
//           date.getFullYear() === yesterday.getFullYear();

//         if (isToday) {
//           timeDisplay = date.toLocaleTimeString([], {
//             hour: "2-digit",
//             minute: "2-digit",
//           });
//         } else if (isYesterday) {
//           timeDisplay = translate("chat.yesterday");
//         } else {
//           timeDisplay = formatDisplayDate(date);
//         }
//       }

//       return (
//         <ChatBubble
//           message={{
//             id: item.id,
//             from: item.senderName || translate("chat.defaultSenderName"),
//             text: item.text,
//             time: timeDisplay,
//             me: isMe,
//             // Include media-specific fields for FileMessageBubble
//             type: item.type,
//             media: item.media,
//             senderName: item.senderName,
//             createdAt: item.createdAt,
//           }}
//           isMe={isMe}
//           bubbleMeColor={themeColors.bubbleMeColor}
//           bubbleOtherColor={themeColors.bubbleOtherColor}
//           textColor={themeColors.bubbleTextColor}
//           senderNameColor={themeColors.bubbleSenderNameColor}
//           timeColor={themeColors.bubbleTimeColor}
//         />
//       );
//     },
//     [currentUser?.id, translate, themeColors],
//   );

//   const renderLoadingState = () => (
//     <LoadingState
//       title={otherUser?.name || translate("chat.title")}
//       message={translate("common.loading")}
//       backgroundColor={themeColors.screenBg}
//     />
//   );

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//       style={[styles.container, { backgroundColor: themeColors.screenBg }]}
//     >
//       <ScreenWrapper
//         edges={["top", "bottom"]}
//         statusBarBackground={themeColors.headerBg}
//         backgroundColor={themeColors.screenBg}
//         containerStyle={styles.container}
//       >
//         <ChatHeader
//           name={otherUser?.name || translate("chat.title")}
//           avatar={{
//             uri: otherUser.profile_picture,
//           }}
//           onBackPress={() => navigation.goBack()}
//           backgroundColor={themeColors.headerBg}
//           textColor={themeColors.headerText}
//           subtitleColor={themeColors.headerSubtitle}
//         />

//         <View style={styles.messagesContainer}>
//           {loading && messages.length === 0 ? (
//             renderLoadingState()
//           ) : (
//             <FlatList
//               style={styles.messagesList}
//               data={processedMessages}
//               keyExtractor={(item) => item.id}
//               contentContainerStyle={[
//                 styles.listContent,
//                 {
//                   paddingBottom: keyboardHeight > 0 ? keyboardHeight + 20 : 20,
//                 },
//               ]}
//               keyboardShouldPersistTaps="handled"
//               renderItem={renderMessageBubble}
//               scrollEnabled
//               ListEmptyComponent={
//                 !loading ? (
//                   <View style={styles.emptyContainer}>
//                     <Text
//                       style={[
//                         styles.emptyText,
//                         { color: themeColors.emptyTextColor },
//                       ]}
//                     >
//                       {translate("chat.noMessagesPrompt")}
//                     </Text>
//                   </View>
//                 ) : null
//               }
//             />
//           )}
//         </View>

//         {/* Upload Progress Bar */}
//         {isMediaSending && (
//           <UploadProgressBar
//             progress={uploadProgress}
//             fileName={translate("chat.uploadingFile")}
//             backgroundColor={themeColors.uploadBgColor}
//             progressBarColor={themeColors.uploadProgressColor}
//             textColor={themeColors.uploadTextColor}
//             loaderColor={themeColors.uploadProgressColor}
//           />
//         )}

//         <View
//           style={{
//             position: "absolute",
//             top: keyboardHeight > 0 ? (Dimensions.get("window").height - keyboardHeight -70) : (Dimensions.get("window").height - 70),
//             left: 0,
//             right: 0,
//             backgroundColor: themeColors.screenBg,
//             paddingHorizontal: 16,
//             paddingBottom: Platform.OS === "android" && keyboardHeight > 0 ? keyboardHeight : 0,
//           }}
//         >
//           <ChatInputBar
//             value={messageText}
//             onChangeText={setMessageText}
//             onSendPress={handleSendMessage}
//             onSubmitEditing={handleSendMessage}
//             onAttachPress={handleAttachPress}
//             placeholder={translate("chat.typeMessage")}
//             editable={!isSending && !isMediaSending}
//             inputBackgroundColor={themeColors.inputBackgroundColor}
//             inputTextColor={themeColors.inputTextColor}
//             placeholderColor={themeColors.inputPlaceholderColor}
//             sendButtonColor={themeColors.sendButtonColor}
//             sendButtonDisabledColor={themeColors.sendButtonDisabledColor}
//             inputBorderColor={themeColors.inputBorderColor}
//             showBorder={themeColors.showInputBorder}
//           />
//         </View>

//         {/* Media Picker Modal */}
//         <MediaPickerModal
//           visible={mediaPickerVisible}
//           onClose={() => setMediaPickerVisible(false)}
//           onFilePicked={handleFilePicked}
//           modalBackgroundColor={themeColors.modalBackgroundColor}
//           headerBackgroundColor={themeColors.modalHeaderBackgroundColor}
//           headerBorderColor={themeColors.modalHeaderBorderColor}
//           titleColor={themeColors.modalTitleColor}
//           handleColor={themeColors.modalHandleColor}
//           optionButtonBackground={themeColors.modalOptionButtonBg}
//           optionLabelColor={themeColors.modalOptionLabelColor}
//           optionSubtitleColor={themeColors.modalOptionSubtitleColor}
//           cancelButtonBackground={themeColors.modalCancelButtonBg}
//           cancelButtonTextColor={themeColors.modalCancelButtonText}
//           overlayColor={themeColors.modalOverlayColor}
//         />
//       </ScreenWrapper>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   messagesContainer: {
//     flex: 1,
//   },
//   messagesList: {
//     flex: 1,
//   },
//   listContent: {
//     paddingTop: 18,
//     paddingHorizontal: 8,
//   },
//   separatorWrap: {
//     alignItems: "center",
//     marginVertical: 16,
//   },
//   separatorBadge: {
//     backgroundColor: "#005F40",
//     paddingHorizontal: 16,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   separatorText: {
//     color: "#fff",
//     fontFamily: fonts.semiBold,
//     fontSize: 12,
//     textTransform: "uppercase",
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 24,
//   },
//   emptyText: {
//     fontSize: fontSizes.md,
//     color: colors.text4,
//     textAlign: "center",
//     fontFamily: fonts.regular,
//   },
// });
