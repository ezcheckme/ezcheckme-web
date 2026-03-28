/* eslint-disable react-refresh/only-export-components */
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

function withLazyPage(Component: React.ComponentType<Record<string, unknown>>) {
  function WithLazyPage(props: Record<string, unknown>) {
    return (
      <Suspense fallback={<SplashScreen />}>
        <Component {...props} />
      </Suspense>
    );
  }
  WithLazyPage.displayName = `withLazyPage(${Component.displayName || Component.name || "Component"})`;
  return WithLazyPage;
}

function withLazyInner(Component: React.ComponentType<Record<string, unknown>>) {
  function WithLazyInner(props: Record<string, unknown>) {
    return (
      <Suspense fallback={<div />}>
        <Component {...props} />
      </Suspense>
    );
  }
  WithLazyInner.displayName = `withLazyInner(${Component.displayName || Component.name || "Component"})`;
  return WithLazyInner;
}

function withProtected(Component: React.ComponentType<Record<string, unknown>>) {
  function WithProtected(props: Record<string, unknown>) {
    return (
      <ProtectedRoute>
        <Suspense fallback={<SplashScreen />}>
          <Component {...props} />
        </Suspense>
      </ProtectedRoute>
    );
  }
  WithProtected.displayName = `withProtected(${Component.displayName || Component.name || "Component"})`;
  return WithProtected;
}

export function withProtectedInner(Component: React.ComponentType<Record<string, unknown>>) {
  function WithProtectedInner(props: Record<string, unknown>) {
    return (
      <ProtectedRoute>
        <Suspense fallback={<div />}>
          <Component {...props} />
        </Suspense>
      </ProtectedRoute>
    );
  }
  WithProtectedInner.displayName = `withProtectedInner(${Component.displayName || Component.name || "Component"})`;
  return WithProtectedInner;
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
  component: withLazyPage(HomePage),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/home",
  component: withLazyPage(HomePage),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: withLazyPage(HomePage),
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: withLazyPage(HomePage),
});

const forgotRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forgot",
  component: withLazyPage(HomePage),
});

const verifyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/verify/$email/$code",
  component: withLazyPage(HomePage),
});

const verifyPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/verify-password/$email/$code",
  component: withLazyPage(HomePage),
});

const referralRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/referral/$code",
  component: withLazyPage(HomePage),
});

const pricingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pricing",
  component: withLazyPage(PricingPage),
});

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms",
  component: withLazyPage(TermsPage),
});

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy",
  component: withLazyPage(PrivacyPage),
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: withLazyPage(AboutPage),
});

const accessibilityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/accessibility",
  component: withLazyPage(AccessibilityPage),
});

const versionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/WhatVersion",
  component: withLazyPage(VersionPage),
});

const blogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blog",
  component: withLazyPage(BlogPage),
});

const blogPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blog/$id",
  component: withLazyPage(BlogPage),
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
  component: withProtected(CoursesPage),
});

function CourseIndex() {
  return (
    <div className="flex flex-1 items-center justify-center text-gray-400">
      <p className="text-sm">Select a course from the list</p>
    </div>
  );
}

const courseIndexRoute = createRoute({
  getParentRoute: () => coursesRoute,
  path: "/",
  loader: async () => {
    const store = useCourseStore.getState();
    if (!store.courses) {
      await store.getCourses();
    }
    const courses = useCourseStore.getState().courses;
    if (!courses || courses.length === 0) return;

    let targetId = courses[0].id;
    try {
      // Opt-in to the latest course logic
      const { getLatestCourse } = await import("@/shared/services/course.service");
      const res = await getLatestCourse();
      const courseId = res?.result?.courseid;
      if (courseId && courses.some(c => c.id === courseId)) {
        targetId = courseId;
      }
    } catch {
      // Ignore failed attempts to get the latest course and fallback to default
    }

    const course = courses.find((c) => c.id === targetId);
    const defaultTab = course?.fieldCheckin ? "attendees" : "sessions";
    // Using a type assertion to any for the dynamic redirect path as it's not strongly typed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throw redirect({ to: `/courses/${targetId}/${defaultTab}` as any, replace: true });
  },
  component: CourseIndex,
});

const courseIdRoute = createRoute({
  getParentRoute: () => coursesRoute,
  path: "$courseId",
  component: withLazyPage(CourseDetailsLayout),
});

