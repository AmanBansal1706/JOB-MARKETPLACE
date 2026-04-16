import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useSelector } from "react-redux";
import { colors, fonts } from "../../theme";
import workerColors from "../../theme/worker/colors";
import { ScreenWrapper } from "../common";
import { useTranslation } from "../../hooks/useTranslation";
import LocationSearchModal from "./LocationSearchModal";

/**
 * LocationSelector Component - Reusable across JobPostForm, EditProfileScreen, and BusinessDocumentsScreen
 *
 * Features:
 * - Always-visible address input fields (Interior Number, Colonia, Postal Code, City, State)
 * - Auto-fill capabilities via:
 *   1. Current Location - Get user's GPS location
 *   2. Search Location - Search for location by name
 * - Fields can be manually edited after auto-fill
 * - Read-only fields for City and State (auto-filled, not editable)
 * - Proper validation and error handling
 * - Both editing and viewing modes
 *
 * @param {string} label - Custom label for the location field
 * @param {string} placeholder - Custom placeholder text
 * @param {boolean} isEditing - Whether in edit mode (enables field editing)
 * @param {Function} onLocationChange - Callback receiving {address, lat, lng, addressDetails}
 * @param {Object} currentLocation - Current location object {address, lat, lng, addressDetails}
 * @param {boolean} required - Whether location is required
 */
