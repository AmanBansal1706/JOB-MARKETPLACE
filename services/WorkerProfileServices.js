import { BACKEND_API_URL } from "@env";
import { useQuery, useMutation, useInfiniteQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";

async function fetchWorkerProfile(authToken) {
  const output = await fetch(`${BACKEND_API_URL}/v1/worker/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  const response = await output.json();

  console.log("Worker Profile Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to fetch worker profile");
  }

  return response.data;
}

export const useFetchWorkerProfile = () => {
  const authToken = useSelector((state) => state.Auth?.token);

  const { isPending, error, data, isError, isSuccess, refetch } = useQuery({
    queryKey: ["workerProfile", authToken],
    queryFn: () => fetchWorkerProfile(authToken),
    enabled: !!authToken,
    staleTime: 5 * 60 * 1000,
  });

  return { isPending, error, data, isError, isSuccess, refetch };
};

// Fetch positions from API
async function fetchPositions(authToken) {
  const output = await fetch(`${BACKEND_API_URL}/v1/positions`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  const response = await output.json();

  console.log("Positions Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to fetch positions");
  }

  return response.data.positions;
}

export const useFetchPositions = () => {
  const authToken = useSelector((state) => state.Auth?.token);

  const { isPending, error, data, isError, isSuccess, refetch } = useQuery({
    queryKey: ["positions", authToken],
    queryFn: () => fetchPositions(authToken),
    enabled: !!authToken,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  return { isPending, error, data, isError, isSuccess, refetch };
};

// Complete worker profile
async function completeWorkerProfile(authToken, profileData) {
  const formData = new FormData();

  // Add basic fields
  if (profileData.first_name)
    formData.append("first_name", profileData.first_name);
  if (profileData.last_name)
    formData.append("last_name", profileData.last_name);
  if (profileData.profile_description)
    formData.append("profile_description", profileData.profile_description);
  if (profileData.dob) formData.append("dob", profileData.dob);
  if (profileData.gender) formData.append("gender", profileData.gender);
  if (profileData.show_age !== undefined)
    formData.append("show_age", profileData.show_age ? "1" : "0");
  if (profileData.show_gender !== undefined)
    formData.append("show_gender", profileData.show_gender ? "1" : "0");
  if (profileData.curp) formData.append("curp", profileData.curp);
  if (profileData.rfc) formData.append("rfc", profileData.rfc);

  // Add location data
  if (profileData.location) {
    formData.append("location[lat]", profileData.location.lat.toString());
    formData.append("location[lng]", profileData.location.lng.toString());
    formData.append("location[address]", profileData.location.address);
  }

  // Add positions
  if (profileData.positions && profileData.positions.length > 0) {
    profileData.positions.forEach((position, index) => {
      formData.append(`positions[${index}][position_id]`, position.position_id);
      formData.append(
        `positions[${index}][experience_level]`,
        position.experience_level,
      );
    });
  }

  // Add profile picture
  if (profileData.profile_picture) {
    const uri = profileData.profile_picture;
    const filename = uri.split("/").pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    formData.append("profile_picture", {
      uri,
      name: filename,
      type,
    });
  }

  // Add government ID documents
  if (profileData.gov_id && profileData.gov_id.length > 0) {
    profileData.gov_id.forEach((doc) => {
      const uri = doc.uri;
      const filename = uri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("gov_id[]", {
        uri,
        name: filename,
        type,
      });
    });
  }

  // Add KYC documents
  if (profileData.kyc_documents && profileData.kyc_documents.length > 0) {
    profileData.kyc_documents.forEach((doc) => {
      const uri = doc.uri;
      const filename = uri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("kyc_documents[]", {
        uri,
        name: filename,
        type,
      });
    });
  }

  // Add criminal documents
  if (
    profileData.criminal_documents &&
    profileData.criminal_documents.length > 0
  ) {
    profileData.criminal_documents.forEach((doc) => {
      const uri = doc.uri;
      const filename = uri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("criminal_documents[]", {
        uri,
        name: filename,
        type,
      });
    });
  }

  const output = await fetch(`${BACKEND_API_URL}/v1/worker/complete-profile`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    body: formData,
  });

  const response = await output.json();

  console.log("Complete Profile Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to complete profile");
  }

  return response.data;
}

export const useCompleteWorkerProfile = () => {
  const authToken = useSelector((state) => state.Auth?.token);

  return useMutation({
    mutationFn: (profileData) => completeWorkerProfile(authToken, profileData),
  });
};

// ============================================================================
// UPDATE WORKER PROFILE
// ============================================================================

// Update worker profile
async function updateWorkerProfile(authToken, profileData) {
  const formData = new FormData();

  if (profileData.lat) formData.append("lat", profileData.lat.toString());
  if (profileData.lng) formData.append("lng", profileData.lng.toString());
  if (profileData.address) formData.append("address", profileData.address);

  if (profileData.profile_picture) {
    // Only append if it's a new local URI (starts with file:// or contains /Cache/ or similar)
    // If it's already a URL (http), we usually don't need to re-upload
    if (
      profileData.profile_picture.startsWith("file://") ||
      profileData.profile_picture.startsWith("content://")
    ) {
      const uri = profileData.profile_picture;
      const filename = uri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("profile_picture", {
        uri,
        name: filename,
        type,
      });
    }
  }

  const output = await fetch(`${BACKEND_API_URL}/v1/worker/profile`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    body: formData,
  });

  const response = await output.json();

  console.log("Update Worker Profile Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to update profile");
  }

  return response.data;
}

export const useUpdateWorkerProfile = () => {
  const authToken = useSelector((state) => state.Auth?.token);

  return useMutation({
    mutationFn: (profileData) => updateWorkerProfile(authToken, profileData),
  });
};

// ============================================================================
// WORKER SUPPORT TICKETS
// ============================================================================

// Fetch worker support tickets with pagination
async function fetchWorkerSupportTickets(params = {}, authToken) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${BACKEND_API_URL}/v1/worker/support-tickets${
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

  console.log("Worker Support Tickets Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to fetch support tickets");
  }

  return response;
}

export const useFetchWorkerSupportTickets = (
  params = {},
  statusFilter = null,
  ticketId = null,
) => {
  const authToken = useSelector((state) => state.Auth?.token);

  // Build query params only with non-null values
  const buildQueryParams = (pageParam) => {
    const queryParams = {
      per_page: params.per_page || 100,
      page: pageParam,
      sort_dir: params.sort_dir || "desc",
    };

    if (statusFilter) {
      queryParams.status = statusFilter;
    }
    if (ticketId) {
      queryParams.ticket_id = ticketId;
    }

    return queryParams;
  };

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
    queryKey: ["workerSupportTickets", authToken, statusFilter, ticketId],
    queryFn: ({ pageParam = 1 }) =>
      fetchWorkerSupportTickets(buildQueryParams(pageParam), authToken),
    enabled: !!authToken,
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.data?.meta;
      if (meta && meta.current_page < meta.last_page) {
        return meta.current_page + 1;
      }
      return undefined;
    },
    select: (data) => {
      const allTickets = data.pages.flatMap((page) => page.data.tickets);
      const meta = data.pages[data.pages.length - 1]?.data?.meta || {};
      return { tickets: allTickets, meta };
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

// Create worker support ticket
async function createWorkerSupportTicket(formData, authToken) {
  const output = await fetch(`${BACKEND_API_URL}/v1/worker/support-tickets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
      Accept: "application/json",
    },
    body: formData,
  });

  const text = await output.text();
  let response;

  try {
    response = JSON.parse(text);
  } catch (e) {
    throw new Error(
      `Unexpected response from server (status ${output.status})`,
    );
  }

  console.log("Create Worker Support Ticket Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to create support ticket");
  }

  return response;
}

