/**
 * Constants for Billing and Pricing, extracted from legacy config.js
 */

export const BLUESNAP_URLS = {
  DEV: "https://sandbox.bluesnap.com/buynow/checkout?merchantid=900609&language=ENGLISH&ondemand=Y&enc=6TMjlVmfcek3BvudyKZt2VDSnPXlR1x%2BOKwWBooSko8mAYH86fByvFXM7UGBrJnnqh0R6UbbDq1Hn30X9FIO1Z11wh%2BLdgBQvJZH8Gmo3J99YOb7HNG4SluWfvRsw%2FcHx9ruJ7p9FDB%2Bx1BX9lmC8L0EZBCH6JnJpp0rJONa7s9lgIS3Srh8FWF2pX1W6hPKfJXyv%2Fagm4lOEVIsUGJRmAR%2BmK9ZCN6xSfT1tEhcfaJf9h1EO84TTj2jLYldO%2Fndcomh8CEF%2F2n6mF0eBjcQAjwIHlxgvvp9emfaTD0QT0vHBN6zAQ6EQFabWGKpiDDrLgzd52EEuJs1vnLtP5G39H1g5vsc0bhKW5Z%2B9GzD9wdi1z%2BszSWakaV5HnuKPvvC%2FzTbsSp72FAp67moasxQqRFVl1qQFnsOfXxvg10o5fLqeX6CSmkWuBn1wa5pl%2F1Md33azJt7xSmFKUmcVhQ5Y%2BgFlwJ0tFKWpjnv%2B2VhgIby8K6HMzBmvt9BElrkn5XSnARSPqVvs71jX4opQ48E24NG%2B0W0g1dy0igVGWdq%2BkdAJK2dReASTA0Welk4nDlPIhvsgb1Xrn0D81CL8TecabyTii8J0XfVWdk6qywqMvFPP6%2BXN79KpvoHMWuh6nqP",
  PROD: "https://checkout.bluesnap.com/buynow/checkout?merchantid=1247292&language=ENGLISH&ondemand=Y&enc=6TMjlVmfcek3BvudyKZt2VDSnPXlR1x%2BOKwWBooSko8mAYH86fByvFXM7UGBrJnnqh0R6UbbDq1Hn30X9FIO1Z11wh%2BLdgBQvJZH8Gmo3J99YOb7HNG4SluWfvRsw%2FcHx9ruJ7p9FDB%2Bx1BX9lmC8L0EZBCH6JnJpp0rJONa7s9lgIS3Srh8FWF2pX1W6hPKfJXyv%2Fagm4lOEVIsUGJRmAR%2BmK9ZCN6xSfT1tEhcfaJf9h1EO84TTj2jLYldO%2Fndcomh8CEF%2F2n6mF0eBjcQAjwIHlxgvvp9emfaTD0QT0vHBN6zAQ6EQFabWGKpiDDrLgzd52EEuJs1vnLtP5G39H1g5vsc0bhKW5Z%2B9GzD9wdi1z%2BszSWakaV5HnuKPvvC%2FzTbsSp72FAp67moasxQqRFVl1qQFnsOfXxvg10o5fLqeX6CSmkWuBn1wa5pl%2F1Md33azJt7xSmFKUmcVhQ5Y%2BgFlwJ0tFKWpjnv%2B2VhgIby8K6HMzBmvt9BElrkn5XSnARSPqVvs71jX4opQ48E24NG%2B0W0g1dy0igVGWdq%2BkdAJK2dReASTA0Welk4nDlPIhvsgb1Xrn0D81CL8TecabyTii8J0XfVWdk6qywqMvFPP6%2BXN79KpvoHMWuh6nqP",
};

export const PRICING_TIERS = {
  CLASSROOM: "CLASSROOM",
  SHIFTS: "SHIFTS",
  COMBINED: "COMBINED",
} as const;

export const PLAN_ACTIONS = {
  CURRENT_PLAN: "CURRENT PLAN",
  CHANGE_PLAN: "CHANGE PLAN...",
  GET_STARTED: "GET STARTED",
  CONTACT_US: "CONTACT US",
  UPGRADE: "UPGRADE",
} as const;

export const PRICING_TIERS_TITLES: Record<string, string> = {
  [PRICING_TIERS.CLASSROOM]: "Classroom",
  [PRICING_TIERS.SHIFTS]: "Shifts",
  [PRICING_TIERS.COMBINED]: "Ultimate",
};

export const PRICING_TIERS_DESCRIPTIONS: Record<string, string> = {
  [PRICING_TIERS.CLASSROOM]:
    'Run real-time attendance Check-in sessions for an entire class, in the classroom and/or remote lessons ("Classic” EZCheck.me )',
  [PRICING_TIERS.SHIFTS]:
    "Have your attendees self-check-in and out individually in remote locations, for example, during clinical rotation shifts.",
  [PRICING_TIERS.COMBINED]:
    "Unleash the power of EZCheck.me Ultimate for tracking attendance in both Classrooms and Remote Shifts.",
};

