/**
 * Typed localStorage wrapper with encrypt/decrypt support.
 * Key names match legacy app exactly for migration compatibility.
 */

import { STORAGE_KEYS } from "@/config/constants";
import { encrypt, decryptJSON } from "./crypto";

// ---------------------------------------------------------------------------
// Plain read/write
// ---------------------------------------------------------------------------

export function getItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error("[storage.getItem]", key, error);
    return null;
  }
}

export function setItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error("[storage.setItem]", key, error);
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("[storage.removeItem]", key, error);
  }
}

// ---------------------------------------------------------------------------
// Identity helpers (host / attendee / impersonation)
// ---------------------------------------------------------------------------

/** Get the effective host ID, considering impersonation */
export function getEffectiveHostId(): string | null {
  return getItem(STORAGE_KEYS.IMPERSONATE_ID) || getItem(STORAGE_KEYS.HOST_ID);
}

export function getHostId(): string | null {
  return getItem(STORAGE_KEYS.HOST_ID);
}

export function setHostId(id: string): void {
  setItem(STORAGE_KEYS.HOST_ID, id);
}

export function getAttendeeId(): string | null {
  return getItem(STORAGE_KEYS.ATTENDEE_ID);
}

export function setAttendeeId(id: string): void {
  setItem(STORAGE_KEYS.ATTENDEE_ID, id);
}

export function getImpersonateId(): string | null {
  return getItem(STORAGE_KEYS.IMPERSONATE_ID);
}

export function setImpersonateId(id: string): void {
  setItem(STORAGE_KEYS.IMPERSONATE_ID, id);
}

export function removeImpersonateId(): void {
  removeItem(STORAGE_KEYS.IMPERSONATE_ID);
}

// ---------------------------------------------------------------------------
// Encrypted storage helpers
// ---------------------------------------------------------------------------

/**
 * Store encrypted JSON data.
 * @param key - localStorage key
 * @param data - Data to encrypt and store
 * @param encryptionKey - AES key to use
 */
export function setEncrypted(
  key: string,
  data: Record<string, unknown>,
  encryptionKey: string,
): void {
  const encrypted = encrypt(data, encryptionKey);
  setItem(key, encrypted);
}

/**
 * Read and decrypt JSON data from localStorage.
 * @param key - localStorage key
 * @param encryptionKey - AES key to use
 * @returns Decrypted data or null
 */
export function getEncrypted<T = unknown>(
  key: string,
  encryptionKey: string,
): T | null {
  const raw = getItem(key);
  if (!raw) return null;
  return decryptJSON<T>(raw, encryptionKey);
}

// ---------------------------------------------------------------------------
// Clear all auth-related storage (logout)
// ---------------------------------------------------------------------------

export function clearAuthStorage(): void {
  removeItem(STORAGE_KEYS.HOST_ID);
  removeItem(STORAGE_KEYS.ATTENDEE_ID);
  removeItem(STORAGE_KEYS.IMPERSONATE_ID);
  removeItem(STORAGE_KEYS.SESSION_ACTIVITY);
  removeItem(STORAGE_KEYS.SESSION_INFO);
  removeItem(STORAGE_KEYS.SESSION_ACTION);
}
