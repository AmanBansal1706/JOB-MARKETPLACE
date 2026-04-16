import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors } from "../theme";

const TopCurveHeader = ({
  height,
  width: widthProp,
  backgroundColor = colors.bg1,
  curveColor = colors.bg1,
  style,
  children,
  CustomD,
  c1x,
  c1y,
  endY,
  secondCurveC1Y,
  secondCurveEndY,
}) => {
  const { width: windowWidth, height: screenHeight } = useWindowDimensions();
  const measuredHeight = height ?? screenHeight * 0.32;
  const measuredWidth = widthProp ?? windowWidth;
  const defaultC1x = c1x ?? measuredWidth / 2;
  const defaultC1y = c1y ?? measuredHeight * 0.45;
  const defaultEndY = endY ?? measuredHeight * 0.95;
  const defaultSecondCurveC1Y = secondCurveC1Y ?? measuredHeight * 0.65;
  const defaultSecondCurveEndY = secondCurveEndY ?? measuredHeight * 0.95;

  const curvePath = CustomD
    ? CustomD
    : `
      M0,${defaultEndY}
      Q${defaultC1x},${defaultC1y} ${measuredWidth},${defaultEndY}
      L${measuredWidth},0
      L0,0
      Z
    `;

  return (
    <View style={[styles.container, { height: measuredHeight }, style]}>
      <Svg
        width={measuredWidth}
        height={measuredHeight}
        style={StyleSheet.absoluteFill}
      >
        <Path d={curvePath} fill={curveColor} />
        {!CustomD && (
          <Path
            d={`M0,${defaultSecondCurveEndY} Q${
              measuredWidth / 2
            },${defaultSecondCurveC1Y} ${measuredWidth},${defaultSecondCurveEndY} L${measuredWidth},0 L0,0 Z`}
            fill={backgroundColor}
          />
        )}
      </Svg>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    position: "relative",
    overflow: "hidden",
  },
  content: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    paddingTop: 48,
    paddingHorizontal: 24,
  },
});

export default TopCurveHeader;
