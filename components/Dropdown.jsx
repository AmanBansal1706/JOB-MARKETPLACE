import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  FlatList,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors, fonts, fontSizes } from "../theme";

const defaultColors = {
  bg: "#FFFFFF",
  border: "#E5E5E5",
  text: colors.textdark,
  placeholder: colors.text5,
  caret: colors.text1,
  menuBg: "#FFFFFF",
  menuBorder: "#E5E5E5",
  menuText: colors.textdark,
  overlay: "rgba(0,0,0,0.15)",
};

export default function Dropdown({
  value,
  onChange = () => {},
  options = [],
  keyExtractor = (o, i) =>
    typeof o === "string" ? `${o}-${i}` : String(o.value ?? i),
  labelExtractor = (o) => (typeof o === "string" ? o : String(o.label ?? "")),
  placeholder = "Select...",
  disabled = false,
  height = 44,
  radius = 10,
  colorsOverride = {},
  style = {},
  inputStyle = {},
  menuStyle = {},
  maxMenuHeight = 220,
}) {
  const palette = { ...defaultColors, ...colorsOverride };
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0, w: 0, h: height });
  const ref = useRef(null);

  const selectedLabel = useMemo(() => {
    if (value == null) return null;
    const found = options.find((o) =>
      typeof o === "string" ? o === value : (o.value ?? o.label) === value
    );
    if (!found) return null;
    return labelExtractor(found);
  }, [value, options]);

  const openMenu = () => {
    if (disabled) return;
    ref.current?.measureInWindow((x, y, w, h) => {
      setAnchor({ x, y, w, h });
      setOpen(true);
    });
  };

  const closeMenu = () => setOpen(false);

  const renderItem = ({ item }) => {
    const label = labelExtractor(item);
    const itemValue =
      typeof item === "string" ? item : item.value ?? item.label;
    const active = selectedLabel === label;
    return (
      <Pressable
        onPress={() => {
          onChange(itemValue, item);
          closeMenu();
        }}
        style={({ pressed }) => [
          styles.menuItem,
          pressed && { backgroundColor: "#F3F6F5" },
        ]}
      >
        <Text
          style={[
            styles.menuText,
            {
              color: palette.menuText,
              fontFamily: active ? fonts.semiBold : fonts.regular,
            },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  const topSpace = anchor.y;
  const screenH = Dimensions.get("window").height;
  const belowSpace = screenH - (anchor.y + anchor.h);
  const openBelow =
    belowSpace >= Math.min(maxMenuHeight, 180) || belowSpace >= topSpace;

  return (
    <>
      <Pressable
        ref={ref}
        onPress={openMenu}
        style={[
          styles.input,
          {
            height,
            borderRadius: radius,
            backgroundColor: palette.bg,
            borderColor: palette.border,
            opacity: disabled ? 0.6 : 1,
          },
          style,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.valueText,
            {
              color: selectedLabel ? palette.text : palette.placeholder,
              fontFamily: selectedLabel ? fonts.regular : fonts.regular,
            },
            inputStyle,
          ]}
        >
          {selectedLabel ?? placeholder}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={22} color={palette.caret} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <Pressable
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: palette.overlay },
          ]}
          onPress={closeMenu}
        />
        <View
          style={[
            styles.menu,
            {
              top: openBelow
                ? anchor.y + anchor.h + 4
                : Math.max(8, anchor.y - maxMenuHeight - 4),
              left: anchor.x,
              width: anchor.w,
              maxHeight: maxMenuHeight,
              backgroundColor: palette.menuBg,
              borderColor: palette.menuBorder,
              borderRadius: radius,
            },
            menuStyle,
          ]}
        >
          <FlatList
            data={options}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            bounces={false}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    paddingHorizontal: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  valueText: {
    fontSize: fontSizes.sm,
    marginRight: 6,
  },
  menu: {
    position: "absolute",
    borderWidth: 1,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  menuText: {
    fontSize: fontSizes.sm,
  },
  sep: { height: 1, backgroundColor: "#F0F0F0" },
});
