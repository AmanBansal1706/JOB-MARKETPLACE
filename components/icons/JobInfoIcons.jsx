import React from "react";
import { View } from "react-native";
import Svg, { Circle, Path, Rect, Text as SvgText } from "react-native-svg";

const iconSize = 16;
const iconColor = "#4CAF50"; // Default tertiary color

/**
 * Position Icon - Briefcase
 */
export const PositionIcon = ({ size = iconSize, color = iconColor }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6H16V5C16 3.9 15.1 3 14 3H10C8.9 3 8 3.9 8 5V6H4C2.9 6 2 6.9 2 8V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V8C22 6.9 21.1 6 20 6ZM10 5H14V6H10V5ZM20 19H4V8H20V19Z"
      fill={color}
    />
  </Svg>
);

/**
 * Shift Time Icon - Clock
 */
export const ShiftTimeIcon = ({ size = iconSize, color = iconColor }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
    <Path
      d="M12 6V12L16 14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

/**
 * Pay Rate Icon - Money
 */
export const PayRateIcon = ({ size = iconSize, color = iconColor }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12"
      cy="12"
      r="9"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
    <Path
      d="M9 12C9 10.3 10.3 9 12 9C13.7 9 15 10.3 15 12C15 13.7 13.7 15 12 15C10.3 15 9 13.7 9 12Z"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
    <Path d="M12 7V8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Path
      d="M12 16V17"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

/**
 * Breaks Time Icon - Timer
 */
export const BreaksTimeIcon = ({ size = iconSize, color = iconColor }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12"
      cy="13"
      r="9"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
    <Path
      d="M12 9V13L15 15"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Path
      d="M7 2H8M16 2H17"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

/**
 * Total Workers Icon - Group/People
 */
export const TotalWorkersIcon = ({ size = iconSize, color = iconColor }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="8" cy="7" r="3" stroke={color} strokeWidth="1.5" fill="none" />
    <Path
      d="M3 21C3 18.24 5.13 16 8 16C10.87 16 13 18.24 13 21"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Circle cx="16" cy="7" r="3" stroke={color} strokeWidth="1.5" fill="none" />
    <Path
      d="M11 21C11 18.24 13.13 16 16 16C18.87 16 21 18.24 21 21"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

/**
 * Total Cost Icon - Coins/Monetization
 */
export const TotalCostIcon = ({ size = iconSize, color = iconColor }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="8" cy="12" r="6" stroke={color} strokeWidth="1.5" fill="none" />
    <Path d="M8 10V14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M6 12H10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Circle cx="16" cy="8" r="5" stroke={color} strokeWidth="1.5" fill="none" />
    <Path d="M16 6V10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M14 8H18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

/**
 * Payment Mode Icon - Card
 */
export const PaymentModeIcon = ({ size = iconSize, color = iconColor }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="2"
      y="5"
      width="20"
      height="14"
      rx="2"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
    <Path d="M2 9H22" stroke={color} strokeWidth="1.5" />
    <Circle cx="8" cy="16" r="1.5" fill={color} />
  </Svg>
);

/**
 * Assigned Workers Icon - People Check
 */
export const AssignedWorkersIcon = ({ size = iconSize, color = iconColor }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="9" cy="8" r="3" stroke={color} strokeWidth="1.5" fill="none" />
    <Path
      d="M3 18C3 15.24 5.69 13 9 13C12.31 13 15 15.24 15 18"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Path
      d="M17 9L19 11L23 7"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default {
  PositionIcon,
  ShiftTimeIcon,
  PayRateIcon,
  BreaksTimeIcon,
  TotalWorkersIcon,
  TotalCostIcon,
  PaymentModeIcon,
  AssignedWorkersIcon,
};
