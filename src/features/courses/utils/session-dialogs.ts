/**
 * SessionDialogs — orchestrator utility
 * Mirrors legacy SessionDialogs.js.
 * Provides helper functions to open session-related dialogs.
 * In the new app these are simple factory functions that return dialog props.
 */

export interface SessionInfo {
  id: string;
  _id: string;
  name: string;
  shortid: string;
  begins: number;
  ends: number;
  attendees: unknown[];
  courseid: string;
}

/**
 * Get props for the delete-session confirmation dialog.
 */
export function getDeleteSessionDialogProps(
  sessions: SessionInfo[],
  selectedIds: string[],
) {
  if (selectedIds.length === 0) return null;

  const session = sessions.find((s) => s.id === selectedIds[0]);
  const title = "Delete Session";
  const content =
    selectedIds.length === 1
      ? `Are you sure you want to delete session "${session?.name || ""}"?`
      : `Are you sure you want to delete ${selectedIds.length} sessions?`;

  return { title, content };
}

/**
 * Get the session object for rename dialog.
 */
export function getRenameSessionTarget(
  sessions: SessionInfo[],
  selectedIds: string[],
): SessionInfo | null {
  if (selectedIds.length === 0) return null;
  return sessions.find((s) => s.id === selectedIds[0]) || null;
}

/**
 * Get session objects for merge dialog.
 */
export function getMergeSessionTargets(
  sessions: SessionInfo[],
  selectedIds: string[],
): SessionInfo[] {
  if (selectedIds.length < 2) return [];
  return sessions.filter((s) => selectedIds.includes(s.id));
}

/**
 * Get edit-date-time target session.
 */
export function getEditDateTimeTarget(
  sessions: SessionInfo[],
  selectedIds: string[],
): SessionInfo | null {
  if (selectedIds.length === 0) return null;
  return sessions.find((s) => s.id === selectedIds[0]) || null;
}
