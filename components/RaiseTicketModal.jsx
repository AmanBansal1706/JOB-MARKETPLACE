// import React, { useState, useCallback, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Modal,
//   Pressable,
//   TextInput,
//   Platform,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   Image,
// } from "react-native";
// import { colors, fonts, fontSizes } from "../theme";
// import * as ImagePicker from "expo-image-picker";
// import { MaterialCommunityIcons } from "@expo/vector-icons";

// export default function RaiseTicketModal({
//   visible,
//   onClose,
//   onSubmit,
//   isLoading = false,
//   prefilledEmail = "",
//   prefilledMobile = "",
// }) {
//   const [subject, setSubject] = useState("");
//   const [desc, setDesc] = useState("");
//   const [email, setEmail] = useState(prefilledEmail);
//   const [mobile, setMobile] = useState(prefilledMobile);
//   const [mediaUri, setMediaUri] = useState(null);
//   const [subjectOpen, setSubjectOpen] = useState(false);

//   // Update email and mobile when modal opens or props change
//   useEffect(() => {
//     if (visible) {
//       setEmail(prefilledEmail);
//       setMobile(prefilledMobile);
//     }
//   }, [visible, prefilledEmail, prefilledMobile]);

//   const SUBJECT_OPTIONS = [
//     "Technical or App Issue",
//     "Payment Issue",
//     "Verification",
//     "Document Upload",
//     "Profile/Account Setting",
//     "Privacy",
//     "Data Concerns",
//     "Request Feature",
//     "Send Feedback",
//     "Other",
//   ];

//   const isFormValid = subject && desc && email && mobile;

//   // Pick image from gallery
//   const pickImage = useCallback(async () => {
//     try {
//       const permissionResult =
//         await ImagePicker.requestMediaLibraryPermissionsAsync();

//       if (permissionResult.granted === false) {
//         Alert.alert(
//           "Permission Required",
//           "Permission to access gallery is required!"
//         );
//         return;
//       }

//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 1,
//       });

//       if (!result.canceled) {
//         setMediaUri(result.assets[0].uri);
//       }
//     } catch (error) {
//       console.error("Error picking image:", error);
//       Alert.alert("Error", "Failed to pick image");
//     }
//   }, []);

//   // Take photo with camera
//   const openCamera = useCallback(async () => {
//     try {
//       const permissionResult =
//         await ImagePicker.requestCameraPermissionsAsync();

//       if (permissionResult.granted === false) {
//         Alert.alert(
//           "Permission Required",
//           "Permission to access camera is required!"
//         );
//         return;
//       }

//       const result = await ImagePicker.launchCameraAsync({
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 1,
//       });

//       if (!result.canceled) {
//         setMediaUri(result.assets[0].uri);
//       }
//     } catch (error) {
//       console.error("Error opening camera:", error);
//       Alert.alert("Error", "Failed to open camera");
//     }
//   }, []);

//   // Remove selected media
//   const removeMedia = useCallback(() => {
//     setMediaUri(null);
//   }, []);

//   // Handle form submission
//   const handleSubmit = () => {
//     if (!isFormValid) {
//       Alert.alert("Validation Error", "Please fill in all required fields");
//       return;
//     }

//     // Email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       Alert.alert("Validation Error", "Please enter a valid email address");
//       return;
//     }

//     // Mobile validation (10-15 digits)
//     const mobileRegex = /^\d{10,15}$/;
//     if (!mobileRegex.test(mobile.replace(/\D/g, ""))) {
//       Alert.alert(
//         "Validation Error",
//         "Please enter a valid mobile number (10-15 digits)"
//       );
//       return;
//     }

//     onSubmit?.(
//       {
//         subject,
//         description: desc,
//         email,
//         mobile,
//         media: mediaUri,
//       },
//       {
//         onSuccess: () => {
//           resetForm();
//           onClose();
//         },
//       }
//     );
//   };

//   // Reset form
//   const resetForm = () => {
//     setSubject("");
//     setDesc("");
//     setEmail("");
//     setMobile("");
//     setMediaUri(null);
//     setSubjectOpen(false);
//   };

