import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import logoutIcon from "../../../assets/worker-images/1logout.png";
import supportIcon from "../../../assets/worker-images/customer-service.png";
import transactionIcon from "../../../assets/worker-images/invoice.png";
import languageIcon from "../../../assets/worker-images/languages.png";
import notificationIcon from "../../../assets/worker-images/notification-bell.png";
import accountIcon from "../../../assets/worker-images/profile(1).png";
import editProfileIcon from "../../../assets/worker-images/edit.png";
import writingIcon from "../../../assets/worker-images/writing.png";
import colors from "../../../theme/worker/colors";
import { useTranslation } from "../../../hooks/useTranslation";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { translate } = useTranslation();
  const [logoutVisible, setLogoutVisible] = useState(false);

  const menuItems1 = [
    {
      id: 1,
      title: translate("workerSettings.profile"),
      icon: editProfileIcon,
      action: () => navigation.navigate("WorkerEditProfile"),
    },
    {
      id: 2,
      title: translate("workerSettings.transactionHistory"),
      icon: transactionIcon,
      action: () => navigation.navigate("WorkerTransactionHistory"),
    },
    {
      id: 3,
      title: translate("workerSettings.accountDetails"),
      icon: accountIcon,
      action: () => navigation.navigate("WorkerAccountDetails"),
    },
    {
      id: 4,
      title: translate("workerSettings.documents"),
      icon: writingIcon,
      action: () => navigation.navigate("WorkerEditDocuments"),
    },
    // {
    //   id: 5,
    //   title: "Disputes",
    //   icon: writingIcon,
    //   action: () => navigation.navigate("WorkerDisputes"),
    // },
    // {
    //   id: 6,
    //   title: "Job History",
    //   icon: writingIcon,
    //   action: () => navigation.navigate("WorkerJobHistory"),
    // },
    {
      id: 7,
      title: translate("workerSettings.supportHelp"),
      icon: supportIcon,
      action: () => navigation.navigate("WorkerSupport"),
    },
  ];

  const menuItems2 = [
    {
      id: 8,
      title: translate("workerSettings.language"),
      icon: languageIcon,
      action: () => navigation.navigate("WorkerLanguage"),
    },
    {
      id: 9,
      title: translate("workerSettings.notification"),
      icon: notificationIcon,
      action: () => navigation.navigate("WorkerNotifications"),
    },
    {
      id: 10,
      title: translate("workerSettings.logout"),
      icon: logoutIcon,
      action: () => setLogoutVisible(true),
    },
  ];

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={item.action}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <Image
          source={item.icon}
          style={styles.menuIcon}
          resizeMode="contain"
        />
        <Text style={styles.menuText}>{item.title}</Text>
      </View>
      <Feather name="chevron-right" size={24} color="#333" />
    </TouchableOpacity>
  );

  const handleLogout = () => {
    setLogoutVisible(false);
    // navigation.navigate("WorkerLogin");
    navigation.reset({
      index: 0,
      routes: [{ name: "LoginScreen" }],
    });
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" backgroundColor={colors.primary.pink} />

      {/* Header */}
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonContainer}
          >
            <Feather name="arrow-left" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {translate("workerSettings.settings")}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.card}>{menuItems1.map(renderMenuItem)}</View>

        <View style={styles.card}>{menuItems2.map(renderMenuItem)}</View>
      </ScrollView>

      {/* Logout Modal */}
      <Modal
        visible={logoutVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLogoutVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.logoutTitle}>
              {translate("workerSettings.logoutConfirm")}
            </Text>
            <Image
              source={logoutIcon}
              style={styles.logoutImage}
              resizeMode="contain"
            />
            <Text style={styles.logoutText}>
              {translate("workerSettings.logoutMessage")}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.yesButton} onPress={handleLogout}>
                <Text style={styles.yesButtonText}>
                  {translate("workerSettings.yes")}
                </Text>
              </TouchableOpacity>
              <View style={{ width: 15 }} />
              <TouchableOpacity
                style={styles.noButton}
                onPress={() => setLogoutVisible(false)}
              >
                <Text style={styles.noButtonText}>
                  {translate("workerSettings.no")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.ui.screenBackground, // Pinkish background
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
  backButtonContainer: {
    padding: 3,
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
    marginLeft: 15,
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderTopWidth: 6,
    borderTopColor: colors.primary.pink,
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginBottom: 25,
    shadowColor: colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 7,
    paddingHorizontal: 15,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    width: 24,
    height: 24,
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: colors.black,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 30,
    width: "100%",
    alignItems: "center",
    elevation: 5,
  },
  logoutTitle: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: "#F8456C", // Pink/Red title
    marginBottom: 20,
  },
  logoutImage: {
    width: 60,
    height: 60,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: colors.black,
    textAlign: "center",
    marginBottom: 30,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  yesButton: {
    flex: 1,
    backgroundColor: "#FF8FA3", // Light pink
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  yesButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  noButton: {
    flex: 1,
    backgroundColor: "#950F00", // Dark red
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  noButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
});
