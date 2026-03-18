/**
 * Pricing page — matches legacy Pricing.js exactly.
 *
 * Legacy design from screenshots:
 *   - Sage green background (#9AB0A0)
 *   - Title "Plans and Pricing"
 *   - White card with tabs: Classroom | Shifts | Ultimate
 *   - Feature comparison table: 3 columns (Basic, Premium, Institutional)
 *   - Green check / Red X icons
 *   - Premium column highlighted with slight gray bg
 *   - Bottom row: Monthly payment with attendee dropdown, FREE / $9.90/Month / CONTACT US
 *   - GET STARTED button below the card
 */

import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { HelpCircle, Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";

// ---------- Data from legacy config.js ----------

const TABS = [
  { key: "CLASSROOM", label: "Classroom" },
  { key: "SHIFTS", label: "Shifts" },
  { key: "COMBINED", label: "Ultimate" },
] as const;

// [featureName, basic, premium, institutional, badge?]
type FeatureRow = [string, string, string, string, string?];

const FEATURES_CLASSROOM: FeatureRow[] = [
  ["Host accounts", "One", "One", "Unlimited"],
  ["Number of Classroom Courses", "One", "Unlimited", "Unlimited"],
  ["- Classroom Check-in Sessions", "7", "Unlimited", "Unlimited"],
  ["Number of Shifts Courses", "One", "One", "Unlimited"],
  ["- Shift Check-ins", "Unlimited", "Unlimited", "Unlimited"],
  ["Online Reports", "v", "v", "v"],
  ["Instant Messages", "v", "v", "v"],
  ["Excel Reports", "x", "v", "v"],
  ["Branded Sessions", "x", "v", "v"],
  ["Geolocation", "x", "v", "v"],
  ["Course Insights Dashboard", "x", "v", "v"],
  ["Institutional Insights Dashboard", "x", "x", "v", "NEW"],
  ["Multiple Hosts Management", "x", "x", "v"],
  ["Institutional Reports", "x", "x", "v"],
  ["Integration with External Reports", "x", "x", "v"],
  ["Enhanced Support", "x", "x", "v"],
];

const FEATURES_SHIFTS: FeatureRow[] = [
  ["Host accounts", "One", "One", "Unlimited"],
  ["Number of Classroom Courses", "One", "One", "Unlimited"],
  ["- Classroom Check-in Sessions", "7", "7", "Unlimited"],
  ["Number of Shifts Courses", "One", "Unlimited", "Unlimited"],
  ["- Shift Check-ins", "Unlimited", "Unlimited", "Unlimited"],
  ["Online Reports", "v", "v", "v"],
  ["Instant Messages", "v", "v", "v"],
  ["Excel Reports", "x", "v", "v"],
  ["Branded Sessions", "x", "v", "v"],
  ["Geolocation", "x", "v", "v"],
  ["Course Insights Dashboard", "x", "v", "v"],
  ["Institutional Insights Dashboard", "x", "x", "v", "NEW"],
  ["Multiple Hosts Management", "x", "x", "v"],
  ["Institutional Reports", "x", "x", "v"],
  ["Integration with External Reports", "x", "x", "v"],
  ["Enhanced Support", "x", "x", "v"],
];

const FEATURES_COMBINED: FeatureRow[] = [
  ["Host accounts", "One", "One", "Unlimited"],
  ["Number of Classroom Courses", "One", "Unlimited", "Unlimited"],
  ["- Classroom Check-in Sessions", "7", "Unlimited", "Unlimited"],
  ["Number of Shifts Courses", "One", "Unlimited", "Unlimited"],
  ["- Shift Check-ins", "Unlimited", "Unlimited", "Unlimited"],
  ["Online Reports", "v", "v", "v"],
  ["Instant Messages", "v", "v", "v"],
  ["Excel Reports", "x", "v", "v"],
  ["Branded Sessions", "x", "v", "v"],
  ["Geolocation", "x", "v", "v"],
  ["Course Insights Dashboard", "x", "v", "v"],
  ["Institutional Insights Dashboard", "x", "x", "v", "NEW"],
  ["Multiple Hosts Management", "x", "x", "v"],
  ["Institutional Reports", "x", "x", "v"],
  ["Integration with External Reports", "x", "x", "v"],
  ["Enhanced Support", "x", "x", "v"],
];

const FEATURE_SETS = [FEATURES_CLASSROOM, FEATURES_SHIFTS, FEATURES_COMBINED];

const FEATURE_TOOLTIPS = [
  "Maximum number of host accounts",
  "Maximum number of concurrent Classroom Courses",
  "Maximum Number of sessions in classroom course. A session is counted when 5 or more attendees check-in",
  "Maximum number of concurrent Shifts Courses",
  "Maximum number of shifts per Shifts Course",
  "View the attendance reports online",
  "Send instant messages to your course attendees and receive detailed read recipes",
  "Download ultra-detailed attendance reports in Excel format",
  "Brand your sessions with your organization colors and logo",
  "Ideal for hybrid in-class/ on-line settings, as it indicates who attended the lesson from classroom and who from a remote location",
  "Dashboard with statistics and insights about your course's attendance",
  "Institutional Dashboard with statistics and insights about the entire institutional attendance data",
  "Institutional Admin account. The Admin can manage the institute's hosts and can view and download all the institute attendance reports",
  "Institutional-level attendance reports",
  "Integrate the attendance reports with external lists, from external LMS platforms, such as Moodle",
  "Accelerated Support experience, with faster response times",
];

const PRICING = [
  { label: "Up to 50 attendees", prices: ["9.90", "12.90", "17.90"] },
  { label: "51 to 100 attendees", prices: ["18.90", "24.90", "34.90"] },
  { label: "101 to 250 attendees", prices: ["39.90", "51.90", "71.90"] },
  { label: "251 to 500 attendees", prices: ["74.90", "97.90", "134.90"] },
  { label: "501 and up", prices: ["CONTACT US", "CONTACT US", "CONTACT US"] },
];

// ---------- Value cell renderer ----------

function ValueCell({
  value,
  highlighted,
}: {
  value: string;
  highlighted?: boolean;
}) {
  const bgClass = highlighted ? "bg-[#f5f5f5]" : "";

  if (value === "v") {
    return (
      <td
        className={`text-center py-2 px-3 border-b border-gray-200 ${bgClass}`}
      >
        <Check className="inline h-5 w-5 text-green-700" />
      </td>
    );
  }
  if (value === "x") {
    return (
      <td
        className={`text-center py-2 px-3 border-b border-gray-200 ${bgClass}`}
      >
        <X className="inline h-5 w-5 text-red-700" />
      </td>
    );
  }

  const isUnlimited = value === "Unlimited";
  return (
    <td
      className={`text-center py-2 px-3 border-b border-gray-200 text-sm ${bgClass}`}
      style={{ color: isUnlimited ? "#1b5e20" : "rgba(0,0,0,0.87)" }}
    >
      {value}
    </td>
  );
}

// ---------- Component ----------

export function PricingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedPriceIndex, setSelectedPriceIndex] = useState(0);

  const features = FEATURE_SETS[tabIndex];
  const selectedPricing = PRICING[selectedPriceIndex];
  const isContactUs = selectedPricing.prices[0] === "CONTACT US";

  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{ backgroundColor: "#9AB0A0" }}
    >
      <title>Plans and Pricing — ezCheckMe</title>
      {/* Title */}
      <div className="pt-10 pb-6">
        <h1
          className="text-center font-bold"
          style={{
            fontSize: 28,
            color: "rgba(0,0,0,0.87)",
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          }}
        >
          {t("pricing table - pricing title") || "Plans and Pricing"}
        </h1>
      </div>

      {/* Pricing card */}
      <div
        className="w-full bg-white rounded shadow-md overflow-hidden"
        style={{ maxWidth: 720 }}
      >
        {/* Tabs */}
        <div className="flex border-b border-gray-300">
          {TABS.map((tab, i) => (
            <button
              key={tab.key}
              onClick={() => setTabIndex(i)}
              className={`flex-1 py-3 text-center text-sm font-medium transition-colors cursor-pointer relative
                ${
                  tabIndex === i
                    ? "bg-white text-gray-800"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }
              `}
              style={{
                borderBottom:
                  tabIndex === i
                    ? "2px solid #0277bd"
                    : "2px solid transparent",
              }}
            >
              {tab.label}
              <HelpCircle
                className="inline h-3.5 w-3.5 ml-1 text-gray-400"
                style={{ verticalAlign: "super" }}
              />
            </button>
          ))}
        </div>

        {/* Table */}
        <table className="w-full border-collapse text-sm">
          {/* Header */}
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-3 px-4 font-semibold text-gray-700 w-[45%]">
                <span className="flex items-center gap-1">
                  Features
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </span>
              </th>
              <th className="text-center py-3 px-3 font-bold text-gray-800 w-[18%]">
                Basic
              </th>
              <th className="text-center py-3 px-3 font-bold text-gray-800 w-[18%] bg-[#f5f5f5] border-l border-r border-gray-200">
                Premium
              </th>
              <th className="text-center py-3 px-3 font-bold text-gray-800 w-[19%]">
                Institutional
              </th>
            </tr>
          </thead>

          {/* Feature rows */}
          <tbody>
            {features.map((row, i) => {
              const isIndented = row[0].startsWith("- ");
              const name = isIndented ? row[0].substring(2) : row[0];
              const badge = row[4];
              return (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td
                    className="py-2 px-4 border-b border-gray-200 text-gray-700"
                    style={{ paddingLeft: isIndented ? 32 : 16 }}
                    title={FEATURE_TOOLTIPS[i] || ""}
                  >
                    <span className="cursor-help">
                      {name}
                      {badge && (
                        <span
                          className="ml-1.5 text-[10px] font-bold align-super"
                          style={{ color: "#c62828" }}
                        >
                          {badge}
                        </span>
                      )}
                    </span>
                  </td>
                  <ValueCell value={row[1]} />
                  <ValueCell value={row[2]} highlighted />
                  <ValueCell value={row[3]} />
                </tr>
              );
            })}

            {/* Monthly payment row */}
            <tr className="border-t-2 border-gray-300">
              <td className="py-4 px-4">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-sm font-semibold text-gray-700">
                    Monthly payment
                  </span>
                  <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                </div>
                <select
                  className="text-sm border border-gray-300 rounded px-2 py-1 bg-white cursor-pointer"
                  value={selectedPriceIndex}
                  onChange={(e) =>
                    setSelectedPriceIndex(Number(e.target.value))
                  }
                >
                  {PRICING.map((p, i) => (
                    <option key={i} value={i}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="text-center py-4 px-3 text-gray-800 font-bold">
                FREE
              </td>
              <td className="text-center py-4 px-3 bg-[#f5f5f5] border-l border-r border-gray-200 font-bold text-gray-800">
                {isContactUs ? (
                  "CONTACT US"
                ) : (
                  <>
                    ${selectedPricing.prices[tabIndex]}
                    <span className="font-normal text-gray-500 text-xs">
                      {" "}
                      / Month
                    </span>
                  </>
                )}
              </td>
              <td className="text-center py-4 px-3 font-bold text-gray-800">
                CONTACT US
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* GET STARTED button */}
      <button
        onClick={() => navigate({ to: "/signup" })}
        className="mt-8 mb-12 text-white text-lg font-semibold rounded shadow-md transition-colors hover:opacity-90 cursor-pointer"
        style={{
          backgroundColor: "#0277bd",
          padding: "14px 48px",
        }}
      >
        GET STARTED
      </button>
    </div>
  );
}
