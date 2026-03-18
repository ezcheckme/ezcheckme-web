import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { AutoModeSettingsDialog } from "@/features/sessions/components/AutoModeSettingsDialog";

interface AutoModeFooterProps {
  onExitAutoMode: () => void;
  isRtl?: boolean;
}

/**
 * Auto Mode Footer — matches old app exactly.
 * Old styles: bg #e0e3e6, height 72px, padding 14px, width 97%,
 * position absolute bottom 0, margin 0 auto 30px.
 * Left: EZME logo. Right: "Exit Auto Mode" (underlined) + Settings gear + Fullscreen.
 */
export const AutoModeFooter = memo(
  ({ onExitAutoMode, isRtl = false }: AutoModeFooterProps) => {
    const { t } = useTranslation();
    const [settingsOpen, setSettingsOpen] = useState(false);

    return (
      <div
        className={cn(
          "absolute bottom-0 mb-[30px] mx-auto",
          "w-[97%] h-[72px] p-[14px]",
          "flex flex-row flex-nowrap justify-between items-center",
          "text-[1.8em]",
          isRtl && "flex-row-reverse",
        )}
        style={{ backgroundColor: "#e0e3e6" }}
      >
        {/* Left side: Logo */}
        <div
          className={cn(
            "font-bold flex-1 flex items-center whitespace-nowrap",
            isRtl && "justify-end",
          )}
        >
          <img
            src="/assets/images/logos/logo.svg"
            width="161"
            height="46"
            alt="EZCheck.me"
            className="relative -left-[15px] m-[6px] inline-block"
          />
        </div>

        {/* Right side: Exit + Settings */}
        <div
          className={cn(
            "flex flex-1 justify-end items-center cursor-pointer",
            isRtl && "flex-row-reverse justify-start",
          )}
        >
          {/* Exit Auto Mode link */}
          <div
            className="mx-8 underline items-center cursor-pointer whitespace-nowrap"
            onClick={onExitAutoMode}
          >
            {t("Exit Auto Mode")}
          </div>

          {/* Settings gear */}
          <button
            className="p-2 rounded-full hover:bg-black/5 cursor-pointer"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-6 w-6" />
          </button>
        </div>

        <AutoModeSettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
        />
      </div>
    );
  },
);

AutoModeFooter.displayName = "AutoModeFooter";
