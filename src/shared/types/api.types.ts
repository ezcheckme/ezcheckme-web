/**
 * API layer types.
 * Generic request/response shapes for the API client.
 */

/** Standard API response wrapper */
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

/** API error response */
export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

/** HTTP methods supported by the API client */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

/** Request options for the API client */
export interface RequestOptions {
  /** API path (one of the API_PATHS constants) */
  path: string;
  /** HTTP method */
  method: HttpMethod;
  /** Request body (will be JSON-serialized) */
  body?: unknown;
  /** URL query parameters */
  queryParams?: Record<string, string | number | boolean>;
  /** Additional headers */
  headers?: Record<string, string>;
  /** Whether to encrypt the body before sending */
  encrypt?: boolean;
  /** Custom encryption key (defaults to ENCRYPTION_KEYS.INFO) */
  encryptionKey?: string;
  /** Whether to normalize _id → id on the response */
  normalizeIds?: boolean;
  /** Whether to decompress pako-compressed response */
  decompress?: boolean;
}

/** Notification / message entity */
export interface Notification {
  id: string;
  type: string;
  message: string;
  timestamp: number;
  read?: boolean;
}

/** Course message entity */
export interface CourseMessage {
  id: string;
  _id?: string;
  courseId: string;
  title: string;
  message: string;
  hostId: string;
  sentAt: number;
  /** Created timestamp (alias for sentAt) */
  createdAt?: number;
  /** Number of students who read this message */
  readCount?: number;
  /** Delivery status */
  status?: string;
}

/** Discount/coupon info */
export interface DiscountCodeInfo {
  code: string;
  valid: boolean;
  discount?: number;
  type?: "percent" | "fixed";
}

/** Posts data (from WordPress API) */
export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  link: string;
  date: string;
  featuredImage?: string;
}

/** Contact form payload */
export interface ContactFormPayload {
  name: string;
  email: string;
  message: string;
  subject?: string;
}

/** Excel config titles */
export interface ExcelEmailTitles {
  titles: string[];
}

/** Blocked email domains list */
export interface BlockedEmailDomains {
  domains: string[];
  /** 'allowlist' | 'blocklist' */
  mode: string;
}
