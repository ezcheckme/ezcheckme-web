/**
 * Download Report Dialog — gateway to choose report type.
 * Options: Upload & Modify Excel, or Download Standard Report.
 *
 * Source: old DownloadReportGatewayDialog.js (121 lines) → ~100 lines.
 */

import { useTranslation } from "react-i18next";
import { Download, FileUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ReportType = "upload_modify" | "download_standard";

interface DownloadReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (type: ReportType) => void;
}

export function DownloadReportDialog({
  open,
  onOpenChange,
  onSelectType,
}: DownloadReportDialogProps) {
  const { t } = useTranslation();

  function handleSelect(type: ReportType) {
    onSelectType(type);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {t("download report - gateway - title") || "Download Report"}
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            {t("download report - gateway - subtitle") ||
              "Choose how you'd like to generate your attendance report"}
          </p>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {/* Upload & Modify */}
          <button
            onClick={() => handleSelect("upload_modify")}
            className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-gray-200 hover:border-accent hover:bg-blue-50/30 transition-all text-center group"
          >
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <FileUp className="h-6 w-6 text-link" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                {t("download report - gateway - upload excel title") ||
                  "Upload & Modify"}
                <span className="ml-1 text-[10px] font-bold text-white bg-link px-1.5 py-0.5 rounded-full">
                  NEW
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                {t(
                  "download report - gateway - upload excel for report text 1",
                ) ||
                  "Upload your own Excel template and we'll fill in the attendance data."}
              </p>
            </div>
          </button>

          {/* Download Standard */}
          <button
            onClick={() => handleSelect("download_standard")}
            className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50/30 transition-all text-center group"
          >
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
              <Download className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                {t("download report - gateway - download excel title") ||
                  "Download Report"}
              </h3>
              <p className="text-xs text-gray-500">
                {t("download report - gateway - download excel text") ||
                  "Download a pre-formatted attendance report as an Excel file."}
              </p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { ReportType };
