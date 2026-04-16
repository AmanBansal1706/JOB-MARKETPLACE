/**
 * Job Form Validation Utilities
 * Extracted from JobPostForm for better code organization
 */

export const validateJobForm = (
  formData,
  setAlert,
  customPosition = "",
  customResponsibilities = [],
  translate,
) => {
  const translateValue = (key, fallback) =>
    typeof translate === "function" ? translate(key) || fallback : fallback;
  const alertTitle = translateValue(
    "jobs.validationAlertTitle",
    "Validation Error",
  );
  const {
    jobTitle,
    jobDescription,
    position,
    selectedSkills,
    selectedResponsibilities,
    experienceLevel,
    numWorkers,
    scheduleType,
    startDate,
    endDate,
    joiningTime,
    finishTime,
    slots,
    workLocation,
    locationLat,
    locationLng,
    paymentMode,
    payRate,
    termsAccepted,
  } = formData;

  if (!jobTitle?.trim()) {
    setAlert(
      alertTitle,
      translateValue(
        "jobs.validationJobTitleRequired",
        "Please enter a job title",
      ),
    );
    return false;
  }
  if (!jobDescription?.trim()) {
    setAlert(
      alertTitle,
      translateValue(
        "jobs.validationJobDescriptionRequired",
        "Please enter a job description",
      ),
    );
    return false;
  }
  if (!position?.trim()) {
    setAlert(
      alertTitle,
      translateValue(
        "jobs.validationPositionRequired",
        "Please enter a position",
      ),
    );
    return false;
  }
  // Validate custom position if "Other" is selected
  if (position === "Other" && !customPosition?.trim()) {
    setAlert(
      alertTitle,
      translateValue(
        "jobs.validationCustomPositionRequired",
        "Please enter a custom position",
      ),
    );
    return false;
  }
  // if (selectedSkills.length === 0) {
  //   setAlert("Validation Error", "Please select at least one skill");
  //   return false;
  // }
  // Validate responsibilities: either select from dropdown or enter custom array for "Other" position
  if (position === "Other") {
    if (
      !Array.isArray(customResponsibilities) ||
      customResponsibilities.length === 0
    ) {
      setAlert(
        alertTitle,
        translateValue(
          "jobs.validationCustomResponsibilityRequired",
          "Please add at least one custom responsibility",
        ),
      );
      return false;
    }
  } else {
    if (selectedResponsibilities.length === 0) {
      setAlert(
        alertTitle,
        translateValue(
          "jobs.validationResponsibilityRequired",
          "Please select at least one responsibility",
        ),
      );
      return false;
    }
  }
  if (!experienceLevel) {
    setAlert(
      alertTitle,
      translateValue(
        "jobs.validationExperienceRequired",
        "Please select experience level",
      ),
    );
    return false;
  }
  if (!numWorkers || Number(numWorkers) < 1) {
    setAlert(
      alertTitle,
      translateValue(
        "jobs.validationWorkersRequired",
        "Please enter number of workers needed",
      ),
    );
    return false;
  }
  if (!scheduleType) {
    setAlert(
      alertTitle,
      translateValue(
        "jobs.validationScheduleTypeRequired",
        "Please select schedule type",
      ),
    );
    return false;
  }
  if (scheduleType === "same") {
    if (!startDate || !endDate) {
      setAlert(
        alertTitle,
        translateValue(
          "jobs.validationStartEndDateRequired",
          "Please select start and end dates",
        ),
      );
      return false;
    }
    if (!joiningTime || !finishTime) {
      setAlert(
        alertTitle,
        translateValue(
          "jobs.validationJoiningFinishRequired",
          "Please select joining and finish times",
        ),
      );
      return false;
    }
    // Validate end date is not before start date
    const startDateOnly = new Date(startDate);
    startDateOnly.setHours(0, 0, 0, 0);
    const endDateOnly = new Date(endDate);
    endDateOnly.setHours(0, 0, 0, 0);
    if (endDateOnly < startDateOnly) {
      setAlert(
        alertTitle,
        translateValue(
          "jobs.validationEndDateBeforeStart",
          "End date cannot be before start date",
        ),
      );
      return false;
    }
    // Overnight shifts (finish < join on same date) are allowed — no check needed
  } else if (scheduleType === "different") {
    if (slots.length === 0) {
      setAlert(
        alertTitle,
        translateValue(
          "jobs.validationSlotRequired",
          "Please add at least one time slot",
        ),
      );
      return false;
    }
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      if (
        !slot.start_date ||
        !slot.end_date ||
        !slot.joining_time ||
        !slot.finish_time
      ) {
        setAlert(
          alertTitle,
          translateValue(
            "jobs.validationSlotFieldsRequired",
            `Please fill all fields in Slot ${i + 1}`,
          ).replace("{slot}", i + 1),
        );
        return false;
      }
      // Validate end date is not before start date for each slot
      const slotStartDateOnly = new Date(slot.start_date);
      slotStartDateOnly.setHours(0, 0, 0, 0);
      const slotEndDateOnly = new Date(slot.end_date);
      slotEndDateOnly.setHours(0, 0, 0, 0);
      if (slotEndDateOnly < slotStartDateOnly) {
        setAlert(
          alertTitle,
          translateValue(
            "jobs.validationSlotEndDateBeforeStart",
            `End date cannot be before start date in Slot ${i + 1}`,
          ).replace("{slot}", i + 1),
        );
        return false;
      }
      // Overnight shifts (finish < join on same date) are allowed — no per-slot check needed

      // Validate break time for each slot (if shift > 6 hours, break >= 30 mins)
      // Use time-component arithmetic to correctly handle overnight shifts
      const slotJoinMins =
        new Date(slot.joining_time).getHours() * 60 +
        new Date(slot.joining_time).getMinutes();
      const slotFinishMins =
        new Date(slot.finish_time).getHours() * 60 +
        new Date(slot.finish_time).getMinutes();
      let slotDurationMins = slotFinishMins - slotJoinMins;
      if (slotDurationMins < 0) slotDurationMins += 24 * 60; // overnight crossing
      const slotHours = slotDurationMins / 60;
      const slotBreaks = parseInt(slot.break_time, 10) || 0;
      if (slotHours > 6 && slotBreaks < 30) {
        setAlert(
          alertTitle,
          translateValue(
            "jobs.validationSlotBreakRequired",
            `Slot ${i + 1} exceeds 6 hours and requires a minimum 30-minute break`,
          ).replace("{slot}", i + 1),
        );
        return false;
      }
    }
  }
  if (!workLocation) {
    setAlert(
      alertTitle,
      translateValue(
        "jobs.validationWorkLocationRequired",
        "Please select work location",
      ),
    );
    return false;
  }
  // if (!workLocation || !locationLat || !locationLng) {
  //   setAlert("Validation Error", "Please select work location");
  //   return false;
  // }
  // Validate address details are present
  if (
    !formData.addressDetails?.colonia ||
    !formData.addressDetails?.postalCode ||
    !formData.addressDetails?.city ||
    !formData.addressDetails?.state
  ) {
    setAlert(
      alertTitle,
      translateValue(
        "jobs.validationAddressRequired",
        "Please complete all required location fields (Colonia, Postal Code, City, State)",
      ),
    );
    return false;
  }
  if (!paymentMode) {
    setAlert(
      alertTitle,
      translateValue(
        "jobs.validationPaymentModeRequired",
        "Please select payment mode",
      ),
    );
    return false;
  }
  if (!payRate || Number(payRate) < 1) {
    setAlert(
      alertTitle,
      translateValue(
        "jobs.validationPayRateRequired",
        "Please enter a valid pay rate",
      ),
    );
    return false;
  }
  if (!termsAccepted) {
    setAlert(
      alertTitle,
      translateValue(
        "jobs.validationTermsRequired",
        "Please accept Terms & Conditions",
      ),
    );
    return false;
  }
  return true;
};

export const isFormValid = (formData) => {
  const {
    jobTitle,
    jobDescription,
    position,
    selectedSkills,
    selectedResponsibilities,
    experienceLevel,
    numWorkers,
    scheduleType,
    startDate,
    endDate,
    joiningTime,
    finishTime,
    slots,
    workLocation,
    paymentMode,
    payRate,
    termsAccepted,
  } = formData;

  if (scheduleType === "same") {
    return !!(
      jobTitle &&
      jobDescription &&
      position &&
      selectedSkills.length > 0 &&
      selectedResponsibilities.length > 0 &&
      experienceLevel &&
      numWorkers &&
      startDate &&
      endDate &&
      joiningTime &&
      finishTime &&
      workLocation &&
      paymentMode &&
      payRate &&
      termsAccepted
    );
  } else if (scheduleType === "different") {
    return !!(
      jobTitle &&
      jobDescription &&
      position &&
      selectedSkills.length > 0 &&
      selectedResponsibilities.length > 0 &&
      experienceLevel &&
      numWorkers &&
      slots.length > 0 &&
      workLocation &&
      paymentMode &&
      payRate &&
      termsAccepted
    );
  }
  return false;
};
