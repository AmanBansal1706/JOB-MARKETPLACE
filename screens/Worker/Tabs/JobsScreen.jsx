// import { Feather, FontAwesome5 } from "@expo/vector-icons";
// import { useNavigation } from "@react-navigation/native";
// import { StatusBar } from "expo-status-bar";
// import { useState } from "react";
// import {
//   Image,
//   Modal,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import alarmIcon from "../../../assets/worker-images/3d-alarm.png";
// import calendarIcon from "../../../assets/worker-images/calendar1.png";
// import scoreIcon from "../../../assets/worker-images/score.png";
// import searchIcon from "../../../assets/worker-images/search.png";
// import colors from "../../../theme/worker/colors";
// import { availableJobs } from "../../../utils/worker/mockData";

// export default function JobsScreen() {
//   const navigation = useNavigation();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filterVisible, setFilterVisible] = useState(false);
//   const [selectedFilter, setSelectedFilter] = useState("Distance");

//   const filterOptions = [
//     "Business Rating",
//     "Distance",
//     "Date",
//     "Time",
//     "Position",
//     "Experience Level",
//   ];

//   const renderJobCard = (job) => {
//     return (
//       <View key={job.id} style={styles.jobCard}>
//         <View style={styles.leftBorder} />
//         <View style={styles.cardContent}>
//           {/* Header */}
//           <View style={styles.cardHeader}>
//             <View>
//               <Text style={styles.jobTitle}>{job.title}</Text>
//               <Text style={styles.companyName}>{job.company}</Text>
//             </View>
//             <View style={styles.badgeContainer}>
//               <Image
//                 source={scoreIcon}
//                 style={styles.badgeIcon}
//                 resizeMode="contain"
//               />
//               <Text style={styles.badgeText}>{job.level}</Text>
//             </View>
//           </View>

//           {/* Description & Details */}
//           <Text style={styles.description}>{job.description}</Text>

//           <View style={styles.detailRow}>
//             <Text style={styles.detailLabel}>Location: </Text>
//             <Text style={styles.detailValue}>{job.location}</Text>
//           </View>

//           <View style={styles.detailRow}>
//             <Text style={styles.detailLabel}>Pay Rate: </Text>
//             <Text style={styles.detailValue}>{job.payRate}</Text>
//           </View>

//           {/* Workers or Date Range */}
//           {job.type === "dateRange" ? (
//             <View style={styles.dateRangeContainer}>
//               <View style={styles.dateBox}>
//                 <Text style={styles.dateBoxLabel}>Start Date:</Text>
//                 <Text style={styles.dateBoxValue}>{job.startDate}</Text>
//               </View>
//               <View style={{ width: 15 }} />
//               <View style={styles.dateBox}>
//                 <Text style={styles.dateBoxLabel}>End Date:</Text>
//                 <Text style={styles.dateBoxValue}>{job.endDate}</Text>
//               </View>
//             </View>
//           ) : (
//             <View style={styles.workersContainer}>
//               <Text style={styles.workersTitle}>Workers:</Text>
//               <View style={styles.workersGrid}>
//                 {job.workers &&
//                   job.workers.map((worker, index) => (
//                     <View key={index} style={styles.workerItem}>
//                       <View style={styles.workerRow}>
//                         <FontAwesome5
//                           name="user-alt"
//                           size={12}
//                           color="#555"
//                           style={{ width: 16 }}
//                         />
//                         <Text style={styles.workerText}>{worker.name}</Text>
//                       </View>
//                       <View style={styles.workerRow}>
//                         <Image
//                           source={calendarIcon}
//                           style={styles.workerIcon}
//                           resizeMode="contain"
//                         />
//                         <Text style={styles.workerSubText}>{worker.date}</Text>
//                       </View>
//                       <View style={styles.workerRow}>
//                         <Image
//                           source={alarmIcon}
//                           style={styles.workerIcon}
//                           resizeMode="contain"
//                         />
//                         <Text style={styles.workerSubText}>{worker.time}</Text>
//                       </View>
//                     </View>
//                   ))}
//               </View>
//             </View>
//           )}

//           {/* Actions */}
//           <View style={styles.actionsContainer}>
//             <TouchableOpacity
//               style={styles.viewMoreButton}
//               onPress={() =>
//                 navigation.navigate("WorkerJobDetails", { title: job.title })
//               }
//             >
//               <Text style={styles.viewMoreText}>View More</Text>
//             </TouchableOpacity>
//             <View style={{ width: 15 }} />
//             <TouchableOpacity
//               style={styles.applyButton}
//               onPress={() =>
//                 navigation.navigate("WorkerApplyJob", { title: job.title })
//               }
//             >
//               <Text style={styles.applyText}>Apply</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.mainContainer}>
//       <StatusBar style="light" backgroundColor={colors.primary.pink} />

//       {/* Header */}
//       <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
//         <View style={styles.header}>
//           <TouchableOpacity
//             onPress={() => navigation.goBack()}
//             style={styles.backButtonContainer}
//           >
//             <Feather name="arrow-left" size={24} color={colors.white} />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Jobs</Text>
//         </View>
//       </SafeAreaView>

