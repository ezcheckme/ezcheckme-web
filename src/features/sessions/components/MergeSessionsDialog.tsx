/**
 * Merge Sessions Dialog
 * Replaces old MergeSessionsDialog.js
 * Allows hosts to combine multiple sessions together using an AND or OR strategy.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Loader2, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useSessionStore } from "../../courses/store/session.store";
import { mergeSessions } from "@/shared/services/session.service";
import type { Session } from "@/shared/types";

interface MergeSessionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  selectedSessions: Session[];
}

export function MergeSessionsDialog({
  open,
  onOpenChange,
  courseId,
  selectedSessions,
}: MergeSessionsDialogProps) {
  const { t } = useTranslation();
  const getCourseSessions = useSessionStore((s) => s.getCourseSessions);

  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<"OR" | "AND" | null>(null);
  const [step, setStep] = useState<"SELECT" | "CONFIRM">("SELECT");

  // The session to merge INTO (defaults to the oldest session selected, matching logic in legacy app)
  const sortedSessions = [...selectedSessions].sort(
    (a, b) => b.begins - a.begins,
  );
  const [targetSessionId, setTargetSessionId] = useState<string>(
    sortedSessions.length > 0
      ? sortedSessions[sortedSessions.length - 1].id
      : "",
  );

  function resetState() {
    setLoading(false);
    setMethod(null);
    setStep("SELECT");
    if (sortedSessions.length > 0) {
      setTargetSessionId(sortedSessions[sortedSessions.length - 1].id);
    }
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen && loading) return;
    if (!isOpen) resetState();
    onOpenChange(isOpen);
  }

  async function handleMerge() {
    if (!method || !targetSessionId) return;

    setLoading(true);
    try {
      await mergeSessions({
        toId: targetSessionId,
        fromIds: sortedSessions.map((s) => s.id),
        courseId,
        method: method,
      });
      // Refresh list
      await getCourseSessions(courseId);
      handleOpenChange(false);
    } catch (err) {
      console.error("Failed to merge sessions", err);
      // In a real app we'd show a toast here
      setLoading(false);
    }
  }

  if (selectedSessions.length < 2) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Merge Sessions</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center text-gray-500">
            Please select at least 2 sessions to merge.
          </div>
          <DialogFooter>
            <Button onClick={() => handleOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xl font-semibold">
            <span>Merge Sessions</span>
            {step === "SELECT" && (
              <div className="flex items-center gap-1 text-sm bg-amber-50 text-amber-600 px-2 py-1 rounded ml-2 font-medium border border-amber-200">
                <AlertTriangle className="w-4 h-4" />
                Read first!
              </div>
            )}
          </div>
        </DialogHeader>

        {step === "SELECT" ? (
          <div className="space-y-4 py-4">
            <p className="text-gray-700 font-medium">
              Select a merging method:
            </p>

            {/* Option 1: OR */}
            <div
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${method === "OR" ? "bg-gray-100 border-gray-400" : "bg-white hover:bg-gray-50"}`}
              onClick={() => setMethod("OR")}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={method === "OR"}
                  onCheckedChange={() => setMethod("OR")}
                  className="mt-1"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <strong className="text-sm">Option 1:</strong>
                    <div className="flex items-center gap-1 text-gray-400 font-mono text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500" /> +{" "}
                      <XCircle className="w-4 h-4 text-red-500" /> ={" "}
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    If an attendee checked-in to one of the sessions, she will
                    be marked as <strong className="text-black">CHECKED</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Option 2: AND */}
            <div
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${method === "AND" ? "bg-gray-100 border-gray-400" : "bg-white hover:bg-gray-50"}`}
              onClick={() => setMethod("AND")}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={method === "AND"}
                  onCheckedChange={() => setMethod("AND")}
                  className="mt-1"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <strong className="text-sm">Option 2:</strong>
                    <div className="flex items-center gap-1 text-gray-400 font-mono text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500" /> +{" "}
                      <XCircle className="w-4 h-4 text-red-500" /> ={" "}
                      <XCircle className="w-5 h-5 text-red-500" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    If an attendee hasn't checked-in into ALL the sessions, he
                    will be marked as{" "}
                    <strong className="text-black">UNCHECKED</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-2">
            <p className="font-semibold text-gray-800 mb-2">
              You are about to merge the following sessions:
            </p>
            <div className="border rounded-md overflow-hidden bg-white mb-6">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b text-gray-600">
                  <tr>
                    <th className="px-4 py-2 font-medium">Session</th>
                    <th className="px-4 py-2 font-medium">Date & Time</th>
                    <th className="px-4 py-2 font-medium">Check-ins</th>
                  </tr>
                </thead>
                <tbody className="divide-y relative">
                  {sortedSessions.map((s) => (
                    <tr
                      key={s.id}
                      className={`cursor-pointer ${targetSessionId === s.id ? "bg-blue-50" : "hover:bg-gray-50"}`}
                      onClick={() => setTargetSessionId(s.id)}
                    >
                      <td className="px-4 py-2 text-gray-800">{s.name}</td>
                      <td className="px-4 py-2 text-gray-800">
                        {format(new Date(s.begins), "MMM dd yyyy HH:mm")}
                      </td>
                      <td className="px-4 py-2 text-gray-800">
                        {(s as any).attendees?.length || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-2 bg-blue-50/50 text-xs text-blue-800 border-t">
                Click a row above to select it as the target session to merge
                into.
              </div>
            </div>

            <p className="font-semibold text-gray-800 mb-2">
              Into this session:
            </p>
            <div className="border rounded-md overflow-hidden bg-gray-100">
              <table className="w-full text-sm text-left">
                <tbody>
                  <tr className="bg-gray-200/50">
                    <td className="px-4 py-3 font-medium text-gray-800 w-1/3">
                      {
                        sortedSessions.find((s) => s.id === targetSessionId)
                          ?.name
                      }
                    </td>
                    <td className="px-4 py-3 text-gray-800 w-1/3">
                      {targetSessionId &&
                        format(
                          new Date(
                            sortedSessions.find(
                              (s) => s.id === targetSessionId,
                            )!.begins,
                          ),
                          "MMM dd yyyy HH:mm",
                        )}
                    </td>
                    <td className="px-4 py-3 text-gray-800 w-1/3 italic text-gray-500">
                      (TBD)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between items-center w-full">
          <div className="text-red-500 text-sm font-medium w-full sm:w-auto text-center sm:text-left mb-2 sm:mb-0">
            {step === "CONFIRM" &&
              "Please note - this action cannot be undone!"}
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
              className="text-[#333] hover:bg-gray-100"
            >
              {t("general - cancel") || "Cancel"}
            </Button>

            {step === "SELECT" ? (
              <Button
                className="bg-link hover:bg-link/90 text-white"
                onClick={() => setStep("CONFIRM")}
                disabled={!method}
              >
                Continue
              </Button>
            ) : (
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleMerge}
                disabled={loading || !targetSessionId}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {t("session-actions - merge sessions btn text") ||
                  "Merge Sessions"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
