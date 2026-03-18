/**
 * ManualCheckInDialog
 * Mirrors legacy ManualCheckIn.js.
 * Allows hosts to manually check/uncheck a student for a session,
 * and handle late check-in requests (approve/deny).
 */

import { useTranslation } from "react-i18next";
import { Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface StudentSession {
  time?: string;
  method?: string;
  request?: "pending" | "approved" | "denied";
  reason?: string;
}

interface ManualCheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  sessionName: string;
  studentSession?: StudentSession | null;
  onToggleCheckIn: (action: "check" | "uncheck" | "approve" | "deny") => void;
}

export function ManualCheckInDialog({
  open,
  onOpenChange,
  studentName,
  sessionName,
  studentSession,
  onToggleCheckIn,
}: ManualCheckInDialogProps) {
  const { t } = useTranslation();

  const isPending = studentSession?.request === "pending";
  const isDenied = studentSession?.request === "denied";
  const isChecked = !!studentSession && !isPending && !isDenied;

  const checkedType = isChecked ? "checked" : "unchecked";

  let title = "";
  if (isPending) {
    title = t("manual-checkin late checkin-title")
      .replace("{student}", studentName)
      .replace(
        "{date}",
        studentSession?.time
          ? format(new Date(studentSession.time), "d, HH:mm")
          : "",
      );
  } else {
    title = t(`manual-checkin ${checkedType}-title`)
      .replace("{student}", studentName)
      .replace("{session}", sessionName)
      .replace(
        "{date}",
        studentSession?.time
          ? format(new Date(studentSession.time), "yyyy MMM d, HH:mm")
          : "",
      )
      .replace(
        "{method}",
        studentSession?.method && !isDenied
          ? t(`check-in method ${studentSession.method.toUpperCase()}`)
          : "",
      );
  }

  const content = t(`manual-checkin ${checkedType}-content`)
    .replace("{student}", studentName)
    .replace("{session}", sessionName);

  const handleClose = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {isPending ? "Late Check-in Request" : "Manual Check-in"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <p className="text-sm text-gray-700">{title}</p>

          {isPending && studentSession?.reason && (
            <div className="space-y-1">
              <p className="text-sm text-gray-500">
                {t("manual-checkin late checkin-provided reason")}
              </p>
              <p className="text-sm font-bold">{studentSession.reason}</p>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            {isChecked ? (
              <X className="w-4 h-4 text-red-500" />
            ) : (
              <Check className="w-4 h-4 text-green-500" />
            )}
            <span>{content}</span>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>

          {isPending && (
            <Button
              variant="destructive"
              onClick={() => {
                onToggleCheckIn("deny");
                handleClose();
              }}
            >
              Deny
            </Button>
          )}

          <Button
            onClick={() => {
              if (isPending || isDenied) {
                onToggleCheckIn("approve");
              } else if (isChecked) {
                onToggleCheckIn("uncheck");
              } else {
                onToggleCheckIn("check");
              }
              handleClose();
            }}
            className={
              isPending || !isChecked
                ? "bg-green-600 hover:bg-green-700"
                : "bg-orange-500 hover:bg-orange-600"
            }
          >
            {isPending
              ? "Approve"
              : t(`manual-checkin yes ${isChecked ? "uncheck" : "check"}`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
