import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { colors, fonts, fontSizes } from "../../../theme";
import { CommonHeader, ScreenWrapper } from "../../../components/common";
import { useTranslation } from "../../../hooks/useTranslation";
import { getTermsAndConditions } from "../../../constants/TermsData";

export default function TermsAndConditionsScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const { translate, language } = useTranslation();
  const terms = getTermsAndConditions(language);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Add your refresh logic here
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScreenWrapper backgroundColor={colors.bg}>
      <CommonHeader
        title={translate("jobs.termsAndConditions")}
        onBackPress={() => navigation.goBack()}
        backgroundColor={colors.tertiary}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
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
        <Text style={[styles.sectionTitle, { textAlign: "center", marginBottom: 5 }]}>
          {terms.title}
        </Text>
        <Text style={[styles.sectionTitle, { textAlign: "center", marginBottom: 20 }]}>
          {terms.subtitle}
        </Text>
        
        <Text style={styles.paragraph}>{terms.lastUpdated}</Text>
        <Text style={styles.paragraph}>{terms.owner}</Text>
        <Text style={styles.paragraph}>{terms.address}</Text>
        <Text style={styles.paragraph}>{terms.contact}</Text>
        
        <Text style={[styles.paragraph, { marginTop: 15, marginBottom: 20 }]}>
          {terms.definitionOfUsers}
        </Text>

        {terms?.sections?.map((section, index) => (
          <View key={index}>
            <Text style={styles.sectionHeader}>{section?.title}</Text>
            {section?.content?.map((paragraph, pIndex) => (
              <Text key={pIndex} style={[styles.paragraph, { marginBottom: 8 }]}>
                {paragraph}
              </Text>
            ))}
          </View>
        ))}

        <TouchableOpacity
          style={styles.okButton}
          activeOpacity={0.9}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.okButtonText}>{translate("common.ok")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.lg,
    color: colors.textdark,
    marginBottom: 12,
  },
  bullet: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textdark,
    marginBottom: 10,
    lineHeight: 20,
  },
  bulletNum: {
    fontFamily: fonts.semiBold,
    color: colors.textdark,
  },
  bold: {
    fontFamily: fonts.semiBold,
    color: colors.textdark,
  },
  sectionHeader: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.lg,
    color: colors.textdark,
    marginTop: 18,
    marginBottom: 8,
  },
  paragraph: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textdark,
    lineHeight: 20,
  },
  okButton: {
    backgroundColor: colors.tertiary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  okButtonText: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.md,
  },
});
