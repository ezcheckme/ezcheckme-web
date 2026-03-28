/**
 * User domain types.
 * Extracted from auth store state shape (redux-store.md §1.4).
 */

import type { UserRole } from "@/config/constants";

/** User data payload stored in auth state */
export interface UserData {
  displayName: string;
  photoURL: string;
  email: string;
  id: string;
  shortcuts: string[];
  settings: UserSettings;
  theme?: {
    bgColor?: string;
    color?: string;
    image?: string;
    text?: string;
  };
  /** Host-specific fields */
  plan?: string;
  premium?: boolean;
  institution?: string;
  groupmanager?: boolean;
  facultyManager?: boolean;
  groupId?: string;
  rooms?: string[];
  language?: string;
  /** Number of trailing digits to show for student IDs */
  studentiddigitstoshow?: number;
  /** Session duration preference (minutes) */
  sessionDuration?: number;
  /** Field check-in enabled */
  fieldCheckinEnabled?: boolean;
  /** Excel import enabled */
  excelImportEnabled?: boolean;
  /** Location radius tolerance (meters) */
  locationRadiusTolerance?: number;
  /** Referral code */
  referralCode?: string;
  /** Cookie consent */
  cookieConsent?: boolean;
  /** Pricing tier */
  pricingTier?: string;
  /** Session notification enabled */
  sessionStartNotification?: boolean;
  /** Sessions counter */
  sessionsCounter?: number;
  /** Impersonation flag */
  impersonateId?: string;
  impid?: string;
  /** Group invitations */
  invitations?: GroupInvitation[];
  /** Is invited to group */
  invitationToGroup?: string | Record<string, unknown>;
  /** Is superadmin */
  superadmin?: boolean;
  /** Payment account ID */
  accountId?: string;
  /** Faculty manager group info */
  facultyData?: {
    name?: string;
  };
  /** Extended group info */
  groupData?: {
    id?: string;
    _id?: string;
    name?: string;
    admin?: string;
  };
  /** Current discount code */
  discountCode?: string;
  /** Faculty list (institutional) — conditional field in course dialog */
  faculties?: Array<{ _id?: string; id?: string; name: string }>;
  /** Auto-mode enabled */
  autoMode?: boolean;
  /** Auto-mode rooms list */
  autoModeRooms?: string[];
  /** Disable geolocation feature */
  disablegeolocation?: boolean;
  /** IVR phone check-in enabled for user */
  ivrenabled?: boolean;
  /** Enable course-level dynamic join lock control */
  enableCourseDynamicJoinLock?: boolean;
  /** Disable shift courses feature */
  disableShiftCourses?: boolean;
  /** Session start notification enabled for user */
  sessionStartNotificationEnabled?: boolean;
  /** Session start notification enabled by default for new courses */
  sessionStartNotificationEnabledByDefault?: boolean;
  /** Legacy group ID */
  group?: string;
  /** Admin rights configuration */
  adminRights?: Record<string, boolean>;
  /** Whether user has created first course */
  createdFirstCourse?: boolean;
  /** Cookie consent timestamp */
  cookiesAgreed?: number | string;
}

export interface UserSettings {
  layout?: Record<string, unknown>;
  customScrollbars?: boolean;
  theme?: Record<string, unknown>;
}

export interface GroupInvitation {
  groupId: string;
  groupName: string;
  invitedBy: string;
}

/** Full user state as stored in the auth slice */
export interface User {
  role: UserRole;
  data: UserData;
  fetched: boolean;
}

/** Connection/geo data from ipapi.co */
export interface ConnectionData {
  ip: string;
  city: string;
  region: string;
  country: string;
  country_name: string;
  country_code: string;
  continent_code: string;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset: string;
  currency: string;
  org: string;
}

/** University data (static JSON bundle) */
export interface University {
  id: string;
  name: string;
  country?: string;
}
