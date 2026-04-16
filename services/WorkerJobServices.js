import { BACKEND_API_URL } from "@env";
import { useInfiniteQuery, useQuery, useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";

async function fetchWorkerJobs(
  { page = 1, jobStatus = "Suggested", limit = 10, filters = {} },
  authToken,
) {
  console.log("fetchWorkerJobs called with:", {
    page,
    jobStatus,
    limit,
    filters,
    authToken,
  });
  const response = await fetch(`${BACKEND_API_URL}/v1/worker/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      job_status: jobStatus,
      page,
      limit,
      filters,
    }),
  });

  const data = await response.json();
  console.log("fetchWorkerJobs response data:", data);

  if (data.status_code !== 1) {
    throw new Error(data.message || "Failed to fetch jobs");
  }

  return data;
}

// Fetch single worker job by ID
async function fetchWorkerJobById(jobId, tabStatus, authToken) {
  console.log("fetchWorkerJobById called with:", {
    jobId,
    tabStatus,
    authToken,
  });

  const url = tabStatus
    ? `${BACKEND_API_URL}/v1/worker/jobs/${jobId}?tab_status=${tabStatus.toLowerCase()}`
    : `${BACKEND_API_URL}/v1/worker/jobs/${jobId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json();
  console.log("fetchWorkerJobById response data:", data);

  if (data.status_code !== 1) {
    throw new Error(data.message || "Failed to fetch job details");
  }

  return data.data;
}

export const useFetchWorkerJobs = ({
  jobStatus = "Suggested",
  limit = 10,
  filters = {},
} = {}) => {
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
    queryKey: ["workerJobs", jobStatus, limit, filters, authToken],
    queryFn: ({ pageParam = 1 }) =>
      fetchWorkerJobs(
        { page: pageParam, jobStatus, limit, filters },
        authToken,
      ),
    enabled: !!authToken,
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage.data;
      if (pagination.page * pagination.limit < pagination.total) {
        return pagination.page + 1;
      }
      return undefined;
    },
    select: (data) => {
      const allJobs = data.pages.flatMap((page) => page.data.jobs);
      const pagination =
        data.pages[data.pages.length - 1]?.data?.pagination || {};
      return { jobs: allJobs, pagination };
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

// Hook to fetch single worker job by ID
export const useFetchWorkerJobById = (jobId, tabStatus) => {
  const authToken = useSelector((state) => state.Auth?.token);

  const { isPending, error, data, isError, isSuccess, refetch, isFetching } =
    useQuery({
      queryKey: ["workerJob", jobId, tabStatus, authToken],
      queryFn: () => fetchWorkerJobById(jobId, tabStatus, authToken),
      enabled: !!authToken && !!jobId,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

  return { isPending, error, data, isError, isSuccess, refetch, isFetching };
};

// ============================================================================
// WORKER DISPUTES
// ============================================================================

// Raise a dispute on a job
async function raiseDispute(authToken, disputeData) {
  const formData = new FormData();

  // Add basic fields
  formData.append("job_id", disputeData.job_id);
  formData.append("title", disputeData.title);
  formData.append("reason", disputeData.reason);
  formData.append("description", disputeData.description);
  if (disputeData.proposal_id) {
    formData.append("proposal_id", disputeData.proposal_id);
  }

  // Add evidence files if provided
  if (disputeData.evidence_files && disputeData.evidence_files.length > 0) {
    disputeData.evidence_files.forEach((file, index) => {
      const uri = file.uri;
      const filename = uri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("evidence_files[]", {
        uri,
        name: filename,
        type,
      });
    });
  }

  const output = await fetch(`${BACKEND_API_URL}/v1/worker/disputes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    body: formData,
  });

  const response = await output.json();

  console.log("Raise Dispute Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to raise dispute");
  }

  return response.data;
}

export const useRaiseDispute = () => {
  const authToken = useSelector((state) => state.Auth?.token);

  return useMutation({
    mutationFn: (disputeData) => raiseDispute(authToken, disputeData),
  });
};

// ============================================================================
// WORKER TRANSACTIONS
// ============================================================================

// Fetch worker transaction history
async function fetchWorkerTransactions(params = {}, authToken) {
  console.log(
    "fetchWorkerTransactions called with params:",
    params,
    "authToken:",
    !!authToken,
  );

  const queryString = new URLSearchParams(params).toString();
  const url = `${BACKEND_API_URL}/v1/worker/transactions${
    queryString ? `?${queryString}` : ""
  }`;

  console.log("Fetching from URL:", url);

  const output = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  console.log("Response status:", output.status);

  const response = await output.json();

  console.log("Worker Transactions Response:", response);

  if (response.status_code !== 1) {
    console.error("API Error:", response.message);
    throw new Error(response.message || "Failed to fetch transactions");
  }

  return response;
}

export const useFetchWorkerTransactions = (
  params = {},
  startDate = null,
  endDate = null,
  jobTitle = null,
  businessName = null,
  minAmount = null,
  maxAmount = null,
) => {
  const authToken = useSelector((state) => state.Auth?.token);

  // Build query params only with non-null values
  const buildQueryParams = (pageParam) => {
    const queryParams = {
      page: pageParam,
      limit: params.limit || 10,
    };

    if (startDate) queryParams.start_date = startDate;
    if (endDate) queryParams.end_date = endDate;
    if (jobTitle) queryParams.job_title = jobTitle;
    if (businessName) queryParams.business_name = businessName;
    if (minAmount) queryParams.min_amount = minAmount;
    if (maxAmount) queryParams.max_amount = maxAmount;

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
    queryKey: [
      "workerTransactions",
      authToken,
      startDate,
      endDate,
      jobTitle,
      businessName,
      minAmount,
      maxAmount,
      params.limit,
    ],
    queryFn: ({ pageParam = 1 }) =>
      fetchWorkerTransactions(buildQueryParams(pageParam), authToken),
    enabled: !!authToken,
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.data?.meta;
      if (meta && meta.current_page < meta.last_page) {
        return meta.current_page + 1;
      }
      return undefined;
    },
    select: (data) => {
      const allTransactions = data.pages.flatMap(
        (page) => page.data.items || [],
      );
      // Map pagination to meta format
      const pagination =
        data.pages[data.pages.length - 1]?.data?.pagination || {};
      const meta = {
        current_page: pagination.page || 1,
        last_page: Math.ceil(
          (pagination.total || 0) / (pagination.limit || 15),
        ),
      };
      return { transactions: allTransactions, meta };
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

// ============================================================================
// WORKER JOB PAYOUT PREVIEW
// ============================================================================

// Fetch payout preview for selected slots
async function fetchPayoutPreview(slotIds, authToken) {
  console.log("fetchPayoutPreview called with:", { slotIds, authToken });

  const formData = new FormData();
  slotIds.forEach((slotId) => {
    formData.append("slot_ids[]", slotId.toString());
  });

  const response = await fetch(
    `${BACKEND_API_URL}/v1/worker/jobs/payout-preview`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    },
  );

  const data = await response.json();
  console.log("fetchPayoutPreview response data:", data);

  if (data.status_code !== 1) {
    throw new Error(data.message || "Failed to fetch payout preview");
  }

  return data.data;
}

export const useFetchPayoutPreview = () => {
  const authToken = useSelector((state) => state.Auth?.token);

  return useMutation({
    mutationFn: (slotIds) => fetchPayoutPreview(slotIds, authToken),
  });
};

// ============================================================================
// WORKER JOB PROPOSALS
// ============================================================================

// Submit job proposal for a slot
async function submitJobProposal(authToken, jobId, proposalData) {
  console.log("submitJobProposal called with:", { jobId, proposalData });

  const formData = new FormData();
  formData.append("slot_id", proposalData.slot_id.toString());
  formData.append("cover_letter", proposalData.cover_letter);

  const response = await fetch(
    `${BACKEND_API_URL}/v1/worker/jobs/${jobId}/proposals`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    },
  );

  const data = await response.json();
  console.log("submitJobProposal response data:", data);

  if (data.status_code !== 1) {
    throw new Error(data.message || "Failed to submit job proposal");
  }

  return data.data;
}

export const useSubmitJobProposal = () => {
  const authToken = useSelector((state) => state.Auth?.token);

  return useMutation({
    mutationFn: ({ jobId, proposalData }) =>
      submitJobProposal(authToken, jobId, proposalData),
  });
};

// ============================================================================
// WORKER JOB REVIEW
// ============================================================================

// Submit job review
async function submitJobReview(authToken, reviewData) {
  console.log("submitJobReview called with:", { reviewData });

  const response = await fetch(`${BACKEND_API_URL}/v1/worker/jobs/review`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      job_id: reviewData.job_id,
      rating: reviewData.rating,
      review: reviewData.review,
    }),
  });

  const data = await response.json();
  console.log("submitJobReview response data:", data);

  if (data.status_code !== 1) {
    throw new Error(data.message || "Failed to submit job review");
  }

  return data.data;
}

export const useSubmitJobReview = () => {
  const authToken = useSelector((state) => state.Auth?.token);

  return useMutation({
    mutationFn: (reviewData) => submitJobReview(authToken, reviewData),
  });
};

// ============================================================================
// WORKER JOB CHECK IN/OUT
// ============================================================================

// Toggle check-in/check-out for a job
async function jobCheckInOut(authToken, jobId) {
  console.log("jobCheckInOut called with:", { jobId });

  const response = await fetch(
    `${BACKEND_API_URL}/v1/worker/jobs/${jobId}/check`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    },
  );

  const data = await response.json();
  console.log("jobCheckInOut response data:", data);

  if (data.status_code !== 1) {
    throw new Error(data.message || "Failed to perform check-in/out action");
  }

  return data;
}

export const useJobCheckInOut = () => {
  const authToken = useSelector((state) => state.Auth?.token);

  return useMutation({
    mutationFn: (jobId) => jobCheckInOut(authToken, jobId),
  });
};

// ============================================================================
// WORKER CASH CONFIRMATION
// ============================================================================

// Confirm cash receipt for a job
async function confirmCashReceived(authToken, jobId, isReceived) {
  console.log("confirmCashReceived called with:", { jobId, isReceived });

  const response = await fetch(
    `${BACKEND_API_URL}/v1/worker/jobs/${jobId}/confirm-cash-received`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ is_received: isReceived }),
    },
  );

  const data = await response.json();
  console.log("confirmCashReceived response data:", data);

  if (data.status_code !== 1) {
    throw new Error(data.message || "Failed to confirm cash receipt");
  }

  return data;
}

export const useConfirmCashReceived = () => {
  const authToken = useSelector((state) => state.Auth?.token);

  return useMutation({
    mutationFn: ({ jobId, isReceived }) =>
      confirmCashReceived(authToken, jobId, isReceived),
  });
};

// ============================================================================
// WORKER CANCEL ASSIGNMENT
// ============================================================================

// Cancel worker's assignment for a job (only allowed before job starts)
async function cancelAssignment(authToken, jobId) {
  const response = await fetch(
    `${BACKEND_API_URL}/v1/worker/jobs/${jobId}/cancel-assignment`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    },
  );

  const data = await response.json();

  if (data.status_code !== 1) {
    throw new Error(data.message || "Failed to cancel assignment");
  }

  return data;
}

export const useCancelAssignment = () => {
  const authToken = useSelector((state) => state.Auth?.token);

  return useMutation({
    mutationFn: (jobId) => cancelAssignment(authToken, jobId),
  });
};
