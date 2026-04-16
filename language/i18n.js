import en from "./en.json";
import es from "./es.json";
import workerEn from "./worker_en.json";
import workerEs from "./worker_es.json";

// All available translations (merge business + worker)
const translations = {
  en: { ...en, ...workerEn },
  es: { ...es, ...workerEs },
};

// Get a translation key with fallback to English
export const t = (language = "en", key = "", params = {}) => {
  if (!key) return "";

  const getVal = (langObj, k) => {
    const keys = k.split(".");
    let value = langObj;
    for (const keyPart of keys) {
      if (value && typeof value === "object") {
        value = value[keyPart];
      } else {
        return null;
      }
    }
    return value;
  };

  let value = getVal(translations[language], key);

  if (!value && language !== "en") {
    value = getVal(translations["en"], key);
  }

  if (!value) return key;

  if (typeof value === "string" && params) {
    Object.keys(params).forEach((param) => {
      value = value.replace(new RegExp(`{${param}}`, "g"), params[param]);
    });
  }

  return value;
};

// Get all translations for a language
export const getTranslations = (language = "en") => {
  return translations[language] || translations["en"];
};

// Get available languages
export const getAvailableLanguages = () => {
  return [
    { code: "en", name: "English", nativeName: "English" },
    { code: "es", name: "Spanish", nativeName: "Español" },
  ];
};

// Get language name by code
export const getLanguageName = (code) => {
  const lang = getAvailableLanguages().find((l) => l.code === code);
  return lang ? lang.name : code;
};

// Get native language name by code
export const getLanguageNativeName = (code) => {
  const lang = getAvailableLanguages().find((l) => l.code === code);
  return lang ? lang.nativeName : code;
};

export default {
  t,
  getTranslations,
  getAvailableLanguages,
  getLanguageName,
  getLanguageNativeName,
};
