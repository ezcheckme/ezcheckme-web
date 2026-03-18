import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { updateHostPricingTierSendEmail } from "@/shared/services/host.service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { PRICING_TIERS_TITLES } from "@/config/constants";

interface ChangePlanPricingTierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newTier: number;
}

export function ChangePlanPricingTierDialog({
  open,
  onOpenChange,
  newTier,
}: ChangePlanPricingTierDialogProps) {
  const { t } = useTranslation();
  const updateUserData = useAuthStore((s) => s.updateUserData);
  const [loading, setLoading] = useState(false);
  const [newTierSet, setNewTierSet] = useState(false);

  // Cast because PRICING_TIERS_TITLES is typed depending on where it comes from.
  const tierName =
    (PRICING_TIERS_TITLES as Record<number, string>)[newTier] || "Premium";

  const onSubmit = async () => {
    if (newTierSet) {
      onOpenChange(false);
      setNewTierSet(false); // Reset for next time
      return;
    }
    try {
      setLoading(true);
      await updateUserData({ pricingTier: newTier });
      await updateHostPricingTierSendEmail({ pricingTier: newTier });
      setNewTierSet(true);
    } catch (error) {
      console.error(`Error in changing plan: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen && newTierSet) {
      setNewTierSet(false); // Reset when closed
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {newTierSet ? (
              <>
                {t("Your account plan is now")} Premium {tierName}
              </>
            ) : (
              t("Upgrade Plan")
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-row items-start gap-4 py-4">
          <div className="flex-1 text-slate-700 dark:text-slate-300">
            {!newTierSet ? (
              <p>
                {t("Your account will be upgraded to")}{" "}
                <strong>Premium {tierName}</strong>.
              </p>
            ) : (
              <div className="space-y-4">
                <p>
                  {t("Thank you! Your account was upgraded to")}{" "}
                  <strong>Premium {tierName}</strong>.
                </p>
                <p>
                  {t("You now have access to all the features of")} Premium{" "}
                  {tierName}.
                </p>
                <p className="text-sm text-slate-500">
                  {t(
                    "Billing will be done at the end of each month, according to the actual usage during the month.",
                  )}
                </p>
              </div>
            )}
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
          {!newTierSet && (
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t("Cancel")}
            </Button>
          )}
          <Button
            onClick={onSubmit}
            disabled={loading}
            className="min-w-[100px]"
          >
            {loading
              ? t("Updating...")
              : newTierSet
                ? t("Great!")
                : t("Continue")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
