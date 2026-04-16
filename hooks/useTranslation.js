import { useSelector } from "react-redux";
import { t, getTranslations, getAvailableLanguages } from "../language/i18n";

/**
 * Custom hook for accessing translations throughout the app
 * Usage: const { language, translate, translations } = useTranslation();
 * Or shorter: const i18n = useTranslation();
 * Then use: i18n.translate('common.loading') or t(language, 'common.loading')
 */
export const useTranslation = () => {
  const language = useSelector((state) => state.Language.language);

  const translate = (key, params) => {
    return t(language, key, params);
  };

  const translations = getTranslations(language);

  const availableLanguages = getAvailableLanguages();

  return {
    language,
    translate,
    t: translate, // Alternative name for translate function
    translations,
    availableLanguages,
  };
};

export default useTranslation;
