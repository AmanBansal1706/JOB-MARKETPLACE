import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import { colors, fonts, fontSizes } from "../../theme";
import { useTranslation } from "../../hooks/useTranslation";
import { formatFirestoreTime } from "../../utils/dateFormatting";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

/**
 * FileMessageBubble2 Component
 * Renders different types of media messages (image, video, audio, document)
 * Supports theming via color props for business/worker panels
 */
function FileMessageBubble2({
  message,
  isMe,
  bubbleMeColor,
  bubbleOtherColor,
  textColor,
  senderNameColor,
  timeColor,
}) {
  const { translate } = useTranslation();
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const bubbleMeBg = bubbleMeColor || "#B9F3E0";
  const bubbleOtherBg = bubbleOtherColor || "#A9C1BC";
  const msgTextColor = textColor || colors.textdark;
  const nameColor = senderNameColor || colors.textdark;
  const timeTxtColor = timeColor || colors.text4;

  const { text, media, createdAt } = message;
  const fileType = message.type;

  const formatTime = useCallback(() => {
    return formatFirestoreTime(createdAt);
  }, [createdAt]);

  const handleOpenDocument = useCallback(async () => {
    if (media?.url) {
      try {
        const supported = await Linking.canOpenURL(media.url);
        if (supported) {
          await Linking.openURL(media.url);
        }
      } catch (error) {
        console.error("Error opening document:", error);
      }
    }
  }, [media?.url]);

  const renderImageContent = () => (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setImageModalVisible(true)}
        style={styles.imageContainer}
      >
        {imageLoading && (
          <View style={styles.imagePlaceholder}>
            <ActivityIndicator size="small" color={colors.tertiary} />
          </View>
        )}
        {imageError ? (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.errorIcon}>🖼️</Text>
            <Text style={styles.errorText}>
              {translate("chat.imageLoadError")}
            </Text>
          </View>
        ) : (
          <Image
            source={{ uri: media?.url }}
            style={[styles.messageImage, imageLoading && { opacity: 0 }]}
            resizeMode="cover"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
          />
        )}
      </TouchableOpacity>

      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseArea}
            activeOpacity={1}
            onPress={() => setImageModalVisible(false)}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setImageModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Image
              source={{ uri: media?.url }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );

  const renderVideoContent = () => (
    <TouchableOpacity
      style={styles.videoContainer}
      onPress={handleOpenDocument}
      activeOpacity={0.8}
    >
      <View style={styles.videoPlaceholder}>
        <View style={styles.playButton}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
        <Text style={styles.videoLabel}>
          {translate("chat.tapToPlayVideo")}
        </Text>
        {media?.duration && (
          <Text style={styles.durationText}>
            {Math.floor(media.duration / 60)}:
            {String(Math.floor(media.duration % 60)).padStart(2, "0")}
          </Text>
        )}
      </View>
      {media?.fileName && (
        <Text style={styles.fileName} numberOfLines={1}>
          {media.fileName}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderAudioContent = () => (
    <TouchableOpacity
      style={styles.audioContainer}
      onPress={handleOpenDocument}
      activeOpacity={0.8}
    >
      <View style={styles.audioIconContainer}>
        <Text style={styles.audioIcon}>🎵</Text>
      </View>
      <View style={styles.audioInfo}>
        <Text style={styles.audioFileName} numberOfLines={1}>
          {media?.fileName || translate("chat.audioFile")}
        </Text>
        <View style={styles.audioMeta}>
          {media?.duration && (
            <Text style={styles.audioDuration}>
              {Math.floor(media.duration / 60)}:
              {String(Math.floor(media.duration % 60)).padStart(2, "0")}
            </Text>
          )}
          {media?.fileSizeFormatted && (
            <Text style={styles.audioSize}>{media.fileSizeFormatted}</Text>
          )}
        </View>
      </View>
      <View style={styles.audioPlayButton}>
        <Text style={styles.audioPlayIcon}>▶</Text>
      </View>
    </TouchableOpacity>
  );

  const renderDocumentContent = () => {
    const getDocIcon = () => {
      const fileName = media?.fileName?.toLowerCase() || "";
      if (fileName.endsWith(".pdf")) return "📕";
      if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) return "📘";
      if (fileName.endsWith(".xls") || fileName.endsWith(".xlsx")) return "📗";
      if (fileName.endsWith(".txt")) return "📄";
      return "📎";
    };

    return (
      <TouchableOpacity
        style={styles.documentContainer}
        onPress={handleOpenDocument}
        activeOpacity={0.8}
      >
        <View style={styles.documentIconContainer}>
          <Text style={styles.documentIcon}>{getDocIcon()}</Text>
        </View>
        <View style={styles.documentInfo}>
          <Text style={styles.documentFileName} numberOfLines={1}>
            {media?.fileName || translate("chat.document")}
          </Text>
          {media?.fileSizeFormatted && (
            <Text style={styles.documentSize}>{media.fileSizeFormatted}</Text>
          )}
        </View>
        <View style={styles.downloadButton}>
          <Text style={styles.downloadIcon}>⬇</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    switch (fileType) {
      case "image":
        return renderImageContent();
      case "video":
        return renderVideoContent();
      case "audio":
        return renderAudioContent();
      case "document":
        return renderDocumentContent();
      default:
        return renderDocumentContent();
    }
  };

  return (
    <View
      style={[
        styles.messageContainer,
        isMe ? styles.messageContainerMe : styles.messageContainerOther,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isMe ? styles.bubbleMe : styles.bubbleOther,
          { backgroundColor: isMe ? bubbleMeBg : bubbleOtherBg },
        ]}
      >
        <View style={styles.infoRow}>
          <Text style={[styles.senderName, { color: nameColor }]}>
            {isMe ? translate("chat.you") : message.senderName}
          </Text>
          <Text style={[styles.timeText, { color: timeTxtColor }]}>
            {formatTime()}
          </Text>
        </View>
        {renderContent()}
        {text && text.trim() !== "" && (
          <Text style={[styles.captionText, { color: msgTextColor }]}>
            {text}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: { flexDirection: "column", marginVertical: 8 },
  messageContainerMe: { alignItems: "flex-end" },
  messageContainerOther: { alignItems: "flex-start" },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  senderName: {
    color: colors.textdark,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  timeText: {
    color: colors.text4,
    fontSize: 10,
    fontFamily: fonts.regular,
    marginLeft: 8,
  },
  bubble: {
    maxWidth: "80%",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleOther: { backgroundColor: "#A9C1BC", borderTopLeftRadius: 0 },
  bubbleMe: { backgroundColor: "#B9F3E0", borderTopRightRadius: 0 },
  captionText: {
    color: colors.textdark,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.regular,
    marginTop: 8,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: "hidden",
    minWidth: 180,
    minHeight: 180,
  },
  messageImage: { width: 200, height: 200, borderRadius: 12 },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.bbg6,
    justifyContent: "center",
    alignItems: "center",
  },
  errorIcon: { fontSize: 32, marginBottom: 8 },
  errorText: { fontSize: 12, color: colors.text4, fontFamily: fonts.regular },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseArea: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  closeButtonText: { color: "#fff", fontSize: 20, fontFamily: fonts.bold },
  fullScreenImage: { width: screenWidth, height: screenHeight * 0.8 },
  videoContainer: { minWidth: 200, borderRadius: 12, overflow: "hidden" },
  videoPlaceholder: {
    width: 200,
    height: 150,
    backgroundColor: "#2a2a2a",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  playIcon: { fontSize: 20, color: "#333" },
  videoLabel: { color: "#fff", fontSize: 12, fontFamily: fonts.regular },
  durationText: {
    color: "#ccc",
    fontSize: 11,
    fontFamily: fonts.regular,
    marginTop: 4,
  },
  fileName: {
    color: colors.textdark,
    fontSize: 12,
    fontFamily: fonts.regular,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  audioContainer: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 200,
    padding: 4,
  },
  audioIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  audioIcon: { fontSize: 20 },
  audioInfo: { flex: 1, marginLeft: 10 },
  audioFileName: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
  },
  audioMeta: { flexDirection: "row", gap: 8, marginTop: 2 },
  audioDuration: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.text4,
  },
  audioSize: { fontSize: 11, fontFamily: fonts.regular, color: colors.text4 },
  audioPlayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  audioPlayIcon: { fontSize: 14, color: colors.textdark },
  documentContainer: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 200,
    padding: 4,
  },
  documentIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  documentIcon: { fontSize: 24 },
  documentInfo: { flex: 1, marginLeft: 10 },
  documentFileName: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
  },
  documentSize: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.text4,
    marginTop: 2,
  },
  downloadButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  downloadIcon: { fontSize: 14, color: colors.textdark },
});

export default FileMessageBubble2;
