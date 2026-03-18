/**
 * AWS Credentials Service.
 * Exchanges a Cognito ID token for temporary AWS credentials via the
 * Identity Pool. These credentials are used to sign API Gateway requests
 * with SigV4 (the legacy API uses IAM authorization).
 */

import { config } from "@/config/env";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration: number; // epoch ms
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let cachedCredentials: AwsCredentials | null = null;
let cachedIdToken: string | null = null;

// ---------------------------------------------------------------------------
// Internal helpers — direct Cognito Identity REST calls
// ---------------------------------------------------------------------------

const COGNITO_IDENTITY_ENDPOINT = `https://cognito-identity.${config.cognito.region}.amazonaws.com`;

/** Build the "Logins" map for the Identity Pool */
function buildLoginsMap(idToken: string): Record<string, string> {
  const provider = `cognito-idp.${config.cognito.region}.amazonaws.com/${config.cognito.poolId}`;
  return { [provider]: idToken };
}

/** Call Cognito Identity service (GetId / GetCredentialsForIdentity) */
async function cognitoIdentityCall(
  target: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const res = await fetch(COGNITO_IDENTITY_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": `AWSCognitoIdentityService.${target}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `CognitoIdentity.${target} failed (${res.status}): ${text}`,
    );
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get temporary AWS credentials for the given Cognito ID token.
 * Caches credentials and only refreshes when they expire (with a 60s buffer).
 */
export async function getAwsCredentials(
  idToken: string,
): Promise<AwsCredentials> {
  // Return cached if still valid (60s buffer)
  if (
    cachedCredentials &&
    cachedIdToken === idToken &&
    cachedCredentials.expiration > Date.now() + 60_000
  ) {
    return cachedCredentials;
  }

  const logins = buildLoginsMap(idToken);

  // Step 1: GetId — get the Identity ID
  const idResult = await cognitoIdentityCall("GetId", {
    IdentityPoolId: config.cognito.identityPoolId,
    Logins: logins,
  });
  const identityId = idResult.IdentityId as string;

  // Step 2: GetCredentialsForIdentity — exchange for temp AWS creds
  const credResult = await cognitoIdentityCall("GetCredentialsForIdentity", {
    IdentityId: identityId,
    Logins: logins,
  });

  const creds = credResult.Credentials as {
    AccessKeyId: string;
    SecretKey: string;
    SessionToken: string;
    Expiration: number;
  };

  cachedCredentials = {
    accessKeyId: creds.AccessKeyId,
    secretAccessKey: creds.SecretKey,
    sessionToken: creds.SessionToken,
    expiration: creds.Expiration * 1000, // API returns seconds, we want ms
  };
  cachedIdToken = idToken;

  return cachedCredentials;
}

/** Clear cached credentials (call on logout) */
export function clearAwsCredentials(): void {
  cachedCredentials = null;
  cachedIdToken = null;
}
