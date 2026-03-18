/**
 * MergeSessionsDialog
 * Mirrors legacy MergeSessionsDialog.js.
 * Two-step dialog:
 *  1. Select merge method (OR = at least one check-in, AND = all sessions required)
 *  2. Review sessions table and confirm merge
 */

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Loader2, Merge } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SessionInfo {
  _id: string;
  name: string;
  shortid: string;
  begins: number;
  attendees: unknown[];
  courseid: string;
}

interface MergeSessionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSessions: SessionInfo[];
  onMerge: (
    targetSessionId: string,
    sessionIds: string[],
    courseId: string,
    method: "AND" | "OR",
  ) => Promise<void>;
}

export function MergeSessionsDialog({
  open,
  onOpenChange,
  selectedSessions,
  onMerge,
}: MergeSessionsDialogProps) {
  const { t } = useTranslation();
  const [method, setMethod] = useState<"AND" | "OR" | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [targetIndex, setTargetIndex] = useState(selectedSessions.length - 1);

  const sortedSessions = useMemo(
    () => [...selectedSessions].sort((a, b) => b.begins - a.begins),
    [selectedSessions],
  );

  const handleSubmit = async () => {
    if (step === 1) {
      setStep(2);
      return;
    }
    // Step 2 — execute merge
    const target = sortedSessions[targetIndex];
    setLoading(true);
    await onMerge(
      target._id,
      sortedSessions.map((s) => s._id),
      sortedSessions[0].courseid,
      method!,
    );
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Merge className="w-5 h-5" />
            Merge Sessions
            {step === 1 && (
              <span className="ml-2 text-xs font-normal text-amber-600 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Read first! This cannot be undone.
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-4">
          {step === 1 && (
            <>
              <p className="text-sm font-bold">Select a merging method:</p>

              {/* Option OR */}
              <div
                onClick={() => setMethod("OR")}
                className={`cursor-pointer border rounded-lg p-4 transition-colors ${method === "OR" ? "bg-green-50 border-green-400" : "border-gray-200 hover:bg-gray-50"}`}
              >
                <p className="font-semibold text-sm">Option 1 (OR):</p>
                <p className="text-sm text-gray-600 mt-1">
                  If an attendee checked-in to <strong>one</strong> of the
                  sessions, they will be marked as <strong>CHECKED</strong>
                </p>
              </div>

              {/* Option AND */}
              <div
                onClick={() => setMethod("AND")}
                className={`cursor-pointer border rounded-lg p-4 transition-colors ${method === "AND" ? "bg-amber-50 border-amber-400" : "border-gray-200 hover:bg-gray-50"}`}
              >
                <p className="font-semibold text-sm">Option 2 (AND):</p>
                <p className="text-sm text-gray-600 mt-1">
                  If an attendee hasn&apos;t checked-in to <strong>ALL</strong>{" "}
                  the sessions, they will be marked as{" "}
                  <strong>UNCHECKED</strong>
                </p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm font-bold">
                You are about to merge the following sessions:
              </p>
              <div className="border rounded-lg overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">Session</th>
                      <th className="p-2 text-left">ID</th>
                      <th className="p-2 text-left">Date & Time</th>
                      <th className="p-2 text-right">Check-ins</th>
                      <th className="p-2 text-center">Target</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSessions.map((s, i) => (
                      <tr
                        key={s._id}
                        className={`border-t cursor-pointer ${i === targetIndex ? "bg-blue-50" : "hover:bg-gray-50"}`}
                        onClick={() => setTargetIndex(i)}
                      >
                        <td className="p-2">{s.name}</td>
                        <td className="p-2 font-mono text-xs">{s.shortid}</td>
                        <td className="p-2">
                          {format(new Date(s.begins), "MMM dd yyyy HH:mm")}
                        </td>
                        <td className="p-2 text-right">
                          {s.attendees?.length ?? 0}
                        </td>
                        <td className="p-2 text-center">
                          {i === targetIndex ? "✓" : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-amber-600 font-semibold">
                ⚠ Please note — this action cannot be undone!
              </p>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t("general - cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!method}>
            {step === 2 ? (
              <span className="flex items-center gap-2">
                <Merge className="w-4 h-4" />
                {t("session-actions - merge sessions btn text")}
              </span>
            ) : (
              "Continue"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
