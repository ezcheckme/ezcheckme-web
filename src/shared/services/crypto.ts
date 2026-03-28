/**
 * AES encryption/decryption using CryptoJS.
 * Backward-compatible with legacy app's CryptoJS implementation.
 */

import CryptoJS from "crypto-js";
import { ENCRYPTION_KEYS } from "@/config/constants";

/**
 * Encrypt data using AES with the specified key.
 * @param data - Data to encrypt (string or object — objects are JSON-serialized)
 * @param key - Encryption key (defaults to ENCRYPTION_KEYS.INFO)
 * @returns Encrypted string
 */
export function encrypt(
  data: string | Record<string, unknown>,
  key: string = ENCRYPTION_KEYS.INFO,
): string {
  const plaintext = typeof data === "string" ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(plaintext, key).toString();
}

/**
 * Decrypt AES-encrypted string.
 * @param ciphertext - Encrypted string
 * @param key - Encryption key (defaults to ENCRYPTION_KEYS.INFO)
 * @returns Decrypted string
 */
export function decrypt(
  ciphertext: string,
  key: string = ENCRYPTION_KEYS.INFO,
): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Decrypt and parse JSON data.
 * @param ciphertext - Encrypted JSON string
 * @param key - Encryption key
 * @returns Parsed object or null if decryption fails
 */
export function decryptJSON<T = unknown>(
  ciphertext: string,
  key: string = ENCRYPTION_KEYS.INFO,
): T | null {
  try {
    const decrypted = decrypt(ciphertext, key);
    return JSON.parse(decrypted) as T;
  } catch (error) {
    console.error("[crypto.decryptJSON]", error);
    return null;
  }
}
