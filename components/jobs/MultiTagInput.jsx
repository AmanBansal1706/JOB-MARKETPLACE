import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors, fonts } from "../../theme";
const MultiTagInput = ({
  label,
  items = [],
  selectedIds = [],
  onSelectionChange,
  placeholder,
  error,
  required = false,
  containerStyle,
  tagContainerStyle,
  tagTextStyle,
  inputStyle,
  ...props
}) => {
  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const [inputValue, setInputValue] = useState("");
  const [customTags, setCustomTags] = useState(
    selectedIds
      .filter((id) => id.startsWith("custom-"))
      .map((id) => ({
        id,
        name: selectedItems.find((item) => item.id === id)?.name || "",
      }))
  );

  // Combine both selected items and custom tags for display
  const allTags = [
    ...selectedItems.map((item) => ({
      id: item.id,
      name: item.name,
      isCustom: false,
    })),
    ...customTags.map((tag) => ({
      ...tag,
      isCustom: true,
    })),
  ];
  const handleAddTag = () => {
    const tagText = inputValue.trim();
    if (!tagText) return;

    // Check if tag already exists (case-insensitive)
    const tagExists = allTags.some(
      (tag) => tag.name.toLowerCase() === tagText.toLowerCase()
    );

    if (!tagExists) {
      const newCustomId = `custom-${Date.now()}`;
      const newCustomTag = {
        id: newCustomId,
        name: tagText,
      };

      setCustomTags((prev) => [...prev, newCustomTag]);
      onSelectionChange && onSelectionChange([...selectedIds, newCustomId]);
      setInputValue("");
    }
  };
  const handleRemoveTag = (tagId) => {
    // Remove from selectedIds
    const newSelectedIds = selectedIds.filter((id) => id !== tagId);

    // If it's a custom tag, also remove from customTags
    if (tagId.startsWith("custom-")) {
      setCustomTags((prev) => prev.filter((tag) => tag.id !== tagId));
    }

    onSelectionChange && onSelectionChange(newSelectedIds);
  };
  const handleKeyPress = ({ nativeEvent }) => {
    if (nativeEvent.key === " " || nativeEvent.key === "Enter") {
      handleAddTag();
      return true;
    }
    return false;
  };
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View style={[styles.inputContainer, error && styles.errorBorder]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsContainer}
        >
          {allTags.map((tag) => (
            <View
              key={tag.id}
              style={[
                styles.tag,
                tagContainerStyle,
                tag.isCustom && styles.customTag,
              ]}
            >
              <Text style={[styles.tagText, tagTextStyle]}>{tag.name}</Text>
              <TouchableOpacity
                onPress={() => handleRemoveTag(tag.id)}
                style={styles.removeButton}
              >
                <MaterialIcons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          <TextInput
            style={[styles.input, inputStyle]}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder={allTags.length === 0 ? placeholder : ""}
            placeholderTextColor={colors.text1}
            onKeyPress={handleKeyPress}
            onSubmitEditing={handleAddTag}
            returnKeyType="done"
            blurOnSubmit={false}
            {...props}
          />
        </ScrollView>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddTag}
        disabled={!inputValue.trim()}
      >
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textdark,
    marginBottom: 8,
  },
  required: {
    color: "#F44336",
    fontFamily: fonts.bold,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 8,
    minHeight: 56,
  },
  errorBorder: {
    borderColor: "#F44336",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    flex: 1,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.tertiary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 4,
  },
  customTag: {
    backgroundColor: colors.secondary,
  },
  tagText: {
    color: "#FFFFFF",
    fontSize: 13,
    marginRight: 6,
    fontFamily: fonts.medium,
  },
  removeButton: {
    padding: 4,
    marginLeft: 4,
  },
  input: {
    flex: 1,
    minWidth: 100,
    padding: 8,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textdark,
    minHeight: 40,
    paddingVertical: 8,
  },
  errorText: {
    color: "#F44336",
    fontSize: 12,
    marginTop: 6,
    fontFamily: fonts.regular,
  },
  addButton: {
    alignSelf: "flex-end",
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.tertiary,
    borderRadius: 6,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
});
export default MultiTagInput;
