/**
 * Authentication Form Validation Utilities
 * Provides validation functions for all auth-related screens
 */

/**
 * Validate mobile number (must be exactly 10 digits)
 */
export const validateMobile = (mobile) => {
  if (!mobile) return { isValid: false, error: "Mobile number is required" };

  const mobileStr = mobile.toString().trim();
  const mobileRegex = /^[0-9]{10}$/;

  if (!mobileRegex.test(mobileStr)) {
    return {
      isValid: false,
      error: "Mobile number must be exactly 10 digits",
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  if (!email) return { isValid: false, error: "Email is required" };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email.trim())) {
    return {
      isValid: false,
      error: "Please enter a valid email address",
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validate password (minimum 6 characters)
 */
export const validatePassword = (password) => {
  if (!password) return { isValid: false, error: "Password is required" };

  if (password.length < 6) {
    return {
      isValid: false,
      error: "Password must be at least 6 characters",
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validate password confirmation matches
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, error: "Please confirm your password" };
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: "Passwords do not match",
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validate name (minimum 2 characters, only letters and spaces)
 */
export const validateName = (name, fieldName = "Name") => {
  if (!name) return { isValid: false, error: `${fieldName} is required` };

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return {
      isValid: false,
      error: `${fieldName} must be at least 2 characters`,
    };
  }

  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!nameRegex.test(trimmedName)) {
    return {
      isValid: false,
      error: `${fieldName} should only contain letters`,
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validate OTP (must be 4 digits)
 */
export const validateOTP = (otp) => {
  if (!otp) return { isValid: false, error: "OTP is required" };

  const otpStr = otp.toString().trim();
  const otpRegex = /^[0-9]{4}$/;

  if (!otpRegex.test(otpStr)) {
    return {
      isValid: false,
      error: "OTP must be exactly 4 digits",
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validate terms acceptance
 */
export const validateTermsAccepted = (isAccepted) => {
  if (!isAccepted) {
    return {
      isValid: false,
      error: "Please accept the Terms & Conditions",
    };
  }

  return { isValid: true, error: null };
};

/**
 * Login Form Validation
 */
export const validateLoginForm = (mobile, password) => {
  const errors = {};
  let isValid = true;

  if (!mobile) {
    errors.mobile = "Mobile number or Email is required";
    isValid = false;
  } else {
    const mobileStr = mobile.toString().trim();
    const isMobile =
      /^[0-9]{10}$/.test(mobileStr) || /^[0-9]{9}$/.test(mobileStr);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mobileStr);

    if (!isMobile && !isEmail) {
      errors.mobile = "Please enter a valid mobile number or email address";
      isValid = false;
    }
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
    isValid = false;
  }

  return { isValid, errors };
};

/**
 * Registration Form Validation
 */
export const validateRegistrationForm = ({
  firstName,
  lastName,
  email,
  mobile,
  password,
  confirmPassword,
  isTermsAccepted,
  businessName = null, // optional
}) => {
  const errors = {};
  let isValid = true;

  // Business name is optional, but if provided should be valid
  if (businessName && businessName.trim().length > 0) {
    if (businessName.trim().length < 2) {
      errors.businessName = "Business name must be at least 2 characters";
      isValid = false;
    }
  }

  const firstNameValidation = validateName(firstName, "First name");
  if (!firstNameValidation.isValid) {
    errors.firstName = firstNameValidation.error;
    isValid = false;
  }

  const lastNameValidation = validateName(lastName, "Last name");
  if (!lastNameValidation.isValid) {
    errors.lastName = lastNameValidation.error;
    isValid = false;
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
    isValid = false;
  }

  const mobileValidation = validateMobile(mobile);
  if (!mobileValidation.isValid) {
    errors.mobile = mobileValidation.error;
    isValid = false;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
    isValid = false;
  }

  const confirmPasswordValidation = validatePasswordMatch(
    password,
    confirmPassword,
  );
  if (!confirmPasswordValidation.isValid) {
    errors.confirmPassword = confirmPasswordValidation.error;
    isValid = false;
  }

  const termsValidation = validateTermsAccepted(isTermsAccepted);
  if (!termsValidation.isValid) {
    errors.terms = termsValidation.error;
    isValid = false;
  }

  return { isValid, errors };
};

/**
 * Forgot Password Form Validation
 */
export const validateForgotPasswordForm = (mobileOrEmail) => {
  const errors = {};

  if (!mobileOrEmail) {
    errors.mobileOrEmail = "Mobile number or Email is required";
    return { isValid: false, errors };
  }

  const trimmed = mobileOrEmail.toString().trim();
  const isMobile = /^[0-9]{10}$/.test(trimmed);
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

  if (!isMobile && !isEmail) {
    errors.mobileOrEmail =
      "Please enter a valid mobile number or email address";
    return { isValid: false, errors };
  }

  return { isValid: true, errors };
};

/**
 * OTP Verification Form Validation
 */
export const validateOTPForm = (otp) => {
  const errors = {};

  const otpValidation = validateOTP(otp);
  if (!otpValidation.isValid) {
    errors.otp = otpValidation.error;
    return { isValid: false, errors };
  }

  return { isValid: true, errors };
};

/**
 * Change Password Form Validation
 */
export const validateChangePasswordForm = (password, confirmPassword) => {
  const errors = {};
  let isValid = true;

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
    isValid = false;
  }

  const confirmPasswordValidation = validatePasswordMatch(
    password,
    confirmPassword,
  );
  if (!confirmPasswordValidation.isValid) {
    errors.confirmPassword = confirmPasswordValidation.error;
    isValid = false;
  }

  return { isValid, errors };
};
