import Constants, { ExecutionEnvironment } from "expo-constants";

function isExpoGo() {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

function noopMessagingApi() {
  return {
    setBackgroundMessageHandler() {},
    onMessage() {
      return () => {};
    },
    async registerDeviceForRemoteMessages() {},
    async getToken() {
      return null;
    },
    onTokenRefresh() {
      return () => {};
    },
  };
}

let firebaseMessagingFactory;

/**
 * Same API as `@react-native-firebase/messaging` default export.
 * In Expo Go there is no native RNFirebase module — returns no-op implementation
 * so the app can load. Use a dev build (`expo run:android` / EAS) for real FCM.
 */
export default function messaging() {
  if (isExpoGo()) {
    return noopMessagingApi();
  }
  if (!firebaseMessagingFactory) {
    firebaseMessagingFactory = require("@react-native-firebase/messaging").default;
  }
  return firebaseMessagingFactory();
}
