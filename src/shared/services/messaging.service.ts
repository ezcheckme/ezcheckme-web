/**
 * Messaging service.
 * API methods for course messages.
 * Maps to legacy EZDataService messaging methods (services-layer.md §1.1).
 */

import { API_PATHS } from "@/config/constants";
import { get, post, del } from "./api-client";
import { getEffectiveHostId } from "./storage";
import type { CourseMessage } from "@/shared/types";

/** Send a message to course attendees */
export function sendMessage(
  courseId: string,
  title: string,
  message: string,
): Promise<void> {
  const hostId = getEffectiveHostId();
  return post<void>(`${API_PATHS.HOST}/send_message`, {
    courseId,
    title,
    message,
    hostId,
  });
}

/** Delete a course message */
export function deleteMessage(
  courseId: string,
  messageId: string,
): Promise<void> {
  const hostId = getEffectiveHostId();
  return del<void>(`${API_PATHS.HOST}/del_message`, {
    courseId,
    messageId,
    hostId,
  });
}

/** Get all messages for a course */
export async function getCourseMessages(
  courseId: string,
): Promise<CourseMessage[]> {
  const hostId = getEffectiveHostId();
  const response: any = await get(`${API_PATHS.HOST}/get_course_messages`, {
    courseId,
    hostId: hostId!,
  });
  // The API returns { status: 'success', result: [...] }
  return response?.result || response || [];
}

/** Get message delivery details */
export function getMessageDetails(messageId: string): Promise<unknown> {
  return get(`${API_PATHS.HOST}/get_message_details`, { messageId });
}