//       <ScrollView
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//         bounces={false}
//       >
//         {/* Search Bar */}
//         <View style={styles.searchContainer}>
//           <Image
//             source={searchIcon}
//             style={styles.searchIcon}
//             resizeMode="contain"
//           />
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Search applicants..."
//             placeholderTextColor={colors.text.secondary}
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//           />
//           <TouchableOpacity onPress={() => setFilterVisible(true)}>
//             <Feather name="sliders" size={20} color="#7D7D7D" />
//           </TouchableOpacity>
//         </View>

//         <Text style={styles.listTitle}>
//           Showing all positions that are currently active
//         </Text>

//         <View style={styles.listContainer}>
//           {availableJobs.map((job) => renderJobCard(job))}
//         </View>

//         <TouchableOpacity
//           style={styles.footerButton}
//           onPress={() => navigation.navigate("WorkerAssignedJobs")}
//         >
//           <Text style={styles.footerButtonText}>VIEW ASSIGNED JOBS</Text>
//         </TouchableOpacity>
//       </ScrollView>

//       {/* Filter Modal */}
//       <Modal
//         visible={filterVisible}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setFilterVisible(false)}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             {/* Modal Header */}
//             <View style={styles.modalHeader}>
//               <TouchableOpacity
//                 onPress={() => setFilterVisible(false)}
//                 style={styles.modalBackButton}
//               >
//                 <Feather name="arrow-left" size={24} color="#333" />
//               </TouchableOpacity>
//               <Text style={styles.modalTitle}>Filter Job</Text>
//               <View style={{ width: 40 }} />
//             </View>

//             <Text style={styles.sortByText}>Sort by</Text>
//             <View style={styles.divider} />

