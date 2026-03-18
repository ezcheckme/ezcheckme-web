/**
 * FirstTimeIntroDialog
 * Mirrors legacy FirstTimeIntroDialog.js.
 * Onboarding dialog shown to new users with a Vimeo "How does it work" video
 * and a link to printable instructions.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";

interface FirstTimeIntroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}

export function FirstTimeIntroDialog({
  open,
  onOpenChange,
  onDone,
}: FirstTimeIntroDialogProps) {
  const { t } = useTranslation();

  const handleDone = () => {
    onOpenChange(false);
    onDone();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {t("first-time - title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-base text-gray-700">{t("first-time - text1")}</p>

          {/* Vimeo embed — 16:9 responsive */}
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              title="How does it work"
              src="https://player.vimeo.com/video/463712945?autoplay=0"
              className="absolute inset-0 w-full h-full rounded-lg"
              frameBorder="0"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        </div>

        <DialogFooter className="justify-between">
          <a
            href="help/EZCheck.me_Help_and_FAQs-en.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-link hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            Printable instructions
          </a>
          <Button onClick={handleDone}>Next</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
