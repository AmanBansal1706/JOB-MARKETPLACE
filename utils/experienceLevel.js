const EXPERIENCE_LEVEL_LABELS = {
  beginner: "Beginner (1-2 Years)",
  intermediate: "Intermediate (3-5 Years)",
  expert: "Expert (5+ years)",
};

export const formatExperienceLevel = (value, fallback = "N/A") => {
  if (!value || typeof value !== "string") return fallback;

  const normalizedValue = value.trim().toLowerCase();
  return EXPERIENCE_LEVEL_LABELS[normalizedValue] || value;
};

export default formatExperienceLevel;
