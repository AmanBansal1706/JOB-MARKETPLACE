import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import SplashScreen from "../screens/SplashOnboardingScreens/SplashScreen";
import OnBoardScreen from "../screens/SplashOnboardingScreens/OnBoardScreen";
import LoginScreen from "../screens/LoginRegistrationScreens/LoginScreen";
import CreateAccountScreen from "../screens/LoginRegistrationScreens/CreateAccountScreen";
import HomeScreen from "../screens/MainTabs/HomeScreen";
import TabNavigation from "./TabNavigation";
import ForgotPasswordScreen from "../screens/LoginRegistrationScreens/ForgotPasswordScreen";
import OtpVerificationScreen from "../screens/LoginRegistrationScreens/OtpVerificationScreen";
import ChangePasswordScreen from "../screens/LoginRegistrationScreens/ChangePasswordScreen";
import UnexpectedErrorScreen from "../screens/LoginRegistrationScreens/UnexpectedErrorScreen";
import JobPostForm from "../screens/MainTabs/Jobs/JobPostForm";
import ChatScreen2 from "../screens/MainTabs/Messages/ChatScreen2";
import TermsAndConditionsScreen from "../screens/MainTabs/Jobs/TermsAndConditionsScreen";
import ActiveApplicantsScreen from "../screens/MainTabs/Jobs/ActiveApplicantsScreen";
import ApplicantProfileScreen from "../screens/MainTabs/Jobs/ApplicantProfileScreen";
import RaiseDisputeScreen from "../screens/MainTabs/Jobs/RaiseDisputeScreen";
import WorkerAnalyticsScreen from "../screens/MainTabs/Jobs/WorkerAnalyticsScreen";
import WorkerAnalyticsListScreen from "../screens/MainTabs/Jobs/WorkerAnalyticsListScreen";
import SubmitReviewScreen from "../screens/MainTabs/Jobs/SubmitReviewScreen";
import RoleSelectionScreen from "../screens/SplashOnboardingScreens/RoleSelectionScreen";
import WorkerStackNavigation from "./WorkerStackNavigation";

import UnifiedJobDetailScreen from "../screens/MainTabs/Jobs/UnifiedJobDetailScreen";
import SelectedWorkersListScreen from "../screens/MainTabs/Jobs/SelectedWorkersListScreen";
import AllWorkersScreen from "../screens/MainTabs/AllWorkersScreen";

const Stack = createStackNavigator();

const forSmoothFade = ({ current, layouts }) => ({
  cardStyle: {
    opacity: current.progress,
    transform: [
      {
        translateY: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      },
    ],
  },
});

const config = {
  animation: "timing",
  config: {
    duration: 800,
    easing: (t) => t,
  },
};

export default function StackNavigation() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        cardStyleInterpolator: forSmoothFade,
        transitionSpec: {
          open: config,
          close: config,
        },
      }}
    >
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="OnBoardScreen" component={OnBoardScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen
        name="CreateAccountScreen"
        component={CreateAccountScreen}
      />

      <Stack.Screen name="WorkerStack" component={WorkerStackNavigation} />

      <Stack.Screen name="MainTabs" component={TabNavigation} />

      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="ForgotScreen" component={ForgotPasswordScreen} />
      <Stack.Screen
        name="OtpVerificationScreen"
        component={OtpVerificationScreen}
      />
      <Stack.Screen
        name="ChangePasswordScreen"
        component={ChangePasswordScreen}
      />
      <Stack.Screen
        name="UnexpectedeErrorScreen"
        component={UnexpectedErrorScreen}
      />
      <Stack.Screen name="JobPostForm" component={JobPostForm} />
      <Stack.Screen name="ChatScreen" component={ChatScreen2} />
      <Stack.Screen
        name="TermsAndConditions"
        component={TermsAndConditionsScreen}
      />

      {/*  */}
      <Stack.Screen
        name="UnifiedJobDetail"
        component={UnifiedJobDetailScreen}
      />
      <Stack.Screen
        name="SelectedWorkersListScreen"
        component={SelectedWorkersListScreen}
      />
      <Stack.Screen name="SubmitReview" component={SubmitReviewScreen} />

      {/*  */}
      <Stack.Screen
        name="ActiveApplicants"
        component={ActiveApplicantsScreen}
      />
      <Stack.Screen
        name="ApplicantProfile"
        component={ApplicantProfileScreen}
      />
      <Stack.Screen name="RaiseDispute" component={RaiseDisputeScreen} />
      <Stack.Screen
        name="WorkerAnalyticsList"
        component={WorkerAnalyticsListScreen}
      />
      <Stack.Screen name="WorkerAnalytics" component={WorkerAnalyticsScreen} />
      <Stack.Screen name="AllWorkers" component={AllWorkersScreen} />
    </Stack.Navigator>
  );
}
