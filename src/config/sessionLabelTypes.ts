/**
 * Session label types — matches old app's sessionLabelTypes.js exactly.
 */

export interface SessionLabelType {
  id: string;
  label: string;
  color: string;
  isCustom: boolean;
  autoModeDisabled?: boolean;
}

export const SESSION_TYPES: Record<string, SessionLabelType> = {
  NO_LABEL: {
    id: "no_label",
    label: "No label",
    color: "#cfcfcf",
    isCustom: false,
  },
  IN_PERSON: {
    id: "in_person_session",
    label: "In-Person Session",
    color: "#000000",
    isCustom: false,
  },
  REMOTE: {
    id: "remote_lesson",
    label: "Remote Lesson",
    color: "#000000",
    isCustom: false,
  },
  HYBRID: {
    id: "hybrid_session",
    label: "Hybrid Session",
    color: "#000000",
    isCustom: false,
  },
  CONFERENCE: {
    id: "conference",
    label: "Conference",
    color: "#000000",
    isCustom: false,
  },
  SEMINAR: {
    id: "seminar",
    label: "Seminar",
    color: "#000000",
    isCustom: false,
  },
  WEBINAR: {
    id: "webinar",
    label: "Webinar",
    color: "#000000",
    isCustom: false,
  },
  GUEST_LECTURE: {
    id: "guest_lecture",
    label: "Guest Lecture",
    color: "#000000",
    isCustom: false,
  },
  FIELD_TRIP: {
    id: "field_trip",
    label: "Field Trip",
    color: "#000000",
    isCustom: false,
  },
  INACTIVE_AUTO_MODE: {
    id: "inactive_auto_mode",
    label: "Inactive in Auto Mode",
    color: "#9d0009",
    isCustom: false,
    autoModeDisabled: true,
  },
  LAB_SESSION: {
    id: "lab_session",
    label: "Lab Session",
    color: "#000000",
    isCustom: false,
  },
  WORKSHOP: {
    id: "workshop",
    label: "Workshop",
    color: "#000000",
    isCustom: false,
  },
};

/** All session types as an array for dropdown menus */
export const SESSION_TYPE_LIST = Object.values(SESSION_TYPES);

/** Find the label type matching a session's label id */
export function getSessionLabelType(labelId: string | undefined | null): SessionLabelType {
  return SESSION_TYPE_LIST.find((t) => t.id === labelId) ?? SESSION_TYPES.NO_LABEL;
}
