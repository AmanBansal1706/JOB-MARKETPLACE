import messaging from "./firebaseMessaging";
import notifee, {
  AndroidImportance,
  AndroidColor,
  AuthorizationStatus,
} from "./notifeeSafe";
import { BACKEND_API_URL } from "@env";

// ============================================================================
// 1. ANDROID NOTIFICATION CHANNELS
// ============================================================================

/**
 * Create notification channels for Android 8.0+ (API 26+).
 * Safe to call on every app boot — existing channels are updated, not duplicated.
 * On iOS this resolves instantly (iOS has no concept of channels).
 */
export async function setupNotificationChannels() {
  await notifee.createChannel({
    id: "default",
    name: "General",
    importance: AndroidImportance.DEFAULT,
  });

  await notifee.createChannel({
    id: "job-alerts",
    name: "Job Alerts",
    importance: AndroidImportance.HIGH,
    vibration: true,
    lights: true,
    lightColor: AndroidColor.GREEN,
    sound: "default",
  });

  await notifee.createChannel({
    id: "chat-messages",
    name: "Chat Messages",
    importance: AndroidImportance.HIGH,
    vibration: true,
    sound: "default",
  });

  console.log("✅ Notification channels created");
}

// ============================================================================
// 2. PERMISSIONS
// ============================================================================

/**
 * Request notification permission from the user.
 * - iOS: shows the system permission dialog
 * - Android 13+ (API 33): shows the POST_NOTIFICATIONS dialog
 * - Android <13: permissions are granted by default
 *
 * @returns {Promise<boolean>} Whether permission was granted
 */
export async function requestNotificationPermission() {
  const settings = await notifee.requestPermission();

  if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
    console.log("✅ Notification permission granted");
    return true;
  }

  console.log("❌ Notification permission denied");
  return false;
}

// ============================================================================
// 3. FCM TOKEN MANAGEMENT
// ============================================================================

/**
 * Get the FCM device token and sync it to the TrabajoYA backend.
 * Call this on every app boot since tokens can change at any time.
 *
 * @param {string} authToken - The user's auth/bearer token from Redux (state.Auth.token)
 * @returns {Promise<string|null>} The FCM token or null on failure
 */
export async function registerFCMToken(authToken) {
  try {
    // iOS requires explicit registration for remote messages
    await messaging().registerDeviceForRemoteMessages();

    const fcmToken = await messaging().getToken();
    console.log("📱 FCM Token:", fcmToken);
    console.log("🔄 Auth Token:", authToken);

    if (authToken) {
      const response = await fetch(`${BACKEND_API_URL}/v1/auth/fcm-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ fcm_token: fcmToken }),
      });

      if (response.ok) {
        console.log("✅ FCM token synced to backend");
      } else {
        console.warn("⚠️ FCM token sync responded with:", response.status);
      }
    } else {
      console.log("⏭️ No auth token — skipping backend sync");
    }

    return fcmToken;
  } catch (error) {
    console.error("❌ FCM token registration failed:", error);
    return null;
  }
}

/**
 * Listen for token refreshes while the app is running.
 * Returns an unsubscribe function — call it in useEffect cleanup.
 *
 * @param {string} authToken - The user's auth/bearer token
 * @returns {Function} Unsubscribe function
 */
export function listenForTokenRefresh(authToken) {
  return messaging().onTokenRefresh(async (newToken) => {
    console.log("🔄 FCM Token refreshed:", newToken);
    console.log("🔄 Auth Token:", authToken);

    if (authToken) {
      try {
        await fetch(`${BACKEND_API_URL}/v1/auth/fcm-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ fcm_token: newToken }),
        });
        console.log("✅ Refreshed token synced to backend");
      } catch (error) {
        console.error("❌ Token refresh sync failed:", error);
      }
    }
  });
}

// ============================================================================
// 4. DISPLAY NOTIFICATION (called from foreground FCM handler)
// ============================================================================

/**
 * Display a rich local notification using Notifee.
 * Called when an FCM message arrives while the app is in the foreground,
 * because Android does NOT auto-display system notifications in foreground.
 *
 * @param {object} remoteMessage - The FCM RemoteMessage object
 */
export async function displayLocalNotification(remoteMessage) {
  const { notification, data } = remoteMessage;

  // Determine channel based on notification type from data payload
  let channelId = "default";
  if (data?.type === "job" || data?.type === "job_update") {
    channelId = "job-alerts";
  } else if (data?.type === "chat" || data?.type === "message") {
    channelId = "chat-messages";
  }

  await notifee.displayNotification({
    title: notification?.title || "TrabajoYA",
    body: notification?.body || "Tienes una nueva notificación",
    data: data || {},
    android: {
      channelId,
      smallIcon: "ic_launcher",
      color: "#12AA73", // TrabajoYA brand color (colors.tertiary)
      pressAction: {
        id: "default",
      },
    },
  });
}

// ============================================================================
// 5. TEST NOTIFICATION (for local testing — remove in production)
// ============================================================================

/**
 * Fire a local test notification immediately.
 * No server or FCM required — uses Notifee directly.
 * Call this from any screen to verify notifications work.
 *
 * Usage: import { testLocalNotification } from './services/NotificationService';
 *        testLocalNotification();
 */
