/**
 * First Time Intro Dialog — onboarding welcome dialog with intro video.
 * Shown to new users on first login.
 *
 * Source: old FirstTimeIntroDialog.js (104 lines) → ~70 lines.
 */

import { useTranslation } from "react-i18next";
import { FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FirstTimeIntroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FirstTimeIntroDialog({
  open,
  onOpenChange,
  onDone,
}: FirstTimeIntroDialogProps) {
  const { t } = useTranslation();

  function handleNext() {
    onDone();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {t("first-time - title") || "Welcome to ezcheck.me! 🎉"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-gray-600 text-center">
            {t("first-time - text1") ||
              "Watch this short video to learn how to get started:"}
          </p>

          {/* Vimeo embed */}
          <div
            className="relative rounded-xl overflow-hidden bg-gray-900"
            style={{ paddingBottom: "56.25%" }}
          >
            <iframe
              title="How does it work"
              src="https://player.vimeo.com/video/463712945?autoplay=0"
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <a
            href="/help/EZCheck.me_Help_and_FAQs-en.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-link transition-colors"
          >
            <FileText className="h-4 w-4" />
            {t("first-time - printable instructions") || "Printable instructions"}
          </a>
          <Button
            onClick={handleNext}
            className="bg-link hover:bg-link/90 text-white"
          >
            {t("first-time - next") || "Next"} →
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
