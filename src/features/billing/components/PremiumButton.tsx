/**
 * PremiumButton — Upgrade CTA
 * Mirrors legacy PremiumButton.js:
 * - Shows "CURRENT PLAN" if user already on this tier
 * - Shows "CHANGE PLAN..." if user is Premium but on a different tier
 * - Shows "UPGRADE" if user is on Standard
 * - Handles BlueSnap checkout redirect or opens ChangePlanPricingTierDialog
 *
 * Note: In the new auth store, `user` is `UserData | null` directly
 * (no `.data` wrapper like the old Redux store).
 */

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  BLUESNAP_URLS,
  PRICING_TIERS,
  PLAN_ACTIONS,
} from "../constants/billing.constants";

interface PremiumButtonProps {
  /** 0 = Classroom, 1 = Shifts, 2 = Combined/Ultimate */
  tabIndex: number;
  discountCode?: { discount: number; code: string } | null;
  /** Called when tier is being changed (opens confirmation dialog) */
  onChangeTier?: (tier: string) => void;
  /** Called to close the parent pricing dialog after redirect */
  onClose?: () => void;
  className?: string;
}

const priceTiersArray = [
  PRICING_TIERS.CLASSROOM,
  PRICING_TIERS.SHIFTS,
  PRICING_TIERS.COMBINED,
];

export function PremiumButton({
  tabIndex,
  discountCode,
  onChangeTier,
  onClose,
  className,
}: PremiumButtonProps) {
  const user = useAuthStore((s) => s.user);
  const updateUserData = useAuthStore((s) => s.updateUserData);
  const [pricingTier, setPricingTier] = useState(priceTiersArray[tabIndex]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPricingTier(priceTiersArray[tabIndex]);
  }, [tabIndex]);

  // Group members can't upgrade
  if (user?.groupmanager === false && user?.groupId) return null;

  const isProd = import.meta.env.VITE_ENV === "production";
  const bsUrl = isProd ? BLUESNAP_URLS.PROD : BLUESNAP_URLS.DEV;

  const getButtonText = (): string => {
    if (user?.groupmanager) return "";

    if (user?.plan === "Premium") {
      const currentTier = user.pricingTier || PRICING_TIERS.CLASSROOM;
      if (currentTier === pricingTier) {
        return PLAN_ACTIONS.CURRENT_PLAN;
      }
      return PLAN_ACTIONS.CHANGE_PLAN;
    }

    if (user?.plan === "Standard") {
      return PLAN_ACTIONS.UPGRADE;
    }

    return PLAN_ACTIONS.GET_STARTED;
  };

  const isCurrentPlan =
    user?.plan === "Premium" &&
    (user.pricingTier || PRICING_TIERS.CLASSROOM) === pricingTier;

  const handleClick = () => {
    if (isCurrentPlan) return;

    if (user?.plan === "Premium") {
      // Tier change
      onClose?.();
      onChangeTier?.(pricingTier);
      return;
    }

    // Standard → Premium upgrade via BlueSnap
    if (user) {
      setLoading(true);
      const updatedFields = {
        pricingTier: priceTiersArray[tabIndex],
        ...(discountCode ? { referralCode: discountCode.code } : {}),
      };
      updateUserData(updatedFields);
      window.location.assign(bsUrl + `&merchanttransactionid=${user.id}`);
    }
  };

  const buttonText = getButtonText();
  if (!buttonText) return null;

  return (
    <Button
      className={
        className ??
        (isCurrentPlan
          ? "w-full font-semibold"
          : "w-full bg-link hover:bg-link/90 text-white shadow-md font-semibold")
      }
      variant={isCurrentPlan ? "outline" : "default"}
      disabled={isCurrentPlan || loading}
      onClick={handleClick}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
      {buttonText}
    </Button>
  );
}
