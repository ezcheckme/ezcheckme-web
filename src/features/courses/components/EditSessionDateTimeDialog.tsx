/**
 * EditSessionDateTimeDialog
 * Mirrors legacy EditSessionDateTime.js.
 * Allows editing a session's date and time using native date/time inputs.
 */

import { useState } from "react";
import { format } from "date-fns";
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

interface EditSessionDateTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionBegins: number;
  sessionEnds: number;
  onSave: (begins: number, ends: number) => Promise<void>;
}

export function EditSessionDateTimeDialog({
  open,
  onOpenChange,
  sessionBegins,
  sessionEnds,
  onSave,
}: EditSessionDateTimeDialogProps) {
  const [selectedDate, setSelectedDate] = useState(new Date(sessionBegins));

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const timeStr = format(selectedDate, "HH:mm");

  const handleDateChange = (val: string) => {
    const d = new Date(val);
    d.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
    setSelectedDate(d);
  };

  const handleTimeChange = (val: string) => {
    const [h, m] = val.split(":").map(Number);
    const d = new Date(selectedDate);
    d.setHours(h, m, 0, 0);
    setSelectedDate(d);
  };

  const handleSubmit = async () => {
    const duration = sessionEnds - sessionBegins;
    const newBegins = selectedDate.getTime();
    await onSave(newBegins, newBegins + duration);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Edit Session date and time</DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 py-4">
          <div className="space-y-1.5 flex-1">
            <Label>Date</Label>
            <Input
              type="date"
              value={dateStr}
              onChange={(e) => handleDateChange(e.target.value)}
            />
          </div>
          <div className="space-y-1.5 w-28">
            <Label>Time</Label>
            <Input
              type="time"
              value={timeStr}
              onChange={(e) => handleTimeChange(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
