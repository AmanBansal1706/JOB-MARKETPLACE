import { BACKEND_API_URL } from "@env";
import { useMutation, useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";

// ============================================================================
// 1. FETCH ALL JOB SKILLS
// ============================================================================

async function fetchAllSkills() {
  const output = await fetch(`${BACKEND_API_URL}/v1/skills`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const response = await output.json();

  console.log("Fetch Skills Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to fetch skills");
  }

  return response;
}

export const useFetchAllSkills = () => {
  const { isPending, error, data, isError, isSuccess, refetch } = useQuery({
    queryKey: ["skills"],
    queryFn: fetchAllSkills,
  });
  return { isPending, error, data, isError, isSuccess, refetch };
};

// ============================================================================
// 2. FETCH ALL JOB RESPONSIBILITIES
// ============================================================================

async function fetchAllResponsibilities() {
  const output = await fetch(`${BACKEND_API_URL}/v1/responsibilities`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const response = await output.json();

  console.log("Fetch Responsibilities Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to fetch responsibilities");
  }

  return response;
}

export const useFetchAllResponsibilities = () => {
  const { isPending, error, data, isError, isSuccess, refetch } = useQuery({
    queryKey: ["responsibilities"],
    queryFn: fetchAllResponsibilities,
  });
  return { isPending, error, data, isError, isSuccess, refetch };
};

// ============================================================================
// 2.1 FETCH ALL POSITIONS
// ============================================================================

async function fetchAllPositions() {
  const output = await fetch(`${BACKEND_API_URL}/v1/positions`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const response = await output.json();

  console.log("Fetch Positions Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to fetch positions");
  }

  return response;
}

export const useFetchAllPositions = () => {
  const { isPending, error, data, isError, isSuccess, refetch } = useQuery({
    queryKey: ["positions"],
    queryFn: fetchAllPositions,
  });
  return { isPending, error, data, isError, isSuccess, refetch };
};

// ============================================================================
// 3. FETCH ALL JOBS
// ============================================================================

async function fetchAllJobs(authToken) {
  const output = await fetch(`${BACKEND_API_URL}/v1/business/jobs`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  const response = await output.json();

  console.log("Fetch All Jobs Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to fetch jobs");
  }

  return response;
}

export const useFetchAllJobs = () => {
  const authToken = useSelector((state) => state.Auth?.token);

  const { isPending, error, data, isError, isSuccess, refetch } = useQuery({
    queryKey: ["jobs", authToken],
    queryFn: () => fetchAllJobs(authToken),
    enabled: !!authToken,
  });
  return { isPending, error, data, isError, isSuccess, refetch };
};

// ============================================================================
// 3.1 FETCH JOBS BY STATUS
// ============================================================================

async function fetchJobsByStatus(status, authToken) {
  const output = await fetch(`${BACKEND_API_URL}/v1/business/jobs/${status}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  const response = await output.json();

  console.log(`Fetch Jobs by Status (${status}) Response:`, response);

  if (response.status_code !== 1) {
    throw new Error(response.message || `Failed to fetch ${status} jobs`);
  }

  return response;
}

export const useFetchJobsByStatus = (status) => {
  const authToken = useSelector((state) => state.Auth?.token);

  const { isPending, error, data, isError, isSuccess, refetch } = useQuery({
    queryKey: ["jobsbystatus", status, authToken],
    queryFn: () => fetchJobsByStatus(status, authToken),
    enabled: !!authToken && !!status,
  });
  return { isPending, error, data, isError, isSuccess, refetch };
};

// ============================================================================
// 3.2 FETCH JOB BY ID
// ============================================================================

async function fetchJobById(jobId, authToken) {
  const output = await fetch(`${BACKEND_API_URL}/v1/business/jobs/${jobId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  const response = await output.json();

  if (response.status_code !== 1) {
    throw new Error(response.message || `Failed to fetch job ${jobId}`);
  }

  return response;
}

export const useFetchJobById = (jobId) => {
  const authToken = useSelector((state) => state.Auth?.token);

  const { isPending, error, data, isError, isSuccess, refetch } = useQuery({
    queryKey: ["jobbyid", jobId, authToken],
    queryFn: () => fetchJobById(jobId, authToken),
    enabled: !!authToken && !!jobId,
  });
  return { isPending, error, data, isError, isSuccess, refetch };
};

// ============================================================================
// 3.3 FETCH PROPOSALS FOR A JOB
// ============================================================================

async function fetchProposals(jobId, params = {}, authToken) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${BACKEND_API_URL}/v1/business/jobs/${jobId}/proposals${
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

  if (response.status_code !== 1) {
    throw new Error(
      response.message || `Failed to fetch proposals for ${jobId}`,
    );
  }

  return response;
}

export const useFetchProposals = (jobId, params = {}) => {
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
    queryKey: ["proposals", jobId, params, authToken],
    queryFn: ({ pageParam = 1 }) =>
      fetchProposals(jobId, { ...params, page: pageParam }, authToken),
    enabled: !!authToken && !!jobId,
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.data?.meta;
      if (meta.current_page < meta.last_page) {
        return meta.current_page + 1;
      } else {
        return undefined;
      }
    },
    select: (data) => {
      const allProposals = data.pages.flatMap((page) => page.data.proposals);
      const meta = data.pages[data.pages.length - 1]?.data?.meta || {};
      const job = data.pages[0]?.data?.job || {};
      const finalData = { proposals: allProposals, meta, job };
      return finalData;
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
// 4. CREATE JOB
// ============================================================================

async function createJob(data, authToken) {
  console.log("Creating Job with Data:", data, authToken);
  const output = await fetch(`${BACKEND_API_URL}/v1/business/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(data),
  });
  const response = await output.json();

  console.log("Create Job Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to create job");
  }

  return response;
}

export const useCreateJob = () => {
  const authToken = useSelector((state) => state.Auth?.token);

  const { isPending, error, mutate, reset, isError, isSuccess, data } =
    useMutation({
      mutationFn: (jobData) => createJob(jobData, authToken),
    });
  return { isPending, error, mutate, reset, isError, isSuccess, data };
};

// ============================================================================
// 5. UPDATE JOB
// ============================================================================

async function updateJob(jobId, data, authToken) {
  const output = await fetch(
    `${BACKEND_API_URL}/v1/business/jobs/${jobId}/edit`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    },
  );
  const response = await output.json();

  console.log("Update Job Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to update job");
  }

  return response;
}

export const useUpdateJob = () => {
  const authToken = useSelector((state) => state.Auth?.token);

  const { isPending, error, mutate, reset, isError, isSuccess, data } =
    useMutation({
      mutationFn: ({ jobId, jobData }) => updateJob(jobId, jobData, authToken),
    });
  return { isPending, error, mutate, reset, isError, isSuccess, data };
};

// ============================================================================
// 6. DELETE JOB
// ============================================================================

async function deleteJob(jobId, authToken) {
  const output = await fetch(`${BACKEND_API_URL}/v1/business/jobs/${jobId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  const response = await output.json();

  console.log("Delete Job Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to delete job");
  }

  return response;
}

export const useDeleteJob = () => {
  const authToken = useSelector((state) => state.Auth?.token);

  const { isPending, error, mutate, reset, isError, isSuccess } = useMutation({
    mutationFn: (jobId) => deleteJob(jobId, authToken),
  });
  return { isPending, error, mutate, reset, isError, isSuccess };
};

// ============================================================================
// 7. RAISE DISPUTE
// ============================================================================

async function raiseDispute(formData, authToken) {
  try {
    const output = await fetch(`${BACKEND_API_URL}/v1/business/disputes`, {
      method: "POST",
      headers: {
        // Let fetch set Content-Type for multipart boundary
        Authorization: `Bearer ${authToken}`,
        Accept: "application/json",
      },
      body: formData,
    });

    // If response is not ok, try to read body for diagnostics
    const text = await output.text();
    let response;
    try {
      response = JSON.parse(text);
    } catch (e) {
      throw new Error(
        `Unexpected response from server (status ${output.status})`,
      );
    }

    if (response.status_code !== 1) {
      throw new Error(response.message || "Failed to raise dispute");
    }

    return response;
  } catch (err) {
    throw err;
  }
}

// ============================================================================
// 7.1 FETCH PROPOSED SLOTS FOR A JOB (FOR DISPUTES)
// ============================================================================

async function fetchProposedSlots(jobId, authToken) {
  const output = await fetch(
    `${BACKEND_API_URL}/v1/business/jobs/${jobId}/proposed-slots`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    },
  );
  const response = await output.json();

  console.log("Fetch Proposed Slots Response:", response);

  if (response.status_code !== 1) {
    throw new Error(
      response.message || `Failed to fetch proposed slots for job ${jobId}`,
    );
  }

  return response;
}

export const useFetchProposedSlots = (jobId) => {
  const authToken = useSelector((state) => state.Auth?.token);

  const { isPending, error, data, isError, isSuccess, refetch } = useQuery({
    queryKey: ["proposedslots", jobId, authToken],
    queryFn: () => fetchProposedSlots(jobId, authToken),
    enabled: !!authToken && !!jobId,
  });
  return { isPending, error, data, isError, isSuccess, refetch };
};

export const useRaiseDispute = () => {
  const authToken = useSelector((state) => state.Auth?.token);

  const {
    isPending,
    error,
    mutate,
    mutateAsync,
    reset,
    isError,
    isSuccess,
    data,
  } = useMutation({
    mutationFn: (disputeData) => raiseDispute(disputeData, authToken),
  });

  return {
    isPending,
    error,
    mutate,
    mutateAsync,
    reset,
    isError,
    isSuccess,
    data,
  };
};

// ============================================================================
// 8. FETCH ASSIGNED WORKERS FOR A JOB
// ============================================================================

async function fetchAssignedWorkers(jobId, authToken) {
  const output = await fetch(
    `${BACKEND_API_URL}/v1/business/jobs/${jobId}/assigned-workers`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    },
  );
  const response = await output.json();

  console.log("Fetch Assigned Workers Response:", response);

  if (response.status_code !== 1) {
    throw new Error(
      response.message || `Failed to fetch assigned workers for job ${jobId}`,
    );
  }

  return response;
}

export const useFetchAssignedWorkers = (jobId) => {
  const authToken = useSelector((state) => state.Auth?.token);

  const { isPending, error, data, isError, isSuccess, refetch } = useQuery({
    queryKey: ["assignedworkers", jobId, authToken],
    queryFn: () => fetchAssignedWorkers(jobId, authToken),
    enabled: !!authToken && !!jobId,
  });
  return { isPending, error, data, isError, isSuccess, refetch };
};

// ============================================================================
// 8.1 FETCH ASSIGNED WORKERS STATUS FOR A JOB (WITH SLOTS)
// ============================================================================

async function fetchAssignedWorkersStatus(jobId, authToken) {
  const output = await fetch(
    `${BACKEND_API_URL}/v1/business/jobs/${jobId}/assigned-workers-status`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    },
  );
  const response = await output.json();

  console.log("Fetch Assigned Workers Status Response:", response);

  if (response.status_code !== 1) {
    throw new Error(
      response.message ||
        `Failed to fetch assigned workers status for job ${jobId}`,
    );
  }

  return response;
}

export const useFetchAssignedWorkersStatus = (jobId) => {
  const authToken = useSelector((state) => state.Auth?.token);

  const { isPending, error, data, isError, isSuccess, refetch } = useQuery({
    queryKey: ["assignedworkersstatus", jobId, authToken],
    queryFn: () => fetchAssignedWorkersStatus(jobId, authToken),
    enabled: !!authToken && !!jobId,
  });
  return { isPending, error, data, isError, isSuccess, refetch };
};

// ============================================================================
// 9. FETCH WORKER ANALYTICS FOR A JOB
// ============================================================================

async function fetchWorkerAnalytics(workerId, jobId, authToken) {
  const queryString = new URLSearchParams({ job_id: jobId }).toString();
  const url = `${BACKEND_API_URL}/v1/business/workers/${workerId}/analytics?${queryString}`;

  const output = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  const response = await output.json();

  console.log("Fetch Worker Analytics Response:", response);

  if (response.status_code !== 1) {
    throw new Error(
      response.message || `Failed to fetch analytics for worker ${workerId}`,
    );
  }

  return response;
}

export const useFetchWorkerAnalytics = (workerId, jobId) => {
  const authToken = useSelector((state) => state.Auth?.token);

  const { isPending, error, data, isError, isSuccess, refetch } = useQuery({
    queryKey: ["workeranalytics", workerId, jobId, authToken],
    queryFn: () => fetchWorkerAnalytics(workerId, jobId, authToken),
    enabled: !!authToken && !!workerId && !!jobId,
  });
  return { isPending, error, data, isError, isSuccess, refetch };
};

// ============================================================================
// 10. COMPLETE JOB
// ============================================================================

async function completeJob(jobId, authToken) {
  const output = await fetch(
    `${BACKEND_API_URL}/v1/business/jobs/${jobId}/complete`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    },
  );
  const response = await output.json();

  console.log("Complete Job Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to complete job");
  }

  return response;
}

