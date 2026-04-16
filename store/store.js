import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, createMigrate } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "redux";
import AuthReducer from "./Auth";
import ChatReducer from "./Chat";
import LanguageReducer from "./Language";

const rootReducer = combineReducers({
  Auth: AuthReducer,
  Chat: ChatReducer,
  Language: LanguageReducer,
});

// When the app is updated (e.g. new languages added), older persisted Language state may
// contain outdated fields like availableLanguages. Normalize it via migrations.
const migrations = {
  1: (state) => {
    if (!state) return state;

    const nextState = { ...state };

    if (nextState.Language) {
      const persistedLanguage = nextState.Language.language;
      const normalizedLanguage =
        persistedLanguage === "en" || persistedLanguage === "es"
          ? persistedLanguage
          : "en";

      // Keep only the fields we actually use.
      nextState.Language = { language: normalizedLanguage };
    }

    return nextState;
  },
};

const persistConfig = {
  key: "yaroot",
  storage: AsyncStorage,
  whitelist: ["Auth", "Language"], // Persist Auth and Language reducers
  version: 1,
  migrate: createMigrate(migrations, { debug: false }),
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

const persistor = persistStore(store);

const configureAppStore = () => {
  return { store, persistor };
};

export default configureAppStore;
