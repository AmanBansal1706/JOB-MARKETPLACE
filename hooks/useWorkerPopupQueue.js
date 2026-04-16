import { useFocusEffect, useNavigationState } from "@react-navigation/native";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useConfirmCashReceived } from "../services/WorkerJobServices";
import { useFetchWorkerProfile } from "../services/WorkerProfileServices";
import { useTranslation } from "./useTranslation";

/**
 * Manages the unified popup queue shown on the Home screen.
 *
 * Order per job_id:
 *   1. job_completed  (rate the job)
 *   2. cash_confirmation  (confirm cash received)
 *
 * Uses a dismissed-IDs set instead of an index so the queue stays
 * accurate when navigating away (e.g. to the rating screen) and back.
 *
 * Returns:
 *   popupVisible      – whether the modal should be open
 *   currentItem       – { type, id, data } | undefined  (item at queue[0])
 *   totalCount        – full queue length (dismissed + remaining)
 *   dismissedCount    – how many have already been handled this session
 *   isConfirmingCash  – loading state for the cash API call
 *   workerProfile     – raw profile data (needed for earnings / alert count)
 *   isProfileLoading  – profile loading state
 *   refetchProfile    – manual profile refetch
 *   handleJobRate     – (jobData, navigation) => void
 *   handleJobSkip     – () => void
 *   handleCashConfirm – (jobId) => void
 *   handleCashSkip    – () => void
 */
export function useWorkerPopupQueue() {
  const { translate } = useTranslation();

  // Determine the current screen name
  const currentScreenName = useNavigationState((state) => {
    if (!state) return null;
    let route = state.routes[state.index];
    while (route.state) {
      route = route.state.routes[route.state.index];
    }
    return route.name;
  });

  const { mutate: confirmCash, isPending: isConfirmingCash } =
    useConfirmCashReceived();

  const {
    data: workerProfile,
    isPending: isProfileLoading,
    refetch: refetchProfile,
  } = useFetchWorkerProfile();

  // IDs dismissed in this session
  const [dismissedIds, setDismissedIds] = useState(() => new Set());
  const [popupVisible, setPopupVisible] = useState(false);

  // Full queue built from server data, grouped by job_id
  const fullPopupQueue = useMemo(() => {
    if (!workerProfile) return [];

    const completedMap = new Map(
      (workerProfile?.show_popup?.job_completed?.jobs || [])
        .filter((job) => job.show_pop_up_job_completion)
        .map((job) => [job.job_id, job]),
    );

    const cashMap = new Map(
      (workerProfile?.show_popup?.cash_received_confirmation?.jobs || [])
        .filter((job) => job.show_cash_confirmation_popup)
        .map((job) => [job.job_id, job]),
    );

    const allJobIds = [...new Set([...completedMap.keys(), ...cashMap.keys()])];

    const queue = [];
    for (const jobId of allJobIds) {
      if (completedMap.has(jobId)) {
        queue.push({
          type: "job_completed",
          id: `completed-${jobId}`,
          data: completedMap.get(jobId),
        });
      }
      if (cashMap.has(jobId)) {
        queue.push({
          type: "cash_confirmation",
          id: `cash-${jobId}`,
          data: cashMap.get(jobId),
        });
      }
    }

    return queue;
  }, [workerProfile]);

  // Visible queue = full queue minus already-dismissed items
  const popupQueue = useMemo(
    () => fullPopupQueue.filter((item) => !dismissedIds.has(item.id)),
    [fullPopupQueue, dismissedIds],
  );

  // Open / close modal as the visible queue changes
  useEffect(() => {
    // Only show if we have items AND we are on the WorkerHome screen
    if (popupQueue.length === 0 || currentScreenName !== "WorkerHome") {
      if (popupVisible) {
        setPopupVisible(false);
        refetchProfile();
      }
      return;
    }
    if (!popupVisible) {
      setPopupVisible(true);
    }
  }, [popupQueue, currentScreenName]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch whenever the screen comes back into focus (e.g. after rating).
  // Clear dismissed IDs so the queue rebuilds entirely from fresh server data —
  // if the user didn't actually complete the action, the popup reappears.
  useFocusEffect(
    useCallback(() => {
      setDismissedIds(new Set());
      refetchProfile();
    }, [refetchProfile]),
  );

  // Remove the current (first) item from the visible queue
  const dismissCurrentPopup = useCallback(() => {
    const current = popupQueue[0];
    if (current) {
      setDismissedIds((prev) => new Set([...prev, current.id]));
    }
  }, [popupQueue]);

  // Dismiss all remaining items and close the modal (used by the X button)
  const closeModal = useCallback(() => {
    setDismissedIds(
      (prev) => new Set([...prev, ...popupQueue.map((i) => i.id)]),
    );
    setPopupVisible(false);
  }, [popupQueue]);

  // --- Job completed ---
  const handleJobRate = useCallback((jobData, navigation) => {
    // Only close the modal — do NOT dismiss the ID locally.
    // useFocusEffect will reset dismissedIds + refetch on return, so the
    // server is the source of truth: if they rated, the popup won't come
    // back; if they didn't, it reappears cleanly from the start.
    // Calling dismissCurrentPopup() here would cause a brief "2 of 2" flash
    // as the queue recomputes while the modal is still rendering.
    setPopupVisible(false);
    setTimeout(() => {
      navigation.navigate("WorkerJobCompletion", {
        title: jobData.job_title,
        jobId: jobData.job_id,
      });
    }, 0);
  }, []);

  const handleJobSkip = useCallback(() => {
    dismissCurrentPopup();
  }, [dismissCurrentPopup]);

  // --- Cash confirmation ---
  const handleCashConfirm = useCallback(
    (jobId) => {
      confirmCash(
        { jobId, isReceived: true },
        {
          onSuccess: () => dismissCurrentPopup(),
          onError: (error) => {
            Alert.alert(
              translate("workerCommon.error"),
              error.message || translate("workerHome.cashConfirmError"),
            );
          },
        },
      );
    },
    [confirmCash, dismissCurrentPopup, translate],
  );

  const handleCashSkip = useCallback(() => {
    const jobId = popupQueue[0]?.data?.job_id;
    confirmCash(
      { jobId, isReceived: false },
      {
        onSuccess: () => dismissCurrentPopup(),
        onError: (error) => {
          Alert.alert(
            translate("workerCommon.error"),
            error.message || translate("workerHome.cashConfirmError"),
          );
        },
      },
    );
  }, [confirmCash, popupQueue, dismissCurrentPopup, translate]);

  return {
    popupVisible,
    currentItem: popupQueue[0],
    totalCount: fullPopupQueue.length,
    dismissedCount: dismissedIds.size,
    isConfirmingCash,
    closeModal,
    workerProfile,
    isProfileLoading,
    refetchProfile,
    handleJobRate,
    handleJobSkip,
    handleCashConfirm,
    handleCashSkip,
  };
}
