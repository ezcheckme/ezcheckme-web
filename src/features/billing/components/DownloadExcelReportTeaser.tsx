/**
 * DownloadExcelReportTeaser
 * Mirrors legacy DownloadExcelReportTeaser.js.
 * Premium upsell dialog shown when Standard users try to download Excel reports.
 * Lists premium features, offers "GET IT FREE" via referral, and "LET'S TALK" CTA.
 */

import { useTranslation } from "react-i18next";
import { Check, Gift } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth.store";

interface DownloadExcelReportTeaserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PREMIUM_CONTACT_EMAIL =
  "mailto:info@ezcheck.me?subject=EZCheck.me%20premium%20plan&body=Hi%20there%2C%0D%0APlease%20send%20me%20details%20about%20EZCheck.me%20Premium%20Plan%0D%0A%0D%0AName%3A%0D%0ARole%3A%0D%0AInstitute%3A%0D%0AEstimated%20number%20of%20monthly%20attendees%3A%0D%0A%0D%0AThanks!%0D%0A";

const BULLET_KEYS = [
  "download excel teaser dialog - bullet 1",
  "download excel teaser dialog - bullet 7",
  "download excel teaser dialog - bullet 2",
  "download excel teaser dialog - bullet 3",
  "download excel teaser dialog - bullet 4",
  "download excel teaser dialog - bullet 5",
];

export function DownloadExcelReportTeaser({
  open,
  onOpenChange,
}: DownloadExcelReportTeaserProps) {
  const { t } = useTranslation();
  const openReferralDialog = useAuthStore((s) => s.openReferralDialog);

  const handleClose = () => onOpenChange(false);

  const handleGetItFree = () => {
    handleClose();
    setTimeout(() => openReferralDialog(), 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center text-link">
            {t("download excel teaser dialog - title")}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="flex justify-center mb-4">
            <img
              src="/assets/images/dialogs/ribbon.png"
              alt="premium ribbon"
              className="h-16"
            />
          </div>

          {BULLET_KEYS.map((key) => (
            <div
              key={key}
              className="flex items-center gap-3 text-sm text-gray-700"
            >
              <Check className="w-5 h-5 text-green-500 shrink-0" />
              <span>{t(key)}</span>
            </div>
          ))}

          <p className="text-xs text-gray-400 mt-4 pl-8">
            {t("download excel teaser dialog - in selected countries")}
          </p>
        </div>

        <DialogFooter className="flex flex-row gap-2 justify-end sm:justify-end">
          <Button variant="ghost" onClick={handleClose}>
            {t("general - cancel")}
          </Button>

          <Button
            variant="secondary"
            onClick={handleGetItFree}
            className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
          >
            <Gift className="w-4 h-4" />
            GET IT FREE
          </Button>

          <a
            href={PREMIUM_CONTACT_EMAIL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Button
              onClick={handleClose}
              className="bg-link hover:bg-link/90 text-white font-bold"
            >
              {t("download excel teaser dialog - CTA")}
            </Button>
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
