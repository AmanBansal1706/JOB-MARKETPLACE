import { BACKEND_API_URL } from "@env";
import { useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";

// ============================================================================
// 1. LOGIN
// ============================================================================

async function login(data) {
  const output = await fetch(`${BACKEND_API_URL}/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const response = await output.json();

  console.log("Login Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Login failed");
  }

  return response;
}

export const useLogin = () => {
  const { isPending, error, mutate, reset, isError, isSuccess } = useMutation({
    mutationFn: (data) => login(data),
  });
  return { isPending, error, mutate, reset, isError, isSuccess };
};

// ============================================================================
// 2. REGISTER (Business & Worker)
// ============================================================================

async function register(data, role = "business") {
  const endpoint = role === "worker" ? "/v1/worker/register" : "/v1/business/register";
  const formData = new FormData();

  // Append all fields to FormData
  Object.keys(data).forEach((key) => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });

  const output = await fetch(`${BACKEND_API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    body: formData,
  });

  const response = await output.json();

  console.log("Register Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Registration failed");
  }

  return response;
}

export const useRegister = (role = "business") => {
  const { isPending, error, mutate, reset, isError, isSuccess } = useMutation({
    mutationFn: (data) => register(data, role),
  });
  return { isPending, error, mutate, reset, isError, isSuccess };
};

// ============================================================================
// 3. SEND OTP (for password reset)
// ============================================================================

async function sendOtp(data) {
  const output = await fetch(`${BACKEND_API_URL}/v1/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const response = await output.json();

  console.log("Send OTP Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to send OTP");
  }

  return response;
}

export const useSendOtp = () => {
  const { isPending, error, mutate, reset, isError, isSuccess, data } =
    useMutation({
      mutationFn: (data) => sendOtp(data),
    });
  return { isPending, error, mutate, reset, isError, isSuccess, data };
};

// ============================================================================
// 4. VERIFY OTP
// ============================================================================

async function verifyOtp(data) {
  const output = await fetch(`${BACKEND_API_URL}/v1/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const response = await output.json();

  console.log("Verify OTP Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "OTP verification failed");
  }

  return response;
}

export const useVerifyOtp = () => {
  const { isPending, error, mutate, reset, isError, isSuccess, data } =
    useMutation({
      mutationFn: (data) => verifyOtp(data),
    });
  return { isPending, error, mutate, reset, isError, isSuccess, data };
};

// ============================================================================
// 5. CHANGE PASSWORD
// ============================================================================

async function changePassword(data) {
  const output = await fetch(`${BACKEND_API_URL}/v1/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const response = await output.json();

  console.log("Change Password Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to change password");
  }

  return response;
}

export const useChangePassword = () => {
  const { isPending, error, mutate, reset, isError, isSuccess } = useMutation({
    mutationFn: (data) => changePassword(data),
  });
  return { isPending, error, mutate, reset, isError, isSuccess };
};