export const useCompleteJob = () => {
  const authToken = useSelector((state) => state.Auth?.token);

  const { isPending, error, mutate, reset, isError, isSuccess, data } =
    useMutation({
      mutationFn: (jobId) => completeJob(jobId, authToken),
    });
  return { isPending, error, mutate, reset, isError, isSuccess, data };
};

// ============================================================================
// 10.1 COMPLETE JOB FOR A SINGLE WORKER/SLOT
// ============================================================================

async function completeSingleWorkerSlot(
  jobId,
  workerId,
  proposalId,
  authToken,
) {
  let url = `${BACKEND_API_URL}/v1/business/jobs/${jobId}/complete?worker_id=${workerId}`;
  if (proposalId) {
    url += `&proposal_id=${proposalId}`;
  }

  const output = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  const response = await output.json();

  console.log(
    `Complete Single Worker/Slot Response (Worker: ${workerId}, Proposal: ${proposalId}):`,
    response,
  );

  if (response.status_code !== 1) {
    throw new Error(
      response.message || "Failed to complete job for worker slot",
    );
  }

  return response;
}

export const useCompleteSingleWorkerSlot = () => {
  const authToken = useSelector((state) => state.Auth?.token);

  const { isPending, error, mutate, reset, isError, isSuccess, data } =
    useMutation({
      mutationFn: ({ jobId, workerId, proposalId }) =>
        completeSingleWorkerSlot(jobId, workerId, proposalId, authToken),
    });
  return { isPending, error, mutate, reset, isError, isSuccess, data };
};

