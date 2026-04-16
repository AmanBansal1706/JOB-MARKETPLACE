import React, { useMemo, useState } from "react";
import { StyleSheet, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { colors } from "../../../theme";
import { CommonHeader, ScreenWrapper } from "../../../components/common";
import CustomAlert from "../../../components/CustomAlert";
import ConfirmCashPaymentModal from "../../../components/ConfirmCashPaymentModal";
import { useTranslation } from "../../../hooks/useTranslation";
import {
  useFetchJobById,
  useFetchAssignedWorkers,
  useFetchDisputesByJobId,
  useCompleteJob,
  useDeleteJob,
} from "../../../services/JobServices";
import LoadingState from "../../../components/LoadingState";
import ErrorState from "../../../components/ErrorState";
import {
  ActiveJobDetailView,
  CompletedJobDetailView,
  DisputedJobDetailView,
} from "../../../components/jobs";
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  capitalizeFirst,
  calculateShiftDuration,
  formatStatus,
} from "../../../utils/jobFormatting";

// ==================== Helper Functions ====================

/**
 * Transform API job data to screen format with all necessary computed values
 */
const transformJobDetails = (
  jobData,
  assignedWorkersData,
  disputesData,
  translate,
) => {
  if (!jobData?.data) return null;

  const job = jobData.data;
  const isScheduleSame = job.schedule_type === "same";
  const slots = job.slots || [];
  let durationStart = null;
  let durationEnd = null;

  // Calculate start and end dates
  let startDate = translate("jobs.notAvailable");
  let endDate = translate("jobs.notAvailable");
  let shiftTime = translate("jobs.notAvailable");

  if (isScheduleSame) {
    durationStart = job.start_date;
    durationEnd = job.end_date;
    startDate = formatDateTime(job.start_date, job.joining_time);
    endDate = formatDateTime(job.end_date, job.finish_time);
    shiftTime = `${calculateShiftDuration(
      job.joining_time,
      job.finish_time,
      "same",
      [],
      job.workers_needed,
      durationStart,
      durationEnd,
    )}`;
  } else if (slots.length > 0) {
    const firstSlot = slots[0];
    const lastSlot = slots[slots.length - 1];
    durationStart = firstSlot.start_date;
    durationEnd = lastSlot.end_date;
    startDate = formatDateTime(firstSlot.start_date, firstSlot.joining_time);
    endDate = formatDateTime(lastSlot.end_date, lastSlot.finish_time);
    shiftTime = `${calculateShiftDuration(
      null,
      null,
      "different",
      slots,
      1,
      durationStart,
      durationEnd,
    )}`;
  }

  // Transform assigned workers
  const transformedWorkers =
    assignedWorkersData?.data?.assigned_workers?.map((worker) => ({
      id: worker.id,
      name: `${worker.first_name} ${worker.last_name}`,
      firstName: worker.first_name,
      lastName: worker.last_name,
      profilePicture: worker.profile_picture,
      slot: worker?.slot || translate("jobs.notAvailable"),
      hired: worker?.selected_at ? formatDate(worker.selected_at) : "N/A",
      paymentMode: capitalizeFirst(job.payment_mode),
      position: worker.position || translate("jobs.worker"),
      experience: worker.experience || translate("jobs.notAvailable"),
      rating: worker.rating || 0,
      noOfReviews: worker.no_of_reviews || 0,
      bio: worker.bio || "",
      reviews: worker.reviews || [],
    })) || [];

  // Calculate review statistics
  const workersWithoutReview = transformedWorkers.filter(
    (worker) => !worker.reviews || worker.reviews.length === 0,
  );
  const reviewedWorkers =
    transformedWorkers.length - workersWithoutReview.length;

  // Get worker IDs with active disputes (pending or in_review)
  const disputes = disputesData?.data?.disputes || [];

  console.log("Disputes for job:", disputes);

  const activeDisputeWorkerIds = new Set();
  disputes.forEach((dispute) => {
    if (dispute.status === "pending" || dispute.status === "in_review") {
      dispute.workers?.forEach((worker) => {
        activeDisputeWorkerIds.add(worker.id);
      });
    }
  });

  // Filter workers without review AND without active disputes
  const workersWithoutReviewAndDisputes = workersWithoutReview.filter(
    (worker) => !activeDisputeWorkerIds.has(worker.id),
  );

  // Extract raw date/time data for calculations (for use in components like ActiveJobDetailView)
  let rawEndDate = null;
  let rawEndTime = null;
  if (isScheduleSame) {
    rawEndDate = job.end_date;
    rawEndTime = job.finish_time;
  } else if (slots.length > 0) {
    const lastSlot = slots[slots.length - 1];
    rawEndDate = lastSlot.end_date;
    rawEndTime = lastSlot.finish_time;
  }

  return {
    id: job.id,
    title: job.title || translate("jobs.notAvailable"),
    description: job.description || translate("jobs.noDescriptionProvided"),
    location: job.location || {
      address: translate("jobs.locationNotSpecified"),
    },
    position: job.position || translate("jobs.notAvailable"),
    startDate,
    endDate,
    shiftTime: job.total_hours,
    breaksTime: job.breaks || translate("jobs.notAvailable"),
    totalWorkers: job.workers_needed || 0,
    totalHours: Math.round((job.total_hours || 0) * 10) / 10,
    paymentMode: capitalizeFirst(job.payment_mode),
    postedDate: job.created_at
      ? formatDate(job.created_at)
      : translate("jobs.notAvailable"),
    status: formatStatus(job.status),
    rawStatus: job.status,
    scheduledType: job.schedule_type,
    applicantsCount: job.workers_applied,
    slots,
    assignedWorkers: transformedWorkers,
    shiftsOperated: 0,
    totalShiftsCount: slots.length || 0,
    skills: job.skills?.map((s) => s.name) || [],
    responsibilities: job.responsibilities?.map((r) => r.name) || [],
    experienceLevel: job.experience_level,
    totalCost: formatCurrency(job.total_cost),
    payRate: `${formatCurrency(job.pay_rate)}/hr`,
    jobCost: formatCurrency(job.job_cost),
    convenienceFee: formatCurrency(job.convenience_fee),
    taxes: formatCurrency(job.taxes),
    disputes: disputesData?.data?.disputes || [],
    // Raw date/time data for calculations (not formatted)
    rawEndDate,
    rawEndTime,
    reviewStats: {
      totalWorkers: transformedWorkers.length,
      reviewedWorkers: reviewedWorkers,
      pendingReviewWorkers: workersWithoutReview.length,
      workersWithoutReview: workersWithoutReview,
      workersWithoutReviewAndDisputes: workersWithoutReviewAndDisputes,
      allReviewed: workersWithoutReview.length === 0,
      someReviewed: reviewedWorkers > 0 && workersWithoutReview.length > 0,
      noneReviewed: workersWithoutReview.length === transformedWorkers.length,
    },
    reviews: job?.reviews || [],
  };
};

