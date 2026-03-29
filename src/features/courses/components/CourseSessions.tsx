/**
 * Course Sessions tab view — exact parity with production app.
 * Table with columns: checkbox, #, Session, Label, Session ID, Date & Time,
 * Check-ins, Attendance Rate.
 *
 * Toolbar ⋮ menu: Create Future Sessions, Delete Sessions, Rename session,
 * Edit Session time, Merge Sessions (matches old app exactly).
 *
 * Source: CourseSessions.js (272 lines) + courses.style.js
 */

import { useState, useEffect, useMemo, startTransition } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCourseStore } from "../store/course.store";
import { useSessionStore } from "../store/session.store";
import { createFutureSession } from "@/shared/services/session.service";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RenameSessionDialog } from "@/features/sessions/components/RenameSessionDialog";
import { EditSessionDateTimeDialog } from "@/features/sessions/components/EditSessionDateTimeDialog";
import { CreateFutureSessionsDialog } from "./CreateFutureSessionsDialog";
import { MergeSessionsDialog } from "./MergeSessionsDialog";
import { ImportSessionsFromExcelDialog } from "./ImportSessionsFromExcelDialog";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { StartSessionDialog } from "@/features/sessions/components/StartSessionDialog";
import type { Session } from "@/shared/types/session.types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SESSION_TYPE_LIST,
  getSessionLabelType,
} from "@/config/sessionLabelTypes";

