/**
 * UI store (Zustand).
 * Replaces sort reducer, view reducer, and message reducer from Redux.
 * Manages table sort/pagination, global view tracker, and snackbar/navbar state.
 */

import { create } from "zustand";
import { PAGINATION } from "@/config/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortOrder = "asc" | "desc";

interface TableSortState {
  order: SortOrder;
  orderBy: string | null;
  page: number;
  rowsPerPage: number;
  selected: string[];
}

interface SnackbarConfig {
  open: boolean;
  message: string;
  variant: "success" | "error" | "info" | "warning";
  autoHideDuration?: number;
}

interface UIState {
  // Table sort/pagination/selection
  table: TableSortState;

  // Global view tracker
  currentView: string | null;
  currentAction: string | null;

  // Navbar
  navbarOpen: boolean;

  // Snackbar
  snackbar: SnackbarConfig;
}

interface UIActions {
  // Table actions
  initSort: (viewType: string) => void;
  createSortHandler: (property: string) => void;
  setPage: (page: number) => void;
  setRowsPerPage: (rowsPerPage: number) => void;
  selectAll: (itemIds: string[]) => void;
  clearSelection: () => void;
  toggleItem: (itemId: string) => void;
  toggleItems: (itemIds: string[]) => void;

  // View tracker
  setCurrentView: (view: string, action?: string) => void;

  // Navbar
  toggleNavbar: () => void;
  setNavbarOpen: (open: boolean) => void;

  // Snackbar
  showSnackbar: (message: string, variant?: SnackbarConfig["variant"]) => void;
  hideSnackbar: () => void;

  // Reset
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialTableState: TableSortState = {
  order: "asc",
  orderBy: null,
  page: PAGINATION.DEFAULT_PAGE,
  rowsPerPage: PAGINATION.DEFAULT_PAGE_SIZE,
  selected: [],
};

const initialSnackbar: SnackbarConfig = {
  open: false,
  message: "",
  variant: "info",
  autoHideDuration: 4000,
};

const initialState: UIState = {
  table: { ...initialTableState },
  currentView: null,
  currentAction: null,
  navbarOpen: false,
  snackbar: { ...initialSnackbar },
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useUIStore = create<UIState & UIActions>()((set) => ({
  ...initialState,

  // -- Table actions --
  initSort: (_viewType) => set({ table: { ...initialTableState } }),

  createSortHandler: (property) =>
    set((state) => {
      const isAsc =
        state.table.orderBy === property && state.table.order === "asc";
      return {
        table: {
          ...state.table,
          order: isAsc ? "desc" : "asc",
          orderBy: property,
          page: 0,
        },
      };
    }),

  setPage: (page) =>
    set((state) => ({
      table: { ...state.table, page },
    })),

  setRowsPerPage: (rowsPerPage) =>
    set((state) => ({
      table: { ...state.table, rowsPerPage, page: 0 },
    })),

  selectAll: (itemIds) =>
    set((state) => ({
      table: {
        ...state.table,
        selected: state.table.selected.length === itemIds.length ? [] : itemIds,
      },
    })),

  clearSelection: () =>
    set((state) => ({
      table: { ...state.table, selected: [] },
    })),

  toggleItem: (itemId) =>
    set((state) => {
      const exists = state.table.selected.includes(itemId);
      return {
        table: {
          ...state.table,
          selected: exists
            ? state.table.selected.filter((id) => id !== itemId)
            : [...state.table.selected, itemId],
        },
      };
    }),

  toggleItems: (itemIds) =>
    set((state) => ({
      table: { ...state.table, selected: itemIds },
    })),

  // -- View tracker --
  setCurrentView: (view, action) =>
    set({ currentView: view, currentAction: action ?? null }),

  // -- Navbar --
  toggleNavbar: () => set((state) => ({ navbarOpen: !state.navbarOpen })),

  setNavbarOpen: (open) => set({ navbarOpen: open }),

  // -- Snackbar --
  showSnackbar: (message, variant = "info") =>
    set({
      snackbar: { open: true, message, variant, autoHideDuration: 4000 },
    }),

  hideSnackbar: () =>
    set((state) => ({
      snackbar: { ...state.snackbar, open: false },
    })),

  // -- Reset --
  reset: () => set(initialState),
}));
