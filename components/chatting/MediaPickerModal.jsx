import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { colors, fonts, fontSizes } from "../../theme";
import { useTranslation } from "../../hooks/useTranslation";
import {
  FILE_CONFIG,
  getFileCategory,
  validateFile,
} from "../../services/FirebaseService";

/**
 * MediaPickerModal Component
 * Modal for selecting different types of media to send in chat
 * Supports theming via color props for business/worker panels
 */
function MediaPickerModal({
  visible,
  onClose,
  onFilePicked,
  // Theme color props
  modalBackgroundColor,
  headerBackgroundColor,
  headerBorderColor,
  titleColor,
  handleColor,
  optionButtonBackground,
  optionLabelColor,
  optionSubtitleColor,
  cancelButtonBackground,
  cancelButtonTextColor,
  overlayColor,
}) {
  const { translate } = useTranslation();

  // Use provided colors or defaults
  const modalBg = modalBackgroundColor || colors.bg;
  const headerBg = headerBackgroundColor || colors.bg;
  const borderColor = headerBorderColor || colors.bbg6;
  const titleClr = titleColor || colors.textdark;
  const handleClr = handleColor || colors.text5;
  const optionBg = optionButtonBackground || "#fff";
  const optionLabelClr = optionLabelColor || colors.textdark;
  const optionSubtitleClr = optionSubtitleColor || colors.text4;
  const cancelBg = cancelButtonBackground || colors.bbg6;
  const cancelTextClr = cancelButtonTextColor || colors.textdark;
  const overlay = overlayColor || "rgba(0, 0, 0, 0.5)";

  // Request camera permissions
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        translate("chat.permissionRequired"),
        translate("chat.cameraPermissionMessage"),
      );
      return false;
    }
    return true;
  };

  // Request media library permissions
  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        translate("chat.permissionRequired"),
        translate("chat.galleryPermissionMessage"),
      );
      return false;
    }
    return true;
  };

  // Handle camera capture
  const handleCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        const fileData = {
          uri: asset.uri,
          mimeType: asset.mimeType || "image/jpeg",
          fileName: asset.fileName || `photo_${Date.now()}.jpg`,
          fileSize: asset.fileSize || 0,
          dimensions: {
            width: asset.width,
            height: asset.height,
          },
        };

        // Validate file
        const category = getFileCategory(fileData.mimeType);
        const validation = validateFile(fileData, category);

        if (!validation.valid) {
          Alert.alert(translate("common.error"), validation.error);
          return;
        }

        onFilePicked(fileData);
        onClose();
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert(translate("common.error"), translate("chat.cameraError"));
    }
  };

  // Handle gallery selection (images and videos)
  const handleGallery = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        quality: 0.8,
        allowsEditing: false,
        videoMaxDuration: 120, // 2 minutes max
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        const isVideo = asset.type === "video";

        const fileData = {
          uri: asset.uri,
          mimeType: asset.mimeType || (isVideo ? "video/mp4" : "image/jpeg"),
          fileName:
            asset.fileName ||
            `${isVideo ? "video" : "photo"}_${Date.now()}.${
              isVideo ? "mp4" : "jpg"
            }`,
          fileSize: asset.fileSize || 0,
          dimensions: {
            width: asset.width,
            height: asset.height,
          },
          duration: asset.duration || null,
        };

        // Validate file
        const category = getFileCategory(fileData.mimeType);
        const validation = validateFile(fileData, category);

        if (!validation.valid) {
          Alert.alert(translate("common.error"), validation.error);
          return;
        }

        onFilePicked(fileData);
        onClose();
      }
    } catch (error) {
      console.error("Gallery error:", error);
      Alert.alert(translate("common.error"), translate("chat.galleryError"));
    }
  };

  // Handle document selection
  const handleDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        const fileData = {
          uri: asset.uri,
          mimeType: asset.mimeType || "application/octet-stream",
          fileName: asset.name || `document_${Date.now()}`,
          fileSize: asset.size || 0,
        };

        // Validate file
        const category = getFileCategory(fileData.mimeType);
        const validation = validateFile(fileData, category);

        if (!validation.valid) {
          Alert.alert(translate("common.error"), validation.error);
          return;
        }

        onFilePicked(fileData);
        onClose();
      }
    } catch (error) {
      console.error("Document picker error:", error);
      Alert.alert(translate("common.error"), translate("chat.documentError"));
    }
  };

  // Handle audio selection
  const handleAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["audio/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        const fileData = {
          uri: asset.uri,
          mimeType: asset.mimeType || "audio/mpeg",
          fileName: asset.name || `audio_${Date.now()}.mp3`,
          fileSize: asset.size || 0,
        };

        // Validate file
        const category = getFileCategory(fileData.mimeType);
        const validation = validateFile(fileData, category);

        if (!validation.valid) {
          Alert.alert(translate("common.error"), validation.error);
          return;
        }

        onFilePicked(fileData);
        onClose();
      }
    } catch (error) {
      console.error("Audio picker error:", error);
      Alert.alert(translate("common.error"), translate("chat.audioError"));
    }
  };

  // Media options
  const mediaOptions = [
    {
      id: "camera",
      icon: "📷",
      label: translate("chat.takePhoto"),
      subtitle: translate("chat.takePhotoDesc"),
      onPress: handleCamera,
      color: "#4CAF50",
    },
    {
      id: "gallery",
      icon: "🖼️",
      label: translate("chat.photoVideo"),
      subtitle: translate("chat.photoVideoDesc"),
      onPress: handleGallery,
      color: "#2196F3",
    },
    {
      id: "document",
      icon: "📄",
      label: translate("chat.document"),
      subtitle: translate("chat.documentDesc"),
      onPress: handleDocument,
      color: "#FF9800",
    },
    {
      id: "audio",
      icon: "🎵",
      label: translate("chat.audioFile"),
      subtitle: translate("chat.audioFileDesc"),
      onPress: handleAudio,
      color: "#9C27B0",
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: overlay }]}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContainer, { backgroundColor: modalBg }]}>
              {/* Header */}
              <View style={[styles.header, { borderBottomColor: borderColor }]}>
                <View style={[styles.handle, { backgroundColor: handleClr }]} />
                <Text style={[styles.title, { color: titleClr }]}>
                  {translate("chat.shareFile")}
                </Text>
              </View>

              {/* Options Grid */}
              <View style={styles.optionsContainer}>
                {mediaOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.optionButton, { backgroundColor: optionBg }]}
                    onPress={option.onPress}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: option.color + "20" },
                      ]}
                    >
                      <Text style={styles.optionIcon}>{option.icon}</Text>
                    </View>
                    <Text
                      style={[styles.optionLabel, { color: optionLabelClr }]}
                    >
                      {option.label}
                    </Text>
                    <Text
                      style={[
                        styles.optionSubtitle,
                        { color: optionSubtitleClr },
                      ]}
                      numberOfLines={1}
                    >
                      {option.subtitle}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Cancel Button */}
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: cancelBg }]}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelText, { color: cancelTextClr }]}>
                  {translate("common.cancel")}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  header: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.bbg6,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.text5,
    borderRadius: 2,
    marginBottom: 16,
  },
  title: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingVertical: 20,
    justifyContent: "space-between",
  },
  optionButton: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  optionIcon: {
    fontSize: 28,
  },
  optionLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
    marginBottom: 4,
    textAlign: "center",
  },
  optionSubtitle: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.regular,
    color: colors.text4,
    textAlign: "center",
  },
  cancelButton: {
    marginHorizontal: 16,
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.bbg6,
    alignItems: "center",
  },
  cancelText: {
    fontSize: fontSizes.md,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
  },
});

export default MediaPickerModal;
