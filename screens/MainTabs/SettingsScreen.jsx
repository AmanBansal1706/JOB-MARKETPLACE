import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  Modal,
} from "react-native";
import { useDispatch } from "react-redux";
import { colors, fonts } from "../../theme";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";
import { CommonHeader, ScreenWrapper } from "../../components/common";
import { useTranslation } from "../../hooks/useTranslation";
import { LogoutRed } from "../../store/Auth";
import { clearChatState } from "../../store/Chat";

// Inline CurveCard Component
function CurveCard({ children, style }) {
  return (
    <View style={[styles.curveCardWrap, style]}>
      <View style={styles.curveCardCurve} />
      <View style={styles.curveCard}>{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const { translate } = useTranslation();

  const handleLogout = () => {
    setLogoutModalVisible(false);
    // Dispatch logout actions to clear Redux state
    dispatch(LogoutRed());
    dispatch(clearChatState());
    // Navigate to LoginScreen
    navigation.reset({
      index: 0,
      routes: [{ name: "LoginScreen" }],
    });
  };

  const primaryItems = [
    // {
    //   key: "CompleteProfile",
    //   title: translate("profile.myProfile"),
    //   icon: require("../../assets/images/edit.png"),
    // },
    {
      key: "EditProfile",
      title: translate("profile.editProfile"),
      icon: require("../../assets/images/edit.png"),
    },
    {
      key: "TransactionHistory",
      title: translate("settings.transactionHistory"),
      icon: require("../../assets/images/checkapproval.png"),
    },
    {
      key: "AccountDetails",
      title: translate("settings.accountDetails"),
      icon: require("../../assets/images/profile.png"),
    },
    {
      key: "BusinessDocuments",
      title: translate("settings.businessDocuments"),
      icon: require("../../assets/images/file.png"),
    },
    {
      key: "SupportHelp",
      title: translate("settings.help"),
      icon: require("../../assets/images/customerservice.png"),
    },
  ];

  const secondaryItems = [
    {
      key: "Language",
      title: translate("settings.language"),
      icon: require("../../assets/images/languages.png"),
    },
    {
      key: "NotificationSettings",
      title: translate("settings.notifications"),
      icon: require("../../assets/images/notificationbell1.png"),
    },
    {
      key: "Logout",
      title: translate("settings.logout"),
      icon: require("../../assets/images/logout_new.png"),
    },
  ];

  const renderItem = (item, isLast = false) => (
    <TouchableOpacity
      key={item.key}
      activeOpacity={0.8}
      style={[styles.row, isLast && { borderBottomWidth: 0 }]}
      onPress={() => {
        if (item.key === "Logout") {
          setLogoutModalVisible(true);
        } else {
          navigation.navigate(item.key);
        }
      }}
    >
      <View style={styles.rowLeft}>
        <Image source={item.icon} style={styles.rowIcon} resizeMode="contain" />
        <Text style={styles.rowText}>{item.title}</Text>
      </View>
      <FontAwesome5 name="chevron-right" size={16} color={colors.textdark} />
    </TouchableOpacity>
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Add your refresh logic here
      // For settings, we typically don't need to fetch new data on refresh
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScreenWrapper backgroundColor={colors.bg} edges={["top"]}>
      <CommonHeader
        title={translate("settings.title")}
        onBackPress={() => navigation.goBack?.()}
        backgroundColor={colors.bg1}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        directionalLockEnabled={true}
        decelerationRate="normal"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tertiary}
            colors={[colors.tertiary]}
          />
        }
      >
        <CurveCard>
          {primaryItems.map((it, idx) =>
            renderItem(it, idx === primaryItems.length - 1)
          )}
        </CurveCard>

        <CurveCard style={{ marginTop: 16 }}>
          {secondaryItems.map((it, idx) =>
            renderItem(it, idx === secondaryItems.length - 1)
          )}
        </CurveCard>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {translate("settings.logoutQuestion")}
            </Text>
            <Image
              source={require("../../assets/images/logout_new.png")}
              style={styles.modalIcon}
              resizeMode="contain"
            />
            <Text style={styles.modalMessage}>
              {translate("settings.logoutConfirmation")}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.yesButton]}
                onPress={handleLogout}
              >
                <Text style={styles.yesButtonText}>
                  {translate("common.yes")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.noButton]}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.noButtonText}>
                  {translate("common.no")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingVertical: 50,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 41,
    paddingHorizontal: 16,
    borderBottomWidth: 0,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  rowText: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
  },
  // Curve Card Styles
  curveCardWrap: {
    width: "100%",
    position: "relative",
  },
  curveCardCurve: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 20,
    top: -10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: colors.tertiary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  curveCard: {
    width: "100%",
    borderRadius: 15,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingVertical: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.primary,
    marginBottom: 16,
  },
  modalIcon: {
    width: 90,
    height: 90,
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: "#000",
    textAlign: "center",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  yesButton: {
    backgroundColor: "#8CE0BE",
  },
  noButton: {
    backgroundColor: "#005F40",
  },
  yesButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  noButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
});
