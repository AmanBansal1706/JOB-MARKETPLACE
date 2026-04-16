import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
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
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import fileIcon from "../../../assets/worker-images/file.png";
import scoreIcon from "../../../assets/worker-images/score.png";
import colors from "../../../theme/worker/colors";
import { LocationSelector } from "../../../components/profile";
import {
  useFetchWorkerProfile,
  useFetchPositions,
  useCompleteWorkerProfile,
} from "../../../services/WorkerProfileServices";
import { useTranslation } from "../../../hooks/useTranslation";
import {
  formatDobDisplay,
  formatDobForApi,
  parseDate,
} from "../../../utils/dateFormatting";

export default function ProfileSetupScreen() {
  const navigation = useNavigation();
  const { translate } = useTranslation();

  // Fetch worker profile and positions
  const { data: workerProfile, isPending: isLoadingProfile } =
    useFetchWorkerProfile();
  const { data: positions, isPending: isLoadingPositions } =
    useFetchPositions();
  const { mutate: completeProfile, isPending: isSubmitting } =
    useCompleteWorkerProfile();

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [description, setDescription] = useState("");
  const [dob, setDob] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAge, setShowAge] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

  // Gender Dropdown State
  const [gender, setGender] = useState("");
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showGender, setShowGender] = useState(false);

  // Position State - Multiple selection
  const [selectedPositions, setSelectedPositions] = useState([]);
  const [showPositionDropdown, setShowPositionDropdown] = useState(false);

  // Address & ID State
  const [location, setLocation] = useState(null);
  const [curp, setCurp] = useState("");
  const [rfc, setRfc] = useState("");

  // Document uploads
  const [govIdDocs, setGovIdDocs] = useState([]);
  const [kycDocs, setKycDocs] = useState([]);
  const [criminalDocs, setCriminalDocs] = useState([]);

  // DOB limits (min age 18)
  const maxDob = new Date();
  maxDob.setFullYear(maxDob.getFullYear() - 18);
  const minDob = new Date(1900, 0, 1);

  // Prefill form from worker profile
  useEffect(() => {
    if (workerProfile?.user) {
      // User data
      setFirstName(workerProfile.user.first_name || "");
      setLastName(workerProfile.user.last_name || "");
      setEmail(workerProfile.user.email || "");
      setMobile(workerProfile.user.mobile || "");
      setProfilePicture(workerProfile.user.profile_picture || null);

      // Worker profile data
      if (workerProfile.worker_profile) {
        const profile = workerProfile.worker_profile;
        setDescription(profile.profile_description || "");
        setDob(profile.dob ? parseDate(profile.dob) : null);
        setShowAge(profile.show_age === 1 || profile.show_age === "1");
        setGender(profile.gender || "");
        setShowGender(profile.show_gender === 1 || profile.show_gender === "1");
        setCurp(profile.curp || "");
        setRfc(profile.rfc || "");

        // Location data
        if (profile.lat && profile.lng && profile.address) {
          setLocation({
            lat: parseFloat(profile.lat),
            lng: parseFloat(profile.lng),
            address: profile.address,
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

      // Positions data
      if (workerProfile.positions && workerProfile.positions.length > 0) {
        const mappedPositions = workerProfile.positions.map((pos) => {
          // Normalize experience_level to match UI format (capitalize first letter)
          const normalizedLevel =
            pos.experience_level.charAt(0).toUpperCase() +
            pos.experience_level.slice(1).toLowerCase();

          return {
            id: pos.position_id,
            name: pos.position,
            experience_level: normalizedLevel,
          };
        });
        setSelectedPositions(mappedPositions);
      }

      // KYC documents (gov_id)
      if (
        workerProfile.kyc_documents &&
        workerProfile.kyc_documents.length > 0
      ) {
        const govIds = workerProfile.kyc_documents
          .filter((doc) => doc.type === "gov_id")
          .map((doc) => ({ uri: doc.file_url }));
        setGovIdDocs(govIds);
      }

      // Criminal documents
      if (
        workerProfile.criminal_documents &&
        workerProfile.criminal_documents.length > 0
      ) {
        const criminalDocs = workerProfile.criminal_documents.map((doc) => ({
          uri: doc.file_url,
        }));
        setCriminalDocs(criminalDocs);
      }
    }
  }, [workerProfile]);

  const genders = [
    { label: translate("workerAuth.male"), value: "Male", icon: "male" },
    { label: translate("workerAuth.female"), value: "Female", icon: "female" },
    {
      label: translate("workerAuth.other"),
      value: "Other",
      icon: "transgender",
    },
  ];

  const expertiseLevels = [
    {
      label: translate("workerAuth.beginnerLevel"),
      value: "Beginner",
      icon: scoreIcon,
    },
    {
      label: translate("workerAuth.intermediateLevel"),
      value: "Intermediate",
      icon: scoreIcon,
    },
    {
      label: translate("workerAuth.expertLevel"),
      value: "Expert",
      icon: scoreIcon,
    },
  ];

  // Handle position selection (multiple)
  const handlePositionToggle = (positionId, positionName) => {
    setSelectedPositions((prev) => {
      const existingIndex = prev.findIndex((p) => p.id === positionId);
      if (existingIndex > -1) {
        // Remove position
        return prev.filter((p) => p.id !== positionId);
      } else {
        // Add position with default expertise
        return [
          ...prev,
          { id: positionId, name: positionName, experience_level: "Beginner" },
        ];
      }
    });
  };

  // Update expertise level for a position
  const handleExpertiseChange = (positionId, expertiseLevel) => {
    setSelectedPositions((prev) =>
      prev.map((p) =>
        p.id === positionId ? { ...p, experience_level: expertiseLevel } : p,
      ),
    );
  };

  // Check if a position is selected
  const isPositionSelected = (positionId) => {
    return selectedPositions.some((p) => p.id === positionId);
  };

  // Get selected position by ID
  const getSelectedPosition = (positionId) => {
    return selectedPositions.find((p) => p.id === positionId);
  };

  // Handle location change
  const handleLocationChange = (locationData) => {
    setLocation(locationData);
  };

  // Image picker functions
  const pickProfilePicture = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          translate("workerAuth.permissionRequired"),
          translate("workerAuth.galleryPermissionRequired"),
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking profile picture:", error);
      Alert.alert(
        translate("workerCommon.error"),
        translate("workerAuth.failedPickImage"),
      );
    }
  };

  const pickDocument = async (docType, index) => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          translate("workerAuth.permissionRequired"),
          translate("workerAuth.galleryPermissionRequired"),
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const newDoc = { uri: result.assets[0].uri };

        switch (docType) {
          case "gov_id":
            setGovIdDocs((prev) => {
              const updated = [...prev];
              updated[index] = newDoc;
              return updated;
            });
            break;
          case "kyc":
            setKycDocs((prev) => {
              const updated = [...prev];
              updated[index] = newDoc;
              return updated;
            });
            break;
          case "criminal":
            setCriminalDocs((prev) => {
              const updated = [...prev];
              updated[index] = newDoc;
              return updated;
            });
            break;
        }
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert(
        translate("workerCommon.error"),
        translate("workerAuth.failedPickDocument"),
      );
    }
  };

  const removeDocument = (docType, index) => {
    switch (docType) {
      case "gov_id":
        setGovIdDocs((prev) => {
          const updated = [...prev];
          updated[index] = null;
          return updated;
        });
        break;
      case "kyc":
        setKycDocs((prev) => {
          const updated = [...prev];
          updated[index] = null;
          return updated;
        });
        break;
      case "criminal":
        setCriminalDocs((prev) => {
          const updated = [...prev];
          updated[index] = null;
          return updated;
        });
        break;
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!profilePicture) {
      Alert.alert(
        translate("workerAuth.validationError"),
        translate("workerAuth.uploadProfilePicture"),
      );
      return;
    }

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !mobile.trim()
    ) {
      Alert.alert(
        translate("workerAuth.validationError"),
        translate("workerAuth.personalDetailsMissing"),
      );
      return;
    }

    if (!description.trim()) {
      Alert.alert(
        translate("workerAuth.validationError"),
        translate("workerAuth.enterProfileDescription"),
      );
      return;
    }

    if (!dob) {
      Alert.alert(
        translate("workerAuth.validationError"),
        translate("workerAuth.selectDobRequired"),
      );
      return;
    }

    if (!gender) {
      Alert.alert(
        translate("workerAuth.validationError"),
        translate("workerAuth.selectGenderRequired"),
      );
      return;
    }

    if (selectedPositions.length === 0) {
      Alert.alert(
        translate("workerAuth.validationError"),
        translate("workerAuth.selectOnePosition"),
      );
      return;
    }

    if (!govIdDocs[0] || !govIdDocs[1]) {
      Alert.alert(
        translate("workerAuth.validationError"),
        translate("workerAuth.uploadBothGovId"),
      );
      return;
    }

    if (!location) {
      Alert.alert(
        translate("workerAuth.validationError"),
        translate("workerAuth.selectHomeAddress"),
      );
      return;
    }

    if (!curp || curp.length !== 18) {
      Alert.alert(
        translate("workerAuth.validationError"),
        translate("workerAuth.curpExactly18"),
      );
      return;
    }

    if (!rfc || rfc.length !== 13) {
      Alert.alert(
        translate("workerAuth.validationError"),
        translate("workerAuth.rfcExactly13"),
      );
      return;
    }

    // Prepare data for API
    const profileData = {
      first_name: firstName,
      last_name: lastName,
      profile_description: description,
      dob: dob ? formatDobForApi(dob) : undefined,
      show_age: showAge,
      gender: gender || undefined,
      show_gender: showGender,
      curp: curp || undefined,
      rfc: rfc || undefined,
      location: location,
      positions: selectedPositions.map((p) => ({
        position_id: p.id,
        experience_level: p.experience_level,
      })),
      profile_picture: profilePicture,
      gov_id: govIdDocs.filter((doc) => doc !== null),
      kyc_documents: kycDocs.filter((doc) => doc !== null),
      criminal_documents: criminalDocs.filter((doc) => doc !== null),
    };

    completeProfile(profileData, {
      onSuccess: () => {
        Alert.alert(
          translate("workerCommon.success"),
          translate("workerAuth.profileCompleted"),
          [
            {
              text: translate("workerCommon.ok"),
              onPress: () => navigation.replace("WorkerTabs"),
            },
          ],
        );
      },
      onError: (error) => {
        Alert.alert(
          translate("workerCommon.error"),
          error.message || translate("workerAuth.failedCompleteProfile"),
        );
      },
    });
  };

  const renderUploadBox = (title, subtitle, docType, index, doc) => {
    if (doc) {
      // Show image with cross button
      return (
        <View style={styles.uploadBox}>
          <Image
            source={{ uri: doc.uri }}
            style={styles.uploadedImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={() => removeDocument(docType, index)}
          >
            <Feather name="x" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      );
    }

    // Show upload placeholder
    return (
      <TouchableOpacity
        style={styles.uploadBox}
        onPress={() => pickDocument(docType, index)}
      >
        <View style={styles.uploadIconContainer}>
          <Image
            source={fileIcon}
            style={{ width: 24, height: 30 }}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.uploadText}>{title}</Text>
        <Text style={styles.uploadSubText}>{subtitle}</Text>
      </TouchableOpacity>
    );
  };

  // Show loading state
  if (isLoadingProfile || isLoadingPositions) {
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
              {translate("workerAuth.completeProfile")}
            </Text>
          </View>
        </SafeAreaView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.pink} />
          <Text style={styles.loadingText}>
            {translate("workerAuth.loadingProfileData")}
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
            {translate("workerAuth.completeProfile")}
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
            {translate("workerAuth.pleaseCompleteProfile")}
          </Text>

          {/* Avatar Section */}
          <View style={styles.avatarContainer}>
            <TouchableOpacity
              style={styles.avatar}
              onPress={pickProfilePicture}
              activeOpacity={0.8}
            >
              {profilePicture ? (
                <Image
                  source={{ uri: profilePicture }}
                  style={{ width: 100, height: 100, borderRadius: 50 }}
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

          {/* Form Fields */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {translate("workerAuth.firstName")}
            </Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={firstName}
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate("workerAuth.lastName")}</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={lastName}
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate("workerAuth.email")}</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={email}
              editable={false}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate("workerAuth.mobile")}</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={mobile}
              editable={false}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {translate("workerAuth.profileDescription")}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder={translate("workerAuth.describeProfile")}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {translate("workerAuth.dateOfBirth")}
            </Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.datePickerText,
                  !dob && { color: colors.text.secondary },
                ]}
              >
                {dob
                  ? formatDobDisplay(dob)
                  : translate("workerAuth.selectDob")}
              </Text>
              <Feather
                name="calendar"
                size={18}
                color={colors.text.secondary}
              />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dob || maxDob}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                maximumDate={maxDob}
                minimumDate={minDob}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (selectedDate) setDob(selectedDate);
                }}
              />
            )}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setShowAge(!showAge)}
            >
              <View
                style={[styles.checkbox, showAge && styles.checkboxChecked]}
              >
                {showAge && (
                  <Feather name="check" size={10} color={colors.white} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                {translate("workerAuth.showAgeQuestion")}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.inputGroup, { zIndex: 100 }]}>
            <Text style={styles.label}>{translate("workerAuth.gender")}</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowGenderDropdown(!showGenderDropdown)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !gender && { color: colors.text.secondary },
                ]}
              >
                {gender || translate("workerAuth.selectGender")}
              </Text>
              <Feather
                name="chevron-down"
                size={20}
                color={colors.text.primary}
              />
            </TouchableOpacity>

            {showGenderDropdown && (
              <View style={styles.dropdownList}>
                {genders.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setGender(item.value);
                      setShowGenderDropdown(false);
                    }}
                  >
                    <Ionicons
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

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setShowGender(!showGender)}
            >
              <View
                style={[styles.checkbox, showGender && styles.checkboxChecked]}
              >
                {showGender && (
                  <Feather name="check" size={10} color={colors.white} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                {translate("workerAuth.showGenderQuestion")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Position Section - Multiple Selection with Dropdown */}
          <View style={[styles.inputGroup, { zIndex: 50 }]}>
            <Text style={styles.label}>
              {translate("workerAuth.positions")}
            </Text>
            <Text style={styles.helperText}>
              {translate("workerAuth.selectPositionsHelper")}
            </Text>

            {/* Position Dropdown - Like Gender Dropdown */}
            <TouchableOpacity
              style={styles.positionDropdownButton}
              onPress={() => setShowPositionDropdown(!showPositionDropdown)}
            >
              <Text
                style={[
                  styles.positionDropdownButtonText,
                  selectedPositions.length === 0 && {
                    color: colors.text.secondary,
                  },
                ]}
              >
                {selectedPositions.length > 0
                  ? selectedPositions.length !== 1
                    ? translate("workerAuth.positionsSelected", {
                        count: selectedPositions.length,
                      })
                    : translate("workerAuth.positionSelected", {
                        count: selectedPositions.length,
                      })
                  : translate("workerAuth.selectPositions")}
              </Text>
              <Feather
                name={showPositionDropdown ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.text.primary}
              />
            </TouchableOpacity>

            {showPositionDropdown && (
              <View style={styles.positionStandardDropdownList}>
                {positions && positions.length > 0 ? (
                  positions.map((position) => {
                    const isSelected = isPositionSelected(position.id);
                    return (
                      <TouchableOpacity
                        key={position.id}
                        style={[
                          styles.positionStandardDropdownItem,
                          isSelected &&
                            styles.positionStandardDropdownItemSelected,
                        ]}
                        onPress={() => {
                          handlePositionToggle(position.id, position.name);
                        }}
                      >
                        <View
                          style={styles.positionStandardDropdownItemContent}
                        >
                          <MaterialCommunityIcons
                            name="briefcase"
                            size={18}
                            color={
                              isSelected
                                ? colors.primary.pink
                                : colors.text.secondary
                            }
                            style={{ marginRight: 10 }}
                          />
                          <Text
                            style={[
                              styles.positionStandardDropdownItemText,
                              isSelected &&
                                styles.positionStandardDropdownItemTextSelected,
                            ]}
                          >
                            {position.name}
                          </Text>
                        </View>
                        {isSelected && (
                          <MaterialCommunityIcons
                            name="check-circle"
                            size={20}
                            color={colors.primary.pink}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <Text style={styles.noPositionsText}>
                    {translate("workerAuth.noPositionsAvailable")}
                  </Text>
                )}
              </View>
            )}

            {/* Selected Positions with Expertise - Below Dropdown */}
            {selectedPositions.length > 0 && (
              <View style={styles.selectedPositionsContainer}>
                {selectedPositions.map((selectedPos) => (
                  <View
                    key={selectedPos.id}
                    style={styles.selectedPositionCard}
                  >
                    <View style={styles.selectedPositionHeader}>
                      <Text style={styles.selectedPositionName}>
                        {selectedPos.name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedPositions((prev) =>
                            prev.filter((p) => p.id !== selectedPos.id),
                          );
                        }}
                      >
                        <Feather
                          name="x"
                          size={20}
                          color={colors.primary.pink}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Experience Level Buttons */}
                    <View style={styles.experienceButtonsRow}>
                      {expertiseLevels.map((exp) => (
                        <TouchableOpacity
                          key={exp.value}
                          style={[
                            styles.experienceButton,
                            selectedPos.experience_level === exp.value &&
                              styles.experienceButtonActive,
                          ]}
                          onPress={() =>
                            handleExpertiseChange(selectedPos.id, exp.value)
                          }
                        >
                          <Image
                            source={exp.icon}
                            style={[
                              styles.experienceButtonIcon,
                              selectedPos.experience_level === exp.value && {
                                tintColor: colors.primary.pink,
                              },
                            ]}
                            resizeMode="contain"
                          />
                          <Text
                            style={[
                              styles.experienceButtonText,
                              selectedPos.experience_level === exp.value &&
                                styles.experienceButtonTextActive,
                            ]}
                          >
                            {exp.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Government ID Upload */}
          <View style={styles.section}>
            <Text style={styles.label}>
              {translate("workerAuth.govIdUpload")}
            </Text>
            <View style={styles.row}>
              {renderUploadBox(
                translate("workerAuth.idFrontPhoto"),
                translate("workerAuth.chooseFromGalleryOrCamera"),
                "gov_id",
                0,
                govIdDocs[0],
              )}
              <View style={{ width: 15 }} />
              {renderUploadBox(
                translate("workerAuth.idBackPhoto"),
                translate("workerAuth.chooseFromGalleryOrCamera"),
                "gov_id",
                1,
                govIdDocs[1],
              )}
            </View>
          </View>

          {/* Criminal Record */}
          <View style={styles.section}>
            <Text style={styles.label}>
              {translate("workerAuth.criminalRecord")}{" "}
              <Text style={{ color: colors.primary.pink }}>
                {translate("workerAuth.optional")}
              </Text>
            </Text>
            <View style={styles.row}>
              {renderUploadBox(
                translate("workerAuth.criminalFrontPhoto"),
                translate("workerAuth.chooseFromGalleryOrCamera"),
                "criminal",
                0,
                criminalDocs[0],
              )}
              <View style={{ width: 15 }} />
              {renderUploadBox(
                translate("workerAuth.criminalBackPhoto"),
                translate("workerAuth.chooseFromGalleryOrCamera"),
                "criminal",
                1,
                criminalDocs[1],
              )}
            </View>
          </View>

          {/* Home Address - Using LocationSelector */}
          <LocationSelector
            label={translate("workerAuth.homeAddress")}
            placeholder={translate("workerAuth.tapSelectAddress")}
            currentLocation={location}
            onLocationChange={handleLocationChange}
            isEditing={true}
            required={true}
          />

          {/* CURP */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {translate("workerAuth.curpLabel")}
            </Text>
            <TextInput
              style={styles.input}
              value={curp}
              onChangeText={setCurp}
              placeholder={translate("workerAuth.enterCurp")}
              maxLength={18}
            />
          </View>

          {/* RFC */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate("workerAuth.rfcLabel")}</Text>
            <TextInput
              style={styles.input}
              value={rfc}
              onChangeText={setRfc}
              placeholder={translate("workerAuth.enterRfc")}
              maxLength={13}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>
                {translate("workerAuth.submit")}
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
    backgroundColor: colors.auth.background,
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
    fontFamily: "Poppins_700Bold",
    color: colors.auth.darkRed,
    marginBottom: 20,
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
  avatarContainer: {
    alignItems: "center",
    marginBottom: 30,
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.ui.avatarBackground,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: "36%",
    backgroundColor: colors.primary.pink,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
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
  labelInRow: {
    marginBottom: 0,
  },
  editIcon: {
    marginLeft: 8,
  },
  helperText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    marginTop: 4,
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.ui.lightBorder,
    paddingHorizontal: 15,
    minHeight: 50,
    paddingVertical: 12,
  },
  datePickerText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.primary,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.ui.lightBorder,
    paddingHorizontal: 15,
    minHeight: 50,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.primary,
  },
  disabledInput: {
    backgroundColor: "#F5F5F5",
    color: "#999",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 15,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: colors.text.secondary,
    borderRadius: 3,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  checkboxChecked: {
    backgroundColor: colors.auth.darkRed,
    borderColor: colors.auth.darkRed,
  },
  checkboxLabel: {
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.ui.lightBorder,
    paddingHorizontal: 15,
    minHeight: 50, // Changed to minHeight
    paddingVertical: 12, // Added paddingVertical
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.primary,
  },
  dropdownList: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.ui.lightBorder,
    elevation: 5,
    shadowColor: colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
    paddingVertical: 5,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.lighterBorder,
  },
  dropdownItemText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.primary,
  },
  selectedPositionsContainer: {
    marginTop: 16,
    marginBottom: 0,
  },
  selectedPositionCard: {
    backgroundColor: "#FFF5F5",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary.pink,
    padding: 12,
    paddingHorizontal: 6,
    marginBottom: 10,
  },
  selectedPositionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 6,
  },
  selectedPositionName: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary.pink,
    flex: 1,
  },
  experienceButtonsRow: {
    flexDirection: "row",
    gap: 5, // Increased gap for better wrapping look
    alignItems: "center",
    flexWrap: "wrap", // Added flexWrap
    justifyContent: "flex-start", // Change to flex-start for wrapping
  },
  experienceButton: {
    flexDirection: "row", // Ensure icon and text are in a row
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.ui.lightBorder,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 32,
    marginBottom: 5,
  },
  experienceButtonActive: {
    borderColor: colors.primary.pink,
    backgroundColor: "#FFF5F5",
  },
  experienceButtonIcon: {
    width: 12,
    height: 12,
    marginRight: 4,
    tintColor: colors.text.secondary,
  },
  experienceButtonText: {
    fontSize: 9,
    fontFamily: "Poppins_500Medium",
    color: colors.text.secondary,
  },
  experienceButtonTextActive: {
    color: colors.primary.pink,
    fontFamily: "Poppins_600SemiBold",
  },
  positionDropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.ui.lightBorder,
    paddingHorizontal: 15,
    minHeight: 50,
    paddingVertical: 12,
  },
  positionDropdownButtonText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.primary,
  },
  positionStandardDropdownList: {
    position: "absolute",
    top: 135,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.ui.lightBorder,
    elevation: 5,
    shadowColor: colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
    paddingVertical: 5,
    maxHeight: 300,
  },
  positionStandardDropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.lighterBorder,
  },
  positionStandardDropdownItemSelected: {
    backgroundColor: "#FFF5F5",
  },
  positionStandardDropdownItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  positionStandardDropdownItemText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.primary,
  },
  positionStandardDropdownItemTextSelected: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary.pink,
  },
  addPositionDropdown: {
    display: "none",
  },
  addPositionDropdownContent: {
    display: "none",
  },
  addPositionDropdownText: {
    display: "none",
  },
  positionDropdownList: {
    display: "none",
  },
  positionDropdownItem: {
    display: "none",
  },
  positionDropdownItemContent: {
    display: "none",
  },
  positionDropdownItemText: {
    display: "none",
  },
  noPositionsText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    fontStyle: "italic",
    padding: 12,
    textAlign: "center",
  },
  rolesContainer: {
    display: "none",
  },
  roleChip: {
    display: "none",
  },
  section: {
    marginBottom: 20,
  },
  row: {
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
    height: 130,
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
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.primary.pink,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  uploadCountText: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    color: colors.auth.darkRed,
    textAlign: "center",
    marginTop: 4,
  },
  addressInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.inputBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.ui.inputBorder,
    paddingHorizontal: 10,
    minHeight: 50, // Changed to minHeight
    paddingVertical: 10, // Added paddingVertical
  },
  locationIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  addressInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.text.primary,
  },
  submitButton: {
    backgroundColor: colors.auth.darkRed,
    borderRadius: 10,
    minHeight: 55, // Changed to minHeight
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
    paddingVertical: 15, // Added paddingVertical
    shadowColor: colors.auth.darkRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: "#CCC",
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 1,
  },
});
