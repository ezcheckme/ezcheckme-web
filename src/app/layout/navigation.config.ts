/**
 * Navigation configuration.
 * Defines the sidebar navigation tree.
 * Each item has an id, title, translation key, icon name, route path, and optional auth requirement.
 */

import type { UserRole } from "@/config/constants";

export interface NavItem {
  id: string;
  title: string;
  /** i18n translation key */
  i18nKey: string;
  /** Lucide icon name */
  icon: string;
  /** Route path */
  path: string;
  /** Required roles (if omitted, visible to all) */
  auth?: UserRole[];
  /** Children for collapsible groups */
  children?: NavItem[];
  /** Badge count */
  badge?: number;
  /** Divider after this item */
  dividerAfter?: boolean;
}

export const navigationConfig: NavItem[] = [
  {
    id: "home",
    title: "Home",
    i18nKey: "NAV.HOME",
    icon: "Home",
    path: "/home",
  },
  {
    id: "courses",
    title: "Courses",
    i18nKey: "NAV.COURSES",
    icon: "BookOpen",
    path: "/courses",
    auth: ["host"],
    dividerAfter: true,
  },
  {
    id: "admin",
    title: "Admin",
    i18nKey: "NAV.ADMIN",
    icon: "BarChart3",
    path: "/admin",
    auth: ["host"],
  },
  {
    id: "blog",
    title: "Blog",
    i18nKey: "NAV.BLOG",
    icon: "FileText",
    path: "/blog",
  },
  {
    id: "pricing",
    title: "Pricing",
    i18nKey: "NAV.PRICING",
    icon: "CreditCard",
    path: "/pricing",
  },
  {
    id: "about",
    title: "About",
    i18nKey: "NAV.ABOUT",
    icon: "Info",
    path: "/about",
  },
];
