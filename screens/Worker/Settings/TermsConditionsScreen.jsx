import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../../theme/worker/colors";
import { useTranslation } from "../../../hooks/useTranslation";
import { getTermsAndConditions } from "../../../constants/TermsData";

export default function TermsConditionsScreen() {
  const navigation = useNavigation();
  const { language, translate } = useTranslation();
  const terms = getTermsAndConditions(language);

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" backgroundColor={colors.primary.pink} />

      {/* Header */}
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonContainer}
          >
            <Feather name="arrow-left" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {translate("workerTerms.termsConditions")}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.sectionTitle,
            { textAlign: "center", marginBottom: 5 },
          ]}
        >
          {terms.title}
        </Text>
        <Text
          style={[
            styles.sectionTitle,
            { textAlign: "center", marginBottom: 20 },
          ]}
        >
          {terms.subtitle}
        </Text>

        <Text style={styles.bodyText}>{terms.lastUpdated}</Text>
        <Text style={styles.bodyText}>{terms.owner}</Text>
        <Text style={styles.bodyText}>{terms.address}</Text>
        <Text style={styles.bodyText}>{terms.contact}</Text>

        <Text style={[styles.bodyText, { marginTop: 15, marginBottom: 20 }]}>
          {terms.definitionOfUsers}
        </Text>

        {terms?.sections?.map((section, index) => (
          <View key={index}>
            <Text style={styles.itemTitle}>{section?.title}</Text>
            {section?.content?.map((paragraph, pIndex) => (
              <Text key={pIndex} style={[styles.bodyText, { marginBottom: 8 }]}>
                {paragraph}
              </Text>
            ))}
          </View>
        ))}

        <TouchableOpacity
          style={styles.okButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.okButtonText}>
            {translate("workerCommon.ok")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.auth.background,
  },
  headerSafeArea: {
    backgroundColor: colors.primary.pink,
    zIndex: 10,
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: colors.primary.pink,
  },
  backButtonContainer: {
    padding: 5,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    marginLeft: 15,
  },
  scrollContent: {
    padding: 25,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: colors.auth.darkRed,
    marginBottom: 15,
  },
  itemTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: colors.auth.darkRed,
    marginTop: 20,
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.primary.pink,
    lineHeight: 22,
    marginBottom: 8,
  },
  boldText: {
    fontFamily: "Poppins_700Bold",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  contactText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.primary.pink,
    marginLeft: 10,
  },
  okButton: {
    backgroundColor: colors.primary.pink,
    borderRadius: 10,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    shadowColor: colors.primary.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  okButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 1,
  },
});