//             {/* Filter Options */}
//             <View style={styles.filterOptionsContainer}>
//               {filterOptions.map((option) => (
//                 <TouchableOpacity
//                   key={option}
//                   style={styles.filterOption}
//                   onPress={() => setSelectedFilter(option)}
//                 >
//                   <Text style={styles.filterOptionText}>{option}</Text>
//                   <View
//                     style={[
//                       styles.radioCircle,
//                       selectedFilter === option && styles.radioCircleSelected,
//                     ]}
//                   >
//                     {selectedFilter === option && (
//                       <View style={styles.radioDot} />
//                     )}
//                   </View>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   mainContainer: {
//     flex: 1,
//     backgroundColor: colors.ui.screenBackground,
//   },
//   headerSafeArea: {
//     backgroundColor: colors.primary.pink,
//     zIndex: 10,
//   },
//   header: {
//     height: 60,
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     backgroundColor: colors.primary.pink,
//   },
//   backButtonContainer: {
//     padding: 3,
//     borderRadius: 20,
//     borderWidth: 1.5,
//     borderColor: colors.white,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   headerTitle: {
//     color: colors.white,
//     fontSize: 20,
//     fontFamily: "Poppins_600SemiBold",
//     marginLeft: 15,
//   },
//   scrollContent: {
//     paddingHorizontal: 20,
//     paddingTop: 20,
//     paddingBottom: 40,
//   },
//   searchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: colors.ui.searchBarBackground,
//     borderRadius: 30,
//     paddingHorizontal: 20,
//     height: 50,
//     marginBottom: 20,
//   },
//   searchIcon: {
//     width: 18,
//     height: 18,
//     marginRight: 10,
//     tintColor: colors.text.icon,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 14,
//     fontFamily: "Poppins_400Regular",
//     color: colors.text.primary,
//   },
//   listTitle: {
//     fontSize: 14,
//     fontFamily: "Poppins_400Regular",
//     color: colors.text.secondary,
//     marginBottom: 15,
//   },
//   listContainer: {
//     gap: 20,
//     marginBottom: 30,
//   },
//   jobCard: {
//     backgroundColor: colors.white,
//     borderRadius: 15,
//     overflow: "hidden",
//     flexDirection: "row",
//     shadowColor: colors.ui.shadow,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 5,
//     elevation: 3,
//   },
//   leftBorder: {
//     width: 6,
//     backgroundColor: colors.primary.pink,
//     height: "100%",
//   },
//   cardContent: {
//     flex: 1,
//     padding: 15,
//   },
//   cardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: 5,
//   },
//   jobTitle: {
//     fontSize: 16,
//     fontFamily: "Poppins_700Bold",
//     color: colors.text.darkRed,
//   },
//   companyName: {
//     fontSize: 14,
//     fontFamily: "Poppins_700Bold",
//     color: colors.black,
//   },
//   badgeContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: colors.ui.chipBackground,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   badgeIcon: {
//     width: 12,
//     height: 12,
//     marginRight: 4,
//     tintColor: colors.primary.pink,
//   },
//   badgeText: {
//     fontSize: 10,
//     fontFamily: "Poppins_500Medium",
//     color: colors.primary.pink,
//   },
//   description: {
//     fontSize: 12,
//     fontFamily: "Poppins_400Regular",
//     color: colors.text.secondary,
//     marginBottom: 10,
//     lineHeight: 18,
//   },
//   detailRow: {
//     flexDirection: "row",
//     marginBottom: 4,
//     flexWrap: "wrap",
//   },
//   detailLabel: {
//     fontSize: 13,
//     fontFamily: "Poppins_600SemiBold",
//     color: colors.text.primary,
//   },
//   detailValue: {
//     fontSize: 13,
//     fontFamily: "Poppins_400Regular",
//     color: colors.text.secondary,
//     flex: 1,
//   },
//   workersContainer: {
//     marginTop: 10,
//   },
//   workersTitle: {
//     fontSize: 13,
//     fontFamily: "Poppins_600SemiBold",
//     color: colors.text.primary,
//     marginBottom: 5,
//   },
//   workersGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//   },
//   workerItem: {
//     width: "48%",
//     marginBottom: 10,
//   },
//   workerRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 2,
//   },
//   workerText: {
//     fontSize: 12,
//     fontFamily: "Poppins_600SemiBold",
//     color: colors.text.primary,
//   },
//   workerIcon: {
//     width: 14,
//     height: 14,
//     marginRight: 4,
//   },
//   workerSubText: {
//     fontSize: 10,
//     fontFamily: "Poppins_400Regular",
//     color: colors.text.secondary,
//   },
//   dateRangeContainer: {
//     flexDirection: "row",
//     marginTop: 15,
//   },
//   dateBox: {
//     flex: 1,
//     backgroundColor: colors.auth.background,
//     borderRadius: 8,
//     padding: 10,
//     borderWidth: 1,
//     borderColor: colors.ui.dateBoxBorder,
//   },
//   dateBoxLabel: {
//     fontSize: 12,
//     fontFamily: "Poppins_600SemiBold",
//     color: colors.primary.pink,
//     marginBottom: 2,
//   },
//   dateBoxValue: {
//     fontSize: 11,
//     fontFamily: "Poppins_500Medium",
//     color: colors.text.secondary,
//   },
//   actionsContainer: {
//     flexDirection: "row",
//     marginTop: 15,
//   },
//   viewMoreButton: {
//     flex: 1,
//     backgroundColor: colors.ui.viewMoreLightBackground,
//     borderRadius: 8,
//     paddingVertical: 10,
//     alignItems: "center",
//   },
//   viewMoreText: {
//     color: colors.black,
//     fontSize: 13,
//     fontFamily: "Poppins_600SemiBold",
//   },
//   applyButton: {
//     flex: 1,
//     backgroundColor: colors.primary.pink,
//     borderRadius: 8,
//     paddingVertical: 10,
//     alignItems: "center",
//   },
//   applyText: {
//     color: colors.white,
//     fontSize: 13,
//     fontFamily: "Poppins_600SemiBold",
//   },
//   footerButton: {
//     backgroundColor: colors.primary.pink,
//     borderRadius: 30,
//     paddingVertical: 16,
//     alignItems: "center",
//     marginBottom: 20,
//     shadowColor: colors.primary.pink,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   footerButtonText: {
//     color: colors.white,
//     fontSize: 16,
//     fontFamily: "Poppins_700Bold",
//     letterSpacing: 1,
//   },
//   // Modal Styles
//   modalContainer: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.4)", // Semi-transparent overlay
//     justifyContent: "flex-start",
//   },
//   modalContent: {
//     width: "100%",
//     backgroundColor: "#FFC3C2",
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     padding: 25,
//     paddingTop: 20, // Space for status bar area
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     elevation: 10,
//   },
//   modalHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 30,
//   },
//   modalBackButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     borderWidth: 1.5,
//     borderColor: colors.text.primary,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   modalTitle: {
//     fontSize: 24,
//     fontFamily: "Poppins_600SemiBold",
//     color: colors.black,
//   },
//   sortByText: {
//     fontSize: 18,
//     fontFamily: "Poppins_600SemiBold",
//     color: colors.black,
//     marginBottom: 15,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: "#000",
//     opacity: 0.1,
//     marginBottom: 20,
//   },
//   filterOptionsContainer: {
//     paddingBottom: 20,
//   },
//   filterOption: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: 12,
//   },
//   filterOptionText: {
//     fontSize: 16,
//     fontFamily: "Poppins_400Regular",
//     color: colors.black,
//   },
//   radioCircle: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     borderWidth: 2,
//     borderColor: colors.black,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   radioCircleSelected: {
//     borderColor: colors.primary.pink,
//     backgroundColor: colors.primary.pink,
//   },
//   radioDot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: colors.white,
//   },
//   filterOptionText: {
//     fontSize: 16,
//     fontFamily: "Poppins_400Regular",
//     color: colors.black,
//   },
//   radioCircle: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     borderWidth: 2,
//     borderColor: colors.black,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   radioCircleSelected: {
//     borderColor: colors.primary.pink,
//     backgroundColor: colors.primary.pink,
//   },
//   radioDot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: colors.white,
//   },
// });

import { StyleSheet, Text, View } from "react-native";
import React from "react";

export default function JobsScreen() {
  return (
    <View>
      <Text>JobsScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({});