export const useCreateWorkerSupportTicket = () => {
  const authToken = useSelector((state) => state.Auth?.token);

  return useMutation({
    mutationFn: (ticketData) => {
      const formData = new FormData();

      // Append ticket data
      formData.append("subject", ticketData.subject);
      formData.append("description", ticketData.description);
      formData.append("email", ticketData.email);
      formData.append("mobile", ticketData.mobile);

      // Append media if present
      if (ticketData.media) {
        const uri = ticketData.media;
        const filename = uri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("media", {
          uri,
          name: filename,
          type,
        });
      }

      return createWorkerSupportTicket(formData, authToken);
    },
  });
};

// ============================================================================
// WORKER BANK DETAILS
// ============================================================================

// Fetch worker bank details
async function fetchWorkerBankDetails(authToken) {
  const output = await fetch(`${BACKEND_API_URL}/v1/worker/bank-details`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  const response = await output.json();

  console.log("Worker Bank Details Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to fetch bank details");
  }

  return response.data;
}

export const useFetchWorkerBankDetails = () => {
  const authToken = useSelector((state) => state.Auth?.token);

  const { isPending, error, data, isError, isSuccess, refetch } = useQuery({
    queryKey: ["workerBankDetails", authToken],
    queryFn: () => fetchWorkerBankDetails(authToken),
    enabled: !!authToken,
    staleTime: 5 * 60 * 1000,
  });

  return { isPending, error, data, isError, isSuccess, refetch };
};

