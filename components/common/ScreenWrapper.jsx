import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { colors } from "../../theme";
import React from "react";

export default function ScreenWrapper({
  children,
  containerStyle,
  statusBarStyle = "light",
  statusBarBackground = colors.tertiary,
  backgroundColor = colors.tertiary,
  edges = ["top"],
  showStatusBar = true,
}) {
  return (
    // apply the statusBarBackground color to the SafeAreaView so the
    // top inset (behind the native status bar) is colored correctly
    <SafeAreaView
      edges={edges}
      style={[styles.safeArea, { backgroundColor: statusBarBackground }]}
    >
      {showStatusBar && (
        <StatusBar
          style={statusBarStyle}
          backgroundColor={statusBarBackground}
        />
      )}
      <View style={[{ backgroundColor }, styles.container, containerStyle]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});
