/**
 * Group/faculty management service.
 * API methods for group invitations and membership.
 * Maps to legacy EZDataService group methods (services-layer.md §1.1).
 */

import { API_PATHS } from "@/config/constants";
import { post, put } from "./api-client";

/** Invite a host to a group */
export function inviteHostToGroup(
  hostId: string,
  data: Record<string, unknown>,
): Promise<void> {
  return put<void>(`${API_PATHS.HOST}/invite_host_to_group/${hostId}`, data);
}

/** Remove a host's group invitation */
export function removeHostInviteToGroup(
  hostId: string,
  data: Record<string, unknown>,
): Promise<void> {
  return put<void>(
    `${API_PATHS.HOST}/remove_host_invite_to_group/${hostId}`,
    data,
  );
}

/** Accept a group membership invitation */
export function acceptMemberInvitationToGroup(
  groupId: string,
  user: Record<string, unknown>,
): Promise<void> {
  return post<void>(`${API_PATHS.GROUPS}/${groupId}`, {
    action: "accept",
    ...user,
  });
}

/** Remove members from an admin group */
export function removeMembersFromAdminGroup(
  groupId: string,
  members: Record<string, unknown>[],
): Promise<void> {
  return post<void>(`${API_PATHS.GROUPS}/${groupId}`, {
    action: "remove",
    members,
  });
}
