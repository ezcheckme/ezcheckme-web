/**
 * Geo/location utility functions.
 * Port of geoService.js (99 lines, 6 exports).
 */

import type { ConnectionData } from "@/shared/types";

/** Extract country name from connection data */
export function getCountry(connection: ConnectionData | null): string {
  return connection?.country_name || "";
}

/** Check if connection is from Israel */
export function isIsrael(connection: ConnectionData | null): boolean {
  return connection?.country_name === "Israel";
}

/**
 * Get location radius tolerance in meters.
 * Priority: course setting → user setting → config default → 50m fallback
 */
export function getLocationRadiusTolerance(
  user: { data: { locationRadiusTolerance?: number } },
  course?: { location?: { radius?: number } },
  configDefault?: number,
): number {
  return (
    course?.location?.radius ??
    user.data.locationRadiusTolerance ??
    configDefault ??
    50
  );
}

/**
 * Haversine formula for distance between two lat/lng points.
 * @param lat1 - Latitude of point 1
 * @param lon1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lon2 - Longitude of point 2
 * @param unit - 'K' (km), 'N' (nautical miles), 'm' (meters, default)
 * @returns Distance in the specified unit
 */
export function getLocationDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  unit: "K" | "N" | "m" = "m",
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const radlat1 = (Math.PI * lat1) / 180;
  const radlat2 = (Math.PI * lat2) / 180;
  const theta = lon1 - lon2;
  const radtheta = (Math.PI * theta) / 180;

  let dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

  dist = Math.min(dist, 1);
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515; // statute miles

  switch (unit) {
    case "K":
      return dist * 1.609344; // km
    case "N":
      return dist * 0.8684; // nautical miles
    case "m":
    default:
      return dist * 1.609344 * 1000; // meters
  }
}

/**
 * Location verification status.
 * @returns 'verified' | 'remote' | 'undetected'
 */
export function getLocationStatus(
  checkinLocation: { lat: number; lng: number } | null | undefined,
  courseLocation: { lat: number; lng: number } | null | undefined,
  radiusTolerance: number,
): "verified" | "remote" | "undetected" {
  if (!checkinLocation?.lat || !checkinLocation?.lng) return "undetected";
  if (!courseLocation?.lat || !courseLocation?.lng) return "undetected";

  const distance = getLocationDistance(
    checkinLocation.lat,
    checkinLocation.lng,
    courseLocation.lat,
    courseLocation.lng,
  );

  return distance <= radiusTolerance ? "verified" : "remote";
}

/** Color code for field check-in location status */
export function getFieldLocationStatusColor(status: string): string {
  switch (status) {
    case "verified":
      return "#4CAF50"; // green
    case "remote":
      return "#FF9800"; // orange
    case "undetected":
      return "#9E9E9E"; // grey
    case "late":
      return "#F44336"; // red
    case "pending":
      return "#2196F3"; // blue
    case "denied":
      return "#F44336"; // red
    default:
      return "#9E9E9E";
  }
}