// ============================================================================
// 10.2 COMPLETE JOB FOR A SINGLE WORKER (MOCK)
// ============================================================================

export const useCompleteJobForWorkerMock = () => {
  const { isPending, error, mutate, reset, isError, isSuccess, data } =
    useMutation({
      mutationFn: ({ jobId, workerId }) =>
        new Promise((resolve) => {
          console.log(`Mock completing job ${jobId} for worker ${workerId}`);
          setTimeout(() => {
            resolve({
              status_code: 1,
              message: "Worker job completed successfully (Mock)",
              data: { job_id: jobId, worker_id: workerId },
            });
          }, 1500); // simulate network delay
        }),
    });
  return { isPending, error, mutate, reset, isError, isSuccess, data };
};

// ============================================================================
// 11. SELECT WORKER FOR A JOB
// ============================================================================

async function selectWorker(jobId, workerId, slotId, finishReason, authToken) {
  let bodyData = { worker_id: workerId };

  let url = `${BACKEND_API_URL}/v1/business/jobs/${jobId}/select-worker`;
  if (slotId) {
    bodyData.slot_id = slotId;
  }
  if (finishReason) {
    bodyData.finish_reason = finishReason;
  }

  const output = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(bodyData),
  });
  const response = await output.json();

  console.log("Select Worker Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to select worker");
  }

  return response;
}

