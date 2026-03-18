/**
 * Auth store (Zustand).
 * Replaces user.reducer.js, login.reducer.js, signup.reducer.js from Redux.
 * Manages user profile, role, login/signup state, and dialog toggles.
 */

import { create } from "zustand";
import { USER_ROLES } from "@/config/constants";
import type { UserRole } from "@/config/constants";
import type { UserData, ConnectionData } from "@/shared/types";
import {
  setHostId,
  clearAuthStorage,
  setImpersonateId,
  removeImpersonateId as removeImpersonateIdStorage,
} from "@/shared/services/storage";
import { setAuthToken, clearAuthToken } from "@/shared/services/api-client";
import * as cognito from "../services/cognito.service";
import * as hostService from "@/shared/services/host.service";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DialogsState {
  referralOpen: boolean;
  pricingOpen: boolean;
  pricingTitle: string;
  pricingText: string;
  pricingHideButtons: boolean;
  premiumOpen: boolean;
  importAttendeesOpen: boolean;
  importGradingOpen: boolean;
}

interface AuthState {
  // User
  role: UserRole;
  user: UserData | null;
  fetched: boolean;
  init: boolean;

  // Login / Signup feedback
  loginError: { username?: string; password?: string } | null;
  signupError: { username?: string; password?: string } | null;
  loginSuccess: boolean;
  signupSuccess: boolean;

  // Connection
  connectionData: ConnectionData | null;

  // Universities (static data)
  universitiesData: unknown[] | null;

  // Modal dialogs
  dialogs: DialogsState;
}

interface AuthActions {
  // Auth lifecycle
  setUserFromCognito: (idToken: string) => Promise<void>;
  setAttendeeUser: (data: Partial<UserData>) => void;
  logout: () => void;
  setInit: (init: boolean) => void;
  signup: (
    name: string,
    email: string,
    password: string,
    referralCode?: string,
  ) => Promise<void>;

  // User data
  updateUserData: (data: Partial<UserData>) => Promise<void>;
  getHostData: () => Promise<void>;

  // Impersonation
  setImpersonate: (impersonateId: string) => Promise<void>;
  removeImpersonate: () => Promise<void>;

  // Login / Signup status
  setLoginError: (error: AuthState["loginError"]) => void;
  setLoginSuccess: (success: boolean) => void;
  setSignupError: (error: AuthState["signupError"]) => void;
  setSignupSuccess: (success: boolean) => void;

  // Connection
  fetchConnectionData: () => Promise<void>;

  // Universities
  fetchUniversitiesData: () => Promise<void>;

  // Dialog toggles
  openReferralDialog: () => void;
  closeReferralDialog: () => void;
  openPricingDialog: (
    title?: string,
    text?: string,
    hideButtons?: boolean,
  ) => void;
  closePricingDialog: () => void;
  openPremiumDialog: () => void;
  closePremiumDialog: () => void;
  openImportAttendeesDialog: () => void;
  closeImportAttendeesDialog: () => void;
  openImportGradingDialog: () => void;
  closeImportGradingDialog: () => void;

