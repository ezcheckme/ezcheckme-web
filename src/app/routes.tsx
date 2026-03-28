/**
 * TanStack Router route tree.
 * Central route configuration replacing routesConfig.js (167 lines).
 *
 * All feature pages use React.lazy() for code splitting.
 * Auth-required routes are wrapped with ProtectedRoute.
 */

import { lazy, Suspense } from "react";
import {
  createRouter,
  createRootRoute,
  createRoute,
  redirect,
} from "@tanstack/react-router";
import { AppLayout } from "./layout/AppLayout";
const AdminReportsView = lazy(() =>
  import("@/features/admin/pages/AdminReportsView").then((m) => ({
    default: m.AdminReportsView,
  })),
);
const AdminUsageView = lazy(() =>
  import("@/features/admin/pages/AdminUsageView").then((m) => ({
    default: m.AdminUsageView,
  })),
);
import { SplashScreen } from "@/shared/components/SplashScreen";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import { useCourseStore } from "@/features/courses/store/course.store";

// ---------------------------------------------------------------------------
// Page imports — real pages vs. stubs
// ---------------------------------------------------------------------------

// Real pages (Phase 10)
const HomePage = lazy(() =>
  import("@/features/home/pages/HomePage").then((m) => ({
    default: m.HomePage,
  })),
);
const PricingPage = lazy(() =>
  import("@/features/home/pages/PricingPage").then((m) => ({
    default: m.PricingPage,
  })),
);
const TermsPage = lazy(() =>
  import("@/features/home/pages/LegalPages").then((m) => ({
    default: m.TermsPage,
  })),
);
const PrivacyPage = lazy(() =>
  import("@/features/home/pages/LegalPages").then((m) => ({
    default: m.PrivacyPage,
  })),
);
const AboutPage = lazy(() =>
  import("@/features/home/pages/LegalPages").then((m) => ({
    default: m.AboutPage,
  })),
);
const AccessibilityPage = lazy(() =>
  import("@/features/home/pages/LegalPages").then((m) => ({
    default: m.AccessibilityPage,
  })),
);

// Admin Routes
const AdminLayoutPage = lazy(() =>
  import("@/features/admin/pages/AdminLayoutPage").then((m) => ({
    default: m.AdminLayoutPage,
  })),
);
const AdminDashboardView = lazy(() =>
  import("@/features/admin/pages/AdminPage").then((m) => ({
    default: m.DashboardView,
  })),
);
const AdminAttendeesView = lazy(() =>
  import("@/features/admin/pages/AdminPage").then((m) => ({
    default: m.AttendeesView,
  })),
);
const HostsActivityPage = lazy(() =>
  import("@/features/admin/pages/HostsActivityPage").then((m) => ({
    default: m.HostsActivityPage,
  })),
);
const AttendeesByDomainPage = lazy(() =>
  import("@/features/admin/pages/AttendeesByDomainPage").then((m) => ({
    default: m.AttendeesByDomainPage,
  })),
);

