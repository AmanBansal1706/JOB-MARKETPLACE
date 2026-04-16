import { BACKEND_API_URL } from "@env";
import { useMutation, useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import useTranslation from "../hooks/useTranslation";

// ============================================================================
// 1. FETCH USER PROFILE (ME)
// ============================================================================

async function fetchUserProfile(authToken) {
  const output = await fetch(`${BACKEND_API_URL}/v1/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  const response = await output.json();

  console.log("User Profile Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to fetch user profile");
  }

  return response.data;
}

export const useFetchUserProfile = () => {
  const authToken = useSelector((state) => state.Auth?.token);
  const { isPending, error, data, isError, isSuccess, refetch } = useQuery({
    queryKey: ["userProfile", authToken],
    queryFn: () => fetchUserProfile(authToken),
    enabled: !!authToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { isPending, error, data, isError, isSuccess, refetch };
};

// ============================================================================
// 2. FETCH BUSINESS CATEGORIES
// ============================================================================

async function fetchBusinessCategories(authToken) {
  const output = await fetch(`${BACKEND_API_URL}/v1/business/categories`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  const response = await output.json();

  console.log("Business Categories Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to fetch categories");
  }

  return response.data.categories;
}

export const useFetchBusinessCategories = () => {
  const authToken = useSelector((state) => state.Auth?.token);
  const { isPending, error, data, isError, isSuccess, refetch } = useQuery({
    queryKey: ["businessCategories"],
    queryFn: () => fetchBusinessCategories(authToken),
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  return { isPending, error, data, isError, isSuccess, refetch };
};

// ============================================================================
// 3. FETCH BUSINESS DASHBOARD
// ============================================================================

async function fetchBusinessDashboard(authToken, language) {
  const output = await fetch(
    `${BACKEND_API_URL}/v1/business/dashboard?language=${language}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    },
  );

  const response = await output.json();

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to fetch dashboard data");
  }

  return response;
}

export const useFetchBusinessDashboard = () => {
  const authToken = useSelector((state) => state.Auth?.token);
  const { language } = useTranslation();

  const { isPending, error, data, isError, isSuccess, refetch } = useQuery({
    queryKey: ["businessDashboard", authToken],
    queryFn: () => fetchBusinessDashboard(authToken, language),
    enabled: !!authToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { isPending, error, data, isError, isSuccess, refetch };
};

// ============================================================================
// 4. COMPLETE PROFILE
// ============================================================================

async function completeProfile(formData, authToken) {
  const output = await fetch(
    `${BACKEND_API_URL}/v1/business/complete_profile`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    },
  );

  const response = await output.json();

  console.log("Complete Profile Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to complete profile");
  }

  return response;
}

export const useCompleteProfile = () => {
  const authToken = useSelector((state) => state.Auth?.token);
  const userId = useSelector((state) => state.Auth?.user?.id);

  const { isPending, error, mutate, reset, isError, isSuccess, data } =
    useMutation({
      mutationFn: (profileData) => {
        const formData = new FormData();

        // Always append user_id
        formData.append("user_id", userId);

        // Only append fields that are present (i.e., changed fields)
        if (
          profileData.businessName !== undefined &&
          profileData.businessName !== null
        ) {
          formData.append("business_name", profileData.businessName);
        }

        if (
          profileData.businessDescription !== undefined &&
          profileData.businessDescription !== null
        ) {
          formData.append(
            "business_description",
            profileData.businessDescription,
          );
        }

        if (
          profileData.businessCategory !== undefined &&
          profileData.businessCategory !== null
        ) {
          formData.append("business_category_id", profileData.businessCategory);
        }

        if (profileData.email !== undefined && profileData.email !== null) {
          formData.append("email", profileData.email);
        }

        // Only append location fields when present and changed
        if (profileData.location) {
          if (profileData.location.lat) {
            formData.append("location[lat]", profileData.location.lat);
          }

          if (profileData.location.lng) {
            formData.append("location[lng]", profileData.location.lng);
          }

          if (profileData.location.address || profileData.workLocation) {
            formData.append(
              "location[address]",
              profileData.location.address || profileData.workLocation || "",
            );
          }
        }

        if (
          profileData.workLocation !== undefined &&
          profileData.workLocation !== null
        ) {
          formData.append("work_location", profileData.workLocation);
        }

        if (profileData.curp !== undefined && profileData.curp !== null) {
          formData.append("curp", profileData.curp);
        }

        if (
          profileData.businessRFC !== undefined &&
          profileData.businessRFC !== null
        ) {
          formData.append("rfc", profileData.businessRFC);
        }

        if (
          profileData.firstName !== undefined &&
          profileData.firstName !== null
        ) {
          formData.append("first_name", profileData.firstName);
        }

        if (
          profileData.lastName !== undefined &&
          profileData.lastName !== null
        ) {
          formData.append("last_name", profileData.lastName);
        }

        if (profileData.mobile !== undefined && profileData.mobile !== null) {
          formData.append("mobile", profileData.mobile);
        }

        // Only append profile picture if it exists (changed)
        if (profileData.profilePicture) {
          const profilePictureFileName = `profile_picture_${Date.now()}.jpg`;
          formData.append("profile_picture", {
            uri: profileData.profilePicture,
            type: "image/jpeg",
            name: profilePictureFileName,
          });
        }

        // Append government ID files only if present
        if (profileData.idFront) {
          const frontFileName = `gov_id_front_${Date.now()}.jpg`;
          formData.append("gov_id[]", {
            uri: profileData.idFront,
            type: "image/jpeg",
            name: frontFileName,
          });
        }

        if (profileData.idBack) {
          const backFileName = `gov_id_back_${Date.now()}.jpg`;
          formData.append("gov_id[]", {
            uri: profileData.idBack,
            type: "image/jpeg",
            name: backFileName,
          });
        }

        // Append selfie only if present
        if (profileData.selfie) {
          const selfieFileName = `selfie_${Date.now()}.jpg`;
          formData.append("selfie", {
            uri: profileData.selfie,
            type: "image/jpeg",
            name: selfieFileName,
          });
        }

        return completeProfile(formData, authToken);
      },
    });

  return { isPending, error, mutate, reset, isError, isSuccess, data };
};

