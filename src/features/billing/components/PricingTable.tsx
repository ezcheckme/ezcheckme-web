/**
 * Pricing Table Component
 * Replaces old PricingTable.js, FeaturesTableRow.js, PricesRow.js, PricingTableTabs.js
 */

import { useState } from "react";
import { Check, X, HelpCircle, Loader2 } from "lucide-react";
import {
  PRICING_TIERS_TITLES,
  PRICING_FEATURE_INFO,
  PRICING,
  getFeatureMap,
  BLUESNAP_URLS,
} from "../constants/billing.constants";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface PricingTableProps {
  onContactUs: () => void;
  onApplyDiscount?: () => void;
  discountCode?: any;
}

export function PricingTable({
  onContactUs,
  onApplyDiscount,
  discountCode,
}: PricingTableProps) {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [selectedPriceIndex, setSelectedPriceIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const isProd = import.meta.env.VITE_ENV === "production";
  const bsUrl = isProd ? BLUESNAP_URLS.PROD : BLUESNAP_URLS.DEV;

  const features = getFeatureMap(tabIndex);

  // Basic, Premium, Institutional prices based on the selected tier size
  const currentPriceTier = Object.values(PRICING[selectedPriceIndex])[0];
  const [basicPrice, premiumPrice, institutionalPrice] = currentPriceTier;

  const handleCheckout = (planIndex: number) => {
    // 0 = Basic, 1 = Premium, 2 = Institutional
    if (planIndex === 2 || premiumPrice === "CONTACT US") {
      onContactUs();
      return;
    }

    // In a real implementation with Bluesnap, we would append query parameters based on user + plan
    // e.g. `&userid=${user?.id}&plan=${planIndex}&price=${premiumPrice}`
    setLoading(true);
    window.location.href = bsUrl;
  };

  const getPriceToDisplay = (priceStr: string) => {
    if (priceStr === "CONTACT US") return priceStr;
    const price = parseFloat(priceStr);
    if (!isNaN(price) && discountCode) {
      const discounted = price * (1 - discountCode.discount / 100);
      return `$${(Math.round(discounted * 100) / 100).toFixed(2)}`;
    }
    return `$${priceStr}`;
  };

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-lg inline-flex">
          {Object.values(PRICING_TIERS_TITLES).map((title, idx) => (
            <button
              key={idx}
              className={`px-6 py-2 rounded-md font-medium text-sm transition-all ${
                tabIndex === idx
                  ? "bg-white shadow-sm text-link"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setTabIndex(idx)}
            >
              {title}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-900 w-2/5 flex items-center gap-2">
                Features
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Hover over features to see detailed explanations.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </th>
              <th className="px-6 py-4 font-semibold text-gray-900 text-center w-1/5 border-l">
                Basic
              </th>
              <th className="px-6 py-4 font-bold text-white text-center w-1/5 bg-link border-l border-r border-[#01579b]">
                Premium
              </th>
              <th className="px-6 py-4 font-semibold text-gray-900 text-center w-1/5">
                Institutional
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {features.map((featureRow, rowIdx) => (
              <tr
                key={rowIdx}
                className={`${rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-gray-50`}
              >
                <td className="px-6 py-3 text-gray-700 flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className={`cursor-help border-b border-dotted border-gray-300 pb-0.5 ${featureRow[0].startsWith(">>-") ? "ml-4" : ""}`}
                        >
                          {featureRow[0].replace(">>- ", "")}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs text-center">
                        <p>{PRICING_FEATURE_INFO[rowIdx]}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
                <td className="px-6 py-3 text-center text-gray-600 border-l">
                  {featureRow[1] === "v" ? (
                    <Check className="w-4 h-4 text-green-500 mx-auto" />
                  ) : featureRow[1] === "x" ? (
                    <X className="w-4 h-4 text-red-300 mx-auto" />
                  ) : (
                    featureRow[1]
                  )}
                </td>
                <td className="px-6 py-3 text-center font-medium bg-blue-50/30 border-l border-r border-blue-100">
                  {featureRow[2] === "v" ? (
                    <Check className="w-5 h-5 text-link mx-auto font-bold" />
                  ) : featureRow[2] === "x" ? (
                    <X className="w-4 h-4 text-red-300 mx-auto" />
                  ) : (
                    <span className="text-link">{featureRow[2]}</span>
                  )}
                </td>
                <td className="px-6 py-3 text-center text-gray-600">
                  {featureRow[3] === "v" ? (
                    <Check className="w-4 h-4 text-green-500 mx-auto" />
                  ) : featureRow[3] === "x" ? (
                    <X className="w-4 h-4 text-red-300 mx-auto" />
                  ) : featureRow[3] === "new" ? (
                    <Check className="w-4 h-4 text-green-500 mx-auto" />
                  ) : (
                    featureRow[3]
                  )}
                </td>
              </tr>
            ))}

            {/* Price Selection Row */}
            <tr className="bg-gray-50 border-t-2">
              <td className="px-6 py-5 align-middle border-r">
                <span className="block text-sm font-semibold mb-2">
                  Estimated Monthly Attendees:
                </span>
                <Select
                  value={selectedPriceIndex.toString()}
                  onValueChange={(val) =>
                    setSelectedPriceIndex(parseInt(val, 10))
                  }
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select attendees limit" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICING.map((p, idx) => (
                      <SelectItem key={idx} value={idx.toString()}>
                        {Object.keys(p)[0]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
              <td className="px-6 py-5 text-center align-middle font-bold text-lg text-gray-500 border-r line-through decoration-gray-400">
                {getPriceToDisplay(basicPrice)}
                <span className="block text-xs font-normal mt-1 text-gray-400 no-underline">
                  / mo
                </span>
              </td>
              <td className="px-6 py-5 text-center align-middle border-r bg-blue-50">
                <div className="font-bold text-2xl text-link">
                  {getPriceToDisplay(premiumPrice)}
                </div>
                {premiumPrice !== "CONTACT US" && (
                  <span className="block text-xs font-medium mt-1 text-gray-600">
                    / mo
                  </span>
                )}
              </td>
              <td className="px-6 py-5 text-center align-middle border-r">
                <div className="font-bold text-xl text-gray-800">
                  {getPriceToDisplay(institutionalPrice)}
                </div>
                {institutionalPrice !== "CONTACT US" && (
                  <span className="block text-xs font-medium mt-1 text-gray-500">
                    / mo
                  </span>
                )}
              </td>
            </tr>

            {/* Buttons Row */}
            <tr className="bg-white">
              <td className="px-6 py-4 align-middle border-r text-sm text-gray-500">
                {discountCode ? (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 hover:bg-green-100 cursor-pointer"
                    onClick={onApplyDiscount}
                  >
                    Discount Active ({discountCode.discount}%)
                  </Badge>
                ) : (
                  <button
                    className="text-link hover:underline"
                    onClick={onApplyDiscount}
                  >
                    Have a discount code?
                  </button>
                )}
              </td>
              <td className="px-6 py-4 align-middle text-center border-r">
                <Button
                  variant="outline"
                  className="w-full font-semibold"
                  disabled
                >
                  Current Plan
                </Button>
              </td>
              <td className="px-6 py-4 align-middle text-center border-r bg-blue-50">
                <Button
                  className="w-full bg-link hover:bg-link/90 text-white shadow-md"
                  onClick={() => handleCheckout(1)}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {premiumPrice === "CONTACT US" ? "Contact Us" : "Upgrade"}
                </Button>
              </td>
              <td className="px-6 py-4 align-middle text-center border-r">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => handleCheckout(2)}
                >
                  Contact Us
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