// ==================== Main Component ====================

/**
 * Unified Job Detail Screen
 * Handles all job statuses: active, completed, and disputed
 * Components and actions are rendered based on job status
 */
export default function UnifiedJobDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { translate } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDisputeReason, setSelectedDisputeReason] = useState("");
  const [uploadedEvidenceFiles, setUploadedEvidenceFiles] = useState([]);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showCashPaymentConfirm, setShowCashPaymentConfirm] = useState(false);
  const jobId = route.params?.jobId;
  const tab = route.params?.tab;

  // ==================== API Hooks ====================

  const {
    data: jobData,
    isPending: isLoading,
    error,
    refetch,
  } = useFetchJobById(jobId);

  const {
    data: assignedWorkersData,
    isPending: isLoadingWorkers,
    refetch: refetchWorkers,
  } = useFetchAssignedWorkers(jobId);

  const {
    data: disputesData,
    isPending: isLoadingDisputes,
    refetch: refetchDisputes,
  } = useFetchDisputesByJobId(jobId);

  const { mutate: completeJobMutate, isPending: isCompleting } =
    useCompleteJob();

  const { mutate: deleteJobMutate, isPending: isDeleting } = useDeleteJob();

  // ==================== State & Derived Data ====================

  const details = useMemo(
    () =>
      transformJobDetails(
        jobData,
        assignedWorkersData,
        disputesData,
        translate,
      ),
    [jobData, assignedWorkersData, disputesData, translate],
  );

  const isDisputed = tab === "Disputed";
  // details?.rawStatus === "disputed" ||
  // details?.rawStatus === "disputed_completed";
  const isActive = tab === "Active";
  // details?.rawStatus === "active" ||
  // details?.rawStatus === "pending";
  const isCompleted = tab === "Completed";
  // details?.rawStatus === "completed";

  const getScreenTitle = () => {
    if (isDisputed) return translate("jobs.disputedJobDetails");
    return translate("jobs.jobDetails");
  };

  const hasAssigned =
    Array.isArray(details?.assignedWorkers) &&
    details?.assignedWorkers.length > 0;

  // ==================== Handlers ====================

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const refetchPromises = [refetch(), refetchWorkers()];
      if (jobData?.data?.status === "disputed") {
        refetchPromises.push(refetchDisputes());
      }
      await Promise.all(refetchPromises);
    } finally {
      setRefreshing(false);
    }
  };

  const handleMarkAsCompleted = () => {
    navigation.navigate("SelectedWorkersListScreen", {
      jobId: details.id,
      assignedWorkers: details.assignedWorkers,
      paymentMode: details.paymentMode,
      jobTitle: details.title,
    });
  };

  const proceedWithCompleteJob = () => {
    completeJobMutate(jobId, {
      onSuccess: () => {
        if (details?.reviewStats?.workersWithoutReviewAndDisputes?.length > 0) {
          navigateToReviewWorkers();
        } else {
          Alert.alert(
            translate("common.success"),
            translate("messages.jobCompletedSuccess"),
            [
              {
                text: translate("common.ok"),
                onPress: () => {
                  navigation.goBack();
                },
              },
            ],
          );
        }
      },
      onError: (error) => {
        Alert.alert(
          translate("common.error"),
          error?.message || translate("jobs.failedToCompleteJob"),
        );
      },
    });
  };

  const handleConfirmCompleteJob = () => {
    setShowCompleteConfirm(false);
    proceedWithCompleteJob();

    // If payment mode is cash, show the cash payment confirmation modal
    // if (details?.paymentMode?.toLowerCase() === "cash") {
    //   setShowCashPaymentConfirm(true);
    // } else {
    //   // For card or other modes, proceed directly
    //   proceedWithCompleteJob();
    // }
  };

  const handleConfirmCashPaid = () => {
    setShowCashPaymentConfirm(false);
    proceedWithCompleteJob();
  };

  const handleDeleteJob = () => {
    Alert.alert(
      translate("common.delete"),
      translate("messages.deleteJobConfirm"),
      [
        {
          text: translate("common.cancel"),
          onPress: () => {},
          style: "cancel",
        },
        {
          text: translate("common.delete"),
          onPress: () => {
            deleteJobMutate(jobId, {
              onSuccess: () => {
                Alert.alert(
                  translate("common.success"),
                  translate("jobs.jobDeletedSuccess"),
                  [
                    {
                      text: translate("common.ok"),
                      onPress: () => {
                        navigation.goBack();
                      },
                    },
                  ],
                );
              },
              onError: (error) => {
                Alert.alert(
                  translate("common.error"),
                  error?.message || translate("jobs.failedToDeleteJob"),
                );
              },
            });
          },
          style: "destructive",
        },
      ],
    );
  };

  const navigateToReviewWorkers = () => {
    if (
      !details ||
      !details.reviewStats.workersWithoutReviewAndDisputes ||
      details.reviewStats.workersWithoutReviewAndDisputes.length === 0
    ) {
      return;
    }

    navigation.navigate("SubmitReview", {
      jobId: details.id,
      jobTitle: details.title,
      assignedWorkers: details.reviewStats.workersWithoutReviewAndDisputes,
      reviewMandatory: true,
      paymentMode: details.paymentMode,
    });
  };

  const handleDisputeReasonSelect = (reason) => {
    setSelectedDisputeReason(reason);
  };

  const handleUploadEvidence = () => {
    console.log("Upload evidence clicked");
  };

  const handleDownloadAgreement = () => {
    Alert.alert(
      "Upcoming feature",
      "Download agreement is coming soon (After Admin) — stay tuned! ",
      [{ text: "OK", style: "default" }],
    );
    console.log("Download agreement clicked - feature coming soon");
  };

  const handleViewWorkerProfile = (workerId) => {
    navigation.navigate("ApplicantProfile", { workerId });
  };

  // ==================== Render States ====================

  if (isLoading || isLoadingWorkers) {
    return (
      <LoadingState
        title={getScreenTitle()}
        message={translate("jobs.loadingJobDetails")}
        backgroundColor={colors.bg}
      />
    );
  }

  if (error || !details) {
    return (
      <ErrorState
        title={getScreenTitle()}
        errorMessage={
          error?.message || translate("jobs.unableToFetchJobDetails")
        }
        onRetry={() => refetch()}
      />
    );
  }

  // ==================== Render Components ====================

  const renderJobDetailView = () => {
    if (isActive) {
      return (
        <ActiveJobDetailView
          details={details}
          hasAssigned={hasAssigned}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEditJob={() =>
            navigation.navigate("JobPostForm", {
              jobId: jobId,
              isEditing: true,
            })
          }
          onDeleteJob={handleDeleteJob}
          onMarkAsCompleted={handleMarkAsCompleted}
          onViewAnalytics={() => {
            if (details.assignedWorkers.length > 0) {
              navigation.navigate("WorkerAnalyticsList", {
                workers: details.assignedWorkers,
                jobId: details.id,
              });
            }
          }}
          onRaiseDispute={() =>
            navigation.navigate("RaiseDispute", {
              workers: details.assignedWorkers,
              jobId: details.id,
            })
          }
          isDeleting={isDeleting}
          isCompleting={isCompleting}
        />
      );
    }

    if (isCompleted) {
      return (
        <CompletedJobDetailView
          details={details}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onDownloadAgreement={handleDownloadAgreement}
          onViewWorkerProfile={handleViewWorkerProfile}
        />
      );
    }

    if (isDisputed) {
      return (
        <DisputedJobDetailView
          details={details}
          disputes={details?.disputes || []}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onReasonSelect={handleDisputeReasonSelect}
          onUploadEvidence={handleUploadEvidence}
          selectedReason={selectedDisputeReason}
          uploadedFiles={uploadedEvidenceFiles}
          onMarkAsCompleted={handleMarkAsCompleted}
          isCompleting={isCompleting}
        />
      );
    }

    // Fallback to active view
    return (
      <ActiveJobDetailView
        details={details}
        hasAssigned={hasAssigned}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEditJob={() =>
          navigation.navigate("JobPostForm", {
            jobId: jobId,
            isEditing: true,
          })
        }
        onDeleteJob={handleDeleteJob}
        onMarkAsCompleted={handleMarkAsCompleted}
        onViewAnalytics={() => {
          if (details.assignedWorkers.length > 0) {
            navigation.navigate("WorkerAnalyticsList", {
              workers: details.assignedWorkers,
              jobId: details.id,
            });
          }
        }}
        onRaiseDispute={() =>
          navigation.navigate("RaiseDispute", {
            workers: details.assignedWorkers,
            jobId: details.id,
          })
        }
        isDeleting={isDeleting}
        isCompleting={isCompleting}
      />
    );
  };

  return (
    <ScreenWrapper backgroundColor={colors.bg}>
      <CommonHeader
        title={getScreenTitle()}
        onBackPress={() => navigation.goBack?.()}
        backgroundColor={colors.bg1}
      />
      {renderJobDetailView()}
      <CustomAlert
        visible={showCompleteConfirm}
        title={translate("jobs.completeJob")}
        message={translate("messages.confirmAction")}
        buttonText={translate("common.confirm")}
        secondaryButtonText={translate("common.cancel")}
        onConfirm={handleConfirmCompleteJob}
        onSecondaryClose={() => setShowCompleteConfirm(false)}
        onClose={() => setShowCompleteConfirm(false)}
      />
      <ConfirmCashPaymentModal
        visible={showCashPaymentConfirm}
        jobTitle={details?.title}
        onConfirm={handleConfirmCashPaid}
        onCancel={() => setShowCashPaymentConfirm(false)}
        onClose={() => setShowCashPaymentConfirm(false)}
        jobId={jobId}
      />
    </ScreenWrapper>
  );
}

// ==================== Styles ====================

const styles = StyleSheet.create({
  // Styles are handled by individual view components
});
