import { registerRootComponent } from "expo";
import messaging from "./services/firebaseMessaging";
import notifee, { EventType } from "./services/notifeeSafe";
import App from "./App";

// ──────────────────────────────────────────────
// FCM Background Message Handler
// Fires when app is in background or killed state.
// Must be registered BEFORE registerRootComponent.
// ──────────────────────────────────────────────
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("[Background] FCM message received:", remoteMessage);
  // Android auto-displays the notification if it has a `notification` payload.
  // For data-only messages, you could display manually here if needed.
});

// ──────────────────────────────────────────────
// Notifee Background Event Handler
// Fires when user interacts with a notification while app is in background/killed.
// Only ONE background event handler can be registered.
// ──────────────────────────────────────────────
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;

  switch (type) {
    case EventType.PRESS:
      console.log("[Background] Notification pressed:", notification);
      break;
    case EventType.ACTION_PRESS:
      console.log("[Background] Action pressed:", pressAction?.id);
      if (pressAction?.id === "mark-as-read") {
        await notifee.cancelNotification(notification.id);
      }
      break;
    case EventType.DISMISSED:
      console.log("[Background] Notification dismissed:", notification);
      break;
  }
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
