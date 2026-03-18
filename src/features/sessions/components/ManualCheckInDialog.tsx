/**
 * Manual Check-in Dialog — host manually checks in a student.
 * Search student list, select, and confirm check-in.
 */

import { useState, useMemo, startTransition } from "react";
import { useTranslation } from "react-i18next";
import { Search, UserCheck, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useStudentStore } from "../../courses/store/student.store";
import { useSessionStore } from "../../courses/store/session.store";
import { CHECKIN_METHODS } from "@/config/constants";

interface ManualCheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  sessionId: string;
}

export function ManualCheckInDialog({
  open,
  onOpenChange,
  courseId,
  sessionId,
}: ManualCheckInDialogProps) {
  const { t } = useTranslation();
  const students = useStudentStore((s) => s.students);
  const checkUncheck = useSessionStore((s) => s.checkUncheck);

  const [searchTerm, setSearchTerm] = useState("");
  const [checkingId, setCheckingId] = useState<string | null>(null);

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    const term = searchTerm.toLowerCase();
    return students.filter(
      (s) =>
        s.name?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term) ||
        s.studentId?.toLowerCase().includes(term),
    );
  }, [students, searchTerm]);

  async function handleCheckIn(studentId: string) {
    setCheckingId(studentId);
    try {
      const student = students.find((s) => s.id === studentId);
      await checkUncheck({
        courseId,
        sessionId,
        checkin: true,
        attendeeid: studentId,
        method: CHECKIN_METHODS.MANUAL,
        code: "MANUAL",
        icon: 0,
        name: student?.name,
        email: student?.email,
        attendee_manual: student?.attendee_manual,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to check in student:", error);
    } finally {
      setCheckingId(null);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setSearchTerm("");
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>
            {t("manual-checkin - title") || "Manual Check-in"}
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => startTransition(() => setSearchTerm(e.target.value))}
            placeholder="Search by name, email, or ID..."
            className="pl-9"
            autoFocus
          />
        </div>

        {/* Student list */}
        <div className="max-h-[300px] overflow-y-auto border rounded-md">
          {filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <p className="text-sm text-gray-500">
                {students.length === 0
                  ? "No students enrolled"
                  : "No matching students"}
              </p>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <button
                key={student.id}
                onClick={() => handleCheckIn(student.id)}
                disabled={checkingId === student.id}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-gray-50 transition-colors",
                  "border-b border-gray-100 last:border-b-0",
                )}
              >
                <div
                  className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-sm font-medium text-white"
                  style={{ backgroundColor: "#0277bd" }}
                >
                  {(student.name || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">
                    {student.name}
                  </div>
                  {student.email && (
                    <div className="text-xs text-gray-500 truncate">
                      {student.email}
                    </div>
                  )}
                </div>
                {checkingId === student.id ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                ) : (
                  <UserCheck className="h-4 w-4 text-gray-400" />
                )}
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
