import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { colors, fonts } from "../../theme";
import { getDocumentStatusInfo } from "../../utils/profileValidation";

export default function DocumentUpload({
  label,
  imageUri,
  docStatus,
  isEditing,
  onPickImage,
  onOpenCamera,
}) {
  const getDocumentTypeShort = (label) => {
    if (label.includes("Front")) return "ID Front";
    if (label.includes("Back")) return "ID Back";
    if (label.includes("Selfie")) return "Selfie";
    return label;
  };

  const renderDocumentStatus = () => {
    if (!docStatus?.status) return null;

    const statusInfo = getDocumentStatusInfo(docStatus.status);

    return (
      <View style={styles.documentStatusBadge}>
        <FontAwesome5
          name={statusInfo.icon}
          size={12}
          color={statusInfo.color}
          solid
        />
        <Text style={[styles.documentStatusText, { color: statusInfo.color }]}>
          {getDocumentTypeShort(label)}: {statusInfo.label}
        </Text>
      </View>
    );
  };

  const renderRejectionReason = () => {
    if (!docStatus?.rejection_reason) return null;

    return (
      <Text style={styles.docRejectionText}>{docStatus.rejection_reason}</Text>
    );
  };

  return (
    <View style={styles.documentCard}>
      <Text style={styles.documentLabel}>{label}</Text>

      {imageUri ? (
        <View style={styles.documentPreviewContainer}>
          <View style={styles.documentWrapper}>
            <Image source={{ uri: imageUri }} style={styles.documentImage} />
            {renderDocumentStatus()}
            {renderRejectionReason()}
          </View>

          {isEditing && (
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={() => {
                const isSelfie = label.includes("Selfie");
                const title = `Change ${isSelfie ? "Selfie" : "Photo"}`;

                if (isSelfie) {
                  onOpenCamera();
                } else {
                  Alert.alert(title, "Choose option", [
                    { text: "Gallery", onPress: onPickImage },
                    { text: "Camera", onPress: onOpenCamera },
                    { text: "Cancel", style: "cancel" },
                  ]);
                }
              }}
            >
              <FontAwesome5 name="camera" size={14} color={colors.tertiary} />
              <Text style={styles.changePhotoText}>
                {label.includes("Selfie") ? "Retake Selfie" : "Change Photo"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : isEditing ? (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => {
            const isSelfie = label.includes("Selfie");
            const title = `Upload ${isSelfie ? "Selfie" : "Photo"}`;

            if (isSelfie) {
              onOpenCamera();
            } else {
              Alert.alert(title, "Choose option", [
                { text: "Gallery", onPress: onPickImage },
                { text: "Camera", onPress: onOpenCamera },
                { text: "Cancel", style: "cancel" },
              ]);
            }
          }}
        >
          <FontAwesome5
            name={label.includes("Selfie") ? "camera" : "cloud-upload-alt"}
            size={24}
            color={colors.tertiary}
          />
          <Text style={styles.uploadButtonText}>
            {label.includes("Selfie") ? "Take Selfie" : "Upload Photo"}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.emptyDocumentContainer}>
          <FontAwesome5 name="file-upload" size={28} color="#BDBDBD" />
          <Text style={styles.emptyDocumentText}>
            {label.includes("Selfie") ? "Selfie" : "Document"} not yet uploaded
          </Text>
          <Text style={styles.emptyDocumentSubtext}>
            Enable edit mode to upload{" "}
            {label.includes("Selfie") ? "your selfie" : "this document"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  documentCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  documentLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: "#000",
    marginBottom: 12,
  },
  documentPreviewContainer: {
    width: "100%",
  },
  documentWrapper: {
    width: "100%",
    marginBottom: 8,
  },
  documentImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    resizeMode: "cover",
  },
  documentStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  documentStatusText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    marginLeft: 6,
  },
  docRejectionText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: "#F44336",
    marginTop: 6,
    fontStyle: "italic",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.tertiary + "15",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.tertiary,
    borderStyle: "dashed",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  uploadButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.tertiary,
    marginLeft: 8,
  },
  changePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.tertiary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  changePhotoText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.tertiary,
    marginLeft: 6,
  },
  emptyDocumentContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  emptyDocumentText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: "#666",
    marginTop: 12,
    textAlign: "center",
  },
  emptyDocumentSubtext: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: "#999",
    marginTop: 6,
    textAlign: "center",
  },
});
