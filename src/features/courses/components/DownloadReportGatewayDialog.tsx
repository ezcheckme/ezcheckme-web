/**
 * DownloadReportGatewayDialog
 * Mirrors legacy DownloadReportGatewayDialog.js.
 * Choice dialog: "Integrate with external attendees list" vs "Download a full report".
 * Styled to match the old MUI-based dialog exactly.
 */

import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DownloadReportGatewayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: "upload_and_modify" | "download") => void;
}

export function DownloadReportGatewayDialog({
  open,
  onOpenChange,
  onSelect,
}: DownloadReportGatewayDialogProps) {
  const { t } = useTranslation();

  const handleChoice = (type: "upload_and_modify" | "download") => {
    onOpenChange(false);
    onSelect(type);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 gap-0 border-0"
        style={{
          maxWidth: 700,
          borderRadius: 4,
          boxShadow:
            "0px 11px 15px -7px rgba(0,0,0,0.2), 0px 24px 38px 3px rgba(0,0,0,0.14), 0px 9px 46px 8px rgba(0,0,0,0.12)",
        }}
      >
        {/* Header */}
        <DialogHeader className="pt-6 pb-2 px-8 text-center">
          <DialogTitle
            className="text-[20px] font-medium text-center"
            style={{ color: "rgba(0,0,0,0.87)" }}
          >
            {t("download report - gateway - title") || "Export Report"}
          </DialogTitle>
          <p
            className="text-[14px] mt-1 text-center"
            style={{ color: "rgba(0,0,0,0.54)" }}
          >
            {t("download report - gateway - subtitle") ||
              "Please choose an Export method:"}
          </p>
        </DialogHeader>

        {/* Two-panel layout with vertical divider */}
        <div className="flex" style={{ minHeight: 200, padding: "16px 0 24px" }}>
          {/* Left panel: Integrate */}
          <div className="flex-1 flex flex-col items-center px-8">
            <h3
              className="text-[16px] font-bold text-center mb-3"
              style={{ color: "rgba(0,0,0,0.87)" }}
            >
              {t("download report - gateway - upload excel title") ||
                "Integrate with external attendees list"}
              <sup
                className="ml-1 text-[10px] font-bold"
                style={{ color: "#f44336" }}
              >
                NEW!
              </sup>
            </h3>

            <p
              className="text-[13px] text-center mb-2 leading-relaxed"
              style={{ color: "rgba(0,0,0,0.54)" }}
            >
              {t(
                "download report - gateway - upload excel for report text 1",
              ) ||
                "Integrate your attendance data into an existing attendees list."}
            </p>
            <p
              className="text-[13px] text-center mb-6 leading-relaxed"
              style={{ color: "rgba(0,0,0,0.54)" }}
            >
              {t(
                "download report - gateway - upload excel for report text 2",
              ) ||
                "You will need to upload an Excel attendees list, which contains an Email addresses column of your attendees. The number of check-ins for each recognized student will be added to that list."}
            </p>

            <div className="mt-auto">
              <button
                onClick={() => handleChoice("upload_and_modify")}
                className="inline-flex items-center justify-center gap-2 text-white text-[14px] font-medium rounded cursor-pointer transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: "#0277bd",
                  padding: "8px 24px",
                  minWidth: 160,
                  boxShadow:
                    "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
                  borderRadius: 4,
                  textTransform: "none",
                }}
              >
                {/* Double chevron >> icon */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="13 17 18 12 13 7" />
                  <polyline points="6 17 11 12 6 7" />
                </svg>
                {t(
                  "download report - gateway - upload excel for report btn text",
                ) || "Get started..."}
              </button>
            </div>
          </div>

          {/* Vertical divider */}
          <div
            className="self-stretch"
            style={{
              width: 1,
              backgroundColor: "rgba(0,0,0,0.12)",
            }}
          />

          {/* Right panel: Download */}
          <div className="flex-1 flex flex-col items-center px-8">
            <h3
              className="text-[16px] font-bold text-center mb-3"
              style={{ color: "rgba(0,0,0,0.87)" }}
            >
              {t("download report - gateway - download excel title") ||
                "Download a full report"}
            </h3>

            <p
              className="text-[13px] text-center mb-6 leading-relaxed"
              style={{ color: "rgba(0,0,0,0.54)" }}
            >
              {t("download report - gateway - download excel text") ||
                "Download a full attendance report, with highly detailed sessions and check-in data of each session and attendee."}
            </p>

            <div className="mt-auto">
              <button
                onClick={() => handleChoice("download")}
                className="inline-flex items-center justify-center gap-2 text-white text-[14px] font-medium rounded cursor-pointer transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: "#179109",
                  padding: "8px 24px",
                  minWidth: 160,
                  boxShadow:
                    "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
                  borderRadius: 4,
                  textTransform: "none",
                }}
              >
                {/* Download icon */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {t("download report - gateway - download excel btn text") ||
                  "Download Report..."}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
