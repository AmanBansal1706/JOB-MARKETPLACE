import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { MaterialIcons } from "@expo/vector-icons";
import { CommonHeader, ScreenWrapper } from "../../../components/common";
import { useTranslation } from "../../../hooks/useTranslation";

// Local imports
import { colors, fonts } from "../../../theme";
import {
  formatDate,
  capitalizeFirst,
  parseTimeToDate,
  parseApiSlots,
  isCustomPosition,
  formatDateToAPI,
  formatTimeToAPI,
} from "../../../utils/jobFormatting";
import { parseDate } from "../../../utils/dateFormatting";
import {
  useFetchAllSkills,
  useFetchAllPositions,
  useCreateJob,
  useUpdateJob,
  useEstimateJobCost,
  useFetchJobById,
  useFetchAssignedWorkers,
} from "../../../services/JobServices";
import {
  FormInput,
  FormDropdown,
  FormDateTimePicker,
  ExperienceLevelSelector,
  SlotManager,
} from "../../../components/jobs";
import MultiSelectDropdown from "../../../components/jobs/MultiSelectDropdown";
import CustomAlert from "../../../components/CustomAlert";
import CustomCheckbox from "../../../components/CustomCheckbox";
import { LocationSelector } from "../../../components/profile";
import { validateJobForm } from "../../../utils/jobFormValidation";

// ==================== Constants ====================
const MINIMUM_PAY_RATE = 35;
const MINIMUM_BREAK_MINUTES = 30;
const MIN_HOURS_FOR_BREAK = 6;

/**
 * Returns today's date at midnight (00:00:00.000).
 * Used for minimumDate props on date pickers so that today is always selectable,
 * even late at night. Using raw `new Date()` includes the current time,
 * which causes the picker to reject today's date when it is past midnight
 * in the picker's internal comparison.
 */
const getStartOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const createPaymentModes = (translate) => [
  { label: translate("jobs.card"), value: "card", icon: "credit-card" },
  { label: translate("jobs.cash"), value: "cash", icon: "money" },
];

const createScheduleTypes = (translate) => [
  { label: translate("jobs.same"), value: "same" },
  { label: translate("jobs.different"), value: "different" },
];

const createPositionOptions = (positions, translate) => {
  const options =
    positions?.map((p) => ({
      label: p.name,
      value: p.name,
    })) || [];

  return [...options, { label: translate("jobs.other"), value: "Other" }];
};

// ==================== Helper Functions ====================

/**
 * Calculate duration in hours between two time objects (ignoring date)
 */
const getDurationInHours = (startTime, finishTime) => {
  if (!startTime || !finishTime) return 0;
  const start = new Date(startTime);
  const end = new Date(finishTime);

  let durationMins =
    end.getHours() * 60 +
    end.getMinutes() -
    (start.getHours() * 60 + start.getMinutes());
  if (durationMins < 0) durationMins += 24 * 60; // Handle midnight crossing

  return durationMins / 60;
};

/**
 * Calculate total hours from schedule data
 */
const calculateTotalHours = (scheduleType, joiningTime, finishTime, slots) => {
  if (scheduleType === "same") {
    if (joiningTime && finishTime) {
      return getDurationInHours(joiningTime, finishTime);
    }
  } else {
    let maxWorkerHours = 0;
    slots?.forEach((slot) => {
      if (slot.joining_time && slot.finish_time) {
        const slotHours = getDurationInHours(
          slot.joining_time,
          slot.finish_time,
        );
        maxWorkerHours = Math.max(maxWorkerHours, slotHours);
      }
    });
    return maxWorkerHours;
  }
  return 0;
};

/**
 * Validate pay rate and return warning message
 */
const getPayRateWarning = (payRate, translate) => {
  const rate = parseFloat(payRate);
  if (payRate && !isNaN(rate) && rate < MINIMUM_PAY_RATE) {
    return translate("jobs.minimumPayRateWarning");
  }
  return "";
};

/**
 * Validate break time requirements
 */
const getBreakTimeWarning = (
  breakTime,
  scheduleType,
  joiningTime,
  finishTime,
  slots,
  translate,
) => {
  const breaks = parseInt(breakTime, 10);
  const totalHours = calculateTotalHours(
    scheduleType,
    joiningTime,
    finishTime,
    slots,
  );

  if (
    totalHours > MIN_HOURS_FOR_BREAK &&
    (!breakTime || isNaN(breaks) || breaks < MINIMUM_BREAK_MINUTES)
  ) {
    return translate("jobs.minimumBreakTimeWarning");
  }
  return "";
};

/**
 * Invalidate relevant job queries
 */
const invalidateJobQueries = (queryClient) => {
  try {
    queryClient.invalidateQueries({ queryKey: ["jobsbystatus"] });
    queryClient.invalidateQueries({ queryKey: ["jobbyid"] });
    queryClient.invalidateQueries({ queryKey: ["assignedworkers"] });
    queryClient.invalidateQueries({ queryKey: ["disputes"] });
  } catch (e) {
    console.warn("Failed to invalidate queries", e);
  }
};

/**
 * Build cost estimation payload
 * Accepts both camelCase (from component state) and snake_case (from effect) property names
 */
