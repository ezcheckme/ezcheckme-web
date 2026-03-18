/**
 * CreateFutureSessionsDialog
 * Mirrors legacy CreateFutureSessionsDialog.js.
 * Generates weekly recurring sessions between a date range with a specified start time.
 * Shows a preview table of sessions-to-create with ability to remove individual ones.
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Trash2, Loader2 } from "lucide-react";
import { format, addWeeks } from "date-fns";
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

interface CreateFutureSessionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSessions: (sessions: Date[]) => Promise<void>;
}

export function CreateFutureSessionsDialog({
  open,
  onOpenChange,
  onCreateSessions,
}: CreateFutureSessionsDialogProps) {
  const { t } = useTranslation();
  const [creating, setCreating] = useState(false);

  // Defaults: from today 09:00, to 4 months out
  const defaultFrom = new Date();
  defaultFrom.setHours(9, 0, 0, 0);
  const defaultTo = new Date();
  defaultTo.setMonth(defaultTo.getMonth() + 4);

  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [startTime, setStartTime] = useState("09:00");
  const [sessions, setSessions] = useState<Date[]>([]);

  function generateSessions() {
    const result: Date[] = [];
    let current = new Date(fromDate);
    while (current <= toDate) {
      result.push(new Date(current));
      current = addWeeks(current, 1);
    }
    setSessions(result);
  }

  useEffect(() => {
    if (open) generateSessions();
  }, [open, fromDate, toDate]);

  const handleDelete = (index: number) => {
    setSessions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTimeChange = (time: string) => {
    setStartTime(time);
    const [hours, minutes] = time.split(":").map(Number);
    const newFrom = new Date(fromDate);
    newFrom.setHours(hours, minutes, 0, 0);
    setFromDate(newFrom);
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      await onCreateSessions(sessions);
      onOpenChange(false);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create recurring weekly sessions</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Date range + time */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label>From</Label>
              <Input
                type="date"
                value={fromDate.toISOString().split("T")[0]}
                onChange={(e) => {
                  const d = new Date(e.target.value);
                  const [h, m] = startTime.split(":").map(Number);
                  d.setHours(h, m, 0, 0);
                  setFromDate(d);
                }}
                className="w-40"
              />
            </div>
            <div className="space-y-1">
              <Label>To</Label>
              <Input
                type="date"
                value={toDate.toISOString().split("T")[0]}
                onChange={(e) => setToDate(new Date(e.target.value))}
                className="w-40"
              />
            </div>
            <div className="space-y-1">
              <Label>Start time</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-28"
              />
            </div>
            <Button variant="outline" size="sm" onClick={generateSessions}>
              Refresh
            </Button>
          </div>

          {/* Sessions preview table */}
          <div className="border rounded-lg overflow-auto max-h-[300px]">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="p-2 text-left w-10">#</th>
                  <th className="p-2 text-left">Session Date</th>
                  <th className="p-2 text-center w-20">Remove</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s, i) => (
                  <tr
                    key={i}
                    className={`border-t ${i % 2 === 0 ? "bg-gray-50/50" : ""}`}
                  >
                    <td className="p-2 text-gray-400">{i + 1}</td>
                    <td className="p-2">
                      {format(s, "EEEE, MMM dd, yyyy, HH:mm")}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleDelete(i)}
                        className="text-red-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-gray-400">
                      No sessions to create
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter className="justify-between">
          <span className="text-sm text-gray-500">
            You are about to create {sessions.length} new future sessions.
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {t("general - cancel")}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || sessions.length === 0}
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
