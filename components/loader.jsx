import React, { useEffect, useRef } from "react";
import { Animated, Easing, View, StyleSheet } from "react-native";

const Loader = ({ style }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={[styles.loader, style, { transform: [{ rotate: spin }] }]}
    >
      {[...Array(8)].map((_, i) => {
        const size = 5 + i;
        return (
          <View
            key={i}
            style={[
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: "#fff",
                position: "absolute",
                transform: [{ rotate: `${i * 45}deg` }, { translateY: -18 }],
              },
            ]}
          />
        );
      })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  loader: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Loader;
