import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { colors, fonts } from "../../../theme";
import { CommonHeader, ScreenWrapper } from "../../../components/common";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "../../../hooks/useTranslation";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { getTranslatedRelativeTime } from "../../../utils/dateFormatting";
import { useFetchBusinessNotifications } from "../../../services/ProfileServices";
import { Image } from "expo-image";

export default function NotificationSettingsScreen() {
  const navigation = useNavigation();
  const { translate, language } = useTranslation();
  const [expandedId, setExpandedId] = useState(null);

  const {
    data,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useFetchBusinessNotifications({ language });

  const notifications = useMemo(() => data?.notifications || [], [data]);

  const getTimeAgo = (dateString) => {
    return getTranslatedRelativeTime(
      dateString,
      translate,
      "workerNotifications", // Use the same translation namespace or general one
    );
  };

  const getIcon = (type) => {
    return {
      name: "bell",
      lib: Feather,
      color: "#FFF",
      bg: colors.bg1,
    };
  };

  const handlePress = (item) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === item.id ? null : item.id));

    // Handle navigation based on metadata if necessary
    if (item.metadata?.jobId) {
      // You can add navigation logic here if needed, for example:
      // navigation.navigate("BusinessJobDetails", { jobId: item.metadata.jobId });
    }
  };

  const NotificationCard = ({ item }) => {
    const iconData = getIcon(item.type);
    const IconLib = iconData.lib;
    const isExpanded = expandedId === item.id;
    const isUnread = !item.read_status; // Assuming read_status is what we use

    return (
      <View style={styles.cardWrap}>
        <TouchableOpacity
          onPress={() => handlePress(item)}
          style={[
            styles.card,
            {
              backgroundColor: isUnread ? "#F0FBF7" : "#FFFFFF",
              borderLeftColor: colors.primary,
              borderLeftWidth: 8,
            },
            isExpanded ? styles.cardExpanded : null,
          ]}
          activeOpacity={0.7}
        >
          <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: iconData.bg }]}>
              {item.sender?.profile_picture ? (
                <Image
                  source={{ uri: item.sender.profile_picture }}
                  style={styles.senderImage}
                  contentFit="cover"
                />
              ) : (
                <IconLib
                  name={iconData.name}
                  size={24}
                  color={iconData.color}
                />
              )}
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text
                style={styles.message}
                numberOfLines={isExpanded ? undefined : 2}
              >
                {item.message}
              </Text>
              <Text style={styles.time}>{getTimeAgo(item.created_at)}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScreenWrapper backgroundColor={colors.bg}>
      <CommonHeader
        title={translate("settings.notifications")}
        onBackPress={() => navigation.goBack?.()}
        backgroundColor={colors.bg1}
      />

      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
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
            <RefreshControl
              refreshing={isPending && !isFetchingNextPage}
              onRefresh={refetch}
              tintColor={colors.tertiary}
              colors={[colors.tertiary]}
            />
          }
          ListFooterComponent={() =>
            isFetchingNextPage ? (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={{ marginVertical: 20 }}
              />
            ) : null
          }
          ListEmptyComponent={() =>
            !isPending && (
              <View style={styles.emptyContainer}>
                <Feather
                  name="bell-off"
                  size={50}
                  color={colors.text1}
                  style={{ opacity: 0.5 }}
                />
                <Text style={styles.emptyText}>
                  {translate("workerNotifications.noNotifications")}
                </Text>
              </View>
            )
          }
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  listContent: { paddingBottom: 100 },
  cardWrap: {
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    minHeight: 100,
  },
  cardExpanded: {
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    padding: 16,
    alignItems: "flex-start",
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    overflow: "hidden",
  },
  senderImage: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    flex: 1,
    paddingTop: 2,
  },
  title: {
    color: colors.textdark,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    marginBottom: 4,
  },
  message: {
    color: colors.text1,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  time: {
    color: "#9CB5AC",
    fontSize: 11,
    fontFamily: fonts.medium,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text1,
    opacity: 0.7,
  },
});
