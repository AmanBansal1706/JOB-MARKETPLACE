import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import SettingsScreen from "../screens/MainTabs/SettingsScreen";
import EditProfileScreen from "../screens/MainTabs/Settings/EditProfileScreen";
import TransactionHistoryScreen from "../screens/MainTabs/Settings/TransactionHistoryScreen";
import AccountDetailsScreen from "../screens/MainTabs/Settings/AccountDetailsScreen";
import BusinessDocumentsScreen from "../screens/MainTabs/Settings/BusinessDocumentsScreen";
import SupportHelpScreen from "../screens/MainTabs/Settings/SupportHelpScreen";
import LanguageScreen from "../screens/MainTabs/Settings/LanguageScreen";
import NotificationSettingsScreen from "../screens/MainTabs/Settings/NotificationSettingsScreen";
import RaiseTicketScreen from "../screens/MainTabs/Settings/RaiseTicketScreen";
import TicketDetailScreen from "../screens/MainTabs/Settings/TicketDetailScreen";

const Stack = createStackNavigator();

const forSmoothFade = ({ current }) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

const config = {
  animation: "timing",
  config: {
    duration: 250,
  },
};

export default function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureResponseDistance: 100,
        cardStyleInterpolator: forSmoothFade,
        transitionSpec: {
          open: config,
          close: config,
        },
      }}
    >
      <Stack.Screen name="SettingsHome" component={SettingsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen
        name="TransactionHistory"
        component={TransactionHistoryScreen}
      />
      <Stack.Screen name="AccountDetails" component={AccountDetailsScreen} />
      <Stack.Screen
        name="BusinessDocuments"
        component={BusinessDocumentsScreen}
      />
      <Stack.Screen name="SupportHelp" component={SupportHelpScreen} />
      <Stack.Screen name="RaiseTicket" component={RaiseTicketScreen} />
      <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
      />
    </Stack.Navigator>
  );
}
