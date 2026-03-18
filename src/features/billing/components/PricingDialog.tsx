/**
 * Pricing Dialog
 * Replaces old PricingPlansDialog.js
 * Shows the comparison matrix and plan upgrade buttons.
 */

import { useState } from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PricingTable } from "./PricingTable";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface PricingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContactUs: () => void;
  pricingViewType?: "CLASSROOM" | "SHIFTS" | "COMBINED";
}

// Removed pricingViewType
export function PricingDialog({
  open,
  onOpenChange,
  onContactUs,
}: PricingDialogProps) {
  const [discountCode, setDiscountCode] = useState<any>(null);

  const handleApplyDiscount = () => {
    // In actual implementation, we'd open a DiscountCodeDialog here to set state
    const code = window.prompt("Enter Discount Code (TEST: 50% OFF):");
    if (code === "TEST") {
      setDiscountCode({ code: "TEST", discount: 50 });
    } else if (code) {
      alert("Invalid discount code");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] p-0 overflow-hidden bg-gray-50 border-none rounded-xl">
        <div className="relative p-8 pb-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-xl mb-4">
          <Button
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full h-8 w-8 p-0"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-5 h-5" />
          </Button>

          <h2 className="text-3xl font-bold tracking-tight mb-2 text-center">
            Supercharge your attendance tracking
          </h2>
          <p className="text-blue-100 text-center text-lg max-w-2xl mx-auto">
            Choose the plan that fits your classroom or shift schedule sizes.
            Access advanced institutional insights, exporting limits, and
            geolocation enforcement.
          </p>
        </div>

        <div className="px-6 pb-6 overflow-y-auto max-h-[75vh]">
          <PricingTable
            onContactUs={() => {
              onOpenChange(false);
              onContactUs();
            }}
            onApplyDiscount={handleApplyDiscount}
            discountCode={discountCode}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