// Stub pages (future phases)
const CoursesPage = lazy(() =>
  import("@/features/courses/pages/CoursesPage").then((m) => ({
    default: m.CoursesPage,
  })),
);
const CourseDetailsLayout = lazy(() =>
  import("@/features/courses/components/CourseDetails").then((m) => ({
    default: m.CourseDetails,
  })),
);
const CourseDashboard = lazy(() =>
  import("@/features/courses/components/CourseDashboard").then((m) => ({
    default: m.CourseDashboard,
  })),
);
const CourseSessions = lazy(() =>
  import("@/features/courses/components/CourseSessions").then((m) => ({
    default: m.CourseSessions,
  })),
);
const CourseAttendeesWrapper = lazy(() =>
  import("@/features/courses/components/CourseAttendeesWrapper").then((m) => ({
    default: m.CourseAttendeesWrapper,
  })),
);
const CourseMessages = lazy(() =>
  import("@/features/courses/components/CourseMessages").then((m) => ({
    default: m.CourseMessages,
  })),
);
const SessionStudents = lazy(() =>
  import("@/features/courses/components/SessionStudents").then((m) => ({
    default: m.SessionStudents,
  })),
);
const StudentSessions = lazy(() =>
  import("@/features/courses/components/StudentSessions").then((m) => ({
    default: m.StudentSessions,
  })),
);
const CourseDefaultRedirector = lazy(() =>
  import("@/features/courses/components/CourseDefaultRedirector").then((m) => ({
    default: m.CourseDefaultRedirector,
  })),
);
const SessionPage = lazy(() =>
  import("@/features/sessions/components/SessionProvider").then((m) => ({
    default: m.SessionProvider,
  })),
);
const MinimizedSessionPage = lazy(() =>
  import("@/features/sessions/components/MinimizedSession").then((m) => ({
    default: m.MinimizedSession,
  })),
);
const AutoModePage = lazy(() =>
  import("@/features/auto/pages/AutoModePage").then((m) => ({
    default: m.AutoModePage,
  })),
);
const CheckinPage = lazy(() =>
  import("@/features/checkin/pages/CheckinPage").then((m) => ({
    default: m.CheckinPage,
  })),
);
const QuizPage = lazy(() =>
  import("@/features/checkin/pages/QuizPage").then((m) => ({
    default: m.QuizPage,
  })),
);
const BlogPage = lazy(() =>
  import("@/features/blog/pages/BlogPage").then((m) => ({
    default: m.BlogPage,
  })),
);
const VersionPage = lazy(() =>
  import("@/features/home/pages/VersionPage").then((m) => ({
    default: m.VersionPage,
  })),
);
const AttendeeSignUpPage = lazy(() =>
  import("@/features/checkin/components/AttendeeSignUp").then((m) => ({
    default: m.AttendeeSignUp,
  })),
);
const AttendeeHomePage = lazy(() =>
  import("@/features/checkin/components/AttendeeHome").then((m) => ({
    default: m.AttendeeHome,
  })),
);
const AttendeeTermsPage = lazy(() =>
  import("@/features/checkin/pages/AttendeeLegalPages").then((m) => ({
    default: m.AttendeeTermsPage,
  })),
);
const AttendeePrivacyPage = lazy(() =>
  import("@/features/checkin/pages/AttendeeLegalPages").then((m) => ({
    default: m.AttendeePrivacyPage,
  })),
);
const AttendeeHelp = lazy(() =>
  import("@/features/checkin/components/AttendeeHelp").then((m) => ({
    default: m.AttendeeHelp,
  })),
);
const AttendeeDownload = lazy(() =>
  import("@/features/checkin/components/AttendeeDownload").then((m) => ({
    default: m.AttendeeDownload,
  })),
);

// ---------------------------------------------------------------------------
// Suspense wrapper for lazy pages
// ---------------------------------------------------------------------------

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<SplashScreen />}>{children}</Suspense>;
}

/** Lightweight fallback for inner navigation (tab switches, drill-downs).
 *  Shows nothing to avoid the jarring full-screen splash on sub-route transitions. */
function LazyInner({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div />}>{children}</Suspense>;
}

// ---------------------------------------------------------------------------
// Route Tree
// ---------------------------------------------------------------------------

const rootRoute = createRootRoute({
  component: AppLayout,
});

// -- Public routes --

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <LazyPage>
      <HomePage />
    </LazyPage>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/home",
  component: () => (
    <LazyPage>
      <HomePage />
    </LazyPage>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => (
    <LazyPage>
      <HomePage />
    </LazyPage>
  ),
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: () => (
    <LazyPage>
      <HomePage />
    </LazyPage>
  ),
});

const forgotRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forgot",
  component: () => (
    <LazyPage>
      <HomePage />
    </LazyPage>
  ),
});

const verifyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/verify/$email/$code",
  component: () => (
    <LazyPage>
      <HomePage />
    </LazyPage>
  ),
});

const verifyPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/verify-password/$email/$code",
  component: () => (
    <LazyPage>
      <HomePage />
    </LazyPage>
  ),
});

const referralRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/referral/$code",
  component: () => (
    <LazyPage>
      <HomePage />
    </LazyPage>
  ),
});

const pricingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pricing",
  component: () => (
    <LazyPage>
      <PricingPage />
    </LazyPage>
  ),
});

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms",
  component: () => (
    <LazyPage>
      <TermsPage />
    </LazyPage>
  ),
});

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy",
  component: () => (
    <LazyPage>
      <PrivacyPage />
    </LazyPage>
  ),
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: () => (
    <LazyPage>
      <AboutPage />
    </LazyPage>
  ),
});

const accessibilityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/accessibility",
  component: () => (
    <LazyPage>
      <AccessibilityPage />
    </LazyPage>
  ),
});

const versionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/WhatVersion",
  component: () => (
    <LazyPage>
      <VersionPage />
    </LazyPage>
  ),
});

const blogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blog",
  component: () => (
    <LazyPage>
      <BlogPage />
    </LazyPage>
  ),
});

const blogPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blog/$id",
  component: () => (
    <LazyPage>
      <BlogPage />
    </LazyPage>
  ),
});

// -- Auth-required routes (host) --

const coursesFirstRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/courses/first",
  beforeLoad: () => {
    throw redirect({ to: "/courses" });
  },
});

const coursesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/courses",
  component: () => (
    <ProtectedRoute>
      <LazyPage>
        <CoursesPage />
      </LazyPage>
    </ProtectedRoute>
  ),
});

const courseIndexRoute = createRoute({
  getParentRoute: () => coursesRoute,
  path: "/",
  component: function CourseIndex() {
    const loading = useCourseStore((s) => s.loading);
    const courses = useCourseStore((s) => s.courses);
    // While courses are loading or auto-select hasn't fired yet, render nothing
    // to prevent a "Select a course" flash before auto-navigation kicks in
    if (loading || (courses && courses.length > 0)) {
      return null;
    }
    return (
      <div className="flex flex-1 items-center justify-center text-gray-400">
        <p className="text-sm">Select a course from the list</p>
      </div>
    );
  },
});

const courseIdRoute = createRoute({
  getParentRoute: () => coursesRoute,
  path: "$courseId",
  component: () => (
    <LazyPage>
      <CourseDetailsLayout />
    </LazyPage>
  ),
});

const courseIdIndexRoute = createRoute({
  getParentRoute: () => courseIdRoute,
  path: "/",
  component: () => (
    <LazyInner>
      <CourseDefaultRedirector />
    </LazyInner>
  ),
});

const courseDashboardRoute = createRoute({
  getParentRoute: () => courseIdRoute,
  path: "dashboard",
  component: () => (
    <LazyInner>
      <CourseDashboard />
    </LazyInner>
  ),
});

const courseSessionsRoute = createRoute({
  getParentRoute: () => courseIdRoute,
  path: "sessions",
  component: () => (
    <LazyInner>
      <CourseSessions />
    </LazyInner>
  ),
});

const courseAttendeesRoute = createRoute({
  getParentRoute: () => courseIdRoute,
  path: "attendees",
  component: () => (
    <LazyInner>
      <CourseAttendeesWrapper />
    </LazyInner>
  ),
});

const courseMessagesRoute = createRoute({
  getParentRoute: () => courseIdRoute,
  path: "messages",
  component: () => (
    <LazyInner>
      <CourseMessages />
    </LazyInner>
  ),
});

const sessionStudentsRoute = createRoute({
  getParentRoute: () => courseIdRoute,
  path: "session/$sessionId",
  component: () => (
    <LazyInner>
      <SessionStudents />
    </LazyInner>
  ),
});

const studentSessionsRoute = createRoute({
  getParentRoute: () => courseIdRoute,
  path: "student/$studentId",
  component: () => (
    <LazyInner>
      <StudentSessions />
    </LazyInner>
  ),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => (
    <ProtectedRoute>
      <LazyPage>
        <AdminLayoutPage />
      </LazyPage>
    </ProtectedRoute>
  ),
});

const adminIndexRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/",
  validateSearch: (search: Record<string, unknown>): { view?: string } => {
    return {
      view: typeof search.view === "string" ? search.view : undefined,
    };
  },
  component: () => (
    <LazyInner>
      <AdminDashboardView />
    </LazyInner>
  ),
});

const adminAttendeesNestedRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/attendees",
  component: () => (
    <LazyInner>
      <AdminAttendeesView />
    </LazyInner>
  ),
});

const adminHostsActivityRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "hosts-activity",
  component: () => (
    <LazyInner>
      <HostsActivityPage />
    </LazyInner>
  ),
});

const adminAttendeesByDomainRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "attendees-by-domain",
  component: () => (
    <LazyInner>
      <AttendeesByDomainPage />
    </LazyInner>
  ),
});

const adminReportsNestedRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "reports",
  component: () => (
    <LazyInner>
      <AdminReportsView />
    </LazyInner>
  ),
});

const adminUsageNestedRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "usage",
  component: () => (
    <LazyInner>
      <AdminUsageView />
    </LazyInner>
  ),
});

const sessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/session/$shortid",
  component: () => (
    <ProtectedRoute>
      <LazyPage>
        <SessionPage />
      </LazyPage>
    </ProtectedRoute>
  ),
});

const minimizedSessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/m_session",
  component: () => (
    <LazyPage>
      <MinimizedSessionPage />
    </LazyPage>
  ),
});

const autoModeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auto",
  component: () => (
    <ProtectedRoute>
      <LazyPage>
        <AutoModePage />
      </LazyPage>
    </ProtectedRoute>
  ),
});

const attendeeSignupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/attendee-signup",
  component: () => (
    <LazyPage>
      <AttendeeSignUpPage />
    </LazyPage>
  ),
});

const attendeeSignupWithShortIdRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/attendee-signup/$shortid",
  component: () => (
    <LazyPage>
      <AttendeeSignUpPage />
    </LazyPage>
  ),
});

const attendeeHomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/attendee",
  component: () => (
    <LazyPage>
      <AttendeeHomePage />
    </LazyPage>
  ),
});

const attendeeTermsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/attendee/terms",
  component: () => (
    <LazyPage>
      <AttendeeTermsPage />
    </LazyPage>
  ),
});

const attendeePrivacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/attendee/privacy",
  component: () => (
    <LazyPage>
      <AttendeePrivacyPage />
    </LazyPage>
  ),
});

const attendeeDownloadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/download",
  component: () => (
    <LazyPage>
      <AttendeeDownload />
    </LazyPage>
  ),
});

const attendeeHelpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/w/help",
  component: () => (
    <LazyPage>
      <AttendeeHelp />
    </LazyPage>
  ),
});

// -- Attendee routes --

const checkinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkin",
  component: () => (
    <LazyPage>
      <CheckinPage />
    </LazyPage>
  ),
});

const checkinWithParamsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkin/$shortid/$code/$icon",
  component: () => (
    <LazyPage>
      <CheckinPage />
    </LazyPage>
  ),
});

const quizRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/quiz/$shortid",
  component: () => (
    <LazyPage>
      <QuizPage />
    </LazyPage>
  ),
});

const sessionLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sessionlogin",
  component: () => (
    <LazyPage>
      <AttendeeSignUpPage />
    </LazyPage>
  ),
});

const sessionLoginShortIdRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sessionlogin/$shortid",
  component: () => (
    <LazyPage>
      <AttendeeSignUpPage />
    </LazyPage>
  ),
});

const getSessionIdRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/getsessionid",
  component: () => (
    <LazyPage>
      <CheckinPage />
    </LazyPage>
  ),
});

// -- /w/ prefix routes (used by old app for web browser redirects) --

const wSessionLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/w/sessionlogin",
  component: () => (
    <LazyPage>
      <AttendeeSignUpPage />
    </LazyPage>
  ),
});

const wSessionLoginShortIdRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/w/sessionlogin/$shortid",
  component: () => (
    <LazyPage>
      <AttendeeSignUpPage />
    </LazyPage>
  ),
});

const wGetSessionIdRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/w/getsessionid",
  component: () => (
    <LazyPage>
      <CheckinPage />
    </LazyPage>
  ),
});

const wCheckinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/w/checkin",
  component: () => (
    <LazyPage>
      <CheckinPage />
    </LazyPage>
  ),
});

const wQuizRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/w/quiz/$shortid",
  component: () => (
    <LazyPage>
      <QuizPage />
    </LazyPage>
  ),
});

const wDownloadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/w/download",
  component: () => (
    <LazyPage>
      <AttendeeDownload />
    </LazyPage>
  ),
});

// ---------------------------------------------------------------------------
// Route tree assembly
// ---------------------------------------------------------------------------

const routeTree = rootRoute.addChildren([
  indexRoute,
  homeRoute,
  loginRoute,
  signupRoute,
  forgotRoute,
  verifyRoute,
  verifyPasswordRoute,
  referralRoute,
  pricingRoute,
  termsRoute,
  privacyRoute,
  aboutRoute,
  attendeeSignupRoute,
  attendeeSignupWithShortIdRoute,
  attendeeHomeRoute,
  attendeeTermsRoute,
  attendeePrivacyRoute,
  attendeeDownloadRoute,
  attendeeHelpRoute,
  accessibilityRoute,
  versionRoute,
  blogRoute,
  blogPostRoute,
  coursesRoute.addChildren([
    courseIndexRoute,
    courseIdRoute.addChildren([
      courseIdIndexRoute,
      courseDashboardRoute,
      courseSessionsRoute,
      courseAttendeesRoute,
      courseMessagesRoute,
      sessionStudentsRoute,
      studentSessionsRoute,
    ]),
  ]),
  coursesFirstRoute,
  adminRoute.addChildren([
    adminIndexRoute,
    adminAttendeesNestedRoute,
    adminHostsActivityRoute,
    adminAttendeesByDomainRoute,
    adminReportsNestedRoute,
    adminUsageNestedRoute,
  ]),
  sessionRoute,
  minimizedSessionRoute,
  autoModeRoute,
  checkinRoute,
  checkinWithParamsRoute,
  quizRoute,
  sessionLoginRoute,
  sessionLoginShortIdRoute,
  getSessionIdRoute,
  wSessionLoginRoute,
  wSessionLoginShortIdRoute,
  wGetSessionIdRoute,
  wCheckinRoute,
  wQuizRoute,
  wDownloadRoute,
]);

// ---------------------------------------------------------------------------
// Router instance
// ---------------------------------------------------------------------------

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

// Type-safe route registration
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