const courseIdIndexRoute = createRoute({
  getParentRoute: () => courseIdRoute,
  path: "/",
  component: withLazyInner(CourseDefaultRedirector),
});

const courseDashboardRoute = createRoute({
  getParentRoute: () => courseIdRoute,
  path: "dashboard",
  component: withLazyInner(CourseDashboard),
});

const courseSessionsRoute = createRoute({
  getParentRoute: () => courseIdRoute,
  path: "sessions",
  component: withLazyInner(CourseSessions),
});

const courseAttendeesRoute = createRoute({
  getParentRoute: () => courseIdRoute,
  path: "attendees",
  component: withLazyInner(CourseAttendeesWrapper),
});

const courseMessagesRoute = createRoute({
  getParentRoute: () => courseIdRoute,
  path: "messages",
  component: withLazyInner(CourseMessages),
});

const sessionStudentsRoute = createRoute({
  getParentRoute: () => courseIdRoute,
  path: "session/$sessionId",
  component: withLazyInner(SessionStudents),
});

const studentSessionsRoute = createRoute({
  getParentRoute: () => courseIdRoute,
  path: "student/$studentId",
  component: withLazyInner(StudentSessions),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: withProtected(AdminLayoutPage),
});

const adminIndexRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/",
  validateSearch: (search: Record<string, unknown>): { view?: string } => {
    return {
      view: typeof search.view === "string" ? search.view : undefined,
    };
  },
  component: withLazyInner(AdminDashboardView),
});

const adminAttendeesNestedRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/attendees",
  component: withLazyInner(AdminAttendeesView),
});

const adminHostsActivityRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "hosts-activity",
  component: withLazyInner(HostsActivityPage),
});

const adminAttendeesByDomainRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "attendees-by-domain",
  component: withLazyInner(AttendeesByDomainPage),
});

const adminReportsNestedRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "reports",
  component: withLazyInner(AdminReportsView),
});

const adminUsageNestedRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "usage",
  component: withLazyInner(AdminUsageView),
});

const sessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/session/$shortid",
  component: withProtected(SessionPage),
});

const minimizedSessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/m_session",
  component: withLazyPage(MinimizedSessionPage),
});

const autoModeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auto",
  component: withProtected(AutoModePage),
});

const attendeeSignupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/attendee-signup",
  component: withLazyPage(AttendeeSignUpPage),
});

const attendeeSignupWithShortIdRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/attendee-signup/$shortid",
  component: withLazyPage(AttendeeSignUpPage),
});

const attendeeHomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/attendee",
  component: withLazyPage(AttendeeHomePage),
});

const attendeeTermsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/attendee/terms",
  component: withLazyPage(AttendeeTermsPage),
});

const attendeePrivacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/attendee/privacy",
  component: withLazyPage(AttendeePrivacyPage),
});

const attendeeDownloadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/download",
  component: withLazyPage(AttendeeDownload),
});

const attendeeHelpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/w/help",
  component: withLazyPage(AttendeeHelp),
});

// -- Attendee routes --

const checkinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkin",
  component: withLazyPage(CheckinPage),
});

const checkinWithParamsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkin/$shortid/$code/$icon",
  component: withLazyPage(CheckinPage),
});

const quizRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/quiz/$shortid",
  component: withLazyPage(QuizPage),
});

const sessionLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sessionlogin",
  component: withLazyPage(AttendeeSignUpPage),
});

const sessionLoginShortIdRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sessionlogin/$shortid",
  component: withLazyPage(AttendeeSignUpPage),
});

const getSessionIdRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/getsessionid",
  component: withLazyPage(CheckinPage),
});

// -- /w/ prefix routes (used by old app for web browser redirects) --

const wSessionLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/w/sessionlogin",
  component: withLazyPage(AttendeeSignUpPage),
});

const wSessionLoginShortIdRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/w/sessionlogin/$shortid",
  component: withLazyPage(AttendeeSignUpPage),
});

const wGetSessionIdRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/w/getsessionid",
  component: withLazyPage(CheckinPage),
});

const wCheckinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/w/checkin",
  component: withLazyPage(CheckinPage),
});

const wQuizRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/w/quiz/$shortid",
  component: withLazyPage(QuizPage),
});

const wDownloadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/w/download",
  component: withLazyPage(AttendeeDownload),
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