export function CourseSessions() {
  const courseId = useCourseStore((s) => s.courseId);
  const courses = useCourseStore((s) => s.courses);

  const sessions = useSessionStore((s) => s.sessions);
  const loading = useSessionStore((s) => s.loading);
  const getCourseSessions = useSessionStore((s) => s.getCourseSessions);
  const updateSession = useSessionStore((s) => s.updateSession);

  // Get the current course (same as legacy mapStateToProps)
  const course = courses?.find((c) => c.id === courseId) ?? null;

  const navigate = useNavigate();

  // --- Search state ---
  const [searchQuery, setSearchQuery] = useState("");

  // --- Pagination state ---
  const [page, setPage] = useState(0);
  const PAGE_SIZES = [25, 50, 100];
  const [pageSize, setPageSize] = useState(25);

  // --- Checkbox selection ---
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // --- Hover state for row actions ---
  const [hoveredSessionId, setHoveredSessionId] = useState<string | null>(null);

  // --- Dialog states ---
  const [sessionToRename, setSessionToRename] = useState<Session | null>(null);
  const [sessionToEditDate, setSessionToEditDate] = useState<Session | null>(
    null,
  );
  const [sessionToResume, setSessionToResume] = useState<Session | null>(null);
  const [showCreateFuture, setShowCreateFuture] = useState(false);
  const [showMergeSessions, setShowMergeSessions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showImportSessions, setShowImportSessions] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (courseId) {
      getCourseSessions(courseId);
    }
  }, [courseId, getCourseSessions]);

  // Reset selection when sessions change
  useEffect(() => {
    setSelectedIds(new Set());
  }, [sessions]);

  // --- Filtered sessions ---
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase();
    return sessions.filter(
      (s) =>
        (s.name || "").toLowerCase().includes(q) ||
        // Cast id to String to avoid crash when API returns a numeric id
        String(s.shortId ?? s.id ?? "").toLowerCase().includes(q) ||
        (s.label || "").toLowerCase().includes(q),
    );
  }, [sessions, searchQuery]);

  // --- Paged sessions ---
  const pagedSessions = useMemo(() => {
    const start = page * pageSize;
    return filteredSessions.slice(start, start + pageSize);
  }, [filteredSessions, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / pageSize));

  // Reset to page 0 when filter or page size changes
  useEffect(() => {
    setPage(0);
  }, [searchQuery, pageSize]);

  // --- Checkbox helpers ---
  const allSelected =
    filteredSessions.length > 0 &&
    filteredSessions.every((s) => selectedIds.has(s.id));
  const someSelected =
    filteredSessions.some((s) => selectedIds.has(s.id)) && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSessions.map((s) => s.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // --- Handlers ---
  const handleSessionClick = (sessionId: string) => {
    if (courseId) {
      useCourseStore.getState().setStudentId(null);
      useSessionStore.getState().selectSession(courseId, sessionId);
      navigate({
        to: "/courses/$courseId/session/$sessionId",
        params: { courseId, sessionId },
      });
    }
  };

  async function handleDeleteSessions() {
    if (!courseId || selectedIds.size === 0) return;
    setDeleteLoading(true);
    try {
      const deleteSession = useSessionStore.getState().deleteSession;
      for (const id of selectedIds) {
        await deleteSession(courseId, id);
      }
      setSelectedIds(new Set());
      setShowDeleteConfirm(false);
      // Refresh sessions
      getCourseSessions(courseId);
    } catch (err) {
      console.error("Failed to delete sessions:", err);
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleCreateFutureSessions(_dates: Date[]) {
    // The CreateFutureSessionsDialog calls onCreateSessions with dates.
    if (courseId) {
      getCourseSessions(courseId);
    }
  }

  async function handleMergeSessions(
    _targetSessionId: string,
    _sessionIds: string[],
    _mergeCourseId: string,
    _method: "AND" | "OR",
  ) {
    if (!courseId) return;
    try {
      await useSessionStore.getState().mergeSessions({
        toId: _targetSessionId,
        fromIds: _sessionIds,
        courseId: _mergeCourseId,
        method: _method,
      });
      setShowMergeSessions(false);
      setSelectedIds(new Set());
    } catch (err) {
      console.error("Failed to merge sessions:", err);
    }
  }

  // Helper: get the first selected session for rename/edit
  function getFirstSelected(): Session | null {
    for (const s of sessions) {
      if (selectedIds.has(s.id)) return s;
    }
    return null;
  }

  // Helper: get all selected sessions for merge dialog
  function getSelectedSessions() {
    return sessions
      .filter((s) => selectedIds.has(s.id))
      .map((s) => ({
        _id: s.id,
        name: s.name || `Session ${s.serialId ?? ""}`,
        shortid: s.shortId || s.id,
        begins: s.begins ?? 0,
        attendees: [],
        courseid: courseId || "",
      }));
  }

  // --- Render ---

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Skeleton toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <Skeleton width={140} height={20} borderRadius={3} />
          <Skeleton width={180} height={24} borderRadius={3} />
        </div>
        {/* Skeleton rows */}
        <div className="px-4 py-2 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4" style={{ height: 48 }}>
              <Skeleton width={16} height={16} borderRadius={3} />
              <Skeleton width={24} height={12} borderRadius={3} />
              <Skeleton width={`${18 + (i % 3) * 5}%`} height={12} borderRadius={3} />
              <Skeleton width={64} height={12} borderRadius={3} />
              <Skeleton width={72} height={12} borderRadius={3} />
              <Skeleton width={100} height={12} borderRadius={3} />
              <Skeleton width={48} height={12} borderRadius={3} />
              <Skeleton width={40} height={12} borderRadius={3} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <Calendar className="h-8 w-8 text-gray-300" />
        <p className="text-sm text-gray-500">No sessions yet</p>
        <p className="text-xs text-gray-400">
          Start a session to begin tracking attendance
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Table Header / Toolbar */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-[20px] font-semibold text-[#222]">
            Sessions ({filteredSessions.length})
          </h2>

          {/* Toolbar ⋮ menu — matches old app exactly */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
                <MoreVertical className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start">
              <DropdownMenuItem onClick={() => setShowCreateFuture(true)}>
                Create Future Sessions...
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={selectedIds.size === 0}
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Sessions...
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={selectedIds.size === 0}
                onClick={() => setSessionToRename(getFirstSelected())}
              >
                Rename session...
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={selectedIds.size === 0}
                onClick={() => setSessionToEditDate(getFirstSelected())}
              >
                Edit Session time...
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={selectedIds.size < 2}
                onClick={() => setShowMergeSessions(true)}
              >
                Merge Sessions...
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowImportSessions(true)}
              >
                Import Sessions from file...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => startTransition(() => setSearchQuery(e.target.value))}
            className="w-64 border-b border-gray-300 pb-1 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
          <Search className="absolute right-0 bottom-2 h-4 w-4 text-gray-600" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left w-12">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-2 py-3 text-left font-normal text-gray-600 w-12">
                #
              </th>
              <th className="px-4 py-3 text-left font-normal text-gray-600">
                Session
              </th>
              <th className="px-4 py-3 text-left font-normal text-gray-600">
                Label
              </th>
              <th className="px-4 py-3 text-left font-normal text-gray-600">
                Session ID
              </th>
              <th className="px-4 py-3 text-left font-normal text-gray-600">
                Date & Time
              </th>
              <th className="px-4 py-3 text-left font-normal text-gray-600">
                Check-ins
              </th>
              <th className="px-4 py-3 text-left font-normal text-gray-600">
                Attendance Rate
              </th>
              {/* Empty column for Resume session link — fixed width, always present */}
              <th style={{ width: 160 }} />
            </tr>
          </thead>
          <tbody>
            {pagedSessions.map((session) => {
              const globalIdx = filteredSessions.indexOf(session);
              // Legacy formula: Math.round(session.checkins / course.maxattendance * 100)
              const checkinCount = session.checkins ?? 0;
              const maxAttendance = course?.maxattendance ?? 0;
              const rate = maxAttendance > 0
                  ? Math.round((checkinCount / maxAttendance) * 100)
                  : 0;

              // Resolve the label type from constants (matches old app DropDownMenu behavior)
              const labelType = getSessionLabelType(session.label);

              const isChecked = selectedIds.has(session.id);

              return (
                <tr
                  key={session.id}
                  onClick={() => handleSessionClick(session.id)}
                  onMouseEnter={() => setHoveredSessionId(session.id)}
                  onMouseLeave={() => setHoveredSessionId(null)}
                  className="cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
                  style={{ height: 48 }}
                >
                  <td
                    className="px-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 cursor-pointer"
                      checked={isChecked}
                      onChange={() => toggleOne(session.id)}
                      tabIndex={-1}
                    />
                  </td>
                  <td className="px-2 text-gray-600">
                    {filteredSessions.length - globalIdx}
                  </td>
                  <td className="px-4 text-[rgba(0,0,0,0.87)]">
                    {session.name || `Session ${session.serialId ?? ""}`}
                  </td>
                  {/* Label dropdown — matches old app's DropDownMenu in CourseSessionRow.js */}
                  <td
                    className="px-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className={cn(
                            "text-left text-sm bg-transparent border-none outline-none cursor-pointer hover:underline",
                          )}
                          style={{ color: labelType.color }}
                        >
                          {labelType.label}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="min-w-[180px]">
                        {SESSION_TYPE_LIST.map((type) => (
                          <DropdownMenuItem
                            key={type.id}
                            onClick={async () => {
                              if (courseId) {
                                await updateSession(courseId, session.id, {
                                  name: session.name,
                                  label: type.id,
                                  action: "update",
                                });
                              }
                            }}
                            style={{ color: type.color }}
                          >
                            {type.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                  <td className="px-4 text-[rgba(0,0,0,0.87)]">{session.shortId || session.id}</td>
                  <td className="px-4 text-[rgba(0,0,0,0.87)]">
                    {session.begins
                      ? new Date(session.begins)
                          .toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                          .replace(/,/g, "")
                      : "—"}
                  </td>
                  <td className="px-4 text-[rgba(0,0,0,0.87)]">{checkinCount}</td>
                  <td className="px-4 text-[rgba(0,0,0,0.87)]">
                    {rate}%
                  </td>
                  {/* Resume session link — own column, visibility-based */}
                  <td style={{ width: 160, padding: '0 8px' }}>
                    <button
                      className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 whitespace-nowrap transition-opacity"
                      style={{
                        opacity: hoveredSessionId === session.id ? 1 : 0,
                        pointerEvents: hoveredSessionId === session.id ? 'auto' : 'none',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSessionToResume(session);
                      }}
                    >
                      ▶ Resume session...
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Dialogs */}
      <StartSessionDialog
        open={!!sessionToResume}
        onOpenChange={(open) => !open && setSessionToResume(null)}
        resumedSession={sessionToResume}
        onSessionStarted={(session) => {
          setSessionToResume(null);
          try {
            document.documentElement.requestFullscreen?.().catch(() => {});
          } catch { /* fullscreen not available */ }
          navigate({
            to: "/session/$shortid",
            params: { shortid: session.shortId || session.shortid || session.id },
          });
        }}
      />
      <RenameSessionDialog
        open={!!sessionToRename}
        onOpenChange={(open) => !open && setSessionToRename(null)}
        session={sessionToRename}
        courseId={courseId || ""}
      />
      <EditSessionDateTimeDialog
        open={!!sessionToEditDate}
        onOpenChange={(open) => !open && setSessionToEditDate(null)}
        session={sessionToEditDate}
        courseId={courseId || ""}
      />
      <CreateFutureSessionsDialog
        open={showCreateFuture}
        onOpenChange={setShowCreateFuture}
        onCreateSessions={handleCreateFutureSessions}
      />
      <MergeSessionsDialog
        open={showMergeSessions}
        onOpenChange={setShowMergeSessions}
        selectedSessions={getSelectedSessions()}
        onMerge={handleMergeSessions}
      />
      <ImportSessionsFromExcelDialog
        open={showImportSessions}
        onOpenChange={setShowImportSessions}
        courseName={course?.name || ""}
        onImport={async (importedSessions) => {
          if (!courseId || !course) return;
          let hasError = false;
          
          for (const s of importedSessions) {
            try {
              const sessionDate = new Date(s.date);
              const [hours, minutes, seconds = 0] = s.time.split(":").map(Number);
              sessionDate.setHours(hours, minutes, seconds);

              await createFutureSession({
                course: course,
                name: s.name,
                date: sessionDate.getTime(),
                description: "",
                duration: 7, // Default duration if reg length is missing
                icongroup: "category-academy",
                ivrEnabled: course.ivrenabled,
                iconQuizEnabled: course.iconQuizEnabled ?? true,
                qrinterval: course.qrinterval ?? 4,
                location: course.location || {},
              });
            } catch (err) {
              console.error(`Failed to import session ${s.name}:`, err);
              hasError = true;
            }
          }

          // Refresh the sessions list once after all imports
          await getCourseSessions(courseId);
          
          if (hasError) {
            // Ideally notify user, but component closes and resolves anyway
            console.warn("Some sessions failed to import.");
          }
        }}
      />
      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Sessions"
        description={`Are you sure you want to delete ${selectedIds.size} selected session(s)? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleteLoading}
        onConfirm={handleDeleteSessions}
      />

      {/* Pagination Footer */}
      <div className="flex items-center justify-end px-6 py-4 text-sm text-gray-600 border-t border-gray-200 mt-auto">
        <div className="flex items-center gap-2 mr-8">
          <span>Rows per Page</span>
          <select
            className="bg-transparent focus:outline-none"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-4">
          <span>
            {filteredSessions.length === 0
              ? "0"
              : `${page * pageSize + 1}-${Math.min((page + 1) * pageSize, filteredSessions.length)} of ${filteredSessions.length}`
            }
          </span>
          <div className="flex gap-2">
            <button
              className={cn(
                "p-1 transition-colors",
                page === 0
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-500 hover:text-gray-700 cursor-pointer",
              )}
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              className={cn(
                "p-1 transition-colors",
                page >= totalPages - 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-500 hover:text-gray-700 cursor-pointer",
              )}
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