const buildCostPayload = (scheduleData) => {
  // Support both camelCase and snake_case property names
  const payRate = scheduleData.payRate || scheduleData.pay_rate;
  const workersNeeded = scheduleData.numWorkers || scheduleData.workers_needed;
  const scheduleType = scheduleData.scheduleType || scheduleData.schedule_type;
  const startDate = scheduleData.startDate || scheduleData.start_date;
  const endDate = scheduleData.endDate || scheduleData.end_date;
  const joiningTime = scheduleData.joiningTime || scheduleData.joining_time;
  const finishTime = scheduleData.finishTime || scheduleData.finish_time;
  const slots = scheduleData.slots || [];

  if (!payRate || !workersNeeded) {
    console.warn("Missing payRate or workersNeeded");
    return null;
  }

  if (scheduleType === "same") {
    if (!startDate || !endDate || !joiningTime || !finishTime) {
      console.warn("Missing schedule data for 'same' schedule type");
      return null;
    }

    return {
      schedule_type: "same",
      start_date: formatDateToAPI(startDate),
      end_date: formatDateToAPI(endDate),
      joining_time: formatTimeToAPI(joiningTime),
      finish_time: formatTimeToAPI(finishTime),
      pay_rate: parseFloat(payRate),
      workers_needed: parseInt(workersNeeded, 10),
    };
  } else {
    if (!slots || slots.length === 0) {
      console.warn("Missing slots for 'different' schedule type");
      return null;
    }

    const validSlots = slots.every(
      (slot) =>
        slot.start_date &&
        slot.end_date &&
        slot.joining_time &&
        slot.finish_time,
    );

    if (!validSlots) {
      console.warn("Invalid slots found");
      return null;
    }

    return {
      schedule_type: "different",
      pay_rate: parseFloat(payRate),
      workers_needed: parseInt(workersNeeded, 10),
      slots: slots.map((slot) => ({
        start_date: formatDateToAPI(slot.start_date),
        end_date: formatDateToAPI(slot.end_date),
        joining_time: formatTimeToAPI(slot.joining_time),
        finish_time: formatTimeToAPI(slot.finish_time),
      })),
    };
  }
};

/**
 * Find deleted slot IDs by comparing original slots with current slots
 * Used when editing jobs with 'different' schedule type
 */
const findDeletedSlotIds = (originalSlots = [], currentSlots = []) => {
  const currentSlotIds = new Set(
    currentSlots.map((slot) => String(slot.id || slot.slot_id)),
  );
  const deletedIds = originalSlots
    .filter((slot) => !currentSlotIds.has(String(slot.id || slot.slot_id)))
    .map((slot) => slot.id || slot.slot_id)
    .filter((id) => id !== undefined && id !== null);
  return deletedIds;
};

/**
 * Find newly added slot indices by comparing original slots with current slots
 * Used when editing jobs with 'different' schedule type to identify slots without server IDs
 */
const findNewlyAddedSlots = (originalSlots = [], currentSlots = []) => {
  const originalSlotIds = new Set(
    originalSlots.map((slot) => String(slot.id || slot.slot_id)),
  );
  const newSlotIndices = currentSlots
    .map((slot, index) => ({
      index,
      slotId: slot.id || slot.slot_id,
    }))
    .filter(
      (item) =>
        !originalSlotIds.has(String(item.slotId)) ||
        item.slotId === undefined ||
        item.slotId === null,
    )
    .map((item) => item.index);
  return newSlotIndices;
};

/**
 * Convert "same" schedule type to "different" schedule type with slots
 * Creates individual slots for each worker with identical schedule
 */
const convertSameScheduleToDifferent = (formData) => {
  const numWorkersInt = parseInt(formData.numWorkers, 10) || 1;

  // Create slots array - one slot per worker with identical schedule
  const slots = Array.from({ length: numWorkersInt }, (_, i) => ({
    id: `temp_slot_${i + 1}`, // Temporary ID for new slots (will be removed in buildJobData)
    start_date: formData.startDate,
    end_date: formData.endDate,
    joining_time: formData.joiningTime,
    finish_time: formData.finishTime,
    break_time: formData.breaks || "",
  }));

  return {
    ...formData,
    scheduleType: "different",
    slots: slots,
  };
};

/**
 * Build job submission data
 */
const buildJobData = (
  formData,
  customPosition,
  customResponsibilities,
  deletedSlotIds = [],
  originalSlots = [],
) => {
  const jobData = {
    title: formData.jobTitle,
    description: formData.jobDescription,
    position:
      formData.position === "Other" ? customPosition : formData.position,
    responsibilities:
      formData.position === "Other"
        ? customResponsibilities
        : formData.selectedResponsibilities,
    responsibilities_type:
      formData.position === "Other" ? "custom" : "predefined",
    experience_level: formData.experienceLevel,
    workers_needed: parseInt(formData.numWorkers, 10),
    schedule_type: formData.scheduleType,
    location: {
      address: formData.workLocation,
      lat: formData.locationLat,
      lng: formData.locationLng,
      interior_number: formData.addressDetails.interiorNumber,
      street: formData.addressDetails.street,
      colonia: formData.addressDetails.colonia,
      postal_code: formData.addressDetails.postalCode,
      city: formData.addressDetails.city,
      state: formData.addressDetails.state,
    },
    payment_mode: formData.paymentMode,
    pay_rate: parseFloat(formData.payRate),
  };

  if (formData.scheduleType === "same") {
    jobData.start_date = formatDateToAPI(formData.startDate);
    jobData.end_date = formatDateToAPI(formData.endDate);
    jobData.joining_time = formatTimeToAPI(formData.joiningTime);
    jobData.finish_time = formatTimeToAPI(formData.finishTime);
    jobData.breaks = formData.breaks; // breaks for 'same' schedule type
  } else {
    // Find indices of newly added slots
    const newSlotIndices = findNewlyAddedSlots(originalSlots, formData.slots);

    jobData.slots = formData.slots.map((slot, index) => {
      const processedSlot = {
        ...slot,
        start_date: formatDateToAPI(slot.start_date),
        end_date: formatDateToAPI(slot.end_date),
        joining_time: formatTimeToAPI(slot.joining_time),
        finish_time: formatTimeToAPI(slot.finish_time),
        break_time: slot.break_time || "", // break_time per slot for 'different' schedule type
      };

      // Remove ID from newly added slots (they don't have server IDs yet)
      // Also remove temporary IDs created during conversion
      if (
        newSlotIndices.includes(index) ||
        String(processedSlot.id).startsWith("temp_slot_")
      ) {
        delete processedSlot.id;
        delete processedSlot.slot_id;
      }

      return processedSlot;
    });

    // Include deleted slot IDs if there are any (for edit mode)
    if (deletedSlotIds.length > 0) {
      jobData.deleted_slot_ids = deletedSlotIds;
    } else {
      jobData.deleted_slot_ids = [];
    }
  }

  return jobData;
};

