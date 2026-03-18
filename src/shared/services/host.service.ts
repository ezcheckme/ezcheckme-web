/**
 * Host management service.
 * API methods for host profile, lookup, and session counter.
 * Maps to legacy EZDataService host methods (services-layer.md §1.1).
 */

import { API_PATHS, ENCRYPTION_KEYS } from "@/config/constants";
import { get, put, apiRequest } from "./api-client";
import { getEffectiveHostId } from "./storage";
import { decryptJSON } from "./crypto";

/** Get current host profile */
export function getHost(): Promise<Record<string, unknown>> {
  const hostId = getEffectiveHostId();
  return get(`${API_PATHS.HOST}/${hostId}`);
}

/** Update host profile */
export function updateHost(props: Record<string, unknown>): Promise<void> {
  const hostId = getEffectiveHostId();
  return put<void>(`${API_PATHS.HOST}/${hostId}`, props);
}

/** Find a host by email */
export function findHost(email: string): Promise<unknown> {
  return get(`${API_PATHS.HOST}/find_host`, { email });
}

/** Find an attendee by phone/email */
export function findAttendee(phone?: string, email?: string): Promise<unknown> {
  const params: Record<string, string> = {};
  if (phone) params.phone = phone;
  if (email) params.email = email;
  return get(`${API_PATHS.HOST}/find_attendee`, params);
}

/** Update host sessions counter */
export function updateHostSessionsCounter(sessionId: string): Promise<void> {
  const hostId = getEffectiveHostId();
  return put<void>(`${API_PATHS.HOST}/usc/${hostId}/${sessionId}`);
}

/** Update host pricing tier and send email */
export function updateHostPricingTierSendEmail(
  data: Record<string, unknown>,
): Promise<void> {
  const hostId = getEffectiveHostId();
  return put<void>(`${API_PATHS.HOST}/change_tier_m/${hostId}`, data);
}

/** Send invitation to demo */
export function sendInvitationToDemo(email: string): Promise<void> {
  return get<void>(`${API_PATHS.HOST}/send_invitation_to_demo`, { email });
}

/** Get blocked email domains */
export function getBlockedEmailDomains(): Promise<{
  domains: string[];
  mode: string;
}> {
  return get(`${API_PATHS.HOST}/get_bed`);
}

/** Get host notifications */
export function getNotifications(): Promise<unknown[]> {
  const hostId = getEffectiveHostId();
  return get(`${API_PATHS.HOST}/get_not`, { hostId: hostId! });
}

/** Get discount/coupon code info */
export function getDiscountCodeInfo(code: string): Promise<unknown> {
  return get(`${API_PATHS.HOST}/get_coupon_info`, { code });
}

/** Send encrypted analytics info */
export function sendInfo(data: Record<string, unknown>): Promise<void> {
  return apiRequest<void>({
    path: `${API_PATHS.HOST}/addi`,
    method: "POST",
    body: data,
    encrypt: true,
  });
}

/** Send encrypted contact form */
export function sendContactForm(form: Record<string, unknown>): Promise<void> {
  return apiRequest<void>({
    path: `${API_PATHS.OFFICE}/scf`,
    method: "POST",
    body: form,
    encrypt: true,
  });
}

/** Get config for Excel email possible titles */
export function getConfigExcelEmailPossibleTitles(): Promise<unknown> {
  return get(`${API_PATHS.CONFIG}/excel_email_titles`);
}

/** Get university data (static bundle) */
export function getUniversitiesData(): Promise<unknown[]> {
  return get(`${API_PATHS.HOST}/universities`);
}

/** Send reminder email */
export function sendReminderEmail(email: string): Promise<void> {
  return apiRequest<void>({
    path: "/admin/send_email",
    method: "POST",
    body: { email },
  });
}

/** Export Excel report (server-side) */
export function exportExcelReport(courseId: string): Promise<unknown> {
  const hostId = getEffectiveHostId();
  return get(`${API_PATHS.EXPORT}/host/${hostId}/course/${courseId}`);
}

/** Get connection data (IP, geo) from our own Lambda — response is AES-encrypted */
export async function getConnectionData(): Promise<Record<string, unknown>> {
  const response = await get<{ data: string }>(`${API_PATHS.HOST}/connection`);
  console.log('[getConnectionData] raw response:', response);
  const decrypted = decryptJSON<Record<string, unknown>>(
    response.data,
    ENCRYPTION_KEYS.INFO,
  );
  console.log('[getConnectionData] decrypted:', decrypted);
  return decrypted || {};
}
