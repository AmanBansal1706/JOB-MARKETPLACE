import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WorkerHomeScreen from "../screens/Worker/Tabs/HomeScreen";
import WorkerJobsScreen from "../screens/Worker/Tabs/JobsScreen";
import WorkerMessagesScreen from "../screens/Worker/Tabs/MessagesScreen";
import WorkerSettingsScreen from "../screens/Worker/Tabs/SettingsScreen";
import WorkerMainAlerts from "../screens/Worker/Tabs/MainAlerts";
import WorkerSearchJobScreen from "../screens/Worker/Tabs/SearchJobScreen";
import colors from "../theme/worker/colors";
import { useTranslation } from "../hooks/useTranslation";

const Tab = createBottomTabNavigator();

const tabIcons = {
  WorkerHome: require("../assets/worker-images/home(3).png"),
  WorkerJobs: require("../assets/worker-images/briefcase.png"),
  WorkerMessages: require("../assets/worker-images/message.png"),
  WorkerSettings: require("../assets/worker-images/settings(1).png"),
  WorkerMainAlerts: require("../assets/worker-images/briefcase.png"),
};

const filledTabIcons = {
  WorkerHome: require("../assets/worker-images/home.png"),
  WorkerJobs: require("../assets/worker-images/1briefcase.png"),
  WorkerMessages: require("../assets/worker-images/1message.png"),
  WorkerSettings: require("../assets/worker-images/1settings.png"),
  WorkerMainAlerts: require("../assets/worker-images/1briefcase.png"),
};

export default function WorkerTabNavigation() {
  const insets = useSafeAreaInsets();
  const { translate } = useTranslation();
  const tabBarHeight = Platform.select({
    ios: 65 + insets.bottom,
    android: 65 + insets.bottom,
    default: 65,
  });

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: tabBarHeight,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 6,
          borderTopWidth: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "Poppins_500Medium",
          color: colors.primary.pink,
        },
        tabBarIcon: ({ focused }) => {
          // Use vector icon for Alerts tab, keep image icons for others
          if (route.name === "WorkerMainAlerts") {
            return (
              <Ionicons
                name={focused ? "notifications" : "notifications-outline"}
                size={24}
                color={colors.primary.pink}
              />
            );
          }

          if (route.name === "WorkerSearchJob") {
            return (
              <Ionicons
                name={focused ? "search" : "search-outline"}
                size={24}
                color={colors.primary.pink}
              />
            );
          }

          return (
            <Image
              source={
                focused ? filledTabIcons[route.name] : tabIcons[route.name]
              }
              style={{ width: 24, height: 24, tintColor: colors.primary.pink }}
              resizeMode="contain"
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="WorkerHome"
        component={WorkerHomeScreen}
        options={{ title: translate("workerNav.home") }}
      />
      <Tab.Screen
        name="WorkerSearchJob"
        component={WorkerSearchJobScreen}
        options={{
          title: translate("workerNav.search"),
        }}
      />
      {/* <Tab.Screen
        name="WorkerJobs"
        component={WorkerJobsScreen}
        options={{ title: "Jobs" }}
      /> */}
      <Tab.Screen
        name="WorkerMessages"
        component={WorkerMessagesScreen}
        options={{ title: translate("workerNav.messages") }}
      />
      <Tab.Screen
        name="WorkerMainAlerts"
        component={WorkerMainAlerts}
        options={{ title: translate("workerNav.alerts") }}
      />

      <Tab.Screen
        name="WorkerSettings"
        component={WorkerSettingsScreen}
        options={{ title: translate("workerNav.settings") }}
      />
    </Tab.Navigator>
  );
}
