import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Users,
  FileBarChart,
  PieChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth/store/auth.store";

export function AdminMenu() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const isFacultyManager = !!user?.facultyManager;

  // Extract dynamic theme/group values from user object if available
  const groupName = user?.groupData?.name || "Arie Group";
  const facultyName =
    user?.facultyManager && user?.facultyData?.name
      ? user.facultyData.name
      : null;
  const themeBgColor = user?.theme?.bgColor || "#1A4F41"; // Default dark green matching USF
  const logoImage = user?.theme?.image || null;

  const allMenuItems: Array<{
    path: string;
    label: string;
    icon: any;
    exact?: boolean;
    hiddenForFaculty?: boolean;
    search?: Record<string, any>;
  }> = [
    {
      path: "/admin",
      label: t("admin menu - dashboard", "Dashboard"),
      icon: LayoutDashboard,
      exact: true,
    },
    {
      path: "/admin/attendees",
      label: isFacultyManager
        ? t("faculty members - dialog - title", "Faculty Members")
        : t("admin menu - institute members", "Institute members"),
      icon: Users,
    },
    {
      path: "/admin/reports",
      label: isFacultyManager
        ? t("faculty members - faculty reports", "Faculty Reports")
        : t("admin menu - institutional reports", "Institutional Reports"),
      icon: FileBarChart,
    },
    {
      path: "/admin/usage",
      label: t("admin menu - monthly usage", "Monthly usage"),
      icon: PieChart,
      hiddenForFaculty: true,
    },
  ];

  // Faculty managers don't see Monthly Usage (matches legacy menu.pop() behavior)
  const menuItems = isFacultyManager
    ? allMenuItems.filter((item) => !item.hiddenForFaculty)
    : allMenuItems;

  return (
    <div className="w-[300px] bg-[#ecf0f3] h-full flex flex-col p-4 shrink-0 overflow-y-auto border-r border-gray-200">
      {/* Top Graphic Logo Block */}
      <div
        className="w-full h-[64px] flex items-center justify-center mb-[7px] border border-black/20 shadow-[0_0_1px_rgba(0,0,0,0.24)] rounded-[4px]"
        style={{
          backgroundColor: themeBgColor,
        }}
      >
        {logoImage ? (
          <img
            src={logoImage}
            alt="Institute Logo"
            className="max-w-[95%] max-h-[95%] m-auto object-contain"
          />
        ) : (
          <span className="text-white font-bold tracking-wider text-xl">
            INSTITUTE LOGO
          </span>
        )}
      </div>

      {/* Institute Name Block */}
      <div className="mb-[6px] ml-[15px] flex flex-col font-bold text-gray-800 tracking-wide">
        <span className="text-[18px]">{groupName}</span>
        {facultyName && (
          <span className="text-gray-500 font-medium text-sm mt-0.5">
            {facultyName}
          </span>
        )}
      </div>

      {/* Menu List */}
      <nav className="flex flex-col bg-white border border-black/20 rounded-[4px] shadow-[0_0_1px_rgba(0,0,0,0.24)]">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isLast = index === menuItems.length - 1;

          return (
            <Link
              key={item.label}
              to={item.path as any}
              search={item.search as any}
              activeOptions={{ exact: item.exact }}
              className={cn(
                "group flex items-center h-[64px] px-[10px] bg-white text-[16px] transition-colors w-full text-left relative hover:bg-gray-50 text-gray-700",
                !isLast && "border-b border-[#e0e0e0]",
              )}
              activeProps={{
                className: "!bg-[#f5f5f5]",
              }}
            >
              {({ isActive }) => (
                <>
                  <div className="mr-2 mt-1">
                    <Icon
                      className={cn(
                        "h-6 w-6 flex-shrink-0 transition-colors",
                         "text-gray-600",
                      )}
                      strokeWidth={1.5}
                    />
                  </div>
                  <span className={cn(isActive ? "font-semibold" : "font-normal")}>{item.label}</span>
                </>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