export const useSelectWorker = () => {
  const authToken = useSelector((state) => state.Auth?.token);

  const { isPending, error, mutate, reset, isError, isSuccess, data } =
    useMutation({
      mutationFn: ({ jobId, workerId, slotId, finishReason }) =>
        selectWorker(jobId, workerId, slotId, finishReason, authToken),
    });
  return { isPending, error, mutate, reset, isError, isSuccess, data };
};

// ============================================================================
// 12. ESTIMATE JOB COST
// ============================================================================

async function estimateJobCost(costData, authToken) {
  const output = await fetch(`${BACKEND_API_URL}/v1/business/cost/estimate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(costData),
  });
  const response = await output.json();

  console.log("Estimate Job Cost Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to estimate job cost");
  }

  return response;
}

export const useEstimateJobCost = () => {
  const authToken = useSelector((state) => state.Auth?.token);

  const { isPending, error, mutate, reset, isError, isSuccess, data } =
    useMutation({
      mutationFn: (costData) => estimateJobCost(costData, authToken),
    });
  return { isPending, error, mutate, reset, isError, isSuccess, data };
};

// ============================================================================
// 13. SUBMIT REVIEW FOR A WORKER
// ============================================================================

async function submitWorkerReview(jobId, reviewData, authToken) {
  const output = await fetch(
    `${BACKEND_API_URL}/v1/business/jobs/${jobId}/review`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(reviewData),
    },
  );
  const response = await output.json();

  console.log("Submit Review Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to submit review");
  }

  return response;
}

export const useSubmitWorkerReview = () => {
  const authToken = useSelector((state) => state.Auth?.token);

  const { isPending, error, mutate, reset, isError, isSuccess, data } =
    useMutation({
      mutationFn: ({ jobId, reviewData }) =>
        submitWorkerReview(jobId, reviewData, authToken),
    });
  return { isPending, error, mutate, reset, isError, isSuccess, data };
};

// ============================================================================
// 14. FETCH DISPUTES FOR A JOB
// ============================================================================

async function fetchDisputesByJobId(jobId, authToken) {
  const output = await fetch(
    `${BACKEND_API_URL}/v1/business/jobs/${jobId}/disputes`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    },
  );
  const response = await output.json();

  console.log("Fetch Disputes Response:", response);

  if (response.status_code !== 1) {
    throw new Error(
      response.message || `Failed to fetch disputes for job ${jobId}`,
    );
  }

  return response;
}

export const useFetchDisputesByJobId = (jobId) => {
  const authToken = useSelector((state) => state.Auth?.token);

  const { isPending, error, data, isError, isSuccess, refetch } = useQuery({
    queryKey: ["disputes", jobId, authToken],
    queryFn: () => fetchDisputesByJobId(jobId, authToken),
    enabled: !!authToken && !!jobId,
  });
  return { isPending, error, data, isError, isSuccess, refetch };
};

// ============================================================================
// 15. SEARCH WORKERS (BUSINESS PANEL)
// ============================================================================

async function fetchSearchWorkers(params = {}, authToken) {
  // Filter out null/undefined values to avoid sending them as strings like "null"
  const cleanedParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== null && v !== undefined),
  );
  const queryString = new URLSearchParams(cleanedParams).toString();
  const url = `${BACKEND_API_URL}/v1/business/workers/search${
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

  console.log("Search Workers Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to search workers");
  }

  return response;
}

export const useSearchWorkers = (params = {}) => {
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
    queryKey: ["searchWorkers", params, authToken],
    queryFn: ({ pageParam = 1 }) =>
      fetchSearchWorkers({ ...params, page: pageParam }, authToken),
    enabled: !!authToken,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      if (pagination && pagination.current_page < pagination.last_page) {
        return pagination.current_page + 1;
      }
      return undefined;
    },
    select: (data) => {
      const allWorkers = data.pages.flatMap((page) => page.data.workers);
      const pagination =
        data.pages[data.pages.length - 1]?.data?.pagination || {};
      return { workers: allWorkers, pagination };
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

async function fetchJobCostBreakdown(jobId, authToken) {
  const output = await fetch(
    `${BACKEND_API_URL}/v1/business/jobs/${jobId}/breakdown`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    },
  );
  const response = await output.json();

  console.log("Fetch Job Breakdown Response:", response);

  if (response.status_code !== 1) {
    throw new Error(
      response.message || `Failed to fetch job breakdown for job ${jobId}`,
    );
  }

  return response;
}

export const useFetchJobCostBreakdown = (jobId) => {
  const authToken = useSelector((state) => state.Auth?.token);

  const { isPending, error, data, isError, isSuccess, refetch } = useQuery({
    queryKey: ["jobcostbreakdown", jobId, authToken],
    queryFn: () => fetchJobCostBreakdown(jobId, authToken),
    enabled: !!authToken && !!jobId,
  });
  return { isPending, error, data, isError, isSuccess, refetch };
};
// ============================================================================
// 15. INVITE WORKER TO JOB (REQUEST BID)
// ============================================================================

async function inviteWorkerToJob({ jobId, workerId, message }, authToken) {
  const url = `${BACKEND_API_URL}/v1/business/jobs/${jobId}/request-bid`;
  const output = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      worker_id: workerId,
      message: message,
    }),
  });

  const response = await output.json();

  console.log("Invite Worker Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to invite worker");
  }

  return response;
}

export const useInviteWorkerToJob = () => {
  const authToken = useSelector((state) => state.Auth?.token);
  return useMutation({
    mutationFn: (data) => inviteWorkerToJob(data, authToken),
  });
};