  // Reset
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialDialogs: DialogsState = {
  referralOpen: false,
  pricingOpen: false,
  pricingTitle: "",
  pricingText: "",
  pricingHideButtons: false,
  premiumOpen: false,
  importAttendeesOpen: false,
  importGradingOpen: false,
};

const initialState: AuthState = {
  role: USER_ROLES.UNKNOWN,
  user: null,
  fetched: false,
  init: false,
  loginError: null,
  signupError: null,
  loginSuccess: false,
  signupSuccess: false,
  connectionData: null,
  universitiesData: null,
  dialogs: { ...initialDialogs },
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAuthStore = create<AuthState & AuthActions>()((set, get) => ({
  ...initialState,

  // -- Auth lifecycle --
  setUserFromCognito: async (idToken) => {
    // Try to get hostId from JWT claims first
    let hostId = cognito.getHostIdFromToken(idToken);

    // If not in JWT, fetch user attributes from Cognito
    if (!hostId) {
      try {
        const attrs = await cognito.getUserAttributes();
        hostId = attrs["custom:hostid"] || null;
      } catch {
        // Attribute fetch failed — continue to fallback
      }
    }

    // Last resort: use 'sub' from the token
    if (!hostId) {
      const decoded = JSON.parse(atob(idToken.split(".")[1]));
      hostId = decoded.sub || null;
    }

    if (!hostId) {
      set({ role: USER_ROLES.GUEST, init: true });
      return;
    }

    setHostId(hostId);
    setAuthToken(idToken);

    try {
      const hostData = await hostService.getHost();
      const userData: UserData = {
        id: hostId,
        displayName:
          (hostData.displayName as string) || (hostData.name as string) || "",
        photoURL: (hostData.photoURL as string) || "",
        email: (hostData.email as string) || "",
        shortcuts: [],
        settings: {},
        theme: "default",
        ...hostData,
      };

      set({
        role: USER_ROLES.HOST,
        user: userData,
        fetched: true,
        init: true,
      });
    } catch {
      clearAuthToken();
      set({ role: USER_ROLES.GUEST, init: true });
    }
  },

  setAttendeeUser: (data) => {
    const userData: UserData = {
      id: data.id || "",
      displayName: data.displayName || data.email || "",
      photoURL: "",
      email: data.email || "",
      shortcuts: [],
      settings: {},
      theme: "default",
      ...data,
    };

    set({
      role: USER_ROLES.ATTENDEE,
      user: userData,
      fetched: true,
      init: true,
    });
  },

  logout: () => {
    cognito.signOut();
    clearAuthToken();
    clearAuthStorage();
    set(initialState);
    set({ init: true }); // re-mark as initialized so UI shows login
  },

  setInit: (init) => set({ init }),

  signup: async (_name, _email, _password, _referralCode) => {
    // Placeholder implementation (should integrate with cognito/api)
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({ signupSuccess: true });
  },

  // -- User data --
  updateUserData: async (data) => {
    try {
      await hostService.updateHost(data as Record<string, unknown>);
      set((state) => ({
        user: state.user ? { ...state.user, ...data } : null,
      }));
    } catch {
      // Update failed — could show snackbar
    }
  },

  getHostData: async () => {
    try {
      const hostData = await hostService.getHost();
      set((state) => ({
        user: state.user
          ? { ...state.user, ...(hostData as Partial<UserData>) }
          : null,
        fetched: true,
      }));
    } catch {
      // Failed to refresh
    }
  },

  // -- Impersonation --
  setImpersonate: async (impersonateId) => {
    setImpersonateId(impersonateId);
    // Reload host data under impersonated identity
    try {
      const hostData = await hostService.getHost();
      set((state) => ({
        user: state.user
          ? { ...state.user, ...(hostData as Partial<UserData>), impersonateId }
          : null,
      }));
    } catch {
      // Failed
    }
  },

  removeImpersonate: async () => {
    removeImpersonateIdStorage();
    // Reload original host data
    await get().getHostData();
    set((state) => ({
      user: state.user ? { ...state.user, impersonateId: undefined } : null,
    }));
  },

  // -- Login / Signup status --
  setLoginError: (error) => set({ loginError: error, loginSuccess: false }),
  setLoginSuccess: (success) =>
    set({ loginSuccess: success, loginError: null }),
  setSignupError: (error) => set({ signupError: error, signupSuccess: false }),
  setSignupSuccess: (success) =>
    set({ signupSuccess: success, signupError: null }),

  // -- Connection data --
  fetchConnectionData: async () => {
    try {
      const data = await hostService.getConnectionData();
      set({ connectionData: data as unknown as ConnectionData });
    } catch {
      // Non-critical — fail silently
    }
  },

  // -- Universities --
  fetchUniversitiesData: async () => {
    try {
      const data = await hostService.getUniversitiesData();
      set({ universitiesData: data });
    } catch {
      // Non-critical
    }
  },

  // -- Dialog toggles --
  openReferralDialog: () =>
    set((state) => ({ dialogs: { ...state.dialogs, referralOpen: true } })),
  closeReferralDialog: () =>
    set((state) => ({ dialogs: { ...state.dialogs, referralOpen: false } })),

  openPricingDialog: (title = "", text = "", hideButtons = false) =>
    set((state) => ({
      dialogs: {
        ...state.dialogs,
        pricingOpen: true,
        pricingTitle: title,
        pricingText: text,
        pricingHideButtons: hideButtons,
      },
    })),
  closePricingDialog: () =>
    set((state) => ({ dialogs: { ...state.dialogs, pricingOpen: false } })),

  openPremiumDialog: () =>
    set((state) => ({ dialogs: { ...state.dialogs, premiumOpen: true } })),
  closePremiumDialog: () =>
    set((state) => ({ dialogs: { ...state.dialogs, premiumOpen: false } })),

  openImportAttendeesDialog: () =>
    set((state) => ({
      dialogs: { ...state.dialogs, importAttendeesOpen: true },
    })),
  closeImportAttendeesDialog: () =>
    set((state) => ({
      dialogs: { ...state.dialogs, importAttendeesOpen: false },
    })),

  openImportGradingDialog: () =>
    set((state) => ({
      dialogs: { ...state.dialogs, importGradingOpen: true },
    })),
  closeImportGradingDialog: () =>
    set((state) => ({
      dialogs: { ...state.dialogs, importGradingOpen: false },
    })),

  // -- Reset --
  reset: () => set({ ...initialState, init: true }),
}));