// Update worker bank details
async function updateWorkerBankDetails(authToken, bankData) {
  const output = await fetch(`${BACKEND_API_URL}/v1/worker/bank-details`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(bankData),
  });

  const response = await output.json();

  console.log("Update Bank Details Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to update bank details");
  }

  return response.data;
}

export const useUpdateWorkerBankDetails = () => {
  const authToken = useSelector((state) => state.Auth?.token);

  return useMutation({
    mutationFn: (bankData) => updateWorkerBankDetails(authToken, bankData),
  });
};

// ============================================================================
// WORKER NOTIFICATIONS
// ============================================================================

// Fetch worker notifications
async function fetchWorkerNotifications(params = {}, authToken) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${BACKEND_API_URL}/v1/worker/notifications${
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

  console.log("Worker Notifications Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to fetch notifications");
  }

  return response;
}

export const useFetchWorkerNotifications = (params = {}) => {
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
    queryKey: ["workerNotifications", authToken, params],
    queryFn: ({ pageParam = 1 }) =>
      fetchWorkerNotifications(
        {
          per_page: params.per_page || 20,
          page: pageParam,
          language: params.language || "en",
        },
        authToken,
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
        (page) => page.data.notifications,
      );
      const meta = data.pages[data.pages.length - 1]?.data?.meta || {};
      return { notifications: allNotifications, meta };
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

// Mark notifications read
async function markNotificationsRead(authToken, notificationId = null) {
  const url = `${BACKEND_API_URL}/v1/worker/notifications/mark-read`;
  const body = notificationId ? { notification_id: notificationId } : {};

  const output = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(body),
  });

  const response = await output.json();

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to mark notifications as read");
  }

  return response.data;
}

export const useMarkNotificationsRead = () => {
  const authToken = useSelector((state) => state.Auth?.token);

  return useMutation({
    mutationFn: (notificationId) =>
      markNotificationsRead(authToken, notificationId),
  });
};

// ============================================================================
// BUSINESS PROFILE
// ============================================================================

// Fetch business profile
async function fetchBusinessProfile(businessId, authToken) {
  const output = await fetch(
    `${BACKEND_API_URL}/v1/worker/businesses/${businessId}/profile`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    },
  );

  const response = await output.json();

  console.log("Business Profile Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to fetch business profile");
  }

  return response.data;
}

export const useFetchBusinessProfile = (businessId) => {
  const authToken = useSelector((state) => state.Auth?.token);

  const { isPending, error, data, isError, isSuccess, refetch } = useQuery({
    queryKey: ["businessProfile", businessId, authToken],
    queryFn: () => fetchBusinessProfile(businessId, authToken),
    enabled: !!authToken && !!businessId,
    staleTime: 5 * 60 * 1000,
  });

  return { isPending, error, data, isError, isSuccess, refetch };
};
