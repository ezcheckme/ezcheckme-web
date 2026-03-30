export function formatCheckInMethod(method?: string): string {
  if (!method) return "";
  switch (method.toUpperCase()) {
    case "QR":
      return "QR scan";
    case "MANUAL":
      return "Manual";
    case "GPS":
      return "GPS";
    case "SELFIE":
      return "Selfie";
    case "CODE":
      return "Code";
    case "LATE_REQUEST":
      return "Late check-in";
    default:
      return method;
  }
}

export type LocationStatus = "verified" | "remote" | "undetected";

export function getLocationStatus(
  location: any,
  course: any
): LocationStatus {
  if (!location) return "undetected";
  if (!location.latLng) return "undetected";
  if (isNaN(location.distance)) return "undetected";
  if (location.distance < 0) return "undetected";
  // Derive tolerance: course.fieldCheckinRadius || user.fieldCheckinRadius || 200m default
  const tolerance = course?.fieldCheckinRadius ?? 200;
  if (location.distance > tolerance) return "remote";
  return "verified";
}

export function getLocationLabel(status: LocationStatus): string {
  switch (status) {
    case "verified":
      return "Classroom";
    case "remote":
      return "Remote";
    default:
      return "";
  }
}
