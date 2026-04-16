import { BACKEND_API_URL } from "@env";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";

// ============================================================================
// FETCH TRANSACTION HISTORY WITH PAGINATION
// ============================================================================

async function fetchTransactionHistory(params = {}, authToken) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${BACKEND_API_URL}/v1/business/transactions${
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
    throw new Error(response.message || "Failed to fetch transaction history");
  }

  return response;
}

export const useFetchTransactionHistory = (
  params = {},
  startDate = null,
  endDate = null,
  searchQuery = null,
  minAmount = null,
  maxAmount = null,
  status = null,
  position = null
) => {
  const authToken = useSelector((state) => state.Auth?.token);

  // Build query params only with non-null values
  const buildQueryParams = (pageParam) => {
    const queryParams = {
      ...params,
      page: pageParam,
    };

    // Only add dates and search if they have values
    if (startDate) {
      queryParams.start_date = startDate;
    }
    if (endDate) {
      queryParams.end_date = endDate;
    }
    if (searchQuery) {
      queryParams.search = searchQuery;
    }
    if (minAmount) {
      queryParams.min_amount = minAmount;
    }
    if (maxAmount) {
      queryParams.max_amount = maxAmount;
    }
    if (status) {
      queryParams.status = status;
    }
    if (position) {
      queryParams.position = position;
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
      "transactions",
      params,
      authToken,
      startDate,
      endDate,
      searchQuery,
      minAmount,
      maxAmount,
      status,
      position,
    ],
    queryFn: ({ pageParam = 1 }) =>
      fetchTransactionHistory(buildQueryParams(pageParam), authToken),
    enabled: !!authToken,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      if (pagination.current_page < pagination.last_page) {
        return pagination.current_page + 1;
      } else {
        return undefined;
      }
    },
    select: (data) => {
      const allTransactions = data.pages.flatMap((page) => page.data.items);
      const pagination =
        data.pages[data.pages.length - 1]?.data?.pagination || {};
      const finalData = { transactions: allTransactions, pagination };
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
