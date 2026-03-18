/**
 * Message Templates Dialog
 * Displays available message templates to pre-fill the SendMessageDialog
 */

import { FileText } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const MOCK_TEMPLATES = [
  "Welcome to the course! We will begin shortly.",
  "Class is canceled today. Please check the portal for updates.",
  "Remember to check in using the EZCheck.me mobile app before the end of the session.",
  "The link for our remote session today is: [INSERT LINK]",
];

interface MessageTemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (text: string) => void;
}

export function MessageTemplatesDialog({
  open,
  onOpenChange,
  onSelectTemplate,
}: MessageTemplatesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" />
            Select Template
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 flex flex-col gap-2 max-h-[400px] overflow-y-auto">
          {MOCK_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              className="text-left w-full p-4 border rounded-lg bg-white hover:bg-gray-50 hover:border-accent transition-colors focus:outline-none focus:ring-2 focus:ring-[#0277bd]/50 text-gray-700 text-sm"
              onClick={() => {
                onSelectTemplate(tmpl);
                onOpenChange(false);
              }}
            >
              {tmpl}
            </button>
          ))}
          {MOCK_TEMPLATES.length === 0 && (
            <p className="text-gray-500 text-center py-4 text-sm">
              No templates available.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-[#333] hover:bg-gray-100">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
