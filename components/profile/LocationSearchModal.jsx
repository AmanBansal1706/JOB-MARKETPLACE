import { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { colors, fonts } from "../../theme";
import workerColors from "../../theme/worker/colors";
import { ScreenWrapper } from "../common";
import { useTranslation } from "../../hooks/useTranslation";

/**
 * LocationSearchModal - Dedicated modal for searching locations
 * Opens when user clicks "Search Location" button
 * Returns geocoded address details to parent component
 */

export default function LocationSearchModal({
  visible,
  onClose,
  onLocationSelect,
}) {
  const { translate } = useTranslation();
  const user = useSelector((state) => state.Auth.user);
  const searchInputRef = useRef(null);

  // Detect if user is a worker
  const isWorker = user?.role === "WORKER";

  // Theme colors based on user role
  const themeColors = useMemo(() => {
    if (isWorker) {
      return {
        screenBg: workerColors.white,
        containerBg: workerColors.ui.screenBackground,
        headerBg: workerColors.primary.pink,
        headerBorder: workerColors.ui.lightBorder,
        headerTitle: workerColors.white,
        searchBg: workerColors.white,
        searchBorder: workerColors.ui.lightBorder,
        searchInputBg: workerColors.ui.inputPinkBackground,
        searchIcon: workerColors.auth.gray,
        inputText: workerColors.text.primary,
        placeholder: workerColors.auth.gray,
        loaderColor: workerColors.primary.pink,
        resultBg: workerColors.white,
        resultBorder: workerColors.ui.lightBorder,
        markerColor: workerColors.primary.pink,
        resultName: workerColors.black,
        resultAddress: workerColors.text.secondary,
        chevronColor: workerColors.ui.border,
        emptyIcon: workerColors.ui.border,
        emptyText: workerColors.text.primary,
        emptySubtext: workerColors.auth.gray,
        errorText: workerColors.primary.darkRed,
      };
    }
    return {
      screenBg: colors.bg,
      containerBg: "#F5F5F5",
      headerBg: colors.bg1,
      headerBorder: "#E0E0E0",
      headerTitle: "#FFF",
      searchBg: "#FFF",
      searchBorder: "#E0E0E0",
      searchInputBg: "#F5F5F5",
      searchIcon: "#999",
      inputText: "#333",
      placeholder: "#999",
      loaderColor: colors.tertiary,
      resultBg: "#FFF",
      resultBorder: "#E0E0E0",
      markerColor: colors.tertiary,
      resultName: "#000",
      resultAddress: "#666",
      chevronColor: "#CCC",
      emptyIcon: "#DDD",
      emptyText: "#333",
      emptySubtext: "#999",
      errorText: "#F44336",
    };
  }, [isWorker]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const searchTimeoutRef = useRef(null);
  const RESULTS_PER_PAGE = 10;

  // Auto-focus search input when modal opens
  useEffect(() => {
    if (visible && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  // Fetch place details to get coordinates from place_id
  const fetchPlaceDetails = async (placeId) => {
    try {
      const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address&key=${GOOGLE_API_KEY}`,
      );

      const data = await response.json();
      const result = data.result || {};

      console.log("Place Details Response:", result);

      return {
        lat: result.geometry?.location?.lat || null,
        lng: result.geometry?.location?.lng || null,
        address: result.formatted_address || "",
      };
    } catch (e) {
      console.error("Place Details Error:", e);
      return { lat: null, lng: null, address: "" };
    }
  };

  // Fetch detailed address components when user selects a location
  const fetchDetailedAddressComponents = async (lat, lng) => {
    try {
      const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`,
      );

      const geocodeData = await geocodeResponse.json();
      const geocodeResult = geocodeData.results?.[0] || {};

      // Extract address components
      const addressComponents = geocodeResult.address_components || [];
      const extractComponent = (type) => {
        const component = addressComponents.find((c) => c.types.includes(type));
        return component?.long_name || "";
      };

      return {
        street: extractComponent("route") || "",
        streetNumber: extractComponent("street_number") || "",
        colonia:
          extractComponent("neighborhood") ||
          extractComponent("sublocality") ||
          "",
        postalCode: extractComponent("postal_code") || "",
        city:
          extractComponent("locality") ||
          extractComponent("administrative_area_level_2") ||
          "",
        state: extractComponent("administrative_area_level_1") || "",
        country: extractComponent("country") || "",
      };
    } catch (e) {
      console.error("Geocode Error:", e);
      return {};
    }
  };

  // Search locations using Google Places API
  const searchLocations = async (query, pageNum = 1) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setHasMore(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

      if (!GOOGLE_API_KEY) {
        setError(translate("common.apiKeyMissing"));
        setSearchResults([]);
        setIsLoading(false);
        return;
      }

      // Call Google Places Text Search API
      // const response = await fetch(
      //   `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      //     query
      //   )}&components=country:mx&region=mx&key=${GOOGLE_API_KEY}`
      // );

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          query,
        )}&components=country:mx&key=${GOOGLE_API_KEY}`,
      );

      console.log("Places API Response Status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to fetch from Google Places API");
      }

      const data = await response.json();

      console.log("Places API Data:", JSON.stringify(data, null, 2));

      if (
        data.predictions &&
        data.predictions.length > 0 &&
        data.status === "OK"
      ) {
        const formattedResults = data.predictions.map((place) => ({
          description: place.description,
          mainText: place.structured_formatting?.main_text || "",
          secondaryText: place.structured_formatting?.secondary_text || "",
          placeId: place.place_id,
        }));

        if (pageNum === 1) {
          setSearchResults(formattedResults);
        } else {
          setSearchResults((prev) => [...prev, ...formattedResults]);
        }

        // Check if there are more results
        setHasMore(data.predictions.length === RESULTS_PER_PAGE);
      } else {
        setSearchResults([]);
        setHasMore(false);
        setError(translate("common.noResultsFound"));
      }
    } catch (err) {
      console.error("Search Error:", err);
      setError(translate("common.searchError"));
      setSearchResults([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  const handleSearchChange = (text) => {
    setSearchQuery(text);
    setError(null);
    setPage(1);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(text, 1);
    }, 500);
  };

  // Handle location selection
  const handleLocationSelect = async (item) => {
    setIsLoading(true);

    try {
      // Fetch place details to get coordinates
      const placeDetails = await fetchPlaceDetails(item.placeId);

      if (!placeDetails.lat || !placeDetails.lng) {
        setError(
          translate("common.searchError") ||
            "Unable to get location coordinates",
        );
        setIsLoading(false);
        return;
      }

      // Geocode the selected location to get detailed address components
      const addressComponents = await fetchDetailedAddressComponents(
        placeDetails.lat,
        placeDetails.lng,
      );

      // Pass data back to parent
      onLocationSelect({
        lat: placeDetails.lat,
        lng: placeDetails.lng,
        addressComponents,
        formattedAddress: placeDetails.address,
      });

      setIsLoading(false);
      handleClose();
    } catch (err) {
      console.error("Location selection error:", err);
      setError(translate("common.searchError"));
      setIsLoading(false);
    }
  };

  // Load more results
  const loadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      searchLocations(searchQuery, nextPage);
    }
  };

  // Close modal and reset state
  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    setError(null);
    setPage(1);
    setHasMore(true);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent={true}
      onRequestClose={handleClose}
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
            styles.container,
            { backgroundColor: themeColors.containerBg },
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
            <TouchableOpacity onPress={handleClose} style={styles.backButton}>
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color={themeColors.headerTitle}
              />
            </TouchableOpacity>
            <Text
              style={[styles.headerTitle, { color: themeColors.headerTitle }]}
            >
              {translate("common.searchForLocation") || "Search Location"}
            </Text>
            <View style={styles.placeholder} />
          </View>

          {/* Search Input */}
          <View
            style={[
              styles.searchSection,
              {
                backgroundColor: themeColors.searchBg,
                borderBottomColor: themeColors.headerBorder,
              },
            ]}
          >
            <View
              style={[
                styles.searchContainer,
                {
                  backgroundColor: themeColors.searchInputBg,
                  borderColor: themeColors.searchBorder,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color={themeColors.searchIcon}
                style={styles.searchIcon}
              />
              <TextInput
                ref={searchInputRef}
                style={[styles.searchInput, { color: themeColors.inputText }]}
                placeholder={translate("common.searchForLocation")}
                value={searchQuery}
                onChangeText={handleSearchChange}
                placeholderTextColor={themeColors.placeholder}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setError(null);
                  }}
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={20}
                    color={themeColors.searchIcon}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Search Results */}
          {isLoading && searchResults.length === 0 ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={themeColors.loaderColor} />
              <Text
                style={[styles.loaderText, { color: themeColors.emptySubtext }]}
              >
                {translate("common.searching")}
              </Text>
            </View>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              keyExtractor={(item, index) =>
                item.placeId || `${item.mainText}-${index}`
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.resultItem,
                    {
                      backgroundColor: themeColors.resultBg,
                      borderColor: themeColors.resultBorder,
                    },
                  ]}
                  onPress={() => handleLocationSelect(item)}
                  disabled={isLoading}
                >
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={20}
                    color={themeColors.markerColor}
                    style={styles.resultIcon}
                  />
                  <View style={styles.resultContent}>
                    <Text
                      style={[
                        styles.resultName,
                        { color: themeColors.resultName },
                      ]}
                      numberOfLines={1}
                    >
                      {item.mainText}
                    </Text>
                    <Text
                      style={[
                        styles.resultAddress,
                        { color: themeColors.resultAddress },
                      ]}
                      numberOfLines={2}
                    >
                      {item.secondaryText}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={themeColors.chevronColor}
                  />
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.listContent}
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isLoading && searchResults.length > 0 ? (
                  <View style={styles.footerLoader}>
                    <ActivityIndicator
                      size="small"
                      color={themeColors.loaderColor}
                    />
                  </View>
                ) : null
              }
            />
          ) : searchQuery && !isLoading && !error ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="magnify"
                size={48}
                color={themeColors.emptyIcon}
              />
              <Text
                style={[styles.emptyText, { color: themeColors.emptyText }]}
              >
                {translate("common.noResultsFound")}
              </Text>
              <Text
                style={[
                  styles.emptySubtext,
                  { color: themeColors.emptySubtext },
                ]}
              >
                {translate("common.tryDifferentSearch")}
              </Text>
            </View>
          ) : !searchQuery ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="map-search"
                size={48}
                color={themeColors.emptyIcon}
              />
              <Text
                style={[styles.emptyText, { color: themeColors.emptyText }]}
              >
                {translate("common.searchForLocation") ||
                  "Search for a location"}
              </Text>
              <Text
                style={[
                  styles.emptySubtext,
                  { color: themeColors.emptySubtext },
                ]}
              >
                Enter an address, city, or place name
              </Text>
            </View>
          ) : null}

          {error && (
            <View style={styles.errorContainer}>
              <Text
                style={[styles.errorMessage, { color: themeColors.errorText }]}
              >
                {error}
              </Text>
            </View>
          )}
        </View>
      </ScreenWrapper>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: "#000",
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  searchSection: {
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 0,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: "#333",
  },
  listContent: {
    padding: 12,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  resultIcon: {
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: "#000",
    marginBottom: 4,
  },
  resultAddress: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loaderText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: "#999",
    marginTop: 12,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: "#333",
    marginTop: 12,
    textAlign: "center",
  },
  emptySubtext: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    textAlign: "center",
  },
  errorContainer: {
    padding: 16,
  },
  errorMessage: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: "#F44336",
    textAlign: "center",
  },
});