//   // Handle modal close
//   const handleClose = () => {
//     if (isLoading) return; // Prevent closing while submitting
//     resetForm();
//     onClose?.();
//   };

//   return (
//     <Modal
//       visible={visible}
//       transparent={true}
//       animationType="fade"
//       onRequestClose={handleClose}
//     >
//       <View style={styles.overlay}>
//         <View style={[styles.sheet, isLoading && { opacity: 0.9 }]}>
//           <View style={styles.header}>
//             <Text style={styles.headerTitle}>Raise New Ticket</Text>
//             {isLoading && (
//               <ActivityIndicator size="small" color={colors.tertiary} />
//             )}
//           </View>

//           <ScrollView
//             contentContainerStyle={styles.content}
//             showsVerticalScrollIndicator={false}
//             scrollEnabled={!isLoading}
//           >
//             {/* Subject Field */}
//             <Text style={styles.label}>
//               Subject <Text style={styles.required}>*</Text>
//             </Text>
//             <View style={styles.dropdownWrap}>
//               <Pressable
//                 style={[styles.inputRow, styles.inputBorder]}
//                 onPress={() => !isLoading && setSubjectOpen((p) => !p)}
//                 disabled={isLoading}
//               >
//                 <Text
//                   style={[
//                     styles.placeholder,
//                     subject && { color: colors.textdark },
//                   ]}
//                 >
//                   {subject || "Select Issue Type..."}
//                 </Text>
//                 <Text style={styles.dropdownIcon}>
//                   {subjectOpen ? "▲" : "▾"}
//                 </Text>
//               </Pressable>

//               {subjectOpen && !isLoading && (
//                 <View style={styles.dropdownPanel}>
//                   {SUBJECT_OPTIONS.map((opt, idx) => {
//                     const isSelected = subject === opt;
//                     return (
//                       <Pressable
//                         key={opt}
//                         style={[
//                           styles.dropdownItem,
//                           isSelected && styles.dropdownItemSelected,
//                           idx === SUBJECT_OPTIONS.length - 1 && {
//                             borderBottomWidth: 0,
//                           },
//                         ]}
//                         onPress={() => {
//                           setSubject(opt);
//                           setSubjectOpen(false);
//                         }}
//                       >
//                         <Text
//                           style={[
//                             styles.dropdownItemText,
//                             isSelected && styles.dropdownItemTextSelected,
//                           ]}
//                         >
//                           {opt}
//                         </Text>
//                       </Pressable>
//                     );
//                   })}
//                 </View>
//               )}
//             </View>

//             {/* Description Field */}
//             <Text style={styles.label}>
//               Description <Text style={styles.required}>*</Text>
//             </Text>
//             <TextInput
//               style={[styles.inputBox, styles.inputBorder, { height: 88 }]}
//               placeholder="Describe your issue in detail..."
//               placeholderTextColor="#9AC7B8"
//               multiline
//               editable={!isLoading}
//               value={desc}
//               onChangeText={setDesc}
//             />

//             {/* Email Field */}
//             <Text style={styles.label}>
//               Email ID <Text style={styles.required}>*</Text>
//             </Text>
//             <TextInput
//               style={[
//                 styles.inputBox,
//                 styles.inputBorder,
//                 prefilledEmail && styles.inputDisabled,
//               ]}
//               placeholder="Enter Email ID..."
//               placeholderTextColor="#9AC7B8"
//               keyboardType="email-address"
//               editable={!isLoading && !prefilledEmail}
//               value={email}
//               onChangeText={setEmail}
//             />

//             {/* Mobile Field */}
//             <Text style={styles.label}>
//               Mobile Number <Text style={styles.required}>*</Text>
//             </Text>
//             <TextInput
//               style={[
//                 styles.inputBox,
//                 styles.inputBorder,
//                 prefilledMobile && styles.inputDisabled,
//               ]}
//               placeholder="Enter Mobile Number..."
//               placeholderTextColor="#9AC7B8"
//               keyboardType="phone-pad"
//               editable={!isLoading && !prefilledMobile}
//               value={mobile}
//               onChangeText={setMobile}
//               maxLength={15}
//             />

