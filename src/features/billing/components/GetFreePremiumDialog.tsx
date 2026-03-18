/**
 * GetFreePremiumDialog (Referral Dialog)
 * Mirrors legacy GetFreePremiumDialog.js.
 * Shows referral URL with copy + social share buttons (Twitter, Facebook, WhatsApp, Email).
 * Opened via openReferralDialog() in auth store.
 */

import { useState } from "react";
import {
  Copy,
  Check,
  Twitter,
  Facebook,
  Mail,
  MessageCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth.store";

const HOST_URL = import.meta.env.VITE_HOST_URL || "https://ezcheck.me";

export function GetFreePremiumDialog() {
  const open = useAuthStore((s) => s.dialogs.referralOpen);
  const closeDialog = useAuthStore((s) => s.closeReferralDialog);
  const user = useAuthStore((s) => s.user);
  const [copied, setCopied] = useState(false);

  const url = `${HOST_URL}/referral/${user?.id || ""}`;

  const shareText =
    "EZCheck.me - QR based attendance tracking solution for hybrid learning. Sign up and get a FREE 1-month Premium account!";

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && closeDialog()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-bold text-link">
            Refer your Colleagues to EZCheck.me and get a free Premium account!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-center">
          <div className="text-sm text-gray-600 space-y-1">
            <p>Enjoying EZCheck.me?</p>
            <p>
              Refer your colleagues and receive 1 month of FREE premium account
              for each*
            </p>
            <p>
              Here is your referral link – just copy it and send it to your
              colleagues:
            </p>
          </div>

          {/* Referral URL + Copy button */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
            <span className="flex-1 text-sm font-mono text-gray-700 truncate">
              {url}
            </span>
            <Button size="sm" variant="outline" onClick={handleCopy}>
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          </div>

          {/* Social share buttons */}
          <div className="flex justify-center gap-3">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="icon" variant="outline" className="rounded-full">
                <Twitter className="w-5 h-5 text-[#1DA1F2]" />
              </Button>
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="icon" variant="outline" className="rounded-full">
                <Facebook className="w-5 h-5 text-[#4267B2]" />
              </Button>
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + url)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="icon" variant="outline" className="rounded-full">
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
              </Button>
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent("EZCheck.me - QR based attendance tracking")}&body=${encodeURIComponent(shareText + "\n" + url)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="icon" variant="outline" className="rounded-full">
                <Mail className="w-5 h-5 text-gray-600" />
              </Button>
            </a>
          </div>

          <p className="text-xs text-gray-400 pt-2">
            *A referred colleague is counted after signing up to EZCheck.me and
            running a session with at least 15 attendees
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
