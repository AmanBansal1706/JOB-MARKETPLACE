import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useState, useMemo } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../../theme/worker/colors";
import { useFetchWorkerNotifications } from "../../../services/WorkerProfileServices";
import { Image } from "expo-image";
import { useTranslation } from "../../../hooks/useTranslation";
import { getTranslatedRelativeTime } from "../../../utils/dateFormatting";

export default function NotificationScreen() {
  const navigation = useNavigation();
  const { translate, language } = useTranslation();
  const [showFilter, setShowFilter] = useState(false);

  const {
    data,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useFetchWorkerNotifications({ language: language });

  const notifications = useMemo(() => data?.notifications || [], [data]);

  const getTimeAgo = (dateString) => {
    return getTranslatedRelativeTime(
      dateString,
      translate,
      "workerNotifications",
    );
  };

  const getIcon = (type) => {
    switch (type) {
      case "job_selection":
        return {
          name: "briefcase",
          lib: Feather,
          color: colors.primary.green,
          bg: "#E8F5E9",
        };
      case "job_overdue":
        return {
          name: "clock",
          lib: Feather,
          color: "#FFC107",
          bg: "#FFF8E1",
        };
      case "cash_payment_denied":
        return {
          name: "x-circle",
          lib: Feather,
          color: colors.primary.pink,
          bg: "#FBE9E7",
        };
      case "payment":
        return {
          name: "hand-holding-usd",
          lib: FontAwesome5,
          color: "#FFC107",
          bg: "#FFF8E1",
        };
      case "message":
        return {
          name: "message-square",
          lib: Feather,
          color: "#2196F3",
          bg: "#E3F2FD",
        };
      case "dispute":
        return {
          name: "alert-triangle",
          lib: Feather,
          color: "#FF5722",
          bg: "#FBE9E7",
        };
      case "completed":
        return {
          name: "check-circle",
          lib: Feather,
          color: colors.primary.green,
          bg: "#E8F5E9",
        };
      default:
        return {
          name: "bell",
          lib: Feather,
          color: colors.text.secondary,
          bg: colors.ui.lighterBorder,
        };
    }
  };

  const handleNotificationPress = (item) => {
    // Navigate if job_id is present
    if (item.metadata?.job_id) {
      navigation.navigate("WorkerUnifiedJobDetails", {
        jobId: item.metadata.job_id,
      });
    }
  };

  const NotificationCard = ({ item }) => {
    const iconData = getIcon(item.type);
    const IconLib = iconData.lib;

    return (
      <TouchableOpacity
        style={styles.cardWrapper}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContainer}>
          <View
            style={[styles.iconContainer, { backgroundColor: iconData.bg }]}
          >
            {item.sender?.profile_picture ? (
              <Image
                source={{ uri: item.sender.profile_picture }}
                style={styles.senderImage}
                contentFit="cover"
              />
            ) : (
              <IconLib name={iconData.name} size={24} color={iconData.color} />
            )}
          </View>

          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </View>

            <Text style={styles.cardMessage} numberOfLines={2}>
              {item.message}
            </Text>

            <Text style={styles.cardTime}>{getTimeAgo(item.created_at)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
            {translate("workerNotifications.notifications")}
          </Text>
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        {/* Top Controls */}
        {/* <View style={styles.controlsRow}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={() => setShowFilter(true)}>
            <Ionicons
              name="options-outline"
              size={28}
              color={colors.text.secondary}
              style={{ transform: [{ rotate: "90deg" }] }}
            />
          </TouchableOpacity>
        </View> */}

        {/* List */}
        <FlatList
          data={notifications}
          renderItem={({ item }) => <NotificationCard item={item} />}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={isPending} onRefresh={refetch} />
          }
          ListFooterComponent={() =>
            isFetchingNextPage ? (
              <ActivityIndicator
                size="small"
                color={colors.primary.pink}
                style={{ marginVertical: 10 }}
              />
            ) : null
          }
          ListEmptyComponent={() =>
            !isPending && (
              <View style={styles.emptyContainer}>
                <Feather
                  name="bell-off"
                  size={50}
                  color={colors.ui.lightBorder}
                />
                <Text style={styles.emptyText}>
                  {translate("workerNotifications.noNotifications")}
                </Text>
              </View>
            )
          }
        />
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilter}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilter(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowFilter(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.dropdownMenu}>
              <TouchableOpacity style={styles.dropdownItem}>
                <Feather
                  name="calendar"
                  size={18}
                  color={colors.text.secondary}
                />
                <Text style={styles.dropdownText}>Date</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dropdownItem, { borderBottomWidth: 0 }]}
              >
                <MaterialCommunityIcons
                  name="view-grid-outline"
                  size={18}
                  color={colors.primary.pink}
                />
                <Text
                  style={[styles.dropdownText, { color: colors.primary.pink }]}
                >
                  Type
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
    padding: 5,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 15,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  cardWrapper: {
    backgroundColor: colors.auth.darkRed,
    borderRadius: 15,
    paddingLeft: 8,
    marginBottom: 15,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.white,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    padding: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.ui.lightBorder,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: colors.black,
  },
  cardMessage: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: colors.text.secondary,
    marginBottom: 4,
  },
  cardTime: {
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    color: colors.auth.gray,
  },
  senderImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: colors.text.secondary,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)", // Kept slightly different for better contrast than standard overlay
  },
  dropdownMenu: {
    position: "absolute",
    top: 130, // Adjust based on header + controls height
    right: 25,
    width: 150,
    backgroundColor: colors.ui.searchBarBackground, // Pinkish dropdown background from design
    borderRadius: 15,
    paddingVertical: 5,
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.divider,
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: colors.text.secondary,
    marginLeft: 10,
  },
});