//             {/* Media Upload Section */}
//             <Text style={styles.label}>Media Attachment (Optional)</Text>

//             {mediaUri ? (
//               <View style={styles.mediaPreviewContainer}>
//                 <Image source={{ uri: mediaUri }} style={styles.mediaPreview} />
//                 <Pressable
//                   style={styles.removeMediaBtn}
//                   onPress={removeMedia}
//                   disabled={isLoading}
//                 >
//                   <Text style={styles.removeMediaBtnText}>✕</Text>
//                 </Pressable>
//                 <Text style={styles.mediaFileName}>File selected</Text>
//               </View>
//             ) : (
//               <View style={styles.uploadButtonsContainer}>
//                 <Pressable
//                   style={[
//                     styles.uploadButton,
//                     styles.galleryButton,
//                     isLoading && { opacity: 0.5 },
//                   ]}
//                   onPress={pickImage}
//                   disabled={isLoading}
//                 >
//                   <MaterialCommunityIcons
//                     name="image-multiple"
//                     size={28}
//                     color={colors.tertiary}
//                     style={styles.uploadButtonIconStyle}
//                   />
//                   <Text style={styles.uploadButtonText}>Gallery</Text>
//                 </Pressable>

//                 <Pressable
//                   style={[
//                     styles.uploadButton,
//                     styles.cameraButton,
//                     isLoading && { opacity: 0.5 },
//                   ]}
//                   onPress={openCamera}
//                   disabled={isLoading}
//                 >
//                   <MaterialCommunityIcons
//                     name="camera"
//                     size={28}
//                     color={colors.tertiary}
//                     style={styles.uploadButtonIconStyle}
//                   />
//                   <Text style={styles.uploadButtonText}>Camera</Text>
//                 </Pressable>
//               </View>
//             )}

//             {/* Submit Button */}
//             <Pressable
//               disabled={!isFormValid || isLoading}
//               style={[
//                 styles.submitBtn,
//                 (!isFormValid || isLoading) && { opacity: 0.6 },
//               ]}
//               onPress={handleSubmit}
//             >
//               {isLoading ? (
//                 <ActivityIndicator size="small" color={colors.text} />
//               ) : (
//                 <Text style={styles.submitText}>Submit Ticket</Text>
//               )}
//             </Pressable>

//             {/* Cancel Button */}
//             <Pressable
//               disabled={isLoading}
//               style={[styles.cancelBtn, isLoading && { opacity: 0.6 }]}
//               onPress={handleClose}
//             >
//               <Text style={styles.cancelText}>Cancel</Text>
//             </Pressable>
//           </ScrollView>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: 10,
//   },
//   sheet: {
//     width: "100%",
//     maxHeight: "70%",
//     borderRadius: 16,
//     backgroundColor: colors.text,
//     overflow: "visible",
//     borderColor: "#E0E0E0",
//     borderWidth: 1,
//     elevation: 10,
//     shadowColor: "#000",
//   },
//   header: {
//     backgroundColor: colors.bbg6,
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     flexDirection: "row",
//     borderRadius: 16,
//   },
//   headerTitle: {
//     fontFamily: fonts.semiBold,
//     fontSize: fontSizes.lg,
//     color: colors.tertiary,
//     flex: 1,
//   },
//   content: {
//     padding: 16,
//     paddingBottom: 20,
//   },
//   label: {
//     fontFamily: fonts.semiBold,
//     color: colors.textdark,
//     marginBottom: 8,
//     fontSize: fontSizes.sm,
//     includeFontPadding: false,
//   },
//   required: {
//     color: colors.bbg4,
//     fontFamily: fonts.bold,
//   },
//   inputRow: {
//     minHeight: 44,
//     paddingVertical: 10,
//     borderRadius: 10,
//     backgroundColor: colors.text,
//     paddingHorizontal: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//   },
//   inputBox: {
//     minHeight: 44,
//     paddingVertical: 10,
//     paddingHorizontal: 14,
//     borderRadius: 10,
//     backgroundColor: colors.text,
//     color: colors.textdark,
//     fontFamily: fonts.regular,
//     fontSize: fontSizes.sm,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//   },
//   inputBorder: {
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//   },
//   inputDisabled: {
//     backgroundColor: "#F5F5F5",
//     color: colors.text1,
//   },
//   textInput: {
//     color: colors.textdark,
//     fontFamily: fonts.regular,
//   },
//   placeholder: {
//     color: colors.text1,
//     fontFamily: fonts.regular,
//     fontSize: fontSizes.sm,
//   },
//   dropdownIcon: {
//     color: colors.buttonbg1,
//     fontSize: 16,
//     marginLeft: 8,
//   },
//   dropdownWrap: {
//     position: "relative",
//     zIndex: 1000,
//     marginBottom: 12,
//   },
//   dropdownPanel: {
//     position: "absolute",
//     left: 0,
//     right: 0,
//     top: 50,
//     backgroundColor: colors.text,
//     borderRadius: 12,
//     paddingVertical: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 20,
//     zIndex: 2000,
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//     maxHeight: 380,
//   },
//   dropdownItem: {
//     backgroundColor: "transparent",
//     paddingVertical: 4,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#F0F0F0",
//   },
//   dropdownItemSelected: {
//     backgroundColor: colors.bbg6,
//   },
//   dropdownItemText: {
//     color: colors.textdark,
//     fontFamily: fonts.regular,
//     fontSize: fontSizes.sm,
//   },
//   dropdownItemTextSelected: {
//     color: colors.tertiary,
//     fontFamily: fonts.semiBold,
//   },

