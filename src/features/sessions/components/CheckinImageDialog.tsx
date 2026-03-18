/**
 * Check-in Image Dialog — shows attendee's check-in selfie photo.
 * Replaces old CheckinImageDialog.js (21 lines).
 */

import { format } from "date-fns";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface CheckinImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  date: string | number | Date;
}

export function CheckinImageDialog({
  open,
  onOpenChange,
  imageUrl,
  date,
}: CheckinImageDialogProps) {
  const formattedDate = date
    ? format(new Date(date), "MMMM dd yyyy HH:mm")
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-black/95">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 z-10 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center">
          {formattedDate && (
            <div className="w-full px-4 py-3 bg-black/80 text-white text-sm">
              <span className="font-semibold mr-1">Taken on:</span>
              {formattedDate}
            </div>
          )}
          <img
            src={imageUrl}
            alt="Check-in selfie"
            className="max-w-full max-h-[70vh] object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
