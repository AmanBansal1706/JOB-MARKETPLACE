import { Alert } from "react-native";

export const validateProfileForm = (formData, uploads, isEditMode) => {
  // Validate first name
  if (!formData.firstName?.trim()) {
    Alert.alert("Validation Error", "First name is required");
    return false;
  }

  // Validate last name
  if (!formData.lastName?.trim()) {
    Alert.alert("Validation Error", "Last name is required");
    return false;
  }

  // Validate email
  if (!formData.email?.trim()) {
    Alert.alert("Validation Error", "Email is required");
    return false;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    Alert.alert("Validation Error", "Please enter a valid email address");
    return false;
  }

  // Validate mobile (optional for edit mode if not in API)
  if (!isEditMode && !formData.mobile?.trim()) {
    Alert.alert("Validation Error", "Mobile is required");
    return false;
  }

  // Validate business name
  if (!formData.businessName?.trim()) {
    Alert.alert("Validation Error", "Business name is required");
    return false;
  }

  // Validate business description
  if (!formData.businessDescription?.trim()) {
    Alert.alert("Validation Error", "Business description is required");
    return false;
  }

  // Validate business description length
  if (formData.businessDescription.trim().length < 10) {
    Alert.alert(
      "Validation Error",
      "Business description must be at least 10 characters",
    );
    return false;
  }

  // Validate business category
  if (!formData.businessCategory) {
    Alert.alert("Validation Error", "Business category is required");
    return false;
  }

  // Validate work location
  if (!formData.workLocation?.trim()) {
    Alert.alert("Validation Error", "Work location is required");
    return false;
  }

  // Validate CURP
  if (!formData.curp?.trim()) {
    Alert.alert("Validation Error", "CURP is required");
    return false;
  }

  if (formData.curp.length !== 18) {
    Alert.alert("Validation Error", "CURP must be exactly 18 characters");
    return false;
  }

  // Validate Business RFC
  if (!formData.businessRFC?.trim()) {
    Alert.alert("Validation Error", "Business RFC is required");
    return false;
  }

  if (
    formData.businessRFC.length !== 12 &&
    formData.businessRFC.length !== 13
  ) {
    Alert.alert("Validation Error", "Business RFC must be 12 or 13 characters");
    return false;
  }

  // Validate uploads (only in create mode)
  if (!isEditMode) {
    if (!uploads.idFront) {
      Alert.alert("Validation Error", "Government ID front photo is required");
      return false;
    }
    if (!uploads.idBack) {
      Alert.alert("Validation Error", "Government ID back photo is required");
      return false;
    }
    if (!uploads.selfie) {
      Alert.alert("Validation Error", "Selfie is required");
      return false;
    }
  }

  return true;
};

export const getVerificationStatusInfo = (status, translate) => {
  // Normalize status to lowercase for comparison
  const normalizedStatus = status?.toLowerCase() || "unknown";
  const translateValue = (key, fallback) =>
    typeof translate === "function" ? translate(key) : fallback;

  const statusMap = {
    incomplete: {
      label: translateValue("profile.incompleteProfile", "Profile Incomplete"),
      color: "#FF9500",
      icon: "file-upload",
      description: translateValue(
        "profile.incompleteProfileMessage",
        "Please complete your profile by uploading required documents",
      ),
    },
    under_review: {
      label: translateValue("profile.verificationInProgress", "Under Review"),
      color: "#18A974",
      icon: "hourglass-half",
      description: translateValue(
        "profile.verificationInProgressMessage",
        "Your documents are being reviewed.",
      ),
    },
    approved: {
      label: translateValue("profile.verified", "Approved"),
      color: "#4CAF50",
      icon: "check-circle",
      description: translateValue(
        "profile.verifiedMessage",
        "Your profile has been verified and approved",
      ),
    },
    verified: {
      label: translateValue("profile.verified", "Verified"),
      color: "#4CAF50",
      icon: "check-circle",
      description: translateValue(
        "profile.verifiedMessage",
        "Your profile has been verified",
      ),
    },
    rejected: {
      label: translateValue("profile.documentsRejected", "Documents Rejected"),
      color: "#E74C3C",
      icon: "times-circle",
      description: translateValue(
        "profile.documentsRejectedMessage",
        "Your documents were rejected. Please re-upload",
      ),
    },
    permanent_rejected: {
      label: translateValue("profile.accountRejected", "Account Rejected"),
      color: "#8B0000",
      icon: "ban",
      description: translateValue(
        "profile.accountRejectedMessage",
        "Your account has been permanently rejected due to policy violations",
      ),
    },
  };

  return (
    statusMap[normalizedStatus] || {
      label: translateValue("profile.statusUnavailable", "Unknown Status"),
      color: "#999",
      icon: "question-circle",
      description: translateValue(
        "profile.unableToDetermineStatus",
        "Status unknown",
      ),
    }
  );
};

export const getDocumentStatusInfo = (status) => {
  const statusMap = {
    pending: {
      label: "Pending",
      color: "#FFA500",
      icon: "clock",
    },
    under_review: {
      label: "Under Review",
      color: "#2196F3",
      icon: "hourglass-half",
    },
    approved: {
      label: "Approved",
      color: "#4CAF50",
      icon: "check-circle",
    },
    rejected: {
      label: "Rejected",
      color: "#F44336",
      icon: "times-circle",
    },
  };

  return (
    statusMap[status] || {
      label: "Unknown",
      color: "#999",
      icon: "question-circle",
    }
  );
};
