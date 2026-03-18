/**
 * Base HTTP API client.
 * Replaces the Amplify API module with a typed fetch-based client.
 * Uses AWS SigV4 signing via aws4fetch for IAM-authenticated API Gateway.
 * Preserves the _id → id normalization behavior from the legacy EZDataService.
 */

import pako from "pako";
import { AwsClient } from "aws4fetch";
import { config, isDev } from "@/config/env";
import { ENCRYPTION_KEYS } from "@/config/constants";
import { encrypt } from "./crypto";
import { getEffectiveHostId } from "./storage";
import { getAwsCredentials, clearAwsCredentials } from "./aws-credentials";
import type { RequestOptions } from "@/shared/types/api.types";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Normalize API response: remap `_id` to `id`.
 * Matches legacy `formatResult()` — throws if both `_id` and `id` exist.
 */
function normalizeIds<T>(data: T): T {
  if (data === null || data === undefined) return data;

  if (Array.isArray(data)) {
    return data.map((item) => normalizeIds(item)) as T;
  }

  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if ("_id" in obj) {
      if ("id" in obj && obj.id !== obj._id) {
        throw new Error(
          "API response contains both _id and id with different values. Use force option to override.",
        );
      }
      const { _id, ...rest } = obj;
      return normalizeIds({ ...rest, id: _id }) as T;
    }
    // Recurse into nested objects
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = normalizeIds(value);
    }
    return result as T;
  }

  return data;
}

/** Build full URL with query parameters */
function buildUrl(
  path: string,
  queryParams?: Record<string, string | number | boolean>,
): string {
  const url = new URL(`${config.api.url}${path}`);
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

// ---------------------------------------------------------------------------
// Auth token injection
// ---------------------------------------------------------------------------

let _authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  _authToken = token;
}

export function clearAuthToken(): void {
  _authToken = null;
  clearAwsCredentials();
}

// ---------------------------------------------------------------------------
// Core request function
// ---------------------------------------------------------------------------

export async function apiRequest<T = unknown>(
  options: RequestOptions,
): Promise<T> {
  const {
    path,
    method,
    body,
    queryParams,
    headers = {},
    encrypt: shouldEncrypt = false,
    encryptionKey = ENCRYPTION_KEYS.INFO,
    normalizeIds: shouldNormalize = true,
    decompress = false,
  } = options;

  const url = buildUrl(path, queryParams);

  // Prepare body
  let processedBody: string | undefined;
  if (body !== undefined) {
    const serialized = JSON.stringify(body);
    processedBody = shouldEncrypt
      ? encrypt(serialized, encryptionKey)
      : serialized;
  }

  let response: Response;

  if (_authToken) {
    // ---- SigV4-signed request ----
    // Get temporary AWS credentials from the Cognito Identity Pool
    const creds = await getAwsCredentials(_authToken);
    const aws = new AwsClient({
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey,
      sessionToken: creds.sessionToken,
      region: config.cognito.region,
      service: "execute-api",
    });

    // aws4fetch .fetch() signs AND sends the request in one step
    response = await aws.fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: processedBody,
    });
  } else {
    // ---- Unauthenticated request ----
    response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: processedBody,
    });
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error");
    const error = {
      status: response.status,
      message: errorBody,
      code: response.statusText,
    };
    if (isDev) {
      console.error(`[API] Error ${method} ${path}:`, error);
    }
    throw error;
  }

  // Parse response
  let data: T;
  if (decompress) {
    const buffer = await response.arrayBuffer();
    const decompressed = pako.inflate(new Uint8Array(buffer), { to: "string" });
    data = JSON.parse(decompressed);
  } else {
    const text = await response.text();
    data = text ? JSON.parse(text) : (undefined as T);
  }

  // Normalize _id → id
  if (shouldNormalize && data !== undefined) {
    data = normalizeIds(data);
  }

  return data;
}

// ---------------------------------------------------------------------------
// Convenience methods
// ---------------------------------------------------------------------------

/** Inject the current host ID into a path template */
export function withHostId(path: string): string {
  const hostId = getEffectiveHostId();
  if (!hostId) throw new Error("No host ID available");
  return path.replace("{hostid}", hostId);
}

export function get<T = unknown>(
  path: string,
  queryParams?: Record<string, string | number | boolean>,
): Promise<T> {
  return apiRequest<T>({ path, method: "GET", queryParams });
}

export function post<T = unknown>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>({ path, method: "POST", body });
}

export function put<T = unknown>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>({ path, method: "PUT", body });
}

export function del<T = unknown>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>({ path, method: "DELETE", body });
}