export const PRICING = [
  { "Up to 50 attendees": ["9.90", "12.90", "17.90"] },
  { "51 to 100 attendees": ["18.90", "24.90", "34.90"] },
  { "101 to 250 attendees": ["39.90", "51.90", "71.90"] },
  { "251 to 500 attendees": ["74.90", "97.90", "134.90"] },
  { "501 and up": ["CONTACT US", "CONTACT US", "CONTACT US"] },
];

export const PRICING_FEATURE_INFO = [
  "Maximum number of host accounts",
  "Maximum number of concurrent Classroom Courses",
  "Maximum Number of sessions in classroom course. A session is counted when 5 or more attendees check-in",
  "Maximum number of concurrent Shifts Courses",
  "Maximum number of shifts per Shifts Course",
  "View the attendance reports online",
  "Send instant messages to your course attendees and receive detailed read recipes",
  "Download ultra-detailed attendance reports in Excel format",
  "Brand your sessions with your organization colors and logo",
  "Ideal for hybrid in-class/ on-line settings, as it indicates who attended the lesson from classroom and who from a remote location",
  "Dashboard with statistics and insights about your course’s attendance",
  "Institutional Dashboard with statistics and insights about the entire institutional attendance data which enable comparisons between different academic units, courses, and instructors",
  "Institutional Admin account. The Admin can manage the institute’s hosts and can view and download all the institute attendance reports",
  "Institutional-level attendance reports",
  "Integrate the attendance reports with external lists, from external LMS platforms, such as Moodle",
  "Accelerated Support experience, with faster response times",
];

// Feature rows: [Name, Basic, Premium, Institutional]
export const PRICING_FEATURES_CLASSROOM = [
  ["Host accounts", "One", "One", "Unlimited"],
  ["Number of Classroom Courses", "One", "Unlimited", "Unlimited"],
  [">>- Classroom Check-in Sessions", "7", "Unlimited", "Unlimited"],
  ["Number of Shifts Courses", "One", "One", "Unlimited"],
  [">>- Shift Check-ins", "Unlimited", "Unlimited", "Unlimited"],
  ["Online Reports", "v", "v", "v"],
  ["Instant Messages", "v", "v", "v"],
  ["Excel Reports", "x", "v", "v"],
  ["Branded Sessions", "x", "v", "v"],
  ["Geolocation", "x", "v", "v"],
  ["Course Insights Dashboard", "x", "v", "v"],
  ["Institutional Insights Dashboard", "x", "x", "v", "new"],
  ["Multiple Hosts Management", "x", "x", "v"],
  ["Institutional Reports", "x", "x", "v"],
  ["Integration with External Reports", "x", "x", "v"],
  ["Enhanced Support", "x", "x", "v"],
];

export const PRICING_FEATURES_SHIFTS = [
  ["Host accounts", "One", "One", "Unlimited"],
  ["Number of Classroom Courses", "One", "One", "Unlimited"],
  [">>- Classroom Check-in Sessions", "7", "7", "Unlimited"],
  ["Number of Shifts Courses", "One", "Unlimited", "Unlimited"],
  [">>- Shift Check-ins", "Unlimited", "Unlimited", "Unlimited"],
  ["Online Reports", "v", "v", "v"],
  ["Instant Messages", "v", "v", "v"],
  ["Excel Reports", "x", "v", "v"],
  ["Branded Sessions", "x", "v", "v"],
  ["Geolocation", "x", "v", "v"],
  ["Course Insights Dashboard", "x", "v", "v"],
  ["Institutional Insights Dashboard", "x", "x", "v", "new"],
  ["Multiple Hosts Management", "x", "x", "v"],
  ["Institutional Reports", "x", "x", "v"],
  ["Integration with External Reports", "x", "x", "v"],
  ["Enhanced Support", "x", "x", "v"],
];

export const PRICING_FEATURES_COMBINED = [
  ["Host accounts", "One", "One", "Unlimited"],
  ["Number of Classroom Courses", "One", "Unlimited", "Unlimited"],
  [">>- Classroom Check-in Sessions", "7", "Unlimited", "Unlimited"],
  ["Number of Shifts Courses", "One", "Unlimited", "Unlimited"],
  [">>- Shift Check-ins", "Unlimited", "Unlimited", "Unlimited"],
  ["Online Reports", "v", "v", "v"],
  ["Instant Messages", "v", "v", "v"],
  ["Excel Reports", "x", "v", "v"],
  ["Branded Sessions", "x", "v", "v"],
  ["Geolocation", "x", "v", "v"],
  ["Course Insights Dashboard", "x", "v", "v"],
  ["Institutional Insights Dashboard", "x", "x", "v", "new"],
  ["Multiple Hosts Management", "x", "x", "v"],
  ["Institutional Reports", "x", "x", "v"],
  ["Integration with External Reports", "x", "x", "v"],
  ["Enhanced Support", "x", "x", "v"],
];

export function getFeatureMap(tabIndex: number) {
  if (tabIndex === 1) return PRICING_FEATURES_SHIFTS;
  if (tabIndex === 2) return PRICING_FEATURES_COMBINED;
  return PRICING_FEATURES_CLASSROOM;
}
