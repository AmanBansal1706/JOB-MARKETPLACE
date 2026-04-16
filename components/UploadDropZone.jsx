import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Alert,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { colors, fonts, fontSizes } from "../theme";
import { useTranslation } from "../hooks/useTranslation";

export default function UploadDropZone({
  value = [],
  onChange = () => {},
  disabled = false,
  hint = "Tap to upload evidence or documents",
  maxFiles = 5, // Default to 5, but can be overridden
}) {
  const { translate } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [fullScreenImageUri, setFullScreenImageUri] = useState(null);
  const isFull = value.length >= maxFiles; // Use configurable limit

  const pickImage = async (source) => {
    try {
      setIsLoading(true);

      if (source === "camera") {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            "Permission Denied",
            "Camera permission is required to take photos."
          );
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          quality: 0.8,
          allowsEditing: false,
        });

        if (!result.canceled && result.assets?.length > 0) {
          const maxAllowed = maxFiles - value.length;
          if (maxAllowed <= 0) {
            Alert.alert(
              translate("jobs.limitReached"),
              translate("jobs.pleaseRemoveFiles")
            );
            return;
          }

          const newAssets = result.assets.map((asset) => ({
            uri: asset.uri,
            type: asset.type || "image",
            fileName:
              asset.fileName || `photo_${Date.now()}_${Math.random()}.jpg`,
          }));

          onChange([...value, ...newAssets]);
        }
      } else if (source === "gallery") {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            "Permission Denied",
            "Gallery permission is required to access your photos."
          );
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          quality: 0.8,
          allowsEditing: false,
          allowsMultipleSelection: maxFiles - value.length > 1,
          selectionLimit: maxFiles - value.length,
        });

        if (!result.canceled && result.assets?.length > 0) {
          const maxAllowed = maxFiles - value.length;
          const assetsToUse = result.assets.slice(0, maxAllowed);

          const newAssets = assetsToUse.map((asset) => ({
            uri: asset.uri,
            type: asset.type || "image",
            fileName:
              asset.fileName || `image_${Date.now()}_${Math.random()}.jpg`,
          }));

          if (newAssets.length > 0) {
            onChange([...value, ...newAssets]);
          }

          if (result.assets.length > maxAllowed) {
            Alert.alert(
              translate("jobs.limitReached"),
              translate("jobs.onlyFirstFilesAdded").replace(
                "{count}",
                maxAllowed
              )
            );
          }
        }
      }
    } catch (error) {
      Alert.alert(
        translate("common.error"),
        "Failed to pick image. Please try again."
      );
      console.error("Image picker error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = (index) => {
    const updatedFiles = value.filter((_, i) => i !== index);
    onChange(updatedFiles);
  };

  return (
    <View style={styles.container}>
      {/* Full Screen Image Modal */}
      <Modal
        visible={!!fullScreenImageUri}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setFullScreenImageUri(null)}
      >
        <View style={styles.fullScreenOverlay}>
          <Pressable
            style={styles.fullScreenCloseButton}
            onPress={() => setFullScreenImageUri(null)}
          >
            <Text style={styles.fullScreenCloseText}>✕</Text>
          </Pressable>
          <Image
            source={{ uri: fullScreenImageUri }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </View>
      </Modal>

      {/* Upload Zone */}
      <Pressable
        style={[styles.uploadBox, disabled && styles.uploadBoxDisabled]}
        onPress={() => {
          if (!disabled && !isLoading && !isFull) {
            Alert.alert("Upload Evidence", "Choose how you want to upload", [
              {
                text: "Camera",
                onPress: () => pickImage("camera"),
              },
              {
                text: "Gallery",
                onPress: () => pickImage("gallery"),
              },
              {
                text: "Cancel",
                onPress: () => {},
                style: "cancel",
              },
            ]);
          }
        }}
        disabled={disabled || isLoading}
      >
        {isLoading ? (
          <View style={styles.uploadContent}>
            <ActivityIndicator size="large" color={colors.tertiary} />
            <Text style={styles.loadingText}>Uploading...</Text>
          </View>
        ) : value.length > 0 ? (
          <View style={styles.uploadContent}>
            <View style={styles.multiplePreviewContainer}>
              {value.map((file, index) => (
                <Pressable
                  key={`${file.uri}-${index}`}
                  style={styles.previewImageWrapper}
                  onPress={() => setFullScreenImageUri(file.uri)}
                  disabled={disabled}
                >
                  <Image
                    source={{ uri: file.uri }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                  {!disabled && (
                    <Pressable
                      style={styles.removeButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                    >
                      <Text style={styles.removeButtonText}>×</Text>
                    </Pressable>
                  )}
                </Pressable>
              ))}
              {!isFull && (
                <Pressable
                  style={styles.addMoreButton}
                  onPress={() => {
                    Alert.alert("Add More", "Choose how you want to upload", [
                      {
                        text: "Camera",
                        onPress: () => pickImage("camera"),
                      },
                      {
                        text: "Gallery",
                        onPress: () => pickImage("gallery"),
                      },
                      {
                        text: "Cancel",
                        onPress: () => {},
                        style: "cancel",
                      },
                    ]);
                  }}
                  disabled={disabled}
                >
                  <Text style={styles.addMoreText}>+</Text>
                </Pressable>
              )}
            </View>
            <Text style={styles.uploadedFileName}>
              {value.length} image(s) uploaded
            </Text>
            <Pressable
              style={styles.replaceLink}
              onPress={(e) => {
                e.stopPropagation();
                Alert.alert(
                  "Replace All Evidence",
                  "Do you want to replace all current evidence?",
                  [
                    {
                      text: "Camera",
                      onPress: () => pickImage("camera"),
                    },
                    {
                      text: "Gallery",
                      onPress: () => pickImage("gallery"),
                    },
                    {
                      text: "Cancel",
                      onPress: () => {},
                      style: "cancel",
                    },
                  ]
                );
              }}
              disabled={disabled}
            >
              <Text style={styles.replaceLink}>Replace All</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.uploadContent}>
            <Image
              source={require("../assets/images/upload.png")}
              style={styles.uploadIcon}
              resizeMode="contain"
            />
            <Text style={styles.uploadTitle}>
              {translate("jobs.idUploadFront") || "ID upload front photo field"}
            </Text>
            <Text style={styles.uploadHint}>
              {translate("jobs.chooseFromGalleryOrCamera") ||
                "(Choose from Gallery or Camera)"}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
  },
  fullScreenCloseButton: {
    position: "absolute",
    top: 40,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  fullScreenCloseText: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.tertiary,
    borderRadius: 12,
    backgroundColor: "#F0F7F4",
    minHeight: 200,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  uploadBoxDisabled: {
    opacity: 0.6,
    backgroundColor: "#E8E8E8",
    borderColor: "#CCCCCC",
  },
  uploadBoxFull: {
    minHeight: 180,
    borderStyle: "solid",
    borderColor: colors.tertiary,
    backgroundColor: "#F0F7F4",
  },
  uploadContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 12,
  },
  uploadIcon: {
    width: 64,
    height: 64,
    marginBottom: 8,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E8F5F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  iconEmoji: {
    fontSize: 36,
  },
  uploadTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.md,
    color: colors.textdark,
    marginBottom: 4,
  },
  uploadHint: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.xs,
    color: colors.text5,
    textAlign: "center",
    marginBottom: 12,
  },
  loadingText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.sm,
    color: colors.tertiary,
    marginTop: 8,
  },
  smallPreviewContainer: {
    position: "relative",
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    marginBottom: 16,
  },
  smallPreviewImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E8E8E8",
  },
  smallRemoveButton: {
    position: "absolute",
    top: -0,
    right: -0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#DB2B2E",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  uploadedFileName: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.xs,
    color: colors.textdark,
    marginBottom: 12,
    textAlign: "center",
    maxWidth: 200,
  },
  replaceLink: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.xs,
    color: colors.tertiary,
    textDecorationLine: "underline",
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    justifyContent: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 120,
  },
  galleryBtn: {
    backgroundColor: "#E8F5F2",
    borderWidth: 1.5,
    borderColor: colors.tertiary,
  },
  cameraBtn: {
    backgroundColor: colors.tertiary,
    borderWidth: 0,
  },
  buttonIcon: {
    width: 18,
    height: 18,
    tintColor: colors.tertiary,
  },
  cameraBtnIcon: {
    tintColor: colors.text,
  },
  buttonEmoji: {
    fontSize: 18,
  },
  buttonEmojiCamera: {
    fontSize: 18,
  },
  galleryBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.xs,
    color: colors.tertiary,
    fontWeight: "600",
  },
  cameraBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.xs,
    color: colors.text,
    fontWeight: "600",
  },
  previewSection: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
  previewTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.sm,
    color: colors.textdark,
    marginBottom: 12,
    marginLeft: 8,
  },
  previewContent: {
    paddingHorizontal: 4,
    gap: 12,
    paddingBottom: 4,
  },
  previewContainer: {
    position: "relative",
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  previewImageLarge: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E8E8E8",
  },
  replaceButton: {
    position: "absolute",
    bottom: 12,
    left: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.tertiary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  replaceButtonIcon: {
    fontSize: 20,
  },
  removeButtonLarge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#DB2B2E",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  previewItem: {
    position: "relative",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#E8E8E8",
  },
  removeButton: {
    position: "absolute",
    top: -0,
    right: -0,
    width: 25,
    height: 25,
    borderRadius: 16,
    backgroundColor: "#DB2B2E",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  removeButtonText: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: "bold",
  },
  // Multiple image preview styles
  multiplePreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginBottom: 12,
  },
  previewImageWrapper: {
    width: 70,
    height: 70,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  addMoreButton: {
    width: 70,
    height: 70,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.tertiary,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F7F4",
  },
  addMoreText: {
    fontSize: 32,
    color: colors.tertiary,
    fontWeight: "bold",
  },
});
