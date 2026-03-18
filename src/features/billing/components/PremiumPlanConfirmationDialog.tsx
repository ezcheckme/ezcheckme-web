import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PremiumPlanConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: () => void;
}

export function PremiumPlanConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
}: PremiumPlanConfirmationDialogProps) {
  const { t } = useTranslation();

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {t("Your account is now Premium")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-row items-start gap-4 py-4">
          <div className="flex-1 text-slate-700 dark:text-slate-300 space-y-4">
            <p>
              {t(
                "Thank you! Your payment info was received, and your account was upgraded to Premium.",
              )}
            </p>
            <p>
              {t("You now have the access to all EZCheck.me premium features.")}
            </p>
            <p className="text-sm text-slate-500">
              {t(
                "Billing will be done at the end of each month, according to the actual usage during the month.",
              )}
            </p>
          </div>
          <div className="w-16 h-16 shrink-0 flex items-center justify-center">
            <img
              src="/assets/images/dialogs/ribbon.png"
              alt="premium ribbon"
              className="w-12 h-12 object-contain"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleConfirm} className="min-w-[120px]">
            {t("Great!")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
