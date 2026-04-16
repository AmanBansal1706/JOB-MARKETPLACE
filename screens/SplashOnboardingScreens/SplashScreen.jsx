import { useEffect } from "react";
import { InteractionManager, StyleSheet, View, Image } from "react-native";
import { useSelector } from "react-redux";
import Loader from "../../components/loader";

export default function SplashScreen({ navigation }) {
  const token = useSelector((state) => state.Auth?.token);
  const user = useSelector((state) => state.Auth?.user);

  useEffect(() => {
    let timeoutId;
    const task = InteractionManager.runAfterInteractions(() => {
      timeoutId = setTimeout(() => {
        const role = user?.role;
        if (token && role === "BUSINESS") {
          navigation.replace("MainTabs");
        } else if (token && role === "WORKER") {
          navigation.replace("WorkerStack", {
            screen: "WorkerTabs",
          });
        } else {
          navigation.replace("OnBoardScreen");
        }
      }, 3000);
    });

    return () => {
      task.cancel();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []); // Only run once on mount

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require("../../assets/logo.png")}
        resizeMode="contain"
      />
      <Loader style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  logo: {
    width: 280,
    height: 100,
  },
  loader: {
    bottom: -280,
  },
});