//   // Media Upload Styles
//   uploadButtonsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 12,
//     gap: 12,
//   },
//   uploadButton: {
//     flex: 1,
//     borderWidth: 1.5,
//     borderStyle: "dashed",
//     borderRadius: 10,
//     paddingVertical: 16,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   galleryButton: {
//     borderColor: colors.tertiary,
//     backgroundColor: colors.bbg6,
//   },
//   cameraButton: {
//     borderColor: colors.tertiary,
//     backgroundColor: colors.bbg6,
//   },
//   uploadButtonIcon: {
//     fontSize: 24,
//     marginBottom: 4,
//   },
//   uploadButtonIconStyle: {
//     marginBottom: 4,
//   },
//   uploadButtonText: {
//     color: colors.tertiary,
//     fontFamily: fonts.semiBold,
//     fontSize: fontSizes.sm,
//   },
//   mediaPreviewContainer: {
//     position: "relative",
//     marginBottom: 12,
//     alignItems: "center",
//   },
//   mediaPreview: {
//     width: "100%",
//     height: 150,
//     borderRadius: 10,
//     backgroundColor: colors.bbg6,
//   },
//   removeMediaBtn: {
//     position: "absolute",
//     top: 8,
//     right: 8,
//     backgroundColor: colors.bbg4,
//     borderRadius: 16,
//     width: 32,
//     height: 32,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   removeMediaBtnText: {
//     color: colors.text,
//     fontFamily: fonts.bold,
//     fontSize: 18,
//   },
//   mediaFileName: {
//     marginTop: 8,
//     color: colors.tertiary,
//     fontFamily: fonts.semiBold,
//     fontSize: fontSizes.sm,
//   },

//   // Button Styles
//   submitBtn: {
//     alignSelf: "center",
//     width: "100%",
//     backgroundColor: colors.tertiary,
//     borderRadius: 10,
//     minHeight: 44,
//     paddingVertical: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 8,
//   },
//   submitText: {
//     color: colors.text,
//     fontFamily: fonts.semiBold,
//     fontSize: fontSizes.md,
//   },
//   cancelBtn: {
//     alignSelf: "center",
//     width: "100%",
//     backgroundColor: colors.buttonbg2,
//     borderRadius: 10,
//     minHeight: 44,
//     paddingVertical: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   cancelText: {
//     color: colors.textdark,
//     fontFamily: fonts.semiBold,
//     fontSize: fontSizes.md,
//   },
// });
