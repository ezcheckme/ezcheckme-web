/**
 * Billing service — handles plan management, pricing, and payment.
 * Maps to legacy billing endpoints and Stripe integration.
 */

import { API_PATHS } from "@/config/constants";
import { get, post } from "./api-client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  features: string[];
  sessionsLimit: number | null; // null = unlimited
  recommended?: boolean;
}

export interface SubscriptionInfo {
  planId: string;
  planName: string;
  status: "active" | "canceled" | "past_due" | "trialing";
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface DiscountCodeResult {
  valid: boolean;
  discount?: number;
  code?: string;
  message?: string;
}

// ---------------------------------------------------------------------------
// API methods
// ---------------------------------------------------------------------------

/** Get available pricing plans */
export function getPricingPlans(): Promise<PricingPlan[]> {
  return get<PricingPlan[]>(`${API_PATHS.BILLING}/plans`);
}

/** Get current user's subscription */
export function getSubscription(): Promise<SubscriptionInfo> {
  return get<SubscriptionInfo>(`${API_PATHS.BILLING}/subscription`);
}

/** Create a checkout session for a plan */
export function createCheckoutSession(
  planId: string,
): Promise<{ url: string }> {
  return post<{ url: string }>(`${API_PATHS.BILLING}/checkout`, { planId });
}

/** Create a portal session for managing subscription */
export function createPortalSession(): Promise<{ url: string }> {
  return post<{ url: string }>(`${API_PATHS.BILLING}/portal`, {});
}

/** Change the user's plan */
export function changePlan(newPlanId: string): Promise<SubscriptionInfo> {
  return post<SubscriptionInfo>(`${API_PATHS.BILLING}/change-plan`, {
    planId: newPlanId,
  });
}

/** Cancel subscription */
export function cancelSubscription(): Promise<void> {
  return post<void>(`${API_PATHS.BILLING}/cancel`, {});
}

/** Validate a discount code */
export function validateDiscountCode(
  code: string,
): Promise<DiscountCodeResult> {
  return post<DiscountCodeResult>(`${API_PATHS.BILLING}/discount`, { code });
}

/** Apply discount code to current subscription */
export function applyDiscountCode(code: string): Promise<{ success: boolean }> {
  return post<{ success: boolean }>(`${API_PATHS.BILLING}/apply-discount`, {
    code,
  });
}

/** Get billing history */
export function getBillingHistory(): Promise<
  Array<{
    id: string;
    date: string;
    amount: number;
    currency: string;
    status: string;
    description: string;
  }>
> {
  return get(`${API_PATHS.BILLING}/history`);
}
