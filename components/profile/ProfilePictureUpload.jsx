import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, fonts } from "../../theme";
import { useTranslation } from "../../hooks/useTranslation";

export default function ProfilePictureUpload({
  imageUri,
  onPickImage,
  onOpenCamera,
  isEditing,
  isLoading = false,
}) {
  const { translate } = useTranslation();
  return (
    <View style={styles.container}>
      <View style={styles.profilePictureContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholderContainer}>
            <MaterialCommunityIcons
              name="account-circle"
              size={80}
              color={colors.tertiary}
            />
          </View>
        )}

        {isEditing && (
          <View style={styles.editButtonsContainer}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={onOpenCamera}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <MaterialCommunityIcons name="camera" size={20} color="#fff" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.editButton}
              onPress={onPickImage}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <MaterialCommunityIcons
                  name="image-plus"
                  size={20}
                  color="#fff"
                />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={styles.label}>{translate("profile.profilePicture")}</Text>
      {isEditing && (
        <Text style={styles.helperText}>
          Tap the icons to take a photo or upload from gallery
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 28,
  },
  profilePictureContainer: {
    position: "relative",
    marginBottom: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E0E0E0",
  },
  placeholderContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.tertiary,
    borderStyle: "dashed",
  },
  editButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tertiary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: "#000",
  },
  helperText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: "#999",
    marginTop: 4,
    textAlign: "center",
  },
});
