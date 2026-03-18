import { memo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
const isAutoModeDisabled = (label?: string) => {
  return label === "inactive_auto_mode";
};

interface FollowingSessionsProps {
  sessions: Array<{
    id: string;
    name?: string;
    courseName?: string;
    begins: number;
    label?: string;
  }>;
  direction?: "ltr" | "rtl";
}

/**
 * Following Sessions table — matches old app exactly.
 * Old styles: bg #eeecec, title bg #e9e7e7, maxWidth 700px,
 * border-radius 4px, MUI Table inside Paper.
 * Disabled rows: color #9d0009 (red text).
 */
export const FollowingSessions = memo(
  ({ sessions, direction = "ltr" }: FollowingSessionsProps) => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === "he";
    const locale = isRtl ? "he" : "en";

    if (!sessions || sessions.length === 0) {
      return null;
    }

    const sortedSessions = [...sessions]
      .sort((a, b) => a.begins - b.begins)
      .slice(0, 4);

    return (
      <div
        className={cn(
          "flex flex-col items-center justify-start",
          "rounded-[4px] h-full max-w-[700px]",
        )}
        style={{ backgroundColor: "#eeecec", direction }}
      >
        {/* Title bar */}
        <div
          className={cn(
            "w-full font-bold mb-2 p-[10px]",
            "text-[30px] max-[1600px]:text-[23px]",
          )}
          style={{ backgroundColor: "#e9e7e7" }}
        >
          {t("Following Sessions")}
        </div>

        {/* Table content */}
        <div className="flex flex-col items-center justify-start w-full p-[10px]">
          <div className="w-full bg-white rounded shadow-sm" style={{ direction }}>
            <Table>
              <TableHeader>
                <TableRow style={{ direction }}>
                  <TableHead style={{ textAlign: "justify" }}>
                    {t("Course")}
                  </TableHead>
                  <TableHead style={{ textAlign: "justify" }}>
                    {t("Session")}
                  </TableHead>
                  <TableHead style={{ textAlign: "justify" }}>
                    {t("Date")}
                  </TableHead>
                  <TableHead style={{ textAlign: "justify" }}>
                    {t("Time")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSessions.map((session) => {
                  const sessionDate = new Date(session.begins);
                  const disabled = isAutoModeDisabled(session.label);
                  const lineColor = disabled ? "#9d0009" : "inherit";

                  return (
                    <TableRow key={session.id}>
                      <TableCell style={{ color: lineColor }}>
                        {session.courseName || ""}
                      </TableCell>
                      <TableCell style={{ color: lineColor }}>
                        {session.name || ""}
                      </TableCell>
                      <TableCell style={{ color: lineColor }}>
                        {sessionDate.toLocaleDateString(locale, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell style={{ color: lineColor }}>
                        {sessionDate.toLocaleTimeString("he", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  },
);

FollowingSessions.displayName = "FollowingSessions";
