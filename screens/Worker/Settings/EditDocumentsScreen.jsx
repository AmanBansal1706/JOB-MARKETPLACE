import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import fileIcon from "../../../assets/worker-images/file.png";
import colors from "../../../theme/worker/colors";
import { useFetchWorkerProfile } from "../../../services/WorkerProfileServices";
import { useTranslation } from "../../../hooks/useTranslation";

export default function EditDocumentsScreen() {
  const navigation = useNavigation();
  const { translate } = useTranslation();
  const { data: workerProfile, isPending: isLoadingProfile } =
    useFetchWorkerProfile();

  // Form State
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [criminalDocs, setCriminalDocs] = useState([]);

  // Prefill form from worker profile
  useEffect(() => {
    if (workerProfile) {
      // Map KYC documents (gov_id)
      if (
        workerProfile.kyc_documents &&
        workerProfile.kyc_documents.length > 0
      ) {
        const govIds = workerProfile.kyc_documents.filter(
          (doc) => doc.type === "gov_id",
        );
        if (govIds[0]) setIdFront(govIds[0].file_url);
        if (govIds[1]) setIdBack(govIds[1].file_url);
      }

      // Map Criminal documents
      if (
        workerProfile.criminal_documents &&
        workerProfile.criminal_documents.length > 0
      ) {
        const criminal = workerProfile.criminal_documents.map((doc) => ({
          uri: doc.file_url,
        }));
        setCriminalDocs(criminal);
      }
    }
  }, [workerProfile]);

  const handleSave = () => {
    // TODO: Implement save logic for documents
    // This API is currently not ready. Once available,
    // it should handle multipart/form-data for CURP, RFC, and image uploads.
    Alert.alert(
      translate("workerDocuments.comingSoon"),
      translate("workerDocuments.comingSoonMessage"),
    );
  };

  const pickImage = async (type, index = 0) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const uri = result.assets[0].uri;
        if (type === "front") setIdFront(uri);
        else if (type === "back") setIdBack(uri);
        else if (type === "criminal") {
          setCriminalDocs((prev) => {
            const updated = [...prev];
            updated[index] = { uri };
            return updated;
          });
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const renderUploadBox = (
    title,
    subtitle,
    type,
    index,
    doc,
    disabled = true,
  ) => {
    const showImage = doc?.uri || (typeof doc === "string" && doc);

    return (
      <TouchableOpacity
        style={styles.uploadBox}
        onPress={() => !disabled && pickImage(type, index)}
        activeOpacity={disabled ? 1 : 0.7}
      >
        {showImage ? (
          <Image
            source={{ uri: doc?.uri || doc }}
            style={styles.uploadedImage}
            resizeMode="cover"
          />
        ) : (
          <>
            <View style={styles.uploadIconContainer}>
              <Image
                source={fileIcon}
                style={{ width: 24, height: 30 }}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.uploadText}>{title}</Text>
            <Text style={styles.uploadSubText}>{subtitle}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoadingProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.pink} />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" backgroundColor={colors.primary.pink} />

      {/* Header */}
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {translate("workerDocuments.documents")}
          </Text>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* <Text style={styles.sectionTitle}>
            Update your profile documents and re-submit for admin approval.
          </Text> */}

          <Text style={styles.sectionTitle}>
            {translate("workerDocuments.submittedDocuments")}
          </Text>

          {/* Government ID Upload */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>
                {translate("workerDocuments.govIdUpload")}
              </Text>
              <MaterialCommunityIcons
                name="pencil"
                size={14}
                color={colors.text.secondary}
                style={styles.editIcon}
              />
            </View>
            <View style={styles.idRow}>
              {renderUploadBox(
                translate("workerDocuments.frontImage"),
                translate("workerDocuments.chooseFromGallery"),
                "front",
                0,
                idFront,
              )}
              <View style={styles.idSpacer} />
              {renderUploadBox(
                translate("workerDocuments.backImage"),
                translate("workerDocuments.chooseFromGallery"),
                "back",
                1,
                idBack,
              )}
            </View>
          </View>

          {/* Criminal Record */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>
                {translate("workerDocuments.criminalRecord")}
              </Text>
              <MaterialCommunityIcons
                name="pencil"
                size={14}
                color={colors.text.secondary}
                style={styles.editIcon}
              />
            </View>
            <View style={styles.idRow}>
              {renderUploadBox(
                translate("workerDocuments.frontPhoto"),
                translate("workerDocuments.chooseFromGallery"),
                "criminal",
                0,
                criminalDocs[0],
              )}
              <View style={styles.idSpacer} />
              {renderUploadBox(
                translate("workerDocuments.backPhoto"),
                translate("workerDocuments.chooseFromGallery"),
                "criminal",
                1,
                criminalDocs[1],
              )}
            </View>
          </View>

          {/* Save Button */}
          {/* <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>SAVE</Text>
          </TouchableOpacity> */}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  headerSafeArea: {
    backgroundColor: colors.primary.pink,
    zIndex: 10,
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: colors.primary.pink,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: colors.auth.darkRed,
    marginBottom: 25,
    lineHeight: 26,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: colors.text.primary,
  },
  editIcon: {
    marginLeft: 8,
  },
  section: {
    marginBottom: 20,
    marginTop: 10,
  },
  idRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  uploadBox: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.primary.pink,
    borderStyle: "dashed",
    borderRadius: 10,
    backgroundColor: colors.white,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    position: "relative",
    overflow: "hidden",
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  uploadIconContainer: {
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 10,
    fontFamily: "Poppins_500Medium",
    color: colors.primary.pink,
    textAlign: "center",
    marginBottom: 2,
  },
  uploadSubText: {
    fontSize: 9,
    fontFamily: "Poppins_400Regular",
    color: colors.primary.pink,
    textAlign: "center",
  },
  idSpacer: {
    width: 15,
  },
  saveButton: {
    backgroundColor: colors.primary.pink,
    borderRadius: 10,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    shadowColor: colors.primary.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 1,
  },
});
