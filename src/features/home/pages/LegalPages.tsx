/**
 * Shared legal page wrapper — light theme.
 * Used for Privacy, Terms of Service, About pages.
 */

import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface LegalPageProps {
  title: string;
  children: React.ReactNode;
}

export function LegalPage({ title, children }: LegalPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <title>{title} — ezCheckMe</title>
      <Link
        to="/home"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-link transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>
      <h1 className="mb-8 text-3xl font-bold" style={{ color: "#20486a" }}>
        {title}
      </h1>
      <div className="prose max-w-none text-gray-600 leading-relaxed space-y-4 text-sm">
        {children}
      </div>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        ezCheckMe is committed to protecting your privacy. This privacy policy
        describes how we collect, use, and share your personal information when
        you use our attendance tracking platform.
      </p>
      <h2 className="text-lg font-semibold mt-6" style={{ color: "#20486a" }}>
        Information We Collect
      </h2>
      <p>
        We collect information you provide directly, including your name, email
        address, institution, and attendance records. We also collect usage data
        and device information to improve our services.
      </p>
      <h2 className="text-lg font-semibold mt-6" style={{ color: "#20486a" }}>
        How We Use Your Information
      </h2>
      <p>
        We use your information to provide attendance tracking services, send
        notifications, generate analytics reports, and improve our platform.
      </p>
      <h2 className="text-lg font-semibold mt-6" style={{ color: "#20486a" }}>
        Contact Us
      </h2>
      <p>
        If you have questions about this privacy policy, please contact us at
        support@ezcheck.me.
      </p>
    </LegalPage>
  );
}

export function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>
        By using ezCheckMe, you agree to these terms of service. Please read
        them carefully.
      </p>
      <h2 className="text-lg font-semibold mt-6" style={{ color: "#20486a" }}>
        Use of Service
      </h2>
      <p>
        ezCheckMe provides attendance tracking tools for educational
        institutions, training centers, and event organizers. You are
        responsible for maintaining the security of your account.
      </p>
      <h2 className="text-lg font-semibold mt-6" style={{ color: "#20486a" }}>
        Data Ownership
      </h2>
      <p>
        You retain ownership of all attendance data you create using our
        platform. We will not share your data with third parties without your
        consent.
      </p>
      <h2 className="text-lg font-semibold mt-6" style={{ color: "#20486a" }}>
        Contact
      </h2>
      <p>For questions about these terms, contact us at support@ezcheck.me.</p>
    </LegalPage>
  );
}

export function AboutPage() {
  return (
    <LegalPage title="About ezCheckMe">
      <p>
        ezCheckMe is a smart attendance tracking platform used by thousands of
        educators and trainers across 25+ countries. Our mission is to make
        attendance tracking effortless, accurate, and insightful.
      </p>
      <h2 className="text-lg font-semibold mt-6" style={{ color: "#20486a" }}>
        Our Story
      </h2>
      <p>
        Founded to solve the universal problem of attendance tracking, ezCheckMe
        combines QR codes, geolocation verification, and real-time analytics
        into a single, easy-to-use platform.
      </p>
    </LegalPage>
  );
}

export function AccessibilityPage() {
  return (
    <LegalPage title="Accessibility Statement - EZCheck.me">
      <p>
        EZCheck.me is committed to ensuring digital accessibility for people
        with disabilities. We are continually improving the user experience for
        everyone, and applying the relevant accessibility standards.
      </p>
      <p>
        Efforts to support accessibility EZCheck.me takes the following measures
        to ensure accessibility:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          Accessibility is part of our mission statement. An accessibility
          officer or official has been appointed.
        </li>
        <li>
          We include people with disabilities in our user testing processes.
        </li>
      </ul>
    </LegalPage>
  );
}
