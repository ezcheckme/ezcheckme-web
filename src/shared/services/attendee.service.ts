/**
 * Attendee domain service.
 * API methods for attendee registration, verification, and management.
 * Maps to legacy EZDataService attendee methods (services-layer.md §1.1).
 */

import { API_PATHS } from "@/config/constants";
import { get, post, put, del } from "./api-client";
import type {
  Student,
  CreateAttendeePayload,
  UpdateAttendeePayload,
  VerifyAttendeePayload,
  AttendeeCodePayload,
} from "@/shared/types";

/** Register a new attendee */
export function createAttendeeUser(
  props: CreateAttendeePayload,
): Promise<Student> {
  return post<Student>(API_PATHS.ATTENDEES, props);
}

/** Check if attendee email already exists */
export function checkAttendeeEmailExist(props: {
  email: string;
  firstName?: string;
  lastName?: string;
  action?: string;
}): Promise<unknown> {
  return post(API_PATHS.ATTENDEES, {
    email: props.email,
    firstName: props.firstName || "",
    lastName: props.lastName || "",
  });
}

/** Remove an attendee from a course */
export function deleteAttendeeUser(
  courseId: string,
  studentId: string,
): Promise<void> {
  return del<void>(`${API_PATHS.COURSES}/${courseId}/students/${studentId}`);
}

/** Update attendee data */
export function updateAttendee(data: UpdateAttendeePayload): Promise<Student> {
  return put<Student>(`${API_PATHS.ATTENDEES}/${data.id}`, data);
}

/** Verify attendee phone number */
export function confirmAttendee(
  payload: VerifyAttendeePayload,
): Promise<unknown> {
  return post(`${API_PATHS.ATTENDEES}/verify`, {
    _id: payload.id || null,
    code: payload.code,
    attribute: "phone",
  });
}

/**
 * Login attendee by email (signin step 1).
 * Old app sends the full state object as `code` to the verify endpoint.
 * The server extracts email from it for lookup.
 */
export function loginAttendeeByEmail(stateData: Record<string, unknown>): Promise<unknown> {
  return post(`${API_PATHS.ATTENDEES}/verify`, {
    _id: null,
    code: stateData,
    attribute: "phone",
  });
}

/** Login attendee (delegates to confirmAttendee) */
export function loginAttendee(phone: string, code: string): Promise<unknown> {
  return confirmAttendee({ id: phone, code });
}

/** Resend SMS verification code */
export function resendAttendeeCode(data: AttendeeCodePayload): Promise<void> {
  return post<void>(`${API_PATHS.ATTENDEES}/code`, data);
}

/** Resend voice verification code */
export function resendAttendeeVoiceCode(
  data: AttendeeCodePayload,
): Promise<void> {
  return post<void>(`${API_PATHS.ATTENDEES}/voice`, data);
}

/** Validate attendee before sending code */
export function trySendAttendeeCode(
  data: AttendeeCodePayload,
): Promise<unknown> {
  return post(`${API_PATHS.ATTENDEES}/trycode`, data);
}

/** Get a single attendee by ID */
export function getStudent(studentId: string): Promise<Student> {
  return get<Student>(`${API_PATHS.ATTENDEES}/${studentId}`);
}
