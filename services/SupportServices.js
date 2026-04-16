import { BACKEND_API_URL } from "@env";
import {
  useMutation,
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useSelector } from "react-redux";

// ============================================================================
// 1. FETCH ALL SUPPORT TICKETS WITH PAGINATION
// ============================================================================

async function fetchSupportTickets(params = {}, authToken) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${BACKEND_API_URL}/v1/business/support-tickets${
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

  console.log("Support Tickets Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to fetch support tickets");
  }

  return response;
}

export const useFetchSupportTickets = (
  params = {},
  searchQuery = null,
  statusFilter = null,
  ticketId = null
) => {
  const authToken = useSelector((state) => state.Auth?.token);

  // Build query params only with non-null values
  const buildQueryParams = (pageParam) => {
    const queryParams = {
      per_page: params.per_page || 100,
      page: pageParam,
    };

    if (searchQuery) {
      queryParams.search = searchQuery;
    }
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
    queryKey: [
      "supportTickets",
      authToken,
      searchQuery,
      statusFilter,
      ticketId,
    ],
    queryFn: ({ pageParam = 1 }) =>
      fetchSupportTickets(buildQueryParams(pageParam), authToken),
    enabled: !!authToken,
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.data?.meta;
      if (meta && meta.current_page < meta.last_page) {
        return meta.current_page + 1;
      } else {
        return undefined;
      }
    },
    select: (data) => {
      const allTickets = data.pages.flatMap((page) => page.data.tickets);
      const meta = data.pages[data.pages.length - 1]?.data?.meta || {};
      const finalData = { tickets: allTickets, meta };
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
// 2. FETCH SINGLE SUPPORT TICKET BY ID (Non-paginated)
// ============================================================================

async function fetchSingleSupportTicket(ticketId, authToken) {
  const output = await fetch(
    `${BACKEND_API_URL}/v1/business/support-tickets?ticket_id=${ticketId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  const response = await output.json();

  console.log("Single Support Ticket Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to fetch support ticket");
  }

  return response.data?.tickets?.[0] || null;
}

export const useFetchSingleSupportTicket = (ticketId) => {
  const authToken = useSelector((state) => state.Auth?.token);

  const { isPending, error, data, isError, isSuccess, refetch } = useQuery({
    queryKey: ["supportTicket", ticketId, authToken],
    queryFn: () => fetchSingleSupportTicket(ticketId, authToken),
    enabled: !!authToken && !!ticketId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { isPending, error, data, isError, isSuccess, refetch };
};

// ============================================================================
// 3. CREATE SUPPORT TICKET
// ============================================================================

async function createSupportTicket(formData, authToken) {
  const output = await fetch(`${BACKEND_API_URL}/v1/business/support-tickets`, {
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
      `Unexpected response from server (status ${output.status})`
    );
  }

  console.log("Create Support Ticket Response:", response);

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to create support ticket");
  }

  return response;
}

export const useCreateSupportTicket = () => {
  const authToken = useSelector((state) => state.Auth?.token);

  const { isPending, error, mutate, reset, isError, isSuccess, data } =
    useMutation({
      mutationFn: (ticketData) => {
        const formData = new FormData();

        // Append ticket data
        formData.append("subject", ticketData.subject);
        formData.append("description", ticketData.description);
        formData.append("email", ticketData.email);
        formData.append("mobile", ticketData.mobile);

        // Append media if present
        if (ticketData.media) {
          formData.append("media", {
            uri: ticketData.media,
            type: "image/jpeg",
            name: `ticket_media_${Date.now()}.jpg`,
          });
        }

        return createSupportTicket(formData, authToken);
      },
    });

  return { isPending, error, mutate, reset, isError, isSuccess, data };
};

// ============================================================================
// 4. CANCEL SUPPORT TICKET
// ============================================================================

async function cancelSupportTicket(ticketId, authToken) {
  const output = await fetch(
    `${BACKEND_API_URL}/v1/business/support-tickets/${ticketId}/cancel`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  const response = await output.json();

  if (response.status_code !== 1) {
    throw new Error(response.message || "Failed to cancel support ticket");
  }

  return response;
}

export const useCancelSupportTicket = () => {
  const authToken = useSelector((state) => state.Auth?.token);
  const queryClient = useQueryClient();

  const { isPending, error, mutate, reset, isError, isSuccess, data } =
    useMutation({
      mutationFn: (ticketId) => cancelSupportTicket(ticketId, authToken),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["supportTickets"] });
      },
    });

  return { isPending, error, mutate, reset, isError, isSuccess, data };
};