export default function LocationSelector({
  label = "Work Location",
  placeholder = "Tap to search location",
  isEditing = false,
  onLocationChange,
  currentLocation = null,
  required = false,
  showEditIcon = false,
}) {
  const { translate } = useTranslation();
  const user = useSelector((state) => state.Auth.user);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Detect if user is a worker
  const isWorker = user?.role === "WORKER";

  // Theme colors based on user role
  const themeColors = useMemo(() => {
    if (isWorker) {
      return {
        screenBg: workerColors.white,
        label: workerColors.black,
        required: workerColors.primary.darkRed,
        inputBg: workerColors.white,
        inputBorder: workerColors.ui.lightBorder,
        inputDisabledBg: workerColors.ui.inputPinkBackground,
        inputDisabledBorder: workerColors.ui.border,
        markerColor: workerColors.primary.pink,
        inputText: workerColors.text.primary,
        placeholder: workerColors.auth.gray,
        chevronColor: workerColors.primary.pink,
        helperText: workerColors.auth.gray,
        modalBg: workerColors.ui.screenBackground,
        headerBg: workerColors.primary.pink,
        headerBorder: workerColors.ui.lightBorder,
        headerTitle: workerColors.white,
        searchInputBg: workerColors.white,
        searchInputBorder: workerColors.ui.lightBorder,
        searchIcon: workerColors.auth.gray,
        sectionTitle: workerColors.black,
        sectionSubtext: workerColors.text.secondary,
        directInputBg: workerColors.white,
        directInputBorder: workerColors.ui.lightBorder,
        directInputText: workerColors.text.primary,
        readOnlyBg: workerColors.ui.inputPinkBackground,
        readOnlyBorder: workerColors.ui.border,
        readOnlyText: workerColors.text.secondary,
        optionalText: workerColors.auth.gray,
        buttonBg: workerColors.primary.pink,
        buttonDisabled: workerColors.ui.disabled,
        buttonText: workerColors.white,
        errorText: workerColors.primary.darkRed,
        cancelBorder: workerColors.primary.darkRed,
        cancelText: workerColors.primary.darkRed,
        loaderColor: workerColors.primary.pink,
      };
    }
    return {
      screenBg: colors.bg,
      label: "#000",
      required: "#F44336",
      inputBg: "#FFF",
      inputBorder: "#E0E0E0",
      inputDisabledBg: "#F5F5F5",
      inputDisabledBorder: "#E8E8E8",
      markerColor: colors.tertiary,
      inputText: "#333",
      placeholder: "#999",
      chevronColor: colors.tertiary,
      helperText: "#999",
      modalBg: "#F5F5F5",
      headerBg: colors.bg1,
      headerBorder: "#E0E0E0",
      headerTitle: "#FFF",
      searchInputBg: "#FFF",
      searchInputBorder: "#E0E0E0",
      searchIcon: "#999",
      sectionTitle: "#000",
      sectionSubtext: "#666",
      directInputBg: "#FFF",
      directInputBorder: "#E0E0E0",
      directInputText: "#333",
      readOnlyBg: "#F5F5F5",
      readOnlyBorder: "#E8E8E8",
      readOnlyText: "#666",
      optionalText: "#999",
      buttonBg: colors.tertiary,
      buttonDisabled: "#CCC",
      buttonText: "#FFF",
      errorText: "#F44336",
      cancelBorder: "#F44336",
      cancelText: "#F44336",
      loaderColor: colors.tertiary,
    };
  }, [isWorker]);

  // Address detail fields
  const [interiorNumber, setInteriorNumber] = useState(
    currentLocation?.addressDetails?.interiorNumber || "",
  );
  const [street, setStreet] = useState(
    currentLocation?.addressDetails?.street || "",
  );
  const [colonia, setColonia] = useState(
    currentLocation?.addressDetails?.colonia || "",
  );
  const [postalCode, setPostalCode] = useState(
    currentLocation?.addressDetails?.postalCode || "",
  );
  const [city, setCity] = useState(currentLocation?.addressDetails?.city || "");
  const [state, setState] = useState(
    currentLocation?.addressDetails?.state || "",
  );
  const [lat, setLat] = useState(currentLocation?.lat || null);
  const [lng, setLng] = useState(currentLocation?.lng || null);

  // Update states when currentLocation prop changes
  useEffect(() => {
    if (currentLocation) {
      setInteriorNumber(currentLocation?.addressDetails?.interiorNumber || "");
      setStreet(currentLocation?.addressDetails?.street || "");
      setColonia(currentLocation?.addressDetails?.colonia || "");
      setPostalCode(currentLocation?.addressDetails?.postalCode || "");
      setCity(currentLocation?.addressDetails?.city || "");
      setState(currentLocation?.addressDetails?.state || "");
      setLat(currentLocation?.lat || null);
      setLng(currentLocation?.lng || null);
    }
  }, [currentLocation]);

  const displayAddress = currentLocation?.address || placeholder;

  const handleLocationChange = () => {
    onLocationChange({
      address: buildFullAddress(),
      lat: lat,
      lng: lng,
      addressDetails: {
        interiorNumber: interiorNumber.trim(),
        street: street.trim(),
        colonia: colonia.trim(),
        postalCode: postalCode.trim(),
        city: city,
        state: state,
      },
    });
  };

  const handlePress = () => {
    if (isEditing) {
      setModalVisible(true);
    }
  };

  // Handle location selection from search modal
  const handleSearchLocationSelect = (data) => {
    const { lat, lng, addressComponents } = data;
    extractAddressDetails(addressComponents, lat, lng);
  };

  // Helper function to extract and set address details from geocode result
  const extractAddressDetails = (addr, latitude, longitude) => {
    // Extract street - try multiple fields since API might not always provide 'street'
    let streetValue = "";

    // Handle both Google Places API format and fallback format
    if (addr.street) {
      streetValue = addr.streetNumber
        ? `${addr.streetNumber} ${addr.street}`
        : addr.street;
    } else if (addr.route) {
      streetValue = addr.street_number
        ? `${addr.street_number} ${addr.route}`
        : addr.route;
    } else if (addr.streetNumber) {
      streetValue = addr.streetNumber;
    } else if (addr.street_number) {
      streetValue = addr.street_number;
    } else if (addr.name && !addr.name.match(/^[A-Za-z\s,]*$/)) {
      streetValue = addr.name;
    }

    const interiorNumberValue =
      addr.name && addr.name !== addr.street && !streetValue.includes(addr.name)
        ? addr.name
        : "";

    setInteriorNumber(interiorNumberValue);
    setStreet(streetValue);
    setColonia(
      addr.colonia ||
        addr.neighborhood ||
        addr.sublocality ||
        addr.district ||
        "",
    );
    setPostalCode(addr.postalCode || addr.postal_code || "");
    setCity(addr.city || addr.locality || "");
    setState(addr.state || addr.administrative_area_level_1 || "");
    setLat(latitude);
    setLng(longitude);
  };

  // Helper function to build full address from components
  const buildFullAddress = () => {
    const parts = [];
    if (interiorNumber) parts.push(interiorNumber);
    if (street) parts.push(street);
    if (colonia) parts.push(colonia);
    if (postalCode) parts.push(postalCode);
    if (city) parts.push(city);
    if (state) parts.push(state);
    return parts.filter(Boolean).join(", ");
  };

  // Fetch current location
  const fetchCurrentLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setError(
          translate("common.locationPermissionDenied") ||
            "Location permission denied",
        );
        Alert.alert(
          translate("common.permissionDenied") || "Permission Denied",
          translate("common.locationPermissionRequired") ||
            "Location permission is required. Please enable it in your device settings.",
        );
        setIsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      const addressResult = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (!addressResult || addressResult.length === 0) {
        throw new Error("Could not determine your address");
      }

      const addr = addressResult[0];
      extractAddressDetails(addr, latitude, longitude);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      console.error("Location Error:", err);
      let errorMessage =
        translate("common.failedToFetchLocation") ||
        "Failed to fetch your location";
      if (err.message.includes("determine your address")) {
        errorMessage =
          translate("common.unableToDetermineAddress") ||
          "Unable to determine your address. Please try again.";
      } else if (err.message.includes("permission")) {
        errorMessage =
          translate("common.locationPermissionRequired") ||
          "Location permission is required.";
      }

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Validate required fields before saving
  const validateAndSaveLocation = () => {
    if (!street.trim()) {
      Alert.alert(
        translate("common.error"),
        translate("common.streetRequired") || "Please enter the street",
      );
      return;
    }

    if (!/\d/.test(street)) {
      Alert.alert(
        translate("common.error"),
        translate("common.streetNumberRequired") || "Please include at least one number (0-9) in the street address",
      );
      return;
    }
    if (!colonia.trim()) {
      Alert.alert(
        translate("common.error"),
        translate("common.coloniaRequired") || "Please enter the colonia",
      );
      return;
    }
    if (!postalCode.trim()) {
      Alert.alert(
        translate("common.error"),
        translate("common.postalCodeRequired") ||
          "Please enter the postal code",
      );
      return;
    }
    if (!city.trim()) {
      Alert.alert(
        translate("common.error"),
        translate("common.cityRequired") || "Please enter the city",
      );
      return;
    }
    if (!state.trim()) {
      Alert.alert(
        translate("common.error"),
        translate("common.stateRequired") || "Please enter the state",
      );
      return;
    }

    handleLocationChange();
    // Removed auto success alert - success will be shown when the entire form is submitted
    onClose();
  };

  const onClose = () => {
    setModalVisible(false);
    setError(null);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: themeColors.label }]}>
            {label}
            {required && (
              <Text
                style={[
                  styles.requiredIndicator,
                  { color: themeColors.required },
                ]}
              >
                *
              </Text>
            )}
          </Text>
          {showEditIcon && (
            <MaterialIcons
              name="edit"
              size={14}
              color={themeColors.placeholder}
              style={{ marginLeft: 4 }}
            />
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.input,
            {
              backgroundColor: themeColors.inputBg,
              borderColor: themeColors.inputBorder,
            },
            !isEditing && {
              backgroundColor: themeColors.inputDisabledBg,
              borderColor: themeColors.inputDisabledBorder,
            },
          ]}
          onPress={handlePress}
          disabled={!isEditing}
          activeOpacity={isEditing ? 0.7 : 1}
        >
          <View style={styles.inputContent}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="map-marker"
                size={20}
                color={themeColors.markerColor}
              />
            </View>

            {/* Address text */}
            <Text
              style={[
                styles.locationText,
                { color: themeColors.inputText },
                !displayAddress.includes(",") && {
                  color: themeColors.placeholder,
                },
              ]}
              numberOfLines={2}
            >
              {displayAddress}
            </Text>

            {/* Chevron icon (only show when editing) */}
            {isEditing && (
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={themeColors.chevronColor}
                style={styles.chevron}
              />
            )}
          </View>
        </TouchableOpacity>

        {/* Helper text */}
        {isEditing && (
          <Text style={[styles.helperText, { color: themeColors.helperText }]}>
            {translate("common.tapToSelectLocation") ||
              "Tap to search location"}
          </Text>
        )}
      </View>

      {/* Location Search Modal */}
      <LocationSearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onLocationSelect={handleSearchLocationSelect}
      />

      {/* Address Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        statusBarTranslucent={true}
        onRequestClose={onClose}
      >
        <ScreenWrapper
          containerStyle={[
            styles.screenContent,
            { backgroundColor: themeColors.screenBg },
          ]}
          edges={["top"]}
          statusBarBackground={themeColors.headerBg}
        >
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: themeColors.modalBg },
            ]}
          >
            {/* Header */}
            <View
              style={[
                styles.header,
                {
                  backgroundColor: themeColors.headerBg,
                  borderBottomColor: themeColors.headerBorder,
                },
              ]}
            >
              <Text
                style={[styles.headerTitle, { color: themeColors.headerTitle }]}
              >
                {translate("common.selectLocation")}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={themeColors.headerTitle}
                />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Search Location Input */}
              <TouchableOpacity
                style={[
                  styles.searchInputContainer,
                  {
                    backgroundColor: themeColors.searchInputBg,
                    borderColor: themeColors.searchInputBorder,
                  },
                ]}
                onPress={() => setSearchModalVisible(true)}
              >
                <MaterialCommunityIcons
                  name="magnify"
                  size={20}
                  color={themeColors.searchIcon}
                  style={styles.searchInputIcon}
                />
                <Text
                  style={[
                    styles.searchInputPlaceholder,
                    { color: themeColors.placeholder },
                  ]}
                >
                  {translate("common.searchForLocation")}
                </Text>
              </TouchableOpacity>

              {/* Current Location Button */}
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.primaryButton,
                  { backgroundColor: themeColors.buttonBg },
                ]}
                onPress={fetchCurrentLocation}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={themeColors.buttonText} />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="crosshairs-gps"
                      size={20}
                      color={themeColors.buttonText}
                      style={styles.buttonIcon}
                    />
                    <Text
                      style={[
                        styles.buttonText,
                        { color: themeColors.buttonText },
                      ]}
                    >
                      {translate("common.getMyCurrentLocation")}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {error && (
                <Text
                  style={[
                    styles.errorMessage,
                    { color: themeColors.errorText },
                  ]}
                >
                  {error}
                </Text>
              )}

              {/* Address Fields Section */}
              <View style={styles.addressSection}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: themeColors.sectionTitle },
                  ]}
                >
                  {translate("common.addressDetails") || "Address Details"}
                </Text>
                {/* Street - Editable, Required */}
                <View style={styles.directInputContainer}>
                  <Text
                    style={[
                      styles.directInputLabel,
                      { color: themeColors.sectionTitle },
                    ]}
                  >
                    {translate("common.street")}
                    <Text
                      style={[
                        styles.requiredIndicator,
                        { color: themeColors.required },
                      ]}
                    >
                      {" "}
                      *
                    </Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.directInput,
                      {
                        backgroundColor: themeColors.directInputBg,
                        borderColor: themeColors.directInputBorder,
                        color: themeColors.directInputText,
                      },
                      !isEditing && {
                        backgroundColor: themeColors.readOnlyBg,
                        borderColor: themeColors.readOnlyBorder,
                        color: themeColors.readOnlyText,
                      },
                    ]}
                    placeholder={translate("common.enterStreet")}
                    value={street}
                    onChangeText={setStreet}
                    placeholderTextColor={themeColors.placeholder}
                    editable={isEditing}
                  />
                </View>

                {/* Interior Number (Apartment) - Optional, Editable */}
                <View style={styles.directInputContainer}>
                  <Text
                    style={[
                      styles.directInputLabel,
                      { color: themeColors.sectionTitle },
                    ]}
                  >
                    {translate("common.interiorNumber")}
                    <Text
                      style={[
                        styles.optionalText,
                        { color: themeColors.optionalText },
                      ]}
                    >
                      {" "}
                      ({translate("common.optional")})
                    </Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.directInput,
                      {
                        backgroundColor: themeColors.directInputBg,
                        borderColor: themeColors.directInputBorder,
                        color: themeColors.directInputText,
                      },
                    ]}
                    placeholder={translate("common.enterInteriorNumber")}
                    value={interiorNumber}
                    onChangeText={setInteriorNumber}
                    placeholderTextColor={themeColors.placeholder}
                    editable={isEditing}
                  />
                </View>

                {/* Colonia - Editable, Required */}
                <View style={styles.directInputContainer}>
                  <Text
                    style={[
                      styles.directInputLabel,
                      { color: themeColors.sectionTitle },
                    ]}
                  >
                    {translate("common.colonia")}
                    <Text
                      style={[
                        styles.requiredIndicator,
                        { color: themeColors.required },
                      ]}
                    >
                      {" "}
                      *
                    </Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.directInput,
                      {
                        backgroundColor: themeColors.directInputBg,
                        borderColor: themeColors.directInputBorder,
                        color: themeColors.directInputText,
                      },
                      !isEditing && {
                        backgroundColor: themeColors.readOnlyBg,
                        borderColor: themeColors.readOnlyBorder,
                        color: themeColors.readOnlyText,
                      },
                    ]}
                    placeholder={translate("common.enterColonia")}
                    value={colonia}
                    onChangeText={setColonia}
                    placeholderTextColor={themeColors.placeholder}
                    editable={isEditing}
                  />
                </View>

                {/* Postal Code - Editable, Required */}
                <View style={styles.directInputContainer}>
                  <Text
                    style={[
                      styles.directInputLabel,
                      { color: themeColors.sectionTitle },
                    ]}
                  >
                    {translate("common.postalCode")}
                    <Text
                      style={[
                        styles.requiredIndicator,
                        { color: themeColors.required },
                      ]}
                    >
                      {" "}
                      *
                    </Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.directInput,
                      {
                        backgroundColor: themeColors.directInputBg,
                        borderColor: themeColors.directInputBorder,
                        color: themeColors.directInputText,
                      },
                      !isEditing && {
                        backgroundColor: themeColors.readOnlyBg,
                        borderColor: themeColors.readOnlyBorder,
                        color: themeColors.readOnlyText,
                      },
                    ]}
                    placeholder={translate("common.enterPostalCode")}
                    value={postalCode}
                    onChangeText={setPostalCode}
                    placeholderTextColor={themeColors.placeholder}
                    keyboardType="numeric"
                    editable={isEditing}
                  />
                </View>

                {/* City - Editable, Required */}
                <View style={styles.directInputContainer}>
                  <Text
                    style={[
                      styles.directInputLabel,
                      { color: themeColors.sectionTitle },
                    ]}
                  >
                    {translate("common.city")}
                    <Text
                      style={[
                        styles.requiredIndicator,
                        { color: themeColors.required },
                      ]}
                    >
                      {" "}
                      *
                    </Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.directInput,
                      {
                        backgroundColor: themeColors.directInputBg,
                        borderColor: themeColors.directInputBorder,
                        color: themeColors.directInputText,
                      },
                      !isEditing && {
                        backgroundColor: themeColors.readOnlyBg,
                        borderColor: themeColors.readOnlyBorder,
                        color: themeColors.readOnlyText,
                      },
                    ]}
                    placeholder={translate("common.enterCity")}
                    value={city}
                    onChangeText={setCity}
                    placeholderTextColor={themeColors.placeholder}
                    editable={isEditing}
                  />
                </View>

                {/* State - Editable, Required */}
                <View style={styles.directInputContainer}>
                  <Text
                    style={[
                      styles.directInputLabel,
                      { color: themeColors.sectionTitle },
                    ]}
                  >
                    {translate("common.state")}
                    <Text
                      style={[
                        styles.requiredIndicator,
                        { color: themeColors.required },
                      ]}
                    >
                      {" "}
                      *
                    </Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.directInput,
                      {
                        backgroundColor: themeColors.directInputBg,
                        borderColor: themeColors.directInputBorder,
                        color: themeColors.directInputText,
                      },
                      !isEditing && {
                        backgroundColor: themeColors.readOnlyBg,
                        borderColor: themeColors.readOnlyBorder,
                        color: themeColors.readOnlyText,
                      },
                    ]}
                    placeholder={translate("common.enterState")}
                    value={state}
                    onChangeText={setState}
                    placeholderTextColor={themeColors.placeholder}
                    editable={isEditing}
                  />
                </View>
              </View>

              {/* Footer */}
              {/* <View style={styles.footer}> */}
              <View style={styles.footerButtonRow}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    { borderColor: themeColors.cancelBorder },
                  ]}
                  onPress={onClose}
                >
                  <Text
                    style={[
                      styles.cancelButtonText,
                      { color: themeColors.cancelText },
                    ]}
                  >
                    {translate("common.cancel")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    { backgroundColor: themeColors.buttonBg },
                    (!street.trim() ||
                      !colonia.trim() ||
                      !postalCode.trim() ||
                      !city.trim() ||
                      !state.trim()) && {
                      backgroundColor: themeColors.buttonDisabled,
                    },
                  ]}
                  onPress={validateAndSaveLocation}
                  disabled={
                    !street.trim() ||
                    !colonia.trim() ||
                    !postalCode.trim() ||
                    !city.trim() ||
                    !state.trim()
                  }
                >
                  <MaterialCommunityIcons
                    name="content-save"
                    size={20}
                    color={themeColors.buttonText}
                    style={styles.buttonIcon}
                  />
                  <Text
                    style={[
                      styles.buttonText,
                      { color: themeColors.buttonText },
                    ]}
                  >
                    {translate("common.saveLocation")}
                  </Text>
                </TouchableOpacity>
              </View>
              {/* </View> */}
            </ScrollView>
          </View>
        </ScreenWrapper>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  screenContent: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: "#000",
    marginRight: 8,
  },
  requiredIndicator: {
    color: "#F44336",
    fontSize: 16,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    justifyContent: "center",
  },
  inputDisabled: {
    backgroundColor: "#F5F5F5",
    borderColor: "#E8E8E8",
  },
  inputContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  locationText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  placeholderText: {
    color: "#999",
  },
  chevron: {
    marginLeft: "auto",
  },
  helperText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: "#999",
    marginTop: 6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: "#000",
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 12,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 12,
  },
  addressSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: "#000",
    marginBottom: 8,
    marginTop: 16,
  },
  sectionSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 12,
  },
  description: {
    flexDirection: "row",
    backgroundColor: "#E3F2FD",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  descriptionText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: "#1565C0",
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  directInputContainer: {
    marginBottom: 16,
  },
  directInputLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: "#000",
    marginBottom: 8,
  },
  directInput: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: "#333",
  },
  readOnlyInput: {
    backgroundColor: "#F5F5F5",
    borderColor: "#E8E8E8",
    color: "#666",
  },
  optionalText: {
    color: "#999",
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInputIcon: {
    marginRight: 12,
  },
  searchInputPlaceholder: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: "#999",
  },
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  searchButton: {
    backgroundColor: colors.tertiary,
  },
  primaryButton: {
    backgroundColor: colors.tertiary,
  },
  buttonDisabled: {
    backgroundColor: "#CCC",
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: "#FFF",
  },
  errorMessage: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: "#F44336",
    marginTop: 12,
    paddingHorizontal: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  footerButtonRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    paddingBottom: 180,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#F44336",
  },
  cancelButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: "#F44336",
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.tertiary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
