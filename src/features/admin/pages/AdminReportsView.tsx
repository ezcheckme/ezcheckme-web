import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format, subMonths } from "date-fns";
import {
  Download,
  RefreshCw,
} from "lucide-react";
import { useAdminStore } from "../store/admin.store";
import { exportBasicTableToExcel } from "@/shared/utils/export.utils";

// Make a very basic standard button
const Button = ({
  children,
  onClick,
  disabled,
  className = "",
  variant = "primary",
}: any) => {
  const baseStyle =
    "inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${(variants as any)[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export function AdminReportsView() {
  const { t } = useTranslation();
  const { coursesStats } = useAdminStore();
  const [loading, setLoading] = useState(false);

  // Default to last full month
  const [dateRange, setDateRange] = useState({
    from: format(subMonths(new Date(), 1), "yyyy-MM-01"),
    to: format(new Date(), "yyyy-MM-dd"),
  });

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      // Simulate API compilation time
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Build mock data based on currently loaded stats for demo purposes
      const exportData = [
        ["#", t("Report Generation Date"), format(new Date(), "PPpp")],
        ["", "", ""],
        ["#", t("Course"), t("Attendance Rate")],
      ];

      if (coursesStats && Array.isArray(coursesStats)) {
        coursesStats.slice(0, 10).forEach((course, i) => {
          exportData.push([
            (i + 1).toString(),
            course.courseName || "Unknown Course",
            `${Math.round((course.rate || 0) * 100)}%`,
          ]);
        });
      }

      await exportBasicTableToExcel({
        fileName: `Institutional_Report_${dateRange.from}_to_${dateRange.to}`,
        sheetName: "Summary",
        data: exportData,
        columnWidths: [10, 40, 20],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800 border-b border-gray-200 pb-2 mb-4">
          {t("Institutional Reports")}
        </h1>
        <p className="text-gray-700 text-sm mb-1">
          {t(
            "Generate an institutional report for all the attendees in your organization"
          )}
        </p>
        <p className="text-gray-700 text-sm">
          {t('Selected a date range and click "Download Report"')}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-end gap-6 mt-6">
        <div className="flex flex-col text-left space-y-1 w-full sm:w-auto">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {t("Start week")}
          </label>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, from: e.target.value }))
            }
            className="w-full sm:w-48 px-0 py-1.5 border-0 border-b-2 border-gray-300 focus:ring-0 focus:border-blue-500 rounded-none bg-transparent transition-colors text-sm text-gray-800"
          />
        </div>

        <div className="flex flex-col text-left space-y-1 w-full sm:w-auto">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {t("End week")}
          </label>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, to: e.target.value }))
            }
            className="w-full sm:w-48 px-0 py-1.5 border-0 border-b-2 border-gray-300 focus:ring-0 focus:border-blue-500 rounded-none bg-transparent transition-colors text-sm text-gray-800"
          />
        </div>

        <Button
          onClick={handleGenerateReport}
          disabled={loading || !dateRange.from || !dateRange.to}
          className="w-full sm:w-auto bg-[#4caf50] hover:bg-[#388e3c] text-white px-5 py-2 font-medium ml-0 sm:ml-4 shadow-sm h-[40px]"
        >
          {loading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          {t("Download Report")}
        </Button>
      </div>
      
      {loading && (
        <div className="text-sm text-[#ff9800] mt-4 font-medium">
          {t("Generating the report. Please wait...")}
        </div>
      )}
    </div>
  );
}
