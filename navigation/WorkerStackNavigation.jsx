import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import WorkerTabNavigation from "./WorkerTabNavigation";
import WorkerProfileSetupScreen from "../screens/Worker/Auth/ProfileSetupScreen";
import WorkerChatScreen from "../screens/Worker/Tabs/ChatScreen";
import WorkerApplyJobScreen from "../screens/Worker/Tabs/ApplyJobScreen";
import WorkerRaiseDisputeScreen from "../screens/Worker/Tabs/RaiseDisputeScreen";
import WorkerUnifiedJobDetailsScreen from "../screens/Worker/Tabs/UnifiedJobDetailsScreen";
import WorkerCompletedJobDetailsScreen from "../screens/Worker/Tabs/CompletedJobDetailsScreen";
import WorkerDisputedJobDetailsScreen from "../screens/Worker/Tabs/DisputedJobDetailsScreen";
import WorkerJobDetailsScreen from "../screens/Worker/Tabs/JobDetailsScreen";
import WorkerAssignedJobDetailsScreen from "../screens/Worker/Tabs/AssignedJobDetailsScreen";
import WorkerJobCompletionScreen from "../screens/Worker/Tabs/JobCompletionScreen";
import WorkerEditProfileScreen from "../screens/Worker/Settings/EditProfileScreen";
import WorkerTransactionHistoryScreen from "../screens/Worker/Settings/TransactionHistoryScreen";
import WorkerAccountDetailsScreen from "../screens/Worker/Settings/AccountDetailsScreen";
import WorkerEditDocumentsScreen from "../screens/Worker/Settings/EditDocumentsScreen";
import WorkerSupportScreen from "../screens/Worker/Settings/SupportScreen";
import WorkerLanguageScreen from "../screens/Worker/Settings/LanguageScreen";
import WorkerNotificationScreen from "../screens/Worker/Settings/NotificationScreen";
import WorkerTermsConditionsScreen from "../screens/Worker/Settings/TermsConditionsScreen";
import BusinessProfileScreen from "../screens/Worker/Tabs/BusinessProfileScreen";

// import WorkerSplashScreen from "../screens/Worker/Onboarding/SplashScreen"; // not required
// import WorkerOnboardingScreen from "../screens/Worker/Onboarding/OnboardingScreen"; // not required
// import WorkerLoginScreen from "../screens/Worker/Auth/LoginScreen"; // not required
// import WorkerRegisterScreen from "../screens/Worker/Auth/RegisterScreen"; // not required
// import WorkerOtpVerificationScreen from "../screens/Worker/Auth/OTPVerificationScreen"; // not required
// import WorkerForgotPasswordScreen from "../screens/Worker/Auth/ForgotPasswordScreen"; // not required
// import WorkerChangePasswordScreen from "../screens/Worker/Auth/ChangePasswordScreen"; // not required

const Stack = createStackNavigator();

export default function WorkerStackNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="WorkerProfileSetup"
        component={WorkerProfileSetupScreen}
      />
      <Stack.Screen name="WorkerTabs" component={WorkerTabNavigation} />
      <Stack.Screen name="WorkerChat" component={WorkerChatScreen} />
      <Stack.Screen name="WorkerApplyJob" component={WorkerApplyJobScreen} />
      <Stack.Screen
        name="WorkerRaiseDispute"
        component={WorkerRaiseDisputeScreen}
      />
      <Stack.Screen
        name="WorkerUnifiedJobDetails"
        component={WorkerUnifiedJobDetailsScreen}
      />
      <Stack.Screen
        name="WorkerCompletedJobDetails"
        component={WorkerCompletedJobDetailsScreen}
      />
      <Stack.Screen
        name="WorkerDisputedJobDetails"
        component={WorkerDisputedJobDetailsScreen}
      />
      <Stack.Screen
        name="WorkerJobDetails"
        component={WorkerJobDetailsScreen}
      />
      <Stack.Screen
        name="WorkerAssignedJobDetails"
        component={WorkerAssignedJobDetailsScreen}
      />
      <Stack.Screen
        name="WorkerJobCompletion"
        component={WorkerJobCompletionScreen}
      />
      <Stack.Screen name="BusinessProfile" component={BusinessProfileScreen} />
      <Stack.Screen
        name="WorkerEditProfile"
        component={WorkerEditProfileScreen}
      />
      <Stack.Screen
        name="WorkerTransactionHistory"
        component={WorkerTransactionHistoryScreen}
      />
      <Stack.Screen
        name="WorkerAccountDetails"
        component={WorkerAccountDetailsScreen}
      />
      <Stack.Screen
        name="WorkerEditDocuments"
        component={WorkerEditDocumentsScreen}
      />

      <Stack.Screen name="WorkerSupport" component={WorkerSupportScreen} />
      <Stack.Screen name="WorkerLanguage" component={WorkerLanguageScreen} />
      <Stack.Screen
        name="WorkerNotifications"
        component={WorkerNotificationScreen}
      />
      <Stack.Screen
        name="WorkerTermsConditions"
        component={WorkerTermsConditionsScreen}
      />

      {/* <Stack.Screen name="WorkerSplash" component={WorkerSplashScreen} /> */}
      {/* <Stack.Screen
        name="WorkerOnboarding"
        component={WorkerOnboardingScreen}
      /> */}
      {/* <Stack.Screen name="WorkerLogin" component={WorkerLoginScreen} /> */}
      {/* <Stack.Screen name="WorkerRegister" component={WorkerRegisterScreen} /> */}
      {/* <Stack.Screen
        name="WorkerOTPVerification"
        component={WorkerOtpVerificationScreen}
      />
      <Stack.Screen
        name="WorkerForgotPassword"
        component={WorkerForgotPasswordScreen}
      />
      <Stack.Screen
        name="WorkerChangePassword"
        component={WorkerChangePasswordScreen}
      /> */}
    </Stack.Navigator>
  );
}
