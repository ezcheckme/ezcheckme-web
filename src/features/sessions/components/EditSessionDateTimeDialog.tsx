import { useState } from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { CalendarIcon, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Session } from "@/shared/types/session.types";
import { useSessionStore } from "@/features/courses/store/session.store";

interface EditSessionDateTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: Session | null;
  courseId: string;
}

export function EditSessionDateTimeDialog({
  open,
  onOpenChange,
  session,
  courseId,
}: EditSessionDateTimeDialogProps) {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const updateSession = useSessionStore((s) => s.updateSession);

  // Sync state when dialog opens
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevSession, setPrevSession] = useState(session);

  if (open !== prevOpen || session !== prevSession) {
    setPrevOpen(open);
    setPrevSession(session);
    if (open && session && session.begins) {
      const d = new Date(session.begins);
      setSelectedDate(format(d, "yyyy-MM-dd"));
      setSelectedTime(format(d, "HH:mm"));
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !courseId || !selectedDate || !selectedTime) return;

    try {
      // Create new date object combining date and time
      const [year, month, day] = selectedDate.split("-").map(Number);
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const updatedDate = new Date(year, month - 1, day, hours, minutes, 0, 0);

      const newBegins = updatedDate.getTime();
      const currentBegins = session.begins ?? newBegins;
      const currentEnds = session.ends ?? newBegins + 60 * 60 * 1000;
      const duration = currentEnds - currentBegins;

      await updateSession(courseId, session.id, {
        begins: newBegins,
        ends: newBegins + duration,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to edit session date time", error);
    }
  };

  if (!session) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {t("Edit Session date and time") || "Edit Session date and time"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  required
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  required
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-[#333] hover:bg-gray-100"
            >
              {t("Cancel") || "Cancel"}
            </Button>
            <Button type="submit" disabled={!selectedDate || !selectedTime}>
              {t("OK") || "OK"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
