import "react-native-gesture-handler";
import "react-native-reanimated";
import React, { useEffect, useRef } from "react";
import { useFonts } from "expo-font";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import StackNavigation from "./navigation/StackNavigation";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  Poppins_200ExtraLight,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import configureAppStore from "./store/store";
import { colors } from "./theme";

// Notification imports (wrappers skip native modules in Expo Go)
import messaging from "./services/firebaseMessaging";
import notifee, { EventType } from "./services/notifeeSafe";
import {
  setupNotificationChannels,
  requestNotificationPermission,
  registerFCMToken,
  listenForTokenRefresh,
  displayLocalNotification,
} from "./services/NotificationService";

const { store, persistor } = configureAppStore();
const queryClient = new QueryClient();

/**
 * Inner app component that has access to Redux via useSelector.
 * Handles notification bootstrap after auth state is available.
 */
function AppContent() {
  const authToken = useSelector((state) => state.Auth.token);
  const navigationRef = useRef(null);

  // ── Notification Bootstrap ──
  useEffect(() => {
    async function initNotifications() {
      // 1. Create Android channels (safe to call every boot)
      await setupNotificationChannels();

      // 2. Request permission (iOS + Android 13+)
      const hasPermission = await requestNotificationPermission();

      // 3. Register FCM token & sync to backend (only if user is logged in)
      if (hasPermission && authToken) {
        await registerFCMToken(authToken);
      }
    }

    initNotifications();

    // 4. Listen for token refreshes
    let unsubRefresh;
    if (authToken) {
      unsubRefresh = listenForTokenRefresh(authToken);
    }

    return () => {
      if (unsubRefresh) unsubRefresh();
    };
  }, [authToken]);

  // ── Foreground FCM handler: display notification via Notifee ──
  useEffect(() => {
    const unsubFCM = messaging().onMessage(async (remoteMessage) => {
      console.log("[Foreground] FCM message:", remoteMessage);
      await displayLocalNotification(remoteMessage);
    });

    return unsubFCM;
  }, []);

  // ── Foreground Notifee event handler: handle taps / dismissals ──
  useEffect(() => {
    const unsubNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.PRESS:
          console.log(
            "[Foreground] Notification pressed:",
            detail.notification,
          );
          handleNotificationNavigation(
            detail.notification?.data,
            navigationRef,
          );
          break;
        case EventType.DISMISSED:
          console.log("[Foreground] Notification dismissed");
          break;
      }
    });

    return unsubNotifee;
  }, []);

  // ── Check if app was opened from a killed-state notification ──
  useEffect(() => {
    async function checkInitialNotification() {
      const initial = await notifee.getInitialNotification();
      if (initial) {
        console.log(
          "[Initial] App opened from notification:",
          initial.notification,
        );
        handleNotificationNavigation(initial.notification?.data, navigationRef);
      }
    }

    checkInitialNotification();
  }, []);

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.tertiary}
        translucent={false}
      />
      <NavigationContainer ref={navigationRef}>
        <StackNavigation />
      </NavigationContainer>
    </>
  );
}

/**
 * Route user to correct screen based on notification data payload.
 * Screen names match StackNavigation.jsx.
 */
function handleNotificationNavigation(data, navigationRef) {
  if (!data || !navigationRef.current) return;

  // Small delay to ensure navigation is fully mounted
  setTimeout(() => {
    const nav = navigationRef.current;

    // Determine the base tab screen depending on the user type
    const baseScreen = data.user_type === "worker" ? "WorkerTabs" : "MainTabs";

    switch (data.type) {
      // ── Job Related ──
      case "job_cancelled":
      case "proposal_accepted":
      case "job_selection":
      case "job_bid_request":
      case "job_overdue":
      case "cash_payment_denied":
      case "refund_processed":
      case "dispute_opened":
      case "proposal_received":
      case "review_request":
      case "review_received":
        if (data.user_type === "worker") {
          nav.navigate("WorkerTabs", { screen: "WorkerHome" });
        } else {
          nav.navigate("MainTabs", { screen: "Jobs" });
        }
        break;

      // ── Default Fallback ──
      default:
        nav.navigate(baseScreen);
        break;
    }
  }, 500);
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_200ExtraLight,
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <QueryClientProvider client={queryClient}>
              <AppContent />
            </QueryClientProvider>
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
