/**
 * Admin store (Zustand).
 * Replaces admin reducer from Redux (redux-store.md §3.8).
 * Manages admin statistics, graph data, date filters, and view configuration.
 */

import { create } from "zustand";
import { ADMIN_VIEWS } from "@/config/constants";
import type { AdminView } from "@/config/constants";
import type {
  AdminGeneralStats,
  AdminCourseStats,
  AdminHostStats,
  AdminGraphDataPoint,
  AdminViewConfig,
  AdminMainElementsView,
  AdminDateRange,
} from "@/shared/types";
import * as adminService from "@/shared/services/admin.service";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AdminState {
  view: AdminView;
  adminStats: AdminGeneralStats | null;
  coursesStats: AdminCourseStats[] | null;
  coursesGraphStats: AdminGraphDataPoint[] | null;
  hostsStats: AdminHostStats[] | null;
  hostsGraphStats: AdminGraphDataPoint[] | null;
  instituteAttendeesStats: unknown | null;
  attendeesInfo: unknown[] | null;
  viewType: AdminViewConfig;
  elementsView: AdminMainElementsView;
  dates: AdminDateRange | null;
  loading: boolean;
  graphLoading: boolean;
  selectedGraphItems: string[];
}

interface AdminActions {
  // Statistics
  getGeneralStats: (data: Record<string, unknown>) => Promise<void>;
  getCoursesStats: (data: Record<string, unknown>) => Promise<void>;
  getCoursesGraphStats: (data: Record<string, unknown>) => Promise<void>;
  getHostsStats: (data: Record<string, unknown>) => Promise<void>;
  getHostsGraphStats: (data: Record<string, unknown>) => Promise<void>;
  getInstituteAttendeesStats: (data: Record<string, unknown>) => Promise<void>;
  getAttendeesInfo: (attendees: string[]) => Promise<void>;
  resetInstituteAttendeesStats: () => void;

  // View configuration
  setDates: (dates: AdminDateRange) => void;
  setElementsView: (elementsView: AdminMainElementsView) => void;
  changeViewType: (viewType: Partial<AdminViewConfig>) => void;
  changeView: (view: AdminView) => void;
  toggleGraphItem: (id: string, isAll?: boolean) => void;

  // Reset
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: AdminState = {
  view: ADMIN_VIEWS.MAIN_DASHBOARD,
  adminStats: null,
  coursesStats: null,
  coursesGraphStats: null,
  hostsStats: null,
  hostsGraphStats: null,
  instituteAttendeesStats: null,
  attendeesInfo: null,
  viewType: { dataType: "PERCENT", datesType: "WEEK" },
  elementsView: {
    adminMainGraphShow: true,
    adminMainStatsShow: true,
    adminMainTableShow: true,
  },
  dates: null,
  loading: true,
  graphLoading: false,
  selectedGraphItems: ["all"],
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAdminStore = create<AdminState & AdminActions>()((set) => ({
  ...initialState,

  getGeneralStats: async (data) => {
    set({ loading: true });
    try {
      const stats = await adminService.getAdminGeneralStatistics(data);
      set({ adminStats: stats, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  getCoursesStats: async (data) => {
    set({ loading: true });
    try {
      const stats = await adminService.getAdminCoursesGeneralStatistics(data);
      set({ coursesStats: stats, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  getCoursesGraphStats: async (data) => {
    set({ graphLoading: true });
    try {
      const stats = await adminService.getAdminCoursesGraphStatistics(data);
      set({ coursesGraphStats: stats, graphLoading: false });
    } catch {
      set({ graphLoading: false });
    }
  },

  getHostsStats: async (data) => {
    set({ loading: true });
    try {
      const stats = await adminService.getAdminHostsGeneralStatistics(data);
      set({ hostsStats: stats, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  getHostsGraphStats: async (data) => {
    set({ graphLoading: true });
    try {
      const stats = await adminService.getAdminHostsGraphStatistics(data);
      set({ hostsGraphStats: stats, graphLoading: false });
    } catch {
      set({ graphLoading: false });
    }
  },

  getInstituteAttendeesStats: async (data) => {
    set({ loading: true });
    try {
      const stats = await adminService.getInstituteAttendeesStatistics(data);
      set({ instituteAttendeesStats: stats, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  getAttendeesInfo: async (attendees) => {
    try {
      const info = await adminService.getAttendeesInfo(attendees);
      set({ attendeesInfo: info });
    } catch {
      set({ attendeesInfo: null });
    }
  },

  resetInstituteAttendeesStats: () => set({ instituteAttendeesStats: null }),

  setDates: (dates) => set({ dates }),

  setElementsView: (elementsView) => set({ elementsView }),

  changeViewType: (partial) =>
    set((state) => ({
      viewType: { ...state.viewType, ...partial },
    })),

  changeView: (view) => set({ view }),

  toggleGraphItem: (id, isAll) =>
    set((state) => {
      let current = [...state.selectedGraphItems];
      if (isAll) {
        if (current.includes("all")) {
          current = current.filter((i) => i !== "all");
        } else {
          current.push("all");
        }
      } else {
        if (current.includes(id)) {
          current = current.filter((i) => i !== id);
        } else {
          current.push(id);
        }
      }
      return { selectedGraphItems: current };
    }),

  reset: () => set(initialState),
}));