// ==================== Component ====================
export default function JobPostForm() {
  const navigation = useNavigation();
  const route = useRoute();
  const { translate } = useTranslation();

  // Get options with translated labels
  const paymentModes = createPaymentModes(translate);
  const scheduleTypes = createScheduleTypes(translate);

  const { jobId, isEditing = false } = route.params || {};

  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  // ==================== API Hooks ====================
  const {
    data: jobData,
    isPending: isLoadingJob,
    error: jobError,
    refetch: refetchJob,
  } = useFetchJobById(jobId, { enabled: !!jobId && isEditing });

  const { data: assignedWorkersData, isPending: isLoadingWorkers } =
    useFetchAssignedWorkers(jobId, { enabled: !!jobId && isEditing });

  const {
    data: skillsData,
    isPending: skillsLoading,
    error: skillsError,
  } = useFetchAllSkills();
  const {
    data: positionsData,
    isPending: positionsLoading,
    error: positionsError,
  } = useFetchAllPositions();
  const { mutate: createJobMutate, isPending: creating } = useCreateJob();
  const { mutate: updateJobMutate, isPending: updating } = useUpdateJob();
  const { mutate: estimateCostMutate, isPending: estimatingCost } =
    useEstimateJobCost();

  // ==================== State - Custom Responsibilities ====================
  const [customPosition, setCustomPosition] = useState("");
  const [customResponsibilities, setCustomResponsibilities] = useState([]);
  const [currentResponsibilityInput, setCurrentResponsibilityInput] =
    useState("");

  // ==================== State - Form Data ====================
  const [formData, setFormData] = useState({
    jobTitle: "",
    jobDescription: "",
    position: "",
    selectedSkills: [],
    selectedResponsibilities: [],
    responsibilitiesType: "predefined",
    experienceLevel: "beginner",
    numWorkers: "1",
    assignedWorkers: [],
    scheduleType: "same",
    startDate: null,
    endDate: null,
    joiningTime: null,
    finishTime: null,
    slots: [],
    workLocation: "",
    locationLat: null,
    locationLng: null,
    addressDetails: {
      interiorNumber: "",
      street: "",
      colonia: "",
      postalCode: "",
      city: "",
      state: "",
    },
    paymentMode: "cash",
    payRate: "",
    breaks: "",
    termsAccepted: false,
    jobCost: 0,
    convenienceFee: 0,
    taxes: 0,
    totalCost: 0,
  });

  // ==================== State - Original Slots (for tracking deletions) ====================
  const [originalSlots, setOriginalSlots] = useState([]);

  // ==================== State - Errors & Warnings ====================
  const [errors, setErrors] = useState({});
  const [payRateWarning, setPayRateWarning] = useState("");
  const [breakTimeWarning, setBreakTimeWarning] = useState("");

  // ==================== State - Alert ====================
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
  });

  // ==================== Handlers ====================

  const showAlert = (title, message) =>
    setAlert({ visible: true, title, message });

  const createJob = (jobData) => {
    createJobMutate(jobData, {
      onSuccess: (response) => {
        invalidateJobQueries(queryClient);
        showAlert(
          translate("common.success"),
          translate("jobs.jobPostedSuccess"),
        );
        setTimeout(() => {
          navigation?.goBack();
        }, 1500);
      },
      onError: (error) => {
        showAlert(
          translate("common.error"),
          error?.message || translate("jobs.failedToCreateJob"),
        );
      },
    });
  };

  const updateJob = (params) => {
    updateJobMutate(params, {
      onSuccess: (response) => {
        invalidateJobQueries(queryClient);
        showAlert(
          translate("common.success"),
          translate("jobs.jobUpdatedSuccess"),
        );
        setTimeout(() => {
          navigation?.goBack();
        }, 1500);
      },
      onError: (error) => {
        showAlert(
          translate("common.error"),
          error?.message || translate("jobs.failedToUpdateJob"),
        );
      },
    });
  };

  const estimateCost = (scheduleData) => {
    const costPayload = buildCostPayload(scheduleData);
    if (!costPayload) return;

    estimateCostMutate(costPayload, {
      onSuccess: (response) => {
        const breakdown = response.data?.breakdown || {};
        setFormData((prev) => ({
          ...prev,
          jobCost: breakdown.job_cost || 0,
          convenienceFee: breakdown.convenience_fee || 0,
          taxes: breakdown.taxes || 0,
          totalCost: breakdown.total_cost || 0,
        }));
      },
      onError: (error) => {
        console.error("Cost estimation error:", error);
        setFormData((prev) => ({
          ...prev,
          jobCost: 0,
          convenienceFee: 0,
          taxes: 0,
          totalCost: 0,
        }));
      },
    });
  };

  const updateField = (field, value) => {
    // Log deleted slot ID when slots are updated
    if (field === "slots" && Array.isArray(value)) {
      const deletedSlot = formData.slots.find(
        (oldSlot) => !value.find((newSlot) => newSlot.id === oldSlot.id),
      );
      if (deletedSlot) {
        console.log("JobPostForm: Deleted slot with ID:", deletedSlot.id);
      }
    }

    if (field === "position") {
      setFormData((prev) => ({ ...prev, selectedResponsibilities: [] }));
      if (value !== "Other") {
        setCustomPosition("");
        setCustomResponsibilities([]);
        setCurrentResponsibilityInput("");
      }
    }

    if (field === "payRate") {
      setPayRateWarning(getPayRateWarning(value, translate));
    }

    if (field === "breaks") {
      setBreakTimeWarning(
        getBreakTimeWarning(
          value,
          formData.scheduleType,
          formData.joiningTime,
          formData.finishTime,
          formData.slots,
          translate,
        ),
      );
    }

    // Validate finish time against joining time (minimum 1 hour gap on same day)
    if (field === "finishTime" && value) {
      const isSameDay =
        formData.startDate &&
        formData.endDate &&
        formData.startDate.toDateString() === formData.endDate.toDateString();

      if (isSameDay && formData.joiningTime) {
        const joiningMins =
          new Date(formData.joiningTime).getHours() * 60 +
          new Date(formData.joiningTime).getMinutes();
        const finishMins = value.getHours() * 60 + value.getMinutes();

        if (finishMins >= joiningMins) {
          // Same-day (non-overnight) — enforce minimum 1-hour gap
          const minFinishTime = new Date(formData.joiningTime);
          minFinishTime.setHours(minFinishTime.getHours() + 1);
          if (value < minFinishTime) {
            showAlert(
              translate("common.error"),
              translate("jobs.finishTimeError"),
            );
            setFormData((prev) => ({
              ...prev,
              [field]: minFinishTime,
            }));
            return;
          }
        }
        // finishMins < joiningMins → overnight shift, allow as-is
      }
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const selectLocation = (locationData) => {
    updateField("workLocation", locationData.address);
    updateField("locationLat", locationData.lat);
    updateField("locationLng", locationData.lng);
    updateField("addressDetails", locationData.addressDetails);
  };

  const addCustomResponsibility = () => {
    const trimmed = currentResponsibilityInput.trim();
    if (!trimmed) {
      showAlert(translate("common.error"), "Please enter a responsibility");
      return;
    }
    if (customResponsibilities.includes(trimmed)) {
      showAlert(
        translate("common.error"),
        "This responsibility already exists",
      );
      return;
    }
    setCustomResponsibilities((prev) => [...prev, trimmed]);
    setCurrentResponsibilityInput("");
    if (errors.customResponsibilities) {
      setErrors((prev) => ({ ...prev, customResponsibilities: null }));
    }
  };

  const removeCustomResponsibility = (index) => {
    setCustomResponsibilities((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = () => {
    const isValid = validateJobForm(
      formData,
      showAlert,
      customPosition,
      customResponsibilities,
    );
    if (!isValid) return;

    const payRate = parseFloat(formData.payRate);
    if (payRate < MINIMUM_PAY_RATE) {
      showAlert(
        translate("common.error"),
        `${
          translate("jobs.minimumPayRateError") ||
          "Minimum hourly rate is $35/hour. Please increase the pay rate."
        }`,
      );
      return;
    }

    // Validate break time for 'same' schedule type
    if (formData.scheduleType === "same") {
      const totalHours = calculateTotalHours(
        formData.scheduleType,
        formData.joiningTime,
        formData.finishTime,
        formData.slots,
      );

      const breaks = parseInt(formData.breaks, 10) || 0;
      if (totalHours > MIN_HOURS_FOR_BREAK && breaks < MINIMUM_BREAK_MINUTES) {
        showAlert(
          translate("common.error"),
          `${
            translate("jobs.minimumBreakTimeError") ||
            "Jobs exceeding 6 hours require a minimum 30-minute break. Please increase the break time."
          }`,
        );
        return;
      }
    }

    // Validate break time for 'different' schedule type (each slot)
    if (formData.scheduleType === "different") {
      for (let i = 0; i < formData.slots.length; i++) {
        const slot = formData.slots[i];

        // Check if slot has required times set
        if (!slot.joining_time || !slot.finish_time) {
          continue; // Skip validation if times aren't set yet
        }

        // Parse break value (may be "0") and calculate slot hours
        const slotBreakRaw = slot.break_time;
        const slotBreakParsed = parseInt(slotBreakRaw, 10);
        const joining = new Date(slot.joining_time);
        const finish = new Date(slot.finish_time);
        const joinMins = joining.getHours() * 60 + joining.getMinutes();
        const finishMins = finish.getHours() * 60 + finish.getMinutes();
        let durationMins = finishMins - joinMins;
        if (durationMins < 0) durationMins += 24 * 60; // overnight crossing
        const slotHours = durationMins / 60;

        // If break is missing (undefined/null/empty) treat as not provided
        if (
          slotBreakRaw === undefined ||
          slotBreakRaw === null ||
          slotBreakRaw === ""
        ) {
          showAlert(
            translate("common.error"),
            translate("jobs.slotBreakTimeMissing") ||
              `Slot ${i + 1} requires break time. Please enter the break time for this slot.`,
          );
          return;
        }

        // If parse failed (non-numeric), show error
        if (isNaN(slotBreakParsed)) {
          showAlert(
            translate("common.error"),
            translate("jobs.enterValidBreakTime") ||
              `Please enter a valid numeric break time for slot ${i + 1}.`,
          );
          return;
        }

        // If shift exceeds threshold, break must be at least MINIMUM_BREAK_MINUTES
        if (
          slotHours > MIN_HOURS_FOR_BREAK &&
          slotBreakParsed < MINIMUM_BREAK_MINUTES
        ) {
          showAlert(
            translate("common.error"),
            `${
              translate("jobs.slotBreakTimeError") ||
              `Slot ${i + 1} exceeds ${MIN_HOURS_FOR_BREAK} hours and requires a minimum ${MINIMUM_BREAK_MINUTES}-minute break. Please increase the break time for this slot.`
            }`.replace("{slot}", i + 1),
          );
          return;
        }
      }
    }

    // Convert "same" schedule to "different" schedule with slots
    let processedFormData = formData;
    if (formData.scheduleType === "same") {
      console.log("Converting 'same' schedule to 'different' with slots...");
      processedFormData = convertSameScheduleToDifferent(formData);
      console.log("Converted slots:", processedFormData.slots);
    }

    // Calculate deleted slot IDs if editing with 'different' schedule type
    let deletedSlotIds = [];
    if (isEditing && processedFormData.scheduleType === "different") {
      console.log("Original Slots from State:", originalSlots);
      console.log("Current Form Slots:", processedFormData.slots);
      deletedSlotIds = findDeletedSlotIds(
        originalSlots,
        processedFormData.slots,
      );
      console.log("Deleted slot IDs found:", deletedSlotIds);
      if (deletedSlotIds.length > 0) {
        console.log("Found deleted slots:", deletedSlotIds);
      }
    }

    const jobData = buildJobData(
      processedFormData,
      customPosition,
      customResponsibilities,
      deletedSlotIds,
      originalSlots,
    );

    console.log("Submitting Job Data:", jobData);

    if (isEditing) {
      // Check if any workers are assigned
      const hasAssignedWorkers =
        formData.assignedWorkers && formData.assignedWorkers.length > 0;

      const confirmTitle = translate("jobs.editConfirmTitle");
      const confirmMessage = hasAssignedWorkers
        ? translate("jobs.editConfirmMessage")
        : translate("jobs.saveChangesConfirm") ||
          "Are you sure you want to save these changes?";

      Alert.alert(confirmTitle, confirmMessage, [
        { text: translate("common.cancel"), style: "cancel" },
        {
          text: translate("common.confirm"),
          onPress: () => {
            updateJob({ jobId: jobId, jobData });
          },
        },
      ]);
    } else {
      createJob(jobData);
    }
  };

  // ==================== Effects ====================

  // Initialize form data when job data is fetched (for editing mode)
  useEffect(() => {
    if (isEditing && jobData?.data && assignedWorkersData?.data) {
      const job = jobData.data;

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

      // Set custom position if applicable
      if (job.position && isCustomPosition(job.position)) {
        setCustomPosition(job.position);
      }

      // Set custom responsibilities if any
      const customResps =
        job.responsibilities?.filter((r) => r.id < 0).map((r) => r.name) || [];
      if (customResps.length > 0) {
        setCustomResponsibilities(customResps);
      }

      // Parse and store original slots for tracking deletions
      const parsedOriginalSlots = parseApiSlots(job.slots);
      setOriginalSlots(parsedOriginalSlots);

      // Update form data
      setFormData({
        jobTitle: job.title || "",
        jobDescription: job.description || "",
        position:
          job.position && isCustomPosition(job.position)
            ? "Other"
            : job.position || "",
        selectedSkills: job.skills?.map((s) => s.id) || [],
        selectedResponsibilities:
          job.responsibilities?.filter((r) => r.id > 0).map((r) => r.id) || [],
        responsibilitiesType: job.responsibilities?.some((r) => r.id < 0)
          ? "custom"
          : "predefined",
        experienceLevel: job.experience_level || "beginner",
        numWorkers: job.workers_needed?.toString() || "1",
        assignedWorkers: transformedWorkers,
        scheduleType: job.schedule_type || "same",
        startDate: job.start_date ? parseDate(job.start_date) : null,
        endDate: job.end_date ? parseDate(job.end_date) : null,
        joiningTime: parseTimeToDate(job.joining_time),
        finishTime: parseTimeToDate(job.finish_time),
        slots: parsedOriginalSlots,
        workLocation: job.location?.address || "",
        locationLat: job.location?.lat || null,
        locationLng: job.location?.lng || null,
        addressDetails: {
          interiorNumber: job.location?.interior_number || "",
          colonia: job.location?.colonia || "",
          postalCode: job.location?.postal_code || "",
          city: job.location?.city || "",
          state: job.location?.state || "",
          street: job.location?.street || "",
        },
        paymentMode: job.payment_mode || "cash",
        payRate: job.pay_rate?.toString() || "",
        breaks: job.breaks || "",
        termsAccepted: true,
        jobCost: job.job_cost || 0,
        convenienceFee: job.convenience_fee || 0,
        taxes: job.taxes || 0,
        totalCost: job.total_cost || 0,
      });
    }
  }, [isEditing, jobData, assignedWorkersData]);

  useEffect(() => {
    estimateCost({
      schedule_type: formData.scheduleType,
      start_date: formData.startDate,
      end_date: formData.endDate,
      joining_time: formData.joiningTime,
      finish_time: formData.finishTime,
      pay_rate: formData.payRate,
      workers_needed: formData.numWorkers,
      slots: formData.slots,
    });

    setBreakTimeWarning(
      getBreakTimeWarning(
        formData.breaks,
        formData.scheduleType,
        formData.joiningTime,
        formData.finishTime,
        formData.slots,
        translate,
      ),
    );
  }, [
    formData.scheduleType,
    formData.startDate,
    formData.endDate,
    formData.joiningTime,
    formData.finishTime,
    formData.payRate,
    formData.numWorkers,
    formData.slots,
  ]);

  // ==================== Derived State ====================
  // Derived positions and responsibilities
  const fetchedPositions = positionsData?.data?.positions || [];
  const positionOptions = createPositionOptions(fetchedPositions, translate);

  const skills = skillsData?.data?.skills || [];

  // Filter responsibilities based on selected position
  const responsibilities = (() => {
    if (formData.position === "Other") return [];
    const selectedPos = fetchedPositions.find(
      (p) => p.name === formData.position,
    );
    return selectedPos?.responsibilities || [];
  })();

  const isLoading = creating || updating;
  const isFetchingJobData = isEditing && (isLoadingJob || isLoadingWorkers);

  // ==================== Render ====================

  // Show loading state while fetching job data in edit mode
  if (isFetchingJobData) {
    return (
      <ScreenWrapper backgroundColor="#FFF">
        <CommonHeader
          title={translate("jobs.postJob")}
          onBackPress={() => navigation?.goBack()}
          backgroundColor={colors.tertiary}
        />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.tertiary} />
          <Text
            style={{
              marginTop: 16,
              fontFamily: fonts.medium,
              color: colors.textdark,
            }}
          >
            {translate("jobs.loadingJobDetails")}
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Show error state if job fetch failed in edit mode
  if (isEditing && jobError) {
    return (
      <ScreenWrapper backgroundColor="#FFF">
        <CommonHeader
          title={translate("jobs.postJob")}
          onBackPress={() => navigation?.goBack()}
          backgroundColor={colors.tertiary}
        />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.semiBold,
              fontSize: 16,
              color: "#F44336",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            {jobError?.message || translate("jobs.unableToFetchJobDetails")}
          </Text>
          <Pressable style={styles.submitButton} onPress={() => refetchJob()}>
            <Text style={styles.submitButtonText}>
              {translate("common.retry")}
            </Text>
          </Pressable>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper backgroundColor="#FFF">
      <CommonHeader
        title={
          isEditing ? translate("jobs.postJob") : translate("jobs.postJob")
        }
        onBackPress={() => navigation?.goBack()}
        backgroundColor={colors.tertiary}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          {
            backgroundColor: isEditing ? "#FFF" : colors.bg,
          },
        ]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              try {
                await new Promise((resolve) => setTimeout(resolve, 1000));
              } finally {
                setRefreshing(false);
              }
            }}
            tintColor={colors.tertiary}
            colors={[colors.tertiary]}
          />
        }
      >
        {isEditing && (
          <View style={styles.notification}>
            <Text style={styles.notificationText}>
              {translate("jobs.importantNotification")}
            </Text>
          </View>
        )}

        {/* Job Basic Information */}
        <FormInput
          label={translate("jobs.jobTitle")}
          value={formData.jobTitle}
          onChangeText={(v) => updateField("jobTitle", v)}
          placeholder={translate("jobs.jobTitlePlaceholder")}
          error={errors.jobTitle}
          required={true}
          showEditIcon={isEditing}
        />

        <FormInput
          label={translate("jobs.jobDescription")}
          value={formData.jobDescription}
          onChangeText={(v) => updateField("jobDescription", v)}
          placeholder={translate("jobs.describeJobResponsibilities")}
          multiline
          numberOfLines={4}
          error={errors.jobDescription}
          required={true}
          showEditIcon={isEditing}
        />

        <LocationSelector
          label={translate("common.workLocation")}
          placeholder={translate("common.selectLocation")}
          currentLocation={{
            address: formData.workLocation,
            lat: formData.locationLat,
            lng: formData.locationLng,
            addressDetails: formData.addressDetails,
          }}
          onLocationChange={selectLocation}
          isEditing={true}
          required={true}
          showEditIcon={isEditing}
        />

        {/* Job Type & Requirements */}
        <FormDropdown
          label={translate("common.position")}
          value={formData.position}
          onChange={(v) => updateField("position", v)}
          options={positionOptions}
          placeholder={translate("jobs.positionPlaceholder")}
          error={errors.position}
          required={true}
          showEditIcon={isEditing}
        />

        {formData.position === "Other" && (
          <FormInput
            label={translate("jobs.customPosition")}
            value={customPosition}
            onChangeText={setCustomPosition}
            placeholder={translate("jobs.enterCustomPosition")}
            error={errors.customPosition}
            required={true}
            containerStyle={{ marginTop: 10 }}
          />
        )}

        <ExperienceLevelSelector
          value={formData.experienceLevel}
          onChange={(v) => updateField("experienceLevel", v)}
          disabled={false}
        />

        {formData.position === "Other" ? (
          <View style={styles.customResponsibilitiesContainer}>
            <View style={styles.customResponsibilitiesHeader}>
              <Text style={styles.customResponsibilitiesLabel}>
                {translate("jobs.customResponsibilities")}
                <Text style={styles.requiredAsterisk}> *</Text>
              </Text>
            </View>

            <FormInput
              value={currentResponsibilityInput}
              onChangeText={setCurrentResponsibilityInput}
              placeholder={translate("jobs.enterCustomResponsibilities")}
              containerStyle={{ marginBottom: 0 }}
              onSubmitEditing={addCustomResponsibility}
              returnKeyType="done"
            />

            {customResponsibilities.length > 0 && (
              <View style={styles.responsibilitiesList}>
                {customResponsibilities.map((resp, index) => (
                  <View key={index} style={styles.responsibilityChip}>
                    <Text
                      style={styles.responsibilityChipText}
                      numberOfLines={2}
                    >
                      {resp}
                    </Text>
                    <Pressable
                      onPress={() => removeCustomResponsibility(index)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.chipCloseButton}
                    >
                      <MaterialIcons name="close" size={16} color="#FFF" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {errors.customResponsibilities && (
              <Text style={styles.errorText}>
                {errors.customResponsibilities}
              </Text>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.addButton,
                pressed && styles.addButtonPressed,
              ]}
              onPress={addCustomResponsibility}
            >
              <MaterialIcons name="add" size={20} color="#FFF" />
              <Text style={styles.addButtonText}>
                {translate("jobs.addResponsibility")}
              </Text>
            </Pressable>
          </View>
        ) : (
          <MultiSelectDropdown
            label={translate("jobs.responsibilitiesRequired")}
            items={responsibilities}
            selectedIds={formData.selectedResponsibilities}
            onSelectionChange={(v) =>
              updateField("selectedResponsibilities", v)
            }
            placeholder={"Select responsibilities"}
            loading={positionsLoading}
            error={positionsError?.message}
            type="responsibility"
            required={true}
            showEditIcon={isEditing}
          />
        )}

        {/* Compensation */}
        <FormInput
          label={translate("common.payRate")}
          value={formData.payRate}
          onChangeText={(v) => updateField("payRate", v)}
          placeholder={translate("jobs.enterPayRate")}
          keyboardType="numeric"
          error={errors.payRate}
          required={true}
          showEditIcon={isEditing}
        />
        {payRateWarning && (
          <Text
            style={[styles.errorText, { marginTop: -12, marginBottom: 16 }]}
          >
            {payRateWarning}
          </Text>
        )}

        <FormDropdown
          label={translate("jobs.paymentMode")}
          options={paymentModes}
          value={formData.paymentMode}
          onChange={(v) => updateField("paymentMode", v)}
          error={errors.paymentMode}
          required={true}
          showEditIcon={isEditing}
        />

        {/* Schedule */}
        <FormInput
          label={translate("jobs.totalWorkers")}
          value={formData.numWorkers}
          onChangeText={(v) => updateField("numWorkers", v)}
          placeholder={translate("jobs.enterNumWorkers")}
          keyboardType="numeric"
          error={errors.numWorkers}
          required={true}
          showEditIcon={isEditing}
        />

        {/* Schedule Type Toggle */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>
            {translate("jobs.scheduleType")}
          </Text>
          <View style={styles.toggleButtonGroup}>
            <Pressable
              style={({ pressed }) => [
                styles.toggleButton,
                formData.scheduleType === "same" && styles.toggleButtonActive,
                { opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={() => updateField("scheduleType", "same")}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  formData.scheduleType === "same" &&
                    styles.toggleButtonTextActive,
                ]}
              >
                {translate("jobs.same")}
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.toggleButton,
                formData.scheduleType === "different" &&
                  styles.toggleButtonActive,
                { opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={() => updateField("scheduleType", "different")}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  formData.scheduleType === "different" &&
                    styles.toggleButtonTextActive,
                ]}
              >
                {translate("jobs.different")}
              </Text>
            </Pressable>
          </View>
        </View>

        {formData.scheduleType === "same" ? (
          <>
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <FormDateTimePicker
                  label={translate("jobs.startDate")}
                  value={formData.startDate}
                  onChange={(v) => updateField("startDate", v)}
                  mode="date"
                  placeholder="DD-MM-YYYY"
                  error={errors.startDate}
                  required={true}
                  showEditIcon={isEditing}
                  minimumDate={getStartOfToday()}
                />
              </View>
              <View style={styles.halfWidth}>
                <FormDateTimePicker
                  label={translate("jobs.joiningTime")}
                  value={formData.joiningTime}
                  onChange={(v) => updateField("joiningTime", v)}
                  mode="time"
                  placeholder="HH:MM AM/PM"
                  error={errors.joiningTime}
                  required={true}
                  showEditIcon={isEditing}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <FormDateTimePicker
                  label={translate("jobs.endDate")}
                  value={formData.endDate}
                  onChange={(v) => updateField("endDate", v)}
                  mode="date"
                  placeholder="DD-MM-YYYY"
                  error={errors.endDate}
                  required={true}
                  showEditIcon={isEditing}
                  minimumDate={formData.startDate || getStartOfToday()}
                />
              </View>
              <View style={styles.halfWidth}>
                <FormDateTimePicker
                  label={translate("jobs.endTime")}
                  value={formData.finishTime}
                  onChange={(v) => updateField("finishTime", v)}
                  mode="time"
                  placeholder="HH:MM AM/PM"
                  error={errors.finishTime}
                  required={true}
                  showEditIcon={isEditing}
                  startDate={formData.startDate}
                  endDate={formData.endDate}
                  joiningTime={formData.joiningTime}
                />
              </View>
            </View>
          </>
        ) : (
          <SlotManager
            slots={formData.slots}
            onChange={(v) => updateField("slots", v)}
            numWorkers={formData.numWorkers}
            showAssignedWorkers={isEditing ? true : false}
            assignedWorkers={formData.assignedWorkers}
            editJobMode={isEditing ? true : false}
            jobId={isEditing ? jobId : null}
          />
        )}

        {formData.scheduleType === "same" && (
          <>
            <FormInput
              label={translate("jobs.breakTimeMin")}
              value={formData.breaks}
              onChangeText={(v) => updateField("breaks", v)}
              placeholder={translate("jobs.enterBreak")}
              error={errors.breaks}
              keyboardType="numeric"
              infoIcon={true}
              onInfoPress={() =>
                showAlert(
                  translate("jobs.breakInfoTitle"),
                  translate("jobs.breakInfoMessage"),
                )
              }
              showEditIcon={isEditing}
            />
            {breakTimeWarning && (
              <Text
                style={[styles.errorText, { marginTop: -12, marginBottom: 16 }]}
              >
                {breakTimeWarning}
              </Text>
            )}
          </>
        )}

        {/* Cost Breakdown */}
        <View style={styles.costSection}>
          {!formData.totalCost || formData.totalCost === 0 ? (
            <View style={styles.costPlaceholder}>
              <Text style={styles.costPlaceholderText}>
                {translate("jobs.fillPaymentDetails")}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>
                  {translate("jobs.totalCostToPay")}:
                </Text>
                <Text style={styles.costValue}>
                  ${formData.totalCost.toFixed(2)}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.costRow}>
                <Text style={styles.costDim}>
                  {translate("jobs.laborCost")}:
                </Text>
                <Text style={styles.costDim}>
                  ${formData.jobCost.toFixed(2)}
                </Text>
              </View>
              <View style={styles.costRow}>
                <Text style={styles.costDim}>
                  {translate("jobs.instaChambaFees")}:
                </Text>
                <Text style={styles.costDim}>
                  ${formData.convenienceFee.toFixed(2)}
                </Text>
              </View>
              <View style={styles.costRow}>
                <Text style={styles.costDim}>{translate("jobs.taxes")}:</Text>
                <Text style={styles.costDim}>${formData.taxes.toFixed(2)}</Text>
              </View>
            </>
          )}
        </View>

        {/* Terms & Conditions */}
        <View style={styles.termsContainer}>
          <CustomCheckbox
            value={formData.termsAccepted}
            onValueChange={(v) => updateField("termsAccepted", v)}
            size={24}
          />
          <Text style={styles.termsText}>
            {translate("jobs.agreeToTerms")}{" "}
            <Text
              style={styles.termsLink}
              onPress={() => navigation.navigate("TermsAndConditions")}
            >
              {translate("jobs.termsAndConditions")}
            </Text>
          </Text>
        </View>
        {errors.termsAccepted && (
          <Text style={styles.errorText}>{errors.termsAccepted}</Text>
        )}

        {/* Submit Button */}
        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            (isLoading || !formData.termsAccepted) &&
              styles.submitButtonDisabled,
            { opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={onSubmit}
          disabled={isLoading || !formData.termsAccepted}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditing
                ? translate("jobs.submitEdits")
                : translate("common.submit")}
            </Text>
          )}
        </Pressable>
      </ScrollView>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert({ ...alert, visible: false })}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  notification: {
    backgroundColor: "#FFF9C4",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  notificationText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#B28400",
    lineHeight: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  costSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 12,
  },
  costLabel: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textdark,
  },
  costValue: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.tertiary,
  },
  costDim: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: "#757575",
  },
  costPlaceholder: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  costPlaceholderText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text1,
    textAlign: "center",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 8,
  },
  termsText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.tertiary,
    marginLeft: 16,
    flex: 1,
  },
  termsLink: {
    color: colors.tertiary,
    fontFamily: fonts.semiBold,
    textDecorationLine: "underline",
  },
  submitButton: {
    backgroundColor: colors.tertiary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    backgroundColor: colors.text1,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: "#FFF",
    textTransform: "uppercase",
  },
  errorText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#F44336",
    marginTop: 4,
  },
  customResponsibilitiesContainer: {
    marginTop: 10,
    marginBottom: 16,
  },
  customResponsibilitiesHeader: {
    marginBottom: -20,
  },
  customResponsibilitiesLabel: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
  },
  requiredAsterisk: {
    color: "#F44336",
  },
  addButton: {
    backgroundColor: colors.tertiary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    marginBottom: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#FFF",
  },
  responsibilitiesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  responsibilityChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.tertiary,
    borderRadius: 24,
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    maxWidth: "100%",
  },
  responsibilityChipText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: "#FFF",
    flexShrink: 1,
  },
  chipCloseButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  // ==================== Toggle Button Styles ====================
  toggleContainer: {
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.textdark,
    marginBottom: 8,
  },
  toggleButtonGroup: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#F5F5F5",
    borderRadius: 6,
    padding: 2,
    alignSelf: "flex-start",
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "transparent",
  },
  toggleButtonActive: {
    backgroundColor: colors.tertiary,
    borderColor: colors.tertiary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButtonText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: "#757575",
    textTransform: "capitalize",
  },
  toggleButtonTextActive: {
    color: "#FFF",
  },
});
