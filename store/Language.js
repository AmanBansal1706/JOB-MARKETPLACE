import { createSlice } from "@reduxjs/toolkit";

// NOTE:
// Do not keep an "availableLanguages" list in Redux state.
// That list gets persisted by redux-persist, and after an app update (e.g. adding Spanish),
// older persisted state can still contain only ["en"], which would block switching to "es"
// until the user clears storage (uninstall/reinstall).
import { getAvailableLanguages } from "../language/i18n";

const initialState = {
  language: "en", // Default language
};

const isSupportedLanguage = (languageCode) => {
  if (!languageCode) return false;
  return getAvailableLanguages().some((l) => l.code === languageCode);
};

const LanguageSlice = createSlice({
  name: "Language",
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      const languageCode = action.payload;
      if (isSupportedLanguage(languageCode)) {
        state.language = languageCode;
      }
    },
    resetLanguage: (state) => {
      state.language = initialState.language;
    },
  },
});

export const { setLanguage, resetLanguage } = LanguageSlice.actions;
export default LanguageSlice.reducer;
