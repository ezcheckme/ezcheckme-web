/**
 * Sidebar navigation component — Course List style.
 * White bg, shows "My Courses" header with course list.
 * Matches: CourseList.js, CourseLine.js, CourseLineColor.js from original.
 * Responsive: overlay drawer on mobile, fixed panel on desktop.
 */

import { Link, useMatchRoute } from "@tanstack/react-router";
import {
  Home,
  BookOpen,
  BarChart3,
  FileText,
  CreditCard,
  Info,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { navigationConfig, type NavItem } from "./navigation.config";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useUIStore } from "@/shared/store/ui.store";

const iconMap: Record<string, LucideIcon> = {
  Home,
  BookOpen,
  BarChart3,
  FileText,
  CreditCard,
  Info,
};

function NavItemComponent({ item }: { item: NavItem }) {
  const matchRoute = useMatchRoute();
  const isActive = matchRoute({ to: item.path, fuzzy: true });
  const Icon = iconMap[item.icon] || Home;
  const closeMobileNav = useUIStore((s) => s.toggleNavbar);

  return (
    <>
      <Link
        to={item.path}
        onClick={() => {
          if (window.innerWidth < 1024) closeMobileNav();
        }}
        className={cn(
          "group flex items-center gap-3 px-4 py-2.5 text-sm font-medium relative",
          "transition-all duration-200 border-l-[3px]",
          isActive
            ? "border-l-[#1E8229] bg-gray-50 text-gray-800"
            : "border-l-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-800",
        )}
      >
        <Icon
          className={cn(
            "h-5 w-5 shrink-0 transition-colors",
            isActive
              ? "text-[#1E8229]"
              : "text-gray-400 group-hover:text-gray-600",
          )}
        />
        <span>{item.title}</span>
        {item.badge != null && item.badge > 0 && (
          <span
            className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold text-white"
            style={{ backgroundColor: "#0277bd" }}
          >
            {item.badge}
          </span>
        )}
      </Link>
      {item.dividerAfter && <div className="my-2 h-px bg-gray-200 mx-4" />}
    </>
  );
}

export function Sidebar() {
  const role = useAuthStore((s) => s.role);
  const navbarOpen = useUIStore((s) => s.navbarOpen);
  const toggleNavbar = useUIStore((s) => s.toggleNavbar);

  const visibleItems = navigationConfig.filter(
    (item) =>
      !item.auth ||
      item.auth.includes(role as "host" | "attendee" | "guest" | "unknown"),
  );

  return (
    <>
      {/* Mobile backdrop */}
      {navbarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={toggleNavbar}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-full w-[240px] flex-col",
          "bg-white border-r",
          "transition-transform duration-300 ease-in-out",
          "lg:static lg:translate-x-0",
          navbarOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={{ borderColor: "rgba(0,0,0,0.12)" }}
      >
        {/* Header */}
        <div
          className="flex h-16 items-center justify-between border-b px-4"
          style={{ borderColor: "rgba(0,0,0,0.12)" }}
        >
          <div className="flex items-center gap-2">
            <img
              src="/assets/images/logos/logo.svg"
              alt="ezCheckMe"
              className="h-[35px]"
              onError={(e) => {
                // Fallback text logo
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  (e.target as HTMLImageElement).style.display = "none";
                  parent.innerHTML +=
                    '<span style="font-size:18px;font-weight:700;color:#20486a">ezCheckMe</span>';
                }
              }}
            />
          </div>
          <button
            onClick={toggleNavbar}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto py-2">
          <div className="flex flex-col">
            {visibleItems.map((item) => (
              <NavItemComponent key={item.id} item={item} />
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div
          className="border-t px-4 py-3"
          style={{ borderColor: "rgba(0,0,0,0.12)" }}
        >
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} ezCheckMe
          </p>
        </div>
      </aside>
    </>
  );
}
