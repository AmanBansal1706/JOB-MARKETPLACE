import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useDispatch } from "react-redux";
import { colors, fonts, fontSizes } from "../../../theme";
import { CommonHeader, ScreenWrapper } from "../../../components/common";
import { useTranslation } from "../../../hooks/useTranslation";
import { setLanguage } from "../../../store/Language";
import { getAvailableLanguages } from "../../../language/i18n";

export default function LanguageScreen({ navigation }) {
  const dispatch = useDispatch();
  const { language, translate, availableLanguages } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setRefreshing(false);
    }
  };

  const handleLanguageChange = (languageCode) => {
    if (language !== languageCode) {
      dispatch(setLanguage(languageCode));
      Alert.alert(
        translate("common.success"),
        translate("messages.languageChanged")
      );
    }
  };

  return (
    <ScreenWrapper backgroundColor={colors.bg}>
      <CommonHeader
        title={translate("settings.language")}
        onBackPress={() => navigation.goBack?.()}
        backgroundColor={colors.bg1}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        directionalLockEnabled={true}
        decelerationRate="normal"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tertiary}
            colors={[colors.tertiary]}
          />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {translate("settings.selectLanguage")}
          </Text>
          <Text style={styles.sectionDescription}>
            {translate("messages.selectLanguageMessage")}
          </Text>

          <View style={styles.languageList}>
            {availableLanguages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageCard,
                    isSelected && styles.languageCardSelected,
                  ]}
                  onPress={() => handleLanguageChange(lang.code)}
                  activeOpacity={0.7}
                >
                  <View style={styles.languageCardContent}>
                    <Text
                      style={[
                        styles.languageName,
                        isSelected && styles.languageNameSelected,
                      ]}
                    >
                      {lang.name}
                    </Text>
                    <Text
                      style={[
                        styles.languageNative,
                        isSelected && styles.languageNativeSelected,
                      ]}
                    >
                      {lang.nativeName}
                    </Text>
                  </View>

                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>💡 {translate("common.ok")}</Text>
            <Text style={styles.infoText}>
              {translate("settings.languagePreferenceSaved")}
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.bold,
    color: colors.textdark,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.regular,
    color: colors.text1,
    marginBottom: 20,
    lineHeight: 20,
  },
  languageList: {
    marginBottom: 24,
    gap: 12,
  },
  languageCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  languageCardSelected: {
    borderColor: colors.tertiary,
    backgroundColor: colors.tertiary + "15", // Light tint of tertiary color
  },
  languageCardContent: {
    flex: 1,
  },
  languageName: {
    fontSize: fontSizes.base,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
    marginBottom: 4,
  },
  languageNameSelected: {
    color: colors.tertiary,
  },
  languageNative: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.regular,
    color: colors.text1,
  },
  languageNativeSelected: {
    color: colors.tertiary,
    fontFamily: fonts.semiBold,
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.tertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  infoBox: {
    backgroundColor: "#F0F7FF",
    borderLeftWidth: 4,
    borderLeftColor: colors.tertiary,
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.semiBold,
    color: colors.tertiary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.regular,
    color: colors.text1,
    lineHeight: 20,
  },
});
