/**
 * Cognito authentication service.
 * Port of AwsCognitoService.js (242 lines) using amazon-cognito-identity-js.
 * Handles signup, login, verification, password reset, session management.
 */

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession,
} from "amazon-cognito-identity-js";
import { config } from "@/config/env";

// ---------------------------------------------------------------------------
// Pool configuration
// ---------------------------------------------------------------------------

let userPool: CognitoUserPool;

function getUserPool(): CognitoUserPool {
  if (!userPool) {
    userPool = new CognitoUserPool({
      UserPoolId: config.cognito.poolId,
      ClientId: config.cognito.clientId,
    });
  }
  return userPool;
}

function getCognitoUser(email: string): CognitoUser {
  return new CognitoUser({
    Username: email,
    Pool: getUserPool(),
  });
}

// ---------------------------------------------------------------------------
// Session helpers
// ---------------------------------------------------------------------------

/** Decode a JWT token payload */
function decodeToken(token: string): Record<string, unknown> {
  const payload = token.split(".")[1];
  return JSON.parse(atob(payload));
}

/** Extract host ID from Cognito ID token — checks custom:hostid */
export function getHostIdFromToken(idToken: string): string | null {
  const decoded = decodeToken(idToken);
  return (decoded["custom:hostid"] as string) ?? null;
}

/** Fetch user attributes from the currently authenticated Cognito user */
export function getUserAttributes(): Promise<Record<string, string>> {
  return new Promise((resolve) => {
    const currentUser = getUserPool().getCurrentUser();
    if (!currentUser) {
      resolve({});
      return;
    }

    currentUser.getSession(
      (err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session) {
          resolve({});
          return;
        }

        currentUser.getUserAttributes((attrErr, attributes) => {
          if (attrErr || !attributes) {
            resolve({});
            return;
          }

          const result: Record<string, string> = {};
          for (const attr of attributes) {
            result[attr.getName()] = attr.getValue();
          }
          return resolve(result);
        });
      },
    );
  });
}

/** Check if a session token is still valid (> threshold seconds remaining) */
function isTokenValid(
  session: CognitoUserSession,
  thresholdSeconds = 3000,
): boolean {
  const expiration = session.getIdToken().getExpiration();
  const now = Math.floor(Date.now() / 1000);
  return expiration - now > thresholdSeconds;
}

// ---------------------------------------------------------------------------
// Auth methods
// ---------------------------------------------------------------------------

/** Sign up a new host user */
export function signUp(
  email: string,
  password: string,
  name: string,
  referralCode?: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const attributes: CognitoUserAttribute[] = [
      new CognitoUserAttribute({ Name: "email", Value: email }),
      new CognitoUserAttribute({ Name: "name", Value: name }),
    ];

    if (referralCode) {
      attributes.push(
        new CognitoUserAttribute({
          Name: "custom:referralCode",
          Value: referralCode,
        }),
      );
    }

    getUserPool().signUp(email, password, attributes, [], (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

/** Sign in with email and password */
export function signIn(
  email: string,
  password: string,
): Promise<CognitoUserSession> {
  return new Promise((resolve, reject) => {
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const user = getCognitoUser(email);
    user.authenticateUser(authDetails, {
      onSuccess: (session) => {
        resolve(session);
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
}

/** Confirm signup with verification code */
export function confirmSignUp(email: string, code: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const user = getCognitoUser(email);
    user.confirmRegistration(code, true, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

/** Resend verification code */
export function resendConfirmationCode(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const user = getCognitoUser(email);
    user.resendConfirmationCode((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

/** Initiate forgot password flow */
export function forgotPassword(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const user = getCognitoUser(email);
    user.forgotPassword({
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
    });
  });
}

/** Complete forgot password with new password and code */
export function forgotPasswordSubmit(
  email: string,
  code: string,
  newPassword: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const user = getCognitoUser(email);
    user.confirmPassword(code, newPassword, {
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
    });
  });
}

/** Get current session (auto-login check) */
export function getCurrentSession(): Promise<CognitoUserSession | null> {
  return new Promise((resolve) => {
    const currentUser = getUserPool().getCurrentUser();
    if (!currentUser) {
      resolve(null);
      return;
    }

    currentUser.getSession(
      (err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session) {
          resolve(null);
          return;
        }

        if (!isTokenValid(session)) {
          // Try to refresh
          const refreshToken = session.getRefreshToken();
          currentUser.refreshSession(
            refreshToken,
            (
              refreshErr: Error | null,
              refreshedSession: CognitoUserSession | null,
            ) => {
              if (refreshErr || !refreshedSession) {
                resolve(null);
                return;
              }
              resolve(refreshedSession);
            },
          );
          return;
        }

        resolve(session);
      },
    );
  });
}

/** Refresh the current session token */
export function refreshToken(): Promise<CognitoUserSession | null> {
  return new Promise((resolve) => {
    const currentUser = getUserPool().getCurrentUser();
    if (!currentUser) {
      resolve(null);
      return;
    }

    currentUser.getSession(
      (err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session) {
          resolve(null);
          return;
        }

        const refresh = session.getRefreshToken();
        currentUser.refreshSession(
          refresh,
          (
            refreshErr: Error | null,
            refreshedSession: CognitoUserSession | null,
          ) => {
            if (refreshErr || !refreshedSession) {
              resolve(null);
              return;
            }
            resolve(refreshedSession);
          },
        );
      },
    );
  });
}

/** Get the current access token string (for API auth headers) */
export function getAccessToken(): Promise<string | null> {
  return getCurrentSession().then((session) => {
    if (!session) return null;
    return session.getAccessToken().getJwtToken();
  });
}

/** Get the current ID token string */
export function getIdToken(): Promise<string | null> {
  return getCurrentSession().then((session) => {
    if (!session) return null;
    return session.getIdToken().getJwtToken();
  });
}

/** Sign out current user */
export function signOut(): void {
  const currentUser = getUserPool().getCurrentUser();
  if (currentUser) {
    currentUser.signOut();
  }
}
