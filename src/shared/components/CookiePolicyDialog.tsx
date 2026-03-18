/**
 * CookiePolicyDialog
 * Mirrors legacy Cookies.js — full GDPR-compliant cookie policy dialog.
 * Opened when user clicks "Details" on the CookieBanner.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CookiePolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CookiePolicyDialog({
  open,
  onOpenChange,
}: CookiePolicyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Cookie Policy</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="prose prose-sm prose-gray max-w-none space-y-4 text-sm text-gray-700">
            <p>
              This cookie policy (&quot;Policy&quot;) describes what cookies are
              and how EZCheck.me (&quot;EZCheck.me&quot;, &quot;we&quot;,
              &quot;us&quot; or &quot;our&quot;) uses them on the ezcheck.me
              website and any of its products or services (collectively,
              &quot;Website&quot; or &quot;Services&quot;).
            </p>
            <p>
              You should read this Policy so you can understand what type of
              cookies we use, the information we collect using cookies and how
              that information is used. It also describes the choices available
              to you regarding accepting or declining the use of cookies. For
              further information on how we use, store and keep your personal
              data secure, see our Privacy Policy.
            </p>

            <h3 className="text-sm font-bold uppercase mt-4">
              What are cookies?
            </h3>
            <p>
              Cookies are small pieces of data stored in text files that are
              saved on your computer or other devices when websites are loaded
              in a browser. They are widely used to remember you and your
              preferences, either for a single visit (through a &quot;session
              cookie&quot;) or for multiple repeat visits (using a
              &quot;persistent cookie&quot;).
            </p>

            <h3 className="text-sm font-bold uppercase mt-4">
              What type of cookies do we use?
            </h3>
            <p>
              <strong>Necessary cookies</strong> — allow us to offer you the
              best possible experience when accessing and navigating through our
              Website and using its features.
            </p>
            <p>
              <strong>Functionality cookies</strong> — let us operate the
              Website and our Services in accordance with the choices you make.
            </p>
            <p>
              <strong>Analytical cookies</strong> — enable us and third-party
              services to collect aggregated data for statistical purposes on
              how our visitors use the Website.
            </p>
            <p>
              <strong>Social media cookies</strong> — let us track social
              network users when they visit our Website, use our Services or
              share content, by using a tagging mechanism provided by those
              social networks.
            </p>

            <h3 className="text-sm font-bold uppercase mt-4">
              Collection of non-personal information
            </h3>
            <p>
              When you visit the Website our servers automatically record
              information that your browser sends. This data may include your
              device&apos;s IP address, browser type and version, operating
              system type and version, language preferences, pages visited, time
              spent, and other statistics.
            </p>

            <h3 className="text-sm font-bold uppercase mt-4">
              The rights of users
            </h3>
            <p>
              You may exercise certain rights regarding your information
              processed by us, including the right to withdraw consent, object
              to processing, obtain disclosure, verify accuracy, restrict
              processing, obtain erasure, and receive your information in a
              structured format.
            </p>

            <h3 className="text-sm font-bold uppercase mt-4">
              Privacy of children
            </h3>
            <p>
              We do not knowingly collect any Personal Information from children
              under the age of 13. You must be at least 16 years of age to
              consent to the processing of your personal data.
            </p>

            <h3 className="text-sm font-bold uppercase mt-4">
              Information security
            </h3>
            <p>
              We secure information you provide on computer servers in a
              controlled, secure environment, protected from unauthorized
              access, use, or disclosure.
            </p>

            <h3 className="text-sm font-bold uppercase mt-4">
              Changes and amendments
            </h3>
            <p>
              We reserve the right to modify this Policy at any time, effective
              upon posting of an updated version on the Website.
            </p>

            <h3 className="text-sm font-bold uppercase mt-4">Contacting us</h3>
            <p>
              If you have any questions about this Policy, please contact us at{" "}
              <a
                href="mailto:info@ezcheck.me"
                className="text-link hover:underline"
              >
                info@ezcheck.me
              </a>
              .
            </p>
            <p className="text-xs text-gray-400">
              This document was last updated on August 5, 2019
            </p>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
