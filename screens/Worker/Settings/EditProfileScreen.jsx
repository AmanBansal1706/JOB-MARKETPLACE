import {
  Feather,
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
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
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import locationPinIcon from "../../../assets/worker-images/location-pin.png";
import colors from "../../../theme/worker/colors";
import {
  useFetchWorkerProfile,
  useUpdateWorkerProfile,
} from "../../../services/WorkerProfileServices";
import { LocationSelector } from "../../../components/profile";
import { useTranslation } from "../../../hooks/useTranslation";
import { formatDobDisplay, parseDate } from "../../../utils/dateFormatting";

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { translate } = useTranslation();

  // Fetch worker profile
  const {
    data: workerProfile,
    isPending: isLoadingProfile,
    refetch,
  } = useFetchWorkerProfile();

  // Form State - Only profile picture and location are editable
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState(null);
  const [gender, setGender] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [location, setLocation] = useState(null);
  const [curp, setCurp] = useState("");
  const [rfc, setRfc] = useState("");

  // Update profile hook
  const { mutate: updateProfile, isPending: isUpdating } =
    useUpdateWorkerProfile();

  // Prefill form from worker profile
  useEffect(() => {
    if (workerProfile?.user) {
      setFirstName(workerProfile.user.first_name || "");
      setLastName(workerProfile.user.last_name || "");
      setEmail(workerProfile.user.email || "");
      setPhone(workerProfile.user.mobile || "");
      setProfilePicture(workerProfile.user.profile_picture || null);

      if (workerProfile.worker_profile) {
        const profile = workerProfile.worker_profile;
        setDob(profile.dob ? parseDate(profile.dob) : null);
        setGender(profile.gender || "");
        setCurp(profile.curp || "");
        setRfc(profile.rfc || "");

        // Prefill location object for LocationSelector
        if (profile.lat && profile.lng && profile.address) {
          setLocation({
            address: profile.address,
            lat: parseFloat(profile.lat),
            lng: parseFloat(profile.lng),
            addressDetails: {
              interiorNumber: "",
              street: "",
              colonia: "",
              postalCode: "",
              city: "",
              state: "",
            },
          });
        }
      }
    }
  }, [workerProfile]);

  // Handle location change
  const handleLocationChange = (locationData) => {
    setLocation(locationData);
  };

  // Image picker for profile picture
  const pickProfilePicture = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          translate("workerEditProfile.permissionNeeded"),
          translate("workerEditProfile.grantCameraPermission"),
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(
        translate("workerCommon.error"),
        translate("workerEditProfile.failedPickImage"),
      );
    }
  };

  const handleSave = () => {
    // Basic validation
    if (!profilePicture && !location) {
      Alert.alert(
        translate("workerCommon.error"),
        translate("workerEditProfile.nothingToUpdate"),
      );
      return;
    }

    const updateData = {
      profile_picture: profilePicture,
      lat: location?.lat,
      lng: location?.lng,
      address: location?.address,
    };

    updateProfile(updateData, {
      onSuccess: () => {
        Alert.alert(
          translate("workerCommon.success"),
          translate("workerEditProfile.profileUpdated"),
          [
            {
              text: "OK",
              onPress: () => {
                refetch();
                navigation.goBack();
              },
            },
          ],
        );
      },
      onError: (error) => {
        Alert.alert(
          translate("workerCommon.error"),
          error.message || translate("workerEditProfile.failedUpdateProfile"),
        );
      },
    });
  };

  // Show loading state
  if (isLoadingProfile) {
    return (
      <View style={styles.mainContainer}>
        <StatusBar style="light" backgroundColor={colors.primary.pink} />
        <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Feather name="arrow-left" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {translate("workerEditProfile.edit")}
            </Text>
          </View>
        </SafeAreaView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.pink} />
          <Text style={styles.loadingText}>
            {translate("workerEditProfile.loadingProfile")}
          </Text>
        </View>
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
            {translate("workerEditProfile.edit")}
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
          <Text style={styles.sectionTitle}>
            {translate("workerEditProfile.updateProfileDetails")}
          </Text>

          {/* Avatar Section - Editable */}
          <View style={styles.avatarContainer}>
            <TouchableOpacity
              style={styles.avatar}
              onPress={pickProfilePicture}
              activeOpacity={0.8}
            >
              {profilePicture ? (
                <Image
                  source={{ uri: profilePicture }}
                  style={styles.avatarImage}
                />
              ) : (
                <FontAwesome5
                  name="user-alt"
                  size={50}
                  color={colors.text.tertiary}
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={pickProfilePicture}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={14}
                color={colors.white}
              />
            </TouchableOpacity>
          </View>

          {/* First Name - View Only */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {translate("workerEditProfile.firstName")}
            </Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={firstName}
              editable={false}
            />
          </View>

          {/* Last Name - View Only */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {translate("workerEditProfile.lastName")}
            </Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={lastName}
              editable={false}
            />
          </View>

          {/* Email - View Only */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {translate("workerEditProfile.email")}
            </Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={email}
              editable={false}
              keyboardType="email-address"
            />
          </View>

          {/* Phone - View Only */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {translate("workerEditProfile.phone")}
            </Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={phone}
              editable={false}
              keyboardType="phone-pad"
            />
          </View>

          {/* Gender - View Only */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {translate("workerEditProfile.gender")}
            </Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={gender || translate("workerEditProfile.notSpecified")}
              editable={false}
            />
          </View>

          {/* Age - View Only */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {translate("workerEditProfile.dateOfBirth")}
            </Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={
                dob
                  ? formatDobDisplay(dob)
                  : translate("workerEditProfile.notSpecified")
              }
              editable={false}
            />
          </View>

          {/* CURP - View Only */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {translate("workerEditProfile.curpLabel")}
            </Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={curp}
              editable={false}
            />
          </View>

          {/* RFC - View Only */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {translate("workerEditProfile.rfcLabel")}
            </Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={rfc}
              editable={false}
            />
          </View>

          {/* Home Address - Editable with LocationSelector */}
          <LocationSelector
            label={translate("workerEditProfile.homeAddress")}
            placeholder={translate("workerEditProfile.tapSelectAddress")}
            currentLocation={location}
            onLocationChange={handleLocationChange}
            isEditing={true}
            required={false}
            showEditIcon={true}
          />

          {/* Language - Commented out as requested */}
          {/* <View style={[styles.inputGroup, { zIndex: 100 }]}>
             <View style={styles.labelRow}>
              <Text style={styles.label}>Language</Text>
              <MaterialCommunityIcons
                name="pencil"
                size={14}
                color={colors.text.secondary}
                style={styles.editIcon}
              />
            </View>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                  setShowLanguageDropdown(!showLanguageDropdown);
                  setShowGenderDropdown(false);
              }}
            >
              <Text style={styles.dropdownText}>{language}</Text>
              <Feather name="chevron-down" size={20} color={colors.text.primary} />
            </TouchableOpacity>

            {showLanguageDropdown && (
              <View style={styles.dropdownList}>
                {languages.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setLanguage(item.value);
                      setShowLanguageDropdown(false);
                    }}
                  >
                    <MaterialIcons
                      name={item.icon}
                      size={18}
                      color={colors.text.secondary}
                      style={{ marginRight: 10 }}
                    />
                    <Text style={styles.dropdownItemText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View> */}

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>
                {translate("workerEditProfile.saveButton")}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.white, // Screen background is white in Figma (inputs are pinkish)
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
    marginBottom: 30,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 30,
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.ui.avatarBackground,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 5,
    right: "30%", // Adjusted to align with the circle edge
    backgroundColor: colors.ui.blueEditButton, // Blue color from Figma
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: colors.text.primary,
  },
  inputGroup: {
    marginBottom: 20,
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
    marginBottom: 8,
  },
  editIcon: {
    marginLeft: 8,
  },
  input: {
    backgroundColor: colors.ui.inputPinkBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.ui.inputBorderGray,
    paddingHorizontal: 15,
    minHeight: 50,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.inputContent,
  },
  disabledInput: {
    backgroundColor: "#F5F5F5",
    color: "#999",
  },
  saveButton: {
    backgroundColor: colors.primary.pink,
    borderRadius: 10,
    minHeight: 55,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
    paddingVertical: 15,
    shadowColor: colors.primary.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: "#CCC",
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 1,
  },
});
