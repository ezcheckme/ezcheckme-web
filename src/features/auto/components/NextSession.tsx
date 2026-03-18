import { memo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { CounterDown } from "./CounterDown";

interface NextSessionProps {
  nextSession: {
    name?: string;
    courseId: string;
    courseName?: string;
    begins: number;
  };
  timeToNextSession: number;
  onStartNow: () => void;
  hideStartNowButton?: boolean;
  direction?: "ltr" | "rtl";
}

/**
 * Next Session card — matches old app exactly.
 * Old styles: bg #fef4a0, title bg #f1e898, width 550px (450px < 1600px),
 * border-radius 4px, 4 info rows at 26px font, "Start Now..." blue link.
 */
export const NextSession = memo(
  ({
    nextSession,
    onStartNow,
    hideStartNowButton = false,
    direction = "ltr",
  }: NextSessionProps) => {
    const { t } = useTranslation();
    const isRtl = direction === "rtl";

    return (
      <div
        className={cn(
          "flex flex-col items-center justify-start",
          "rounded-[4px] h-full",
          "w-[550px] max-[1600px]:w-[450px]",
        )}
        style={{ backgroundColor: "#fef4a0" }}
      >
        {/* Title bar */}
        <div
          className={cn(
            "w-full font-bold mb-2 p-[10px]",
            "text-[30px] max-[1600px]:text-[23px]",
          )}
          style={{ backgroundColor: "#f1e898" }}
        >
          {t("Next Session")}
        </div>

        {/* Content */}
        <div
          className="flex flex-col items-center justify-start w-full p-[10px]"
          style={{ direction }}
        >
          {/* Course */}
          <div
            className={cn(
              "flex flex-row mb-[10px] items-baseline w-full relative",
              "text-[26px] max-[1600px]:text-[21px]",
            )}
            style={{ textAlign: "justify" }}
          >
            <div className="font-bold w-1/2">{`${t("Course")}:`}</div>
            <div
              className="font-bold w-1/2"
              style={{ textAlign: isRtl ? "right" : "left" }}
            >
              {nextSession.courseName || nextSession.courseId}
            </div>
          </div>

          {/* Session */}
          <div
            className={cn(
              "flex flex-row mb-[10px] items-baseline w-full relative",
              "text-[26px] max-[1600px]:text-[21px]",
            )}
            style={{ textAlign: "justify" }}
          >
            <div className="font-bold w-1/2">{`${t("Session")}:`}</div>
            <div
              className="font-bold w-1/2"
              style={{ textAlign: isRtl ? "right" : "left" }}
            >
              {nextSession.name}
            </div>
          </div>

          {/* Starts at */}
          <div
            className={cn(
              "flex flex-row mb-[10px] items-baseline w-full relative",
              "text-[26px] max-[1600px]:text-[21px]",
            )}
            style={{ textAlign: "justify" }}
          >
            <div className="font-bold w-1/2">{`${t("Starts at")}:`}</div>
            <div className="font-bold w-1/2">
              {new Date(nextSession.begins).toLocaleTimeString("he", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          {/* Time to next session */}
          <div
            className={cn(
              "flex flex-row mb-[10px] items-baseline w-full relative",
              "text-[26px] max-[1600px]:text-[21px]",
            )}
            style={{ textAlign: "justify" }}
          >
            <div className="font-bold w-1/2">
              {`${t("Time to next session")}:`}
            </div>
            <div
              className="font-bold w-1/2"
              style={{ textAlign: isRtl ? "right" : "left" }}
            >
              <CounterDown startTime={nextSession.begins} />
            </div>

            {/* Start Now link */}
            {!hideStartNowButton && (
              <div
                className={cn(
                  "absolute bottom-[-5px] text-[14px] font-bold underline text-blue-600 cursor-pointer",
                  isRtl ? "left-[5px]" : "right-[5px]",
                )}
                onClick={onStartNow}
              >
                {`${t("Start Now")}...`}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

NextSession.displayName = "NextSession";
