/**
 * Message Details Dialog — shows message content, read receipts lists,
 * and a delete action. Matches legacy CourseMessages.js dialog.
 */

import { useState } from "react";
import { RefreshCw, Trash2, Users, UserX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCourseStore } from "../store/course.store";
import { useStudentStore } from "../store/student.store";

interface MessageDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: any;
  courseId: string;
  totalAttendees: number;
}

export function MessageDetailsDialog({
  open,
  onOpenChange,
  message,
  courseId,
  totalAttendees,
}: MessageDetailsDialogProps) {
  const deleteMessage = useCourseStore((s) => s.deleteMessage);
  const getCourseMessages = useCourseStore((s) => s.getCourseMessages);
  const students = useStudentStore((s) => s.students);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  if (!message) return null;

  // readBy may be an array of student IDs or objects
  const readByArray: string[] = Array.isArray(message.readBy)
    ? message.readBy.map((r: any) => (typeof r === "string" ? r : r.id || r._id || ""))
    : [];

  const readByCount = readByArray.length;
  const percentRead =
    totalAttendees > 0
      ? Math.floor((readByCount / totalAttendees) * 1000) / 10
      : 0;

  // Build viewed / not-viewed lists
  const viewedStudents = students.filter((s) =>
    readByArray.includes(s.id) || readByArray.includes((s as any)._id),
  );
  const notViewedStudents = students.filter(
    (s) => !readByArray.includes(s.id) && !readByArray.includes((s as any)._id),
  );

  const getStudentName = (student: any) =>
    student.name ||
    `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
    "Unknown";

  async function handleRefresh() {
    setRefreshing(true);
    await getCourseMessages(courseId);
    setRefreshing(false);
  }

  async function handleDelete() {
    const msgId = message._id || message.id;
    if (!msgId) return;
    setDeleting(true);
    try {
      await deleteMessage(courseId, msgId);
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to delete message:", err);
    } finally {
      setDeleting(false);
      setConfirmDeleteOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-normal">
            Message Details
          </DialogTitle>
        </DialogHeader>

        {/* Message content */}
        <div
          className="rounded bg-gray-50 p-4 text-sm text-gray-700 leading-relaxed"
          style={{ wordBreak: "break-word" }}
        >
          {message.message || ""}
        </div>

        {/* Read stats summary */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-gray-600">
            {percentRead}% of attendees viewed ({readByCount}/{totalAttendees})
          </span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Viewed list */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Viewed ({viewedStudents.length})
            </span>
          </div>
          {viewedStudents.length === 0 ? (
            <p className="text-xs text-gray-400 pl-6">
              No attendees have viewed this message yet
            </p>
          ) : (
            <div className="max-h-[120px] overflow-y-auto pl-6">
              {viewedStudents.map((s) => (
                <div
                  key={s.id}
                  className="text-sm text-gray-700 py-0.5"
                  title={`${getStudentName(s)}${(s as any).email ? ` · ${(s as any).email}` : ""}${(s as any).phone ? ` · ${(s as any).phone}` : ""}`}
                >
                  {getStudentName(s)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Not Viewed list */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <UserX className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-red-600">
              Haven't Viewed ({notViewedStudents.length})
            </span>
          </div>
          {notViewedStudents.length === 0 ? (
            <p className="text-xs text-gray-400 pl-6">
              All attendees have viewed this message
            </p>
          ) : (
            <div className="max-h-[120px] overflow-y-auto pl-6">
              {notViewedStudents.map((s) => (
                <div
                  key={s.id}
                  className="text-sm text-gray-700 py-0.5"
                  title={`${getStudentName(s)}${(s as any).email ? ` · ${(s as any).email}` : ""}${(s as any).phone ? ` · ${(s as any).phone}` : ""}`}
                >
                  {getStudentName(s)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete action */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          {confirmDeleteOpen ? (
            <div className="space-y-3">
              <p className="text-sm text-red-600 font-medium">
                Are you sure? This message will also be deleted from the
                Attendee's App.
              </p>
              <p className="text-xs text-gray-500">
                This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-1.5 rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {deleting ? "Deleting..." : "Delete"}
                </button>
                <button
                  onClick={() => setConfirmDeleteOpen(false)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDeleteOpen(true)}
              className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete this message
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