// ============================================================================
// 5. FETCH WORKER PROFILE
// ============================================================================

async function fetchWorkerProfile(workerId, authToken) {
  const output = await fetch(
    `${BACKEND_API_URL}/v1/worker/profile?worker_id=${workerId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    },
  );

  const response = await output.json();

  console.log("Worker Profile Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to fetch worker profile");
  }

  return response.data;
}

export const useFetchWorkerProfile = (workerId) => {
  const authToken = useSelector((state) => state.Auth?.token);

  const { isPending, error, data, isError, isSuccess, refetch } = useQuery({
    queryKey: ["workerProfile", workerId, authToken],
    queryFn: () => fetchWorkerProfile(workerId, authToken),
    enabled: !!workerId && !!authToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { isPending, error, data, isError, isSuccess, refetch };
};

// ============================================================================
// 6. FETCH BANK DETAILS
// ============================================================================

async function fetchBankDetails(authToken) {
  const output = await fetch(`${BACKEND_API_URL}/v1/business/bank-details`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  const response = await output.json();

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to fetch bank details");
  }

  return response.data;
}

export const useFetchBankDetails = () => {
  const authToken = useSelector((state) => state.Auth?.token);

  const { isPending, error, data, isError, isSuccess, refetch } = useQuery({
    queryKey: ["bankDetails", authToken],
    queryFn: () => fetchBankDetails(authToken),
    enabled: !!authToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { isPending, error, data, isError, isSuccess, refetch };
};

// ============================================================================
// 7. UPDATE BANK DETAILS
// ============================================================================

async function updateBankDetails(bankDetails, authToken) {
  const output = await fetch(`${BACKEND_API_URL}/v1/business/bank-details`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(bankDetails),
  });

  const response = await output.json();

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to update bank details");
  }

  return response.data;
}

export const useUpdateBankDetails = () => {
  const authToken = useSelector((state) => state.Auth?.token);

  const { isPending, error, mutate, reset, isError, isSuccess, data } =
    useMutation({
      mutationFn: (bankDetails) => updateBankDetails(bankDetails, authToken),
    });

  return { isPending, error, mutate, reset, isError, isSuccess, data };
};

// ============================================================================
// 8. FETCH BUSINESS NOTIFICATIONS
// ============================================================================

async function fetchBusinessNotifications(params = {}, authToken) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${BACKEND_API_URL}/v1/business/notifications${
    queryString ? `?${queryString}` : ""
  }`;

  const output = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  const response = await output.json();

  console.log("Business Notifications Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to fetch notifications");
  }

  return response;
}

export const useFetchBusinessNotifications = (params = {}) => {
  const authToken = useSelector((state) => state.Auth?.token);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    isSuccess,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["businessNotifications", authToken, params],
    queryFn: ({ pageParam = 1 }) =>
      fetchBusinessNotifications(
        {
          per_page: params.per_page || 10,
          page: pageParam,
          language: params.language || "en",
        },
        authToken
      ),
    enabled: !!authToken,
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.data?.meta;
      if (meta && meta.current_page < meta.last_page) {
        return meta.current_page + 1;
      }
      return undefined;
    },
    select: (data) => {
      const allNotifications = data.pages.flatMap(
        (page) => page.data.notifications
      );
      const meta = data.pages[data.pages.length - 1]?.data?.meta || {};
      const unreadCount = data.pages[0]?.data?.unread_count || 0;
      return { notifications: allNotifications, meta, unreadCount };
    },
  });

  return {
    isPending: isLoading,
    error,
    data,
    isError,
    isSuccess,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};

