import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { useAdminStore } from "../store/admin.store";

function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

interface WidgetData {
  name: string;
  data: string;
  icon: string;
  hoverIcon: string;
  tooltip: string;
}

function WidgetCard({
  widget,
  isLoading,
}: {
  widget: WidgetData;
  isLoading: boolean;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      title={widget.tooltip}
      className="flex-1 min-w-[162px] mx-5 2xl:mx-[10px]"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className="flex flex-row items-center justify-around h-[110px] rounded-[10px] px-5 py-5 transition-colors duration-200 cursor-default 2xl:h-[110px] xl:h-[75px] lg:h-[63px]"
        style={{
          boxShadow: "1px 1px 5px grey, -1px -0.5px 3px grey",
          backgroundColor: hover ? "#133f5c" : "#f5f5f5",
          color: hover ? "#f5f5f5" : "#133f5c",
        }}
      >
        {/* Icon — swaps on hover like legacy MiniWidget */}
        <img
          src={hover ? widget.hoverIcon : widget.icon}
          alt={widget.name}
          className="h-[86px] object-contain 2xl:h-[60px] xl:h-[40px] lg:h-[35px]"
        />

        {/* Data + Name */}
        <div
          className="flex flex-col items-center transition-colors duration-200"
          style={{
            filter: isLoading ? "blur(10px)" : "blur(0px)",
            transition: "filter 0.5s, color 0.2s",
          }}
        >
          <span className="text-[46px] font-black leading-tight 2xl:text-[33px] xl:text-[25px] lg:text-[22px]">
            {widget.data}
          </span>
          <span className="text-[19px] font-bold mb-2 2xl:text-[14px] xl:text-[13px] lg:text-[11px]">
            {widget.name}
          </span>
        </div>
      </div>
    </div>
  );
}

export function AdminStatsWidgets() {
  const { t } = useTranslation();
  const { adminStats, loading, dates } = useAdminStore();

  if (!(adminStats as Record<string, any>)?.general) {
    return (
      <div className="flex flex-row justify-between w-[calc(100%+40px)] -ml-5 mb-4 2xl:w-[calc(100%+20px)] 2xl:-ml-[10px]">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex-1 min-w-[162px] mx-5 2xl:mx-[10px] h-[110px] rounded-[10px] bg-[#f5f5f5] animate-pulse 2xl:h-[90px] xl:h-[75px] lg:h-[63px]"
            style={{ boxShadow: "1px 1px 5px grey, -1px -0.5px 3px grey" }}
          />
        ))}
      </div>
    );
  }

  const stats = (adminStats as Record<string, any>).general;
  const fromStr = dates?.from
    ? format(new Date(dates.from), "MMM dd yyyy")
    : "";
  const toStr = dates?.to ? format(new Date(dates.to), "MMM dd yyyy") : "";

  const widgets: WidgetData[] = [
    {
      name: t("Attendance"),
      data: `${Math.round((stats.avgAttendanceRate || 0) * 1000) / 10}%`,
      icon: "/assets/images/admin/b_attendance.png",
      hoverIcon: "/assets/images/admin/w_attendance.png",
      tooltip: `Average attendance across all courses between ${fromStr} and ${toStr}`,
    },
    {
      name: t("Instructors"),
      data: formatNumber(stats.hosts),
      icon: "/assets/images/admin/b_instructors.png",
      hoverIcon: "/assets/images/admin/w_instructors.png",
      tooltip: `Number of instructors with sessions between ${fromStr} and ${toStr}`,
    },
    {
      name: t("Courses"),
      data: formatNumber(stats.courses),
      icon: "/assets/images/admin/b_courses.png",
      hoverIcon: "/assets/images/admin/w_courses.png",
      tooltip: `Courses with active sessions between ${fromStr} and ${toStr}`,
    },
    {
      name: t("Sessions"),
      data: formatNumber(stats.sessions),
      icon: "/assets/images/admin/b_sessions.png",
      hoverIcon: "/assets/images/admin/w_sessions.png",
      tooltip: `Active sessions between ${fromStr} and ${toStr}`,
    },
    {
      name: t("Unique Attendees"),
      data: formatNumber(stats.attendees),
      icon: "/assets/images/admin/b_attendees.png",
      hoverIcon: "/assets/images/admin/w_attendees.png",
      tooltip: `Total unique attendees that checked-in between ${fromStr} and ${toStr}`,
    },
    {
      name: t("Check-ins"),
      data: formatNumber(stats.checkins),
      icon: "/assets/images/admin/b_checkins.png",
      hoverIcon: "/assets/images/admin/w_checkins.png",
      tooltip: `Total check-ins between ${fromStr} and ${toStr}`,
    },
  ];

  return (
    <div className="flex flex-row justify-between w-[calc(100%+40px)] -ml-5 2xl:w-[calc(100%+20px)] 2xl:-ml-[10px]">
      {widgets.map((widget, i) => (
        <WidgetCard key={i} widget={widget} isLoading={!!loading} />
      ))}
    </div>
  );
}
