import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { colors, fonts } from "../../../theme";
import { CommonHeader, ScreenWrapper } from "../../../components/common";
import { MaterialIcons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "../../../hooks/useTranslation";

/**
 * WorkerAnalyticsListScreen
 * Displays a list of assigned workers with quick analytics overview
 * User can tap on a worker to view detailed analytics
 */
export default function WorkerAnalyticsListScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { translate } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  const workers = route.params?.workers || [];
  const jobId = route.params?.jobId;

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh logic can be added here if needed
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewWorkerAnalytics = (worker) => {
    navigation.navigate("WorkerAnalytics", {
      workerId: worker.id,
      jobId: jobId,
      workerName: worker.name,
    });
  };

  if (!jobId) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <CommonHeader
          title={translate("jobs.workerAnalytics")}
          onBackPress={() => navigation.goBack?.()}
          backgroundColor={colors.bg1}
        />
        <View style={styles.centerContainer}>
          <MaterialIcons name="error-outline" size={64} color={colors.text1} />
          <Text style={styles.errorTitle}>
            {translate("jobs.jobInfoMissing")}
          </Text>
          <Text style={styles.errorMessage}>
            {translate("jobs.jobInfoMissingDesc")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ScreenWrapper backgroundColor={colors.bg}>
      <CommonHeader
        title={translate("jobs.workerAnalytics")}
        onBackPress={() => navigation.goBack?.()}
        backgroundColor={colors.bg1}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        alwaysBounceVertical={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tertiary}
            colors={[colors.tertiary]}
          />
        }
      >
        {workers.length > 0 ? (
          <>
            <View style={styles.card}>
              <Text style={styles.instructionText}>
                {translate("jobs.analyticsInstruction")}
              </Text>
            </View>

            {workers.map((worker, index) => (
              <TouchableOpacity
                key={worker.id}
                activeOpacity={0.7}
                onPress={() => handleViewWorkerAnalytics(worker)}
              >
                <View style={styles.card}>
                  <View style={styles.workerCardContent}>
                    <View style={styles.workerInfoSection}>
                      {worker.profilePicture ? (
                        <View
                          style={[
                            styles.workerAvatarContainer,
                            { backgroundColor: colors.bbg6 },
                          ]}
                        >
                          <Text style={styles.workerInitial}>
                            {worker.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      ) : (
                        <View
                          style={[
                            styles.workerAvatarContainer,
                            { backgroundColor: colors.bbg6 },
                          ]}
                        >
                          <MaterialIcons
                            name="person"
                            size={24}
                            color={colors.textdark}
                          />
                        </View>
                      )}

                      <View style={styles.workerDetails}>
                        <Text style={styles.workerName}>{worker.name}</Text>
                        <Text style={styles.workerHired}>
                          {translate("jobs.hiredDate", { date: worker.hired })}
                        </Text>
                        <View style={styles.paymentModeContainer}>
                          <View
                            style={[
                              styles.paymentModeBadge,
                              worker.paymentMode === "Cash"
                                ? styles.paymentModeBadgeCash
                                : styles.paymentModeBadgeCard,
                            ]}
                          >
                            <Text style={styles.paymentModeText}>
                              {worker.paymentMode}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <MaterialIcons
                      name="chevron-right"
                      size={24}
                      color={colors.text1}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <View style={styles.card}>
            <View style={styles.emptyStateContainer}>
              <MaterialIcons name="people" size={48} color={colors.text1} />
              <Text style={styles.emptyStateTitle}>
                {translate("jobs.noWorkersAssigned")}
              </Text>
              <Text style={styles.emptyStateMessage}>
                {translate("jobs.noWorkersAssignedDesc")}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexGrow: 1,
    paddingBottom: 120,
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
    textAlign: "center",
  },
  errorMessage: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text1,
    textAlign: "center",
    lineHeight: 20,
  },

  instructionText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.text1,
    lineHeight: 20,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Worker Card
  workerCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  workerInfoSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  workerAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: colors.bbg6,
  },
  workerInitial: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
  },
  workerDetails: {
    flex: 1,
  },
  workerName: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
    marginBottom: 4,
  },
  workerHired: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.text1,
    marginBottom: 8,
  },
  paymentModeContainer: {
    flexDirection: "row",
  },
  paymentModeBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  paymentModeBadgeCash: {
    backgroundColor: colors.bbg5,
  },
  paymentModeBadgeCard: {
    backgroundColor: colors.bbg6,
  },
  paymentModeText: {
    fontSize: 10,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
  },

  // Empty State
  emptyStateContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyStateTitle: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
  },
  emptyStateMessage: {
    marginTop: 8,
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.text1,
    textAlign: "center",
  },
});
