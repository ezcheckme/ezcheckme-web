/**
 * Attendee-facing legal pages — /attendee/terms and /attendee/privacy
 * Mirrors legacy TocAttendee.js and PrivacyAttendee.js.
 * These pages hide the cookies banner and Tawk.to widget (attendee context).
 */

import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { hideTawkWidget } from "@/shared/services/tawkto.service";
import { hideCookiesConcentWindow } from "@/shared/services/cookies.service";

function AttendeeLegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.title = title;
    hideCookiesConcentWindow();
    hideTawkWidget();
  }, [title]);

  return (
    <div className="min-h-screen bg-[#dae1e7] max-[800px]:bg-white">
      <div className="mx-auto my-10 max-w-3xl rounded bg-white p-6 shadow">
        <Link
          to="/home"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-link transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="prose max-w-none text-gray-700 leading-relaxed [&_h6]:mt-4 [&_h6]:mb-3 [&_h6]:uppercase [&_h6]:font-bold [&_p]:my-2.5">
          {children}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Attendee Terms of Service
// ---------------------------------------------------------------------------

export function AttendeeTermsPage() {
  return (
    <AttendeeLegalPage title="EZCheck.me - Terms of Service">
      <p>
        <strong>
          <u>EZCheck.me &ndash; Terms and Conditions (Attendees)</u>
        </strong>
      </p>
      <p>Last updated: September 25, 2022</p>
      <p>
        <strong>
          <u>About EZCheck.me 2019, Ltd.</u>
        </strong>
      </p>
      <p>
        EZCheck.me 2019, Ltd. is the proprietary owner of a certain unique and
        proprietary platform known as &quot;EZCheck.me&quot; (the &quot;
        <strong>Platform</strong>&quot; and collectively the: &quot;
        <strong>Service</strong>&quot;) which is utilized as a student
        attendance tracking platform, which operates through a mobile/web
        application for end users and attendance management platform for
        universities and professors.
      </p>
      <p>
        PLEASE READ THE TERMS OF USE CAREFULLY BEFORE YOU START TO USE THE
        PLATFORM. BY USING THE PLATFORM, YOU REPRESENT YOU ARE AT LEAST 13 YEARS
        OF AGE AND OWN THE RIGHT TO ATTEND A SESSION AND REPORT YOUR ATTENDANCE
        THROUGH THE PLATFORM. FURTHER, YOU ACCEPT AND AGREE TO BE BOUND AND
        ABIDE BY THESE TERMS OF USE. IF YOU ARE NOT 13 YEARS OLD OR DO NOT WANT
        TO AGREE TO THESE TERMS OF USE, YOU MUST NOT ACCESS OR USE THE PLATFORM.
      </p>
      <ol className="list-decimal pl-6 space-y-4">
        <li>
          <strong>
            <u>Introduction</u>
          </strong>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>
              The introduction to this agreement is an integral part of it.
            </li>
            <li>
              Titles are for convenience only and shall not be used for
              interpretation.
            </li>
            <li>
              For the avoidance of all doubts, it is hereby clarified that this
              English version of Terms and Conditions shall apply, and versions
              in other languages may be set only for convenience; in any case,
              if any differences occurred between versions &ndash; the English
              version shall always overcome.
            </li>
            <li>
              Definitions:
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>
                  &quot;<strong>Company</strong>&quot; &ndash; EZCheck.me 2019
                  Ltd. <a href="mailto:info@ezcheck.me">info@ezcheck.me</a>.
                </li>
                <li>
                  &quot;<strong>Agreement</strong>&quot; &ndash; this Terms and
                  Conditions document.
                </li>
                <li>
                  &quot;<strong>Platform</strong>&quot; &ndash; An online
                  platform, operated by the Company, as a website and a mobile
                  application, which is utilized as a student attendance
                  tracking platform.
                </li>
                <li>
                  &quot;<strong>Attendee</strong>&quot; &ndash; anyone who uses
                  the Platform by accessing a session link using the Platform.
                </li>
                <li>
                  &quot;<strong>Host</strong>&quot;<strong> &ndash; </strong>
                  anyone who creates an online session (using a personal
                  computer), to monitor Attendees&apos; attendance in any type
                  of meeting.
                </li>
              </ul>
            </li>
            <li>
              The Terms and Conditions set herein shall apply both for the
              mobile application and the website.
            </li>
            <li>
              It is hereby clarified that the Terms and Conditions set herein
              shall act in addition and in parallel to any other terms and
              conditions set by any other third party, as may be the case.
            </li>
          </ul>
        </li>
        <li>
          <strong>
            <u>Acceptance Of Terms</u>
          </strong>
          <p className="mt-2">
            This Terms and Conditions (this &quot;<strong>Terms</strong>&quot;)
            govern all use by you as a user of the Platform (all, the &quot;
            <strong>Services</strong>&quot;). The Services are owned and
            operated by the Company.
          </p>
          <p>
            These Terms refer to Attendees who use the Platform to check-in
            their attendance in a session posted by a Host.
          </p>
          <p>
            BY USING OR ACCESSING ANY PART OF THE PLATFORM, YOU AGREE TO ALL OF
            THE TERMS AND CONDITIONS CONTAINED HEREIN. IF YOU DO NOT AGREE TO
            ANY OF SUCH TERMS, DO NOT USE, REGISTER OR ACCESS THE SERVICES.
          </p>
          <p>
            The Company reserves the right, at its sole discretion, to modify or
            replace any of the terms or conditions of these Terms at any time.
            Your continued use of the Services following the posting of any
            changes constitutes acceptance of those changes.
          </p>
        </li>
        <li>
          <strong>
            <u>Terms and Conditions</u>
          </strong>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>
              The Attendee hereby undertakes to avoid: using bots/crawlers, URL
              hacking, uploading illegal content, performing unauthorized IP
              actions, violent or offending behavior, and impersonation.
            </li>
            <li>
              The Company may stop services, remove content, or prevent access
              for violations at its sole discretion.
            </li>
          </ul>
        </li>
        <li>
          <strong>
            <u>User Account</u>
          </strong>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Access requires registration with valid personal details.</li>
            <li>
              You may not register with false details or on behalf of others
              without their approval.
            </li>
            <li>
              The Company may send verification text messages; keep codes
              confidential.
            </li>
            <li>
              The Platform may request device access (camera, location); refusal
              may limit functionality.
            </li>
          </ul>
        </li>
        <li>
          <strong>
            <u>Commercial Messages</u>
          </strong>
          <p className="mt-2">
            The Company may send commercial messages via text/email. You may opt
            out at any time.
          </p>
        </li>
        <li>
          <strong>
            <u>Third Party Links</u>
          </strong>
          <p className="mt-2">
            The Company is not responsible for third-party websites or resources
            linked from the Platform.
          </p>
        </li>
        <li>
          <strong>
            <u>Disputes Between Hosts and Attendees</u>
          </strong>
          <p className="mt-2">
            Company shall not be liable for any dispute regarding attendance
            outputs of the Platform.
          </p>
        </li>
        <li>
          <strong>
            <u>Attendee Undertaking</u>
          </strong>
          <p className="mt-2">
            <strong>By registering and checking-in, you represent that:</strong>{" "}
            your check-in is authentic, all information is correct, you allow
            data sharing with the Host per the Privacy Policy, and you
            acknowledge the Platform is not responsible for session management.
          </p>
        </li>
        <li>
          <strong>
            <u>Disclaimer Of Warranties</u>
          </strong>
          <p className="mt-2">
            THE SERVICES ARE PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS
            AVAILABLE&quot; BASIS. THE COMPANY DISCLAIMS ALL WARRANTIES OF ANY
            KIND.
          </p>
        </li>
        <li>
          <strong>
            <u>Limitation of Liability</u>
          </strong>
          <p className="mt-2">
            The Platform is provided as-is. The Company shall not be liable for
            damages from use. Users are responsible for their internet
            connection.
          </p>
        </li>
        <li>
          <strong>
            <u>Release</u>
          </strong>
          <p className="mt-2">
            You agree to release the Company from all damages arising from
            disputes with third parties in connection with the Services.
          </p>
        </li>
        <li>
          <strong>
            <u>Privacy</u>
          </strong>
          <p className="mt-2">
            All personal information is governed by the Company&apos;s Privacy
            Policy.
          </p>
        </li>
        <li>
          <strong>
            <u>Trademark Information</u>
          </strong>
          <p className="mt-2">
            Company trademarks may not be used without prior written consent.
          </p>
        </li>
        <li>
          <strong>
            <u>Infringement Notice</u>
          </strong>
          <p className="mt-2">Report violations to info@ezcheck.me.</p>
        </li>
        <li>
          <strong>
            <u>Intellectual Property</u>
          </strong>
          <p className="mt-2">
            The Company owns all IP rights in the Platform. By uploading
            content, you grant an irrevocable, royalty-free license.
          </p>
        </li>
        <li>
          <strong>
            <u>Changes</u>
          </strong>
          <p className="mt-2">
            The Company may change these Terms at any time without notice.
          </p>
        </li>
        <li>
          <strong>
            <u>Indemnification</u>
          </strong>
          <p className="mt-2">
            You agree to defend and indemnify the Company from claims arising
            from your use of the Platform.
          </p>
        </li>
        <li>
          <strong>
            <u>Choice of Law</u>
          </strong>
          <p className="mt-2">
            The laws of the State of Israel shall govern. Disputes shall be
            brought to the Tel-Aviv district court.
          </p>
        </li>
      </ol>
    </AttendeeLegalPage>
  );
}

// ---------------------------------------------------------------------------
// Attendee Privacy Policy
// ---------------------------------------------------------------------------

export function AttendeePrivacyPage() {
  return (
    <AttendeeLegalPage title="EZCheck.me - Privacy Policy">
      <p>
        <strong>
          <u>EZCheck.me - Privacy Policy (Attendees)</u>
        </strong>
      </p>
      <p>Last updated: October 15, 2020</p>
      <p>
        <strong>
          <u>About EZCheck.me 2019, Ltd.</u>
        </strong>
      </p>
      <p>
        EZCheck.me 2019, Ltd. is the proprietary owner of a certain unique and
        proprietary platform known as &quot;EZCheck.me&quot; (the &quot;
        <strong>Platform</strong>&quot; and collectively the: &quot;
        <strong>Service</strong>&quot;) which is utilized as a student
        attendance tracking platform, which operates through a mobile/web
        application for end users and attendance management platform for
        universities and professors.
      </p>
      <p>
        <strong>
          <u>Who are we?</u>
        </strong>
      </p>
      <p>
        EZCheck.me 2019, Ltd. is the developer and operator of the Platform.
      </p>
      <p>
        <strong>
          <u>What&apos;s this Privacy Policy about?</u>
        </strong>
      </p>
      <p>
        We have created this Privacy Policy because we highly evaluate your
        Personal Data and information. Please read it, as it includes important
        information in respect of your Personal Data and information.
      </p>
      <p>
        We make our best efforts to protect our users&rsquo; privacy, and to be
        compatible with privacy protection laws and regulations, including the
        EU&apos;s GDPR regulation.
      </p>
      <p>
        For any questions or concerns, please contact us via:{" "}
        <a href="mailto:info@ezcheck.me">info@ezcheck.me</a>
      </p>
      <p>
        <strong>
          <u>Consent</u>
        </strong>
        :
      </p>
      <p>
        <strong>
          By using the EZCheck.me Platform or allowing someone else to use it on
          your behalf, you give your consent to our collection, use, disclosure,
          transfer and storage of any Personal Data and information received by
          us as a result of such use, in accordance with this Privacy Policy.
        </strong>
      </p>
      <p>
        <strong>
          <u>Which Information do we collect?</u>
        </strong>
      </p>
      <ol className="list-decimal pl-6 space-y-2">
        <li>
          Personal Data:
          <ol className="list-decimal pl-6 mt-1 space-y-1">
            <li>Full name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Photo (and access to your phone camera &ndash; optional)</li>
            <li>
              Student ID provided to you by the institution hosting the session
            </li>
          </ol>
        </li>
        <li>
          Non-Personal Data:
          <ol className="list-decimal pl-6 mt-1 space-y-1">
            <li>Location (country, geographic location)</li>
            <li>How you use the Platform</li>
          </ol>
        </li>
      </ol>
      <p>
        <strong>
          <u>What use do we do of your Information?</u>
        </strong>
      </p>
      <p>
        Any Personal Data we collect is being used in a way that is consistent
        with this Privacy Policy for: access and use of the Platform,
        Company&apos;s business purposes, specific reasons you provided it for,
        and statistics.
      </p>
      <p>
        Since Non-Personal Data cannot identify you personally, we may use it as
        permitted by law.
      </p>
      <p>
        <strong>
          <u>Which Information do we share with Third Parties?</u>
        </strong>
      </p>
      <p>We will not sell your Personal Data. However, we may share it with:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          Session Hosts and your academic institution (phone number limited to
          last 4 digits)
        </li>
        <li>When required by law</li>
        <li>To prevent wrongdoing</li>
        <li>In business transactions (mergers, acquisitions)</li>
        <li>For aggregated statistical reports</li>
      </ul>
      <p>
        <strong>
          <u>Links to Other Web Sites</u>
        </strong>
      </p>
      <p>
        We are not responsible for the privacy policies of linked third-party
        websites.
      </p>
      <p>
        <strong>
          <u>Storage and Security</u>
        </strong>
      </p>
      <p>
        We take reasonable technical steps to keep your information secured.
        Report security concerns to{" "}
        <a href="mailto:info@ezcheck.me">info@ezcheck.me</a>.
      </p>
      <p>
        <strong>
          <u>Other Terms</u>
        </strong>
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          <u>Changes</u>: We may update this Privacy Policy at any time.
          Continued use constitutes acceptance.
        </li>
        <li>
          <u>Direct Messages</u>: We may send service information via SMS/email.
          You may opt out by emailing info@ezcheck.me.
        </li>
        <li>
          <u>Cookies</u>: We use cookies for Platform operation and statistics.
          You can control cookies in your browser settings.
        </li>
        <li>
          <u>Third Party Advertisements</u>: Third-party ads may appear and use
          their own cookies, governed by their own privacy policies.
        </li>
        <li>
          <u>Rights of Affected Person</u>: You may request removal, correction,
          or transfer of your Personal Data by emailing info@ezcheck.me.
        </li>
        <li>
          <u>Dispute Resolution</u>: Laws of the State of Israel shall govern.
          Disputes go to the Tel-Aviv district court.
        </li>
      </ul>
    </AttendeeLegalPage>
  );
}
