import Constants, { ExecutionEnvironment } from "expo-constants";

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const EventTypeExpoGo = {
  UNKNOWN: -1,
  DISMISSED: 0,
  PRESS: 1,
  ACTION_PRESS: 2,
  DELIVERED: 3,
  APP_BLOCKED: 4,
  CHANNEL_BLOCKED: 5,
  CHANNEL_GROUP_BLOCKED: 6,
  TRIGGER_NOTIFICATION_CREATED: 7,
  FG_ALREADY_EXIST: 8,
};

const AuthorizationStatusExpoGo = {
  NOT_DETERMINED: -1,
  DENIED: 0,
  AUTHORIZED: 1,
  PROVISIONAL: 2,
};

const AndroidImportanceExpoGo = {
  NONE: 0,
  MIN: 1,
  LOW: 2,
  DEFAULT: 3,
  HIGH: 4,
};

const AndroidColorExpoGo = {
  RED: "red",
  BLUE: "blue",
  GREEN: "green",
  BLACK: "black",
  WHITE: "white",
  CYAN: "cyan",
  MAGENTA: "magenta",
  YELLOW: "yellow",
  LIGHTGRAY: "lightgray",
  DARKGRAY: "darkgray",
  GRAY: "gray",
  LIGHTGREY: "lightgrey",
  DARKGREY: "darkgrey",
  AQUA: "aqua",
  FUCHSIA: "fuchsia",
  LIME: "lime",
  MAROON: "maroon",
  NAVY: "navy",
  OLIVE: "olive",
  PURPLE: "purple",
  SILVER: "silver",
  TEAL: "teal",
};

const notifeeExpoGo = {
  createChannel: async () => {},
  requestPermission: async () => ({
    authorizationStatus: AuthorizationStatusExpoGo.AUTHORIZED,
  }),
  displayNotification: async () => {},
  onBackgroundEvent: () => {},
  onForegroundEvent: () => () => {},
  getInitialNotification: async () => null,
  cancelNotification: async () => {},
};

let realModule;
if (!isExpoGo) {
  realModule = require("@notifee/react-native");
}

const notifeeDefault = isExpoGo ? notifeeExpoGo : realModule.default;
export const EventType = isExpoGo ? EventTypeExpoGo : realModule.EventType;
export const AuthorizationStatus = isExpoGo
  ? AuthorizationStatusExpoGo
  : realModule.AuthorizationStatus;
export const AndroidImportance = isExpoGo
  ? AndroidImportanceExpoGo
  : realModule.AndroidImportance;
export const AndroidColor = isExpoGo ? AndroidColorExpoGo : realModule.AndroidColor;

export default notifeeDefault;
