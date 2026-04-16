import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts } from "../theme";
import HomeScreen from "../screens/MainTabs/HomeScreen";
import JobsScreen from "../screens/MainTabs/JobsScreen";
import MessagesScreen from "../screens/MainTabs/MessagesScreen";
import SettingsStack from "./SettingsStack";
import { useTranslation } from "../hooks/useTranslation";

const Tab = createBottomTabNavigator();

const tabIcons = {
  Home: [
    require("../assets/images/home.png"),
    require("../assets/images/home_filled.png"),
  ],
  Jobs: [
    require("../assets/images/job1.png"),
    require("../assets/images/jobs_filled.png"),
  ],
  Messages: [
    require("../assets/images/message.png"),
    require("../assets/images/message_filled.png"),
  ],
  Settings: [
    require("../assets/images/setting.png"),
    require("../assets/images/setting_filled.png"),
  ],
};

export default function TabNavigation() {
  const { translate } = useTranslation();
  const insets = useSafeAreaInsets();

  // Calculate dynamic height based on safe area
  const tabBarHeight = Platform.select({
    ios: 65 + insets.bottom,
    android: 65 + insets.bottom,
    default: 65,
  });

  return (
    <Tab.Navigator
      detachInactiveScreens={false}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.tertiary,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: "#F4F4F4",
          borderTopWidth: 0,
          height: tabBarHeight,
          paddingBottom: Math.max(insets.bottom, 5),
          paddingTop: 5,
          elevation: 0,
          shadowColor: "#000",
          shadowOpacity: 0.8,
          paddingHorizontal: 20,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 6,
        },
        tabBarItemStyle: {
          alignItems: "center",
          justifyContent: "center",
        },
        tabBarIcon: ({ color, size, focused }) => {
          const [inactiveIcon, activeIcon] = tabIcons[route.name];
          const source = focused ? activeIcon : inactiveIcon;
          return (
            <Image
              source={source}
              style={{
                width: 22,
                height: 22,
                tintColor: focused ? colors.tertiary : color,
              }}
              resizeMode="contain"
            />
          );
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: fonts.bold,
          marginTop: -2,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: translate("navigation.home") }}
      />
      <Tab.Screen
        name="Jobs"
        component={JobsScreen}
        options={{ title: translate("navigation.jobs") }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ title: translate("navigation.messages") }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{ title: translate("navigation.settings") }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate("Settings", { screen: "SettingsHome" });
          },
        })}
      />
    </Tab.Navigator>
  );
}
