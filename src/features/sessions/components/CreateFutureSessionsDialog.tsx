/**
 * Create Future Sessions Dialog
 * Replaces old CreateFutureSessionsDialog.js
 * Generates recurring weekly sessions between a date range.
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { format, addWeeks } from "date-fns";
import { Loader2, Trash2, CalendarPlus, Clock } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSessionStore } from "../../courses/store/session.store";

interface CreateFutureSessionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseDetails?: any;
}

export function CreateFutureSessionsDialog({
  open,
  onOpenChange,
  courseId,
  courseDetails,
}: CreateFutureSessionsDialogProps) {
  const { t } = useTranslation();
  const createSession = useSessionStore((s) => s.createSession);
  const getCourseSessions = useSessionStore((s) => s.getCourseSessions);

  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [time, setTime] = useState<string>("09:00");
  const [newSessions, setNewSessions] = useState<Date[]>([]);

  // Initialize dates when opened
  useEffect(() => {
    if (open) {
      const today = new Date();
      setFromDate(format(today, "yyyy-MM-dd"));
      // Default to +4 months
      const fourMonthsFromNow = new Date();
      fourMonthsFromNow.setMonth(fourMonthsFromNow.getMonth() + 4);
      setToDate(format(fourMonthsFromNow, "yyyy-MM-dd"));
      setTime("09:00");
      setLoading(false);
    }
  }, [open]);

  // Generate sessions whenever inputs change
  useEffect(() => {
    if (!fromDate || !toDate || !time) {
      setNewSessions([]);
      return;
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);
    const [hours, minutes] = time.split(":").map(Number);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      setNewSessions([]);
      return;
    }

    start.setHours(hours, minutes, 0, 0);
    end.setHours(23, 59, 59, 999); // end of that day

    const generated: Date[] = [];
    let current = new Date(start);

    while (current <= end) {
      generated.push(new Date(current));
      current = addWeeks(current, 1);
    }

    setNewSessions(generated);
  }, [fromDate, toDate, time]);

  const removeSession = (index: number) => {
    setNewSessions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (newSessions.length === 0) return;
    setLoading(true);

    const regLen = parseInt(
      localStorage.getItem("_session_registration_length_") || "7",
      10,
    );

    for (const sessionDate of newSessions) {
      const sessionData = {
        course: courseDetails || { _id: courseId, id: courseId },
        courseId,
        name: format(sessionDate, "MMM d yyyy"),
        date: sessionDate.getTime(),
        description: "",
        duration: regLen,
        icongroup: "Academy",
        ivrEnabled: courseDetails?.ivrenabled || false,
        iconQuizEnabled: courseDetails?.iconQuizEnabled !== false,
        qrinterval: courseDetails?.qrinterval || 4,
        location: courseDetails?.location || {},
        isFuture: true,
      };

      try {
        await createSession(sessionData);
      } catch (err) {
        console.warn("Failed to create future session", err);
      }
    }

    await getCourseSessions(courseId);
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CalendarPlus className="w-5 h-5 text-link" />
              Create recurring weekly sessions
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="space-y-1">
              <Label className="text-gray-600">Start Date</Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-600">End Date</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="flex items-center gap-1 text-gray-600">
                <Clock className="w-3.5 h-3.5" /> Time
              </Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-[300px] bg-gray-50 border-t border-b overflow-y-auto">
          {newSessions.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-gray-500 text-sm">
              Invalid date range. Ensure start date is before end date.
            </div>
          ) : (
            <table className="w-full text-sm text-left relative">
              <thead className="bg-gray-100 text-gray-600 sticky top-0 border-b">
                <tr>
                  <th className="px-6 py-3 font-medium w-16">#</th>
                  <th className="px-6 py-3 font-medium">Session Date</th>
                  <th className="px-6 py-3 font-medium text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {newSessions.map((session, i) => (
                  <tr key={i} className="hover:bg-gray-50 group">
                    <td className="px-6 py-3 text-gray-400 w-16">{i + 1}</td>
                    <td className="px-6 py-3 text-gray-800 font-medium">
                      {format(session, "EEEE, MMM dd, yyyy, HH:mm")}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 -mr-2"
                        onClick={() => removeSession(i)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <DialogFooter className="p-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm font-medium text-gray-700">
            You are about to create{" "}
            <span className="text-link">{newSessions.length}</span> new
            future sessions.
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-[#333] hover:bg-gray-100"
              disabled={loading}
            >
              {t("general - cancel") || "Cancel"}
            </Button>
            <Button
              className="bg-link hover:bg-link/90 text-white"
              onClick={handleCreate}
              disabled={newSessions.length === 0 || loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Create
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
