import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { colors, fonts } from "../../theme";

export default function CategoryDropdown({
  categories,
  selectedCategory,
  onCategoryChange,
  isEditing,
  showDropdown,
  onToggleDropdown,
  categoriesLoading,
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Business Category</Text>
      {categoriesLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.tertiary} size="small" />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={[styles.dropdownButton, !isEditing && styles.inputDisabled]}
            onPress={onToggleDropdown}
            disabled={categories.length === 0 || !isEditing}
          >
            <Text
              style={[
                styles.dropdownText,
                !selectedCategory && styles.placeholderText,
              ]}
            >
              {selectedCategory
                ? categories.find((c) => c.value === selectedCategory)?.label
                : "Select category"}
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={16} color="#666" />
          </TouchableOpacity>

          {showDropdown && isEditing && (
            <View style={styles.dropdownMenu}>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <TouchableOpacity
                    key={category.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                      onCategoryChange(category.value);
                      onToggleDropdown();
                    }}
                  >
                    <MaterialIcons
                      name={category.icon}
                      size={18}
                      color="#999"
                      style={styles.categoryIcon}
                    />
                    <Text style={styles.dropdownItemText}>
                      {category.label}
                    </Text>
                    {selectedCategory === category.value && (
                      <MaterialIcons
                        name="check"
                        size={18}
                        color={colors.tertiary}
                      />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyDropdown}>
                  <Text style={styles.emptyDropdownText}>
                    No categories available
                  </Text>
                </View>
              )}
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: "#000",
    marginBottom: 8,
  },
  inputDisabled: {
    backgroundColor: "#F5F5F5",
  },
  dropdownButton: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  dropdownText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: "#000",
  },
  placeholderText: {
    color: "#B0B0B0",
  },
  dropdownMenu: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  categoryIcon: {
    marginRight: 12,
  },
  dropdownItemText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: "#000",
  },
  loadingContainer: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: "#666",
    marginLeft: 12,
  },
  emptyDropdown: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  emptyDropdownText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: "#999",
  },
});
