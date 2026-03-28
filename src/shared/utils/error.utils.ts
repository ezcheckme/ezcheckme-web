/**
 * Centralized error handling utility.
 * Provides consistent error logging and user-facing feedback
 * across the application.
 */

import { useUIStore } from "@/shared/store/ui.store";

interface HandleErrorOptions {
  /** Show user-facing snackbar. Default: true */
  toast?: boolean;
  /** Log to console.error. Default: true */
  log?: boolean;
  /** Custom user-facing message (overrides error.message) */
  message?: string;
  /** Snackbar variant. Default: "error" */
  variant?: "error" | "warning" | "info";
  /** Re-throw after handling. Default: false */
  rethrow?: boolean;
}

/**
 * Handle an error with consistent logging and optional user notification.
 *
 * @param error    The caught error (unknown type from catch blocks)
 * @param context  A label identifying where the error occurred (e.g. "auth.login")
 * @param options  Configuration for toast/log behavior
 *
 * @example
 * ```ts
 * try {
 *   await api.updateUser(data);
 * } catch (error) {
 *   handleError(error, "auth.updateUser", { message: "Failed to save profile" });
 * }
 * ```
 */
export function handleError(
  error: unknown,
  context: string,
  options: HandleErrorOptions = {},
): void {
  const {
    toast = true,
    log = true,
    message,
    variant = "error",
    rethrow = false,
  } = options;

  const errMsg = error instanceof Error ? error.message : String(error);

  if (log) {
    console.error(`[${context}]`, errMsg, error);
  }

  if (toast) {
    const { showSnackbar } = useUIStore.getState();
    showSnackbar(message || errMsg, variant);
  }

  if (rethrow) throw error;
}
